// app/(dashboard)/components/Topbar.tsx
export default function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-[#0b141e]/70 backdrop-blur supports-[backdrop-filter]:bg-[#0b141e]/50 border-b border-[#142436]">
      <div className="px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-3">
          <input
            placeholder="Search…"
            className="h-9 w-48 rounded-lg bg-[#0f1924] border border-[#142436] px-3 text-sm outline-none"
          />
          <div className="h-9 w-9 rounded-full bg-[#0f1924] border border-[#142436]" />
        </div>
      </div>
    </header>
  );
}

