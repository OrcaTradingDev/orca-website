"use client";

import { useState } from "react";
import { Upload, CheckCircle, FileText, AlertCircle } from "lucide-react";
import ImportCSVModal from "./ImportCSVModal";

interface Props {
  onImported: () => void;
}

export default function JournalImportView({ onImported }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [lastResult, setLastResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleImported = (result?: { imported: number; skipped: number }) => {
    setShowModal(false);
    if (result) {
      setLastResult(result);
    }
    onImported();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "720px" }}>
      {/* Page header */}
      <div>
        <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0 }}>Import Trades</h1>
        <p style={{ color: "#64748B", fontSize: "13px", margin: "2px 0 0" }}>
          Import your existing trades from cTrader or any compatible CSV / XLSX file
        </p>
      </div>

      {/* Success banner */}
      {lastResult && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "10px", padding: "14px 18px",
        }}>
          <CheckCircle style={{ width: "18px", height: "18px", color: "#10B981", flexShrink: 0 }} />
          <div>
            <div style={{ color: "#10B981", fontWeight: 600, fontSize: "14px" }}>Import complete</div>
            <div style={{ color: "#64748B", fontSize: "13px" }}>
              {lastResult.imported} trade{lastResult.imported !== 1 ? "s" : ""} imported
              {lastResult.skipped > 0 ? `, ${lastResult.skipped} skipped` : ""}
            </div>
          </div>
        </div>
      )}

      {/* Main upload card */}
      <div style={{
        background: "#14181F", border: "2px dashed #1E293B", borderRadius: "16px",
        padding: "48px 32px", textAlign: "center",
        transition: "border-color 0.2s",
      }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "linear-gradient(135deg, #6366F120 0%, #8B5CF620 100%)",
          border: "1px solid #6366F130",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Upload style={{ width: "28px", height: "28px", color: "#8B5CF6" }} />
        </div>

        <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
          Upload CSV or XLSX
        </h2>
        <p style={{ color: "#64748B", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px", maxWidth: "440px", margin: "0 auto 24px" }}>
          Drag and drop your cTrader export or click below to browse.
          Supports CSV and Excel (.xlsx / .xls) formats.
        </p>

        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            border: "none", borderRadius: "10px", padding: "12px 24px",
            color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          <Upload style={{ width: "16px", height: "16px" }} />
          Choose File
        </button>
      </div>

      {/* Format guide */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
      }}>
        <FormatCard
          icon="📊"
          title="cTrader Export"
          desc="Go to History → Export → CSV. Both Desktop and Web app exports are supported."
          supported
        />
        <FormatCard
          icon="📋"
          title="Custom CSV / XLSX"
          desc="Any spreadsheet with columns: Symbol, Direction, Entry Price, Exit Price, P&L, Date."
          supported
        />
        <FormatCard
          icon="🔜"
          title="MT4 / MT5"
          desc="MetaTrader statement export coming soon."
          supported={false}
        />
        <FormatCard
          icon="🔜"
          title="Direct API Sync"
          desc="Connect your broker directly — no manual exports. Coming in a future phase."
          supported={false}
        />
      </div>

      {/* Tips */}
      <div style={{
        background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <AlertCircle style={{ width: "15px", height: "15px", color: "#6366F1" }} />
          <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>Import Tips</span>
        </div>
        <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#64748B", fontSize: "13px", lineHeight: 2 }}>
          <li>Duplicate trades (same symbol + date + entry price) are automatically skipped</li>
          <li>Trades with no P&L or 0 volume are skipped</li>
          <li>Orca snapshots are <em>not</em> captured on imported trades — only on manually logged ones</li>
          <li>You can re-upload the same file safely; duplicates won't be double-counted</li>
        </ul>
      </div>

      {showModal && (
        <ImportCSVModal
          onClose={() => setShowModal(false)}
          onImported={() => handleImported()}
        />
      )}
    </div>
  );
}

function FormatCard({
  icon, title, desc, supported,
}: {
  icon: string; title: string; desc: string; supported: boolean;
}) {
  return (
    <div style={{
      background: supported ? "#14181F" : "#0F1419",
      border: `1px solid ${supported ? "#1E293B" : "#141A22"}`,
      borderRadius: "12px", padding: "18px 20px",
      opacity: supported ? 1 : 0.55,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "20px" }}>{icon}</span>
        <span style={{ color: supported ? "white" : "#64748B", fontWeight: 600, fontSize: "14px" }}>{title}</span>
        {supported && (
          <span style={{
            marginLeft: "auto", fontSize: "10px", fontWeight: 700, padding: "2px 6px",
            background: "#10B98118", color: "#10B981", borderRadius: "3px",
          }}>SUPPORTED</span>
        )}
      </div>
      <p style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.5, margin: 0 }}>{desc}</p>
    </div>
  );
}
