from fastapi import FastAPI
from contextlib import asynccontextmanager
from sqlalchemy import text

from app.core.db import engine
from app.core.redis import get_redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # DB is required
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    print("Database connection successful.")

    # Redis is optional
    redis = await get_redis_client()
    if redis is None:
        print("Redis disabled/unavailable (continuing without it).")
        app.state.redis = None
    else:
        print("Redis connected (optional).")
        app.state.redis = redis

    yield

    # shutdown
    try:
        if getattr(app.state, "redis", None) is not None:
            await app.state.redis.aclose()
    except Exception:
        pass

    await engine.dispose()

