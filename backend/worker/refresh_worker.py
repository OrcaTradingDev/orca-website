from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import List

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import AsyncSessionLocal
from app.core.redis import get_redis_client
from app.core.jobs import FXRefreshJob, REFRESH_QUEUE_KEY
from app.models.fx_universe import FXUniverse
from app.models.market_prices import MarketPrice  # <- singular model


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("refresh_worker")


async def get_symbols_to_refresh(job: FXRefreshJob, db: AsyncSession) -> List[str]:
    """
    If the job specifies symbols, use those.
    Otherwise, refresh all symbols in fx_universe.
    """
    if job.symbols:
        return job.symbols

    result = await db.execute(FXUniverse.__table__.select())
    rows = result.mappings().all()
    return [row["symbol"] for row in rows]


async def process_job(job: FXRefreshJob, db: AsyncSession) -> None:
    """
    Phase-1 implementation:
    - For each symbol, insert a dummy OHLC row into market_prices.
    - This proves API -> Redis -> Worker -> Postgres end-to-end.
    """
    symbols = await get_symbols_to_refresh(job, db)
    if not symbols:
        logger.info("No symbols to refresh; job=%s", job.model_dump())
        return

    now = datetime.now(timezone.utc)

    for idx, symbol in enumerate(symbols):
        base = 1.0 + (idx * 0.001)

        mp = MarketPrice(
            symbol=symbol,
            timestamp=now,
            open=base,
            high=base * 1.002,
            low=base * 0.998,
            close=base * 1.001,
            volume=0,  # adjust/remove if your model doesn't have volume or has default
        )
        db.add(mp)

    await db.commit()
    logger.info("Inserted dummy prices for %d symbols", len(symbols))


async def worker_loop(redis: Redis) -> None:
    """
    Blocking loop:
    - Waits on jobs:screener:refresh
    - Parses FXRefreshJob
    - Processes it using an AsyncSession
    """
    logger.info("Starting refresh worker; listening on %s", REFRESH_QUEUE_KEY)

    while True:
        _, raw = await redis.brpop(REFRESH_QUEUE_KEY)
        payload = raw  # decode_responses=True => str

        try:
            data = json.loads(payload)
            job = FXRefreshJob.model_validate(data)
        except Exception:
            logger.exception("Failed to parse job payload: %s", payload)
            continue

        async with AsyncSessionLocal() as db:
            await process_job(job, db)


async def main() -> None:
    redis = get_redis_client()
    await worker_loop(redis)


if __name__ == "__main__":
    asyncio.run(main())

