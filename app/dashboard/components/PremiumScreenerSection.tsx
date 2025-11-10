"use client"

import React from "react"
import {
  Star,
  Download,
  RefreshCcw,
  Search,
  Bell,
  ArrowUp,
  Check,
  X,
} from "lucide-react"

/** Utility: simple class joiner */
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ")
}

/** Horizontal stacked bar (bearish/bullish) with % labels and gradients */
function StackedBar({ red, green }: { red: number; green: number }) {
  const showRed = red > 15
  const showGreen = green > 15
  const redBg =
    "linear-gradient(90deg, rgba(239,68,68,.95) 0%, rgba(239,68,68,.85) 50%, rgba(239,68,68,.95) 100%)"
  const greenBg =
    "linear-gradient(90deg, rgba(16,185,129,.95) 0%, rgba(16,185,129,.85) 50%, rgba(16,185,129,.95) 100%)"

  return (
    <div
      className="relative flex h-9 w-full overflow-hidden rounded-md"
      style={{ boxShadow: "inset 0 0 0 1px rgba(30,41,59,.5)" }}
    >
      <div
        className="h-full flex items-center justify-center text-[13px] text-white font-semibold"
        style={{ width: `${red}%`, backgroundImage: redBg }}
      >
        {showRed ? `${red}%` : ""}
      </div>
      <div
        className="h-full flex items-center justify-center text-[13px] text-white font-semibold"
        style={{ width: `${green}%`, backgroundImage: greenBg }}
      >
        {showGreen ? `${green}%` : ""}
      </div>

      {/* crisp divider where they meet */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: `${red}%`,
          width: 1,
          background: "rgba(0,0,0,.35)",
          boxShadow: "0 0 0 1px rgba(255,255,255,.06)",
        }}
      />
    </div>
  )
}

