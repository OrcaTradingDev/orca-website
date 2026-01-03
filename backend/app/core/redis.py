from __future__ import annotations

import os
from functools import lru_cache

from dotenv import load_dotenv
from redis.asyncio import Redis  # from `redis` package

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


@lru_cache
def get_redis_url() -> str:
    url = os.getenv("REDIS_URL")
    if not url:
        raise RuntimeError("REDIS_URL is not set in environment or .env")
    return url


@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(get_redis_url(), decode_responses=True)

