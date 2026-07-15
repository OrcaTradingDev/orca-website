"use client";

import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { useSymbolDetail } from "@/features/dashboard/hooks/useSymbolDetail";
import { ScreenerRow, OrcaSignals, OrcaMarketConditions } from "@/features/dashboard/types/screener";
import CandlestickChart, { magnetColor, structureLabel } from "@/features/dashboard/components/CandlestickChart";
import { queryKeys } from "@/lib/query/keys";
import { useScreenerStore } from "@/store/screener-store";
import { useUserAlerts } from "@/features/dashboard/hooks/useUserAlerts";
import { subscribeAlert, unsubscribeAlert } from "@/features/dashboard/services/alerts";
import { STRIPE_UPGRADE_URL } from "@/features/dashboard/constants";
import {
  Search,
  RefreshCw,
  Download,
  Star,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Trophy,
  Zap,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// ── UI Types ──────────────────────────────────────────────────────────────────
interface Asset extends Omit<ScreenerRow, "advanced"> {
  assetClass: string;
  inWatchlist: boolean;
  advanced: ScreenerRow["advanced"] & {
    adxTrend: "up" | "down" | "neutral";
    emaStatus: "aligned" | "crossed";
    hasAlert: boolean;
  };
}

// ── OrcaStatus helpers ────────────────────────────────────────────────────────

const DIRECTION_STYLES: Record<OrcaSignals["direction"], string> = {
  "LONG ONLY":   "text-[#10B981]",
  "WATCH LONG":  "text-[#F59E0B]",
  "SHORT ONLY":  "text-[#EF4444]",
  "WATCH SHORT": "text-[#F97316]",
  "FLAT":        "text-[#64748B]",
};

// Badge background/border for the main table's status pill — keyed by DIRECTION,
// not status. STATUS_STYLES (ON/WATCH/OFF) was being used here even though the
// badge displays the direction text, so "SHORT ONLY" (status=ON) rendered with
// the green "ON" color. Direction-aware so bearish signals are always red.
const DIRECTION_BADGE_STYLES: Record<OrcaSignals["direction"], string> = {
  "LONG ONLY":   "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  "WATCH LONG":  "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  "SHORT ONLY":  "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30",
  "WATCH SHORT": "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30",
  "FLAT":        "bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30",
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

const PULLBACK_STYLES: Record<NonNullable<OrcaSignals["pullback"]>, string> = {
  "Shallow": "bg-[#FCD34D]/15 text-[#FCD34D]",
  "Healthy": "bg-[#F59E0B]/15 text-[#F59E0B]",
  "Deep":    "bg-[#EF4444]/15 text-[#EF4444]",
  "Failed":  "bg-[#DC2626]/15 text-[#DC2626]",
};

// ── Center-fill bar ───────────────────────────────────────────────────────────
// Signed value = bull − bear. Fills from center: right/green = bullish lean,
// left/red = bearish lean. Near-50/50 readings are squashed into a near-invisible
// sliver so neutral rows visually recede and strong leans pop.
const CenterFillBar = ({
  bull, bear, layout = "stacked",
}: {
  bull: number; bear: number; layout?: "stacked" | "inline";
}) => {
  const signed = bull - bear; // -100..100
  const magnitude = Math.abs(signed);
  const deadZoned = magnitude < 10 ? magnitude * 0.15 : magnitude;
  const color = signed > 0 ? "#10B981" : signed < 0 ? "#EF4444" : "#64748B";

  const track = (
    <div className="relative w-full h-[5px] bg-[#1E293B] rounded-full overflow-hidden">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#334155]" />
      <div
        className="absolute top-0 bottom-0 rounded-full"
        style={
          signed >= 0
            ? { left: "50%", width: `${deadZoned / 2}%`, background: color }
            : { right: "50%", width: `${deadZoned / 2}%`, background: color }
        }
      />
    </div>
  );
  const label = (
    <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color }}>
      {signed > 0 ? `+${signed}` : signed}
    </span>
  );

  if (layout === "inline") {
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1">{track}</div>
        <span className="w-9 text-right">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full min-w-[64px]">
      {track}
      {label}
    </div>
  );
};

// ── Sparkline (last 30 1H closes) ──────────────────────────────────────────────
const Sparkline = ({ data }: { data: number[] }) => {
  if (!data || data.length < 2) {
    return <div className="h-7 flex items-center justify-center text-[#334155] text-xs">—</div>;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 90;
  const h = 28;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? "#10B981" : "#EF4444";
  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline points={areaPoints} fill={`${color}22`} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ── Orca MC — score breakdown bar (0 → cap, single direction, not bull/bear signed) ──
const ScoreBreakdownBar = ({ label, value, cap }: { label: string; value: number; cap: number }) => {
  const pct = cap > 0 ? Math.min(100, (value / cap) * 100) : 0;
  const color = pct >= 75 ? "#10B981" : pct >= 40 ? "#F59E0B" : "#64748B";
  return (
    <div className="flex items-center gap-3">
      <span className="text-[#94A3B8] text-xs w-20 shrink-0">{label}</span>
      <div className="flex-1 h-[6px] bg-[#1E293B] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums w-12 text-right shrink-0" style={{ color }}>
        {value}/{cap}
      </span>
    </div>
  );
};

// ── Orca MC — opportunity timeline stepper ───────────────────────────────────────
const OpportunityTimeline = ({ steps }: { steps: { state: string; is_current: boolean; is_next: boolean }[] }) => (
  <div className="flex items-center gap-1">
    {steps.map((step, i) => (
      <div key={step.state} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: step.is_current ? "#00D4FF" : step.is_next ? "#F59E0B" : "#334155",
              boxShadow: step.is_current ? "0 0 6px #00D4FF" : "none",
            }}
          />
          <span
            className="text-[10px] text-center leading-tight"
            style={{ color: step.is_current ? "#00D4FF" : step.is_next ? "#F59E0B" : "#64748B" }}
          >
            {step.state}
          </span>
        </div>
        {i < steps.length - 1 && <div className="flex-1 h-px bg-[#1E293B] mx-1" />}
      </div>
    ))}
  </div>
);

// ── Orca MC style maps ────────────────────────────────────────────────────────
const ORCA_MC_STATUS_STYLES: Record<string, string> = {
  "ON LONG":     "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  "ON SHORT":    "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30",
  "WATCH LONG":  "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  "WATCH SHORT": "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  "CAUTION":     "bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30",
  "OFF":         "bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30",
};

