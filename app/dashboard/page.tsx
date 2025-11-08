// app/(dashboard)/page.tsx
import StatCard from "./components/StatCard";
import AreaChart from "./components/AreaChart";
import DataTable from "./components/DataTable";

const sampleSeries = Array.from({ length: 24 }, (_, i) => ({ x: `T${i}`, y: 50 + Math.sin(i/2) * 15 + i/3 }));
const sampleRows = [
  { symbol: "AAPL", regime: "Bull", trend: 78, change: "+1.2%", volume: "54M" },
  { symbol: "NVDA", regime: "Bull", trend: 83, change: "+2.0%", volume: "42M" },
  { symbol: "TSLA", regime: "Bear", trend: 41, change: "-0.8%", volume: "36M" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Market Regime" value="Bullish" delta="+3d">{/* sparkline later */}</StatCard>
        <StatCard label="Trend Breadth" value="62%" delta="+5% vs 7d" />
        <StatCard label="Alerts (24h)" value="12" delta="3 resolved" />
      </div>

      <AreaChart data={sampleSeries} />

      <DataTable rows={sampleRows} />
    </div>
  );
}

