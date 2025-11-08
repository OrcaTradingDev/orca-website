// app/dashboard/components/Topbar.tsx
export default function Topbar() {
  return (
    <header
      className="sticky top-0 z-10 backdrop-blur"
      style={{
        background: "color-mix(in oklab, var(--bg) 86%, transparent)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
        <h1
          className="tracking-tight"
          style={{ fontSize: "var(--font-size-h1)" }}
        >
          Dashboard
        </h1>

        <div className="flex items-center gap-2">
          <input
            placeholder="Search…"
            className="input"
            style={{ width: 200 }}
          />
          <button className="btn">Last 24h</button>
          <button className="btn btn-primary">Export</button>
        </div>
      </div>
    </header>
  );
}

