# backend/worker/poll_ingest_worker.py
from __future__ import annotations

import asyncio
import logging
import os
import signal
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select
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
    # Comma-separated list, e.g. "5min,30min,1h,4h,1day"
    raw = os.getenv("INGEST_TIMEFRAMES", "15min,1day")
    return [t.strip() for t in raw.split(",") if t.strip()]


POLL_SECONDS = int(os.getenv("INGEST_POLL_SECONDS", "60"))
LIMIT_PER_REQUEST = int(os.getenv("INGEST_LIMIT", "500"))

# If TwelveData rate-limits, we back off briefly (and keep the worker alive)
RATE_LIMIT_BACKOFF_SECONDS = int(os.getenv("INGEST_RATE_LIMIT_BACKOFF_SECONDS", "20"))


def normalize_symbol(sym: str) -> str:
    return (sym or "").strip().upper().replace("/", "")


def should_fetch_timeframe(timeframe: str, now_utc: datetime) -> bool:
    """
    Keep the worker loop at 60s, but only fetch a timeframe when a *new candle could exist*.
    Also offset minutes to avoid multiple timeframes firing on the same minute.

    Offsets chosen:
      5min  -> minute % 5  == 1
      30min -> minute % 30 == 2
      1h    -> minute == 3
      4h    -> hour % 4 == 0 and minute == 4
      1day  -> hour == 0 and minute == 5   (UTC midnight + 5 min)
    """
    m = now_utc.minute
    h = now_utc.hour

    tf = timeframe.strip().lower()

    if tf == "5min":
        return m % 5 == 1
    if tf == "30min":
        return m % 30 == 2
    if tf in ("1h", "60min"):
        return m == 3
    if tf == "4h":
        return (h % 4 == 0) and (m == 4)
    if tf in ("1day", "1d", "daily"):
        return (h == 0) and (m == 5)

    # For any other timeframe string, default to fetching every loop (not recommended).
    return True


async def upsert_market_prices(rows) -> int:
    if not rows:
        return 0

    stmt = insert(MarketPrice).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["symbol", "timeframe", "timestamp"],
        set_={
            "open": stmt.excluded.open,
            "high": stmt.excluded.high,
            "low": stmt.excluded.low,
            "close": stmt.excluded.close,
            "volume": stmt.excluded.volume,
        },
    )

    async with AsyncSessionLocal() as db:
        await db.execute(stmt)
        await db.commit()

    return len(rows)


async def fetch_symbols() -> List[str]:
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(FXUniverse.symbol))
        return [normalize_symbol(r[0]) for r in result.all()]


def _looks_like_rate_limit(exc: Exception) -> bool:
    """
    TwelveDataService may raise different exception types depending on implementation.
    We catch and detect common rate-limit signals without tightly coupling.
    """
    msg = str(exc).lower()
    return any(s in msg for s in ("429", "rate limit", "too many requests", "too_many_requests"))


async def ingest_timeframe(td: TwelveDataService, timeframe: str, symbols: List[str]) -> None:
    """
    Fetch + upsert one timeframe across all symbols.
    """
    for symbol in symbols:
        ohlc_rows = await td.fetch_ohlc(symbol=symbol, timeframe=timeframe, limit=LIMIT_PER_REQUEST)

        cleaned = [
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
            for r in ohlc_rows
        ]

        n = await upsert_market_prices(cleaned)
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


async def ingest_once(td: TwelveDataService, timeframes: List[str]) -> None:
    symbols = await fetch_symbols()
    if not symbols:
        logger.info("No symbols in fx_universe yet. Seed it first.")
        return

    now = datetime.now(timezone.utc)
    due_timeframes = [tf for tf in timeframes if should_fetch_timeframe(tf, now)]

    if not due_timeframes:
        logger.info("[tick] no timeframes due at %s", now.isoformat())
        return

    # Process due timeframes sequentially to control call rate spikes.
    for timeframe in due_timeframes:
        if shutdown_event.is_set():
            return

        try:
            logger.info("[tick] ingesting timeframe=%s at %s", timeframe, now.isoformat())
            await ingest_timeframe(td, timeframe, symbols)
        except Exception as e:
            if _looks_like_rate_limit(e):
                logger.warning(
                    "[rate-limit] hit rate limit while ingesting %s. backing off %ss",
                    timeframe,
                    RATE_LIMIT_BACKOFF_SECONDS,
                )
                # Back off but stay responsive to shutdown.
                try:
                    await asyncio.wait_for(shutdown_event.wait(), timeout=RATE_LIMIT_BACKOFF_SECONDS)
                except asyncio.TimeoutError:
                    pass
                # After backoff, continue to next timeframe (or next loop)
                continue

            # Non-rate-limit errors: log and continue loop.
            logger.exception("Error ingesting timeframe=%s", timeframe)


async def main():
    signal.signal(signal.SIGTERM, _handle_signal)
    signal.signal(signal.SIGINT, _handle_signal)

    timeframes = _parse_timeframes()

    td = TwelveDataService(
        api_key=settings.TWELVE_DATA_API_KEY,
        base_url=settings.TWELVE_DATA_BASE_URL,
    )

    logger.info(
        "Starting poll ingest worker: timeframes=%s poll=%ss limit=%s rate_limit_backoff=%ss",
        timeframes,
        POLL_SECONDS,
        LIMIT_PER_REQUEST,
        RATE_LIMIT_BACKOFF_SECONDS,
    )

    while not shutdown_event.is_set():
        try:
            await ingest_once(td, timeframes)
        except Exception:
            logger.exception("Ingest loop error")

        # Sleep, but wake early if shutting down.
        try:
            await asyncio.wait_for(shutdown_event.wait(), timeout=POLL_SECONDS)
        except asyncio.TimeoutError:
            pass

    logger.info("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())

