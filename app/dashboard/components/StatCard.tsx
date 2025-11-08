// app/(dashboard)/components/StatCard.tsx
export default function StatCard({
  label, value, delta, children,
}: { label: string; value: string; delta?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#142436] bg-[#0f1924] p-4">
      <div className="text-xs text-[#9db4c9]">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-xl font-semibold">{value}</div>
        {delta ? <div className="text-xs text-[#9db4c9]">{delta}</div> : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

