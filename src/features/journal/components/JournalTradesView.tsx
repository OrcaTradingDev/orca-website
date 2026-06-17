"use client";

import { useState, useRef } from "react";
import {
  Search, ChevronLeft, ChevronRight,
  Edit3, Trash2, X, Check, Upload,
} from "lucide-react";
import { useJournalTrades, useDeleteTrade, useUpdateTrade } from "../hooks/useJournal";
import { calcRR } from "../utils/tradeCalc";
import ImportCSVModal from "./ImportCSVModal";
import type { Trade, TradeUpdatePayload } from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined) => {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(2)}`;
  return n < 0 ? `−${s}` : `+${s}`;
};

const pnlColor = (v: number | null | undefined) => {
  if (v == null) return "#94A3B8";
  return v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "#94A3B8";
};

const EMOTION_LABELS: Record<string, string> = {
  CALM: "Calm", NEUTRAL: "Neutral", ANXIOUS: "Anxious",
  EXCITED: "Excited", FEARFUL: "Fearful", FRUSTRATED: "Frustrated", GREEDY: "Greedy",
};

const EMOTION_COLORS: Record<string, string> = {
  CALM: "#10B981", NEUTRAL: "#94A3B8", ANXIOUS: "#F97316",
  EXCITED: "#3B82F6", FEARFUL: "#EF4444", FRUSTRATED: "#F59E0B", GREEDY: "#8B5CF6",
};

const inputStyle: React.CSSProperties = {
  background: "#14181F",
  border: "1px solid #1E293B",
  borderRadius: "8px",
  padding: "9px 12px",
  color: "white",
  fontSize: "13px",
  outline: "none",
};

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

// ── Filter select ─────────────────────────────────────────────────────────────

function FilterSelect({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, minWidth: "130px" }}
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}

// ── Orca score badge ──────────────────────────────────────────────────────────

function OrcaScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span style={{ color: "#334155", fontSize: "12px" }}>—</span>;
  const color = score >= 70 ? "#10B981" : score >= 50 ? "#F59E0B" : score >= 30 ? "#F97316" : "#64748B";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "36px", height: "22px", borderRadius: "6px",
      background: `${color}20`, color, fontSize: "12px", fontWeight: 700,
    }}>
      {score}
    </span>
  );
}

function OrcaStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span style={{ color: "#334155", fontSize: "12px" }}>—</span>;
  const colors: Record<string, string> = { ON: "#10B981", WATCH: "#F59E0B", OFF: "#64748B" };
  const c = colors[status] ?? "#64748B";
  return (
    <span style={{
      padding: "2px 7px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
      background: `${c}20`, color: c,
    }}>
      {status}
    </span>
  );
}

// ── Inline price cell ─────────────────────────────────────────────────────────

/**
 * A table cell that shows a price (or "— add") and lets the user click to
 * edit it inline. Used for SL and TP on imported trades.
 */
function InlinePrice({
  value, color, label, onSave,
}: {
  value: number | null;
  color: string;
  label: string;
  onSave: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");
  const inputRef              = useRef<HTMLInputElement>(null);

  const open = () => {
    setDraft(value != null ? String(value) : "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n !== value) onSave(n);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step="any"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") setEditing(false);
        }}
        style={{
          background: "#0B0F19", border: `1px solid ${color}60`,
          borderRadius: "5px", padding: "3px 6px", color: "white",
          fontSize: "11px", width: "72px", outline: "none",
        }}
      />
    );
  }

  if (value != null) {
    return (
      <span
        onClick={open}
        title={`Click to edit ${label}`}
        style={{ color, fontSize: "11px", cursor: "pointer" }}
      >
        {value.toFixed(5)}
      </span>
    );
  }

  return (
    <span
      onClick={open}
      title={`Click to add ${label}`}
      style={{
        color: "#334155", fontSize: "11px", cursor: "pointer",
        borderBottom: "1px dashed #334155",
      }}
    >
      + add
    </span>
  );
}

// ── Trade row ─────────────────────────────────────────────────────────────────

const COLS = "80px 1fr 52px 72px 70px 70px 72px 68px 52px 52px 80px 70px";

function TradeRow({
  trade, onEdit, confirmDelete, onDeleteRequest, onDeleteConfirm, onDeleteCancel, deleting,
}: {
  trade: Trade;
  onEdit: () => void;
  confirmDelete: boolean;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  deleting: boolean;
}) {
  const updateMutation = useUpdateTrade();

  const pnl   = trade.pnl        != null ? parseFloat(trade.pnl)        : null;
  const rr    = trade.rr         != null ? parseFloat(trade.rr)         : null;
  const sl    = trade.stop_loss   != null ? parseFloat(trade.stop_loss)   : null;
  const tp    = trade.take_profit != null ? parseFloat(trade.take_profit) : null;
  const entry = trade.entry_price != null ? parseFloat(trade.entry_price) : null;

  /** Save a single price field and auto-compute R:R if we now have all three */
  const savePrice = async (field: "stop_loss" | "take_profit", newVal: number) => {
    const newSL = field === "stop_loss"   ? newVal : sl;
    const newTP = field === "take_profit" ? newVal : tp;
    const payload: TradeUpdatePayload = { [field]: newVal };
    const autoRR = calcRR(entry, newSL, newTP, trade.direction);
    if (autoRR != null) payload.rr = autoRR;
    await updateMutation.mutateAsync({ id: trade.id, payload });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLS,
        padding: "10px 16px",
        borderBottom: "1px solid #0F1822",
        alignItems: "center",
        gap: "8px",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0F1822")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ color: "#64748B", fontSize: "11px" }}>{trade.trade_date}</div>

      <div style={{ minWidth: 0 }}>
        <div style={{ color: "white", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {trade.market}
        </div>
        {trade.notes && (
          <div style={{ color: "#475569", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {trade.notes}
          </div>
        )}
      </div>

      <span style={{
        fontSize: "10px", fontWeight: 700, padding: "2px 4px", borderRadius: "4px", display: "inline-block",
        background: trade.direction === "LONG" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        color: trade.direction === "LONG" ? "#10B981" : "#EF4444",
      }}>
        {trade.direction === "LONG" ? "▲L" : "▼S"}
      </span>

      {/* Entry */}
      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
        {entry != null ? entry.toFixed(5) : "—"}
      </div>

      {/* SL — inline editable */}
      <InlinePrice
        value={sl}
        color="#EF4444"
        label="Stop Loss"
        onSave={(v) => savePrice("stop_loss", v)}
      />

      {/* TP — inline editable */}
      <InlinePrice
        value={tp}
        color="#10B981"
        label="Take Profit"
        onSave={(v) => savePrice("take_profit", v)}
      />

      {/* Exit */}
      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
        {trade.exit_price ? parseFloat(trade.exit_price).toFixed(5) : "—"}
      </div>

      {/* PnL */}
      <div style={{ color: pnlColor(pnl), fontSize: "12px", fontWeight: 600 }}>
        {fmt(pnl)}
      </div>

      {/* R:R */}
      <div style={{ color: "#94A3B8", fontSize: "11px" }}>
        {rr != null ? `${rr.toFixed(2)}R` : "—"}
      </div>

      <OrcaScoreBadge score={trade.orca_score} />
      <OrcaStatusBadge status={trade.orca_status} />

      <div>
        {trade.emotional_state ? (
          <span style={{
            fontSize: "11px", padding: "2px 7px", borderRadius: "99px",
            background: `${EMOTION_COLORS[trade.emotional_state] ?? "#64748B"}20`,
            color: EMOTION_COLORS[trade.emotional_state] ?? "#64748B",
          }}>
            {EMOTION_LABELS[trade.emotional_state] ?? trade.emotional_state}
          </span>
        ) : <span style={{ color: "#334155", fontSize: "12px" }}>—</span>}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
        {confirmDelete ? (
          <>
            <button
              onClick={onDeleteConfirm}
              disabled={deleting}
              title="Confirm delete"
              style={{ background: "#EF4444", border: "none", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "white" }}
            >
              <Check style={{ width: "12px", height: "12px" }} />
            </button>
            <button
              onClick={onDeleteCancel}
              title="Cancel"
              style={{ background: "#1E293B", border: "none", borderRadius: "6px", padding: "5px 8px", cursor: "pointer", color: "#94A3B8" }}
            >
              <X style={{ width: "12px", height: "12px" }} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              title="Edit"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}
            >
              <Edit3 style={{ width: "14px", height: "14px" }} />
            </button>
            <button
              onClick={onDeleteRequest}
              title="Delete"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: "4px" }}
            >
              <Trash2 style={{ width: "14px", height: "14px" }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface Props {
  onEdit: (trade: Trade) => void;
  onLogTrade: () => void;
}

export default function JournalTradesView({ onEdit, onLogTrade }: Props) {
  const PAGE_SIZE = 25;

  const [search, setSearch]           = useState("");
  const [dirFilter, setDirFilter]     = useState("");
  const [sessionFilter, setSession]   = useState("");
  const [statusFilter, setStatus]     = useState("");
  const [page, setPage]               = useState(1);
  const [showImport, setShowImport]   = useState(false);
  const [confirmDelete, setConfirm]   = useState<number | null>(null);

  const deleteMutation = useDeleteTrade();

  const { data, isLoading } = useJournalTrades({
    page,
    pageSize: PAGE_SIZE,
    search: search || undefined,
    direction: dirFilter || undefined,
    session: sessionFilter || undefined,
    status: statusFilter || undefined,
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync(id);
    setConfirm(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0 }}>Trades</h1>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "2px 0 0" }}>
            {data ? `${data.total} trade${data.total !== 1 ? "s" : ""} total` : "Your full trade history"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowImport(true)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "transparent", border: "1px solid #1E293B", borderRadius: "10px",
              padding: "10px 16px", color: "#94A3B8", fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            <Upload style={{ width: "14px", height: "14px" }} />
            Upload CSV or XLSX
          </button>
          <button
            onClick={onLogTrade}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              border: "none", borderRadius: "10px",
              padding: "10px 18px", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
            }}
          >
            + Log Trade
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "180px" }}>
          <Search style={{
            position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
            width: "14px", height: "14px", color: "#64748B",
          }} />
          <input
            type="text"
            placeholder="Search market…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ ...inputStyle, paddingLeft: "32px", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        <FilterSelect
          value={dirFilter}
          onChange={(v) => { setDirFilter(v); setPage(1); }}
          options={[["", "All Directions"], ["LONG", "Long"], ["SHORT", "Short"]]}
        />
        <FilterSelect
          value={sessionFilter}
          onChange={(v) => { setSession(v); setPage(1); }}
          options={[["", "All Sessions"], ["LONDON", "London"], ["NEW_YORK", "New York"], ["ASIAN", "Asian"], ["OTHER", "Other"]]}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={[["", "All Status"], ["CLOSED", "Closed"], ["OPEN", "Open"]]}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px" }}>
          <div style={{
            width: "28px", height: "28px", border: "3px solid #1E293B",
            borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !data || data.trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
          <div style={{ color: "white", fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>
            {search || dirFilter || sessionFilter || statusFilter ? "No trades match your filters" : "No trades yet"}
          </div>
          <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>
            {!(search || dirFilter || sessionFilter || statusFilter) && "Start logging trades to see them here."}
          </div>
          {!(search || dirFilter || sessionFilter || statusFilter) && (
            <button
              onClick={onLogTrade}
              style={{
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                border: "none", borderRadius: "10px", padding: "11px 22px",
                color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
              }}
            >
              Log Trade
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: COLS,
            padding: "10px 16px",
            borderBottom: "1px solid #1E293B",
            gap: "8px",
          }}>
            {["Date", "Market", "Dir", "Entry", "SL", "TP", "Exit", "PnL", "R:R", "Score", "Status", ""].map((h) => (
              <div key={h} style={{
                color: "#475569", fontSize: "10px", fontWeight: 600,
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}>
                {h}
              </div>
            ))}
          </div>

          {data.trades.map((trade) => (
            <TradeRow
              key={trade.id}
              trade={trade}
              onEdit={() => onEdit(trade)}
              confirmDelete={confirmDelete === trade.id}
              onDeleteRequest={() => setConfirm(trade.id)}
              onDeleteConfirm={() => handleDelete(trade.id)}
              onDeleteCancel={() => setConfirm(null)}
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
          <span style={{ color: "#94A3B8", fontSize: "13px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={paginationBtn(page === totalPages)}
          >
            <ChevronRight style={{ width: "14px", height: "14px" }} />
          </button>
        </div>
      )}

      {/* CSV/XLSX import modal */}
      {showImport && (
        <ImportCSVModal
          onClose={() => setShowImport(false)}
          onImported={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
