"use client";

import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScreener } from "@/app/hooks/useScreener";
import { ScreenerRow } from "@/app/types/screener";
import { queryKeys } from "@/app/lib/query/keys";
import {
  Search, RefreshCw, Download, Star, Bell,
  TrendingUp, TrendingDown, Minus, ChevronLeft,
  ChevronRight, BarChart2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset extends Omit<ScreenerRow, "advanced"> {
  assetClass: string;
  inWatchlist: boolean;
  advanced: ScreenerRow["advanced"] & {
    adxTrend: "up" | "down" | "neutral";
    emaStatus: "aligned" | "crossed";
    hasAlert: boolean;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inferAssetClass(s: string): string {
  if (s.includes("XAU") || s.includes("XAG") || s.includes("OIL")) return "Commodities";
  if (s.includes("/")) return "Forex";
  if (["US500", "US100", "US30"].includes(s)) return "Indices";
  if (s.includes("BTC") || s.includes("ETH") || s.includes("USDT")) return "Crypto";
  return "Stocks";
}

function getBullMeta(bull: number) {
  if (bull >= 70) return { text: "Strong Bull", color: "#10B981", bg: "rgba(16,185,129,0.12)" };
  if (bull >= 55) return { text: "Bullish",     color: "#34D399", bg: "rgba(52,211,153,0.10)" };
  if (bull >= 45) return { text: "Neutral",     color: "#94A3B8", bg: "rgba(148,163,184,0.10)" };
  if (bull >= 30) return { text: "Bearish",     color: "#F87171", bg: "rgba(248,113,113,0.10)" };
  return            { text: "Strong Bear",  color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
}

const CLASS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  Forex:       { color: "#A78BFA", bg: "rgba(167,139,250,0.1)",  border: "rgba(167,139,250,0.25)" },
  Crypto:      { color: "#FCD34D", bg: "rgba(252,211,77,0.1)",   border: "rgba(252,211,77,0.25)"  },
  Stocks:      { color: "#38BDF8", bg: "rgba(56,189,248,0.1)",   border: "rgba(56,189,248,0.25)"  },
  Indices:     { color: "#F472B6", bg: "rgba(244,114,182,0.1)",  border: "rgba(244,114,182,0.25)" },
  Commodities: { color: "#FB923C", bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.25)"  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Stacked bull/bear bar — 100% inline styles, always renders */
const TrendBar = ({ bear, bull }: { bear: number; bull: number }) => {
  const b = Math.min(100, Math.max(0, bear));
  const u = Math.min(100, Math.max(0, bull));
  const meta = getBullMeta(u);
  return (
    <div style={{ width: "100%", minWidth: 160 }}>
      <div style={{ display: "flex", height: 30, borderRadius: 8, overflow: "hidden", background: "#0D1220" }}>
        <div style={{
          width: `${b}%`, flexShrink: 0, position: "relative",
          background: "linear-gradient(90deg,#7F1D1D,#EF4444)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.12),transparent)" }} />
          {b > 20 && <span style={{ position: "relative", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{b}%</span>}
        </div>
        <div style={{
          width: `${u}%`, flexShrink: 0, position: "relative",
          background: "linear-gradient(90deg,#064E3B,#10B981)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.12),transparent)" }} />
          {u > 20 && <span style={{ position: "relative", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{u}%</span>}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#4B5563" }}>{b}% bear</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: meta.color, background: meta.bg, padding: "1px 7px", borderRadius: 4 }}>
          {meta.text}
        </span>
        <span style={{ fontSize: 10, color: "#4B5563" }}>{u}% bull</span>
      </div>
    </div>
  );
};

/** Colored asset-class pill */
const ClassTag = ({ cls }: { cls: string }) => {
  const s = CLASS_STYLES[cls] ?? { color: "#94A3B8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.2)" };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
      padding: "2px 7px", borderRadius: 20, whiteSpace: "nowrap",
    }}>{cls}</span>
  );
};

/** Circular ADX gauge with direction icon */
const AdxMeter = ({ value, trend }: { value: number; trend: "up" | "down" | "neutral" }) => {
  const strong = value >= 25;
  const color  = strong ? "#10B981" : "#475569";
  const Icon   = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const iconColor = trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#475569";
  const r = 11, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ position: "relative", width: 30, height: 30 }}>
        <svg width={30} height={30} viewBox="0 0 30 30" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={15} cy={15} r={r} fill="none" stroke="#1E293B" strokeWidth={2.5} />
          <circle cx={15} cy={15} r={r} fill="none" stroke={color} strokeWidth={2.5}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - Math.min(value, 100) / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 8, fontWeight: 800, color }}>{value}</span>
        </div>
      </div>
      <Icon size={12} color={iconColor} />
    </div>
  );
};

