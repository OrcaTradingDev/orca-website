"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useScreener } from "@/features/dashboard/hooks/useScreener";
import { ScreenerRow } from "@/features/dashboard/types/screener";
import { queryKeys } from "@/lib/query/keys";
import {
  Search,
  RefreshCw,
  Download,
  Star,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
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

// UI Types - extends API types with UI-only fields
interface Asset extends Omit<ScreenerRow, "advanced"> {
  assetClass: string;
  inWatchlist: boolean;
  advanced: ScreenerRow["advanced"] & {
    adxTrend: "up" | "down" | "neutral";
    emaStatus: "aligned" | "crossed";
    hasAlert: boolean;
  };
}

export default function PremiumScreenerSection() {
  const queryClient = useQueryClient();

  // UI State
  const [page, setPage] = useState(1);
  const [assetClassFilter, setAssetClassFilter] = useState("All");
  const [trendFilter, setTrendFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Local state for watchlist and alerts
  const [watchedSymbols, setWatchedSymbols] = useState<string[]>([]);
  const [alertSymbols, setAlertSymbols] = useState<string[]>([]);

  // Data fetching hook
  const { data, isLoading, isFetching, isError, refetch } = useScreener(page, 50);

  // Debug logging (uncomment to debug refresh issues)
  // useEffect(() => {
  //   console.log('🔄 Data updated:', data?.lastUpdated);
  //   console.log('📊 Row count:', data?.rows.length);
  // }, [data]);

  // Memoized asset transformation
  const assets: Asset[] = useMemo(() => {
    const inferAssetClass = (s: string) => {
      if (s.includes("XAU") || s.includes("XAG") || s.includes("OIL"))
        return "Commodities";
      if (s.includes("/")) return "Forex";
      if (s === "US500" || s === "US100" || s === "US30") return "Indices";
      if (s.includes("BTC") || s.includes("ETH") || s.includes("USDT"))
        return "Crypto";
      // 6-char all-alpha symbols are FX pairs (e.g. EURUSD, EURJPY, GBPJPY)
      if (/^[A-Z]{6}$/.test(s)) return "Forex";
      return "Stocks";
    };

    return (data?.rows || []).map((row) => ({
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
    }));
  }, [data?.rows, watchedSymbols, alertSymbols]);

  // Memoized timestamp formatting
  const lastUpdatedLabel = useMemo(() => {
    if (!data?.lastUpdated) return "Loading...";

    const date = new Date(data.lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }, [data?.lastUpdated]);

  // Memoized filtering
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssetClass =
        assetClassFilter === "All" || asset.assetClass === assetClassFilter;

      let matchesTrend = true;
      if (trendFilter !== "All") {
        const bull = asset.daily.bull;
        if (trendFilter === "Strong Bullish") matchesTrend = bull >= 70;
        else if (trendFilter === "Bullish")
          matchesTrend = bull >= 55 && bull < 70;
        else if (trendFilter === "Neutral")
          matchesTrend = bull >= 45 && bull < 55;
        else if (trendFilter === "Bearish")
          matchesTrend = bull >= 30 && bull < 45;
        else if (trendFilter === "Strong Bearish") matchesTrend = bull < 30;
      }
      return matchesSearch && matchesAssetClass && matchesTrend;
    });
  }, [assets, searchQuery, assetClassFilter, trendFilter]);

  // Handlers with useCallback
  const toggleWatchlist = useCallback(
    (symbol: string) => {
      setWatchedSymbols((prev) =>
        prev.includes(symbol)
          ? prev.filter((s) => s !== symbol)
          : [...prev, symbol]
      );
      if (selectedAsset && selectedAsset.symbol === symbol) {
        setSelectedAsset({
          ...selectedAsset,
          inWatchlist: !selectedAsset.inWatchlist,
        });
      }
    },
    [selectedAsset]
  );

  const toggleAlert = useCallback(
    (symbol: string) => {
      setAlertSymbols((prev) =>
        prev.includes(symbol)
          ? prev.filter((s) => s !== symbol)
          : [...prev, symbol]
      );
      if (selectedAsset && selectedAsset.symbol === symbol) {
        setSelectedAsset({
          ...selectedAsset,
          advanced: {
            ...selectedAsset.advanced,
            hasAlert: !selectedAsset.advanced.hasAlert,
          },
        });
      }
    },
    [selectedAsset]
  );

  const handleRefresh = useCallback(() => {
    // Invalidate the entire screener cache to force a fresh fetch
    queryClient.invalidateQueries({
      queryKey: queryKeys.screener.all,
    });
  }, [queryClient]);

  const handleExport = useCallback(() => {
    if (!filteredAssets.length) return;
    const headers = [
      "Symbol",
      "Name",
      "Asset Class",
      "Intraday Bullish %",
      "Daily Bullish %",
      "ADX",
      "EMA Status",
      "Volume",
    ];
    const rows = filteredAssets.map((asset) => [
      asset.symbol,
      asset.name,
      asset.assetClass,
      asset.intraday.bull,
      asset.daily.bull,
      asset.advanced.adx,
      asset.advanced.emaStatus,
      asset.advanced.vol,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `screener-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [filteredAssets]);

  // Map internal symbol → TradingView symbol format
  const getTVSymbol = (symbol: string): string => {
    if (symbol === "XAUUSD") return "TVC:GOLD";
    if (symbol === "XAGUSD") return "TVC:SILVER";
    if (symbol === "WTI")    return "TVC:USOIL";
    if (symbol === "US500")  return "SP:SPX";
    if (symbol === "US100")  return "NASDAQ:NDX";
    if (symbol === "US30")   return "DJ:DJI";
    // Crypto like BTC/USD, ETH/USD, SOL/USD
    if (symbol.includes("/")) {
      const base = symbol.split("/")[0];
      return `CRYPTO:${base}USD`;
    }
    // 6-char FX pairs like EURUSD
    if (/^[A-Z]{6}$/.test(symbol)) return `FX:${symbol}`;
    // Stocks — default (exchange prefix not needed for major US stocks)
    return symbol;
  };

  // Stacked Bar Component with Original Gradients
  const StackedBar = ({ bear, bull }: { bear: number; bull: number }) => (
    <div className="relative w-full h-9 bg-[#1A1F2E] rounded-md overflow-hidden flex">
      {/* Bearish section */}
      <div
        className="h-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#DC2626] flex items-center justify-center relative"
        style={{ width: `${bear}%` }}
      >
        {bear > 15 && (
          <span className="text-white text-sm z-10 drop-shadow-lg">
            {bear}%
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
      </div>

      {/* Bullish section */}
      <div
        className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] flex items-center justify-center relative"
        style={{ width: `${bull}%` }}
      >
        {bull > 15 && (
          <span className="text-white text-sm z-10 drop-shadow-lg">
            {bull}%
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
      </div>
    </div>
  );

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
            <Skeleton className="h-6 w-full rounded" />
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-white text-[32px]">Premium Screener</h1>
        <p className="text-[#94A3B8]">
          Real-time multi-timeframe trend analysis
        </p>
      </div>

      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left side - Filters */}
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

        {/* Right side - Search, Refresh, Export */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
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
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="text-sm">{lastUpdatedLabel}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={filteredAssets.length === 0}
            className="bg-[#14181F] border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                <th className="py-4 px-4 text-left text-white w-[200px]">
                  <div>SYMBOL</div>
                </th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1">INTRADAY</div>
                  <div className="text-xs text-[#94A3B8]">
                    1M | 5M | 15M | 1H
                  </div>
                </th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1">DAILY</div>
                  <div className="text-xs text-[#94A3B8]">4H | 1D | 1W</div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[280px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span>ADVANCED</span>
                    <Badge className="bg-[#FFD700] text-black text-xs px-2 py-0">
                      PRO
                    </Badge>
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    ADX | EMA | VOL | ALERTS
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="text-red-400">
                      Failed to load market data. Please check your connection.
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="text-[#94A3B8]">
                      {assets.length === 0
                        ? "No data available. Data may be warming up..."
                        : "No assets found. Try adjusting your filters."}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr
                    key={asset.symbol}
                    className="border-b border-[#1E293B] hover:bg-[#14181F] transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowDetailModal(true);
                    }}
                  >
                    {/* SYMBOL */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(asset.symbol);
                          }}
                          className="transition-colors duration-200"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              asset.inWatchlist
                                ? "fill-[#00D4FF] text-[#00D4FF]"
                                : "text-[#64748B]"
                            }`}
                          />
                        </button>
                        <div>
                          <div className="text-white">{asset.symbol}</div>
                          <div className="text-[#94A3B8] text-sm">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* INTRADAY */}
                    <td className="py-4 px-4">
                      <StackedBar
                        bear={asset.intraday.bear}
                        bull={asset.intraday.bull}
                      />
                    </td>

                    {/* DAILY */}
                    <td className="py-4 px-4">
                      <StackedBar
                        bear={asset.daily.bear}
                        bull={asset.daily.bull}
                      />
                    </td>

                    {/* ADVANCED */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4 text-sm">
                        {/* ADX */}
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              asset.advanced.adx >= 25
                                ? "text-[#10B981]"
                                : "text-[#94A3B8]"
                            }
                          >
                            {asset.advanced.adx}
                          </span>
                          {asset.advanced.adxTrend === "up" && (
                            <TrendingUp className="w-4 h-4 text-[#10B981]" />
                          )}
                          {asset.advanced.adxTrend === "down" && (
                            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                          )}
                          {asset.advanced.adxTrend === "neutral" && (
                            <ArrowRight className="w-4 h-4 text-[#94A3B8]" />
                          )}
                        </div>

                        {/* EMA */}
                        <Badge
                          className={`${
                            asset.advanced.emaStatus === "aligned"
                              ? "bg-[#10B981]/20 text-[#10B981]"
                              : "bg-[#EF4444]/20 text-[#EF4444]"
                          } border-0`}
                        >
                          EMA{" "}
                          {asset.advanced.emaStatus === "aligned" ? "✓" : "✗"}
                        </Badge>

                        {/* VOLUME */}
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#00D4FF]"
                              style={{ width: `${asset.advanced.vol}%` }}
                            />
                          </div>
                          <span className="text-[#94A3B8] text-xs">
                            {asset.advanced.vol}
                          </span>
                        </div>

                        {/* ALERT */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlert(asset.symbol);
                          }}
                          className="transition-colors duration-200"
                        >
                          <Bell
                            className={`w-4 h-4 ${
                              asset.advanced.hasAlert
                                ? "text-[#FFD700]"
                                : "text-[#64748B]"
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
              Showing {(page - 1) * 50 + 1}-
              {Math.min(page * 50, data?.total || 0)} of {data?.total || 0}{" "}
              assets
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

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#14181F] border-[#1E293B] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedAsset?.symbol} - {selectedAsset?.name}
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Detailed multi-timeframe analysis
            </DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4 py-2">
              {/* TradingView Chart */}
              <div className="rounded-lg overflow-hidden border border-[#1E293B]" style={{ height: 220 }}>
                <iframe
                  key={selectedAsset.symbol}
                  src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(getTVSymbol(selectedAsset.symbol))}&interval=D&theme=dark&style=1&locale=en&hide_side_toolbar=1&allow_symbol_change=0&save_image=0&details=0&hotlist=0&calendar=0`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                  allowFullScreen
                  title={`${selectedAsset.symbol} chart`}
                />
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">
                    Intraday Trend
                  </div>
                  <StackedBar
                    bear={selectedAsset.intraday.bear}
                    bull={selectedAsset.intraday.bull}
                  />
                  <div className="text-xs text-[#64748B] mt-2">
                    Based on 1M, 5M, 15M, 1H timeframes
                  </div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">Daily Trend</div>
                  <StackedBar
                    bear={selectedAsset.daily.bear}
                    bull={selectedAsset.daily.bull}
                  />
                  <div className="text-xs text-[#64748B] mt-2">
                    Based on 4H, 1D, 1W timeframes
                  </div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">
                    ADX Trend Strength
                  </div>
                  <div className="text-2xl text-white">
                    {selectedAsset.advanced.adx}
                  </div>
                  <div className="text-sm text-[#10B981] mt-1">
                    {selectedAsset.advanced.adx >= 25
                      ? "Strong Trend"
                      : "Weak Trend"}
                  </div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">
                    EMA Alignment
                  </div>
                  <div
                    className={`text-2xl ${
                      selectedAsset.advanced.emaStatus === "aligned"
                        ? "text-[#10B981]"
                        : "text-[#EF4444]"
                    }`}
                  >
                    {selectedAsset.advanced.emaStatus === "aligned"
                      ? "✓ Aligned"
                      : "✗ Crossed"}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">
                    EMA 9, 21, 50, 200 alignment
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] text-black"
                  onClick={() => toggleAlert(selectedAsset.symbol)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {selectedAsset.advanced.hasAlert
                    ? "Remove Alert"
                    : "Add Alert"}
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 border-[#1E293B] bg-[#1A1F2E] text-white hover:bg-[#16202B]"
                  onClick={() => toggleWatchlist(selectedAsset.symbol)}
                >
                  <Star
                    className="w-4 h-4 mr-2"
                    stroke={selectedAsset.inWatchlist ? "#00D4FF" : "#FFFFFF"}
                    fill={selectedAsset.inWatchlist ? "#00D4FF" : "none"}
                  />
                  {selectedAsset.inWatchlist ? "Remove from" : "Add to"}{" "}
                  Watchlist
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
