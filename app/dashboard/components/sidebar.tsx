"use client"

import Link from "next/link"
import { useSearchParams, usePathname } from "next/navigation"
import {
  Star,
  Bell,
  SlidersHorizontal,
  TrendingUp,
  Grid2X2,
  Bot,
  User,
  Crown,
  LineChart,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import React from "react"

type NavItem = {
  key: string
  label: string
  icon: LucideIcon
  soon?: boolean
}

const items: NavItem[] = [
  { key: "screener", label: "Premium Screener", icon: LineChart },
  { key: "watchlist", label: "Watchlist", icon: Star },
  { key: "alerts", label: "Saved Alerts", icon: Bell },
  { key: "filters", label: "Filters & Settings", icon: SlidersHorizontal },
  { key: "trending", label: "Trending Assets", icon: TrendingUp },
  { key: "tools", label: "Tools & Features", icon: Grid2X2 },
  { key: "bot", label: "Bot Integration", icon: Bot, soon: true },
  { key: "account", label: "Account Settings", icon: User },
  { key: "subscription", label: "Subscription", icon: Crown },
]

export default function Sidebar() {
  const pathname = usePathname()
  const params = useSearchParams()
  const tab = params.get("tab") ?? "screener"

  const hrefFor = (key: string) => {
    const base = pathname || "/dashboard"
    return `${base}?tab=${key}`
  }

  return (
    <aside className="sidebar hidden md:flex md:flex-col">
      {/* Brand block */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div
            className="rounded-xl"
            style={{
              width: 32,
              height: 32,
              background:
                "linear-gradient(135deg, rgba(14,165,233,1) 0%, rgba(0,212,255,1) 100%)",
              boxShadow: "0 6px 18px rgba(0,212,255,.35)",
            }}
          />
          <div>
            <div className="text-white font-semibold leading-none">
              Flowscreener
            </div>
            <div className="text-[12px]" style={{ color: "hsl(var(--fs-muted))" }}>
              by OrcaTrading
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-1 flex-1 px-2">
        {items.map(({ key, label, icon: Icon, soon }) => {
          const active = tab === key
          return (
            <Link key={key} href={hrefFor(key)} className={`nav-item ${active ? "active" : ""}`}>
              {active && <span aria-hidden className="active-rail" />}
              <Icon size={20} strokeWidth={2} />
              <span className="text-[15px] font-medium">{label}</span>
              {soon && (
                <span
                  className="pill ml-auto"
                  style={{ borderColor: "transparent", background: "rgba(0,212,255,.12)" }}
                >
                  Coming&nbsp;Soon
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User mini-card */}
      <div className="px-5 py-4 mt-auto">
        <div className="surface p-3 flex items-center gap-3">
          <div
            className="rounded-full"
            style={{ width: 36, height: 36, background: "hsl(var(--fs-active-bg))" }}
          />
          <div className="min-w-0">
            <div className="text-[13px] text-white truncate">John Doe</div>
            <div
              className="pill"
              style={{
                borderColor: "transparent",
                background: "rgba(255,215,0,.12)",
                color: "#FFD700",
              }}
            >
              Premium
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

