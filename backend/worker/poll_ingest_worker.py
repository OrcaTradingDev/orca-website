# backend/worker/poll_ingest_worker.py
from __future__ import annotations

import asyncio
import logging
import os
import signal
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert

from app.core.config import settings
from app.core.db import AsyncSessionLocal
from app.models.fx_universe import FXUniverse
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
    # Your desired set
    raw = os.getenv("INGEST_TIMEFRAMES", "5min,30min,1h,4h,1day")
    return [t.strip() for t in raw.split(",") if t.strip()]


POLL_SECONDS = int(os.getenv("INGEST_POLL_SECONDS", "60"))
LIMIT_PER_REQUEST = int(os.getenv("INGEST_LIMIT", "200"))

# Drop candles that are too far ahead of DB/server time (protects from timezone/provider weirdness)
MAX_FUTURE_SKEW_SECONDS = int(os.getenv("INGEST_MAX_FUTURE_SKEW_SECONDS", "120"))

# If we hit rate limit, wait a bit then continue
RATE_LIMIT_BACKOFF_SECONDS = int(os.getenv("INGEST_RATE_LIMIT_BACKOFF_SECONDS", "20"))


def normalize_symbol(sym: str) -> str:
    return (sym or "").strip().upper().replace("/", "")


# ----------------------------
# Indicator math (no pandas)
# ----------------------------
def _ema(values: List[float], period: int) -> List[Optional[float]]:
    if len(values) < period:
        return [None] * len(values)
    k = 2.0 / (period + 1.0)
    out: List[Optional[float]] = [None] * len(values)
    sma = sum(values[:period]) / period
    out[period - 1] = sma
    prev = sma
    for i in range(period, len(values)):
        prev = values[i] * k + prev * (1.0 - k)
        out[i] = prev
    return out


def _rsi_wilder(closes: List[float], period: int = 14) -> List[Optional[float]]:
    if len(closes) < period + 1:
        return [None] * len(closes)

    out: List[Optional[float]] = [None] * len(closes)

    gains = 0.0
    losses = 0.0
    for i in range(1, period + 1):
        ch = closes[i] - closes[i - 1]
        if ch >= 0:
            gains += ch
        else:
            losses += -ch

    avg_gain = gains / period
    avg_loss = losses / period

    def rsi_from(avgg, avgl) -> float:
        if avgl == 0:
            return 100.0
        rs = avgg / avgl
        return 100.0 - (100.0 / (1.0 + rs))

    out[period] = rsi_from(avg_gain, avg_loss)

    for i in range(period + 1, len(closes)):
        ch = closes[i] - closes[i - 1]
        gain = ch if ch > 0 else 0.0
        loss = (-ch) if ch < 0 else 0.0
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        out[i] = rsi_from(avg_gain, avg_loss)

    return out


