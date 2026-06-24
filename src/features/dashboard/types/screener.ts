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

// Matches Pydantic "SymbolDetail"
export interface SymbolDetail {
  symbol: string;
  name: string;
  timeframes: TimeframeBar[];
  signals: OrcaSignals;
  advanced: AdvancedMetrics;
}
