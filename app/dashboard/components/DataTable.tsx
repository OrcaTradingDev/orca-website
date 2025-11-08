// app/(dashboard)/components/DataTable.tsx
type Row = {
  symbol: string; regime: string; trend: number; change: string; volume: string;
};

export default function DataTable({ rows }: { rows: Row[] }) {
  return (
    <div className="rounded-2xl border border-[#142436] bg-[#0f1924] overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#0e1823] text-[#9db4c9]">
          <tr>
            <th className="px-4 py-3 text-left">Symbol</th>
            <th className="px-4 py-3 text-left">Regime</th>
            <th className="px-4 py-3 text-left">Trend</th>
            <th className="px-4 py-3 text-left">% Change</th>
            <th className="px-4 py-3 text-left">Volume</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[#142436]">
              <td className="px-4 py-3">{r.symbol}</td>
              <td className="px-4 py-3">{r.regime}</td>
              <td className="px-4 py-3">{r.trend}</td>
              <td className="px-4 py-3">{r.change}</td>
              <td className="px-4 py-3">{r.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