export default function PremiumScreenerSection() {
  const rows = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      intraday: { red: 31, green: 69 },
      daily: { red: 22, green: 78 },
      advanced: { adx: 45, emaAligned: true, volPct: 70, alert: true },
    },
    {
      symbol: "BTCUSD",
      name: "Bitcoin",
      intraday: { red: 53, green: 47 },
      daily: { red: 37, green: 63 },
      advanced: { adx: 32, emaAligned: false, volPct: 90, alert: true },
    },
    {
      symbol: "EURUSD",
      name: "Euro / Dollar",
      intraday: { red: 42, green: 58 },
      daily: { red: 48, green: 52 },
      advanced: { adx: 18, emaAligned: true, volPct: 40, alert: false },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-[32px] font-semibold text-white">Premium Screener</h1>
        <p className="muted text-[16px]">Real-time multi-timeframe trend analysis</p>
      </div>

      {/* Controls bar */}
      <div
        className="surface p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        style={{ background: "hsl(var(--fs-bg-2))" }}
      >
        <div className="flex items-center gap-3">
          <select
            className="rounded-md px-3 h-10 text-[14px]"
            style={{
              background: "hsl(var(--fs-bg-2))",
              border: "1px solid hsl(var(--fs-border))",
              color: "hsl(var(--fs-foreground))",
              outline: "none",
            }}
            defaultValue="All"
          >
            {["All", "Forex", "Crypto", "Stocks", "Indices"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

        <select
            className="rounded-md px-3 h-10 text-[14px]"
            style={{
              background: "hsl(var(--fs-bg-2))",
              border: "1px solid hsl(var(--fs-border))",
              color: "hsl(var(--fs-foreground))",
              outline: "none",
            }}
            defaultValue="All"
          >
            {["All","Strong Bullish","Bullish","Neutral","Bearish","Strong Bearish"].map((o)=>(
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              color="hsl(var(--fs-muted))"
            />
            <input
              placeholder="Search symbol…"
              className="rounded-md pl-9 pr-3 h-10 text-[14px] w-[220px]"
              style={{
                background: "hsl(var(--fs-bg-2))",
                border: "1px solid hsl(var(--fs-border))",
                color: "hsl(var(--fs-foreground))",
                outline: "none",
                boxShadow: "0 0 0 0 rgba(0,212,255,0)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--fs-primary))"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "hsl(var(--fs-border))"
              }}
            />
          </div>

          <button className="btn">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
            <span className="pill ml-2" title="Auto-refresh on">
              Last updated: 2 mins ago
            </span>
          </button>

          <button className="btn">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="[&>th]:py-3 [&>th]:px-4 text-left muted border-b"
              style={{ borderColor: "hsl(var(--fs-border))" }}
            >
              <th className="w-[120px]">SYMBOL</th>
              <th className="text-center">INTRADAY</th>
              <th className="text-center">DAILY</th>
              <th className="text-center">
                ADVANCED <span style={{ color: "#FFD700" }} className="text-xs font-semibold">PRO</span>
              </th>
            </tr>
            <tr
              className="[&>th]:py-2 [&>th]:px-4 text-[12px] text-center muted border-b"
              style={{ borderColor: "hsl(var(--fs-border))" }}
            >
              <th />
              <th>1M | 5M | 15M | 1H</th>
              <th>4H | 1D | 1W</th>
              <th>ADX | EMA | VOL | ALERTS</th>
            </tr>
          </thead>

          <tbody className="[&>tr]:border-b" style={{ borderColor: "hsl(var(--fs-border))" }}>
            {rows.map((r, idx) => {
              const rowBg = idx % 2 === 1 ? "rgba(255,255,255,0.01)" : "transparent"
              return (
                <tr
                  key={r.symbol}
                  className="transition-colors"
                  style={{ background: rowBg }}
                >
                  {/* SYMBOL */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Star
                        size={16}
                        className="cursor-pointer"
                        color="hsl(var(--fs-muted))"
                      />
                      <div>
                        <div className="text-white font-medium">{r.symbol}</div>
                        <div className="muted text-xs">{r.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* INTRADAY */}
                  <td className="px-4 py-4 align-middle">
                    <StackedBar red={r.intraday.red} green={r.intraday.green} />
                  </td>

                  {/* DAILY */}
                  <td className="px-4 py-4 align-middle">
                    <StackedBar red={r.daily.red} green={r.daily.green} />
                  </td>

                  {/* ADVANCED */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center justify-center gap-4 text-white">
                      {/* ADX */}
                      <div
                        className={cx(
                          "min-w-[60px] text-center",
                          r.advanced.adx >= 25 ? "text-[hsl(160,84%,39%)]" : "muted"
                        )}
                        title="Average Directional Index"
                      >
                        {r.advanced.adx} <ArrowUp size={14} className="inline -mt-0.5" />
                      </div>

                      {/* EMA */}
                      <div
                        className={cx(
                          "min-w-[70px] text-center flex items-center justify-center gap-1",
                          r.advanced.emaAligned ? "text-[hsl(160,84%,39%)]" : "text-[hsl(0,84%,57%)]"
                        )}
                        title="EMA alignment"
                      >
                        {r.advanced.emaAligned ? (
                          <>
                            <Check size={14} /> <span>Aligned</span>
                          </>
                        ) : (
                          <>
                            <X size={14} /> <span>Crossed</span>
                          </>
                        )}
                      </div>

                      {/* VOL */}
                      <div className="min-w-[50px] flex items-end justify-center h-6" title="Relative Volume">
                        <div
                          className="w-2 rounded-sm"
                          style={{
                            height: `${Math.max(4, Math.min(24, (r.advanced.volPct / 100) * 24))}px`,
                            background: "rgba(0,212,255,.8)",
                          }}
                        />
                      </div>

                      {/* ALERTS */}
                      <button
                        className="min-w-[24px]"
                        title={r.advanced.alert ? "Alert set" : "No alert"}
                        aria-label="Toggle alert"
                      >
                        <Bell
                          size={18}
                          color={r.advanced.alert ? "hsl(var(--fs-primary))" : "hsl(var(--fs-muted))"}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination / footer (static stub) */}
      <div className="flex items-center justify-between">
        <div className="muted text-sm">Showing 1–50 of 247 assets</div>
        <button className="btn">Load More</button>
      </div>
    </div>
  )
}

