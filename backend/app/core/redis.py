import os
from typing import Optional

import redis.asyncio as redis

_redis_client: Optional[redis.Redis] = None


def _redis_url() -> Optional[str]:
    url = os.getenv("REDIS_URL", "").strip()
    return url or None


async def get_redis_client() -> Optional[redis.Redis]:
    """
    Redis is OPTIONAL.
    - If REDIS_URL is not set -> None
    - If Redis is unreachable -> None
    - Otherwise -> cached Redis client
    """
    global _redis_client

    url = _redis_url()
    if not url:
        return None

    # Reuse a cached client if present
    if _redis_client is not None:
        try:
            await _redis_client.ping()
            return _redis_client
        except Exception:
            _redis_client = None  # stale client; recreate

    try:
        client = redis.from_url(url, decode_responses=True)
        await client.ping()
        _redis_client = client
        return _redis_client
    except Exception:
        _redis_client = None
        return None

