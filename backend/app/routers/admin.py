from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, text as sa_text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import get_current_user
from app.core.db import get_db
from app.domain.config import ScreenerConfigData, invalidate_config_cache
from app.models.screener_config import ScreenerConfigModel
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


class SetAccessBody(BaseModel):
    access: bool


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "email": u.email,
            "name": u.name,
            "picture": u.picture,
            "screener_access": u.screener_access,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.patch("/users/{email}/screener-access")
async def set_screener_access(
    email: str,
    body: SetAccessBody,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.screener_access = body.access
    await db.commit()
    return {"email": email, "screener_access": body.access}


# ── Screener Config ───────────────────────────────────────────────────────────

@router.get("/screener-config", response_model=ScreenerConfigData)
async def get_screener_config(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
) -> ScreenerConfigData:
    """Return the active screener formula config (or all defaults if never saved)."""
    result = await db.execute(
        select(ScreenerConfigModel).where(ScreenerConfigModel.key == "active")
    )
    record = result.scalar_one_or_none()
    if record and record.config:
        try:
            return ScreenerConfigData.model_validate(record.config)
        except Exception:
            pass
    return ScreenerConfigData()


@router.put("/screener-config", response_model=ScreenerConfigData)
async def save_screener_config(
    body: ScreenerConfigData,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
) -> ScreenerConfigData:
    """Upsert the active screener formula config and bust the in-process cache."""
    stmt = (
        pg_insert(ScreenerConfigModel)
        .values(key="active", config=body.model_dump())
        .on_conflict_do_update(
            index_elements=["key"],
            set_={"config": body.model_dump(), "updated_at": sa_text("now()")},
        )
    )
    await db.execute(stmt)
    await db.commit()
    invalidate_config_cache()
    return body


@router.post("/screener-config/reset", response_model=ScreenerConfigData)
async def reset_screener_config(
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(require_admin),
) -> ScreenerConfigData:
    """Delete the saved config row — next request will use all factory defaults."""
    await db.execute(
        ScreenerConfigModel.__table__.delete().where(
            ScreenerConfigModel.key == "active"
        )
    )
    await db.commit()
    invalidate_config_cache()
    return ScreenerConfigData()
