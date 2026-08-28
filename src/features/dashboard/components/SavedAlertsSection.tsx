"use client";

import { useMemo } from "react";
import { Bell, X, Zap } from "lucide-react";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { useScreenerStore } from "@/store/screener-store";
import { OrcaSignals } from "@/features/dashboard/types/screener";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

const PULSE_COLORS: Record<OrcaSignals["status"], string> = {
  ON:    "bg-[#10B981]",
  WATCH: "bg-[#F59E0B]",
  OFF:   "bg-[#64748B]",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function SavedAlertsSection() {
  const { data, isLoading } = useScreener(1, 50);
  const alertSymbols  = useScreenerStore((s) => s.alertSymbols);
  const toggleAlert   = useScreenerStore((s) => s.toggleAlert);

  const alerted = useMemo(
    () => (data?.rows ?? []).filter((r) => alertSymbols.includes(r.symbol)),
    [data?.rows, alertSymbols]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Saved Alerts</h1>
        <p className="text-[#94A3B8]">Get notified when Orca signals change</p>
      </div>

      {/* Empty state */}
      {!isLoading && alertSymbols.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-[#14181F] border border-[#1E293B] rounded-xl text-center">
          <div className="w-14 h-14 bg-[#1E293B] rounded-full flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No alerts set</h3>
          <p className="text-[#64748B] text-sm max-w-xs leading-relaxed">
            Click the <span className="text-[#00D4FF]">🔔</span> icon on any asset in the{" "}
            <span className="text-[#00D4FF]">Premium Screener</span> to receive signal change notifications.
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Alert list */}
      {!isLoading && alerted.length > 0 && (
        <div className="space-y-3">
          {alerted.map((row) => (
            <div
              key={row.symbol}
              className="bg-[#14181F] border border-[#1E293B] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#2D3748] transition-colors"
            >
              {/* Left: pulse + symbol */}
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center shrink-0 w-4 h-4">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${PULSE_COLORS[row.signals.status]} ${
                      row.signals.status !== "OFF" ? "animate-pulse" : ""
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{row.symbol}</span>
                    <Badge className={`${STATUS_STYLES[row.signals.status]} text-xs font-bold border-0 px-2`}>
                      {row.signals.status}
                    </Badge>
                  </div>
                  <div className="text-[#64748B] text-sm mt-0.5">{row.name}</div>
                </div>
              </div>

              {/* Right: signal detail + remove */}
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className={`text-sm font-semibold ${DIRECTION_COLORS[row.signals.direction]}`}>
                    {row.signals.direction}
                  </div>
                  <div className="text-[#64748B] text-xs mt-0.5">{row.signals.market_phase}</div>
                </div>
                <div className="text-center hidden sm:block min-w-[52px]">
                  <div className="text-white font-bold text-xl leading-tight">{row.signals.orca_score}</div>
                  <div className="text-[#64748B] text-xs">Score</div>
                </div>
                <button
                  onClick={() => toggleAlert(row.symbol)}
                  className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1 rounded shrink-0"
                  title="Remove alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info note */}
      {!isLoading && alerted.length > 0 && (
        <div className="flex items-start gap-3 bg-[#0A1628] border border-[#1E293B] rounded-xl px-4 py-3">
          <Zap className="w-4 h-4 text-[#00D4FF] mt-0.5 shrink-0" />
          <p className="text-[#64748B] text-sm leading-relaxed">
            A pulsing dot means the signal is currently active. Alerts fire when a signal transitions
            between <span className="text-white">OFF → WATCH → ON</span>.
          </p>
        </div>
      )}
    </div>
  );
}