/** Volume mini-bar */
const VolBar = ({ value }: { value: number }) => {
  const pct   = Math.min(100, Math.max(0, value));
  const color = pct > 66 ? "#F59E0B" : pct > 33 ? "#38BDF8" : "#475569";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 36 }}>
      <div style={{ width: 32, height: 3, borderRadius: 99, background: "#1E293B", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 10, color: "#475569", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
};

/** Stat card */
const StatCard = ({ label, value, accent = false }: { label: string; value: number | string; accent?: boolean }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "10px 18px", borderRadius: 12,
    background: accent ? "rgba(0,212,255,0.07)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${accent ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.06)"}`,
    minWidth: 68,
  }}>
    <span style={{ fontSize: 20, fontWeight: 800, color: accent ? "#00D4FF" : "#F1F5F9", lineHeight: 1 }}>{value}</span>
    <span style={{ fontSize: 10, color: "#475569", marginTop: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
  </div>
);

/** Skeleton row */
const SkeletonRow = () => (
  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    {[180, 200, 200, 220].map((w, i) => (
      <td key={i} style={{ padding: "14px 20px" }}>
        <Skeleton style={{ height: 28, width: w, borderRadius: 8, background: "rgba(255,255,255,0.05)" }} />
      </td>
    ))}
  </tr>
);

/** Native select wrapper */
const FilterSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <div style={{ position: "relative" }}>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{
      appearance: "none", WebkitAppearance: "none",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, color: "#CBD5E1", padding: "0 32px 0 12px",
      height: 38, fontSize: 13, cursor: "pointer", outline: "none", minWidth: 148,
    }}>
      {options.map((o) => <option key={o} value={o} style={{ background: "#0D1220" }}>{o}</option>)}
    </select>
    <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
      width={12} height={12} viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="#64748B" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PremiumScreenerSection() {
  const queryClient = useQueryClient();

  const [page, setPage]                     = useState(1);
  const [assetClassFilter, setAssetCls]     = useState("All Classes");
  const [trendFilter, setTrendFilter]       = useState("All Trends");
  const [searchQuery, setSearchQuery]       = useState("");
  const [selectedAsset, setSelectedAsset]   = useState<Asset | null>(null);
  const [showDetailModal, setShowDetail]    = useState(false);
  const [watchedSymbols, setWatched]        = useState<string[]>([]);
  const [alertSymbols, setAlerts]           = useState<string[]>([]);
  const [hoveredRow, setHoveredRow]         = useState<string | null>(null);

  const { data, isLoading, isFetching, isError } = useScreener(page, 50);

  const assets: Asset[] = useMemo(() => (data?.rows ?? []).map((row) => ({
    ...row,
    assetClass: inferAssetClass(row.symbol),
    inWatchlist: watchedSymbols.includes(row.symbol),
    advanced: {
      ...row.advanced,
      adxTrend:  row.advanced.adx_dir === "flat" ? "neutral" : row.advanced.adx_dir,
      emaStatus: row.advanced.ema === "aligned" ? "aligned" : "crossed",
      hasAlert:  alertSymbols.includes(row.symbol),
    },
  })), [data?.rows, watchedSymbols, alertSymbols]);

  const lastUpdatedLabel = useMemo(() => {
    if (!data?.lastUpdated) return "Loading…";
    const m = Math.floor((Date.now() - new Date(data.lastUpdated).getTime()) / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    return `${Math.floor(m / 60)}h ago`;
  }, [data?.lastUpdated]);

  const filteredAssets = useMemo(() => assets.filter((a) => {
    const q = searchQuery.toLowerCase();
    if (q && !a.symbol.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
    if (assetClassFilter !== "All Classes" && a.assetClass !== assetClassFilter) return false;
    const b = a.daily.bull;
    if (trendFilter === "Strong Bullish" && b < 70) return false;
    if (trendFilter === "Bullish"        && !(b >= 55 && b < 70)) return false;
    if (trendFilter === "Neutral"        && !(b >= 45 && b < 55)) return false;
    if (trendFilter === "Bearish"        && !(b >= 30 && b < 45)) return false;
    if (trendFilter === "Strong Bearish" && b >= 30) return false;
    return true;
  }), [assets, searchQuery, assetClassFilter, trendFilter]);

  const toggleWatchlist = useCallback((sym: string) => {
    setWatched((p) => p.includes(sym) ? p.filter((s) => s !== sym) : [...p, sym]);
    setSelectedAsset((a) => a?.symbol === sym ? { ...a, inWatchlist: !a.inWatchlist } : a);
  }, []);

  const toggleAlert = useCallback((sym: string) => {
    setAlerts((p) => p.includes(sym) ? p.filter((s) => s !== sym) : [...p, sym]);
    setSelectedAsset((a) => a?.symbol === sym ? { ...a, advanced: { ...a.advanced, hasAlert: !a.advanced.hasAlert } } : a);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.screener.all });
  }, [queryClient]);

  const handleExport = useCallback(() => {
    if (!filteredAssets.length) return;
    const csv = [
      ["Symbol","Name","Class","Intraday Bull%","Daily Bull%","ADX","EMA","Volume"].join(","),
      ...filteredAssets.map((a) => [a.symbol,a.name,a.assetClass,a.intraday.bull,a.daily.bull,a.advanced.adx,a.advanced.emaStatus,a.advanced.vol].join(",")),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: `screener-${new Date().toISOString().slice(0,10)}.csv` }).click();
    URL.revokeObjectURL(url);
  }, [filteredAssets]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: "#070B12", minHeight: "100vh", padding: "28px 24px", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse { 0%,100%{opacity:1;box-shadow:0 0 8px #00D4FF} 50%{opacity:.5;box-shadow:0 0 3px #00D4FF} }
        .screener-select:focus { border-color: rgba(0,212,255,0.4) !important; outline:none; }
        .screener-input:focus  { border-color: rgba(0,212,255,0.4) !important; outline:none; }
        .icon-btn:hover        { background: rgba(255,255,255,0.06) !important; }
        .ctrl-btn:hover        { border-color: rgba(255,255,255,0.15) !important; color: #fff !important; }
        .export-btn:hover      { background: rgba(0,212,255,0.18) !important; }
        .table-row:hover       { background: rgba(255,255,255,0.028) !important; }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%", background: "#00D4FF",
                animation: "livePulse 2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Live Data
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#F8FAFC", margin: 0, letterSpacing: "-0.025em", lineHeight: 1 }}>
              Premium Screener
            </h1>
            <p style={{ fontSize: 13, color: "#475569", margin: "8px 0 0 0" }}>
              Real-time multi-timeframe trend analysis across all markets
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <StatCard label="Total"    value={data?.total ?? "—"} />
            <StatCard label="Filtered" value={filteredAssets.length} accent />
            <StatCard label="Watched"  value={watchedSymbols.length} />
          </div>
        </div>

        {/* ── Controls bar ────────────────────────────────────────────────── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "10px 14px", marginBottom: 14,
        }}>
          <FilterSelect value={assetClassFilter} onChange={setAssetCls}
            options={["All Classes","Forex","Crypto","Stocks","Indices","Commodities"]} />

          <FilterSelect value={trendFilter} onChange={setTrendFilter}
            options={["All Trends","Strong Bullish","Bullish","Neutral","Bearish","Strong Bearish"]} />

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.07)", margin: "0 2px" }} />

          {/* Search */}
          <div style={{ position: "relative", flexGrow: 1, maxWidth: 270 }}>
            <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#475569", pointerEvents: "none" }} />
            <input className="screener-input" type="text" placeholder="Search symbol or name…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", height: 38, paddingLeft: 32, paddingRight: 12, boxSizing: "border-box",
                background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, color: "#F1F5F9", fontSize: 13,
              }}
            />
          </div>

          <div style={{ flexGrow: 1 }} />

          {/* Refresh */}
          <button className="ctrl-btn" onClick={handleRefresh} disabled={isFetching} style={{
            display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 14px",
            borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748B", fontSize: 13, cursor: "pointer", opacity: isFetching ? 0.6 : 1, transition: "all 0.15s",
          }}>
            <RefreshCw size={13} style={isFetching ? { animation: "spin 1s linear infinite" } : {}} />
            {lastUpdatedLabel}
          </button>

          {/* Export */}
          <button className="export-btn" onClick={handleExport} disabled={filteredAssets.length === 0} style={{
            display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 16px",
            borderRadius: 10, background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.28)",
            color: "#00D4FF", fontSize: 13, fontWeight: 700, cursor: "pointer",
            opacity: filteredAssets.length === 0 ? 0.4 : 1, transition: "background 0.15s",
          }}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div style={{ background: "#09101C", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#070B12" }}>
                  {[
                    { label: "Symbol",   sub: null,                   w: 220,   pro: false },
                    { label: "Intraday", sub: "1M · 5M · 15M · 1H",  w: undefined, pro: false },
                    { label: "Daily",    sub: "4H · 1D · 1W",        w: undefined, pro: false },
                    { label: "Advanced", sub: "ADX · EMA · VOL · ALERT", w: 270, pro: true  },
                  ].map((col) => (
                    <th key={col.label} style={{
                      width: col.w, padding: "14px 20px", textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {col.label}
                        </span>
                        {col.pro && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: "#F59E0B", background: "rgba(245,158,11,0.15)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>
                            PRO
                          </span>
                        )}
                      </div>
                      {col.sub && <div style={{ fontSize: 10, color: "#283244", marginTop: 3, letterSpacing: "0.04em" }}>{col.sub}</div>}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? [...Array(7)].map((_, i) => <SkeletonRow key={i} />) :
                 isError ? (
                  <tr><td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#EF4444", fontSize: 13 }}>
                    ⚠ Failed to load market data. Please check your connection.
                  </td></tr>
                ) : filteredAssets.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: "60px 20px", textAlign: "center", color: "#475569", fontSize: 13 }}>
                    {assets.length === 0 ? "Data warming up…" : "No assets match your filters."}
                  </td></tr>
                ) : filteredAssets.map((asset) => (
                  <tr key={asset.symbol} className="table-row"
                    onClick={() => { setSelectedAsset(asset); setShowDetail(true); }}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.035)", cursor: "pointer", transition: "background 0.1s" }}
                  >
                    {/* Symbol */}
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className="icon-btn"
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.symbol); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 5, borderRadius: 6, display: "flex", transition: "background 0.15s" }}
                        >
                          <Star size={14} color={asset.inWatchlist ? "#00D4FF" : "#334155"} fill={asset.inWatchlist ? "#00D4FF" : "none"} />
                        </button>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.01em" }}>{asset.symbol}</span>
                            <ClassTag cls={asset.assetClass} />
                          </div>
                          <div style={{ fontSize: 11, color: "#475569", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Intraday */}
                    <td style={{ padding: "10px 20px", minWidth: 190 }}>
                      <TrendBar bear={asset.intraday.bear} bull={asset.intraday.bull} />
                    </td>

                    {/* Daily */}
                    <td style={{ padding: "10px 20px", minWidth: 190 }}>
                      <TrendBar bear={asset.daily.bear} bull={asset.daily.bull} />
                    </td>

                    {/* Advanced */}
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <AdxMeter value={asset.advanced.adx} trend={asset.advanced.adxTrend} />
                        <div style={{
                          padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                          color:       asset.advanced.emaStatus === "aligned" ? "#10B981" : "#EF4444",
                          background:  asset.advanced.emaStatus === "aligned" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                          border: `1px solid ${asset.advanced.emaStatus === "aligned" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                          whiteSpace: "nowrap",
                        }}>
                          EMA {asset.advanced.emaStatus === "aligned" ? "✓" : "✗"}
                        </div>
                        <VolBar value={asset.advanced.vol} />
                        <button className="icon-btn"
                          onClick={(e) => { e.stopPropagation(); toggleAlert(asset.symbol); }}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 5, borderRadius: 6, display: "flex", transition: "background 0.15s" }}
                        >
                          <Bell size={13} color={asset.advanced.hasAlert ? "#F59E0B" : "#334155"} fill={asset.advanced.hasAlert ? "#F59E0B" : "none"} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredAssets.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: 12, color: "#475569" }}>
                Showing{" "}
                <span style={{ color: "#94A3B8" }}>{(page-1)*50+1}–{Math.min(page*50, data?.total ?? 0)}</span>
                {" "}of <span style={{ color: "#94A3B8" }}>{data?.total ?? 0}</span> assets
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1} style={{
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
                  color: "#64748B", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1,
                }}><ChevronLeft size={15} /></button>
                <span style={{
                  minWidth: 32, textAlign: "center", fontSize: 13, fontWeight: 800, color: "#00D4FF",
                  background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: 8, padding: "4px 12px",
                }}>{page}</span>
                <button onClick={() => setPage((p) => p+1)} disabled={!data || data.rows.length < 50} style={{
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 8, border: "1px solid rgba(0,212,255,0.28)", background: "rgba(0,212,255,0.08)",
                  color: "#00D4FF", cursor: (!data || data.rows.length < 50) ? "not-allowed" : "pointer",
                  opacity: (!data || data.rows.length < 50) ? 0.4 : 1,
                }}><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetail}>
        <DialogContent style={{ background: "#09101C", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", maxWidth: 640 }}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <DialogTitle style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>
                {selectedAsset?.symbol}
              </DialogTitle>
              {selectedAsset && <ClassTag cls={selectedAsset.assetClass} />}
              <span style={{ fontSize: 13, color: "#475569" }}>{selectedAsset?.name}</span>
            </div>
            <DialogDescription style={{ color: "#475569", fontSize: 12 }}>
              Multi-timeframe trend breakdown
            </DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div style={{ paddingTop: 8 }}>
              {/* Chart placeholder */}
              <div style={{
                height: 170, borderRadius: 12, background: "#070B12",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
              }}>
                <div style={{ textAlign: "center", color: "#283244" }}>
                  <BarChart2 size={32} style={{ margin: "0 auto 8px", color: "#1D3461" }} />
                  <p style={{ fontSize: 12, margin: 0 }}>Interactive chart area</p>
                </div>
              </div>

              {/* Metrics grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Intraday Trend", sub: "1M · 5M · 15M · 1H",
                    content: <TrendBar bear={selectedAsset.intraday.bear} bull={selectedAsset.intraday.bull} /> },
                  { label: "Daily Trend", sub: "4H · 1D · 1W",
                    content: <TrendBar bear={selectedAsset.daily.bear} bull={selectedAsset.daily.bull} /> },
                  { label: "ADX Strength", sub: selectedAsset.advanced.adx >= 25 ? "Strong trend" : "Weak / ranging",
                    content: (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 30, fontWeight: 800, color: selectedAsset.advanced.adx >= 25 ? "#10B981" : "#64748B" }}>
                          {selectedAsset.advanced.adx}
                        </span>
                        <span style={{ fontSize: 11, color: "#475569" }}>/ 100</span>
                      </div>
                    ) },
                  { label: "EMA Alignment", sub: "EMA 9 · 21 · 50 · 200",
                    content: (
                      <div style={{ fontSize: 20, fontWeight: 800, color: selectedAsset.advanced.emaStatus === "aligned" ? "#10B981" : "#EF4444" }}>
                        {selectedAsset.advanced.emaStatus === "aligned" ? "✓ Aligned" : "✗ Crossed"}
                      </div>
                    ) },
                ].map(({ label, sub, content }) => (
                  <div key={label} style={{ background: "#070B12", borderRadius: 12, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
                    <div style={{ marginBottom: 8 }}>{content}</div>
                    <div style={{ fontSize: 10, color: "#283244" }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => toggleAlert(selectedAsset.symbol)} style={{
                  flex: 1, height: 42, borderRadius: 10, border: "none",
                  background: "#00D4FF", color: "#000", fontSize: 13, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <Bell size={14} />
                  {selectedAsset.advanced.hasAlert ? "Remove Alert" : "Set Alert"}
                </button>
                <button onClick={() => toggleWatchlist(selectedAsset.symbol)} style={{
                  flex: 1, height: 42, borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <Star size={14} fill={selectedAsset.inWatchlist ? "#00D4FF" : "none"} color={selectedAsset.inWatchlist ? "#00D4FF" : "#fff"} />
                  {selectedAsset.inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
