// app/dashboard/components/Sidebar.tsx
"use client";

import Link from "next/link";
import {
  LayoutGrid,
  LineChart,
  Bell,
  Settings,
  ListChecks,
  Stars,
  Zap,
  Bot,
  Crown,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn as cx } from "./utils";  // add simple helper below if you don't have one

export default function Sidebar() {
  const pathname = usePathname();
  const r = useRouter();

  const items = [
    { key: "screener", label: "Premium Screener", icon: LineChart, href: "/dashboard" },
    { key: "watchlist", label: "Watchlist", icon: ListChecks, href: "/dashboard?tab=watchlist" },
    { key: "alerts", label: "Saved Alerts", icon: Bell, href: "/dashboard?tab=alerts" },
    { key: "filters", label: "Filters & Settings", icon: Stars, href: "/dashboard?tab=filters" },
    { key: "trending", label: "Trending Assets", icon: Zap, href: "/dashboard?tab=trending" },
    { key: "tools", label: "Tools & Features", icon: Crown, href: "/dashboard?tab=tools" },
    { key: "bot", label: "Bot Integration", icon: Bot, href: "/dashboard?tab=bot" },
    { key: "settings", label: "Account Settings", icon: Settings, href: "/dashboard?tab=settings" },
    { key: "sub", label: "Subscription", icon: Crown, href: "/dashboard?tab=sub" },
  ];

  return (
    <div className="sticky top-0 h-dvh flex flex-col" style={{ color: "var(--text)", background: "var(--bg)" }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="h-9 w-9 rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, var(--primary-600), var(--accent-500))",
          }}
        />
        <div>
          <div className="font-semibold leading-tight">Flowscreener</div>
          <div className="text-xs" style={{ color: "var(--text-soft)" }}>
            by OrcaTrading
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {items.map((it) => {
          const active = pathname === "/dashboard" && it.key === "screener";
          return (
            <Link
              key={it.key}
              href={it.href}
              className={cn(
                "mx-3 my-1 flex items-center gap-3 px-3 py-2 rounded-xl border",
                active ? "bg-[var(--bg-elev-2)]" : "bg-transparent"
              )}
              style={{ borderColor: active ? "var(--border)" : "transparent", color: active ? "var(--text)" : "var(--text-muted)" }}
            >
              <it.icon className="h-4 w-4" />
              <span className="text-sm">{it.label}</span>
              {it.key === "bot" && (
                <span className="ml-auto chip" style={{ fontSize: 11 }}>Coming Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[var(--bg-elev-2)] grid place-items-center text-sm">JD</div>
          <div className="text-sm">
            <div>John Doe</div>
            <span className="chip" style={{ fontSize: 11, background: "var(--chip-bull)", color: "var(--chip-bull-text)", borderColor: "transparent" }}>
              Premium
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// minimal cn helper if you don't already have it
export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

