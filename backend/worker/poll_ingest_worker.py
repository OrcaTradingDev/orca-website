# backend/worker/poll_ingest_worker.py
from __future__ import annotations

import asyncio
import json
import logging
import os
import signal
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.core.db import AsyncSessionLocal
from app.domain.config import load_orca_mc_config, load_screener_config
from app.domain.indicators import _adx_wilder, _atr_wilder, _ema, _rsi_wilder, _sma
from app.domain.orca_mc import OrcaMCConfig, OrcaMCInputs, OrcaMCResult, compute_orca_mc, tf_bias
from app.domain.signals import adx_dir_from_di, build_signals, ema_state
from app.models.fx_universe import FXUniverse
from app.models.market_indicators_latest import MarketIndicatorsLatest
from app.models.market_prices import MarketPrice
from app.services.twelve_data import TwelveDataService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("poll_ingest_worker")
logging.getLogger("httpx").setLevel(logging.WARNING)

shutdown_event = asyncio.Event()


def _handle_signal(sig, frame):
    logger.info("Received signal %s, shutting down...", sig)
    shutdown_event.set()


def _parse_timeframes() -> List[str]:
    # Your desired set — 1week is required so LONGTERM_TIMEFRAMES ("1day","1week")
    # actually has weekly data to blend in (it always supported it, just never received it).
    raw = os.getenv("INGEST_TIMEFRAMES", "5min,30min,1h,4h,1day,1week")
    return [t.strip() for t in raw.split(",") if t.strip()]


POLL_SECONDS = int(os.getenv("INGEST_POLL_SECONDS", "60"))
# 300+ candles needed for EMA(200) to actually converge (200 gives it zero
# recursion runway) and for the Orca MC engine's full EMA/ADX/ATR stack.
LIMIT_PER_REQUEST = int(os.getenv("INGEST_LIMIT", "300"))

# Drop candles that are too far ahead of DB/server time (protects from timezone/provider weirdness)
MAX_FUTURE_SKEW_SECONDS = int(os.getenv("INGEST_MAX_FUTURE_SKEW_SECONDS", "120"))

# If we hit rate limit, wait a bit then continue
RATE_LIMIT_BACKOFF_SECONDS = int(os.getenv("INGEST_RATE_LIMIT_BACKOFF_SECONDS", "20"))


def normalize_symbol(sym: str) -> str:
    return (sym or "").strip().upper().replace("/", "")


def compute_latest_indicators(ohlc_rows: List[Dict]) -> Optional[Dict]:
    """
    Input rows must be ascending by timestamp.
    Returns dict of latest indicator values.
    """
    if not ohlc_rows or len(ohlc_rows) < 30:
        return None

    closes = [float(r["close"]) for r in ohlc_rows]
    highs = [float(r["high"]) for r in ohlc_rows]
    lows = [float(r["low"]) for r in ohlc_rows]

    ema9 = _ema(closes, 9)
    ema20 = _ema(closes, 20)
    ema21 = _ema(closes, 21)
    ema50 = _ema(closes, 50)
    ema200 = _ema(closes, 200)

    rsi14 = _rsi_wilder(closes, 14)

    ema12 = _ema(closes, 12)
    ema26 = _ema(closes, 26)
    macd_line: List[Optional[float]] = [None] * len(closes)
    for i in range(len(closes)):
        if ema12[i] is None or ema26[i] is None:
            continue
        macd_line[i] = float(ema12[i]) - float(ema26[i])

    macd_values = [v if v is not None else 0.0 for v in macd_line]
    macd_signal = _ema(macd_values, 9)
    macd_hist: List[Optional[float]] = [None] * len(closes)
    for i in range(len(closes)):
        if macd_line[i] is None or macd_signal[i] is None:
            continue
        macd_hist[i] = float(macd_line[i]) - float(macd_signal[i])

    atr14 = _atr_wilder(highs, lows, closes, 14)
    adx14, plus_di14, minus_di14 = _adx_wilder(highs, lows, closes, 14)
    # SMA(20) of the ATR(14) series itself — used by the Orca MC engine's
    # expansion/compression volatility classification. NOT a 20-period ATR.
    atr14_filled = [v if v is not None else 0.0 for v in atr14]
    atr_sma20 = _sma(atr14_filled, 20)

    i = len(ohlc_rows) - 1
    last_ts = ohlc_rows[i]["timestamp"]

    return {
        "last_timestamp": last_ts,
        "ema_9": ema9[i],
        "ema_20": ema20[i],
        "ema_21": ema21[i],
        "ema_50": ema50[i],
        "ema_200": ema200[i],
        "rsi_14": rsi14[i],
        "macd": macd_line[i],
        "macd_signal": macd_signal[i],
        "macd_hist": macd_hist[i],
        "adx_14": adx14[i],
        "plus_di_14": plus_di14[i],
        "minus_di_14": minus_di14[i],
        "atr_14": atr14[i],
        "atr_sma_20": atr_sma20[i],
    }


