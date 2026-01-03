from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.db import AsyncSessionLocal
from app.core.jobs import FXRefreshJob, REFRESH_QUEUE_KEY
from app.core.rate_limit import RedisMinuteRateLimiter
from app.core.redis import get_redis_client
from app.models.fx_universe import FXUniverse
from app.models.market_prices import MarketPrice
from app.services.twelve_data import TwelveDataService


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("refresh_worker")

logging.getLogger("httpx").setLevel(logging.WARNING)

def normalize_symbol(sym: str) -> str:
    """
    DB stores canonical symbols like EURUSD.
    Job/provider may send EUR/USD.
    """
    s = (sym or "").strip().upper()
    return s.replace("/", "")


async def get_symbols_to_refresh(job: FXRefreshJob, db: AsyncSession) -> List[str]:
    if getattr(job, "symbols", None):
        return list(job.symbols)

    result = await db.execute(select(FXUniverse.symbol))
    return [r[0] for r in result.all()]


def get_required(payload: Dict[str, Any], key: str) -> Any:
    if key not in payload or payload[key] in (None, "", []):
        raise ValueError(f"Job missing required field '{key}': {payload}")
    return payload[key]


async def upsert_market_prices(
    db: AsyncSession,
    rows: List[Dict[str, Any]],
) -> int:
    """
    rows: list of dicts with keys:
      symbol, timeframe, timestamp, open, high, low, close, volume
    Uses ON CONFLICT (symbol, timeframe, timestamp) DO UPDATE.
    """
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

    result = await db.execute(stmt)
    # asyncpg doesn't always give rowcount reliably on upserts, but we can approximate
    return len(rows)


async def process_job(
    job: FXRefreshJob,
    payload: Dict[str, Any],
    db: AsyncSession,
    limiter: RedisMinuteRateLimiter,
    td: TwelveDataService,
) -> None:
    timeframe = str(get_required(payload, "timeframe")).strip()
    limit = int(payload.get("limit") or 500)

    symbols = await get_symbols_to_refresh(job, db)
    if not symbols:
        logger.info("No symbols to refresh; payload=%s", payload)
        return

    for raw_symbol in symbols:
        canonical = normalize_symbol(raw_symbol)
        if not canonical:
            continue

        # 1 request per symbol per timeframe (cost=1)
        await limiter.acquire(cost=1)

        # Fetch OHLC (service handles: canonical->provider format, exchange="FX", url sanitization, interval mapping)
        ohlc_rows = await td.fetch_ohlc(
            symbol=canonical,
            timeframe=timeframe,
            limit=limit,
        )

        # Ensure rows are canonical + include timeframe
        cleaned: List[Dict[str, Any]] = []
        for r in ohlc_rows:
            cleaned.append(
                {
                    "symbol": canonical,
                    "timeframe": timeframe,
                    "timestamp": r["timestamp"],  # must be timezone-aware UTC datetime
                    "open": r["open"],
                    "high": r["high"],
                    "low": r["low"],
                    "close": r["close"],
                    "volume": r.get("volume"),
                }
            )

        n = await upsert_market_prices(db, cleaned)
        await db.commit()

        if cleaned:
            first_ts = cleaned[0]["timestamp"]
            last_ts = cleaned[-1]["timestamp"]
        else:
            first_ts = last_ts = None

        logger.info(
            "[ingest] %s %s rows=%d first_ts=%s last_ts=%s",
            canonical,
            timeframe,
            n,
            first_ts,
            last_ts,
        )


async def worker_loop(redis: Redis) -> None:
    limiter = RedisMinuteRateLimiter(
        redis=redis,
        key_prefix=settings.TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX,
        per_minute=settings.TWELVE_RATE_LIMIT_PER_MIN,
        safety_ratio=settings.TWELVE_RATE_LIMIT_SAFETY_RATIO,
        log_every_seconds=settings.TWELVE_RATE_LIMIT_LOG_EVERY_SECONDS,
    )

    td = TwelveDataService(
        api_key=settings.TWELVE_DATA_API_KEY,
        base_url=settings.TWELVE_DATA_BASE_URL,
    )

    logger.info("Starting refresh worker; listening on %s", REFRESH_QUEUE_KEY)
    logger.info(
        "Rate guard enabled: per_min=%s safety=%.2f redis_prefix=%s",
        settings.TWELVE_RATE_LIMIT_PER_MIN,
        settings.TWELVE_RATE_LIMIT_SAFETY_RATIO,
        settings.TWELVE_RATE_LIMIT_REDIS_KEY_PREFIX,
    )

    while True:
        _, raw = await redis.brpop(REFRESH_QUEUE_KEY)
        payload_str = raw

        try:
            payload = json.loads(payload_str)
        except Exception:
            logger.exception("Invalid JSON payload: %s", payload_str)
            continue

        try:
            job = FXRefreshJob.model_validate(payload)
        except Exception:
            logger.exception("Payload failed FXRefreshJob validation: %s", payload)
            continue

        try:
            async with AsyncSessionLocal() as db:
                await process_job(job, payload, db, limiter, td)
        except Exception:
            logger.exception("Job failed; payload=%s", payload_str)
            continue


async def main() -> None:
    redis = get_redis_client()
    await worker_loop(redis)


if __name__ == "__main__":
    asyncio.run(main())

