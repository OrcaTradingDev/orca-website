// types/screener.ts

// Matches your Pydantic "TrendBreakdown"
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

// Matches Pydantic "ScreenerRow"
export interface ScreenerRow {
  symbol: string;
  name: string;
  intraday: TrendBreakdown;
  daily: TrendBreakdown;
  longterm: TrendBreakdown;
  advanced: AdvancedMetrics;
}

// Matches Pydantic "ScreenerPage"
export interface ScreenerPage {
  rows: ScreenerRow[];
  page: number;
  pageSize: number;
  total: number;
  lastUpdated: string; // ISO string
}
