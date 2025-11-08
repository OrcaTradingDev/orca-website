// app/dashboard/page.tsx
import StatCard from "./components/StatCard";
import AreaChart from "./components/AreaChart";
import DataTable from "./components/DataTable";

/** Demo data to make it feel real (replace with API later) */
const series = Array.from({ length: 36 }, (_, i) => ({
  x: `T${i}`,
  y: 60 + Math.sin(i / 2.4) * 18 + (i % 7) - 3,
}));

const rows = [
  { symbol: "AAPL", regime: "Bull", trend: 82, change: "+1.2%", volume: "54M" },
  { symbol: "NVDA", regime: "Bull", trend: 88, change: "+2.0%", volume: "42M" },
  { symbol: "TSLA", regime: "Bear", trend: 41, change: "-0.8%", volume: "36M" },
  { symbol: "MSFT", regime: "Bull", trend: 75, change: "+0.6%", volume: "28M" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Market Regime" value="Bullish" delta="+3d" />
        <StatCard label="Trend Breadth" value="62%" delta="+5% vs 7d" />
        <StatCard label="Alerts (24h)" value="12" delta="3 resolved" />
      </div>

      {/* Main chart */}
      <AreaChart title="Composite Trend" data={series} />

      {/* Table */}
      <DataTable rows={rows} />
    </div>
  );
}

