from __future__ import annotations

import asyncio
import random
import time
from dataclasses import dataclass

from redis.asyncio import Redis


@dataclass(slots=True)
class RedisMinuteRateLimiter:
    """
    Redis-backed per-minute rate limiter.

    - Uses a per-minute bucket key: <prefix>:<unix_minute>
    - INCRs atomically per request
    - EXPIRE keeps buckets from persisting
    - Sleeps until next minute when above cap, with jitter
    """

    redis: Redis
    key_prefix: str
    per_minute: int
    safety_ratio: float = 0.85
    bucket_ttl_seconds: int = 75
    log_every_seconds: int = 30

    _last_log_ts: float = 0.0

    def _bucket_key(self) -> str:
        minute_bucket = int(time.time() // 60)
        return f"{self.key_prefix}:{minute_bucket}"

    def _safe_cap(self) -> int:
        # Safety buffer so we stay away from the hard ceiling.
        cap = int(self.per_minute * self.safety_ratio)
        return max(1, cap)

    async def acquire(self, cost: int = 1) -> None:
        """
        Acquire capacity for one request (or `cost` units).
        If we exceed the safe cap, sleep until next minute bucket.
        """
        safe_cap = self._safe_cap()

        while True:
            key = self._bucket_key()

            # Atomic: increment and ensure expiry.
            pipe = self.redis.pipeline()
            pipe.incrby(key, cost)
            pipe.expire(key, self.bucket_ttl_seconds)
            used, _ = await pipe.execute()

            now = time.time()
            if (now - self._last_log_ts) >= self.log_every_seconds:
                self._last_log_ts = now
                print(
                    f"[rate] key={key} used={used}/{safe_cap} "
                    f"(hard={self.per_minute}, safety={self.safety_ratio:.2f})"
                )

            if used <= safe_cap:
                return

            # Over safe cap: sleep until next minute with small jitter.
            seconds_into_min = int(time.time() % 60)
            sleep_s = max(1, 60 - seconds_into_min) + random.uniform(0.05, 0.35)
            print(f"[rate] cap hit: used={used}/{safe_cap}. sleeping {sleep_s:.2f}s")
            await asyncio.sleep(sleep_s)

