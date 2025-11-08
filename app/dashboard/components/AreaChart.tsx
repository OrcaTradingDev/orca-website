// app/(dashboard)/components/AreaChart.tsx
"use client";
import { AreaChart as RAreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AreaChart({ data }: { data: Array<{ x: string; y: number }> }) {
  return (
    <div className="rounded-2xl border border-[#142436] bg-[#0f1924] p-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RAreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tick={{ fill: "#9db4c9", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#9db4c9", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#0f1924", border: "1px solid #142436" }} />
          <Area type="monotone" dataKey="y" stroke="url(#grad)" fill="url(#grad)" />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

