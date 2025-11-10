// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import "./dashboard.css";   // existing scoped styles

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="dashboard"
      className="min-h-dvh grid grid-cols-1 lg:grid-cols-[280px_1fr]"
      style={{ background: "var(--bg)" }}
    >
      {/* Sidebar is rendered inside page to keep it sticky; this slot is for structure only */}
      <aside className="hidden lg:block border-r" style={{ borderColor: "var(--border)" }} />
      <main className="min-h-dvh">{children}</main>
    </div>
  );
}

