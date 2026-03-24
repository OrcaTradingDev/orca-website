from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import logging

from app.core.db import get_db
from app.core.redis import get_redis_client

router = APIRouter(tags=["ops"])

logger = logging.getLogger(__name__)


@router.get("/healthz")
async def healthz():
    """
    Liveness Probe - process is up.
    """
    logger.debug("Liveness check called")
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(db: AsyncSession = Depends(get_db)):
    """
    Readiness Probe - external dependencies.
    Intent (no-redis-yet):
      - Database is REQUIRED
      - Redis is OPTIONAL (report status, but do not block readiness)
    """
    logger.info("Readiness check started")

    status_data = {
        "status": "unknown",
        "database": "unknown",
        "redis": "unknown",
    }

    # --- Check Database (required) ---
    try:
        await db.execute(text("SELECT 1"))
        status_data["database"] = "connected"
        logger.debug("Database connection successful")
    except Exception:
        status_data["database"] = "disconnected"
        logger.exception("Database error")

    # --- Check Redis (optional) ---
    try:
        redis = await get_redis_client()
        if redis is None:
            # REDIS_URL not set or redis unreachable, but that's OK for now
            status_data["redis"] = "disabled"
            logger.debug("Redis is disabled or not configured")
        else:
            ok = await redis.ping()
            status_data["redis"] = "connected" if ok else "disconnected"
            logger.debug("Redis ping result: %s", status_data["redis"])
    except Exception:
        # Never fail readiness due to Redis in no-redis mode
        status_data["redis"] = "disabled"
        logger.exception("Redis error (ignored)")

    # --- Decide readiness ---
    if status_data["database"] == "connected":
        status_data["status"] = "ready"
        logger.info("Service is READY", extra={"status": status_data})
        return status_data

    status_data["status"] = "not_ready"
    logger.error("Service is NOT READY", extra={"status": status_data})

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=status_data,
    )
