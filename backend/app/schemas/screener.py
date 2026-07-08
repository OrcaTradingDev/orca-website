# app/schemas/screener.py
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

from app.schemas.orca_mc import OrcaMarketConditions, OrcaMCRowSummary

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
    # The Status/Score/Align columns now prefer this over `signals` — see
    # PremiumScreenerSection.tsx. `signals` stays for is_best fallback and
    # because intraday/daily/longterm/advanced are still its data.
    orca_mc: Optional[OrcaMCRowSummary] = None

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

class MagnetTarget(BaseModel):
    structure_type: str       # 'fvg_bull', 'fvg_bear', 'session_high', 'session_low'
    price_top: float
    price_bottom: float
    timeframe: str            # '4h', '1day', 'session'
    atr_distance: Optional[float] = None
    magnitude: Optional[float] = None
    formed_at: str            # ISO timestamp

class SymbolDetail(BaseModel):
    symbol: str
    name: str
    timeframes: List[TimeframeBar]
    signals: OrcaSignals
    advanced: AdvancedMetrics
    orca_mc: Optional[OrcaMarketConditions] = None
    magnet_above: Optional[MagnetTarget] = None
    magnet_below: Optional[MagnetTarget] = None
    magnet_structures: List[MagnetTarget] = []  # all unfilled structures, sorted by atr_distance
    magnet_bias: Optional[float] = None          # -100 (max downside pull) to +100 (max upside pull)

class CandleOut(BaseModel):
    time: int   # Unix seconds
    open: float
    high: float
    low: float
    close: float

class CandlesResponse(BaseModel):
    candles: List[CandleOut]
