"use client";

/**
 * ImportCSVModal
 *
 * Handles cTrader trade history CSV and Excel (.xlsx) imports.
 * Supported formats (detected automatically):
 *   - cTrader Desktop CSV: Position Id, Symbol, Direction, Volume (Lots),
 *                          Entry Price, Close Price, Open Time, Close Time,
 *                          Net Profit, Commission, Swap, Gross Profit
 *   - cTrader Web CSV:     Position ID, Symbol, Side, Lots,
 *                          Open Price, Close Price, Open Time, Close Time,
 *                          Profit, Commission, Swap, Net Profit
 *   - Excel (.xlsx):       Same column layouts as above, first sheet used
 *   - Generic:             Any file with Symbol/Market + Direction/Side + PnL columns
 */

import { useCallback, useRef, useState } from "react";
import { Upload, X, AlertCircle, CheckCircle, FileText, ChevronDown } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { bulkImportTrades } from "../services/journal";
import type { Direction, Session, TradeCreatePayload } from "../types/journal";

// ── cTrader CSV parser ────────────────────────────────────────────────────────

/**
 * Normalise a column header: lowercase, strip spaces/underscores/parens/units
 * so "Volume (Lots)" → "volumelots", "Net Profit" → "netprofit", etc.
 */
const norm = (s: string) =>
  s.toLowerCase().replace(/[\s_\-()]/g, "").replace(/lots$/, "").replace(/price$/, "price");

/**
 * Parse a number that may use either:
 *   - US/UK format:       "1,234.56"  (comma = thousands, dot = decimal)
 *   - European format:    "1.234,56"  or  "7291,93"  (comma = decimal)
 *
 * Rule: whichever separator appears LAST is the decimal separator.
 * If there is only a comma and no dot, it is the decimal separator.
 */
function parseNum(raw: string): number | null {
  const s = raw.trim();
  if (!s || s === "-" || s === "") return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot   = s.lastIndexOf(".");
  let normalised: string;
  if (lastComma > lastDot) {
    // Comma is the decimal separator (European): remove dots (thousands), replace comma with dot
    normalised = s.replace(/\./g, "").replace(",", ".");
  } else {
    // Dot is the decimal separator (or no decimal at all): remove commas (thousands)
    normalised = s.replace(/,/g, "");
  }
  const n = parseFloat(normalised);
  return isNaN(n) ? null : n;
}

const HEADER_MAP: Record<string, string> = {
  // Symbol
  symbol: "symbol",
  market: "symbol",
  instrument: "symbol",
  pair: "symbol",

  // Direction — plain and prefixed ("Opening direction", "Side", "Type", etc.)
  direction: "direction",
  side: "direction",
  tradeside: "direction",
  type: "direction",
  openingdirection: "direction",   // cTrader: "Opening direction"
  openingside: "direction",

  // Prices
  entryprice: "entry_price",
  openprice: "entry_price",
  openingprice: "entry_price",     // cTrader: "Opening price"
  closeprice: "exit_price",
  exitprice: "exit_price",
  closingprice: "exit_price",      // cTrader: "Closing price"

  // PnL — prefer net over gross
  netprofit: "pnl",
  netpl: "pnl",
  netpnl: "pnl",
  "net$": "pnl",                   // cTrader: "Net $"
  profit: "pnl",
  pnl: "pnl",
  pl: "pnl",
  grossprofit: "gross_profit",     // fallback
  "gross$": "gross_profit",        // cTrader: "Gross $"

  // Volume / lot size
  volumelots: "volume",
  volume: "volume",
  lots: "volume",
  quantity: "volume",
  size: "volume",

  // Time — plain and prefixed ("Opening time", "Closing time", etc.)
  opentime: "open_time",
  openingtime: "open_time",        // cTrader: "Opening time"
  entrytime: "open_time",
  opendate: "open_time",
  closetime: "close_time",
  closingtime: "close_time",       // cTrader: "Closing time"
  exittime: "close_time",
  closedate: "close_time",
  date: "open_time",
  time: "open_time",

  // Position id (mapped to avoid "unknown" warnings, value is ignored)
  positionid: "position_id",
  id: "position_id",
  dealid: "position_id",

  // Misc
  commission: "commission",
  swap: "swap",
  comment: "notes",
  notes: "notes",
  label: "notes",
};

interface ParsedRow {
  raw: Record<string, string>;       // original CSV row
  mapped: Partial<TradeCreatePayload>;
  warnings: string[];
  rowNum: number;
}

