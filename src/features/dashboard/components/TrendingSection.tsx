import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const trendingAssets = [
  {
    ticker: "SOL/USD",
    name: "Solana",
    price: "$142.67",
    change: 12.45,
    direction: "up",
    sparkline: [{ v: 126 }, { v: 128 }, { v: 130 }, { v: 127 }, { v: 133 }, { v: 138 }, { v: 143 }],
  },
  {
    ticker: "ETH/USD",
    name: "Ethereum",
    price: "$3,456.89",
    change: -2.34,
    direction: "down",
    sparkline: [{ v: 3540 }, { v: 3520 }, { v: 3510 }, { v: 3530 }, { v: 3490 }, { v: 3470 }, { v: 3457 }],
  },
  {
    ticker: "EUR/USD",
    name: "Euro / US Dollar",
    price: "1.0842",
    change: 0.18,
    direction: "up",
    sparkline: [{ v: 1.0820 }, { v: 1.0825 }, { v: 1.0818 }, { v: 1.0830 }, { v: 1.0835 }, { v: 1.0838 }, { v: 1.0842 }],
  },
  {
    ticker: "GBP/USD",
    name: "British Pound",
    price: "1.2735",
    change: 0.31,
    direction: "up",
    sparkline: [{ v: 1.2695 }, { v: 1.2700 }, { v: 1.2710 }, { v: 1.2705 }, { v: 1.2718 }, { v: 1.2726 }, { v: 1.2735 }],
  },
  {
    ticker: "USD/JPY",
    name: "US Dollar / Japanese Yen",
    price: "154.82",
    change: -0.42,
    direction: "down",
    sparkline: [{ v: 155.47 }, { v: 155.30 }, { v: 155.18 }, { v: 155.10 }, { v: 155.02 }, { v: 154.95 }, { v: 154.82 }],
  },
  {
    ticker: "USD/CHF",
    name: "US Dollar / Swiss Franc",
    price: "0.9023",
    change: -0.15,
    direction: "down",
    sparkline: [{ v: 0.9040 }, { v: 0.9038 }, { v: 0.9035 }, { v: 0.9033 }, { v: 0.9030 }, { v: 0.9026 }, { v: 0.9023 }],
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    price: "$142.78",
    change: 3.45,
    direction: "up",
    sparkline: [{ v: 138 }, { v: 139 }, { v: 138 }, { v: 140 }, { v: 141 }, { v: 142 }, { v: 143 }],
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    price: "$498.23",
    change: -0.89,
    direction: "down",
    sparkline: [{ v: 503 }, { v: 502 }, { v: 501 }, { v: 500 }, { v: 499 }, { v: 499 }, { v: 498 }],
  },
];

export default function TrendingSection() {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white mb-2">Trending Assets</h1>
          <p className="text-[#94A3B8]">Most active markets right now</p>
        </div>
        <Select defaultValue="24h">
          <SelectTrigger className="w-[140px] bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="4h">4 Hours</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {trendingAssets.map((asset) => {
          const isUp = asset.direction === "up";
          const color = isUp ? "#10B981" : "#EF4444";
          return (
            <div
              key={asset.ticker}
              className="bg-[#14181F] border border-[#1E293B] rounded-lg p-5 hover:border-[#2D3748] hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-medium">{asset.ticker}</div>
                  <div className="text-[#94A3B8] text-sm">{asset.name}</div>
                </div>
                <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
              </div>

              <div className="flex items-end justify-between mb-3">
                <div className="text-white text-xl">{asset.price}</div>
                <div className={`flex items-center gap-1 ${isUp ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                  {isUp ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>
                    {asset.change >= 0 ? "+" : ""}
                    {asset.change}%
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              <ResponsiveContainer width="100%" height={36}>
                <AreaChart data={asset.sparkline} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                  <defs>
                    <linearGradient id={`grad-${asset.ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={color}
                    strokeWidth={1.5}
                    fill={`url(#grad-${asset.ticker})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
