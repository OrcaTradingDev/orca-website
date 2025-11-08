// app/dashboard/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { LayoutGrid, LineChart, Bell, Settings, ListChecks } from "lucide-react";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname?.startsWith(href);
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{
        background: active ? "var(--bg-elev-2)" : "transparent",
        color: active ? "var(--text)" : "var(--text-muted)",
        border: "1px solid",
        borderColor: active ? "var(--border)" : "transparent",
      }}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <div className="p-4 space-y-6" style={{ color: "var(--text)" }}>
      <div className="px-4">
        <div
          className="h-9 w-9 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-600), var(--accent-500))",
          }}
        />
        <div className="mt-2 text-sm" style={{ color: "var(--text-soft)" }}>
          OrcaTrading
        </div>
      </div>

      <nav className="space-y-1">
        <NavItem href="/dashboard" icon={LayoutGrid} label="Dashboard" />
        <NavItem href="/screener" icon={LineChart} label="Screener" />
        <NavItem href="/watchlist" icon={ListChecks} label="Watchlist" />
        <NavItem href="/alerts" icon={Bell} label="Alerts" />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </nav>
    </div>
  );
}