interface ParseResult {
  rows: ParsedRow[];
  headers: string[];
  unknownHeaders: string[];
  totalRows: number;
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().split("T")[0];
  // Try common formats: "DD/MM/YYYY HH:MM:SS", "YYYY-MM-DD HH:MM:SS", "MM/DD/YYYY"
  const cleaned = raw.trim();

  // ISO-like: 2026-06-10 ...
  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // DD/MM/YYYY or MM/DD/YYYY
  const dmy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    const [, a, b, year] = dmy;
    // heuristic: if a > 12 it must be day
    const [day, month] = parseInt(a) > 12 ? [a, b] : [b, a];
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Epoch ms
  const epoch = parseInt(cleaned);
  if (!isNaN(epoch) && epoch > 1_000_000_000_000) {
    return new Date(epoch).toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

function parseDirection(raw: string): Direction {
  const v = raw.trim().toLowerCase();
  if (v === "buy" || v === "long" || v === "b") return "LONG";
  if (v === "sell" || v === "short" || v === "s") return "SHORT";
  return "LONG"; // default
}

function parseSession(openTime: string | undefined): Session | null {
  if (!openTime) return null;
  const timeMatch = openTime.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  const hour = parseInt(timeMatch[1]);
  if (hour >= 7 && hour < 16) return "LONDON";
  if (hour >= 13 && hour < 22) return "NEW_YORK";
  if (hour >= 0 && hour < 8) return "ASIAN";
  return "OTHER";
}

// ── Excel → CSV converter ─────────────────────────────────────────────────────

/**
 * Read an .xlsx file (as ArrayBuffer) and convert the first sheet to
 * a plain CSV string so we can pipe it straight into parseCTraderCSV.
 */
function xlsxToCsv(buffer: ArrayBuffer): string {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  // sheet_to_csv uses comma delimiter by default and handles dates nicely
  return XLSX.utils.sheet_to_csv(sheet, { forceQuotes: false });
}

// ── CSV parser ────────────────────────────────────────────────────────────────

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
      else current += ch;
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });

  return { headers, rows };
}

