"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import PremiumScreenerSection from "./PremiumScreenerSection"
import { SectionHeader } from "./section-header"
import { Plus, Trash2, Pencil } from "lucide-react"

export default function DashboardClient() {
  const params = useSearchParams()
  // Default to the new screener
  const tab = params.get("tab") ?? "screener"

  return (
    <>
      {tab === "screener" && <PremiumScreenerSection />}
      {tab === "watchlist" && <WatchlistSection />}
      {tab === "alerts" && <AlertsSection />}
      {tab === "filters" && <FiltersSection />}
      {tab === "trending" && <TrendingSection />}
      {tab === "tools" && <ToolsSection />}
      {tab === "bot" && <BotSection />}
      {tab === "account" && <AccountSection />}
      {tab === "subscription" && <SubscriptionSection />}
    </>
  )
}

/* ----- existing stub sections stay (unchanged) ----- */

function WatchlistSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Watchlist"
        subtitle="Track your favorite assets"
        actions={
          <button className="btn btn-primary">
            <Plus size={16} /> Add Asset
          </button>
        }
      />
      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left muted">
            <tr
              className="[&>th]:py-3 [&>th]:px-4 border-b"
              style={{ borderColor: "hsl(var(--fs-border))" }}
            >
              <th>Asset</th>
              <th>Price</th>
              <th>Change</th>
              <th>24h</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody
            className="[&>tr]:border-b"
            style={{ borderColor: "hsl(var(--fs-border))" }}
          >
            {[
              { t: "AAPL", n: "Apple Inc.", p: "$175.23", c: "+2.34%" },
              { t: "BTC/USD", n: "Bitcoin", p: "$68,450", c: "-1.28%" },
              { t: "TSLA", n: "Tesla Inc.", p: "$242.67", c: "+5.67%" },
            ].map((row) => (
              <tr
                key={row.t}
                className="hover:bg-[hsl(var(--fs-active-bg))]/60 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="text-white">{row.t}</div>
                  <div className="muted text-xs">{row.n}</div>
                </td>
                <td className="px-4 py-3">{row.p}</td>
                <td className="px-4 py-3">
                  <span
                    className={row.c.startsWith("+") ? "positive" : "negative"}
                  >
                    {row.c}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div
                    className="h-6 w-24 rounded"
                    style={{ background: "hsl(var(--fs-border))" }}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="btn h-8 px-2" aria-label="Remove">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AlertsSection() {
  const rows = [
    { id: 1, name: `BTC/USD > $70,000`, status: "Active" },
    { id: 2, name: `AAPL volume spike > 20%`, status: "Active" },
    { id: 3, name: `ETH < $3,500`, status: "Paused" },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Saved Alerts"
        subtitle="Manage your price and volume alerts"
        actions={
          <button className="btn btn-primary">
            <Plus size={16} /> Create Alert
          </button>
        }
      />
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="surface p-4 flex items-center gap-3">
            <div className="flex-1">
              <div className="text-white font-medium">{r.name}</div>
              <div className="muted text-xs mt-1 flex items-center gap-2">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background:
                      r.status === "Active"
                        ? "hsl(var(--fs-accent-green))"
                        : "hsl(var(--fs-border))",
                    display: "inline-block",
                  }}
                />
                {r.status}
              </div>
            </div>
            <button className="btn h-9 px-3" title="Edit">
              <Pencil size={16} />
            </button>
            <button className="btn h-9 px-3" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function FiltersSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Filters & Settings"
        subtitle="Customize your screener preferences"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface p-5 space-y-5">
          <h3 className="text-white font-semibold">Asset Filters</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select label="Asset Type" options={["All", "Forex", "Crypto", "Stocks", "Commodities"]} />
            <Select label="Market Cap" options={["All", "Large", "Mid", "Small"]} />
          </div>
          <div>
            <div className="muted text-sm mb-2">Exchanges</div>
            <div className="flex flex-wrap gap-2">
              {["NYSE", "NASDAQ", "Binance", "Coinbase"].map((x) => (
                <label key={x} className="pill cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 accent-[hsl(var(--fs-primary))]"
                  />{" "}
                  {x}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="surface p-5 space-y-5">
          <h3 className="text-white font-semibold">Timeframe Preferences</h3>
          <div className="flex flex-wrap gap-2">
            {["1m", "5m", "15m", "1h", "4h", "1D"].map((tf) => (
              <button key={tf} className="pill hover:brightness-125">
                {tf}
              </button>
            ))}
          </div>
          <div className="muted text-sm">Default view</div>
          <div className="flex gap-3">
            <label className="pill cursor-pointer">
              <input type="radio" name="view" className="mr-2" /> Intraday
            </label>
            <label className="pill cursor-pointer">
              <input type="radio" name="view" className="mr-2" /> Daily
            </label>
            <label className="pill cursor-pointer">
              <input type="radio" name="view" className="mr-2" /> All
            </label>
          </div>
        </div>

        <div className="surface p-5 space-y-5">
          <h3 className="text-white font-semibold">Display Settings</h3>
          <Toggle label="Show mini charts" />
          <Toggle label="Auto-refresh data" />
          <div>
            <div className="muted text-sm mb-2">Refresh interval</div>
            <input type="range" min={30} max={300} defaultValue={60} className="w-full" />
          </div>
        </div>

        <div className="surface p-5 space-y-5">
          <h3 className="text-white font-semibold">Notifications</h3>
          <Toggle label="Email alerts" />
          <Toggle label="Browser notifications" />
        </div>
      </div>
      <div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  )
}

function TrendingSection() {
  const rows = [
    { s: "NVDA", n: "Nvidia", p: "$875.45", ch: "+8.23%" },
    { s: "SOL/USD", n: "Solana", p: "$142.67", ch: "+12.45%" },
    { s: "ETH/USD", n: "Ethereum", p: "$3,456.89", ch: "-2.34%" },
    { s: "MSFT", n: "Microsoft", p: "$412.34", ch: "+1.67%" },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader title="Trending Assets" subtitle="Most active markets right now" />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((r) => (
          <div key={r.s} className="surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{r.s}</div>
                <div className="muted text-xs">{r.n}</div>
              </div>
              <div className={r.ch.startsWith("+") ? "positive" : "negative"}>{r.ch}</div>
            </div>
            <div className="mt-3 h-14 rounded" style={{ background: "hsl(var(--fs-border))" }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolsSection() {
  const tools = [
    { title: "Advanced Screener", desc: "Our premium multi-timeframe scanner", action: "Launch", active: true },
    { title: "Portfolio Tracker", desc: "Coming Soon", badge: "Coming Soon" },
    { title: "Economic Calendar", desc: "Coming Soon", badge: "Coming Soon" },
    { title: "Risk Calculator", desc: "Coming Soon", badge: "Coming Soon" },
    { title: "Backtesting Tool", desc: "In Development", badge: "In Development" },
  ]
  return (
    <div className="space-y-4">
      <SectionHeader title="Tools & Features" subtitle="Explore our trading toolkit" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t, i) => (
          <div key={i} className="surface p-5 flex flex-col gap-3 hover:shadow-lg transition-shadow">
            <div className="text-white font-semibold">{t.title}</div>
            <div className="muted text-sm">{t.desc}</div>
            <div className="mt-auto flex items-center gap-2">
              {t.active ? <button className="btn btn-primary">Launch</button> : <span className="pill">{t.badge}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BotSection() {
  return (
    <div className="max-w-xl">
      <SectionHeader title="Bot Integration" subtitle="Automate your trading workflow" />
      <div className="surface p-8 text-center">
        <div className="mx-auto mb-4 rounded-full" style={{ width: 80, height: 80, background: "rgba(0,212,255,.15)" }} />
        <h3 className="text-white text-xl font-semibold">Coming Soon</h3>
        <p className="muted mt-2">
          We&apos;re building powerful bot integration features. Connect your trading bots, automate signals, and execute strategies directly from Flowscreener.
        </p>
        <button className="btn mt-5">Notify Me</button>
      </div>
    </div>
  )
}

function AccountSection() {
  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader title="Account Settings" subtitle="Manage your profile and preferences" />
      <div className="surface p-5 space-y-4">
        <Field label="Full Name" placeholder="John Doe" />
        <Field label="Email" placeholder="john@example.com" type="email" />
        <Field label="Username" placeholder="trader_john" />
      </div>
      <div className="surface p-5 space-y-4">
        <h3 className="text-white font-semibold">Security</h3>
        <Field label="Current Password" type="password" />
        <Field label="New Password" type="password" />
        <Field label="Confirm Password" type="password" />
        <button className="btn btn-primary">Change Password</button>
      </div>
      <div className="surface p-5 space-y-4">
        <h3 className="text-white font-semibold">Preferences</h3>
        <Select label="Timezone" options={["UTC", "EST", "PST"]} />
        <Select label="Date Format" options={["MM/DD/YYYY", "DD/MM/YYYY"]} />
        <Toggle label="Two-factor authentication" />
      </div>
      <div>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  )
}

function SubscriptionSection() {
  return (
    <div className="space-y-6 max-w-5xl">
      <SectionHeader title="Subscription" subtitle="Manage your plan and billing" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="surface p-6">
          <div className="pill mb-2">Current Plan</div>
          <div className="text-white text-xl font-semibold">Free Plan</div>
          <div className="muted mt-2">$0/month</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="muted">• Limited symbols</li>
            <li className="muted">• Basic timeframes</li>
            <li className="muted">• Standard support</li>
          </ul>
          <div className="muted text-sm mt-4">Usage</div>
          <div className="mt-2">
            <div className="muted text-xs mb-1">10/20 saved assets</div>
            <div className="h-2 rounded bg-[hsl(var(--fs-border))]">
              <div className="h-2 rounded" style={{ width: "50%", background: "hsl(var(--fs-primary))" }} />
            </div>
          </div>
        </div>
        <div className="surface p-6 border-[1.5px]" style={{ borderColor: "hsl(var(--fs-primary))" }}>
          <div className="pill mb-2" style={{ borderColor: "transparent", background: "rgba(255,215,0,.12)", color: "#FFD700" }}>
            Upgrade
          </div>
          <div className="text-white text-xl font-semibold">Premium Plan</div>
          <div className="muted mt-2">$29/month or $299/year</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="muted">• Unlimited assets</li>
            <li className="muted">• All timeframes</li>
            <li className="muted">• Advanced analytics</li>
            <li className="muted">• Priority support</li>
            <li className="muted">• Custom alerts</li>
          </ul>
          <button className="btn btn-primary mt-5">Upgrade Now</button>
        </div>
      </div>
      <div className="surface p-6">
        <div className="text-white font-semibold">Billing</div>
        <div className="muted text-sm mt-2">Card ending in •••• 4242 · Next billing date: Dec 1, 2025</div>
        <div className="mt-3 flex gap-2">
          <button className="btn">Update Payment Method</button>
          <button className="btn">View Invoices</button>
          <button className="btn">Cancel Subscription</button>
        </div>
      </div>
    </div>
  )
}

/* ------- tiny form helpers (unchanged) ------- */

function Field(props: { label: string; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <div className="muted text-sm mb-1">{props.label}</div>
      <input
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        className="w-full rounded-md px-3 h-10"
        style={{
          background: "hsl(var(--fs-bg-2))",
          border: "1px solid hsl(var(--fs-border))",
          color: "hsl(var(--fs-foreground))",
          outline: "none",
        }}
      />
    </label>
  )
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <div className="muted text-sm mb-1">{label}</div>
      <select
        className="w-full rounded-md px-3 h-10"
        style={{
          background: "hsl(var(--fs-bg-2))",
          border: "1px solid hsl(var(--fs-border))",
          color: "hsl(var(--fs-foreground))",
          outline: "none",
          appearance: "none",
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  )
}

function Toggle({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" className="peer sr-only" />
      <span className="inline-block w-10 h-6 rounded-full relative" style={{ background: "hsl(var(--fs-border))", transition: "background .2s ease" }}>
        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all peer-checked:translate-x-4" />
      </span>
      <span className="muted">{label}</span>
    </label>
  )
}

