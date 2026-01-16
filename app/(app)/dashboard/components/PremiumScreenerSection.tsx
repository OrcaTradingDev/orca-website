import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Download,
  Star,
  Bell,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

interface Asset {
  symbol: string;
  name: string;
  assetClass: string;
  inWatchlist: boolean;
  intraday: {
    bearish: number;
    bullish: number;
  };
  daily: {
    bearish: number;
    bullish: number;
  };
  advanced: {
    adx: number;
    adxTrend: "up" | "down" | "neutral";
    emaStatus: "aligned" | "crossed";
    volume: number; // 0-100 for bar height
    hasAlert: boolean;
  };
}

// Mock data
const mockAssets: Asset[] = [
  {
    symbol: "EUR/USD",
    name: "Euro/Dollar",
    assetClass: "Forex",
    inWatchlist: false,
    intraday: { bearish: 42, bullish: 58 },
    daily: { bearish: 48, bullish: 52 },
    advanced: { adx: 18, adxTrend: "neutral", emaStatus: "aligned", volume: 45, hasAlert: false },
  },
  {
    symbol: "GBP/USD",
    name: "Pound/Dollar",
    assetClass: "Forex",
    inWatchlist: false,
    intraday: { bearish: 51, bullish: 49 },
    daily: { bearish: 46, bullish: 54 },
    advanced: { adx: 22, adxTrend: "neutral", emaStatus: "aligned", volume: 52, hasAlert: false },
  },
  {
    symbol: "USD/JPY",
    name: "Dollar/Yen",
    assetClass: "Forex",
    inWatchlist: false,
    intraday: { bearish: 38, bullish: 62 },
    daily: { bearish: 41, bullish: 59 },
    advanced: { adx: 25, adxTrend: "up", emaStatus: "aligned", volume: 48, hasAlert: false },
  },
  {
    symbol: "AUD/USD",
    name: "Australian Dollar/Dollar",
    assetClass: "Forex",
    inWatchlist: false,
    intraday: { bearish: 45, bullish: 55 },
    daily: { bearish: 43, bullish: 57 },
    advanced: { adx: 20, adxTrend: "neutral", emaStatus: "aligned", volume: 50, hasAlert: false },
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetClass: "Stocks",
    inWatchlist: true,
    intraday: { bearish: 31, bullish: 69 },
    daily: { bearish: 22, bullish: 78 },
    advanced: { adx: 45, adxTrend: "up", emaStatus: "aligned", volume: 65, hasAlert: true },
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "Stocks",
    inWatchlist: false,
    intraday: { bearish: 35, bullish: 65 },
    daily: { bearish: 28, bullish: 72 },
    advanced: { adx: 42, adxTrend: "up", emaStatus: "aligned", volume: 70, hasAlert: false },
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    assetClass: "Stocks",
    inWatchlist: true,
    intraday: { bearish: 24, bullish: 76 },
    daily: { bearish: 19, bullish: 81 },
    advanced: { adx: 52, adxTrend: "up", emaStatus: "aligned", volume: 88, hasAlert: true },
  },
  {
    symbol: "US500",
    name: "S&P 500",
    assetClass: "Stocks",
    inWatchlist: false,
    intraday: { bearish: 39, bullish: 61 },
    daily: { bearish: 33, bullish: 67 },
    advanced: { adx: 29, adxTrend: "up", emaStatus: "aligned", volume: 58, hasAlert: false },
  },
  {
    symbol: "US100",
    name: "Nasdaq 100",
    assetClass: "Stocks",
    inWatchlist: false,
    intraday: { bearish: 36, bullish: 64 },
    daily: { bearish: 30, bullish: 70 },
    advanced: { adx: 31, adxTrend: "up", emaStatus: "aligned", volume: 62, hasAlert: false },
  },
  {
    symbol: "XAU/USD",
    name: "Gold",
    assetClass: "Commodities",
    inWatchlist: false,
    intraday: { bearish: 44, bullish: 56 },
    daily: { bearish: 40, bullish: 60 },
    advanced: { adx: 26, adxTrend: "up", emaStatus: "aligned", volume: 55, hasAlert: false },
  },
];