# ----------------------------
# Trend Matrix scoring (DB-only, no vendor calls)
# ----------------------------
def _clamp(x: float, lo: float, hi: float) -> float:
    return lo if x < lo else hi if x > hi else x


def _safe_float(x: Any) -> Optional[float]:
    if x is None:
        return None
    try:
        return float(x)
    except Exception:
        return None


def score_timeframe_from_indicators(ind: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    ema9 = _safe_float(ind.get("ema_9"))
    ema21 = _safe_float(ind.get("ema_21"))
    ema50 = _safe_float(ind.get("ema_50"))
    rsi = _safe_float(ind.get("rsi_14"))
    macd_hist = _safe_float(ind.get("macd_hist"))
    adx = _safe_float(ind.get("adx_14"))
    atr = _safe_float(ind.get("atr_14"))

    if any(v is None for v in [ema9, ema21, ema50, rsi, macd_hist, adx, atr]):
        return None
    if atr is None or atr <= 0:
        return None

    stack_dir = 0.0
    if ema9 > ema21 and ema21 > ema50:
        stack_dir = 1.0
    elif ema9 < ema21 and ema21 < ema50:
        stack_dir = -1.0
    else:
        stack_dir = 0.0

    sep = ((ema9 - ema21) + (ema21 - ema50)) / (2.0 * atr)
    sep = _clamp(sep, -3.0, 3.0) / 3.0
    ema_score = _clamp(0.6 * stack_dir + 0.4 * sep, -1.0, 1.0)

    rsi_score = _clamp((rsi - 50.0) / 20.0, -1.0, 1.0)

    macd_score = _clamp((macd_hist / atr) * 5.0, -1.0, 1.0)

    w_ema, w_rsi, w_macd = 0.45, 0.25, 0.30
    raw_signal = (w_ema * ema_score) + (w_rsi * rsi_score) + (w_macd * macd_score)
    raw_signal = _clamp(raw_signal, -1.0, 1.0)

    confidence = _clamp((adx - 15.0) / 25.0, 0.0, 1.0)

    score = raw_signal * confidence
    score_100 = float(_clamp(score * 100.0, -100.0, 100.0))

    bullish = int(round(_clamp((score_100 + 100.0) / 2.0, 0.0, 100.0)))
    bearish = 100 - bullish

    return {
        "score": score_100,
        "bullish_pct": bullish,
        "bearish_pct": bearish,
        "confidence": confidence,
        "ema_score": ema_score,
        "rsi_score": rsi_score,
        "macd_score": macd_score,
    }


# ----------------------------
# Trend tables + aggregate tables (safe create-if-not-exists)
# ----------------------------
INTRADAY_TIMEFRAMES = ("5min", "30min", "1h")
DAILY_TIMEFRAMES = ("4h", "1day")
LONGTERM_TIMEFRAMES = ("1day", "1week")

# TF weights (longer = heavier)
TF_WEIGHTS: Dict[str, float] = {
    "5min": 1.0,
    "30min": 2.0,
    "1h": 3.0,
    "4h": 3.0,
    "1day": 4.0,
    "1week": 5.0,
}


async def ensure_trend_tables_exist() -> None:
    async with AsyncSessionLocal() as db:
        # Per-(symbol,timeframe) latest trend scores
        await db.execute(
            text(
                """
        CREATE TABLE IF NOT EXISTS market_trend_scores_latest (
          id BIGSERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          timeframe TEXT NOT NULL,
          last_timestamp TIMESTAMPTZ NOT NULL,
          score DOUBLE PRECISION,
          bullish_pct INTEGER,
          bearish_pct INTEGER,
          confidence DOUBLE PRECISION,
          ema_score DOUBLE PRECISION,
          rsi_score DOUBLE PRECISION,
          macd_score DOUBLE PRECISION
        );
        """
            )
        )
        await db.execute(
            text(
                """
        CREATE INDEX IF NOT EXISTS idx_trend_scores_symbol_tf
        ON market_trend_scores_latest(symbol, timeframe);
        """
            )
        )

        # Per-symbol aggregates (intraday + daily)
        await db.execute(
            text(
                """
        CREATE TABLE IF NOT EXISTS market_trend_aggregates_latest (
          id BIGSERIAL PRIMARY KEY,
          symbol TEXT NOT NULL,
          intraday_last_timestamp TIMESTAMPTZ,
          intraday_score DOUBLE PRECISION,
          intraday_bullish_pct INTEGER,
          intraday_bearish_pct INTEGER,
          daily_last_timestamp TIMESTAMPTZ,
          daily_score DOUBLE PRECISION,
          daily_bullish_pct INTEGER,
          daily_bearish_pct INTEGER,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
            )
        )
        await db.execute(
            text(
                """
        CREATE INDEX IF NOT EXISTS idx_trend_aggs_symbol
        ON market_trend_aggregates_latest(symbol);
        """
            )
        )
        await db.commit()


async def upsert_trend_score_latest(symbol: str, timeframe: str, last_ts: datetime, s: Dict[str, Any]) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(
            text("DELETE FROM market_trend_scores_latest WHERE symbol=:s AND timeframe=:t"),
            {"s": symbol, "t": timeframe},
        )
        await db.execute(
            text(
                """
                INSERT INTO market_trend_scores_latest (
                  symbol, timeframe, last_timestamp,
                  score, bullish_pct, bearish_pct,
                  confidence, ema_score, rsi_score, macd_score
                ) VALUES (
                  :symbol, :timeframe, :last_timestamp,
                  :score, :bullish_pct, :bearish_pct,
                  :confidence, :ema_score, :rsi_score, :macd_score
                )
                """
            ),
            {
                "symbol": symbol,
                "timeframe": timeframe,
                "last_timestamp": last_ts,
                "score": s.get("score"),
                "bullish_pct": s.get("bullish_pct"),
                "bearish_pct": s.get("bearish_pct"),
                "confidence": s.get("confidence"),
                "ema_score": s.get("ema_score"),
                "rsi_score": s.get("rsi_score"),
                "macd_score": s.get("macd_score"),
            },
        )
        await db.commit()


def _pct_from_score(score: float) -> Tuple[int, int]:
    bull = int(round(_clamp((score + 100.0) / 2.0, 0.0, 100.0)))
    bear = 100 - bull
    return bull, bear


async def compute_symbol_aggregate(symbol: str, tfs: Tuple[str, ...]) -> Optional[Dict[str, Any]]:
    """
    Pull trend rows for the symbol for the requested timeframes and compute a weighted aggregate score.
    Uses: effective_weight = tf_weight * (0.5 + 0.5*confidence)
    Returns: {score, bullish_pct, bearish_pct, last_timestamp}
    """
    async with AsyncSessionLocal() as db:
        res = await db.execute(
            text(
                """
                SELECT timeframe, score, confidence, last_timestamp
                FROM market_trend_scores_latest
                WHERE symbol = :s AND timeframe = ANY(:tfs)
                """
            ),
            {"s": symbol, "tfs": list(tfs)},
        )
        rows = res.fetchall()

    if not rows:
        return None

    num = 0.0
    den = 0.0
    max_ts: Optional[datetime] = None

    for timeframe, score, confidence, last_ts in rows:
        if score is None or confidence is None:
            continue
        w = TF_WEIGHTS.get(str(timeframe), 0.0)
        if w <= 0:
            continue
        eff = w * (0.5 + 0.5 * float(confidence))
        num += float(score) * eff
        den += eff
        if last_ts is not None:
            if max_ts is None or last_ts > max_ts:
                max_ts = last_ts

    if den <= 0 or max_ts is None:
        return None

    agg_score = float(num / den)
    agg_score = _clamp(agg_score, -100.0, 100.0)
    bull, bear = _pct_from_score(agg_score)

    return {
        "score": agg_score,
        "bullish_pct": bull,
        "bearish_pct": bear,
        "last_timestamp": max_ts,
    }


async def _compute_current_signal(db, symbol: str, daily_bull: int, intraday_bull: int, longterm_bull: int):
    """
    Reuses the same shared signal logic as screener.py / alert_checker.py so
    freshness-tracking never drifts from what's actually displayed.
    """
    cfg = await load_screener_config(db)

    ind_row = (await db.execute(
        select(
            MarketIndicatorsLatest.ema_9,
            MarketIndicatorsLatest.ema_21,
            MarketIndicatorsLatest.ema_50,
            MarketIndicatorsLatest.adx_14,
            MarketIndicatorsLatest.plus_di_14,
            MarketIndicatorsLatest.minus_di_14,
        ).where(
            MarketIndicatorsLatest.symbol == symbol,
            MarketIndicatorsLatest.timeframe == "1day",
        )
    )).first()

    if ind_row:
        ema9, ema21, ema50, adx_14, plus_di, minus_di = ind_row
    else:
        ema9 = ema21 = ema50 = adx_14 = plus_di = minus_di = None

    adx = int(max(0, min(100, round(adx_14)))) if adx_14 is not None else 0
    adx_dir = adx_dir_from_di(plus_di, minus_di)
    ema_aligned = ema_state(ema9, ema21, ema50) == "aligned"

    signals = build_signals(daily_bull, intraday_bull, longterm_bull, adx, ema_aligned, adx_dir, cfg=cfg)
    return signals.status, signals.direction


async def upsert_symbol_aggregates_latest(
    symbol: str,
    intraday: Optional[Dict[str, Any]],
    daily: Optional[Dict[str, Any]],
    longterm: Optional[Dict[str, Any]] = None,
) -> None:
    """
    One row per symbol. Keep the same "delete + insert" approach (no uniqueness assumptions).
    Also tracks signal freshness: status_since only advances when status/direction
    actually changes, so the UI can show "WATCH SHORT · 2h ago".
    """
    daily_bull    = 50 if daily is None    else daily["bullish_pct"]
    intraday_bull = 50 if intraday is None else intraday["bullish_pct"]
    longterm_bull = 50 if longterm is None else longterm["bullish_pct"]

    async with AsyncSessionLocal() as db:
        prev_row = (await db.execute(
            text(
                "SELECT orca_status, orca_direction, status_since "
                "FROM market_trend_aggregates_latest WHERE symbol=:s"
            ),
            {"s": symbol},
        )).first()

        new_status, new_direction = await _compute_current_signal(
            db, symbol, daily_bull, intraday_bull, longterm_bull
        )

        now = datetime.now(timezone.utc)
        if prev_row and prev_row[0] == new_status and prev_row[1] == new_direction and prev_row[2] is not None:
            status_since = prev_row[2]
        else:
            status_since = now

        await db.execute(text("DELETE FROM market_trend_aggregates_latest WHERE symbol=:s"), {"s": symbol})
        await db.execute(
            text(
                """
                INSERT INTO market_trend_aggregates_latest (
                  symbol,
                  intraday_last_timestamp, intraday_score, intraday_bullish_pct, intraday_bearish_pct,
                  daily_last_timestamp, daily_score, daily_bullish_pct, daily_bearish_pct,
                  longterm_last_timestamp, longterm_score, longterm_bullish_pct, longterm_bearish_pct,
                  orca_status, orca_direction, status_since,
                  updated_at
                ) VALUES (
                  :symbol,
                  :intraday_last_timestamp, :intraday_score, :intraday_bullish_pct, :intraday_bearish_pct,
                  :daily_last_timestamp, :daily_score, :daily_bullish_pct, :daily_bearish_pct,
                  :longterm_last_timestamp, :longterm_score, :longterm_bullish_pct, :longterm_bearish_pct,
                  :orca_status, :orca_direction, :status_since,
                  NOW()
                )
                """
            ),
            {
                "symbol": symbol,
                "intraday_last_timestamp": None if intraday is None else intraday["last_timestamp"],
                "intraday_score": None if intraday is None else intraday["score"],
                "intraday_bullish_pct": None if intraday is None else intraday["bullish_pct"],
                "intraday_bearish_pct": None if intraday is None else intraday["bearish_pct"],
                "daily_last_timestamp": None if daily is None else daily["last_timestamp"],
                "daily_score": None if daily is None else daily["score"],
                "daily_bullish_pct": None if daily is None else daily["bullish_pct"],
                "daily_bearish_pct": None if daily is None else daily["bearish_pct"],
                "longterm_last_timestamp": None if longterm is None else longterm["last_timestamp"],
                "longterm_score": None if longterm is None else longterm["score"],
                "longterm_bullish_pct": None if longterm is None else longterm["bullish_pct"],
                "longterm_bearish_pct": None if longterm is None else longterm["bearish_pct"],
                "orca_status": new_status,
                "orca_direction": new_direction,
                "status_since": status_since,
            },
        )
        await db.commit()


# ----------------------------
# Existing DB helpers
# ----------------------------
_timeframe_column_cache: Optional[bool] = None


async def market_prices_has_timeframe_column() -> bool:
    global _timeframe_column_cache
    if _timeframe_column_cache is not None:
        return _timeframe_column_cache

    q = text(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema='public'
          AND table_name='market_prices'
          AND column_name='timeframe'
        LIMIT 1
        """
    )
    async with AsyncSessionLocal() as db:
        res = await db.execute(q)
        _timeframe_column_cache = res.first() is not None

    if _timeframe_column_cache:
        logger.info("Detected market_prices.timeframe column ✅")
    else:
        logger.warning("market_prices.timeframe column NOT found — running in legacy mode (symbol,timestamp only) ⚠️")
    return _timeframe_column_cache


async def upsert_market_prices(rows: List[Dict], has_tf: bool) -> int:
    if not rows:
        return 0

    if has_tf:
        stmt = insert(MarketPrice).values(rows).on_conflict_do_update(
            index_elements=["symbol", "timeframe", "timestamp"],
            set_={
                "open": insert(MarketPrice).excluded.open,
                "high": insert(MarketPrice).excluded.high,
                "low": insert(MarketPrice).excluded.low,
                "close": insert(MarketPrice).excluded.close,
                "volume": insert(MarketPrice).excluded.volume,
            },
        )
    else:
        rows_no_tf = []
        for r in rows:
            rr = dict(r)
            rr.pop("timeframe", None)
            rows_no_tf.append(rr)

        stmt = insert(MarketPrice).values(rows_no_tf).on_conflict_do_update(
            index_elements=["symbol", "timestamp"],
            set_={
                "open": insert(MarketPrice).excluded.open,
                "high": insert(MarketPrice).excluded.high,
                "low": insert(MarketPrice).excluded.low,
                "close": insert(MarketPrice).excluded.close,
                "volume": insert(MarketPrice).excluded.volume,
            },
        )

    async with AsyncSessionLocal() as db:
        await db.execute(stmt)
        await db.commit()
    return len(rows)


async def upsert_latest_indicators(symbol: str, timeframe: str, ind: Dict) -> None:
    async with AsyncSessionLocal() as db:
        await db.execute(
            text("DELETE FROM market_indicators_latest WHERE symbol=:s AND timeframe=:t"),
            {"s": symbol, "t": timeframe},
        )
        await db.execute(
            text(
                """
                INSERT INTO market_indicators_latest (
                    symbol, timeframe, last_timestamp,
                    ema_9, ema_20, ema_21, ema_50, ema_200,
                    rsi_14,
                    macd, macd_signal, macd_hist,
                    adx_14, plus_di_14, minus_di_14,
                    atr_14, atr_sma_20
                ) VALUES (
                    :symbol, :timeframe, :last_timestamp,
                    :ema_9, :ema_20, :ema_21, :ema_50, :ema_200,
                    :rsi_14,
                    :macd, :macd_signal, :macd_hist,
                    :adx_14, :plus_di_14, :minus_di_14,
                    :atr_14, :atr_sma_20
                )
                """
            ),
            {
                "symbol": symbol,
                "timeframe": timeframe,
                "last_timestamp": ind["last_timestamp"],
                "ema_9": ind["ema_9"],
                "ema_20": ind["ema_20"],
                "ema_21": ind["ema_21"],
                "ema_50": ind["ema_50"],
                "ema_200": ind["ema_200"],
                "rsi_14": ind["rsi_14"],
                "macd": ind["macd"],
                "macd_signal": ind["macd_signal"],
                "macd_hist": ind["macd_hist"],
                "adx_14": ind["adx_14"],
                "plus_di_14": ind["plus_di_14"],
                "minus_di_14": ind["minus_di_14"],
                "atr_14": ind["atr_14"],
                "atr_sma_20": ind["atr_sma_20"],
            },
        )
        await db.commit()


async def fetch_symbols() -> List[str]:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(FXUniverse.symbol))
        return [normalize_symbol(r[0]) for r in result.all()]


def _looks_like_rate_limit(exc: Exception) -> bool:
    msg = str(exc).lower()
    return ("429" in msg) or ("rate limit" in msg) or ("too many requests" in msg)


def _filter_future_rows(rows: List[Dict]) -> List[Dict]:
    if not rows:
        return rows
    now = datetime.now(timezone.utc)
    max_ok = now + timedelta(seconds=MAX_FUTURE_SKEW_SECONDS)
    return [r for r in rows if r["timestamp"] <= max_ok]


# ═══════════════════════════════════════════════════════════════════════════════
#  ORCA MC v3.0 ENGINE — Phase A (no POI). See app/domain/orca_mc.py.
#  Timeframe mapping: LTF/current=5min, HTF=1h, MTF panel=5min/30min/1h/4h.
# ═══════════════════════════════════════════════════════════════════════════════

async def _fetch_indicator_series(symbol: str, timeframe: str, limit: int) -> Optional[Dict[str, Any]]:
    """
    Read the last `limit` candles for (symbol, timeframe) from market_prices and
    compute the EMA(20/50/200)/ADX/ATR series Orca MC needs. Returns None if
    there isn't enough history yet.
    """
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            text(
                """
                SELECT open, high, low, close, timestamp FROM (
                    SELECT open, high, low, close, timestamp
                    FROM market_prices
                    WHERE symbol = :s AND timeframe = :tf
                    ORDER BY timestamp DESC
                    LIMIT :lim
                ) sub
                ORDER BY timestamp ASC
                """
            ),
            {"s": symbol, "tf": timeframe, "lim": limit},
        )
        rows = result.all()

    if len(rows) < 30:
        return None

    opens = [float(r[0]) for r in rows]
    highs = [float(r[1]) for r in rows]
    lows = [float(r[2]) for r in rows]
    closes = [float(r[3]) for r in rows]
    timestamps = [r[4] for r in rows]

    ema20 = _ema(closes, 20)
    ema50 = _ema(closes, 50)
    ema200 = _ema(closes, 200)
    adx, plus_di, minus_di = _adx_wilder(highs, lows, closes, 14)
    atr = _atr_wilder(highs, lows, closes, 14)
    atr_filled = [v if v is not None else 0.0 for v in atr]
    atr_sma20 = _sma(atr_filled, 20)

    i = len(rows) - 1
    candles = list(zip(opens[-6:], highs[-6:], lows[-6:], closes[-6:]))

    return {
        "close": closes[i],
        "ema20": ema20[i], "ema50": ema50[i], "ema200": ema200[i],
        "ema20_prev2": ema20[i - 2] if i >= 2 else None,
        "adx": adx[i], "adx_prev": adx[i - 1] if i >= 1 else None,
        "plus_di": plus_di[i], "minus_di": minus_di[i],
        "atr": atr[i], "atr_sma20": atr_sma20[i],
        "candles": candles,
        "last_timestamp": timestamps[i],
    }


