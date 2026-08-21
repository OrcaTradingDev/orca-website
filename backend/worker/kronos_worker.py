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
import math
import os
import subprocess
import sys
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
    "4h": 20,    # ~3.3 days ahead
    "1day": 10,  # ~2 weeks ahead
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

    # Run Kronos (sync, called in executor)
    try:
        predicted = predictor.predict(
            df,
            x_timestamp,
            y_timestamp,
            pred_len=pred_len,
            T=0.9,
            top_p=0.9,
            sample_count=20,
            verbose=False,
        )
    except Exception:
        logger.exception("Kronos predict() failed")
        return None

    # p50 = Kronos mean forecast for close
    predicted_closes = predicted["close"].values.astype(float)

    # σ from last 30 historical closes (capped at 1 for safety)
    last_30 = df["close"].values[-30:].astype(float)
    sigma = float(np.std(last_30))
    if sigma == 0:
        sigma = float(abs(last_30[-1]) * 0.001)  # fallback: 0.1% of price

    # Build bands with √t horizon scaling
    p50 = predicted_closes.tolist()
    p25, p75, p10, p90 = [], [], [], []
    for i, mid in enumerate(p50):
        scale = math.sqrt(i + 1)
        p25.append(round(mid - 0.675 * sigma * scale, 8))
        p75.append(round(mid + 0.675 * sigma * scale, 8))
        p10.append(round(mid - 1.281 * sigma * scale, 8))
        p90.append(round(mid + 1.281 * sigma * scale, 8))
        p50[i] = round(mid, 8)

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
                    # Fetch candles
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

                if len(candle_rows) < 50:
                    logger.debug("Skipping %s/%s — only %d candles", symbol, timeframe, len(candle_rows))
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
