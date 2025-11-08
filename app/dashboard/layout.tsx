// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import "./dashboard.css";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div data-theme="dashboard" className="min-h-dvh grid grid-cols-1 lg:grid-cols-[260px_1fr]" style={{ background: "var(--bg)" }}>
      <aside className="hidden lg:block border-r" style={{ borderColor: "var(--border)" }}>
        <Sidebar />
      </aside>

      {/* Mobile: stacked with topbar */}
      <div className="flex flex-col min-h-dvh">
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

