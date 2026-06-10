"use client";

import { useState, useCallback } from "react";
import {
  BookOpen, Plus, TrendingUp, TrendingDown, BarChart2,
  Calendar, ChevronDown, Search, Trash2, Edit3, X, Check,
  Brain, Target, Award, AlertCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  useJournalTrades,
  useJournalStats,
  useCoachingSettings,
  useCreateTrade,
  useUpdateTrade,
  useDeleteTrade,
  useUpdateCoachingSettings,
} from "../hooks/useJournal";
import type {
  Direction,
  EmotionalState,
  Session,
  Trade,
  TradeCreatePayload,
  TradeStatus,
} from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined, prefix = "$") => {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `${prefix}${(abs / 1000).toFixed(1)}k` : `${prefix}${abs.toFixed(2)}`;
  return n < 0 ? `−${s}` : s;
};

const fmtPct = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(1)}%`;

const fmtRR = (n: number | null | undefined) =>
  n == null ? "—" : `${n.toFixed(2)}R`;

const pnlColor = (v: number | null | string | undefined) => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (n == null || isNaN(n as number)) return "#94A3B8";
  return (n as number) > 0 ? "#10B981" : (n as number) < 0 ? "#EF4444" : "#94A3B8";
};

const SESSION_LABELS: Record<string, string> = {
  LONDON: "London",
  NEW_YORK: "New York",
  ASIAN: "Asian",
  OTHER: "Other",
};

const EMOTION_LABELS: Record<string, string> = {
  CALM: "😌 Calm",
  NEUTRAL: "😐 Neutral",
  ANXIOUS: "😰 Anxious",
  EXCITED: "😄 Excited",
  FEARFUL: "😨 Fearful",
  FRUSTRATED: "😤 Frustrated",
  GREEDY: "🤑 Greedy",
};

const EMOTION_COLORS: Record<string, string> = {
  CALM: "#10B981",
  NEUTRAL: "#94A3B8",
  ANXIOUS: "#F97316",
  EXCITED: "#3B82F6",
  FEARFUL: "#EF4444",
  FRUSTRATED: "#F59E0B",
  GREEDY: "#8B5CF6",
};

const today = () => new Date().toISOString().split("T")[0];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, color, icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ElementType;
}) {
  return (
    <div style={{
      background: "#14181F",
      border: "1px solid #1E293B",
      borderRadius: "12px",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748B", fontSize: "12px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {Icon && <Icon style={{ width: "14px", height: "14px" }} />}
        {label}
      </div>
      <div style={{ fontSize: "26px", fontWeight: 700, color: color || "white", lineHeight: "1.1" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "12px", color: "#64748B" }}>{sub}</div>}
    </div>
  );
}

// ── Trade form modal ──────────────────────────────────────────────────────────

interface TradeFormProps {
  initial?: Trade;
  onClose: () => void;
  onSaved: () => void;
}

function TradeFormModal({ initial, onClose, onSaved }: TradeFormProps) {
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();

  const [form, setForm] = useState<TradeCreatePayload>({
    market: initial?.market ?? "",
    direction: initial?.direction ?? "LONG",
    entry_price: initial?.entry_price ? parseFloat(initial.entry_price) : null,
    exit_price: initial?.exit_price ? parseFloat(initial.exit_price) : null,
    pnl: initial?.pnl ? parseFloat(initial.pnl) : null,
    rr: initial?.rr ? parseFloat(initial.rr) : null,
    risk_pct: initial?.risk_pct ? parseFloat(initial.risk_pct) : null,
    session: initial?.session ?? null,
    status: initial?.status ?? "CLOSED",
    confidence: initial?.confidence ?? null,
    emotional_state: initial?.emotional_state ?? null,
    stress_level: initial?.stress_level ?? null,
    notes: initial?.notes ?? null,
    trade_date: initial?.trade_date ?? today(),
  });

  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof TradeCreatePayload>(k: K, v: TradeCreatePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numOrNull = (s: string) => s === "" ? null : parseFloat(s);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.market.trim()) { setError("Market is required"); return; }
    try {
      if (initial) {
        await updateMutation.mutateAsync({ id: initial.id, payload: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      onSaved();
    } catch {
      setError("Failed to save trade. Please try again.");
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px",
    }} onClick={onClose}>
      <div style={{
        background: "#14181F", border: "1px solid #1E293B", borderRadius: "16px",
        width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto",
        padding: "28px",
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            {initial ? "Edit Trade" : "Log New Trade"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}>
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Row 1: Market + Direction */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormGroup label="Market *">
              <input
                type="text"
                placeholder="e.g. EUR/USD, SPX, AAPL"
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Direction *">
              <div style={{ display: "flex", gap: "8px" }}>
                {(["LONG", "SHORT"] as Direction[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set("direction", d)}
                    style={{
                      flex: 1, padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                      border: form.direction === d ? "none" : "1px solid #1E293B",
                      background: form.direction === d
                        ? (d === "LONG" ? "#10B981" : "#EF4444")
                        : "#0B0F19",
                      color: form.direction === d ? "white" : "#94A3B8",
                      transition: "all 0.15s",
                    }}
                  >
                    {d === "LONG" ? "▲ LONG" : "▼ SHORT"}
                  </button>
                ))}
              </div>
            </FormGroup>
          </div>

          {/* Row 2: Trade Date + Session */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormGroup label="Trade Date *">
              <input
                type="date"
                value={form.trade_date}
                onChange={(e) => set("trade_date", e.target.value)}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Session">
              <select
                value={form.session ?? ""}
                onChange={(e) => set("session", (e.target.value || null) as Session | null)}
                style={inputStyle}
              >
                <option value="">Select session…</option>
                <option value="LONDON">London</option>
                <option value="NEW_YORK">New York</option>
                <option value="ASIAN">Asian</option>
                <option value="OTHER">Other</option>
              </select>
            </FormGroup>
          </div>

          {/* Row 3: Entry + Exit */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormGroup label="Entry Price">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={form.entry_price ?? ""}
                onChange={(e) => set("entry_price", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Exit Price">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={form.exit_price ?? ""}
                onChange={(e) => set("exit_price", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
          </div>

          {/* Row 4: PnL + RR + Risk% */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <FormGroup label="PnL ($)">
              <input
                type="number"
                step="any"
                placeholder="+150.00"
                value={form.pnl ?? ""}
                onChange={(e) => set("pnl", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="R:R Achieved">
              <input
                type="number"
                step="any"
                placeholder="e.g. 1.5"
                value={form.rr ?? ""}
                onChange={(e) => set("rr", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Risk %">
              <input
                type="number"
                step="any"
                placeholder="e.g. 1.0"
                value={form.risk_pct ?? ""}
                onChange={(e) => set("risk_pct", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
          </div>

          {/* Row 5: Status */}
          <FormGroup label="Trade Status">
            <div style={{ display: "flex", gap: "8px" }}>
              {(["CLOSED", "OPEN"] as TradeStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    border: form.status === s ? "none" : "1px solid #1E293B",
                    background: form.status === s ? (s === "CLOSED" ? "#1E293B" : "#0EA5E9") : "#0B0F19",
                    color: form.status === s ? "white" : "#64748B",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormGroup>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: "4px" }}>
            <div style={{ color: "#64748B", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
              Psychology
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <FormGroup label="Emotional State">
                <select
                  value={form.emotional_state ?? ""}
                  onChange={(e) => set("emotional_state", (e.target.value || null) as EmotionalState | null)}
                  style={inputStyle}
                >
                  <option value="">Select…</option>
                  {Object.entries(EMOTION_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </FormGroup>
              <div style={{ display: "flex", gap: "12px" }}>
                <FormGroup label={`Confidence: ${form.confidence ?? "—"}/10`} style={{ flex: 1 }}>
                  <input
                    type="range" min="1" max="10" step="1"
                    value={form.confidence ?? 5}
                    onChange={(e) => set("confidence", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#00D4FF" }}
                  />
                </FormGroup>
                <FormGroup label={`Stress: ${form.stress_level ?? "—"}/10`} style={{ flex: 1 }}>
                  <input
                    type="range" min="1" max="10" step="1"
                    value={form.stress_level ?? 5}
                    onChange={(e) => set("stress_level", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#F97316" }}
                  />
                </FormGroup>
              </div>
            </div>
          </div>

          {/* Notes */}
          <FormGroup label="Notes">
            <textarea
              placeholder="What happened? Market context, entry reasoning, lessons learned…"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value || null)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />
          </FormGroup>

          {error && (
            <div style={{ color: "#EF4444", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle style={{ width: "14px", height: "14px" }} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button type="submit" disabled={busy} style={saveBtnStyle(busy)}>
              {busy ? "Saving…" : (initial ? "Update Trade" : "Log Trade")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormGroup({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
      <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#0B0F19",
  border: "1px solid #1E293B",
  borderRadius: "8px",
  padding: "10px 12px",
  color: "white",
  fontSize: "13px",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #1E293B",
  borderRadius: "8px",
  padding: "10px 20px",
  color: "#94A3B8",
  fontSize: "14px",
  fontWeight: 500,
  cursor: "pointer",
};

const saveBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#1E293B" : "linear-gradient(135deg, #00C4EE 0%, #0EA5E9 100%)",
  border: "none",
  borderRadius: "8px",
  padding: "10px 24px",
  color: disabled ? "#64748B" : "white",
  fontSize: "14px",
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

// ── Dashboard tab ─────────────────────────────────────────────────────────────

function DashboardTab() {
  const { data: stats, isLoading } = useJournalStats();
  const { data: tradesPage } = useJournalTrades({ pageSize: 5 });

  if (isLoading) return <LoadingSpinner />;

  if (!stats || stats.total_trades === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📓</div>
        <div style={{ color: "white", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>No trades yet</div>
        <div style={{ color: "#64748B", fontSize: "14px" }}>Log your first trade to start tracking your performance.</div>
      </div>
    );
  }

  const pnlVal = stats.total_pnl;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
        <StatCard label="Total Trades" value={String(stats.total_trades)} sub={`${stats.open_trades} open`} icon={BarChart2} />
        <StatCard
          label="Win Rate"
          value={fmtPct(stats.win_rate)}
          sub={`${stats.winning_trades}W / ${stats.losing_trades}L`}
          color={stats.win_rate >= 50 ? "#10B981" : "#EF4444"}
          icon={Target}
        />
        <StatCard
          label="Total PnL"
          value={fmt(pnlVal)}
          sub={`Avg ${fmt(stats.avg_pnl)} / trade`}
          color={pnlColor(pnlVal)}
          icon={pnlVal >= 0 ? TrendingUp : TrendingDown}
        />
        <StatCard
          label="Avg RR"
          value={fmtRR(stats.avg_rr)}
          icon={Award}
        />
        <StatCard
          label="Profit Factor"
          value={stats.profit_factor != null ? stats.profit_factor.toFixed(2) : "—"}
          color={stats.profit_factor != null && stats.profit_factor >= 1.5 ? "#10B981" : undefined}
          icon={BarChart2}
        />
        {stats.avg_confidence != null && (
          <StatCard
            label="Avg Confidence"
            value={`${stats.avg_confidence.toFixed(1)}/10`}
            icon={Brain}
          />
        )}
      </div>

      {/* Best / Worst */}
      {(stats.best_trade_pnl != null || stats.worst_trade_pnl != null) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 22px" }}>
            <div style={{ color: "#64748B", fontSize: "12px", marginBottom: "6px" }}>Best Trade</div>
            <div style={{ color: "#10B981", fontSize: "22px", fontWeight: 700 }}>{fmt(stats.best_trade_pnl)}</div>
          </div>
          <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "18px 22px" }}>
            <div style={{ color: "#64748B", fontSize: "12px", marginBottom: "6px" }}>Worst Trade</div>
            <div style={{ color: "#EF4444", fontSize: "22px", fontWeight: 700 }}>{fmt(stats.worst_trade_pnl)}</div>
          </div>
        </div>
      )}

      {/* Recent trades */}
      {tradesPage && tradesPage.trades.length > 0 && (
        <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar style={{ width: "15px", height: "15px", color: "#64748B" }} />
            <span style={{ color: "#94A3B8", fontSize: "13px", fontWeight: 600 }}>Recent Trades</span>
          </div>
          {tradesPage.trades.map((t) => (
            <TradeRowMini key={t.id} trade={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function TradeRowMini({ trade }: { trade: Trade }) {
  const pnl = trade.pnl != null ? parseFloat(trade.pnl) : null;
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr auto auto auto",
      alignItems: "center",
      padding: "12px 20px",
      borderBottom: "1px solid #0F1822",
      gap: "16px",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>{trade.market}</span>
        <span style={{ color: "#64748B", fontSize: "12px" }}>{trade.trade_date}</span>
      </div>
      <span style={{
        padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700,
        background: trade.direction === "LONG" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        color: trade.direction === "LONG" ? "#10B981" : "#EF4444",
      }}>
        {trade.direction}
      </span>
      {trade.session && (
        <span style={{ color: "#64748B", fontSize: "12px" }}>{SESSION_LABELS[trade.session]}</span>
      )}
      <span style={{ color: pnlColor(pnl), fontSize: "14px", fontWeight: 600, textAlign: "right", minWidth: "70px" }}>
        {fmt(pnl)}
      </span>
    </div>
  );
}

// ── Trade history tab ─────────────────────────────────────────────────────────

function HistoryTab({ onEdit }: { onEdit: (trade: Trade) => void }) {
  const [search, setSearch] = useState("");
  const [dirFilter, setDirFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const deleteMutation = useDeleteTrade();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data, isLoading } = useJournalTrades({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    direction: dirFilter || undefined,
    session: sessionFilter || undefined,
    status: statusFilter || undefined,
  });

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setConfirmDelete(null);
  };

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "180px" }}>
          <Search style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "#64748B" }} />
          <input
            type="text"
            placeholder="Search market…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft: "32px" }}
          />
        </div>
        <FilterSelect value={dirFilter} onChange={(v) => { setDirFilter(v); setPage(1); }} options={[["", "All Directions"], ["LONG", "Long"], ["SHORT", "Short"]]} />
        <FilterSelect value={sessionFilter} onChange={(v) => { setSessionFilter(v); setPage(1); }} options={[["", "All Sessions"], ["LONDON", "London"], ["NEW_YORK", "New York"], ["ASIAN", "Asian"], ["OTHER", "Other"]]} />
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={[["", "All Status"], ["CLOSED", "Closed"], ["OPEN", "Open"]]} />
      </div>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : !data || data.trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>No trades match your filters.</div>
      ) : (
        <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 70px 90px 90px 80px 80px 100px 120px 70px",
            padding: "10px 16px",
            borderBottom: "1px solid #1E293B",
            gap: "8px",
          }}>
            {["Date", "Market", "Dir", "Entry", "Exit", "PnL", "R:R", "Session", "Emotion", ""].map((h) => (
              <div key={h} style={{ color: "#64748B", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
            ))}
          </div>

          {data.trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              onEdit={() => onEdit(trade)}
              confirmDelete={confirmDelete === trade.id}
              onDeleteRequest={() => setConfirmDelete(trade.id)}
              onDeleteConfirm={() => handleDelete(trade.id)}
              onDeleteCancel={() => setConfirmDelete(null)}
              deleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={paginationBtn(page === 1)}
          >
            <ChevronLeft style={{ width: "14px", height: "14px" }} />
          </button>
          <span style={{ color: "#94A3B8", fontSize: "13px" }}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={paginationBtn(page === totalPages)}
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, width: "auto", minWidth: "130px", paddingRight: "24px" }}
    >
      {options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

function TradeRow({ trade, onEdit, confirmDelete, onDeleteRequest, onDeleteConfirm, onDeleteCancel, deleting }: {
  trade: Trade;
  onEdit: () => void;
  confirmDelete: boolean;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  deleting: boolean;
}) {
  const pnl = trade.pnl != null ? parseFloat(trade.pnl) : null;
  const rr = trade.rr != null ? parseFloat(trade.rr) : null;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "90px 1fr 70px 90px 90px 80px 80px 100px 120px 70px",
      padding: "11px 16px",
      borderBottom: "1px solid #0F1822",
      alignItems: "center",
      gap: "8px",
      transition: "background 0.1s",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0F1822")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ color: "#64748B", fontSize: "12px" }}>{trade.trade_date}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <span style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{trade.market}</span>
        {trade.notes && <span style={{ color: "#475569", fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trade.notes}</span>}
      </div>
      <span style={{
        fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
        background: trade.direction === "LONG" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        color: trade.direction === "LONG" ? "#10B981" : "#EF4444",
        display: "inline-block",
      }}>
        {trade.direction}
      </span>
      <div style={{ color: "#94A3B8", fontSize: "12px" }}>{trade.entry_price ? parseFloat(trade.entry_price).toFixed(4) : "—"}</div>
      <div style={{ color: "#94A3B8", fontSize: "12px" }}>{trade.exit_price ? parseFloat(trade.exit_price).toFixed(4) : "—"}</div>
      <div style={{ color: pnlColor(pnl), fontSize: "13px", fontWeight: 600 }}>{fmt(pnl)}</div>
      <div style={{ color: "#94A3B8", fontSize: "12px" }}>{fmtRR(rr)}</div>
      <div style={{ color: "#64748B", fontSize: "12px" }}>{trade.session ? SESSION_LABELS[trade.session] : "—"}</div>
      <div>
        {trade.emotional_state ? (
          <span style={{
            fontSize: "11px", padding: "2px 7px", borderRadius: "99px",
            background: `${EMOTION_COLORS[trade.emotional_state]}20`,
            color: EMOTION_COLORS[trade.emotional_state],
          }}>
            {EMOTION_LABELS[trade.emotional_state]?.split(" ").slice(1).join(" ")}
          </span>
        ) : <span style={{ color: "#334155", fontSize: "12px" }}>—</span>}
      </div>
      <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
        {confirmDelete ? (
          <>
            <button onClick={onDeleteConfirm} disabled={deleting} title="Confirm delete" style={{ background: "#EF4444", border: "none", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "white" }}>
              <Check style={{ width: "12px", height: "12px" }} />
            </button>
            <button onClick={onDeleteCancel} title="Cancel" style={{ background: "#1E293B", border: "none", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#94A3B8" }}>
              <X style={{ width: "12px", height: "12px" }} />
            </button>
          </>
        ) : (
          <>
            <button onClick={onEdit} title="Edit" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}>
              <Edit3 style={{ width: "14px", height: "14px" }} />
            </button>
            <button onClick={onDeleteRequest} title="Delete" style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}>
              <Trash2 style={{ width: "14px", height: "14px" }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const paginationBtn = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#0B0F19" : "#14181F",
  border: "1px solid #1E293B",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: disabled ? "not-allowed" : "pointer",
  color: disabled ? "#334155" : "#94A3B8",
  display: "flex",
  alignItems: "center",
});

// ── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const { data: settings, isLoading } = useCoachingSettings();
  const mutation = useUpdateCoachingSettings();
  const [saved, setSaved] = useState(false);

  const toggle = async () => {
    if (!settings) return;
    const newVal = !settings.journal_coaching_access;
    await mutation.mutateAsync({ journal_coaching_access: newVal });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) return <LoadingSpinner />;

  const isOn = settings?.journal_coaching_access ?? false;

  return (
    <div style={{ maxWidth: "600px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Coaching access */}
      <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "16px" }}>
          <div>
            <div style={{ color: "white", fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>Coaching Access</div>
            <div style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.5" }}>
              Allow OrcaTrading staff to review your journal data for educational and coaching purposes.
              Your data remains private and is never shared with third parties.
            </div>
          </div>
          <ToggleSwitch checked={isOn} onChange={toggle} disabled={mutation.isPending} />
        </div>

        <div style={{ background: "#0B0F19", borderRadius: "8px", padding: "14px 16px", border: "1px solid #1E293B" }}>
          <div style={{ color: "#94A3B8", fontSize: "12px", marginBottom: "10px", fontWeight: 600 }}>
            {isOn ? "✅ Access Enabled — Staff can review:" : "🔒 Private Mode — Only you can see your data"}
          </div>
          {isOn && (
            <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#64748B", fontSize: "13px", lineHeight: "1.8" }}>
              <li>Trade History</li>
              <li>Analytics & Performance</li>
              <li>Psychology Tracking</li>
            </ul>
          )}
        </div>

        {isOn && (
          <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(0,212,255,0.08)", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.2)" }}>
            <div style={{ color: "#94A3B8", fontSize: "12px", lineHeight: "1.6" }}>
              By enabling this, you confirm:&nbsp;
              <em style={{ color: "#64748B" }}>Your data will remain confidential. It will never be sold or shared with third parties. Access may be revoked at any time.</em>
            </div>
          </div>
        )}

        {saved && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "13px" }}>
            <Check style={{ width: "14px", height: "14px" }} />
            Settings saved
          </div>
        )}
      </div>

      {/* Phase 2 preview */}
      <div style={{ background: "#14181F", border: "1px dashed #1E293B", borderRadius: "12px", padding: "24px", opacity: 0.6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ background: "#1E293B", color: "#64748B", fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "4px" }}>COMING SOON</span>
          <span style={{ color: "#94A3B8", fontSize: "15px", fontWeight: 600 }}>cTrader Integration</span>
        </div>
        <div style={{ color: "#64748B", fontSize: "13px", lineHeight: "1.6" }}>
          Connect your cTrader account to automatically sync all trades — no manual entry required.
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "99px",
        border: "none",
        background: checked ? "#10B981" : "#1E293B",
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
        outline: "none",
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: checked ? "24px" : "3px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px" }}>
      <div style={{
        width: "32px", height: "32px",
        border: "3px solid #1E293B",
        borderTopColor: "#00D4FF",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

type Tab = "dashboard" | "history" | "settings";

export default function JournalSection() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);

  const openEdit = useCallback((trade: Trade) => {
    setEditTrade(trade);
    setShowForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditTrade(null);
  }, []);

  const TABS: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "history", label: "Trade History" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            borderRadius: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen style={{ width: "20px", height: "20px", color: "white" }} />
          </div>
          <div>
            <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0 }}>OrcaJournal</h1>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0 }}>Track, analyse and improve your trading</p>
          </div>
        </div>

        <button
          onClick={() => { setEditTrade(null); setShowForm(true); }}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            border: "none", borderRadius: "10px",
            padding: "10px 18px",
            color: "white", fontSize: "14px", fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus style={{ width: "16px", height: "16px" }} />
          Log Trade
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #1E293B", paddingBottom: "0" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #8B5CF6" : "2px solid transparent",
              color: activeTab === tab.id ? "white" : "#64748B",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "dashboard" && <DashboardTab />}
      {activeTab === "history" && <HistoryTab onEdit={openEdit} />}
      {activeTab === "settings" && <SettingsTab />}

      {/* Trade form modal */}
      {showForm && (
        <TradeFormModal
          initial={editTrade ?? undefined}
          onClose={closeForm}
          onSaved={closeForm}
        />
      )}
    </div>
  );
}