// Same color choices as ORCA_MC_STATUS_STYLES, but plain hex for contexts
// that just need colored text (no badge bg/border) — e.g. the Best Market banner.
const orcaMcStatusTextColor = (status: string): string => {
  if (status === "ON LONG") return "#10B981";
  if (status === "ON SHORT") return "#EF4444";
  if (status === "WATCH LONG" || status === "WATCH SHORT") return "#F59E0B";
  if (status === "CAUTION") return "#F97316";
  return "#64748B"; // OFF
};

// Subtle background tint for the detail view's top status banner — same
// color scheme as ORCA_MC_STATUS_STYLES, /10 opacity to match what the old
// (now-removed) OrcaSignals-based banner used.
const ORCA_MC_BANNER_BG: Record<string, string> = {
  "ON LONG":     "bg-[#10B981]/10 border border-[#10B981]/30",
  "ON SHORT":    "bg-[#EF4444]/10 border border-[#EF4444]/30",
  "WATCH LONG":  "bg-[#F59E0B]/10 border border-[#F59E0B]/30",
  "WATCH SHORT": "bg-[#F59E0B]/10 border border-[#F59E0B]/30",
  "CAUTION":     "bg-[#F97316]/10 border border-[#F97316]/30",
  "OFF":         "bg-[#64748B]/10 border border-[#64748B]/30",
};

const SUITABILITY_STYLES: Record<string, string> = {
  "Excellent": "bg-[#10B981]/15 text-[#10B981]",
  "Good":      "bg-[#34D399]/15 text-[#34D399]",
  "Average":   "bg-[#F59E0B]/15 text-[#F59E0B]",
  "Avoid":     "bg-[#EF4444]/15 text-[#EF4444]",
  "Poor":      "bg-[#F97316]/15 text-[#F97316]",
};

const triggerResultColor = (metCount: number): string =>
  metCount >= 3 ? "#10B981" : metCount === 2 ? "#F59E0B" : "#64748B";

// Reuses the existing PHASE_STYLES map — Orca MC's 6 phase names are a subset
// of OrcaSignals["market_phase"]'s 7 (missing only "Healthy Trend"), so the
// same colors apply; fallback covers any unexpected value defensively.
const phaseStyle = (phase: string): string =>
  (PHASE_STYLES as Record<string, string>)[phase] ?? "bg-[#64748B]/15 text-[#64748B]";

// ── Signal freshness ───────────────────────────────────────────────────────────
const FRESH_WINDOW_MIN = 60; // "just changed" highlight window

const formatFreshness = (iso: string | null): string => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const isFreshSignal = (iso: string | null): boolean => {
  if (!iso) return false;
  const mins = (Date.now() - new Date(iso).getTime()) / 60000;
  return mins < FRESH_WINDOW_MIN;
};

// ── Timeframe alignment ────────────────────────────────────────────────────────
// "We already compute intraday/daily/long-term — just count how many of the 3 lean the same way."
const getAlignment = (
  intraday: { bull: number }, daily: { bull: number }, longterm: { bull: number }
): { count: number; lean: "bull" | "bear" | "neutral" } => {
  const leans = [intraday, daily, longterm].map((tb) =>
    tb.bull > 50 ? "bull" : tb.bull < 50 ? "bear" : "neutral"
  );
  const bullCount = leans.filter((l) => l === "bull").length;
  const bearCount = leans.filter((l) => l === "bear").length;
  if (bullCount === 0 && bearCount === 0) return { count: 0, lean: "neutral" };
  return bullCount >= bearCount ? { count: bullCount, lean: "bull" } : { count: bearCount, lean: "bear" };
};

// Prefer Orca MC's score (the authoritative engine) when present, falling
// back to the old signals-based score only for symbols Orca MC hasn't
// computed yet. Used for sorting/export/best-market display, not just the
// table cell, so they all agree with what's actually shown in the column.
const effectiveScore = (asset: Asset): number => asset.orca_mc?.orca_score ?? asset.signals.orca_score;

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 52 }: { score: number; size?: number }) => {
  // Quality scale: high score = strong trend opportunity (long OR short)
  // low score = choppy / no edge
  const color =
    score >= 70
      ? "#10B981"   // green  — strong trend, high-conviction opportunity
      : score >= 50
      ? "#F59E0B"   // amber  — moderate trend, worth watching
      : score >= 30
      ? "#F97316"   // orange — weak trend, low confidence
      : "#94A3B8";  // slate  — neutral / chop, no meaningful opportunity
  const cx = size / 2;
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const sw = size * 0.077;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1E293B" strokeWidth={sw} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text x={cx} y={cx + size * 0.1} textAnchor="middle" fontSize={size * 0.25} fontWeight="bold" fill={color}>
        {score}
      </text>
    </svg>
  );
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <tr key={i} className="border-b border-[#1E293B]">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </td>
        <td className="py-4 px-4"><Skeleton className="h-7 w-full rounded-md" /></td>
        <td className="py-4 px-4"><Skeleton className="h-7 w-full rounded-md" /></td>
        <td className="py-4 px-4"><Skeleton className="h-7 w-full rounded-md" /></td>
        <td className="py-4 px-4"><Skeleton className="h-7 w-full rounded-md" /></td>
        <td className="py-4 px-4"><Skeleton className="h-6 w-12 rounded mx-auto" /></td>
        <td className="py-4 px-4"><Skeleton className="h-8 w-24 rounded mx-auto" /></td>
        <td className="py-4 px-4"><Skeleton className="h-6 w-10 rounded ml-auto" /></td>
        <td className="py-4 px-4"><Skeleton className="h-6 w-full rounded" /></td>
      </tr>
    ))}
  </>
);

// ── Map symbol → TradingView format ───────────────────────────────────────────
const getTVSymbol = (symbol: string): string => {
  if (symbol === "XAUUSD") return "TVC:GOLD";
  if (symbol === "XAGUSD") return "TVC:SILVER";
  if (symbol === "WTI")    return "TVC:USOIL";
  if (symbol === "US500")  return "CAPITALCOM:US500";
  if (symbol === "US100")  return "CAPITALCOM:US100";
  if (symbol === "US30")   return "CAPITALCOM:US30";
  if (symbol.includes("/")) {
    const base = symbol.split("/")[0];
    return `CRYPTO:${base}USD`;
  }
  if (/^[A-Z]{6}$/.test(symbol)) return `FX:${symbol}`;
  return symbol;
};

