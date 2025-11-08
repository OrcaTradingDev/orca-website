// app/dashboard/components/DataTable.tsx
type Row = {
  symbol: string;
  regime: string;   // ← relaxed from "Bull" | "Bear" to string
  trend: number;
  change: string;
  volume: string;
};

export default function DataTable({ rows }: { rows: Row[] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead style={{ background: "var(--bg-elev-2)", color: "var(--text-muted)" }}>
          <tr>
            <th className="px-4 py-3 text-left font-medium">Symbol</th>
            <th className="px-4 py-3 text-left font-medium">Regime</th>
            <th className="px-4 py-3 text-left font-medium">Trend</th>
            <th className="px-4 py-3 text-left font-medium">% Change</th>
            <th className="px-4 py-3 text-left font-medium">Volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const isBull = (r.regime || "").toLowerCase().startsWith("bull");
            return (
              <tr key={i} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="px-4 py-3">{r.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`chip ${isBull ? "bull" : "bear"}`}>
                    {r.regime}
                  </span>
                </td>
                <td className="px-4 py-3">{r.trend}</td>
                <td className="px-4 py-3">{r.change}</td>
                <td className="px-4 py-3">{r.volume}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

