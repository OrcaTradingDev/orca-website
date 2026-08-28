"use client";

import { useMemo } from "react";
import { Star, X, Zap } from "lucide-react";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { useScreenerStore } from "@/store/screener-store";
import { OrcaSignals } from "@/features/dashboard/types/screener";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Shared mini-bar ───────────────────────────────────────────────────────────
const Bar = ({ bear, bull }: { bear: number; bull: number }) => (
  <div className="relative w-full h-7 bg-[#1A1F2E] rounded overflow-hidden flex">
    <div
      className="h-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#DC2626] flex items-center justify-center"
      style={{ width: `${bear}%` }}
    >
      {bear > 20 && <span className="text-white text-xs drop-shadow">{bear}%</span>}
    </div>
    <div
      className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] flex items-center justify-center"
      style={{ width: `${bull}%` }}
    >
      {bull > 20 && <span className="text-white text-xs drop-shadow">{bull}%</span>}
    </div>
  </div>
);

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

// ─────────────────────────────────────────────────────────────────────────────
export default function WatchlistSection() {
  const { data, isLoading } = useScreener(1, 50);
  const watchedSymbols  = useScreenerStore((s) => s.watchedSymbols);
  const toggleWatchlist = useScreenerStore((s) => s.toggleWatchlist);

  const watched = useMemo(
    () => (data?.rows ?? []).filter((r) => watchedSymbols.includes(r.symbol)),
    [data?.rows, watchedSymbols]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Watchlist</h1>
        <p className="text-[#94A3B8]">Track your favourite assets</p>
      </div>

      {/* Empty state */}
      {!isLoading && watchedSymbols.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-[#14181F] border border-[#1E293B] rounded-xl text-center">
          <div className="w-14 h-14 bg-[#1E293B] rounded-full flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-[#64748B]" strokeWidth={1.5} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Your watchlist is empty</h3>
          <p className="text-[#64748B] text-sm max-w-xs leading-relaxed">
            Click the <span className="text-[#00D4FF]">★</span> icon next to any asset in the{" "}
            <span className="text-[#00D4FF]">Premium Screener</span> to start tracking it here.
          </p>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#1E293B] last:border-0">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 flex-1" />
              <Skeleton className="h-7 flex-1" />
              <Skeleton className="h-7 flex-1" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && watched.length > 0 && (
        <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0A1628]">
                  <th className="py-3 px-4 text-left text-[#94A3B8] text-xs font-medium uppercase tracking-wider w-[200px]">Symbol</th>
                  <th className="py-3 px-4 text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider">Intraday</th>
                  <th className="py-3 px-4 text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider">Daily</th>
                  <th className="py-3 px-4 text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider">Long-Term</th>
                  <th className="py-3 px-4 text-center text-[#94A3B8] text-xs font-medium uppercase tracking-wider w-[160px]">Orca</th>
                  <th className="py-3 px-4 w-[48px]" />
                </tr>
              </thead>
              <tbody>
                {watched.map((row) => (
                  <tr key={row.symbol} className="border-b border-[#1E293B] last:border-0 hover:bg-[#1A1F2E] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Star className="w-4 h-4 fill-[#00D4FF] text-[#00D4FF] shrink-0" />
                        <div>
                          <div className="text-white font-semibold text-sm">{row.symbol}</div>
                          <div className="text-[#64748B] text-xs">{row.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><Bar bear={row.intraday.bear} bull={row.intraday.bull} /></td>
                    <td className="py-3 px-4"><Bar bear={row.daily.bear} bull={row.daily.bull} /></td>
                    <td className="py-3 px-4"><Bar bear={row.longterm.bear} bull={row.longterm.bull} /></td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        <Badge className={`${STATUS_STYLES[row.signals.status]} text-xs font-bold border-0 px-2.5`}>
                          {row.signals.status}
                        </Badge>
                        <span className={`text-xs font-medium ${DIRECTION_COLORS[row.signals.direction]}`}>
                          {row.signals.direction}
                        </span>
                        <span className="text-[#64748B] text-xs">
                          Score: <span className="text-white font-semibold">{row.signals.orca_score}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleWatchlist(row.symbol)}
                        className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1 rounded"
                        title="Remove from watchlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info note when some symbols aren't in current page */}
      {!isLoading && watchedSymbols.length > 0 && watched.length < watchedSymbols.length && (
        <div className="flex items-start gap-3 bg-[#0A1628] border border-[#1E293B] rounded-lg px-4 py-3">
          <Zap className="w-4 h-4 text-[#00D4FF] mt-0.5 shrink-0" />
          <p className="text-[#64748B] text-sm">
            {watchedSymbols.length - watched.length} watchlisted symbol(s) are not in the current screener data.
          </p>
        </div>
      )}
    </div>
  );
}
