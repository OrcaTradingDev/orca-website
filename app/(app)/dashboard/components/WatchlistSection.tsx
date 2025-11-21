import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function WatchlistSection() {
  const watchlistItems = [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      price: "$175.23",
      change: 2.34,
      changeValue: "$4.01",
      sparklineData: [
        { value: 170 },
        { value: 171 },
        { value: 169 },
        { value: 172 },
        { value: 174 },
        { value: 173 },
        { value: 175.23 },
      ],
    },
    {
      ticker: "BTC/USD",
      name: "Bitcoin",
      price: "$68,450",
      change: -1.28,
      changeValue: "-$888",
      sparklineData: [
        { value: 69500 },
        { value: 69800 },
        { value: 69200 },
        { value: 68900 },
        { value: 68700 },
        { value: 68600 },
        { value: 68450 },
      ],
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      price: "$242.67",
      change: 5.67,
      changeValue: "$13.02",
      sparklineData: [
        { value: 229 },
        { value: 232 },
        { value: 235 },
        { value: 238 },
        { value: 236 },
        { value: 240 },
        { value: 242.67 },
      ],
    },
  ];

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white mb-2">Watchlist</h1>
          <p className="text-[#94A3B8]">Track your favorite assets</p>
        </div>
        <Button variant="outline" className="border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </div>

      <div className="bg-[#14181F] border border-[#1E293B] rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-[#1E293B] hover:bg-transparent">
              <TableHead className="text-[#94A3B8]">Asset</TableHead>
              <TableHead className="text-[#94A3B8]">Price</TableHead>
              <TableHead className="text-[#94A3B8]">Change</TableHead>
              <TableHead className="text-[#94A3B8]">24h Chart</TableHead>
              <TableHead className="text-[#94A3B8]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {watchlistItems.map((item) => (
              <TableRow
                key={item.ticker}
                className="border-[#1E293B] hover:bg-[#1A1F2E] transition-colors"
              >
                <TableCell>
                  <div>
                    <div className="text-white">{item.ticker}</div>
                    <div className="text-[#94A3B8] text-sm">{item.name}</div>
                  </div>
                </TableCell>
                <TableCell className="text-white">{item.price}</TableCell>
                <TableCell>
                  <div className={item.change >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                    <div>{item.change >= 0 ? "+" : ""}{item.change}%</div>
                    <div className="text-sm">({item.changeValue})</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ResponsiveContainer width={80} height={30}>
                    <LineChart data={item.sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={item.change >= 0 ? "#10B981" : "#EF4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TableCell>
                <TableCell>
                  <button className="text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
