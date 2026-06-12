from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, Field


Direction = Literal["LONG", "SHORT"]
Session = Literal["LONDON", "NEW_YORK", "ASIAN", "OTHER"]
TradeStatus = Literal["OPEN", "CLOSED"]
EmotionalState = Literal["CALM", "NEUTRAL", "ANXIOUS", "EXCITED", "FEARFUL", "FRUSTRATED", "GREEDY"]


class TradeCreate(BaseModel):
    market: str = Field(..., min_length=1, max_length=150)
    direction: Direction
    entry_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    exit_price: Optional[Decimal] = None
    lot_size: Optional[Decimal] = None
    pnl: Optional[Decimal] = None
    rr: Optional[Decimal] = None
    risk_pct: Optional[Decimal] = None
    session: Optional[Session] = None
    status: TradeStatus = "CLOSED"
    confidence: Optional[int] = Field(None, ge=1, le=10)
    emotional_state: Optional[EmotionalState] = None
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    trade_date: date


class TradeUpdate(BaseModel):
    market: Optional[str] = Field(None, min_length=1, max_length=150)
    direction: Optional[Direction] = None
    entry_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    exit_price: Optional[Decimal] = None
    lot_size: Optional[Decimal] = None
    pnl: Optional[Decimal] = None
    rr: Optional[Decimal] = None
    risk_pct: Optional[Decimal] = None
    session: Optional[Session] = None
    status: Optional[TradeStatus] = None
    confidence: Optional[int] = Field(None, ge=1, le=10)
    emotional_state: Optional[EmotionalState] = None
    stress_level: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None
    trade_date: Optional[date] = None


class TradeOut(BaseModel):
    id: int
    user_id: int
    market: str
    direction: Direction
    entry_price: Optional[Decimal] = None
    stop_loss: Optional[Decimal] = None
    take_profit: Optional[Decimal] = None
    exit_price: Optional[Decimal] = None
    lot_size: Optional[Decimal] = None
    pnl: Optional[Decimal] = None
    rr: Optional[Decimal] = None
    risk_pct: Optional[Decimal] = None
    session: Optional[Session] = None
    status: TradeStatus
    confidence: Optional[int] = None
    emotional_state: Optional[EmotionalState] = None
    stress_level: Optional[int] = None
    notes: Optional[str] = None
    trade_date: date
    created_at: datetime
    updated_at: datetime

    # OrcaScreener snapshot
    orca_score: Optional[int] = None
    orca_status: Optional[str] = None
    orca_direction: Optional[str] = None
    market_phase: Optional[str] = None
    adx_at_entry: Optional[int] = None
    ema_aligned_at_entry: Optional[bool] = None
    intraday_bull_at_entry: Optional[int] = None
    daily_bull_at_entry: Optional[int] = None
    longterm_bull_at_entry: Optional[int] = None
    vol_score_at_entry: Optional[int] = None

    model_config = {"from_attributes": True}


class TradesPage(BaseModel):
    trades: list[TradeOut]
    total: int
    page: int
    page_size: int


class JournalStats(BaseModel):
    total_trades: int
    closed_trades: int
    open_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float           # 0.0–100.0
    avg_rr: Optional[float]   # None if no RR data
    profit_factor: Optional[float]  # None if no losses
    total_pnl: float
    avg_pnl: float
    best_trade_pnl: Optional[float]
    worst_trade_pnl: Optional[float]
    avg_confidence: Optional[float]
    avg_stress: Optional[float]


class CoachingSettings(BaseModel):
    journal_coaching_access: bool


class EquityPointOut(BaseModel):
    date: str
    daily_pnl: float
    cumulative_pnl: float


class BulkImportResult(BaseModel):
    imported: int
    skipped: int
    errors: list[str]


class OrcaScoreBucket(BaseModel):
    label: str          # e.g. "Strong (70-100)"
    range_min: int
    range_max: int
    trades: int
    win_rate: Optional[float]


class OrcaStatusStat(BaseModel):
    status: str         # ON | WATCH | OFF | Unknown
    trades: int
    win_rate: Optional[float]


class OrcaPhaseStat(BaseModel):
    phase: str
    trades: int
    win_rate: Optional[float]


class OrcaAnalytics(BaseModel):
    has_data: bool
    by_score: list[OrcaScoreBucket]
    by_status: list[OrcaStatusStat]
    by_phase: list[OrcaPhaseStat]
