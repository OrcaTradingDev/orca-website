import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function TrendingSection() {
  const trendingAssets = [
    {
      ticker: "NVDA",
      name: "Nvidia",
      price: "$875.45",
      change: 8.23,
      direction: "up",
    },
    {
      ticker: "SOL/USD",
      name: "Solana",
      price: "$142.67",
      change: 12.45,
      direction: "up",
    },
    {
      ticker: "ETH/USD",
      name: "Ethereum",
      price: "$3,456.89",
      change: -2.34,
      direction: "down",
    },
    {
      ticker: "MSFT",
      name: "Microsoft",
      price: "$412.34",
      change: 1.67,
      direction: "up",
    },
    {
      ticker: "GOOGL",
      name: "Alphabet",
      price: "$142.78",
      change: 3.45,
      direction: "up",
    },
    {
      ticker: "META",
      name: "Meta Platforms",
      price: "$498.23",
      change: -0.89,
      direction: "down",
    },
  ];

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
        {trendingAssets.map((asset) => (
          <div
            key={asset.ticker}
            className="bg-[#14181F] border border-[#1E293B] rounded-lg p-5 hover:border-[#2D3748] hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-white">{asset.ticker}</div>
                <div className="text-[#94A3B8] text-sm">{asset.name}</div>
              </div>
              <TrendingUp className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-white text-xl">{asset.price}</div>
              <div
                className={`flex items-center gap-1 ${
                  asset.direction === "up" ? "text-[#10B981]" : "text-[#EF4444]"
                }`}
              >
                {asset.direction === "up" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>
                  {asset.change >= 0 ? "+" : ""}
                  {asset.change}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