async def upsert_orca_mc_latest(symbol: str, result: OrcaMCResult) -> None:
    """
    One row per symbol, delete+insert (matching upsert_symbol_aggregates_latest's
    pattern). status_since only advances when orca_status actually changes.
    """
    async with AsyncSessionLocal() as db:
        prev_row = (await db.execute(
            text("SELECT orca_status, status_since FROM market_orca_mc_latest WHERE symbol=:s"),
            {"s": symbol},
        )).first()

        now = datetime.now(timezone.utc)
        if prev_row and prev_row[0] == result.status.orca_status and prev_row[1] is not None:
            status_since = prev_row[1]
        else:
            status_since = now

        await db.execute(text("DELETE FROM market_orca_mc_latest WHERE symbol=:s"), {"s": symbol})
        await db.execute(
            text(
                """
                INSERT INTO market_orca_mc_latest (
                    symbol,
                    htf_bull, htf_bear, htf_neut, ltf_bull, ltf_bear,
                    ema_full_bull, ema_full_bear, ema_flat,
                    adx_strong, adx_very_strong, adx_rising, adx_falling,
                    di_conf_bull, di_conf_bear, di_sep,
                    atr_exp, vol_extreme, vol_compr, vol_state,
                    clean_candles, choppy_candles, body_ratio, recent_overlap,
                    phase, trend_struct, pb_status,
                    is_exhaustion, is_expansion, is_cont, is_pb, is_comp_final, is_chop,
                    mtf_bull_count, mtf_bear_count, mtf_align_str,
                    p_htf, p_adx, p_ema, p_phase, p_vol, orca_score, score_qual,
                    orca_status, pref_dir, status_since,
                    trig_c1, trig_c2, trig_c3, trig_c4, trig_met_count, trig_result,
                    suitability, suit_reason, act_conf, conf_tier,
                    readiness, ready_tier, ready_reason, expected_next,
                    why_bullets, opportunity_timeline,
                    ltf_last_timestamp, htf_last_timestamp, poi_pending, updated_at
                ) VALUES (
                    :symbol,
                    :htf_bull, :htf_bear, :htf_neut, :ltf_bull, :ltf_bear,
                    :ema_full_bull, :ema_full_bear, :ema_flat,
                    :adx_strong, :adx_very_strong, :adx_rising, :adx_falling,
                    :di_conf_bull, :di_conf_bear, :di_sep,
                    :atr_exp, :vol_extreme, :vol_compr, :vol_state,
                    :clean_candles, :choppy_candles, :body_ratio, :recent_overlap,
                    :phase, :trend_struct, :pb_status,
                    :is_exhaustion, :is_expansion, :is_cont, :is_pb, :is_comp_final, :is_chop,
                    :mtf_bull_count, :mtf_bear_count, :mtf_align_str,
                    :p_htf, :p_adx, :p_ema, :p_phase, :p_vol, :orca_score, :score_qual,
                    :orca_status, :pref_dir, :status_since,
                    :trig_c1, :trig_c2, :trig_c3, :trig_c4, :trig_met_count, :trig_result,
                    :suitability, :suit_reason, :act_conf, :conf_tier,
                    :readiness, :ready_tier, :ready_reason, :expected_next,
                    :why_bullets, :opportunity_timeline,
                    :ltf_last_timestamp, :htf_last_timestamp, :poi_pending, NOW()
                )
                """
            ),
            {
                "symbol": symbol,
                "htf_bull": result.chain.htf_bull, "htf_bear": result.chain.htf_bear, "htf_neut": result.chain.htf_neut,
                "ltf_bull": result.chain.ltf_bull, "ltf_bear": result.chain.ltf_bear,
                "ema_full_bull": result.chain.ema_full_bull, "ema_full_bear": result.chain.ema_full_bear,
                "ema_flat": result.chain.ema_flat,
                "adx_strong": result.chain.adx_strong, "adx_very_strong": result.chain.adx_very_strong,
                "adx_rising": result.chain.adx_rising, "adx_falling": result.chain.adx_falling,
                "di_conf_bull": result.chain.di_conf_bull, "di_conf_bear": result.chain.di_conf_bear,
                "di_sep": result.chain.di_sep,
                "atr_exp": result.chain.atr_exp, "vol_extreme": result.chain.vol_extreme,
                "vol_compr": result.chain.vol_compr, "vol_state": result.chain.vol_state,
                "clean_candles": result.chain.clean_candles, "choppy_candles": result.chain.choppy_candles,
                "body_ratio": result.chain.body_ratio, "recent_overlap": result.chain.recent_overlap,
                "phase": result.phase.phase, "trend_struct": result.phase.trend_struct, "pb_status": result.phase.pb_status,
                "is_exhaustion": result.phase.is_exhaustion, "is_expansion": result.phase.is_expansion,
                "is_cont": result.phase.is_cont, "is_pb": result.phase.is_pb,
                "is_comp_final": result.phase.is_comp_final, "is_chop": result.phase.is_chop,
                "mtf_bull_count": result.mtf.bull_count, "mtf_bear_count": result.mtf.bear_count,
                "mtf_align_str": result.mtf.align_str,
                "p_htf": result.score.p_htf, "p_adx": result.score.p_adx, "p_ema": result.score.p_ema,
                "p_phase": result.score.p_phase, "p_vol": result.score.p_vol,
                "orca_score": result.score.orca_score, "score_qual": result.score.score_qual,
                "orca_status": result.status.orca_status, "pref_dir": result.status.pref_dir,
                "status_since": status_since,
                "trig_c1": result.trigger.c1_met, "trig_c2": result.trigger.c2_met,
                "trig_c3": result.trigger.c3_met, "trig_c4": result.trigger.c4_met,
                "trig_met_count": result.trigger.met_count, "trig_result": result.trigger.result,
                "suitability": result.suitability.rating, "suit_reason": result.suitability.reason,
                "act_conf": result.confidence.score, "conf_tier": result.confidence.tier,
                "readiness": result.readiness.score, "ready_tier": result.readiness.tier,
                "ready_reason": result.readiness.reason, "expected_next": result.expected_next,
                "why_bullets": json.dumps(result.why_bullets),
                "opportunity_timeline": json.dumps(result.opportunity_timeline),
                "ltf_last_timestamp": result.ltf_last_timestamp, "htf_last_timestamp": result.htf_last_timestamp,
                "poi_pending": result.poi_pending,
            },
        )
        await db.commit()


