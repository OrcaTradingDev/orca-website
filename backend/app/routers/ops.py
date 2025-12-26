from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.db import get_db
from app.core.redis import get_redis_client

router = APIRouter(tags=["ops"])

@router.get("/healthz")
async def healthz():
    """
        Liveness Probe - If the pod is down or not
    """
    return {"status" : "ok"}


@router.get("/readyz")
async def readyz(db: AsyncSession = Depends(get_db)):
    """
        Readiness Probe - If the external connections are active or not.
    """
    status_data = {
        "status" : "unknown",
        "database" : "unknown",
        "redis" : "unknown"
    }

    # Check Database

    try : 
        await db.execute(text("SELECT 1"))
        status_data["database"] = "connected"
    except Exception as e:
        # In production, log the actual error here (e.g. logger.error(e)) for now print()
        print(f" Database error: {e}")
        status_data["database"] = "disconnected"

    # Check redis

    try :
        redis = get_redis_client()
        if await redis.ping():
            status_data["redis"] = "connected"
        else:
            status_data["redis"] = "disconnected"

    except Exception as e:
        # In production, log the actual error here (e.g. logger.error(e)) for now print()
        print(f"Redis error : {e}")
        status_data["redis"] = "disconnected"

    # Now verify all services
    if status_data["database"] == "connected" and status_data["redis"] == "connected":
        status_data["status"] = "ready"
        return status_data

    # If status is not ready
    status_data["status"] = "not_ready"
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail=status_data
    )