export default function PremiumScreenerSection() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetClassFilter, setAssetClassFilter] = useState("All");
  const [trendFilter, setTrendFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // --- Live backend integration ---
  type ApiTrendDir = "up" | "down" | "flat";

  type ApiScreenerRow = {
    symbol: string;
    name: string;
    intraday: { bear: number; bull: number };
    daily: { bear: number; bull: number };
    advanced: { adx: number; adx_dir: ApiTrendDir; ema: string; vol: number; alert: boolean };
  };

  type ApiScreenerPage = {
    rows: ApiScreenerRow[];
    page: number;
    pageSize: number;
    total: number;
    lastUpdated: string;
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const inferAssetClass = (symbol: string): Asset["assetClass"] => {
    const s = symbol.toUpperCase();
    if (s.includes("XAU")) return "Commodities";
    if (s.includes("/")) return "Forex";
    if (s === "US500" || s === "US100") return "Indices";
    return "Stocks";
  };

  const mapApiRowToAsset = (row: ApiScreenerRow): Asset => {
    const adxTrend: Asset["advanced"]["adxTrend"] =
      row.advanced.adx_dir === "up" ? "up" : row.advanced.adx_dir === "down" ? "down" : "neutral";

    const emaStatus: Asset["advanced"]["emaStatus"] = row.advanced.ema === "aligned" ? "aligned" : "crossed";

    return {
      symbol: row.symbol,
      name: row.name,
      assetClass: inferAssetClass(row.symbol),
      inWatchlist: false,
      intraday: { bearish: row.intraday.bear, bullish: row.intraday.bull },
      daily: { bearish: row.daily.bear, bullish: row.daily.bull },
      advanced: {
        adx: row.advanced.adx,
        adxTrend,
        emaStatus,
        volume: row.advanced.vol,
        hasAlert: row.advanced.alert,
      },
    };
  };

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/screener/rows", API_BASE);
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", "250");

      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ApiScreenerPage;
      setAssets(data.rows.map(mapApiRowToAsset));
      setLastUpdated(new Date(data.lastUpdated).toLocaleString());
    } catch (e) {
      console.error("Failed to load screener rows; falling back to mock assets", e);
      setAssets(mockAssets);
      setLastUpdated("Mock data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    void loadAssets();
  };

  const toggleWatchlist = (symbol: string) => {
    setAssets(
      assets.map((asset) => (asset.symbol === symbol ? { ...asset, inWatchlist: !asset.inWatchlist } : asset)),
    );
  };

  const toggleAlert = (symbol: string) => {
    setAssets(
      assets.map((asset) =>
        asset.symbol === symbol
          ? { ...asset, advanced: { ...asset.advanced, hasAlert: !asset.advanced.hasAlert } }
          : asset,
      ),
    );
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAssetClass = assetClassFilter === "All" || asset.assetClass === assetClassFilter;

    let matchesTrend = true;
    if (trendFilter !== "All") {
      const bullishPercent = asset.daily.bullish;
      switch (trendFilter) {
        case "Strong Bullish":
          matchesTrend = bullishPercent >= 70;
          break;
        case "Bullish":
          matchesTrend = bullishPercent >= 55 && bullishPercent < 70;
          break;
        case "Neutral":
          matchesTrend = bullishPercent >= 45 && bullishPercent < 55;
          break;
        case "Bearish":
          matchesTrend = bullishPercent >= 30 && bullishPercent < 45;
          break;
        case "Strong Bearish":
          matchesTrend = bullishPercent < 30;
          break;
      }
    }

    return matchesSearch && matchesAssetClass && matchesTrend;
  });

  const StackedBar = ({ bearish, bullish }: { bearish: number; bullish: number }) => (
    <div className="relative w-full h-9 bg-[#1A1F2E] rounded-md overflow-hidden flex">
      {/* Bearish section */}
      <div
        className="h-full bg-gradient-to-r from-[#DC2626] via-[#EF4444] to-[#DC2626] flex items-center justify-center relative"
        style={{ width: `${bearish}%` }}
      >
        {bearish > 15 && <span className="text-white text-sm z-10 drop-shadow-lg">{bearish}%</span>}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
      </div>

      {/* Bullish section */}
      <div
        className="h-full bg-gradient-to-r from-[#059669] via-[#10B981] to-[#059669] flex items-center justify-center relative"
        style={{ width: `${bullish}%` }}
      >
        {bullish > 15 && <span className="text-white text-sm z-10 drop-shadow-lg">{bullish}%</span>}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50"></div>
      </div>
    </div>
  );

  const AssetRow = ({ asset }: { asset: Asset }) => (
    <tr
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
            <Star className={`w-5 h-5 ${asset.inWatchlist ? "fill-[#00D4FF] text-[#00D4FF]" : "text-[#64748B]"}`} />
          </button>
          <div>
            <div className="text-white">{asset.symbol}</div>
            <div className="text-[#94A3B8] text-sm">{asset.name}</div>
          </div>
        </div>
      </td>

      {/* INTRADAY */}
      <td className="py-4 px-4">
        <StackedBar bearish={asset.intraday.bearish} bullish={asset.intraday.bullish} />
      </td>

      {/* DAILY */}
      <td className="py-4 px-4">
        <StackedBar bearish={asset.daily.bearish} bullish={asset.daily.bullish} />
      </td>

      {/* ADVANCED */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-4 text-sm">
          {/* ADX */}
          <div className="flex items-center gap-1">
            <span className={asset.advanced.adx >= 25 ? "text-[#10B981]" : "text-[#94A3B8]"}>{asset.advanced.adx}</span>
            {asset.advanced.adxTrend === "up" && <TrendingUp className="w-4 h-4 text-[#10B981]" />}
            {asset.advanced.adxTrend === "down" && <TrendingDown className="w-4 h-4 text-[#EF4444]" />}
            {asset.advanced.adxTrend === "neutral" && <ArrowRight className="w-4 h-4 text-[#94A3B8]" />}
          </div>

          {/* EMA */}
          <Badge
            className={`${
              asset.advanced.emaStatus === "aligned" ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#EF4444]/20 text-[#EF4444]"
            } border-0`}
          >
            EMA {asset.advanced.emaStatus === "aligned" ? "✓" : "✗"}
          </Badge>

          {/* VOLUME */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-2 bg-[#1E293B] rounded-full overflow-hidden">
              <div className="h-full bg-[#00D4FF]" style={{ width: `${asset.advanced.volume}%` }} />
            </div>
            <span className="text-[#94A3B8] text-xs">{asset.advanced.volume}</span>
          </div>

          {/* ALERT */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAlert(asset.symbol);
            }}
            className="transition-colors duration-200"
          >
            <Bell className={`w-4 h-4 ${asset.advanced.hasAlert ? "text-[#FFD700]" : "text-[#64748B]"}`} />
          </button>
        </div>
      </td>
    </tr>
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
        <p className="text-[#94A3B8]">Real-time multi-timeframe trend analysis</p>
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
            className="bg-[#14181F] border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1A1F2E]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </Button>

          <Button
            variant="outline"
            className="bg-[#14181F] border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white"
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
                  <div className="text-xs text-[#94A3B8]">1M | 5M | 15M | 1H</div>
                </th>
                <th className="py-4 px-4 text-center text-white">
                  <div className="mb-1">DAILY</div>
                  <div className="text-xs text-[#94A3B8]">4H | 1D | 1W</div>
                </th>
                <th className="py-4 px-4 text-center text-white w-[280px]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span>ADVANCED</span>
                    <Badge className="bg-[#FFD700] text-black text-xs px-2 py-0">PRO</Badge>
                  </div>
                  <div className="text-xs text-[#94A3B8]">ADX | EMA | VOL | ALERTS</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => <AssetRow key={asset.symbol} asset={asset} />)
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="text-[#94A3B8]">No assets found. Try adjusting your filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredAssets.length > 0 && (
          <div className="border-t border-[#1E293B] py-4 px-6 flex items-center justify-between">
            <div className="text-[#94A3B8] text-sm">
              Showing 1-{filteredAssets.length} of {filteredAssets.length} assets
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white"
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="bg-[#14181F] border-[#1E293B] text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedAsset?.symbol} - {selectedAsset?.name}
            </DialogTitle>
            <DialogDescription className="text-[#94A3B8]">Detailed multi-timeframe analysis</DialogDescription>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-6 py-4">
              {/* Chart Placeholder */}
              <div className="bg-[#0A1628] rounded-lg p-6 h-64 flex items-center justify-center border border-[#1E293B]">
                <div className="text-center text-[#94A3B8]">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 text-[#00D4FF]" />
                  <p>Interactive chart would appear here</p>
                  <p className="text-sm mt-1">Showing price action and indicators</p>
                </div>
              </div>

              {/* Analysis Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">Intraday Trend</div>
                  <StackedBar bearish={selectedAsset.intraday.bearish} bullish={selectedAsset.intraday.bullish} />
                  <div className="text-xs text-[#64748B] mt-2">1M: Bullish | 5M: Bullish | 15M: Bullish | 1H: Bearish</div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">Daily Trend</div>
                  <StackedBar bearish={selectedAsset.daily.bearish} bullish={selectedAsset.daily.bullish} />
                  <div className="text-xs text-[#64748B] mt-2">4H: Bullish | 1D: Bullish | 1W: Bullish</div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">ADX Trend Strength</div>
                  <div className="text-2xl text-white">{selectedAsset.advanced.adx}</div>
                  <div className="text-sm text-[#10B981] mt-1">{selectedAsset.advanced.adx >= 25 ? "Strong Trend" : "Weak Trend"}</div>
                </div>

                <div className="bg-[#0A1628] rounded-lg p-4 border border-[#1E293B]">
                  <div className="text-[#94A3B8] text-sm mb-2">EMA Alignment</div>
                  <div className={`text-2xl ${selectedAsset.advanced.emaStatus === "aligned" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {selectedAsset.advanced.emaStatus === "aligned" ? "✓ Aligned" : "✗ Crossed"}
                  </div>
                  <div className="text-sm text-[#64748B] mt-1">All EMAs in correct order</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] text-black">
                  <Bell className="w-4 h-4 mr-2" />
                  Add Alert
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
                  {selectedAsset.inWatchlist ? "Remove from" : "Add to"} Watchlist
              </Button>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