export function parseCTraderCSV(text: string): ParseResult {
  const { headers, rows } = parseCsv(text);

  // Map original headers to our canonical names
  const headerMapping: Record<string, string> = {};
  const unknownHeaders: string[] = [];

  headers.forEach((h) => {
    const key = norm(h);
    if (HEADER_MAP[key]) {
      headerMapping[h] = HEADER_MAP[key];
    } else {
      unknownHeaders.push(h);
    }
  });

  const parsed: ParsedRow[] = [];

  rows.forEach((raw, idx) => {
    const warnings: string[] = [];
    const mapped: Partial<TradeCreatePayload> = {};

    // Collect canonical values
    const canonical: Record<string, string> = {};
    Object.entries(raw).forEach(([h, v]) => {
      const canon = headerMapping[h];
      if (canon) {
        // For pnl: prefer netprofit over grossprofit
        if (canon === "gross_profit" && canonical["pnl"]) return;
        if (canon === "gross_profit") canonical["pnl"] = v;
        else canonical[canon] = v;
      }
    });

    // Symbol
    if (canonical.symbol) {
      mapped.market = canonical.symbol.trim().toUpperCase();
    } else {
      warnings.push("No symbol/market found");
    }

    // Direction
    mapped.direction = parseDirection(canonical.direction || "buy");

    // Prices
    const entryN = parseNum(canonical.entry_price ?? "");
    if (entryN != null) mapped.entry_price = entryN;

    const exitN = parseNum(canonical.exit_price ?? "");
    if (exitN != null) mapped.exit_price = exitN;

    // PnL
    const pnlN = parseNum(canonical.pnl ?? "");
    if (pnlN != null) mapped.pnl = pnlN;

    // Lot size — saved directly so it shows in the trades table
    const lotN = parseNum(canonical.volume ?? "");
    if (lotN != null && lotN > 0) mapped.lot_size = lotN;

    // Notes
    if (canonical.notes) mapped.notes = canonical.notes;

    // Date
    mapped.trade_date = parseDate(canonical.open_time || "");

    // Session (inferred from open time)
    mapped.session = parseSession(canonical.open_time);

    // Status — all history exports are closed trades
    mapped.status = "CLOSED";

    parsed.push({ raw, mapped, warnings, rowNum: idx + 2 });
  });

  return {
    rows: parsed,
    headers,
    unknownHeaders,
    totalRows: rows.length,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ImportCSVModalProps {
  onClose: () => void;
  onImported: () => void;
}

type Step = "upload" | "preview" | "done";

export default function ImportCSVModal({ onClose, onImported }: ImportCSVModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (trades: TradeCreatePayload[]) => bulkImportTrades(trades),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journal"] });
      setStep("done");
    },
  });

  const handleFile = useCallback((file: File) => {
    const isXlsx = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    const isCsv  = file.name.endsWith(".csv");

    if (!isXlsx && !isCsv) {
      setParseError("Please upload a .csv or .xlsx file.");
      return;
    }

    setFileName(file.name);
    setParseError(null);

    const processText = (text: string) => {
      if (!text?.trim()) { setParseError("File is empty."); return; }
      try {
        const result = parseCTraderCSV(text);
        if (result.rows.length === 0) {
          setParseError("No trade rows found. Make sure you're exporting from cTrader History.");
          return;
        }
        setParseResult(result);
        setStep("preview");
      } catch {
        setParseError("Failed to parse file. Please check the format.");
      }
    };

    const reader = new FileReader();

    if (isXlsx) {
      reader.onload = (e) => {
        try {
          const csv = xlsxToCsv(e.target?.result as ArrayBuffer);
          processText(csv);
        } catch {
          setParseError("Failed to read Excel file. Try exporting as CSV instead.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => processText(e.target?.result as string);
      reader.readAsText(file);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirmImport = () => {
    if (!parseResult) return;
    const validTrades = parseResult.rows
      .filter((r) => r.mapped.market && r.mapped.trade_date)
      .map((r) => r.mapped as TradeCreatePayload);
    importMutation.mutate(validTrades);
  };

  const validCount = parseResult?.rows.filter((r) => r.mapped.market).length ?? 0;
  const warnCount = parseResult?.rows.filter((r) => r.warnings.length > 0).length ?? 0;
  const previewRows = showAll ? parseResult?.rows ?? [] : parseResult?.rows.slice(0, 10) ?? [];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }} onClick={onClose}>
      <div style={{
        background: "#14181F", border: "1px solid #1E293B", borderRadius: "16px",
        width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto", padding: "28px",
      }} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ color: "white", fontSize: "18px", fontWeight: 700, margin: 0 }}>
              Import from cTrader
            </h2>
            <p style={{ color: "#64748B", fontSize: "13px", margin: "4px 0 0" }}>
              Export your trade history from cTrader and upload as CSV or Excel
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}>
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        {/* ── Step 1: Upload ── */}
        {step === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Instructions */}
            <div style={{ background: "#0B0F19", border: "1px solid #1E293B", borderRadius: "10px", padding: "16px 18px" }}>
              <div style={{ color: "#94A3B8", fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>
                How to export from cTrader:
              </div>
              <ol style={{ color: "#64748B", fontSize: "13px", margin: 0, padding: "0 0 0 18px", lineHeight: "2" }}>
                <li>Open cTrader → go to <strong style={{ color: "#94A3B8" }}>History</strong> tab</li>
                <li>Set your desired date range</li>
                <li>Click the <strong style={{ color: "#94A3B8" }}>Export</strong> button (top right) → <strong style={{ color: "#94A3B8" }}>CSV</strong> or <strong style={{ color: "#94A3B8" }}>Excel</strong></li>
                <li>Upload the downloaded file below</li>
              </ol>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "#6366F1" : "#1E293B"}`,
                borderRadius: "12px",
                padding: "48px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(99,102,241,0.05)" : "#0B0F19",
                transition: "all 0.15s",
              }}
            >
              <Upload style={{ width: "32px", height: "32px", color: dragOver ? "#6366F1" : "#334155", margin: "0 auto 12px" }} />
              <div style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>
                Drop your file here
              </div>
              <div style={{ color: "#64748B", fontSize: "13px" }}>
                CSV or Excel (.xlsx) — or click to browse
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>

            {parseError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontSize: "13px", padding: "12px 16px", background: "rgba(239,68,68,0.08)", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle style={{ width: "15px", height: "15px", flexShrink: 0 }} />
                {parseError}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === "preview" && parseResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Summary bar */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <SummaryChip color="#10B981" label={`${validCount} trades ready to import`} />
              {warnCount > 0 && <SummaryChip color="#F59E0B" label={`${warnCount} with warnings`} />}
              {parseResult.unknownHeaders.length > 0 && (
                <SummaryChip color="#64748B" label={`Unknown columns: ${parseResult.unknownHeaders.join(", ")}`} />
              )}
              <div style={{ marginLeft: "auto", color: "#64748B", fontSize: "12px", alignSelf: "center" }}>
                <FileText style={{ width: "12px", height: "12px", display: "inline", marginRight: "4px" }} />
                {fileName}
              </div>
            </div>

            {/* Preview table */}
            <div style={{ background: "#0B0F19", border: "1px solid #1E293B", borderRadius: "10px", overflow: "hidden" }}>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 60px 90px 90px 80px 90px",
                padding: "10px 14px",
                borderBottom: "1px solid #1E293B",
                gap: "8px",
              }}>
                {["Date", "Market", "Dir", "Entry", "Exit", "PnL", "Session"].map((h) => (
                  <div key={h} style={{ color: "#475569", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</div>
                ))}
              </div>

              {previewRows.map((row) => {
                const m = row.mapped;
                const pnl = m.pnl != null ? m.pnl : null;
                const pnlColor = pnl == null ? "#475569" : pnl > 0 ? "#10B981" : pnl < 0 ? "#EF4444" : "#94A3B8";
                return (
                  <div key={row.rowNum} style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 60px 90px 90px 80px 90px",
                    padding: "10px 14px",
                    borderBottom: "1px solid #0F1822",
                    gap: "8px",
                    alignItems: "center",
                    background: row.warnings.length > 0 ? "rgba(245,158,11,0.04)" : "transparent",
                  }}>
                    <div style={{ color: "#64748B", fontSize: "12px" }}>{m.trade_date}</div>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>{m.market || <span style={{ color: "#EF4444" }}>—</span>}</div>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", display: "inline-block",
                      background: m.direction === "LONG" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: m.direction === "LONG" ? "#10B981" : "#EF4444",
                    }}>{m.direction}</span>
                    <div style={{ color: "#94A3B8", fontSize: "12px" }}>{m.entry_price?.toFixed(5) ?? "—"}</div>
                    <div style={{ color: "#94A3B8", fontSize: "12px" }}>{m.exit_price?.toFixed(5) ?? "—"}</div>
                    <div style={{ color: pnlColor, fontSize: "13px", fontWeight: 600 }}>
                      {pnl != null ? (pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`) : "—"}
                    </div>
                    <div style={{ color: "#64748B", fontSize: "12px" }}>
                      {m.session ? { LONDON: "London", NEW_YORK: "NY", ASIAN: "Asian", OTHER: "Other" }[m.session] : "—"}
                    </div>
                  </div>
                );
              })}

              {!showAll && parseResult.rows.length > 10 && (
                <button
                  onClick={() => setShowAll(true)}
                  style={{ width: "100%", padding: "12px", background: "transparent", border: "none", color: "#6366F1", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <ChevronDown style={{ width: "14px", height: "14px" }} />
                  Show all {parseResult.rows.length} trades
                </button>
              )}
            </div>

            {importMutation.isError && (
              <div style={{ color: "#EF4444", fontSize: "13px", padding: "10px 14px", background: "rgba(239,68,68,0.08)", borderRadius: "8px" }}>
                Import failed. Please try again.
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => { setStep("upload"); setParseResult(null); }} style={cancelBtn}>
                ← Back
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importMutation.isPending || validCount === 0}
                style={confirmBtn(importMutation.isPending || validCount === 0)}
              >
                {importMutation.isPending ? "Importing…" : `Import ${validCount} trades`}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && importMutation.data && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <CheckCircle style={{ width: "48px", height: "48px", color: "#10B981", margin: "0 auto 16px" }} />
            <div style={{ color: "white", fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
              Import complete
            </div>
            <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "8px" }}>
              <strong style={{ color: "#10B981" }}>{importMutation.data.imported} trades</strong> imported successfully
            </div>
            {importMutation.data.skipped > 0 && (
              <div style={{ color: "#F59E0B", fontSize: "13px", marginBottom: "24px" }}>
                {importMutation.data.skipped} rows skipped
              </div>
            )}
            <button onClick={onImported} style={confirmBtn(false)}>
              View my trades
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryChip({ label, color }: { label: string; color: string }) {
  return (
    <div style={{
      padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
      background: `${color}18`, color, border: `1px solid ${color}30`,
    }}>
      {label}
    </div>
  );
}

const cancelBtn: React.CSSProperties = {
  background: "transparent", border: "1px solid #1E293B", borderRadius: "8px",
  padding: "10px 20px", color: "#94A3B8", fontSize: "14px", fontWeight: 500, cursor: "pointer",
};

const confirmBtn = (disabled: boolean): React.CSSProperties => ({
  background: disabled ? "#1E293B" : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
  border: "none", borderRadius: "8px", padding: "10px 24px",
  color: disabled ? "#64748B" : "white", fontSize: "14px", fontWeight: 600,
  cursor: disabled ? "not-allowed" : "pointer",
});
