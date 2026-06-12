"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Zap } from "lucide-react";
import { useCreateTrade, useUpdateTrade } from "../hooks/useJournal";
import type {
  Direction, EmotionalState, Session, Trade, TradeCreatePayload, TradeStatus,
} from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMOTION_LABELS: Record<string, string> = {
  CALM: "😌 Calm", NEUTRAL: "😐 Neutral", ANXIOUS: "😰 Anxious",
  EXCITED: "😄 Excited", FEARFUL: "😨 Fearful", FRUSTRATED: "😤 Frustrated", GREEDY: "🤑 Greedy",
};

const today = () => new Date().toISOString().split("T")[0];

/** Auto-calc R:R from entry / SL / TP */
function calcRR(entry: number | null, sl: number | null, tp: number | null, dir: Direction): number | null {
  if (entry == null || sl == null || tp == null) return null;
  const risk   = dir === "LONG" ? entry - sl : sl - entry;
  const reward = dir === "LONG" ? tp - entry : entry - tp;
  if (risk <= 0 || reward <= 0) return null;
  return parseFloat((reward / risk).toFixed(2));
}

/** Auto-calc PnL from entry / exit / lot_size */
function calcPnL(entry: number | null, exit: number | null, lot: number | null, dir: Direction): number | null {
  if (entry == null || exit == null || lot == null || lot <= 0) return null;
  const raw = (exit - entry) * lot;
  return parseFloat((dir === "LONG" ? raw : -raw).toFixed(2));
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: "#0B0F19", border: "1px solid #1E293B", borderRadius: "8px",
  padding: "10px 12px", color: "white", fontSize: "13px",
  width: "100%", boxSizing: "border-box", outline: "none",
};

const cancelBtnStyle: React.CSSProperties = {
  background: "transparent", border: "1px solid #1E293B", borderRadius: "8px",
  padding: "10px 20px", color: "#94A3B8", fontSize: "14px", fontWeight: 500, cursor: "pointer",
};

const saveBtnStyle = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#1E293B" : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  border: "none", borderRadius: "8px", padding: "10px 24px",
  color: disabled ? "#64748B" : "white", fontSize: "14px", fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});

// ── Form group ────────────────────────────────────────────────────────────────

