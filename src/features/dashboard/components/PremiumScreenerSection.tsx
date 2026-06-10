"use client";

import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { useSymbolDetail } from "@/features/dashboard/hooks/useSymbolDetail";
import { ScreenerRow, OrcaSignals } from "@/features/dashboard/types/screener";
import { queryKeys } from "@/lib/query/keys";
import { useScreenerStore } from "@/store/screener-store";
import { useUserAlerts } from "@/features/dashboard/hooks/useUserAlerts";
import { subscribeAlert, unsubscribeAlert } from "@/features/dashboard/services/alerts";
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
const STATUS_STYLES: Record<OrcaSignals["status"], string> = {
  ON:    "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
  WATCH: "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30",
  OFF:   "bg-[#64748B]/20 text-[#64748B] border border-[#64748B]/30",
};

const DIRECTION_STYLES: Record<OrcaSignals["direction"], string> = {
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

const PULLBACK_STYLES: Record<NonNullable<OrcaSignals["pullback"]>, string> = {
  "Shallow": "bg-[#FCD34D]/15 text-[#FCD34D]",
  "Healthy": "bg-[#F59E0B]/15 text-[#F59E0B]",
  "Deep":    "bg-[#EF4444]/15 text-[#EF4444]",
  "Failed":  "bg-[#DC2626]/15 text-[#DC2626]",
};

// ── Stacked bar ───────────────────────────────────────────────────────────────
const StackedBar = ({
  bear,
  bull,
  compact = false,
}: {
  bear: number;
  bull: number;
  compact?: boolean;
}) => (
  <div
    className={`relative w-full ${compact ? "h-6" : "h-9"} bg-[#1A1F2E] rounded-md overflow-hidden flex`}
  >
    <div
      className="h-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#DC2626] flex items-center justify-center relative"
      style={{ width: `${bear}%` }}
    >
      {bear > 15 && (
        <span className="text-white text-xs z-10 drop-shadow-lg">{bear}%</span>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
    </div>
    <div
      className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] flex items-center justify-center relative"
      style={{ width: `${bull}%` }}
    >
      {bull > 15 && (
        <span className="text-white text-xs z-10 drop-shadow-lg">{bull}%</span>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
    </div>
  </div>
);

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
        <td className="py-4 px-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </td>
        <td className="py-4 px-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </td>
        <td className="py-4 px-4">
          <Skeleton className="h-9 w-full rounded-md" />
        </td>
        <td className="py-4 px-4">
          <Skeleton className="h-8 w-24 rounded" />
        </td>
        <td className="py-4 px-4">
          <Skeleton className="h-6 w-full rounded" />
        </td>
      </tr>
    ))}
  </>
);

// ── Map symbol → TradingView format ───────────────────────────────────────────
const getTVSymbol = (symbol: string): string => {
  if (symbol === "XAUUSD") return "TVC:GOLD";
  if (symbol === "XAGUSD") return "TVC:SILVER";
  if (symbol === "WTI")    return "TVC:USOIL";
  if (symbol === "US500")  return "FOREXCOM:SPXUSD";
  if (symbol === "US100")  return "FOREXCOM:NASUSD";
  if (symbol === "US30")   return "FOREXCOM:DJUSD";
  if (symbol.includes("/")) {
    const base = symbol.split("/")[0];
    return `CRYPTO:${base}USD`;
  }
  if (/^[A-Z]{6}$/.test(symbol)) return `FX:${symbol}`;
  return symbol;
};

