export type Direction = "LONG" | "SHORT";
export type Session = "LONDON" | "NEW_YORK" | "ASIAN" | "OTHER";
export type TradeStatus = "OPEN" | "CLOSED";
export type EmotionalState =
  | "CALM"
  | "NEUTRAL"
  | "ANXIOUS"
  | "EXCITED"
  | "FEARFUL"
  | "FRUSTRATED"
  | "GREEDY";

export interface Trade extends TradeOrcaSnapshot {
  id: number;
  user_id: number;
  market: string;
  direction: Direction;
  entry_price: string | null;
  stop_loss: string | null;
  take_profit: string | null;
  exit_price: string | null;
  lot_size: string | null;
  pnl: string | null;
  rr: string | null;
  risk_pct: string | null;
  session: Session | null;
  status: TradeStatus;
  confidence: number | null;
  emotional_state: EmotionalState | null;
  stress_level: number | null;
  notes: string | null;
  trade_date: string; // ISO date string "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}

export interface TradesPage {
  trades: Trade[];
  total: number;
  page: number;
  page_size: number;
}

export interface JournalStats {
  total_trades: number;
  closed_trades: number;
  open_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  avg_rr: number | null;
  profit_factor: number | null;
  total_pnl: number;
  avg_pnl: number;
  best_trade_pnl: number | null;
  worst_trade_pnl: number | null;
  avg_confidence: number | null;
  avg_stress: number | null;
}

export interface CoachingSettings {
  journal_coaching_access: boolean;
}

export interface TradeCreatePayload {
  market: string;
  direction: Direction;
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  exit_price?: number | null;
  lot_size?: number | null;
  pnl?: number | null;
  rr?: number | null;
  risk_pct?: number | null;
  session?: Session | null;
  status: TradeStatus;
  confidence?: number | null;
  emotional_state?: EmotionalState | null;
  stress_level?: number | null;
  notes?: string | null;
  trade_date: string;
}

export type TradeUpdatePayload = Partial<TradeCreatePayload>;

export interface BulkImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// ── Orca snapshot on each trade ───────────────────────────────────────────────
export interface TradeOrcaSnapshot {
  orca_score: number | null;
  orca_status: "ON" | "WATCH" | "OFF" | null;
  orca_direction: string | null;
  market_phase: string | null;
  adx_at_entry: number | null;
  ema_aligned_at_entry: boolean | null;
  intraday_bull_at_entry: number | null;
  daily_bull_at_entry: number | null;
  longterm_bull_at_entry: number | null;
  vol_score_at_entry: number | null;
}

// ── Orca analytics ────────────────────────────────────────────────────────────
export interface OrcaScoreBucket {
  label: string;
  range_min: number;
  range_max: number;
  trades: number;
  win_rate: number | null;
}

export interface OrcaStatusStat {
  status: string;
  trades: number;
  win_rate: number | null;
}

export interface OrcaPhaseStat {
  phase: string;
  trades: number;
  win_rate: number | null;
}

export interface EquityPoint {
  date: string;
  daily_pnl: number;
  cumulative_pnl: number;
}

export interface OrcaAnalytics {
  has_data: boolean;
  by_score: OrcaScoreBucket[];
  by_status: OrcaStatusStat[];
  by_phase: OrcaPhaseStat[];
}