function FormGroup({ label, children, style, hint }: {
  label: string; children: React.ReactNode;
  style?: React.CSSProperties; hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ color: "#475569", fontSize: "11px" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Auto-calc badge ───────────────────────────────────────────────────────────

function AutoBadge({ value, label }: { value: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: "8px", padding: "8px 12px",
    }}>
      <Zap style={{ width: "13px", height: "13px", color: "#6366F1", flexShrink: 0 }} />
      <span style={{ color: "#A5B4FC", fontSize: "12px" }}>Auto: </span>
      <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>{value}</span>
      <span style={{ color: "#475569", fontSize: "11px", marginLeft: "auto" }}>{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props { initial?: Trade; onClose: () => void; onSaved: () => void; }

export function TradeFormModal({ initial, onClose, onSaved }: Props) {
  const createMutation = useCreateTrade();
  const updateMutation = useUpdateTrade();

  const [form, setForm] = useState<TradeCreatePayload>({
    market:          initial?.market            ?? "",
    direction:       initial?.direction          ?? "LONG",
    entry_price:     initial?.entry_price        ? parseFloat(initial.entry_price)    : null,
    stop_loss:       initial?.stop_loss          ? parseFloat(initial.stop_loss)       : null,
    take_profit:     initial?.take_profit        ? parseFloat(initial.take_profit)     : null,
    exit_price:      initial?.exit_price         ? parseFloat(initial.exit_price)      : null,
    lot_size:        initial?.lot_size           ? parseFloat(initial.lot_size)        : null,
    pnl:             initial?.pnl                ? parseFloat(initial.pnl)             : null,
    rr:              initial?.rr                 ? parseFloat(initial.rr)              : null,
    risk_pct:        initial?.risk_pct           ? parseFloat(initial.risk_pct)        : null,
    session:         initial?.session             ?? null,
    status:          initial?.status              ?? "CLOSED",
    confidence:      initial?.confidence          ?? null,
    emotional_state: initial?.emotional_state     ?? null,
    stress_level:    initial?.stress_level        ?? null,
    notes:           initial?.notes               ?? null,
    trade_date:      initial?.trade_date           ?? today(),
  });

  const [error, setError] = useState<string | null>(null);

  // ── Auto-calculation ───────────────────────────────────────────────────────
  const autoRR  = calcRR(form.entry_price ?? null, form.stop_loss ?? null, form.take_profit ?? null, form.direction);
  const autoPnL = calcPnL(form.entry_price ?? null, form.exit_price ?? null, form.lot_size ?? null, form.direction);

  // Fill R:R field when auto value changes and user hasn't manually set it
  useEffect(() => {
    if (autoRR != null && form.rr == null) {
      setForm((f) => ({ ...f, rr: autoRR }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRR]);

  // Fill PnL field when auto value changes and user hasn't manually set it
  useEffect(() => {
    if (autoPnL != null && form.pnl == null) {
      setForm((f) => ({ ...f, pnl: autoPnL }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPnL]);

  const set = <K extends keyof TradeCreatePayload>(k: K, v: TradeCreatePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numOrNull = (s: string) => (s === "" ? null : parseFloat(s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.market.trim()) { setError("Market is required"); return; }
    // Snap auto-calculated values in at submit time
    const payload: TradeCreatePayload = {
      ...form,
      rr:  form.rr  ?? autoRR  ?? null,
      pnl: form.pnl ?? autoPnL ?? null,
    };
    try {
      if (initial) {
        await updateMutation.mutateAsync({ id: initial.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
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
        padding: "16px", overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#14181F", border: "1px solid #1E293B", borderRadius: "16px",
          width: "100%", maxWidth: "660px", padding: "28px",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, margin: 0 }}>
            {initial ? "Edit Trade" : "Log New Trade"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}>
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* ── Row 1: Market + Direction ─────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormGroup label="Market *">
              <input
                type="text" placeholder="e.g. EUR/USD, SPX, AAPL"
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
                style={inputStyle} autoFocus
              />
            </FormGroup>
            <FormGroup label="Direction *">
              <div style={{ display: "flex", gap: "8px" }}>
                {(["LONG", "SHORT"] as Direction[]).map((d) => (
                  <button key={d} type="button" onClick={() => set("direction", d)} style={{
                    flex: 1, padding: "10px", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    border: form.direction === d ? "none" : "1px solid #1E293B",
                    background: form.direction === d ? (d === "LONG" ? "#10B981" : "#EF4444") : "#0B0F19",
                    color: form.direction === d ? "white" : "#94A3B8",
                    transition: "all 0.15s",
                  }}>
                    {d === "LONG" ? "▲ LONG" : "▼ SHORT"}
                  </button>
                ))}
              </div>
            </FormGroup>
          </div>

          {/* ── Row 2: Date + Session ─────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <FormGroup label="Trade Date *">
              <input type="date" value={form.trade_date}
                onChange={(e) => set("trade_date", e.target.value)} style={inputStyle} />
            </FormGroup>
            <FormGroup label="Session">
              <select value={form.session ?? ""} onChange={(e) => set("session", (e.target.value || null) as Session | null)} style={inputStyle}>
                <option value="">Select session…</option>
                <option value="LONDON">London</option>
                <option value="NEW_YORK">New York</option>
                <option value="ASIAN">Asian</option>
                <option value="OTHER">Other</option>
              </select>
            </FormGroup>
          </div>

          {/* ── Section: Prices ───────────────────────────────────────── */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: "16px" }}>
            <div style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Price Levels
            </div>

            {/* Entry / SL / TP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <FormGroup label="Entry Price">
                <input type="number" step="any" placeholder="0.00000"
                  value={form.entry_price ?? ""}
                  onChange={(e) => set("entry_price", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
              <FormGroup label="Stop Loss (SL)" hint="risk">
                <input type="number" step="any" placeholder="0.00000"
                  value={form.stop_loss ?? ""}
                  onChange={(e) => set("stop_loss", numOrNull(e.target.value))}
                  style={{ ...inputStyle, borderColor: form.stop_loss ? "#EF444440" : "#1E293B" }} />
              </FormGroup>
              <FormGroup label="Take Profit (TP)" hint="target">
                <input type="number" step="any" placeholder="0.00000"
                  value={form.take_profit ?? ""}
                  onChange={(e) => set("take_profit", numOrNull(e.target.value))}
                  style={{ ...inputStyle, borderColor: form.take_profit ? "#10B98140" : "#1E293B" }} />
              </FormGroup>
            </div>

            {/* Exit + Lot Size */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <FormGroup label="Exit Price">
                <input type="number" step="any" placeholder="0.00000"
                  value={form.exit_price ?? ""}
                  onChange={(e) => set("exit_price", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
              <FormGroup label="Lot / Position Size" hint="for PnL calc">
                <input type="number" step="any" placeholder="e.g. 0.10"
                  value={form.lot_size ?? ""}
                  onChange={(e) => set("lot_size", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
            </div>

            {/* Auto-calc hints */}
            {(autoRR != null || autoPnL != null) && (
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                {autoRR != null && (
                  <div style={{ flex: 1 }}>
                    <AutoBadge value={`${autoRR}R`} label="Planned R:R" />
                  </div>
                )}
                {autoPnL != null && (
                  <div style={{ flex: 1 }}>
                    <AutoBadge
                      value={`${autoPnL >= 0 ? "+" : ""}$${Math.abs(autoPnL).toFixed(2)}`}
                      label="Est. PnL"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Section: Results ──────────────────────────────────────── */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: "16px" }}>
            <div style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Results
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
              <FormGroup label="PnL ($)" hint={autoPnL != null && form.pnl == null ? "auto-filled" : undefined}>
                <input type="number" step="any" placeholder={autoPnL != null ? String(autoPnL) : "+150.00"}
                  value={form.pnl ?? ""}
                  onChange={(e) => set("pnl", numOrNull(e.target.value))}
                  style={{ ...inputStyle, borderColor: (form.pnl ?? autoPnL) != null ? "#6366F140" : "#1E293B" }} />
              </FormGroup>
              <FormGroup label="R:R Achieved" hint={autoRR != null && form.rr == null ? "auto-filled" : undefined}>
                <input type="number" step="any" placeholder={autoRR != null ? String(autoRR) : "1.5"}
                  value={form.rr ?? ""}
                  onChange={(e) => set("rr", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
              <FormGroup label="Risk %">
                <input type="number" step="any" placeholder="e.g. 1.0"
                  value={form.risk_pct ?? ""}
                  onChange={(e) => set("risk_pct", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
              <FormGroup label="Status">
                <select value={form.status}
                  onChange={(e) => set("status", e.target.value as TradeStatus)}
                  style={inputStyle}>
                  <option value="CLOSED">Closed</option>
                  <option value="OPEN">Open</option>
                </select>
              </FormGroup>
            </div>
          </div>

          {/* ── Section: Psychology ───────────────────────────────────── */}
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: "16px" }}>
            <div style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Psychology (optional)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <FormGroup label="Emotional State">
                <select value={form.emotional_state ?? ""}
                  onChange={(e) => set("emotional_state", (e.target.value || null) as EmotionalState | null)}
                  style={inputStyle}>
                  <option value="">Select…</option>
                  {Object.entries(EMOTION_LABELS).map(([v, label]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </FormGroup>
              <div style={{ display: "flex", gap: "12px" }}>
                <FormGroup label={`Confidence: ${form.confidence ?? "—"}/10`} style={{ flex: 1 }}>
                  <input type="range" min="1" max="10" step="1"
                    value={form.confidence ?? 5}
                    onChange={(e) => set("confidence", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#6366F1", marginTop: "6px" }} />
                </FormGroup>
                <FormGroup label={`Stress: ${form.stress_level ?? "—"}/10`} style={{ flex: 1 }}>
                  <input type="range" min="1" max="10" step="1"
                    value={form.stress_level ?? 5}
                    onChange={(e) => set("stress_level", parseInt(e.target.value))}
                    style={{ width: "100%", accentColor: "#F97316", marginTop: "6px" }} />
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
