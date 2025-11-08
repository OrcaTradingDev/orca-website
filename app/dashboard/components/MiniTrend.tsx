// app/dashboard/components/MiniTrend.tsx
"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

const data = Array.from({ length: 16 }, (_, i) => ({
  x: i,
  y: 40 + Math.sin(i / 2) * 12 + (i % 3),
}));

export default function MiniTrend() {
  return (
    <div style={{ height: 42 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mini" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--primary-600)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--accent-500)" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="y"
            stroke="url(#mini)"
            strokeWidth={2}
            fill="url(#mini)"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

