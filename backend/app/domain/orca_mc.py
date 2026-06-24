"""
OrcaTrading Market Conditions v3.0 — backend port (Phase A, no POI engine).

Ported from the founder's TradingView Pine Script source. This is a
DIFFERENT math system than app/domain/signals.py (which is our existing
bull%/bear%-weighted EMA/RSI/MACD blend) — EMA(20/50/200) stacking +
ADX/DI + ATR-vs-its-own-moving-average, evaluated on a "current" (LTF)
timeframe plus a higher timeframe (HTF). Purely additive: does not touch
OrcaSignals/build_signals or anything currently driving the main table.

Timeframe mapping (see plan doc for the full caveat): LTF/current=5min,
HTF=1h, MTF panel=5min/30min/1h/4h.

POI (supply/demand zone) engine is intentionally NOT implemented yet.
Every place its absence changes a Pine formula is marked with a comment
citing the relevant Pine source line numbers, rather than approximated.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel, Field


# ── Config (admin-tunable, mirrors ScreenerConfigData's pattern) ───────────────

class OrcaMCConfig(BaseModel):
    ema_fast: int = Field(default=20, ge=2, le=100)
    ema_mid: int = Field(default=50, ge=10, le=200)
    ema_slow: int = Field(default=200, ge=20, le=400)

    adx_period: int = Field(default=14, ge=1, le=50)
    adx_thresh: int = Field(default=22, ge=5, le=60)
    adx_vstrong: int = Field(default=35, ge=20, le=80)
    di_sep_min: float = Field(default=5.0, ge=1.0, le=30.0)

    atr_period: int = Field(default=14, ge=1, le=50)
    atr_ma_len: int = Field(default=20, ge=5, le=100)
    atr_ext_mult: float = Field(default=1.8, ge=1.0, le=5.0)
    comp_mult: float = Field(default=0.85, ge=0.3, le=1.0)

    on_thresh: int = Field(default=70, ge=40, le=100)
    watch_thresh: int = Field(default=45, ge=20, le=90)

    cap_htf: int = Field(default=25, ge=0, le=100)
    cap_adx: int = Field(default=20, ge=0, le=100)
    cap_ema: int = Field(default=20, ge=0, le=100)
    cap_phase: int = Field(default=20, ge=0, le=100)
    cap_vol: int = Field(default=15, ge=0, le=100)


_DEFAULT_CFG = OrcaMCConfig()


# ── Step results (internal pipeline objects, not API schemas) ──────────────────

@dataclass
class BooleanChain:
    htf_bull: bool
    htf_bear: bool
    htf_neut: bool
    ltf_bull: bool
    ltf_bear: bool
    ema_full_bull: bool
    ema_full_bear: bool
    ema_flat: bool
    adx_strong: bool
    adx_very_strong: bool
    adx_rising: bool
    adx_falling: bool
    di_conf_bull: bool
    di_conf_bear: bool
    di_sep: float
    atr_exp: bool
    vol_extreme: bool
    vol_compr: bool
    vol_state: str
    clean_candles: bool
    choppy_candles: bool
    body_ratio: float
    recent_overlap: int
    adx_value: float


@dataclass
class PhaseResult:
    phase: str
    trend_struct: str
    pb_status: str
    is_exhaustion: bool
    is_expansion: bool
    is_cont: bool
    is_pb: bool
    is_comp_final: bool
    is_chop: bool


@dataclass
class MTFAlignment:
    bull_count: int
    bear_count: int
    align_str: str


@dataclass
class ScoreResult:
    p_htf: int
    p_adx: int
    p_ema: int
    p_phase: int
    p_vol: int
    orca_score: int
    score_qual: str


@dataclass
class StatusResult:
    orca_status: str
    pref_dir: str


@dataclass
class TriggerResult:
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


@dataclass
class SuitabilityResult:
    rating: str
    reason: str


@dataclass
class ConfidenceResult:
    score: int
    tier: str


@dataclass
class ReadinessResult:
    score: int
    tier: str
    reason: str


@dataclass
class OrcaMCInputs:
    ltf_close: float
    ltf_ema20: Optional[float]
    ltf_ema50: Optional[float]
    ltf_ema200: Optional[float]
    ltf_candles: List[Tuple[float, float, float, float]]  # (open,high,low,close) ascending, need >=4

    htf_close: float
    htf_ema20: Optional[float]
    htf_ema50: Optional[float]
    htf_ema200: Optional[float]
    htf_ema20_prev2: Optional[float]

    adx_value: Optional[float]
    adx_prev: Optional[float]
    plus_di: Optional[float]
    minus_di: Optional[float]
    atr_value: Optional[float]
    atr_sma20: Optional[float]

    mtf_biases: List[int]  # [5min, 30min, 1h, 4h], each -1/0/1

    ltf_last_timestamp: Optional[datetime] = None
    htf_last_timestamp: Optional[datetime] = None


@dataclass
class OrcaMCResult:
    chain: BooleanChain
    phase: PhaseResult
    mtf: MTFAlignment
    score: ScoreResult
    status: StatusResult
    trigger: TriggerResult
    suitability: SuitabilityResult
    confidence: ConfidenceResult
    readiness: ReadinessResult
    expected_next: str
    why_bullets: List[str]
    opportunity_timeline: List[Dict[str, Any]]
    long_side_focus: bool
    ltf_last_timestamp: Optional[datetime]
    htf_last_timestamp: Optional[datetime]
    poi_pending: bool = True


# ── Step 0: candle quality (bodyRatio / recentOverlap) ──────────────────────────

def _compute_candle_quality(candles: List[Tuple[float, float, float, float]]) -> Tuple[float, int]:
    """candles = list of (open, high, low, close), ascending; needs >= 4 bars."""
    if len(candles) < 4:
        return (0.0, 3)  # insufficient data -> treat conservatively as choppy

    o, h, l, c = candles[-1]
    rng = h - l
    body_ratio = abs(c - o) / rng if rng > 0 else 0.0

    def overlap_at(idx: int) -> bool:
        o_i, _, _, c_i = candles[idx]
        o_p, _, _, c_p = candles[idx - 1]
        return min(c_i, o_i) < max(c_p, o_p) and max(c_i, o_i) > min(c_p, o_p)

    n = len(candles)
    recent_overlap = sum(1 for k in range(3) if overlap_at(n - 1 - k))
    return (body_ratio, recent_overlap)


# ── Step 1: boolean chain ────────────────────────────────────────────────────────

def compute_boolean_chain(
    *,
    ltf_close: float,
    ltf_ema20: Optional[float], ltf_ema50: Optional[float], ltf_ema200: Optional[float],
    htf_close: float,
    htf_ema20: Optional[float], htf_ema50: Optional[float], htf_ema200: Optional[float],
    htf_ema20_prev2: Optional[float],
    adx_value: Optional[float], adx_prev: Optional[float],
    plus_di: Optional[float], minus_di: Optional[float],
    atr_value: Optional[float], atr_sma20: Optional[float],
    ltf_candles: List[Tuple[float, float, float, float]],
    cfg: OrcaMCConfig,
) -> BooleanChain:
    adx_value = adx_value or 0.0
    plus_di = plus_di or 0.0
    minus_di = minus_di or 0.0
    atr_value = atr_value or 0.0
    atr_sma20 = atr_sma20 or 0.0

    htf_mom_up = htf_ema20 is not None and htf_ema20_prev2 is not None and htf_ema20 > htf_ema20_prev2
    htf_mom_dn = htf_ema20 is not None and htf_ema20_prev2 is not None and htf_ema20 < htf_ema20_prev2

    htf_stack_bull = htf_ema20 is not None and htf_ema50 is not None and htf_ema200 is not None and \
        htf_close > htf_ema20 and htf_ema20 > htf_ema50 and htf_ema50 > htf_ema200
    htf_stack_bear = htf_ema20 is not None and htf_ema50 is not None and htf_ema200 is not None and \
        htf_close < htf_ema20 and htf_ema20 < htf_ema50 and htf_ema50 < htf_ema200

    htf_bull = htf_stack_bull and htf_mom_up
    htf_bear = htf_stack_bear and htf_mom_dn
    htf_neut = not htf_bull and not htf_bear

    ltf_bull = ltf_ema20 is not None and ltf_ema50 is not None and ltf_close > ltf_ema20 and ltf_ema20 > ltf_ema50
    ltf_bear = ltf_ema20 is not None and ltf_ema50 is not None and ltf_close < ltf_ema20 and ltf_ema20 < ltf_ema50

    ema_full_bull = ltf_ema20 is not None and ltf_ema50 is not None and ltf_ema200 is not None and \
        ltf_close > ltf_ema20 and ltf_ema20 > ltf_ema50 and ltf_ema50 > ltf_ema200
    ema_full_bear = ltf_ema20 is not None and ltf_ema50 is not None and ltf_ema200 is not None and \
        ltf_close < ltf_ema20 and ltf_ema20 < ltf_ema50 and ltf_ema50 < ltf_ema200
    ema_flat = ltf_ema20 is not None and ltf_ema50 is not None and \
        abs(ltf_ema20 - ltf_ema50) / max(ltf_ema50, 1e-9) < 0.0005

    adx_strong = adx_value >= cfg.adx_thresh
    adx_very_strong = adx_value >= cfg.adx_vstrong
    adx_rising = adx_prev is not None and adx_value > adx_prev
    adx_falling = adx_prev is not None and adx_value < adx_prev

    di_sep = abs(plus_di - minus_di)
    di_conf_bull = plus_di > minus_di and di_sep >= cfg.di_sep_min
    di_conf_bear = minus_di > plus_di and di_sep >= cfg.di_sep_min

    atr_exp = atr_value > atr_sma20
    vol_extreme = atr_value > atr_sma20 * cfg.atr_ext_mult
    vol_compr = atr_value < atr_sma20 * cfg.comp_mult
    vol_state = "Extreme" if vol_extreme else "Expanding" if atr_exp else "Contracting" if vol_compr else "Normal"

    body_ratio, recent_overlap = _compute_candle_quality(ltf_candles)
    clean_candles = body_ratio > 0.55 and recent_overlap <= 1
    choppy_candles = body_ratio < 0.35 or recent_overlap >= 3 or ema_flat

    return BooleanChain(
        htf_bull=htf_bull, htf_bear=htf_bear, htf_neut=htf_neut,
        ltf_bull=ltf_bull, ltf_bear=ltf_bear,
        ema_full_bull=ema_full_bull, ema_full_bear=ema_full_bear, ema_flat=ema_flat,
        adx_strong=adx_strong, adx_very_strong=adx_very_strong,
        adx_rising=adx_rising, adx_falling=adx_falling,
        di_conf_bull=di_conf_bull, di_conf_bear=di_conf_bear, di_sep=di_sep,
        atr_exp=atr_exp, vol_extreme=vol_extreme, vol_compr=vol_compr, vol_state=vol_state,
        clean_candles=clean_candles, choppy_candles=choppy_candles,
        body_ratio=body_ratio, recent_overlap=recent_overlap,
        adx_value=adx_value,
    )


# ── Step 2: market phase ─────────────────────────────────────────────────────────

def compute_phase(chain: BooleanChain) -> PhaseResult:
    is_exhaustion = chain.adx_value > 40 and chain.adx_falling
    is_expansion = (
        chain.adx_strong and chain.adx_rising and chain.atr_exp
        and (chain.ema_full_bull or chain.ema_full_bear)
        and not is_exhaustion
    )
    is_cont_long = chain.htf_bull and chain.ltf_bull and chain.adx_strong and chain.di_conf_bull and not is_exhaustion
    is_cont_short = chain.htf_bear and chain.ltf_bear and chain.adx_strong and chain.di_conf_bear and not is_exhaustion
    is_cont = (is_cont_long or is_cont_short) and not is_expansion
    is_pb_long = chain.htf_bull and not chain.ltf_bull
    is_pb_short = chain.htf_bear and not chain.ltf_bear
    is_pb = is_pb_long or is_pb_short
    is_comp = (not chain.adx_strong and not chain.atr_exp) or chain.vol_compr
    is_chop = chain.choppy_candles and not is_expansion and not is_cont
    is_comp_final = is_comp and not is_chop and not is_expansion and not is_cont and not is_pb

    if is_exhaustion:
        phase = "Exhaustion"
    elif is_expansion:
        phase = "Expansion"
    elif is_cont:
        phase = "Continuation"
    elif is_pb:
        phase = "Pullback"
    elif is_comp_final:
        phase = "Compression"
    else:
        phase = "Chop"

    if chain.htf_bull and chain.ema_full_bull:
        trend_struct = "Bullish"
    elif chain.htf_bear and chain.ema_full_bear:
        trend_struct = "Bearish"
    elif chain.htf_neut and not chain.adx_strong and chain.vol_compr:
        trend_struct = "Range"
    else:
        trend_struct = "Transition"

    if is_cont:
        pb_status = "Continuation Confirmed"
    elif is_pb_long and chain.ltf_bear:
        pb_status = "Pullback Active"
    elif is_pb_short and chain.ltf_bull:
        pb_status = "Pullback Active"
    elif is_pb:
        pb_status = "Pullback Ending"
    else:
        pb_status = "No Pullback"

    return PhaseResult(
        phase=phase, trend_struct=trend_struct, pb_status=pb_status,
        is_exhaustion=is_exhaustion, is_expansion=is_expansion, is_cont=is_cont,
        is_pb=is_pb, is_comp_final=is_comp_final, is_chop=is_chop,
    )


# ── Step 3: MTF alignment ────────────────────────────────────────────────────────

def tf_bias(close: float, ema20: Optional[float], ema50: Optional[float]) -> int:
    if ema20 is None or ema50 is None:
        return 0
    if close > ema20 and ema20 > ema50:
        return 1
    if close < ema20 and ema20 < ema50:
        return -1
    return 0


def compute_mtf_alignment(biases: List[int]) -> MTFAlignment:
    bull_count = sum(1 for b in biases if b == 1)
    bear_count = sum(1 for b in biases if b == -1)
    n = len(biases)
    if bull_count > bear_count:
        align_str = f"{bull_count} / {n} Bullish"
    elif bear_count > bull_count:
        align_str = f"{bear_count} / {n} Bearish"
    else:
        align_str = "Mixed"
    return MTFAlignment(bull_count=bull_count, bear_count=bear_count, align_str=align_str)


# ── Step 4: Orca Score breakdown ─────────────────────────────────────────────────

_PHASE_FACTOR: Dict[str, float] = {
    "Continuation": 1.00,
    "Expansion": 0.85,
    "Pullback": 0.60,
    "Compression": 0.35,
    "Exhaustion": 0.10,
}


def compute_orca_score(chain: BooleanChain, phase: PhaseResult, cfg: OrcaMCConfig) -> ScoreResult:
    f_htf = 1.0 if (chain.htf_bull or chain.htf_bear) else 0.2
    f_adx = min(chain.adx_value / 50.0, 1.0)
    f_ema = 1.0 if (chain.ema_full_bull or chain.ema_full_bear) else 0.6 if (chain.ltf_bull or chain.ltf_bear) else 0.2
    f_phase = _PHASE_FACTOR.get(phase.phase, 0.20)
    f_vol = 0.25 if chain.vol_extreme else 1.0 if chain.atr_exp else 0.30 if chain.vol_compr else 0.70

    p_htf = round(f_htf * cfg.cap_htf)
    p_adx = round(f_adx * cfg.cap_adx)
    p_ema = round(f_ema * cfg.cap_ema)
    p_phase = round(f_phase * cfg.cap_phase)
    p_vol = round(f_vol * cfg.cap_vol)

    orca_score = max(0, min(100, p_htf + p_adx + p_ema + p_phase + p_vol))
    if orca_score >= 80:
        score_qual = "Excellent"
    elif orca_score >= 65:
        score_qual = "Good"
    elif orca_score >= 50:
        score_qual = "Caution"
    else:
        score_qual = "Poor"

    return ScoreResult(
        p_htf=p_htf, p_adx=p_adx, p_ema=p_ema, p_phase=p_phase, p_vol=p_vol,
        orca_score=orca_score, score_qual=score_qual,
    )


# ── Step 5: OrcaBot status ───────────────────────────────────────────────────────

def compute_orca_status(
    chain: BooleanChain, phase: PhaseResult, score: ScoreResult, mtf: MTFAlignment, cfg: OrcaMCConfig,
) -> StatusResult:
    qual_ok = score.orca_score >= cfg.on_thresh

    is_on_long = (
        chain.htf_bull and chain.ltf_bull and chain.adx_strong and chain.di_conf_bull
        and chain.ema_full_bull and qual_ok and not phase.is_exhaustion and not phase.is_chop
    )
    is_on_short = (
        chain.htf_bear and chain.ltf_bear and chain.adx_strong and chain.di_conf_bear
        and chain.ema_full_bear and qual_ok and not phase.is_exhaustion and not phase.is_chop
    )
    is_caution = (
        not is_on_long and not is_on_short
        and (phase.is_exhaustion or chain.vol_extreme or (phase.is_chop and (chain.htf_bull or chain.htf_bear)))
    )
    # POI OR-terms (poiWatchLong/poiWatchShort) omitted — Phase B.
    # Pine source lines 406-407 (poiWatchLong/poiWatchShort def), 412-413 (OR'd in here).
    is_watch_long = not is_on_long and not is_caution and chain.htf_bull and score.orca_score >= cfg.watch_thresh
    is_watch_short = not is_on_short and not is_caution and chain.htf_bear and score.orca_score >= cfg.watch_thresh

    if is_on_long:
        orca_status = "ON LONG"
    elif is_on_short:
        orca_status = "ON SHORT"
    elif is_watch_long:
        orca_status = "WATCH LONG"
    elif is_watch_short:
        orca_status = "WATCH SHORT"
    elif is_caution:
        orca_status = "CAUTION"
    else:
        orca_status = "OFF"

    if chain.htf_bull:
        pref_dir = "LONG"
    elif chain.htf_bear:
        pref_dir = "SHORT"
    elif mtf.bull_count > mtf.bear_count:
        pref_dir = "LONG"
    elif mtf.bear_count > mtf.bull_count:
        pref_dir = "SHORT"
    else:
        pref_dir = "NEUTRAL"

    return StatusResult(orca_status=orca_status, pref_dir=pref_dir)


def compute_long_side_focus(status: StatusResult, mtf: MTFAlignment) -> bool:
    return status.pref_dir == "LONG" or (status.pref_dir == "NEUTRAL" and mtf.bull_count >= mtf.bear_count)


# ── Step 6: Next-Trigger checklist ───────────────────────────────────────────────

def trigger_labels(long_side_focus: bool, on_thresh: int) -> Tuple[str, str, str, str]:
    c1 = "HTF Bias Bullish" if long_side_focus else "HTF Bias Bearish"
    c2 = "ADX Strong"
    c3 = "EMA Aligned Bullish" if long_side_focus else "EMA Aligned Bearish"
    c4 = f"Expansion + Score >= {on_thresh}"
    return c1, c2, c3, c4


def compute_next_trigger(
    chain: BooleanChain, phase: PhaseResult, score: ScoreResult, long_side_focus: bool, cfg: OrcaMCConfig,
) -> TriggerResult:
    c1_label, c2_label, c3_label, c4_label = trigger_labels(long_side_focus, cfg.on_thresh)

    c1_met = chain.htf_bull if long_side_focus else chain.htf_bear
    c2_met = chain.adx_strong
    c3_met = chain.ema_full_bull if long_side_focus else chain.ema_full_bear
    c4_met = (phase.is_expansion or phase.is_cont) and score.orca_score >= cfg.on_thresh

    met_count = sum([c1_met, c2_met, c3_met, c4_met])
    if met_count == 4:
        result = "READY — ON LONG" if long_side_focus else "READY — ON SHORT"
    elif met_count == 3:
        result = "Watch for bullish continuation" if long_side_focus else "Watch for bearish continuation"
    elif met_count == 2:
        result = "WAIT — conditions building"
    else:
        result = "WAIT — unsuitable"

    return TriggerResult(
        c1_label=c1_label, c1_met=c1_met, c2_label=c2_label, c2_met=c2_met,
        c3_label=c3_label, c3_met=c3_met, c4_label=c4_label, c4_met=c4_met,
        met_count=met_count, result=result,
    )


# ── Step 7: Suitability + Confidence ─────────────────────────────────────────────

def compute_suitability(score: ScoreResult, phase: PhaseResult, chain: BooleanChain) -> SuitabilityResult:
    if score.orca_score >= 80 and (phase.is_expansion or phase.is_cont) and not phase.is_chop:
        return SuitabilityResult(rating="Excellent", reason="Strong trend · expansion · high score")
    if score.orca_score >= 65 and chain.adx_strong and not phase.is_chop:
        return SuitabilityResult(rating="Good", reason="Trending · acceptable score")
    if score.orca_score >= 50 and not phase.is_chop:
        return SuitabilityResult(rating="Average", reason="Mixed conditions")
    if phase.is_chop or chain.vol_extreme or (not chain.adx_strong and chain.vol_compr):
        if phase.is_chop:
            reason = "Choppy · low quality"
        elif chain.vol_extreme:
            reason = "Volatility extreme"
        else:
            reason = "Weak ADX · compression"
        return SuitabilityResult(rating="Avoid", reason=reason)
    return SuitabilityResult(rating="Poor", reason="Weak structure · low score")


_STATUS_CONVICTION: Dict[str, float] = {
    "ON LONG": 1.00, "ON SHORT": 1.00,
    "WATCH LONG": 0.60, "WATCH SHORT": 0.60,
    "CAUTION": 0.25,
}


def compute_confidence(score: ScoreResult, status: StatusResult) -> ConfidenceResult:
    status_conv = _STATUS_CONVICTION.get(status.orca_status, 0.15)  # OFF -> 0.15
    act_conf = max(0, min(100, round(score.orca_score * 0.6 + status_conv * 40)))
    if act_conf >= 75:
        tier = "High"
    elif act_conf >= 45:
        tier = "Medium"
    else:
        tier = "Low"
    return ConfidenceResult(score=act_conf, tier=tier)


# ── Step 8: Readiness + Expected Next ────────────────────────────────────────────

def compute_readiness(
    chain: BooleanChain, phase: PhaseResult, score: ScoreResult, mtf: MTFAlignment,
    long_side_focus: bool, cfg: OrcaMCConfig,
) -> ReadinessResult:
    side_bull = long_side_focus
    htf_aligned = chain.htf_bull if side_bull else chain.htf_bear
    ema_aligned = chain.ema_full_bull if side_bull else chain.ema_full_bear
    ltf_aligned = chain.ltf_bull if side_bull else chain.ltf_bear
    di_aligned = chain.di_conf_bull if side_bull else chain.di_conf_bear
    side_count = mtf.bull_count if side_bull else mtf.bear_count

    rd_htf = 20 if htf_aligned else 10 if side_count >= 2 else 0
    rd_ema = 18 if ema_aligned else 9 if ltf_aligned else 0
    rd_adx = 18 if chain.adx_strong else 9 if chain.adx_value >= cfg.adx_thresh - 5 else 0
    rd_di = 12 if di_aligned else 6 if chain.di_sep >= cfg.di_sep_min * 0.5 else 0
    rd_phase = 14 if (phase.is_expansion or phase.is_cont) else 7 if phase.is_pb else 0
    rd_score = 10 if score.orca_score >= cfg.on_thresh else 5 if score.orca_score >= cfg.watch_thresh else 0
    # rdPOI (8pt max) omitted — Phase B. Pine source lines 504 (def), 508 (summed in).

    rd_penalty = (15 if phase.is_chop else 0) + (10 if phase.is_exhaustion else 0) + (10 if chain.vol_extreme else 0)

    readiness = max(0, min(100, rd_htf + rd_ema + rd_adx + rd_di + rd_phase + rd_score - rd_penalty))

    if readiness >= 85:
        tier = "Near Activation"
    elif readiness >= 60:
        tier = "Building"
    elif readiness >= 35:
        tier = "Developing"
    else:
        tier = "Low"

    if phase.is_chop:
        reason = "Choppy — wait for clean structure"
    elif phase.is_exhaustion:
        reason = "Trend extended — wait for reset"
    elif chain.vol_extreme:
        reason = "Volatility extreme — wait"
    elif not htf_aligned:
        reason = "Waiting for HTF alignment"
    elif not chain.adx_strong:
        reason = "Waiting for ADX to strengthen"
    elif not ema_aligned:
        reason = "Waiting for EMA alignment"
    elif not (phase.is_expansion or phase.is_cont):
        reason = "Waiting for momentum confirmation"
    elif score.orca_score < cfg.on_thresh:
        reason = "Waiting for Orca Score threshold"
    else:
        reason = "Conditions nearly aligned"

    return ReadinessResult(score=readiness, tier=tier, reason=reason)


def compute_expected_next(status: StatusResult, readiness: ReadinessResult, long_side_focus: bool) -> str:
    exp_dir = "LONG" if long_side_focus else "SHORT"
    s = status.orca_status

    if s in ("ON LONG", "ON SHORT"):
        return f"WATCH {exp_dir}" if readiness.score < 50 else s
    if s == "WATCH LONG":
        if readiness.score >= 85:
            return "ON LONG"
        if readiness.score < 35:
            return "OFF"
        return "WATCH LONG"
    if s == "WATCH SHORT":
        if readiness.score >= 85:
            return "ON SHORT"
        if readiness.score < 35:
            return "OFF"
        return "WATCH SHORT"
    if s == "CAUTION":
        return "OFF"
    return f"WATCH {exp_dir}" if readiness.score >= 45 else "OFF"


# ── Step 9: Why bullets + Opportunity Timeline ───────────────────────────────────

def compute_why_bullets(
    chain: BooleanChain, phase: PhaseResult, score: ScoreResult, status: StatusResult,
    qual_ok: bool, max_bullets: int = 5,
) -> List[str]:
    bullets: List[str] = []

    def add(cond: bool, text: str) -> None:
        if cond and len(bullets) < max_bullets:
            bullets.append(text)

    if status.orca_status in ("ON LONG", "ON SHORT"):
        # POI-confirmed bullet omitted — Phase B. Pine source line 617.
        add(True, "HTF & LTF aligned")
        add(chain.adx_strong, "ADX " + ("strong, rising" if chain.adx_rising else "strong"))
        add(phase.is_expansion or phase.is_cont, "Market " + ("expanding" if phase.is_expansion else "continuing"))
        add(chain.ema_full_bull or chain.ema_full_bear, "Momentum aligned")
        add(qual_ok, "Orca Score above threshold")
    elif status.orca_status in ("WATCH LONG", "WATCH SHORT"):
        # Approaching-POI bullet omitted — Phase B. Pine source line 624.
        add(chain.htf_bull or chain.htf_bear, "HTF " + ("bullish" if chain.htf_bull else "bearish"))
        add(phase.is_pb, "Pullback active")
        add(not chain.adx_strong, "Trend strength not yet confirmed")
        add(True, "Waiting for continuation")
    elif status.orca_status == "CAUTION":
        add(phase.is_exhaustion, "Trend may be exhausted")
        add(chain.vol_extreme, "Volatility extreme")
        add(phase.is_chop, "Choppy price action")
        add(True, "Conditions unstable")
    else:  # OFF
        add(chain.htf_neut, "HTF bias unclear")
        add(score.orca_score < 50, "Trend quality weak")
        add(phase.is_comp_final, "Market compressing")
        add(not (phase.is_cont or phase.is_expansion), "No clean continuation")

    return bullets


def compute_opportunity_timeline(
    status: StatusResult, expected_next: str, long_side_focus: bool,
) -> List[Dict[str, Any]]:
    side = "LONG" if long_side_focus else "SHORT"
    states = ["OFF", f"WATCH {side}", f"ON {side}", "CAUTION"]
    same_next = expected_next == status.orca_status
    return [
        {
            "state": s,
            "is_current": s == status.orca_status,
            "is_next": (s == expected_next) and not same_next,
        }
        for s in states
    ]


# ── Orchestrator ──────────────────────────────────────────────────────────────

def compute_orca_mc(inputs: OrcaMCInputs, cfg: Optional[OrcaMCConfig] = None) -> OrcaMCResult:
    c = cfg or _DEFAULT_CFG

    chain = compute_boolean_chain(
        ltf_close=inputs.ltf_close, ltf_ema20=inputs.ltf_ema20, ltf_ema50=inputs.ltf_ema50, ltf_ema200=inputs.ltf_ema200,
        htf_close=inputs.htf_close, htf_ema20=inputs.htf_ema20, htf_ema50=inputs.htf_ema50, htf_ema200=inputs.htf_ema200,
        htf_ema20_prev2=inputs.htf_ema20_prev2,
        adx_value=inputs.adx_value, adx_prev=inputs.adx_prev,
        plus_di=inputs.plus_di, minus_di=inputs.minus_di,
        atr_value=inputs.atr_value, atr_sma20=inputs.atr_sma20,
        ltf_candles=inputs.ltf_candles,
        cfg=c,
    )
    phase = compute_phase(chain)
    mtf = compute_mtf_alignment(inputs.mtf_biases)
    score = compute_orca_score(chain, phase, c)
    status = compute_orca_status(chain, phase, score, mtf, c)
    long_side_focus = compute_long_side_focus(status, mtf)
    trigger = compute_next_trigger(chain, phase, score, long_side_focus, c)
    suitability = compute_suitability(score, phase, chain)
    confidence = compute_confidence(score, status)
    readiness = compute_readiness(chain, phase, score, mtf, long_side_focus, c)
    expected_next = compute_expected_next(status, readiness, long_side_focus)
    qual_ok = score.orca_score >= c.on_thresh
    why_bullets = compute_why_bullets(chain, phase, score, status, qual_ok)
    opportunity_timeline = compute_opportunity_timeline(status, expected_next, long_side_focus)

    return OrcaMCResult(
        chain=chain, phase=phase, mtf=mtf, score=score, status=status, trigger=trigger,
        suitability=suitability, confidence=confidence, readiness=readiness, expected_next=expected_next,
        why_bullets=why_bullets, opportunity_timeline=opportunity_timeline, long_side_focus=long_side_focus,
        ltf_last_timestamp=inputs.ltf_last_timestamp, htf_last_timestamp=inputs.htf_last_timestamp,
        poi_pending=True,
    )
