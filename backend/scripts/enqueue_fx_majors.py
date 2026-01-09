# backend/scripts/enqueue_fx_majors.py
import asyncio
import json

from redis.asyncio import Redis

from app.domain.universe import FX_MAJORS, LAUNCH_TIMEFRAMES
from app.core.jobs import REFRESH_QUEUE_KEY


async def main():
    r = Redis(host="localhost", port=6379, decode_responses=True)

    jobs = []
    for symbol in FX_MAJORS:
        for tf in LAUNCH_TIMEFRAMES:
            jobs.append(
                json.dumps(
                    {
                        "symbols": [symbol],   # canonical form (EURUSD)
                        "timeframe": tf,
                        "limit": 500,
                    }
                )
            )

    await r.rpush(REFRESH_QUEUE_KEY, *jobs)
    await r.aclose()

    print(
        f"Enqueued {len(jobs)} jobs "
        f"({len(FX_MAJORS)} FX majors × {len(LAUNCH_TIMEFRAMES)} timeframes)"
    )


if __name__ == "__main__":
    asyncio.run(main())

