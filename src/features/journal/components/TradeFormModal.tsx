"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { useCreateTrade, useUpdateTrade } from "../hooks/useJournal";
import type {
  Direction, EmotionalState, Session, Trade, TradeCreatePayload, TradeStatus,
} from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMOTION_LABELS: Record<string, string> = {
  CALM: "😌 Calm",
  NEUTRAL: "😐 Neutral",
  ANXIOUS: "😰 Anxious",
  EXCITED: "😄 Excited",
  FEARFUL: "😨 Fearful",
  FRUSTRATED: "😤 Frustrated",
  GREEDY: "🤑 Greedy",
};

const today = () => new Date().toISOString().split("T")[0];

// ── Shared styles ─────────────────────────────────────────────────────────────

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
  background: disabled ? "#1E293B" : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  border: "none",
  borderRadius: "8px",
  padding: "10px 24px",
  color: disabled ? "#64748B" : "white",
  fontSize: "14px",
  fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

// ── Form group ────────────────────────────────────────────────────────────────

function FormGroup({
  label, children, style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", ...style }}>
      <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initial?: Trade;
  onClose: () => void;
  onSaved: () => void;
}

export function TradeFormModal({ initial, onClose, onSaved }: Props) {
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();

  const [form, setForm] = useState<TradeCreatePayload>({
    market:          initial?.market            ?? "",
    direction:       initial?.direction          ?? "LONG",
    entry_price:     initial?.entry_price        ? parseFloat(initial.entry_price)    : null,
    exit_price:      initial?.exit_price         ? parseFloat(initial.exit_price)     : null,
    pnl:             initial?.pnl                ? parseFloat(initial.pnl)            : null,
    rr:              initial?.rr                 ? parseFloat(initial.rr)             : null,
    risk_pct:        initial?.risk_pct           ? parseFloat(initial.risk_pct)       : null,
    session:         initial?.session             ?? null,
    status:          initial?.status              ?? "CLOSED",
    confidence:      initial?.confidence          ?? null,
    emotional_state: initial?.emotional_state     ?? null,
    stress_level:    initial?.stress_level        ?? null,
    notes:           initial?.notes               ?? null,
    trade_date:      initial?.trade_date           ?? today(),
  });

  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof TradeCreatePayload>(k: K, v: TradeCreatePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numOrNull = (s: string) => (s === "" ? null : parseFloat(s));

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
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#14181F", border: "1px solid #1E293B", borderRadius: "16px",
          width: "100%", maxWidth: "640px", maxHeight: "92vh", overflowY: "auto",
          padding: "28px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            {initial ? "Edit Trade" : "Log New Trade"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}
          >
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
                autoFocus
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
                      flex: 1, padding: "10px", borderRadius: "8px",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer",
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
                type="number" step="any" placeholder="0.00000"
                value={form.entry_price ?? ""}
                onChange={(e) => set("entry_price", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Exit Price">
              <input
                type="number" step="any" placeholder="0.00000"
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
                type="number" step="any" placeholder="+150.00"
                value={form.pnl ?? ""}
                onChange={(e) => set("pnl", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="R:R Achieved">
              <input
                type="number" step="any" placeholder="e.g. 1.5"
                value={form.rr ?? ""}
                onChange={(e) => set("rr", numOrNull(e.target.value))}
                style={inputStyle}
              />
            </FormGroup>
            <FormGroup label="Risk %">
              <input
                type="number" step="any" placeholder="e.g. 1.0"
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
                    padding: "8px 16px", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    border: form.status === s ? "none" : "1px solid #1E293B",
                    background: form.status === s
                      ? (s === "CLOSED" ? "#1E293B" : "#0EA5E9")
                      : "#0B0F19",
                    color: form.status === s ? "white" : "#64748B",
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormGroup>

          {/* Psychology section */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: "16px" }}>
            <div style={{
              color: "#475569", fontSize: "11px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px",
            }}>
              Psychology (optional)
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
                    style={{ width: "100%", accentColor: "#6366F1", marginTop: "6px" }}
                  />
                </FormGroup>
                <FormGroup label={`Stress: ${form.stress_level ?? "—"}/10`} style={{ flex: 1 }}>
                  <input
                    type="range" min="1" max="10" step="1"
                    value={form.stress_level ?? 5}
                    onChange={(e) => set("stress_level", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#F97316", marginTop: "6px" }}
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
              {busy ? "Saving…" : initial ? "Update Trade" : "Log Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
