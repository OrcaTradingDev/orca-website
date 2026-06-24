# app/schemas/screener.py
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

# --- Type Definitions ---
TrendDir = Literal["up", "down", "flat"]
OrcaStatus = Literal["ON", "WATCH", "OFF"]
OrcaDirection = Literal["LONG ONLY", "SHORT ONLY", "WATCH LONG", "WATCH SHORT", "FLAT"]
MarketPhase = Literal["Compression", "Expansion", "Healthy Trend", "Pullback", "Continuation", "Exhaustion", "Chop"]
PullbackType = Literal["Shallow", "Healthy", "Deep", "Failed"]

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

class OrcaSignals(BaseModel):
    status: OrcaStatus
    direction: OrcaDirection
    market_phase: MarketPhase
    pullback: Optional[PullbackType] = None
    orca_score: int = Field(..., ge=0, le=100)
    is_best: bool = False
    status_since: Optional[str] = None  # ISO timestamp — when status/direction last changed

class ScreenerRow(BaseModel):
    symbol: str
    name: str
    intraday: TrendBreakdown
    daily: TrendBreakdown
    longterm: TrendBreakdown
    advanced: AdvancedMetrics
    signals: OrcaSignals
    sparkline: List[float] = Field(default_factory=list)  # last 30 1H closes, chronological

class ScreenerPage(BaseModel):
    rows: List[ScreenerRow]
    page: int = Field(..., alias="page")
    page_size: int = Field(..., alias="pageSize")
    total: int
    last_updated: str = Field(..., alias="lastUpdated")

    class Config:
        populate_by_name = True

# --- Detail endpoint schemas ---
class TimeframeBar(BaseModel):
    timeframe: str   # raw key e.g. "5min"
    label: str       # display e.g. "5M"
    bull: int
    bear: int
    score: float

class SymbolDetail(BaseModel):
    symbol: str
    name: str
    timeframes: List[TimeframeBar]
    signals: OrcaSignals
    advanced: AdvancedMetrics
