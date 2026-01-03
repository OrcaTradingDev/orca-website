from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.redis import get_redis_client
from app.core.jobs import FXRefreshJob, REFRESH_QUEUE_KEY
from app.models.fx_universe import FXUniverse

router = APIRouter(prefix="/screener", tags=["screener"])


# -----------------------
# Pydantic response models
# -----------------------

TrendDir = Literal["up", "down", "flat"]


class TrendBreakdown(BaseModel):
    bear: int = Field(..., ge=0, le=100)
    bull: int = Field(..., ge=0, le=100)


class AdvancedMetrics(BaseModel):
    adx: int = Field(..., ge=0, le=100)
    adx_dir: TrendDir
    ema: str
    vol: int = Field(..., ge=0, le=100)
    alert: bool


class ScreenerRow(BaseModel):
    symbol: str
    name: str
    intraday: TrendBreakdown
    daily: TrendBreakdown
    advanced: AdvancedMetrics


class ScreenerPage(BaseModel):
    rows: List[ScreenerRow]
    page: int = Field(..., alias="page")
    page_size: int = Field(..., alias="pageSize")
    total: int
    last_updated: str = Field(..., alias="lastUpdated")

    class Config:
        populate_by_name = True


# -----------------------
# Helpers
# -----------------------

def _stub_metrics_for_symbol(symbol: str, name: str) -> ScreenerRow:
    """
    Temporary stub metrics so the frontend has real-looking data,
    but rows are driven by what's actually in fx_universe.

    Replace this later with real metrics that read market_prices/metrics tables.
    """
    base = sum(ord(c) for c in symbol)  # deterministic "randomness"

    intraday_bull = 50 + (base % 25)   # 50–74
    intraday_bear = 100 - intraday_bull

    daily_bull = 40 + (base % 40)      # 40–79
    daily_bear = 100 - daily_bull

    adx = 20 + (base % 60)             # 20–79
    vol = 30 + (base % 50)             # 30–79

    if adx > 55:
        adx_dir: TrendDir = "up"
    elif adx < 35:
        adx_dir = "down"
    else:
        adx_dir = "flat"

    ema_state = "aligned" if intraday_bull > 55 else "mixed"
    alert_flag = intraday_bull > 65 or adx > 60

    return ScreenerRow(
        symbol=symbol,
        name=name,
        intraday=TrendBreakdown(
            bear=intraday_bear,
            bull=intraday_bull,
        ),
        daily=TrendBreakdown(
            bear=daily_bear,
            bull=daily_bull,
        ),
        advanced=AdvancedMetrics(
            adx=adx,
            adx_dir=adx_dir,
            ema=ema_state,
            vol=vol,
            alert=alert_flag,
        ),
    )


# -----------------------
# Routes
# -----------------------


@router.get("/rows", response_model=ScreenerPage)
async def get_screener_rows(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500, alias="pageSize"),
    search: Optional[str] = Query(
        None,
        description="Optional search by symbol or name",
    ),
    db: AsyncSession = Depends(get_db),
) -> ScreenerPage:
    """
    Return paginated screener rows backed by fx_universe.

    Metrics are stubbed but deterministic per symbol for now.
    """
    offset = (page - 1) * page_size

    base_query = select(FXUniverse)

    if search:
        like = f"%{search.upper()}%"
        base_query = base_query.where(
            func.upper(FXUniverse.symbol).like(like)
            | func.upper(FXUniverse.name).like(like)
        )

    # total count
    count_stmt = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    # page query
    stmt = (
        base_query
        .order_by(FXUniverse.symbol.asc())
        .offset(offset)
        .limit(page_size)
    )
    result = await db.execute(stmt)
    symbols = result.scalars().all()

    rows: List[ScreenerRow] = [
        _stub_metrics_for_symbol(sym.symbol, sym.name) for sym in symbols
    ]

    return ScreenerPage(
        rows=rows,
        page=page,
        page_size=page_size,
        total=total,
        last_updated=datetime.now(timezone.utc).isoformat(),
    )


@router.post("/refresh")
async def refresh_now(
    symbols: Optional[List[str]] = Query(
        default=None,
        description="Optional list of symbols to refresh (e.g. symbols=EURUSD&symbols=GBPUSD)",
    ),
):
    """
    Enqueue a refresh job into Redis.

    refresh_worker.py should consume from jobs:screener:refresh and
    write into market_prices.
    """
    job = FXRefreshJob(symbols=symbols)

    redis = get_redis_client()
    try:
        # worker.brpop(...) expects a list; we LPUSH jobs onto it
        await redis.lpush(REFRESH_QUEUE_KEY, job.model_dump_json())
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to enqueue refresh job: {exc!s}",
        )

    return {"status": "queued", "kind": job.kind, "symbols": job.symbols}

