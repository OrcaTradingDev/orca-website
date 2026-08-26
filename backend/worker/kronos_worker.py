"""
Kronos probability forecast worker.

On each scheduled run, fetches the last N candles from the DB for every symbol
on 4H and 1D timeframes, runs a single Kronos-mini inference (sample_count=20
draws N stochastic paths and returns their mean — the "median" forecast), then
builds uncertainty bands that widen with forecast horizon (σ·√t scaling, the
standard practice for random-walk variance growth).

Bands stored per (symbol, timeframe):
  p10, p25, p50, p75, p90 — all referring to the forecast CLOSE price at each
  future bar. p50 = Kronos mean forecast. p25/p75 at ±0.675σ·√t, p10/p90 at
  ±1.281σ·√t, where σ is the standard deviation of the last 30 historical closes.
"""
from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import sys
import time as _time
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger("kronos_worker")

# ── Kronos source directory ───────────────────────────────────────────────────
_KRONOS_SRC = os.getenv("KRONOS_SRC_DIR", "/tmp/kronos_src")
_KRONOS_REPO = "https://github.com/shiyu-coder/Kronos.git"

# Refresh interval — skip inference if last run is less than this many seconds ago
_MIN_INTERVAL_SECONDS = int(os.getenv("KRONOS_INTERVAL_SECONDS", str(4 * 3600)))

# Prediction horizon per timeframe
_PRED_LEN: Dict[str, int] = {
    "4h": 60,    # ~10 days ahead (6 candles/day)
    "1day": 30,  # ~1 month ahead
}

# Candle frequency in seconds per timeframe (for building future timestamps)
_TF_SECONDS: Dict[str, int] = {
    "4h": 4 * 3600,
    "1day": 24 * 3600,
}

# Number of historical candles passed to Kronos
_CONTEXT_CANDLES = 200

# Lazy-loaded predictor (one instance, reused across calls)
_predictor = None
_predictor_lock = asyncio.Lock()


def _setup_kronos() -> None:
    """Clone the Kronos repo if not already present and add it to sys.path."""
    if not os.path.isdir(os.path.join(_KRONOS_SRC, "model")):
        logger.info("Cloning Kronos repo to %s ...", _KRONOS_SRC)
        subprocess.run(
            ["git", "clone", "--depth=1", _KRONOS_REPO, _KRONOS_SRC],
            check=True,
            capture_output=True,
            text=True,
        )
        logger.info("Kronos repo cloned.")
    if _KRONOS_SRC not in sys.path:
        sys.path.insert(0, _KRONOS_SRC)


async def _get_predictor():
    """Load and return the Kronos predictor (lazy, cached, thread-safe)."""
    global _predictor
    async with _predictor_lock:
        if _predictor is None:
            loop = asyncio.get_event_loop()
            _predictor = await loop.run_in_executor(None, _load_predictor_sync)
    return _predictor


def _load_predictor_sync():
    import importlib
    _setup_kronos()
    # Dynamic import after sys.path is set
    kronos_mod = importlib.import_module("model")
    Kronos = getattr(kronos_mod, "Kronos")
    KronosTokenizer = getattr(kronos_mod, "KronosTokenizer")
    KronosPredictor = getattr(kronos_mod, "KronosPredictor")

    logger.info("Loading Kronos-mini model from HuggingFace ...")
    tokenizer = KronosTokenizer.from_pretrained("NeoQuasar/Kronos-Tokenizer-2k")
    model = Kronos.from_pretrained("NeoQuasar/Kronos-mini")
    predictor = KronosPredictor(model, tokenizer, device="cpu", max_context=2048)
    logger.info("Kronos-mini loaded.")
    return predictor


