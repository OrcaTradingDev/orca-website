# app/schemas/screener.py
from typing import List, Literal
from pydantic import BaseModel, Field

# --- Type Definitions ---
TrendDir = Literal["up", "down", "flat"]

# --- Pydantic Models ---
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
    longterm: TrendBreakdown
    advanced: AdvancedMetrics

class ScreenerPage(BaseModel):
    rows: List[ScreenerRow]
    page: int = Field(..., alias="page")
    page_size: int = Field(..., alias="pageSize")
    total: int
    last_updated: str = Field(..., alias="lastUpdated")

    class Config:
        populate_by_name = True
