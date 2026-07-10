// types/screener.ts

// Matches Pydantic "TrendBreakdown"
export interface TrendBreakdown {
  bear: number;
  bull: number;
}

// Matches Pydantic "AdvancedMetrics"
export interface AdvancedMetrics {
  adx: number;
  adx_dir: "up" | "down" | "flat";
  ema: string;
  vol: number;
  alert: boolean;
}

// Matches Pydantic "OrcaSignals"
export interface OrcaSignals {
  status: "ON" | "WATCH" | "OFF";
  direction: "LONG ONLY" | "SHORT ONLY" | "WATCH LONG" | "WATCH SHORT" | "FLAT";
  market_phase:
    | "Compression"
    | "Expansion"
    | "Healthy Trend"
    | "Pullback"
    | "Continuation"
    | "Exhaustion"
    | "Chop";
  pullback: "Shallow" | "Healthy" | "Deep" | "Failed" | null;
  orca_score: number;
  is_best: boolean;
  status_since: string | null; // ISO timestamp — when status/direction last changed
}

// Matches Pydantic "OrcaMCRowSummary" — the main table's Status/Score/Align
// columns prefer this over `signals` when present (see PremiumScreenerSection.tsx).
export interface OrcaMCRowSummary {
  status: string; // "ON LONG" | "ON SHORT" | "WATCH LONG" | "WATCH SHORT" | "CAUTION" | "OFF"
  pref_dir: string; // "LONG" | "SHORT" | "NEUTRAL"
  phase: string;
  orca_score: number;
  score_qual: string;
  mtf_bull_count: number;
  mtf_bear_count: number;
  mtf_align_str: string;
  status_since: string | null;
}

// Matches Pydantic "ScreenerRow"
export interface ScreenerRow {
  symbol: string;
  name: string;
  intraday: TrendBreakdown;
  daily: TrendBreakdown;
  longterm: TrendBreakdown;
  advanced: AdvancedMetrics;
  signals: OrcaSignals;
  sparkline: number[]; // last 30 1H closes, chronological
  orca_mc: OrcaMCRowSummary | null;
}

// Matches Pydantic "ScreenerPage"
export interface ScreenerPage {
  rows: ScreenerRow[];
  page: number;
  pageSize: number;
  total: number;
  lastUpdated: string; // ISO string
}

// Matches Pydantic "TimeframeBar"
export interface TimeframeBar {
  timeframe: string;
  label: string;
  bull: number;
  bear: number;
  score: number;
}

// ── Orca MC v3.0 engine port (Phase A, no POI) — matches app/schemas/orca_mc.py ──

export interface ScoreBreakdown {
  p_htf: number;
  p_adx: number;
  p_ema: number;
  p_phase: number;
  p_vol: number;
  cap_htf: number;
  cap_adx: number;
  cap_ema: number;
  cap_phase: number;
  cap_vol: number;
  orca_score: number;
  score_qual: string; // "Excellent" | "Good" | "Caution" | "Poor"
}

export interface NextTrigger {
  c1_label: string;
  c1_met: boolean;
  c2_label: string;
  c2_met: boolean;
  c3_label: string;
  c3_met: boolean;
  c4_label: string;
  c4_met: boolean;
  met_count: number;
  result: string;
}

export interface Readiness {
  score: number;
  tier: string; // "Near Activation" | "Building" | "Developing" | "Low"
  reason: string;
  expected_next: string;
}

export interface Suitability {
  rating: string; // "Excellent" | "Good" | "Average" | "Avoid" | "Poor"
  reason: string;
}

export interface Confidence {
  score: number;
  tier: string; // "High" | "Medium" | "Low"
}

export interface OpportunityTimelineStep {
  state: string;
  is_current: boolean;
  is_next: boolean;
}

export interface MTFAlignmentOut {
  bull_count: number;
  bear_count: number;
  align_str: string;
}

export interface OrcaMarketConditions {
  phase: string;
  trend_struct: string;
  pb_status: string;
  mtf: MTFAlignmentOut;
  score: ScoreBreakdown;
  status: string; // "ON LONG" | "ON SHORT" | "WATCH LONG" | "WATCH SHORT" | "CAUTION" | "OFF"
  pref_dir: string; // "LONG" | "SHORT" | "NEUTRAL"
  next_trigger: NextTrigger;
  readiness: Readiness;
  suitability: Suitability;
  confidence: Confidence;
  why: string[];
  opportunity_timeline: OpportunityTimelineStep[];
  poi_pending: boolean;
  status_since: string | null;
}

// Matches Pydantic "MagnetTarget"
export interface MagnetTarget {
  structure_type: string; // 'fvg_bull' | 'fvg_bear' | 'session_high' | 'session_low'
  price_top: number;
  price_bottom: number;
  timeframe: string;      // '4h' | '1day' | 'session'
  atr_distance: number | null;
  magnitude: number | null;
  formed_at: string;      // ISO timestamp
  candle_time: number | null; // Unix seconds of source candle (swing/EQH/EQL only)
}

// Matches Pydantic "SymbolDetail"
export interface SymbolDetail {
  symbol: string;
  name: string;
  timeframes: TimeframeBar[];
  signals: OrcaSignals;
  advanced: AdvancedMetrics;
  orca_mc: OrcaMarketConditions | null;
  magnet_above: MagnetTarget | null;
  magnet_below: MagnetTarget | null;
  magnet_structures: MagnetTarget[];        // all unfilled structures, sorted by atr_distance
  magnet_bias: number | null;               // -100 (max downside pull) to +100 (max upside pull)
}