def _build_forecast_bands(
    predictor,
    df_hist,       # pd.DataFrame with columns: timestamp, open, high, low, close
    timeframe: str,
) -> Optional[Dict[str, Any]]:
    """
    Run Kronos inference on df_hist and return a dict with timestamps + band arrays.
    Returns None if df_hist is too short.
    """
    import pandas as pd
    import numpy as np

    if len(df_hist) < 50:
        return None

    pred_len = _PRED_LEN[timeframe]
    tf_seconds = _TF_SECONDS[timeframe]

    df = df_hist.copy()
    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)
    df = df.sort_values("timestamp").reset_index(drop=True)

    # Ensure required columns
    for col in ("open", "high", "low", "close"):
        df[col] = df[col].astype(float)

    last_ts = df["timestamp"].iloc[-1]

    # Build future timestamps (pred_len bars after the last historical bar)
    future_ts = pd.to_datetime([
        last_ts + timedelta(seconds=tf_seconds * (i + 1))
        for i in range(pred_len)
    ], utc=True)

    x_timestamp = df["timestamp"]
    y_timestamp = pd.Series(future_ts)

    # ── True Kronos stochastic paths ─────────────────────────────────────────
    # Call predict(sample_count=1) N_KRONOS_SAMPLES times to get distinct
    # Kronos draws, then bootstrap the remainder from historical returns
    # anchored on those draws. Staleness-check in run_all_forecasts ensures
    # this only runs when a new candle has arrived, so the 4H window budget
    # is not spent on already-fresh forecasts.
    N_KRONOS_SAMPLES = 50   # true Kronos draws per symbol/timeframe

    kronos_paths: list[list[float]] = []
    _t0 = _time.monotonic()
    for _ in range(N_KRONOS_SAMPLES):
        try:
            draw = predictor.predict(
                df,
                x_timestamp,
                y_timestamp,
                pred_len=pred_len,
                T=0.9,
                top_p=0.9,
                sample_count=1,
                verbose=False,
            )
            kronos_paths.append(draw["close"].values.astype(float).tolist())
        except Exception:
            logger.exception("Kronos predict() draw failed")
            break
    _elapsed = _time.monotonic() - _t0
    logger.info(
        "Kronos %d draws for %s took %.1fs (%.2fs/draw)",
        len(kronos_paths), timeframe, _elapsed, _elapsed / max(len(kronos_paths), 1),
    )

    if not kronos_paths:
        logger.warning("No Kronos draws succeeded — skipping")
        return None

    kronos_arr = np.array(kronos_paths)        # (n_draws, pred_len)
    predicted_closes = kronos_arr.mean(axis=0) # mean across all draws = p50
    p50 = [round(float(v), 8) for v in predicted_closes]
    p10 = [round(float(v), 8) for v in np.quantile(kronos_arr, 0.10, axis=0)]
    p25 = [round(float(v), 8) for v in np.quantile(kronos_arr, 0.25, axis=0)]
    p75 = [round(float(v), 8) for v in np.quantile(kronos_arr, 0.75, axis=0)]
    p90 = [round(float(v), 8) for v in np.quantile(kronos_arr, 0.90, axis=0)]
    sample_paths = [[round(float(v), 4) for v in kronos_arr[i]] for i in range(len(kronos_arr))]

    # ── Forward Conditions — derived from the 500 Kronos paths ────────────────
    highs  = df["high"].values.astype(float)
    lows   = df["low"].values.astype(float)
    closes = df["close"].values.astype(float)

    tr = np.maximum(
        highs[1:] - lows[1:],
        np.maximum(np.abs(highs[1:] - closes[:-1]), np.abs(lows[1:] - closes[:-1])),
    )
    atr14 = float(np.mean(tr[-14:])) if len(tr) >= 14 else (float(np.mean(tr)) if len(tr) > 0 else 0.0)

    recent_high = float(np.max(highs[-20:]))
    recent_low  = float(np.min(lows[-20:]))
    expanded = int(np.sum((kronos_arr.max(axis=1) > recent_high) | (kronos_arr.min(axis=1) < recent_low)))
    expansion_prob = round(float(expanded / len(kronos_arr) * 100), 1)

    path_ranges = kronos_arr.max(axis=1) - kronos_arr.min(axis=1)
    expected_range = round(float(np.mean(path_ranges) / atr14), 2) if atr14 > 0 else 1.0

    if expansion_prob >= 60:
        forward_state = "Improving"
    elif expansion_prob <= 35:
        forward_state = "Deteriorating"
    else:
        forward_state = "Stable"

    timestamps = [int(ts.timestamp()) for ts in future_ts]

    return {
        "last_candle_time": int(last_ts.timestamp()),
        "last_close": round(float(df["close"].iloc[-1]), 8),
        "timestamps": timestamps,
        "p10": p10,
        "p25": p25,
        "p50": p50,
        "p75": p75,
        "p90": p90,
        "paths": sample_paths,
        "expansion_prob": expansion_prob,
        "expected_range": expected_range,
        "forward_state": forward_state,
    }


