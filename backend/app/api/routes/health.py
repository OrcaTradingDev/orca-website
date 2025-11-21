from fastapi import APIRouter
from app.common.responses import ok

router = APIRouter()

@router.get("", summary="Liveness/Readiness")
def healthz():
    # Add DB/Redis pings later if desired
    return ok(message="healthy")

