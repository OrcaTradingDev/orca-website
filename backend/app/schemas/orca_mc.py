"""
API schemas for the Orca MC v3.0 engine port (Phase A, no POI).
See app/domain/orca_mc.py for the computation; this file is purely the
shape exposed over /screener/symbol/{symbol}/detail.

Status/category fields use plain `str` rather than Literal — the actual
values are already constrained by the domain logic in orca_mc.py, and a
typo'd Literal here would 500 the whole detail endpoint rather than just
being wrong, which is a worse failure mode for a first port.
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel


class ScoreBreakdown(BaseModel):
    p_htf: int
    p_adx: int
    p_ema: int
    p_phase: int
    p_vol: int
    cap_htf: int = 25
    cap_adx: int = 20
    cap_ema: int = 20
    cap_phase: int = 20
    cap_vol: int = 15
    orca_score: int
    score_qual: str  # "Excellent" | "Good" | "Caution" | "Poor"


class NextTrigger(BaseModel):
    c1_label: str
    c1_met: bool
    c2_label: str
    c2_met: bool
    c3_label: str
    c3_met: bool
    c4_label: str
    c4_met: bool
    met_count: int
    result: str


class Readiness(BaseModel):
    score: int
    tier: str  # "Near Activation" | "Building" | "Developing" | "Low"
    reason: str
    expected_next: str


class Suitability(BaseModel):
    rating: str  # "Excellent" | "Good" | "Average" | "Avoid" | "Poor"
    reason: str


class Confidence(BaseModel):
    score: int
    tier: str  # "High" | "Medium" | "Low"


class OpportunityTimelineStep(BaseModel):
    state: str
    is_current: bool
    is_next: bool


class MTFAlignmentOut(BaseModel):
    bull_count: int
    bear_count: int
    align_str: str


class OrcaMarketConditions(BaseModel):
    """Pine 'OrcaTrading Market Conditions v3.0' port — Phase A (no POI engine)."""

    phase: str
    trend_struct: str
    pb_status: str
    mtf: MTFAlignmentOut
    score: ScoreBreakdown
    status: str  # "ON LONG" | "ON SHORT" | "WATCH LONG" | "WATCH SHORT" | "CAUTION" | "OFF"
    pref_dir: str  # "LONG" | "SHORT" | "NEUTRAL"
    next_trigger: NextTrigger
    readiness: Readiness
    suitability: Suitability
    confidence: Confidence
    why: List[str]
    opportunity_timeline: List[OpportunityTimelineStep]
    poi_pending: bool = True
    status_since: Optional[str] = None
