#!/usr/bin/env python3
import asyncio
import json
import os
from redis.asyncio import Redis

QUEUE_KEY = os.getenv("REFRESH_QUEUE_KEY", "jobs:screener:refresh")

"""
Stress-enqueue many refresh jobs quickly.

Usage:
  python backend/scripts/stress_enqueue_refresh.py

Optional env:
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_DB=0
  QUEUE_KEY=jobs:screener:refresh
  JOBS=50
  SYMBOLS_PER_JOB=25
  TIMEFRAME=1d
  LIMIT=500
"""

def make_symbols(n: int):
    # Use FX provider format if that’s what your worker expects.
    # If your current job schema expects "EURUSD" etc, change these.
    return [f"EUR/USD" for _ in range(n)]

async def main():
    host = os.getenv("REDIS_HOST", "localhost")
    port = int(os.getenv("REDIS_PORT", "6379"))
    db = int(os.getenv("REDIS_DB", "0"))

    jobs = int(os.getenv("JOBS", "30"))
    symbols_per_job = int(os.getenv("SYMBOLS_PER_JOB", "20"))
    timeframe = os.getenv("TIMEFRAME", "1d")
    limit = int(os.getenv("LIMIT", "500"))

    r = Redis(host=host, port=port, db=db, decode_responses=True)

    payloads = []
    for _ in range(jobs):
        payloads.append(
            json.dumps(
                {
                    "symbols": make_symbols(symbols_per_job),
                    "timeframe": timeframe,
                    "limit": limit,
                }
            )
        )

    # Push all jobs as fast as possible
    await r.rpush(QUEUE_KEY, *payloads)
    await r.aclose()

    print(
        f"Enqueued {jobs} jobs to {QUEUE_KEY} "
        f"({symbols_per_job} symbols/job; timeframe={timeframe}; limit={limit})"
    )

if __name__ == "__main__":
    asyncio.run(main())