/** The one symbol that's shown in full even on the free tier (demo row). */
const DEMO_SYMBOL = "AUDJPY";

// ═════════════════════════════════════════════════════════════════════════════
export default function PremiumScreenerSection({ freeOnly = false }: { freeOnly?: boolean }) {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [assetClassFilter, setAssetClassFilter] = useState("All");
  const [trendFilter, setTrendFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [scoreSort, setScoreSort] = useState<"desc" | "asc" | null>(null);

  // Shared persisted state — also consumed by Watchlist + Alerts tabs
  const watchedSymbols       = useScreenerStore((s) => s.watchedSymbols);
  const alertSymbols         = useScreenerStore((s) => s.alertSymbols);
  const storeToggleWatchlist = useScreenerStore((s) => s.toggleWatchlist);
  const storeToggleAlert     = useScreenerStore((s) => s.toggleAlert);
  const enabledAssetClasses  = useScreenerStore((s) => s.enabledAssetClasses);
  const autoRefresh          = useScreenerStore((s) => s.autoRefresh);
  const refreshInterval      = useScreenerStore((s) => s.refreshInterval);
  const enabledTimeframes    = useScreenerStore((s) => s.enabledTimeframes);

  // Derive per-column TF label strings from enabled timeframes
  const intradayTFs  = ["5M", "30M", "1H"].filter((tf) => enabledTimeframes.includes(tf));
  const dailyTFs     = ["4H", "1D"].filter((tf) => enabledTimeframes.includes(tf));
  const longtermTFs  = ["1W", "1M"].filter((tf) => enabledTimeframes.includes(tf)); // 1W/1M always shown

  // Sync server-side alert subscriptions into the store on mount
  useUserAlerts();

  const { data, isLoading, isFetching, isError, refetch } = useScreener(page, 50, {
    autoRefresh,
    refreshInterval,
  });
  const { data: detail, isLoading: detailLoading } = useSymbolDetail(
    showDetailModal ? (selectedAsset?.symbol ?? null) : null
  );

  // Last updated label
  const lastUpdatedLabel = useMemo(() => {
    if (!data?.lastUpdated) return "Loading...";
    const diffMins = Math.floor(
      (Date.now() - new Date(data.lastUpdated).getTime()) / 60000
    );
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const h = Math.floor(diffMins / 60);
    return `${h} hour${h > 1 ? "s" : ""} ago`;
  }, [data?.lastUpdated]);

  // Asset class inference
  const inferAssetClass = useCallback((s: string) => {
    if (s.includes("XAU") || s.includes("XAG") || s.includes("OIL")) return "Commodities";
    if (s.includes("/")) return "Forex";
    if (s === "US500" || s === "US100" || s === "US30") return "Indices";
    if (s.includes("BTC") || s.includes("ETH") || s.includes("USDT")) return "Crypto";
    if (/^[A-Z]{6}$/.test(s)) return "Forex";
    return "Stocks";
  }, []);

  const assets: Asset[] = useMemo(
    () =>
      (data?.rows || []).map((row) => ({
        ...row,
        assetClass: inferAssetClass(row.symbol),
        inWatchlist: watchedSymbols.includes(row.symbol),
        advanced: {
          ...row.advanced,
          adxTrend:
            row.advanced.adx_dir === "flat" ? "neutral" : row.advanced.adx_dir,
          emaStatus: row.advanced.ema === "aligned" ? "aligned" : "crossed",
          hasAlert: alertSymbols.includes(row.symbol),
        },
      })),
    [data?.rows, watchedSymbols, alertSymbols, inferAssetClass]
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Global class filter (from Filters & Settings) + screener dropdown filter
      const matchesAssetClass =
        enabledAssetClasses.includes(asset.assetClass) &&
        (assetClassFilter === "All" || asset.assetClass === assetClassFilter);
      let matchesTrend = true;
      if (trendFilter !== "All") {
        const bull = asset.daily.bull;
        if (trendFilter === "Strong Bullish") matchesTrend = bull >= 70;
        else if (trendFilter === "Bullish") matchesTrend = bull >= 55 && bull < 70;
        else if (trendFilter === "Neutral") matchesTrend = bull >= 45 && bull < 55;
        else if (trendFilter === "Bearish") matchesTrend = bull >= 30 && bull < 45;
        else if (trendFilter === "Strong Bearish") matchesTrend = bull < 30;
      }
      return matchesSearch && matchesAssetClass && matchesTrend;
    });
  }, [assets, searchQuery, assetClassFilter, trendFilter, enabledAssetClasses]);

  const sortedAssets = useMemo(() => {
    if (!scoreSort) return filteredAssets;
    const sorted = [...filteredAssets].sort((a, b) => effectiveScore(a) - effectiveScore(b));
    return scoreSort === "desc" ? sorted.reverse() : sorted;
  }, [filteredAssets, scoreSort]);

  const toggleScoreSort = useCallback(() => {
    setScoreSort((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
  }, []);

  // Best market (visible on current page)
  const bestAsset = useMemo(
    () => filteredAssets.find((a) => a.signals.is_best) ?? null,
    [filteredAssets]
  );

  const toggleWatchlist = useCallback(
    (symbol: string) => {
      storeToggleWatchlist(symbol);
      if (selectedAsset?.symbol === symbol) {
        setSelectedAsset({ ...selectedAsset, inWatchlist: !selectedAsset.inWatchlist });
      }
    },
    [selectedAsset, storeToggleWatchlist]
  );

  const toggleAlert = useCallback(
    async (symbol: string) => {
      const wasSubscribed = alertSymbols.includes(symbol);

      // Optimistic update
      storeToggleAlert(symbol);
      if (selectedAsset?.symbol === symbol) {
        setSelectedAsset({
          ...selectedAsset,
          advanced: { ...selectedAsset.advanced, hasAlert: !wasSubscribed },
        });
      }

      // Persist to backend
      try {
        if (wasSubscribed) {
          await unsubscribeAlert(symbol);
        } else {
          await subscribeAlert(symbol);
        }
      } catch {
        // Revert on error
        storeToggleAlert(symbol);
        if (selectedAsset?.symbol === symbol) {
          setSelectedAsset({
            ...selectedAsset,
            advanced: { ...selectedAsset.advanced, hasAlert: wasSubscribed },
          });
        }
      }
    },
    [alertSymbols, selectedAsset, storeToggleAlert]
  );

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.screener.all });
  }, [queryClient]);

  const handleExport = useCallback(() => {
    if (!sortedAssets.length) return;
    const headers = [
      "Symbol","Name","Asset Class","Intraday Bull%","Daily Bull%",
      "Long-Term Bull%","ADX","EMA Status","Orca Status","Orca Score",
    ];
    const rows = sortedAssets.map((a) => [
      a.symbol, a.name, a.assetClass,
      a.intraday.bull, a.daily.bull, a.longterm.bull,
      a.advanced.adx, a.advanced.emaStatus,
      a.orca_mc?.status ?? a.signals.status, effectiveScore(a),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `screener-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [sortedAssets]);

  const openModal = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-white text-[32px]">
            {freeOnly ? "OrcaTrading Screener" : "Premium Screener"}
          </h1>
          <p className="text-[#94A3B8]">Real-time multi-timeframe trend analysis</p>
        </div>

        {freeOnly && (
          <a
            href={STRIPE_UPGRADE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              color: "white",
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(99,102,241,0.35)",
            }}
          >
            <Zap className="w-4 h-4" />
            Get Advanced Screener Access
          </a>
        )}
      </div>

      {/* Best Market Today Banner — advanced data, hide in free mode */}
      {bestAsset && !freeOnly && (
        <div
          className="flex items-center gap-4 bg-gradient-to-r from-[#FFD700]/10 to-[#F59E0B]/5 border border-[#FFD700]/30 rounded-xl px-5 py-3 cursor-pointer hover:border-[#FFD700]/60 transition-all"
          onClick={() => openModal(bestAsset)}
        >
          <Trophy className="w-5 h-5 text-[#FFD700] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[#FFD700] text-xs font-semibold uppercase tracking-wider">
              Best Market Today
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white font-bold">{bestAsset.symbol}</span>
              <span className="text-[#94A3B8] text-sm truncate">{bestAsset.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {bestAsset.orca_mc ? (
              <span className="text-sm font-semibold" style={{ color: orcaMcStatusTextColor(bestAsset.orca_mc.status) }}>
                {bestAsset.orca_mc.status}
              </span>
            ) : (
              <span className={`text-sm font-semibold ${DIRECTION_STYLES[bestAsset.signals.direction]}`}>
                {bestAsset.signals.direction}
              </span>
            )}
            <ScoreRing score={effectiveScore(bestAsset)} />
            {bestAsset.orca_mc ? (
              <Badge className={`${phaseStyle(bestAsset.orca_mc.phase)} border-0 text-xs`}>
                {bestAsset.orca_mc.phase}
              </Badge>
            ) : (
              <Badge className={`${PHASE_STYLES[bestAsset.signals.market_phase]} border-0 text-xs`}>
                {bestAsset.signals.market_phase}
              </Badge>
            )}
          </div>
        </div>
      )}
      {/* End Best Market Today banner */}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search — full width on mobile */}
        <div className="relative w-full sm:w-auto order-first sm:order-last">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <Input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[240px] bg-[#14181F] border-[#1E293B] text-white placeholder:text-[#64748B] focus:border-[#00D4FF]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={assetClassFilter} onValueChange={setAssetClassFilter}>
            <SelectTrigger className="w-[140px] sm:w-[180px] bg-[#14181F] border-[#1E293B] text-white text-sm">
              <SelectValue placeholder="Asset Class" />
            </SelectTrigger>
            <SelectContent className="bg-[#14181F] border-[#1E293B]">
              <SelectItem value="All">All Asset Classes</SelectItem>
              <SelectItem value="Forex">Forex</SelectItem>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="Stocks">Stocks</SelectItem>
              <SelectItem value="Indices">Indices</SelectItem>
              <SelectItem value="Commodities">Commodities</SelectItem>
            </SelectContent>
          </Select>

          <Select value={trendFilter} onValueChange={setTrendFilter}>
            <SelectTrigger className="w-[140px] sm:w-[200px] bg-[#14181F] border-[#1E293B] text-white text-sm">
              <SelectValue placeholder="Trend Strength" />
            </SelectTrigger>
            <SelectContent className="bg-[#14181F] border-[#1E293B]">
              <SelectItem value="All">All Trends</SelectItem>
              <SelectItem value="Strong Bullish">Strong Bullish</SelectItem>
              <SelectItem value="Bullish">Bullish</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Bearish">Bearish</SelectItem>
              <SelectItem value="Strong Bearish">Strong Bearish</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-[#14181F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1A1F2E]"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""} sm:mr-2`} />
            <span className="hidden sm:inline text-sm">{lastUpdatedLabel}</span>
          </Button>

          {!freeOnly && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={filteredAssets.length === 0}
              className="bg-[#14181F] border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white disabled:opacity-50"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-lg overflow-hidden">
        {/* Relative wrapper so the lock overlay can be absolutely positioned over the table only */}
        <div style={{ position: "relative" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0A1628]">
                <th className="py-4 px-4 text-left text-white w-[200px]">SYMBOL</th>
                <th className="py-4 px-4 text-center text-white w-[100px]">TREND 1H</th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1">INTRADAY</div>
                  <div className="text-xs text-[#94A3B8]">
                    {intradayTFs.length > 0 ? intradayTFs.join(" | ") : "—"}
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1">DAILY</div>
                  <div className="text-xs text-[#94A3B8]">
                    {dailyTFs.length > 0 ? dailyTFs.join(" | ") : "—"}
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1 flex items-center justify-center gap-1.5">
                    LONG-TERM {freeOnly && <span className="text-[#475569]">🔒</span>}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    {["1D", "1W", ...longtermTFs].join(" | ")}
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[70px]">
                  ALIGN {freeOnly && <span className="text-[#475569]">🔒</span>}
                </th>
                <th className="py-4 px-4 text-center text-white w-[150px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#00D4FF]" />
                    <span>ORCA STATUS</span>
                    {freeOnly && <span className="text-[#475569]">🔒</span>}
                  </div>
                </th>
                <th
                  className="py-4 px-4 text-right text-white w-[90px] cursor-pointer select-none"
                  onClick={toggleScoreSort}
                  title="Sort by score"
                >
                  <div className="flex items-center justify-end gap-1">
                    SCORE
                    {scoreSort === "desc" && <span className="text-[#00D4FF]">▾</span>}
                    {scoreSort === "asc" && <span className="text-[#00D4FF]">▴</span>}
                    {freeOnly && <span className="text-[#475569]">🔒</span>}
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[220px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span>ADVANCED</span>
                    <Badge className="bg-[#FFD700] text-black text-xs px-2 py-0">PRO</Badge>
                    {freeOnly && <span className="text-[#475569]">🔒</span>}
                  </div>
                  <div className="text-xs text-[#94A3B8]">ADX | EMA | VOL</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : isError ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-red-400">
                    Failed to load market data. Please check your connection.
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#94A3B8]">
                    {assets.length === 0
                      ? "No data available. Data may be warming up..."
                      : "No assets found. Try adjusting your filters."}
                  </td>
                </tr>
              ) : (
                sortedAssets.map((asset) => {
                  const locked = freeOnly && asset.symbol !== DEMO_SYMBOL;
                  // A light blur (not pitch-dark) so free users still get a sense of
                  // what's there — the shape/color of the data is the upsell.
                  const lockedStyle = locked ? { filter: "blur(3px)", userSelect: "none" as const, pointerEvents: "none" as const } : {};
                  // Status/Score/Align prefer Orca MC (the authoritative engine) when
                  // present, falling back to the old signals-based system only for
                  // symbols Orca MC hasn't computed yet — this fallback chain is what
                  // prevents the main table from going blank right after this shipped.
                  const alignment = getAlignment(asset.intraday, asset.daily, asset.longterm);
                  const displayScore = effectiveScore(asset);
                  const displayStatusSince = asset.orca_mc?.status_since ?? asset.signals.status_since;
                  const fresh = isFreshSignal(displayStatusSince);

                  return (
                    <tr
                      key={asset.symbol}
                      className={`border-b border-[#1E293B] transition-all duration-200 ${
                        !locked ? "hover:bg-[#1A1F2E] cursor-pointer" : ""
                      } ${asset.signals.is_best && !freeOnly ? "ring-1 ring-inset ring-[#FFD700]/20" : ""}`}
                      onClick={() => !locked && openModal(asset)}
                    >
                      {/* SYMBOL */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(asset.symbol);
                            }}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                asset.inWatchlist
                                  ? "fill-[#00D4FF] text-[#00D4FF]"
                                  : "text-[#64748B]"
                              }`}
                            />
                          </button>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-white font-medium">{asset.symbol}</span>
                              {asset.signals.is_best && (
                                <Trophy className="w-3 h-3 text-[#FFD700]" />
                              )}
                            </div>
                            <div className="text-[#94A3B8] text-xs">{asset.name}</div>
                          </div>
                        </div>
                      </td>

                      {/* TREND 1H — sparkline */}
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <Sparkline data={asset.sparkline} />
                        </div>
                      </td>

                      {/* INTRADAY — blurred for locked free rows */}
                      <td className="py-3 px-4">
                        <div style={lockedStyle}>
                          <CenterFillBar bear={asset.intraday.bear} bull={asset.intraday.bull} />
                        </div>
                      </td>

                      {/* DAILY — blurred for locked free rows */}
                      <td className="py-3 px-4">
                        <div style={lockedStyle}>
                          <CenterFillBar bear={asset.daily.bear} bull={asset.daily.bull} />
                        </div>
                      </td>

                      {/* LONG-TERM — blurred for locked free rows */}
                      <td className="py-3 px-4">
                        <div style={lockedStyle}>
                          <CenterFillBar bear={asset.longterm.bear} bull={asset.longterm.bull} />
                        </div>
                      </td>

                      {/* ALIGN — blurred for locked free rows */}
                      <td className="py-3 px-4 text-center">
                        <div style={lockedStyle}>
                          {asset.orca_mc ? (
                            <span
                              className={`text-xs font-semibold ${
                                asset.orca_mc.mtf_bull_count > asset.orca_mc.mtf_bear_count ? "text-[#10B981]"
                                : asset.orca_mc.mtf_bear_count > asset.orca_mc.mtf_bull_count ? "text-[#EF4444]"
                                : "text-[#64748B]"
                              }`}
                            >
                              {asset.orca_mc.mtf_align_str}
                            </span>
                          ) : alignment.lean === "neutral" ? (
                            <span className="text-[#64748B] text-xs">—</span>
                          ) : (
                            <span
                              className={`text-xs font-semibold ${
                                alignment.lean === "bull" ? "text-[#10B981]" : "text-[#EF4444]"
                              }`}
                            >
                              {alignment.count}/3 {alignment.lean}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ORCA STATUS — pill + freshness, blurred for locked free rows */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col items-center gap-1" style={lockedStyle}>
                          <Badge
                            className={`${
                              asset.orca_mc
                                ? (ORCA_MC_STATUS_STYLES[asset.orca_mc.status] ?? ORCA_MC_STATUS_STYLES.OFF)
                                : DIRECTION_BADGE_STYLES[asset.signals.direction]
                            } text-xs font-bold border-0 px-3 ${fresh ? "ring-2 ring-[#00D4FF]/50" : ""}`}
                          >
                            {asset.orca_mc ? asset.orca_mc.status : asset.signals.direction}
                          </Badge>
                          {displayStatusSince && (
                            <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                              {fresh && <Zap className="w-2.5 h-2.5 text-[#00D4FF]" />}
                              {formatFreshness(displayStatusSince)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SCORE — own sortable column, blurred for locked free rows */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2" style={lockedStyle}>
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                displayScore >= 70 ? "#10B981"
                                : displayScore >= 40 ? "#F59E0B"
                                : "#64748B",
                            }}
                          />
                          <span className="text-white font-semibold tabular-nums">{displayScore}</span>
                        </div>
                      </td>

                      {/* ADVANCED — blurred for locked free rows */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 text-sm" style={lockedStyle}>
                          {/* ADX */}
                          <div className="flex items-center gap-1">
                            <span className={asset.advanced.adx >= 25 ? "text-[#10B981]" : "text-[#94A3B8]"}>
                              {asset.advanced.adx}
                            </span>
                            {asset.advanced.adxTrend === "up" && <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />}
                            {asset.advanced.adxTrend === "down" && <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />}
                            {asset.advanced.adxTrend === "neutral" && <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />}
                          </div>
                          {/* EMA */}
                          <Badge className={`${asset.advanced.emaStatus === "aligned" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#EF4444]/20 text-[#EF4444]"} border-0 text-xs`}>
                            EMA {asset.advanced.emaStatus === "aligned" ? "✓" : "✗"}
                          </Badge>
                          {/* VOL */}
                          <div className="flex items-center gap-1.5">
                            <div className="w-8 h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                              <div className="h-full bg-[#00D4FF]" style={{ width: `${asset.advanced.vol}%` }} />
                            </div>
                            <span className="text-[#94A3B8] text-xs">{asset.advanced.vol}</span>
                          </div>
                          {/* ALERT */}
                          {!locked && (
                            <button onClick={(e) => { e.stopPropagation(); toggleAlert(asset.symbol); }}>
                              <Bell className={`w-4 h-4 ${asset.advanced.hasAlert ? "text-[#FFD700]" : "text-[#64748B]"}`} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>{/* end overflow-x-auto */}

        {/* Lock overlay — covers the locked columns (Long-Term, Align, Status, Score, Advanced) with a gradient + upgrade CTA */}
        {freeOnly && (
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: "48%", right: 0,
              pointerEvents: "none",
              zIndex: 5,
              background:
                "linear-gradient(to right, transparent 0%, rgba(11,15,25,0.92) 20%, rgba(11,15,25,0.97) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <a
              href={STRIPE_UPGRADE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                pointerEvents: "all",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                color: "white",
                textDecoration: "none",
                padding: "14px 28px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                boxShadow: "0 0 48px rgba(99,102,241,0.55), 0 8px 32px rgba(0,0,0,0.7)",
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              🔒 Get Advanced Screener Access
            </a>
          </div>
        )}
        </div>{/* end relative wrapper */}

        {/* Pagination */}
        {!isLoading && filteredAssets.length > 0 && (
          <div className="border-t border-[#1E293B] py-4 px-6 flex items-center justify-between">
            <div className="text-[#94A3B8] text-sm">
              Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, data?.total || 0)} of{" "}
              {data?.total || 0} assets
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-transparent border-[#1E293B] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white disabled:opacity-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || data.rows.length < 50}
                className="bg-transparent border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal — full-page popout: chart dominates, metrics live in a side panel */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        {/* sm:max-w-none below isn't redundant — the base Dialog has sm:max-w-lg, and
            tailwind-merge treats different responsive modifiers as separate class
            groups, so a bare max-w-none alone does NOT remove it. Without this, the
            popout silently caps at 32rem on any screen >=640px wide. */}
        <DialogContent className="bg-[#0B0F19] border-none text-white fixed top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen max-w-none sm:max-w-none max-h-none rounded-none flex flex-col overflow-hidden p-0 gap-0">

          {/* Pinned header — X button always visible here */}
          <div className="px-6 py-4 border-b border-[#1E293B] shrink-0 pr-14 flex items-center justify-between bg-[#0A1628]">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {selectedAsset?.symbol} – {selectedAsset?.name}
              </DialogTitle>
              <DialogDescription className="text-[#94A3B8] text-sm mt-0.5">
                Full multi-timeframe breakdown &amp; OrcaBot signals
              </DialogDescription>
            </div>
          </div>

          {detailLoading || !detail ? (
            <div className="flex-1 p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

              {/* Main area — chart fills all available space */}
              <div className="flex-1 min-w-0 p-4 lg:p-6 flex flex-col min-h-[320px]">
                <div className="flex-1 rounded-lg overflow-hidden border border-[#1E293B]">
                  <CandlestickChart
                    key={detail.symbol}
                    symbol={detail.symbol}
                    magnet_structures={detail.magnet_structures ?? []}
                  />
                </div>
              </div>

              {/* Side panel — signals, breakdown, metrics, actions */}
              <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#1E293B] overflow-y-auto p-4 lg:p-6 space-y-4">

                {/* OrcaBot Status — the one and only status banner (Orca MC v3.0 engine) */}
                {detail.orca_mc ? (
                  <div className={`rounded-xl px-4 py-3 ${ORCA_MC_BANNER_BG[detail.orca_mc.status] ?? ORCA_MC_BANNER_BG.OFF}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">OrcaBot Status</div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xl font-bold" style={{ color: orcaMcStatusTextColor(detail.orca_mc.status) }}>
                            {detail.orca_mc.status}
                          </span>
                        </div>
                        {detail.orca_mc.status_since && (
                          <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
                            {isFreshSignal(detail.orca_mc.status_since) && <Zap className="w-3 h-3 text-[#00D4FF]" />}
                            {formatFreshness(detail.orca_mc.status_since)}
                          </div>
                        )}
                      </div>
                      <div className="text-center shrink-0">
                        <div className="text-xs text-[#94A3B8] mb-1">Orca Score</div>
                        <ScoreRing score={detail.orca_mc.score.orca_score} size={46} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className={`${phaseStyle(detail.orca_mc.phase)} border-0 text-xs`}>{detail.orca_mc.phase}</Badge>
                      <span className="text-[#64748B] text-xs">{detail.orca_mc.trend_struct} · {detail.orca_mc.mtf.align_str}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl px-4 py-6 bg-[#0A1628] border border-[#1E293B] text-center">
                    <div className="text-[#64748B] text-sm">Market Conditions data not yet available for this symbol</div>
                    <div className="text-[#475569] text-xs mt-1">Check back after the next data refresh</div>
                  </div>
                )}

                {/* MTF Breakdown — center-fill bars, consistent with the main table */}
                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm font-medium mb-3">Multi-Timeframe Breakdown</div>
                  <div className="space-y-2">
                    {detail.timeframes.map((tf) => (
                      <div key={tf.timeframe} className="flex items-center gap-3">
                        <span className="text-[#64748B] text-xs w-8 shrink-0 text-right">{tf.label}</span>
                        <div className="flex-1">
                          <CenterFillBar bear={tf.bear} bull={tf.bull} layout="inline" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced metrics — 2×2, fits the narrower side panel */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                    <div className="text-[#94A3B8] text-sm mb-2">ADX Trend Strength</div>
                    <div className="text-2xl text-white font-bold">{detail.advanced.adx}</div>
                    <div className={`text-sm mt-1 ${detail.advanced.adx >= 25 ? "text-[#10B981]" : "text-[#94A3B8]"}`}>
                      {detail.advanced.adx >= 35 ? "Very Strong Trend"
                        : detail.advanced.adx >= 25 ? "Strong Trend"
                        : detail.advanced.adx >= 20 ? "Developing Trend"
                        : "Weak / Ranging"}
                    </div>
                  </div>

                  <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                    <div className="text-[#94A3B8] text-sm mb-2">EMA Alignment</div>
                    <div className={`text-2xl font-bold ${detail.advanced.ema === "aligned" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {detail.advanced.ema === "aligned" ? "✓ Aligned" : "✗ Mixed"}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">EMA 9, 21, 50</div>
                  </div>

                  <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                    <div className="text-[#94A3B8] text-sm mb-2">Volatility (ATR-based)</div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                        <div className="h-full bg-[#00D4FF]" style={{ width: `${detail.advanced.vol}%` }} />
                      </div>
                      <span className="text-white font-bold text-lg">{detail.advanced.vol}</span>
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">
                      {detail.advanced.vol >= 70 ? "High volatility" : detail.advanced.vol >= 40 ? "Moderate volatility" : "Low volatility"}
                    </div>
                  </div>

                  <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                    <div className="text-[#94A3B8] text-sm mb-2">ADX Direction</div>
                    <div className="flex items-center gap-2 mt-1">
                      {detail.advanced.adx_dir === "up" ? (
                        <><TrendingUp className="w-6 h-6 text-[#10B981]" /><span className="text-[#10B981] text-lg font-bold">Rising</span></>
                      ) : detail.advanced.adx_dir === "down" ? (
                        <><TrendingDown className="w-6 h-6 text-[#EF4444]" /><span className="text-[#EF4444] text-lg font-bold">Falling</span></>
                      ) : (
                        <><ArrowRight className="w-6 h-6 text-[#94A3B8]" /><span className="text-[#94A3B8] text-lg font-bold">Flat</span></>
                      )}
                    </div>
                    <div className="text-sm text-[#64748B] mt-1">+DI vs −DI comparison</div>
                  </div>
                </div>

                {/* ── Orca MC v3.0 — Market Conditions engine (Phase A, no POI yet) ── */}
                {detail.orca_mc && (
                  <>
                    {/* Score Breakdown */}
                    <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#94A3B8] text-sm font-medium">Score Breakdown</span>
                        <span className="text-white text-sm font-bold tabular-nums">{detail.orca_mc.score.orca_score}/100</span>
                      </div>
                      <div className="space-y-2">
                        <ScoreBreakdownBar label="HTF Bias" value={detail.orca_mc.score.p_htf} cap={detail.orca_mc.score.cap_htf} />
                        <ScoreBreakdownBar label="ADX Strength" value={detail.orca_mc.score.p_adx} cap={detail.orca_mc.score.cap_adx} />
                        <ScoreBreakdownBar label="EMA Structure" value={detail.orca_mc.score.p_ema} cap={detail.orca_mc.score.cap_ema} />
                        <ScoreBreakdownBar label="Market Phase" value={detail.orca_mc.score.p_phase} cap={detail.orca_mc.score.cap_phase} />
                        <ScoreBreakdownBar label="Volatility" value={detail.orca_mc.score.p_vol} cap={detail.orca_mc.score.cap_vol} />
                      </div>
                    </div>

                    {/* Next Trigger checklist */}
                    <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#94A3B8] text-sm font-medium">Next Trigger</span>
                        <span className="text-xs font-semibold" style={{ color: triggerResultColor(detail.orca_mc.next_trigger.met_count) }}>
                          {detail.orca_mc.next_trigger.met_count}/4 met
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        {[
                          [detail.orca_mc.next_trigger.c1_label, detail.orca_mc.next_trigger.c1_met],
                          [detail.orca_mc.next_trigger.c2_label, detail.orca_mc.next_trigger.c2_met],
                          [detail.orca_mc.next_trigger.c3_label, detail.orca_mc.next_trigger.c3_met],
                          [detail.orca_mc.next_trigger.c4_label, detail.orca_mc.next_trigger.c4_met],
                        ].map(([label, met], idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {met ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-[#475569] shrink-0" />
                            )}
                            <span className={`text-xs ${met ? "text-white" : "text-[#64748B]"}`}>{label as string}</span>
                          </div>
                        ))}
                      </div>
                      <div
                        className="text-xs font-medium px-2.5 py-1.5 rounded text-center"
                        style={{
                          color: triggerResultColor(detail.orca_mc.next_trigger.met_count),
                          background: `${triggerResultColor(detail.orca_mc.next_trigger.met_count)}1A`,
                        }}
                      >
                        {detail.orca_mc.next_trigger.result}
                      </div>
                    </div>

                    {/* Readiness */}
                    <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                      <div className="flex items-center gap-4">
                        <ScoreRing score={detail.orca_mc.readiness.score} size={46} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-bold">{detail.orca_mc.readiness.tier}</span>
                          </div>
                          <div className="text-[#64748B] text-xs">{detail.orca_mc.readiness.reason}</div>
                        </div>
                      </div>
                      <div className="text-[#64748B] text-xs mt-3 pt-3 border-t border-[#1E293B]">
                        Expected next: <span className="text-white font-medium">{detail.orca_mc.readiness.expected_next}</span>
                      </div>
                    </div>

                    {/* Suitability + Confidence */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                        <div className="text-[#94A3B8] text-sm mb-2">Suitability</div>
                        <Badge className={`${SUITABILITY_STYLES[detail.orca_mc.suitability.rating] ?? SUITABILITY_STYLES.Poor} border-0 text-sm font-bold`}>
                          {detail.orca_mc.suitability.rating}
                        </Badge>
                        <div className="text-[#64748B] text-xs mt-2">{detail.orca_mc.suitability.reason}</div>
                      </div>
                      <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                        <div className="text-[#94A3B8] text-sm mb-2">Confidence</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                            <div className="h-full bg-[#00D4FF]" style={{ width: `${detail.orca_mc.confidence.score}%` }} />
                          </div>
                          <span className="text-white font-bold text-sm">{detail.orca_mc.confidence.score}%</span>
                        </div>
                        <div className="text-[#64748B] text-xs mt-2">{detail.orca_mc.confidence.tier}</div>
                      </div>
                    </div>

                    {/* Why */}
                    {detail.orca_mc.why.length > 0 && (
                      <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                        <div className="text-[#94A3B8] text-sm font-medium mb-2">Why?</div>
                        <ul className="space-y-1.5">
                          {detail.orca_mc.why.map((bullet, idx) => (
                            <li key={idx} className="text-sm text-white flex items-start gap-2">
                              <span className="text-[#00D4FF] mt-0.5">•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Opportunity Timeline */}
                    <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                      <div className="text-[#94A3B8] text-sm font-medium mb-3">Opportunity Timeline</div>
                      <OpportunityTimeline steps={detail.orca_mc.opportunity_timeline} />
                    </div>

                    {detail.orca_mc.poi_pending && (
                      <div className="text-[10px] text-[#475569] text-center -mt-1">
                        Supply/demand zone (POI) engine coming soon
                      </div>
                    )}
                  </>
                )}

                {/* ── Magnet Map — bias gauge + full ranked structure list ── */}
                {(detail.magnet_structures?.length > 0 || detail.magnet_above || detail.magnet_below) && (() => {
                  const structs = detail.magnet_structures ?? [];
                  const bias = detail.magnet_bias ?? 0;
                  const biasAbs = Math.abs(bias);
                  const biasColor = bias > 15 ? "#10B981" : bias < -15 ? "#EF4444" : "#64748B";
                  const biasLabel = bias > 15 ? "Bullish Pull" : bias < -15 ? "Bearish Pull" : "Neutral";
                  const above = structs.filter((m) => (m.price_top + m.price_bottom) / 2 > (detail.magnet_above?.price_top ?? 0) || detail.magnet_above == null
                    ? true : false);
                  // Re-split properly using magnet_above/below as reference or just by position
                  const allAbove = structs.filter((m) => detail.magnet_above && m.formed_at === detail.magnet_above.formed_at && m.structure_type === detail.magnet_above.structure_type ? false : true);

                  return (
                    <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[#94A3B8] text-sm font-medium">Magnet Map</span>
                        <span className="text-xs font-semibold" style={{ color: biasColor }}>{biasLabel}</span>
                      </div>

                      {/* Bias gauge */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[10px] text-[#64748B] mb-1">
                          <span>Bearish Pull</span>
                          <span className="font-semibold tabular-nums" style={{ color: biasColor }}>
                            {bias > 0 ? "+" : ""}{bias.toFixed(0)}
                          </span>
                          <span>Bullish Pull</span>
                        </div>
                        <div className="relative h-2 bg-[#1E293B] rounded-full overflow-hidden">
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#334155]" />
                          <div
                            className="absolute top-0 bottom-0 rounded-full transition-all"
                            style={
                              bias >= 0
                                ? { left: "50%", width: `${biasAbs / 2}%`, background: biasColor }
                                : { right: "50%", width: `${biasAbs / 2}%`, background: biasColor }
                            }
                          />
                        </div>
                      </div>

                      {/* Structures above current price */}
                      {detail.magnet_above && (
                        <div className="space-y-1.5 mb-2">
                          {structs
                            .filter((m) => (m.price_top + m.price_bottom) / 2 > (detail.magnet_above!.price_top + detail.magnet_above!.price_bottom) / 2 ||
                              (m.structure_type === detail.magnet_above!.structure_type && m.formed_at === detail.magnet_above!.formed_at))
                            .slice(0, 4)
                            .reverse()
                            .map((m, i) => {
                              const color = magnetColor(m);
                              const isNearest = m.structure_type === detail.magnet_above!.structure_type && m.formed_at === detail.magnet_above!.formed_at;
                              return (
                                <div key={i} className={`flex items-center justify-between py-1 px-2 rounded ${isNearest ? "bg-[#1E293B]" : ""}`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                                    <span className="text-xs truncate" style={{ color }}>{structureLabel(m)}</span>
                                    <span className="text-[10px] text-[#334155] uppercase shrink-0">
                                      {m.timeframe === "session" ? "D" : m.timeframe.replace("1day","D").replace("4h","4H").replace("1h","1H").toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0 ml-2">
                                    <div className="text-white text-[11px] font-mono">
                                      {m.price_top === m.price_bottom ? m.price_top.toFixed(5) : `${m.price_bottom.toFixed(5)}–${m.price_top.toFixed(5)}`}
                                    </div>
                                    {m.atr_distance != null && (
                                      <div className="text-[#64748B] text-[10px]">{m.atr_distance.toFixed(1)} ATR</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {/* Current price divider */}
                      <div className="flex items-center gap-2 my-2">
                        <div className="flex-1 h-px bg-[#A78BFA]/30" />
                        <span className="text-[#A78BFA] text-[10px] font-medium">CURRENT PRICE</span>
                        <div className="flex-1 h-px bg-[#A78BFA]/30" />
                      </div>

                      {/* Structures below current price */}
                      {detail.magnet_below && (
                        <div className="space-y-1.5 mt-2">
                          {structs
                            .filter((m) => (m.price_top + m.price_bottom) / 2 <= (detail.magnet_below!.price_top + detail.magnet_below!.price_bottom) / 2 ||
                              (m.structure_type === detail.magnet_below!.structure_type && m.formed_at === detail.magnet_below!.formed_at))
                            .slice(0, 4)
                            .map((m, i) => {
                              const color = magnetColor(m);
                              const isNearest = m.structure_type === detail.magnet_below!.structure_type && m.formed_at === detail.magnet_below!.formed_at;
                              return (
                                <div key={i} className={`flex items-center justify-between py-1 px-2 rounded ${isNearest ? "bg-[#1E293B]" : ""}`}>
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                                    <span className="text-xs truncate" style={{ color }}>{structureLabel(m)}</span>
                                    <span className="text-[10px] text-[#334155] uppercase shrink-0">
                                      {m.timeframe === "session" ? "D" : m.timeframe.replace("1day","D").replace("4h","4H").replace("1h","1H").toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-right shrink-0 ml-2">
                                    <div className="text-white text-[11px] font-mono">
                                      {m.price_top === m.price_bottom ? m.price_top.toFixed(5) : `${m.price_bottom.toFixed(5)}–${m.price_top.toFixed(5)}`}
                                    </div>
                                    {m.atr_distance != null && (
                                      <div className="text-[#64748B] text-[10px]">{m.atr_distance.toFixed(1)} ATR</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}

                      {structs.length === 0 && (
                        <div className="text-[#475569] text-xs text-center py-2">No structures detected yet</div>
                      )}
                    </div>
                  );
                })()}

                {/* Action buttons */}
                <div className="flex gap-3 pb-2">
                  <Button
                    className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] text-black"
                    onClick={() => toggleAlert(detail.symbol)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {selectedAsset?.advanced.hasAlert ? "Remove Alert" : "Add Alert"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#1E293B] bg-[#1A1F2E] text-white hover:bg-[#16202B]"
                    onClick={() => toggleWatchlist(detail.symbol)}
                  >
                    <Star
                      className="w-4 h-4 mr-2"
                      stroke={selectedAsset?.inWatchlist ? "#00D4FF" : "#FFFFFF"}
                      fill={selectedAsset?.inWatchlist ? "#00D4FF" : "none"}
                    />
                    {selectedAsset?.inWatchlist ? "Remove from" : "Add to"} Watchlist
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
