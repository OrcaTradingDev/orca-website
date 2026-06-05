import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.core.db import engine
from app.core.redis import get_redis_client
from app.services.alert_checker import alert_checker_loop


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

    # Background alert checker (every 5 minutes)
    alert_task = asyncio.create_task(alert_checker_loop())
    print("Alert checker background task started.")

    yield

    # shutdown
    alert_task.cancel()
    try:
        await alert_task
    except asyncio.CancelledError:
        pass

    try:
        if getattr(app.state, "redis", None) is not None:
            await app.state.redis.aclose()
    except Exception:
        pass

    await engine.dispose()

