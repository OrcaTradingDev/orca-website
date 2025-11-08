// app/dashboard/components/AreaChart.tsx
"use client";

import {
  AreaChart as RAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function AreaChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ x: string; y: number }>;
}) {
  return (
    <div className="card p-4" style={{ height: 320 }}>
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 8 }}
      >
        <h2 style={{ fontSize: "var(--font-size-h2)" }}>{title}</h2>
        <div className="flex items-center gap-2">
          <button className="btn">1D</button>
          <button className="btn">1W</button>
          <button className="btn btn-primary">1M</button>
          <button className="btn">3M</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ left: 8, right: 8, top: 6, bottom: 0 }}>
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--primary-600)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey="x"
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke="url(#grad)"
            strokeWidth={2}
            fill="url(#grad)"
            fillOpacity={0.25}
          />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

