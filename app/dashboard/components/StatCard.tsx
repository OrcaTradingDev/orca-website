// app/dashboard/components/StatCard.tsx
import MiniTrend from "./MiniTrend";

export default function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="card p-4">
      <div
        className="text-xs"
        style={{ color: "var(--text-muted)", marginBottom: 6 }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-xl font-semibold">{value}</div>
        {delta ? (
          <div className="text-xs" style={{ color: "var(--text-soft)" }}>
            {delta}
          </div>
        ) : null}
      </div>
      <div className="mt-3">
        <MiniTrend />
      </div>
    </div>
  );
}

