// app/(dashboard)/components/Sidebar.tsx
import { LineChart, LayoutGrid, Bell, Settings, ListChecks } from "lucide-react";
import Link from "next/link";

const NavItem = ({ href, icon: Icon, label }: any) => (
  <Link
    href={href}
    className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-[#101a25] text-[#cfe0f3]"
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  return (
    <div className="p-4 space-y-6">
      <div className="px-4">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600" />
        <div className="mt-2 text-sm text-[#9db4c9]">OrcaTrading</div>
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

