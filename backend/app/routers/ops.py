from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.db import get_db
from app.core.redis import get_redis_client

router = APIRouter(tags=["ops"])


@router.get("/healthz")
async def healthz():
    """
    Liveness Probe - process is up.
    """
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(db: AsyncSession = Depends(get_db)):
    """
    Readiness Probe - external dependencies.
    Intent (no-redis-yet):
      - Database is REQUIRED
      - Redis is OPTIONAL (report status, but do not block readiness)
    """
    status_data = {
        "status": "unknown",
        "database": "unknown",
        "redis": "unknown",
    }

    # --- Check Database (required) ---
    try:
        await db.execute(text("SELECT 1"))
        status_data["database"] = "connected"
    except Exception as e:
        print(f"Database error: {e}")
        status_data["database"] = "disconnected"

    # --- Check Redis (optional) ---
    try:
        redis = await get_redis_client()
        if redis is None:
            # REDIS_URL not set or redis unreachable, but that's OK for now
            status_data["redis"] = "disabled"
        else:
            ok = await redis.ping()
            status_data["redis"] = "connected" if ok else "disconnected"
    except Exception as e:
        # Never fail readiness due to Redis in no-redis mode
        print(f"Redis error: {e}")
        status_data["redis"] = "disabled"

    # --- Decide readiness ---
    if status_data["database"] == "connected":
        status_data["status"] = "ready"
        return status_data

    status_data["status"] = "not_ready"
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=status_data,
    )

