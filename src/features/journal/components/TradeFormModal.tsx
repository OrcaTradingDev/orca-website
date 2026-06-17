"use client";

import { useState } from "react";
import { X, AlertCircle, Zap, RotateCcw } from "lucide-react";
import { useCreateTrade, useUpdateTrade } from "../hooks/useJournal";
import { calcRR, calcPnL } from "../utils/tradeCalc";
import type {
  Direction, EmotionalState, Session, Trade, TradeCreatePayload, TradeStatus,
} from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const EMOTION_LABELS: Record<string, string> = {
  CALM: "😌 Calm", NEUTRAL: "😐 Neutral", ANXIOUS: "😰 Anxious",
  EXCITED: "😄 Excited", FEARFUL: "😨 Fearful", FRUSTRATED: "😤 Frustrated", GREEDY: "🤑 Greedy",
};

const today = () => new Date().toISOString().split("T")[0];

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
        {hint && <span style={{ color: "#475569", fontSize: "11px", fontStyle: "italic" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ── Live R:R display ──────────────────────────────────────────────────────────

function RRField({
  autoRR, manualRR, onManualChange, onClear,
}: {
  autoRR: number | null;
  manualRR: number | null;
  onManualChange: (v: number | null) => void;
  onClear: () => void;
}) {
  const displayValue = manualRR ?? "";
  const placeholder  = autoRR != null ? `${autoRR} (auto)` : "e.g. 1.5";
  const isAuto       = manualRR == null && autoRR != null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>R:R Achieved</label>
        {isAuto && (
          <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#6366F1", fontSize: "11px", fontWeight: 600 }}>
            <Zap style={{ width: "10px", height: "10px" }} /> auto
          </span>
        )}
        {manualRR != null && autoRR != null && (
          <button
            type="button"
            onClick={onClear}
            title="Reset to auto-calculated value"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", padding: "0", display: "flex", alignItems: "center", gap: "3px", fontSize: "11px" }}
          >
            <RotateCcw style={{ width: "10px", height: "10px" }} /> use auto ({autoRR})
          </button>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type="number" step="any"
          value={displayValue}
          placeholder={placeholder}
          onChange={(e) => onManualChange(e.target.value === "" ? null : parseFloat(e.target.value))}
          style={{
            ...inputStyle,
            borderColor: isAuto ? "#6366F150" : "#1E293B",
            paddingRight: isAuto ? "52px" : "12px",
          }}
        />
        {isAuto && (
          <div style={{
            position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
            color: "#6366F1", fontWeight: 700, fontSize: "13px", pointerEvents: "none",
          }}>
            {autoRR}R
          </div>
        )}
      </div>
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

  const set = <K extends keyof TradeCreatePayload>(k: K, v: TradeCreatePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const numOrNull = (s: string) => (s === "" ? null : parseFloat(s));

  // ── Live auto-calculations (recompute every render — no stale useEffect) ───
  // SL and TP are dollar amounts, so R:R = TP$ / SL$
  const autoRR  = calcRR(form.stop_loss ?? null, form.take_profit ?? null);
  const autoPnL = calcPnL(form.entry_price ?? null, form.exit_price ?? null, form.lot_size ?? null, form.direction);

  // The effective values used at submit time
  const effectiveRR  = form.rr  ?? autoRR;
  const effectivePnL = form.pnl ?? autoPnL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.market.trim()) { setError("Market is required"); return; }
    const payload: TradeCreatePayload = {
      ...form,
      rr:  effectiveRR,
      pnl: effectivePnL,
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
          width: "100%", maxWidth: "660px", padding: "28px", margin: "auto",
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

          {/* ── Trade Setup ───────────────────────────────────────────── */}
          <div style={{ background: "#0B0F19", border: "1px solid #1E293B", borderRadius: "12px", padding: "16px" }}>
            <div style={{ color: "#64748B", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              Trade Setup
              {autoRR != null && (
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", color: "#6366F1", fontWeight: 700, fontSize: "12px", letterSpacing: 0 }}>
                  <Zap style={{ width: "11px", height: "11px" }} />
                  R:R = {autoRR}
                </span>
              )}
            </div>

            {/* SL $ / TP $ / Entry price */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <FormGroup label="Stop Loss ($)" hint="dollars at risk">
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#EF4444", fontSize: "13px", pointerEvents: "none" }}>$</span>
                  <input type="number" step="any" placeholder="50.00"
                    value={form.stop_loss ?? ""}
                    onChange={(e) => set("stop_loss", numOrNull(e.target.value))}
                    style={{ ...inputStyle, paddingLeft: "22px", borderColor: form.stop_loss ? "#EF444450" : "#1E293B" }} />
                </div>
              </FormGroup>
              <FormGroup label="Take Profit ($)" hint="dollars targeted">
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#10B981", fontSize: "13px", pointerEvents: "none" }}>$</span>
                  <input type="number" step="any" placeholder="150.00"
                    value={form.take_profit ?? ""}
                    onChange={(e) => set("take_profit", numOrNull(e.target.value))}
                    style={{ ...inputStyle, paddingLeft: "22px", borderColor: form.take_profit ? "#10B98150" : "#1E293B" }} />
                </div>
              </FormGroup>
              <FormGroup label="Entry Price" hint="optional">
                <input type="number" step="any" placeholder="0.00000"
                  value={form.entry_price ?? ""}
                  onChange={(e) => set("entry_price", numOrNull(e.target.value))}
                  style={inputStyle} />
              </FormGroup>
            </div>

            {/* Visual R:R bar */}
            {autoRR != null && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "2px", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ flex: 1, background: "#EF4444", opacity: 0.7 }} title="Risk" />
                  <div style={{ flex: Math.min(autoRR, 10), background: "#10B981", opacity: 0.7 }} title={`Reward (${autoRR}×)`} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  <span style={{ color: "#EF444490", fontSize: "10px" }}>Risk: ${form.stop_loss?.toFixed(2)}</span>
                  <span style={{ color: "#10B98190", fontSize: "10px" }}>Target: ${form.take_profit?.toFixed(2)} ({autoRR}R)</span>
                </div>
              </div>
            )}

            {/* Exit price + Lot size */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <FormGroup label="Exit Price" hint="optional">
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
          </div>

          {/* ── Results ───────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
            {/* PnL */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>PnL ($)</label>
                {form.pnl == null && autoPnL != null && (
                  <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#6366F1", fontSize: "11px", fontWeight: 600 }}>
                    <Zap style={{ width: "10px", height: "10px" }} /> auto
                  </span>
                )}
                {form.pnl != null && autoPnL != null && (
                  <button type="button" onClick={() => set("pnl", null)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#475569", fontSize: "11px", display: "flex", alignItems: "center", gap: "3px", padding: 0 }}>
                    <RotateCcw style={{ width: "10px", height: "10px" }} /> use auto
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input type="number" step="any"
                  value={form.pnl ?? ""}
                  placeholder={autoPnL != null ? `${autoPnL > 0 ? "+" : ""}${autoPnL}` : "+150.00"}
                  onChange={(e) => set("pnl", numOrNull(e.target.value))}
                  style={{
                    ...inputStyle,
                    borderColor: (form.pnl == null && autoPnL != null) ? "#6366F150" : "#1E293B",
                    paddingRight: (form.pnl == null && autoPnL != null) ? "60px" : "12px",
                  }}
                />
                {form.pnl == null && autoPnL != null && (
                  <div style={{
                    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
                    color: autoPnL >= 0 ? "#10B981" : "#EF4444", fontWeight: 700, fontSize: "12px", pointerEvents: "none",
                  }}>
                    {autoPnL >= 0 ? "+" : ""}${Math.abs(autoPnL).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* R:R */}
            <RRField
              autoRR={autoRR}
              manualRR={form.rr ?? null}
              onManualChange={(v) => set("rr", v)}
              onClear={() => set("rr", null)}
            />

            {/* Risk % */}
            <FormGroup label="Risk %">
              <input type="number" step="any" placeholder="e.g. 1.0"
                value={form.risk_pct ?? ""}
                onChange={(e) => set("risk_pct", numOrNull(e.target.value))}
                style={inputStyle} />
            </FormGroup>

            {/* Status */}
            <FormGroup label="Status">
              <select value={form.status}
                onChange={(e) => set("status", e.target.value as TradeStatus)}
                style={inputStyle}>
                <option value="CLOSED">Closed</option>
                <option value="OPEN">Open</option>
              </select>
            </FormGroup>
          </div>

          {/* ── Psychology ────────────────────────────────────────────── */}
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
