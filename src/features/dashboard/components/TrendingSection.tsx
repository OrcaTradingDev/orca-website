"use client";

import { useMemo, useState } from "react";
import { Trophy, Zap } from "lucide-react";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { OrcaSignals } from "@/features/dashboard/types/screener";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Style maps ────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<OrcaSignals["status"], string> = {
  ON:    "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  WATCH: "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  OFF:   "bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30",
};

const DIRECTION_COLORS: Record<OrcaSignals["direction"], string> = {
  "LONG ONLY":   "text-[#10B981]",
  "WATCH LONG":  "text-[#F59E0B]",
  "SHORT ONLY":  "text-[#EF4444]",
  "WATCH SHORT": "text-[#F97316]",
  "FLAT":        "text-[#64748B]",
};

const PHASE_STYLES: Record<OrcaSignals["market_phase"], string> = {
  "Expansion":     "bg-[#10B981]/15 text-[#10B981]",
  "Healthy Trend": "bg-[#34D399]/15 text-[#34D399]",
  "Continuation":  "bg-[#60A5FA]/15 text-[#60A5FA]",
  "Pullback":      "bg-[#F59E0B]/15 text-[#F59E0B]",
  "Compression":   "bg-[#A78BFA]/15 text-[#A78BFA]",
  "Exhaustion":    "bg-[#EF4444]/15 text-[#EF4444]",
  "Chop":          "bg-[#64748B]/15 text-[#64748B]",
};

// ── Mini bar ──────────────────────────────────────────────────────────────────
const MiniBar = ({ bear, bull, label }: { bear: number; bull: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-[#64748B] text-xs w-14 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-[#1A1F2E] rounded overflow-hidden flex">
      <div className="h-full bg-[#EF4444]" style={{ width: `${bear}%` }} />
      <div className="h-full bg-[#10B981]" style={{ width: `${bull}%` }} />
    </div>
    <span className={`text-xs w-8 text-right font-medium ${bull > bear ? "text-[#10B981]" : "text-[#EF4444]"}`}>
      {bull > bear ? `+${bull}` : `-${bear}`}
    </span>
  </div>
);

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }: { score: number }) => {
  const color =
    score >= 65 ? "#10B981" :
    score >= 55 ? "#F59E0B" :
    score >= 45 ? "#94A3B8" :
    score >= 35 ? "#F97316" : "#EF4444";
  const r = 16, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#1E293B" strokeWidth="3" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        transform="rotate(-90 20 20)" />
      <text x="20" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color}>{score}</text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
type FilterMode = "active" | "on" | "watch";

export default function TrendingSection() {
  const { data, isLoading } = useScreener(1, 50);
  const [filter, setFilter] = useState<FilterMode>("active");

  const topAssets = useMemo(() => {
    const rows = data?.rows ?? [];
    return rows
      .filter((r) => {
        if (filter === "on")     return r.signals.status === "ON";
        if (filter === "watch")  return r.signals.status === "WATCH";
        return r.signals.status !== "OFF"; // "active" = ON + WATCH
      })
      .sort((a, b) => b.signals.orca_score - a.signals.orca_score)
      .slice(0, 12);
  }, [data?.rows, filter]);

  const filters: { id: FilterMode; label: string }[] = [
    { id: "active", label: "All Active" },
    { id: "on",     label: "ON" },
    { id: "watch",  label: "WATCH" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-white text-[32px]">Top OrcaBot Signals</h1>
          <p className="text-[#94A3B8]">Highest-scoring active markets — updated live</p>
        </div>

        {/* Filter pill group */}
        <div className="flex items-center bg-[#14181F] border border-[#1E293B] rounded-lg p-1 gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-[#1E293B] text-white"
                  : "text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && topAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-[#14181F] border border-[#1E293B] rounded-xl text-center">
          <div className="w-14 h-14 bg-[#1E293B] rounded-full flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No active signals</h3>
          <p className="text-[#64748B] text-sm">No assets currently match this filter.</p>
        </div>
      )}

      {/* Cards */}
      {!isLoading && topAssets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {topAssets.map((asset, idx) => (
            <div
              key={asset.symbol}
              className={`bg-[#14181F] border rounded-xl p-4 hover:border-[#2D3748] transition-all ${
                asset.signals.is_best ? "border-[#FFD700]/40" : "border-[#1E293B]"
              }`}
            >
              {/* Symbol row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2 min-w-0">
                  {idx === 0 ? (
                    <Trophy className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  ) : (
                    <span className="text-[#64748B] text-xs font-mono mt-0.5 w-4 shrink-0">#{idx + 1}</span>
                  )}
                  <div className="min-w-0">
                    <div className="text-white font-bold text-sm">{asset.symbol}</div>
                    <div className="text-[#64748B] text-xs truncate">{asset.name}</div>
                  </div>
                </div>
                <ScoreRing score={asset.signals.orca_score} />
              </div>

              {/* Status + direction */}
              <div className="flex items-center gap-2 mb-2.5">
                <Badge className={`${STATUS_STYLES[asset.signals.status]} text-xs font-bold border-0 px-2`}>
                  {asset.signals.status}
                </Badge>
                <span className={`text-xs font-semibold truncate ${DIRECTION_COLORS[asset.signals.direction]}`}>
                  {asset.signals.direction}
                </span>
              </div>

              {/* Phase */}
              <div className="mb-3">
                <Badge className={`${PHASE_STYLES[asset.signals.market_phase]} border-0 text-xs`}>
                  {asset.signals.market_phase}
                </Badge>
              </div>

              {/* Mini bars */}
              <div className="space-y-1.5 pt-2 border-t border-[#1E293B]">
                <MiniBar bear={asset.intraday.bear} bull={asset.intraday.bull} label="Intraday" />
                <MiniBar bear={asset.daily.bear}    bull={asset.daily.bull}    label="Daily" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Last updated */}
      {!isLoading && data?.lastUpdated && (
        <p className="text-[#64748B] text-xs text-right">
          Data as of {new Date(data.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