async def run_all_forecasts() -> None:
    """
    Main entry point — called from the ingest worker on a 4H schedule.
    Fetches candles for every symbol × [4h, 1day], runs Kronos, stores results.
    """
    from app.core.db import AsyncSessionLocal
    from app.models.kronos_forecast import KronosForecast
    from sqlalchemy import select, text
    from sqlalchemy.dialects.postgresql import insert as pg_insert
    import pandas as pd

    logger.info("Kronos forecast run starting ...")

    # Fetch all symbols
    async with AsyncSessionLocal() as db:
        from app.models.fx_universe import FXUniverse
        rows = (await db.execute(select(FXUniverse.symbol))).all()
        symbols = [r[0].strip().upper().replace("/", "") for r in rows]

    if not symbols:
        logger.warning("No symbols found for Kronos run.")
        return

    predictor = await _get_predictor()
    loop = asyncio.get_event_loop()

    for symbol in symbols:
        for timeframe in ("4h", "1day"):
            try:
                async with AsyncSessionLocal() as db:
                    # Fetch candles + existing forecast's last_candle_time in one round-trip
                    result = await db.execute(
                        text(
                            """
                            SELECT timestamp, open, high, low, close
                            FROM (
                                SELECT timestamp, open, high, low, close
                                FROM market_prices
                                WHERE symbol = :s AND timeframe = :tf
                                ORDER BY timestamp DESC
                                LIMIT :lim
                            ) sub
                            ORDER BY timestamp ASC
                            """
                        ),
                        {"s": symbol, "tf": timeframe, "lim": _CONTEXT_CANDLES},
                    )
                    candle_rows = result.all()

                    # Check if the latest candle is newer than our stored forecast
                    existing = (await db.execute(
                        text(
                            "SELECT last_candle_time FROM market_kronos_forecasts "
                            "WHERE symbol = :s AND timeframe = :tf"
                        ),
                        {"s": symbol, "tf": timeframe},
                    )).first()

                if len(candle_rows) < 50:
                    logger.debug("Skipping %s/%s — only %d candles", symbol, timeframe, len(candle_rows))
                    continue

                latest_candle_ts = candle_rows[-1][0]  # last row, timestamp column
                if existing and existing[0] is not None:
                    stored_ts = existing[0]
                    if stored_ts.tzinfo is None:
                        stored_ts = stored_ts.replace(tzinfo=timezone.utc)
                    if hasattr(latest_candle_ts, "tzinfo"):
                        lct = latest_candle_ts if latest_candle_ts.tzinfo else latest_candle_ts.replace(tzinfo=timezone.utc)
                    else:
                        lct = datetime.fromtimestamp(float(latest_candle_ts), tz=timezone.utc)
                    if lct <= stored_ts:
                        logger.debug("Skipping %s/%s — no new candle since last forecast", symbol, timeframe)
                        continue

                df_hist = pd.DataFrame(
                    candle_rows, columns=["timestamp", "open", "high", "low", "close"]
                )

                bands = await loop.run_in_executor(
                    None, _build_forecast_bands, predictor, df_hist, timeframe
                )

                if bands is None:
                    continue

                last_ts = datetime.fromtimestamp(bands["last_candle_time"], tz=timezone.utc)
                now = datetime.now(tz=timezone.utc)

                async with AsyncSessionLocal() as db:
                    stmt = (
                        pg_insert(KronosForecast)
                        .values(
                            symbol=symbol,
                            timeframe=timeframe,
                            generated_at=now,
                            last_candle_time=last_ts,
                            pred_len=_PRED_LEN[timeframe],
                            bands=bands,
                        )
                        .on_conflict_do_update(
                            constraint="uq_kronos_symbol_tf",
                            set_={
                                "generated_at": now,
                                "last_candle_time": last_ts,
                                "pred_len": _PRED_LEN[timeframe],
                                "bands": bands,
                            },
                        )
                    )
                    await db.execute(stmt)
                    await db.commit()

                logger.info("Kronos forecast stored: %s/%s", symbol, timeframe)

            except Exception:
                logger.exception("Kronos failed for %s/%s", symbol, timeframe)

    logger.info("Kronos forecast run complete.")


async def run_if_due() -> None:
    """
    Check if the last Kronos run is older than _MIN_INTERVAL_SECONDS and, if so,
    run forecasts for all symbols. Safe to call on every ingest loop iteration.
    """
    from app.core.db import AsyncSessionLocal
    from app.models.kronos_forecast import KronosForecast
    from sqlalchemy import select, func

    try:
        async with AsyncSessionLocal() as db:
            latest_gen = (await db.execute(
                select(func.max(KronosForecast.generated_at))
            )).scalar_one_or_none()

        if latest_gen is None:
            due = True
        else:
            if latest_gen.tzinfo is None:
                latest_gen = latest_gen.replace(tzinfo=timezone.utc)
            age = (datetime.now(tz=timezone.utc) - latest_gen).total_seconds()
            due = age >= _MIN_INTERVAL_SECONDS

        if due:
            await run_all_forecasts()
        else:
            logger.debug(
                "Kronos skipped — last run %.0f min ago (next in %.0f min)",
                age / 60,
                (_MIN_INTERVAL_SECONDS - age) / 60,
            )
    except Exception:
        logger.exception("Kronos run_if_due error")