async def compute_and_store_orca_mc(symbol: str, cfg: OrcaMCConfig) -> None:
    ltf = await _fetch_indicator_series(symbol, "5min", LIMIT_PER_REQUEST)
    htf = await _fetch_indicator_series(symbol, "1h", LIMIT_PER_REQUEST)
    if ltf is None or htf is None:
        logger.info("[orca-mc] %s skipped (insufficient 5min/1h history)", symbol)
        return

    mtf_30m = await _fetch_indicator_series(symbol, "30min", LIMIT_PER_REQUEST)
    mtf_4h = await _fetch_indicator_series(symbol, "4h", LIMIT_PER_REQUEST)

    mtf_biases = [
        tf_bias(ltf["close"], ltf["ema20"], ltf["ema50"]),
        tf_bias(mtf_30m["close"], mtf_30m["ema20"], mtf_30m["ema50"]) if mtf_30m else 0,
        tf_bias(htf["close"], htf["ema20"], htf["ema50"]),
        tf_bias(mtf_4h["close"], mtf_4h["ema20"], mtf_4h["ema50"]) if mtf_4h else 0,
    ]

    inputs = OrcaMCInputs(
        ltf_close=ltf["close"], ltf_ema20=ltf["ema20"], ltf_ema50=ltf["ema50"], ltf_ema200=ltf["ema200"],
        ltf_candles=ltf["candles"],
        htf_close=htf["close"], htf_ema20=htf["ema20"], htf_ema50=htf["ema50"], htf_ema200=htf["ema200"],
        htf_ema20_prev2=htf["ema20_prev2"],
        adx_value=ltf["adx"], adx_prev=ltf["adx_prev"],
        plus_di=ltf["plus_di"], minus_di=ltf["minus_di"],
        atr_value=ltf["atr"], atr_sma20=ltf["atr_sma20"],
        mtf_biases=mtf_biases,
        ltf_last_timestamp=ltf["last_timestamp"],
        htf_last_timestamp=htf["last_timestamp"],
    )
    result = compute_orca_mc(inputs, cfg)
    await upsert_orca_mc_latest(symbol, result)
    logger.info(
        "[orca-mc] %s status=%s score=%d phase=%s readiness=%d",
        symbol, result.status.orca_status, result.score.orca_score,
        result.phase.phase, result.readiness.score,
    )


