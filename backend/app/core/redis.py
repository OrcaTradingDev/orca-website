from __future__ import annotations

# Standard library
from functools import lru_cache

# Third-party
from redis.asyncio import Redis

# Local application
from app.core.config import settings


@lru_cache
def get_redis_url() -> str:
    url = settings.REDIS_URL
    if not url:
        raise RuntimeError("REDIS_URL is not set in environment or .env")
    return url


@lru_cache
def get_redis_client() -> Redis:
    return Redis.from_url(get_redis_url(), decode_responses=True)