// ═════════════════════════════════════════════════════════════════════════════
export default function PremiumScreenerSection() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [assetClassFilter, setAssetClassFilter] = useState("All");
  const [trendFilter, setTrendFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
    if (!filteredAssets.length) return;
    const headers = [
      "Symbol","Name","Asset Class","Intraday Bull%","Daily Bull%",
      "Long-Term Bull%","ADX","EMA Status","Orca Status","Orca Score",
    ];
    const rows = filteredAssets.map((a) => [
      a.symbol, a.name, a.assetClass,
      a.intraday.bull, a.daily.bull, a.longterm.bull,
      a.advanced.adx, a.advanced.emaStatus,
      a.signals.status, a.signals.orca_score,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `screener-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [filteredAssets]);

  const openModal = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailModal(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Premium Screener</h1>
        <p className="text-[#94A3B8]">Real-time multi-timeframe trend analysis</p>
      </div>

      {/* Best Market Today Banner */}
      {bestAsset && (
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
            <span
              className={`text-sm font-semibold ${
                DIRECTION_STYLES[bestAsset.signals.direction]
              }`}
            >
              {bestAsset.signals.direction}
            </span>
            <ScoreRing score={bestAsset.signals.orca_score} />
            <Badge className={`${PHASE_STYLES[bestAsset.signals.market_phase]} border-0 text-xs`}>
              {bestAsset.signals.market_phase}
            </Badge>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Select value={assetClassFilter} onValueChange={setAssetClassFilter}>
            <SelectTrigger className="w-[180px] bg-[#14181F] border-[#1E293B] text-white">
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
            <SelectTrigger className="w-[200px] bg-[#14181F] border-[#1E293B] text-white">
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
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input
              type="text"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[240px] bg-[#14181F] border-[#1E293B] text-white placeholder:text-[#64748B] focus:border-[#00D4FF]"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="bg-[#14181F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1A1F2E]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            <span className="text-sm">{lastUpdatedLabel}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filteredAssets.length === 0}
            className="bg-[#14181F] border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0A1628]">
                <th className="py-4 px-4 text-left text-white w-[220px]">SYMBOL</th>
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
                  <div className="mb-1">LONG-TERM</div>
                  <div className="text-xs text-[#94A3B8]">
                    {["1D", ...longtermTFs].join(" | ")}
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[150px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#00D4FF]" />
                    <span>ORCA STATUS</span>
                  </div>
                  <div className="text-xs text-[#94A3B8]">Signal | Score</div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[260px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span>ADVANCED</span>
                    <Badge className="bg-[#FFD700] text-black text-xs px-2 py-0">PRO</Badge>
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
                  <td colSpan={6} className="py-12 text-center text-red-400">
                    Failed to load market data. Please check your connection.
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                    {assets.length === 0
                      ? "No data available. Data may be warming up..."
                      : "No assets found. Try adjusting your filters."}
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.symbol}
                    className={`border-b border-[#1E293B] hover:bg-[#1A1F2E] transition-all duration-200 cursor-pointer ${
                      asset.signals.is_best ? "ring-1 ring-inset ring-[#FFD700]/20" : ""
                    }`}
                    onClick={() => openModal(asset)}
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

                    {/* INTRADAY */}
                    <td className="py-3 px-4">
                      <StackedBar bear={asset.intraday.bear} bull={asset.intraday.bull} />
                    </td>

                    {/* DAILY */}
                    <td className="py-3 px-4">
                      <StackedBar bear={asset.daily.bear} bull={asset.daily.bull} />
                    </td>

                    {/* LONG-TERM */}
                    <td className="py-3 px-4">
                      <StackedBar bear={asset.longterm.bear} bull={asset.longterm.bull} />
                    </td>

                    {/* ORCA STATUS */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <Badge className={`${STATUS_STYLES[asset.signals.status]} text-xs font-bold border-0 px-3`}>
                          {asset.signals.status}
                        </Badge>
                        <span className={`text-xs font-medium ${DIRECTION_STYLES[asset.signals.direction]}`}>
                          {asset.signals.direction}
                        </span>
                        <span className="text-[#94A3B8] text-xs">
                          Score: <span className="text-white font-semibold">{asset.signals.orca_score}</span>
                        </span>
                      </div>
                    </td>

                    {/* ADVANCED */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 text-sm">
                        {/* ADX */}
                        <div className="flex items-center gap-1">
                          <span className={asset.advanced.adx >= 25 ? "text-[#10B981]" : "text-[#94A3B8]"}>
                            {asset.advanced.adx}
                          </span>
                          {asset.advanced.adxTrend === "up" && (
                            <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                          )}
                          {asset.advanced.adxTrend === "down" && (
                            <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                          )}
                          {asset.advanced.adxTrend === "neutral" && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />
                          )}
                        </div>

                        {/* EMA */}
                        <Badge
                          className={`${
                            asset.advanced.emaStatus === "aligned"
                              ? "bg-[#10B981]/20 text-[#10B981]"
                              : "bg-[#EF4444]/20 text-[#EF4444]"
                          } border-0 text-xs`}
                        >
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlert(asset.symbol);
                          }}
                        >
                          <Bell
                            className={`w-4 h-4 ${
                              asset.advanced.hasAlert ? "text-[#FFD700]" : "text-[#64748B]"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

      {/* Detail Modal — single column, pinned header, scrollable body */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#14181F] border-[#1E293B] text-white max-w-2xl w-[95vw] max-h-[88vh] flex flex-col overflow-hidden p-0 gap-0">

          {/* Pinned header — X button always visible here */}
          <div className="px-6 pt-5 pb-4 border-b border-[#1E293B] shrink-0 pr-14">
            <DialogTitle className="text-xl font-semibold">
              {selectedAsset?.symbol} – {selectedAsset?.name}
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8] text-sm mt-0.5">
              Full multi-timeframe breakdown &amp; OrcaBot signals
            </DialogDescription>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">

            {detailLoading || !detail ? (
              <div className="space-y-3 pt-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded" />
                ))}
              </div>
            ) : (
              <>
                {/* OrcaBot Status banner */}
                <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                  detail.signals.status === "ON"
                    ? "bg-[#10B981]/10 border border-[#10B981]/30"
                    : detail.signals.status === "WATCH"
                    ? "bg-[#F59E0B]/10 border border-[#F59E0B]/30"
                    : "bg-[#64748B]/10 border border-[#64748B]/30"
                }`}>
                  <div>
                    <div className="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">OrcaBot Status</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${
                        detail.signals.status === "ON" ? "text-[#10B981]"
                        : detail.signals.status === "WATCH" ? "text-[#F59E0B]"
                        : "text-[#64748B]"
                      }`}>{detail.signals.status}</span>
                      <span className={`text-sm font-semibold ${DIRECTION_STYLES[detail.signals.direction]}`}>
                        {detail.signals.direction}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-[#94A3B8] mb-1">Orca Score</div>
                      <ScoreRing score={detail.signals.orca_score} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#94A3B8] mb-1">Market Phase</div>
                      <Badge className={`${PHASE_STYLES[detail.signals.market_phase]} border-0 text-xs`}>
                        {detail.signals.market_phase}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* TradingView chart */}
                <div className="rounded-lg overflow-hidden border border-[#1E293B]" style={{ height: 220 }}>
                  <iframe
                    key={detail.symbol}
                    src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(getTVSymbol(detail.symbol))}&interval=D&theme=dark&style=1&locale=en&hide_side_toolbar=1&allow_symbol_change=0&save_image=0&details=0&hotlist=0&calendar=0`}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    allowFullScreen
                    title={`${detail.symbol} chart`}
                  />
                </div>

                {/* MTF Breakdown */}
                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm font-medium mb-3">Multi-Timeframe Breakdown</div>
                  <div className="space-y-2">
                    {detail.timeframes.map((tf) => (
                      <div key={tf.timeframe} className="flex items-center gap-3">
                        <span className="text-[#64748B] text-xs w-8 shrink-0 text-right">{tf.label}</span>
                        <div className="flex-1">
                          <StackedBar bear={tf.bear} bull={tf.bull} compact />
                        </div>
                        <span className={`text-xs w-9 text-right shrink-0 font-medium ${
                          tf.bull > tf.bear ? "text-[#10B981]" : tf.bear > tf.bull ? "text-[#EF4444]" : "text-[#94A3B8]"
                        }`}>
                          {tf.bull > tf.bear ? `+${tf.bull}` : `-${tf.bear}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced metrics 2×2 grid */}
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
              </>
            )}

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
