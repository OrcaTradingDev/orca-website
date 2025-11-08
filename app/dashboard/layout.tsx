// app/(dashboard)/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#0b141e] text-[#e6eef7] grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-[#142436]">
        <Sidebar />
      </aside>
      <div className="flex flex-col">
        <Topbar />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