async def ingest_once(td: TwelveDataService, timeframes: List[str]) -> None:
    symbols = await fetch_symbols()
    if not symbols:
        logger.info("No symbols in fx_universe yet. Seed it first.")
        return

    has_tf = await market_prices_has_timeframe_column()

    for timeframe in timeframes:
        for symbol in symbols:
            try:
                ohlc_rows = await td.fetch_ohlc(symbol=symbol, timeframe=timeframe, limit=LIMIT_PER_REQUEST)
            except Exception as e:
                if _looks_like_rate_limit(e):
                    logger.warning(
                        "[rate-limit] hit rate limit while ingesting %s %s. backing off %ss",
                        symbol,
                        timeframe,
                        RATE_LIMIT_BACKOFF_SECONDS,
                    )
                    await asyncio.sleep(RATE_LIMIT_BACKOFF_SECONDS)
                    continue
                # A bad/unrecognized symbol must not abort the whole cycle —
                # skip it and keep ingesting the rest of the universe.
                logger.warning("[ingest] %s %s failed, skipping: %s", symbol, timeframe, e)
                continue

            cleaned: List[Dict] = []
            for r in ohlc_rows:
                cleaned.append(
                    {
                        "symbol": symbol,
                        "timeframe": timeframe,
                        "timestamp": r["timestamp"],
                        "open": r["open"],
                        "high": r["high"],
                        "low": r["low"],
                        "close": r["close"],
                        "volume": r.get("volume"),
                    }
                )

            cleaned.sort(key=lambda x: x["timestamp"])
            cleaned = _filter_future_rows(cleaned)

            n = await upsert_market_prices(cleaned, has_tf)

            if cleaned:
                logger.info(
                    "[ingest] %s %s rows=%d %s → %s",
                    symbol,
                    timeframe,
                    n,
                    cleaned[0]["timestamp"],
                    cleaned[-1]["timestamp"],
                )
            else:
                logger.info("[ingest] %s %s rows=0", symbol, timeframe)

            ind = compute_latest_indicators(cleaned)
            if ind is None:
                logger.info("[ind] %s %s skipped (insufficient rows=%d)", symbol, timeframe, len(cleaned))
                continue

            try:
                await upsert_latest_indicators(symbol, timeframe, ind)
                logger.info(
                    "[ind] %s %s last_ts=%s ema9=%s ema21=%s rsi14=%s macd=%s adx14=%s",
                    symbol,
                    timeframe,
                    ind["last_timestamp"],
                    None if ind["ema_9"] is None else round(float(ind["ema_9"]), 6),
                    None if ind["ema_21"] is None else round(float(ind["ema_21"]), 6),
                    None if ind["rsi_14"] is None else round(float(ind["rsi_14"]), 4),
                    None if ind["macd"] is None else round(float(ind["macd"]), 6),
                    None if ind["adx_14"] is None else round(float(ind["adx_14"]), 4),
                )
            except Exception:
                logger.exception("[ind] failed upserting indicators for %s %s", symbol, timeframe)
                continue

            trend = score_timeframe_from_indicators(ind)
            if trend is None:
                logger.info("[trend] %s %s skipped (missing inputs)", symbol, timeframe)
                continue

            try:
                await upsert_trend_score_latest(symbol, timeframe, ind["last_timestamp"], trend)
                logger.info(
                    "[trend] %s %s score=%s bull=%s bear=%s conf=%.2f (ema=%.2f rsi=%.2f macd=%.2f)",
                    symbol,
                    timeframe,
                    round(float(trend["score"]), 2),
                    trend["bullish_pct"],
                    trend["bearish_pct"],
                    float(trend["confidence"]),
                    float(trend["ema_score"]),
                    float(trend["rsi_score"]),
                    float(trend["macd_score"]),
                )
            except Exception:
                logger.exception("[trend] failed upserting trend score for %s %s", symbol, timeframe)
                continue

            # ✅ Per-symbol aggregates: intraday (5m/30m/1h), daily (4h/1d), longterm (1d/1w)
            try:
                intraday = await compute_symbol_aggregate(symbol, INTRADAY_TIMEFRAMES)
                daily = await compute_symbol_aggregate(symbol, DAILY_TIMEFRAMES)
                longterm = await compute_symbol_aggregate(symbol, LONGTERM_TIMEFRAMES)
                await upsert_symbol_aggregates_latest(symbol, intraday, daily, longterm)

                if intraday is not None:
                    logger.info(
                        "[agg] %s intraday score=%.2f bull=%s bear=%s last_ts=%s",
                        symbol,
                        float(intraday["score"]),
                        intraday["bullish_pct"],
                        intraday["bearish_pct"],
                        intraday["last_timestamp"],
                    )
                if daily is not None:
                    logger.info(
                        "[agg] %s daily    score=%.2f bull=%s bear=%s last_ts=%s",
                        symbol,
                        float(daily["score"]),
                        daily["bullish_pct"],
                        daily["bearish_pct"],
                        daily["last_timestamp"],
                    )
            except Exception:
                logger.exception("[agg] failed computing/upserting aggregates for %s", symbol)

    # Orca MC needs candles from multiple timeframes at once (5min/30min/1h/4h),
    # so it runs as a second pass after the main ingest loop, once all
    # timeframes' market_prices/indicators are fresh for this cycle.
    orca_cfg = await load_orca_mc_config_safe()
    for symbol in symbols:
        try:
            await compute_and_store_orca_mc(symbol, orca_cfg)
        except Exception:
            logger.exception("[orca-mc] failed for %s", symbol)


async def load_orca_mc_config_safe() -> OrcaMCConfig:
    """load_orca_mc_config needs a DB session — small wrapper so ingest_once
    doesn't need to manage one just for this."""
    async with AsyncSessionLocal() as db:
        return await load_orca_mc_config(db)


async def main():
    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    timeframes = _parse_timeframes()

    td = TwelveDataService(
        api_key=settings.TWELVE_DATA_API_KEY,
        base_url=settings.TWELVE_DATA_BASE_URL,
    )

    # DB-only table creation (safe, no Alembic replay)
    await ensure_trend_tables_exist()

    logger.info(
        "Starting poll ingest worker: timeframes=%s poll=%ss limit=%s future_skew<=%ss",
        timeframes,
        POLL_SECONDS,
        LIMIT_PER_REQUEST,
        MAX_FUTURE_SKEW_SECONDS,
    )

    while not shutdown_event.is_set():
        try:
            await ingest_once(td, timeframes)
        except Exception:
            logger.exception("Ingest loop error")
        try:
            await asyncio.wait_for(shutdown_event.wait(), timeout=POLL_SECONDS)
        except asyncio.TimeoutError:
            pass

    logger.info("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())