def _atr_wilder(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> List[Optional[float]]:
    n = len(closes)
    if n < period + 1:
        return [None] * n

    tr: List[float] = []
    tr.append(highs[0] - lows[0])
    for i in range(1, n):
        tr_val = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        tr.append(tr_val)

    out: List[Optional[float]] = [None] * n

    first_atr = sum(tr[1 : period + 1]) / period
    out[period] = first_atr
    prev = first_atr

    for i in range(period + 1, n):
        prev = (prev * (period - 1) + tr[i]) / period
        out[i] = prev

    return out


def _adx_wilder(
    highs: List[float], lows: List[float], closes: List[float], period: int = 14
) -> Tuple[List[Optional[float]], List[Optional[float]], List[Optional[float]]]:
    """
    Returns (adx, plus_di, minus_di) lists aligned to input length.
    """
    n = len(closes)
    if n < period * 2 + 1:
        return ([None] * n, [None] * n, [None] * n)

    plus_dm: List[float] = [0.0]
    minus_dm: List[float] = [0.0]
    tr: List[float] = [highs[0] - lows[0]]

    for i in range(1, n):
        up_move = highs[i] - highs[i - 1]
        down_move = lows[i - 1] - lows[i]

        pdm = up_move if (up_move > down_move and up_move > 0) else 0.0
        mdm = down_move if (down_move > up_move and down_move > 0) else 0.0

        plus_dm.append(pdm)
        minus_dm.append(mdm)

        tr_val = max(
            highs[i] - lows[i],
            abs(highs[i] - closes[i - 1]),
            abs(lows[i] - closes[i - 1]),
        )
        tr.append(tr_val)

    # Wilder smoothing
    def wilder_smooth(vals: List[float], p: int) -> List[Optional[float]]:
        out: List[Optional[float]] = [None] * len(vals)
        initial = sum(vals[1 : p + 1])  # start from 1
        out[p] = initial
        prev = initial
        for i in range(p + 1, len(vals)):
            prev = prev - (prev / p) + vals[i]
            out[i] = prev
        return out

    sm_tr = wilder_smooth(tr, period)
    sm_pdm = wilder_smooth(plus_dm, period)
    sm_mdm = wilder_smooth(minus_dm, period)

    plus_di: List[Optional[float]] = [None] * n
    minus_di: List[Optional[float]] = [None] * n
    dx: List[Optional[float]] = [None] * n

    for i in range(n):
        if sm_tr[i] is None or sm_tr[i] == 0 or sm_pdm[i] is None or sm_mdm[i] is None:
            continue
        pdi = 100.0 * (sm_pdm[i] / sm_tr[i])
        mdi = 100.0 * (sm_mdm[i] / sm_tr[i])
        plus_di[i] = pdi
        minus_di[i] = mdi
        denom = pdi + mdi
        if denom == 0:
            dx[i] = 0.0
        else:
            dx[i] = 100.0 * abs(pdi - mdi) / denom

    # ADX: Wilder average of DX
    adx: List[Optional[float]] = [None] * n
    start = period * 2
    # first ADX = average of DX over period after first DI window
    dx_window = [d for d in dx[period + 1 : start + 1] if d is not None]
    if len(dx_window) < period:
        return (adx, plus_di, minus_di)

    first_adx = sum(dx_window[:period]) / period
    adx[start] = first_adx
    prev = first_adx

    for i in range(start + 1, n):
        if dx[i] is None:
            continue
        prev = ((prev * (period - 1)) + dx[i]) / period
        adx[i] = prev

    return (adx, plus_di, minus_di)


def compute_latest_indicators(ohlc_rows: List[Dict]) -> Optional[Dict]:
    """
    Input rows: [{"timestamp": dt, "open":..., "high":..., "low":..., "close":..., "volume":...}, ...]
    Must be ascending by timestamp.
    Returns dict of latest indicator values.
    """
    if not ohlc_rows or len(ohlc_rows) < 30:
        return None

    closes = [float(r["close"]) for r in ohlc_rows]
    highs = [float(r["high"]) for r in ohlc_rows]
    lows = [float(r["low"]) for r in ohlc_rows]

    ema9 = _ema(closes, 9)
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

    # MACD signal is EMA(9) of macd_line where defined
    macd_values = [v if v is not None else 0.0 for v in macd_line]
    macd_signal = _ema(macd_values, 9)
    macd_hist: List[Optional[float]] = [None] * len(closes)
    for i in range(len(closes)):
        if macd_line[i] is None or macd_signal[i] is None:
            continue
        macd_hist[i] = float(macd_line[i]) - float(macd_signal[i])

    atr14 = _atr_wilder(highs, lows, closes, 14)
    adx14, plus_di14, minus_di14 = _adx_wilder(highs, lows, closes, 14)

    i = len(ohlc_rows) - 1
    last_ts = ohlc_rows[i]["timestamp"]

    return {
        "last_timestamp": last_ts,
        "ema_9": ema9[i],
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
    }


# ----------------------------
# DB helpers
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
        # legacy schema: no timeframe column, unique(symbol,timestamp)
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
    """
    We don't assume a unique constraint exists, so we do:
      DELETE existing (symbol,timeframe)
      INSERT new latest row
    """
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
                    ema_9, ema_21, ema_50, ema_200,
                    rsi_14,
                    macd, macd_signal, macd_hist,
                    adx_14, plus_di_14, minus_di_14,
                    atr_14
                ) VALUES (
                    :symbol, :timeframe, :last_timestamp,
                    :ema_9, :ema_21, :ema_50, :ema_200,
                    :rsi_14,
                    :macd, :macd_signal, :macd_hist,
                    :adx_14, :plus_di_14, :minus_di_14,
                    :atr_14
                )
                """
            ),
            {
                "symbol": symbol,
                "timeframe": timeframe,
                "last_timestamp": ind["last_timestamp"],
                "ema_9": ind["ema_9"],
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
                    logger.warning("[rate-limit] hit rate limit while ingesting %s %s. backing off %ss",
                                   symbol, timeframe, RATE_LIMIT_BACKOFF_SECONDS)
                    await asyncio.sleep(RATE_LIMIT_BACKOFF_SECONDS)
                    continue
                raise

            cleaned: List[Dict] = []
            for r in ohlc_rows:
                cleaned.append(
                    {
                        "symbol": symbol,
                        "timeframe": timeframe,
                        "timestamp": r["timestamp"],  # tz-aware UTC datetime
                        "open": r["open"],
                        "high": r["high"],
                        "low": r["low"],
                        "close": r["close"],
                        "volume": r.get("volume"),
                    }
                )

            # Sort, then drop “future” timestamps before writing
            cleaned.sort(key=lambda x: x["timestamp"])
            cleaned = _filter_future_rows(cleaned)

            n = await upsert_market_prices(cleaned, has_tf)

            if cleaned:
                logger.info(
                    "[ingest] %s %s rows=%d %s → %s",
                    symbol, timeframe, n, cleaned[0]["timestamp"], cleaned[-1]["timestamp"]
                )
            else:
                logger.info("[ingest] %s %s rows=0", symbol, timeframe)

            # ✅ Compute and store indicators from the same data we just fetched (no extra API calls)
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


async def main():
    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    timeframes = _parse_timeframes()

    td = TwelveDataService(
        api_key=settings.TWELVE_DATA_API_KEY,
        base_url=settings.TWELVE_DATA_BASE_URL,
    )

    logger.info(
        "Starting poll ingest worker: timeframes=%s poll=%ss limit=%s future_skew<=%ss",
        timeframes, POLL_SECONDS, LIMIT_PER_REQUEST, MAX_FUTURE_SKEW_SECONDS
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

