"use client"

import React from "react"
import {
  Star,
  Star as StarOutline,
  Download,
  RefreshCcw,
  Search,
  Bell,
  ArrowUp,
  Check,
  X,
} from "lucide-react"

/* --------------------------------- helpers -------------------------------- */
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ")
}

/** Horizontal stacked bar with gradients, rounded corners, divider, and auto labels */
function StackedBar({ red, green }: { red: number; green: number }) {
  const showRed = red > 15
  const showGreen = green > 15

  return (
    <div
      className="relative h-9 w-full overflow-hidden rounded-lg"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(31,41,55,.55), inset 0 1px 0 rgba(255,255,255,.03)",
        background:
          "linear-gradient(180deg, rgba(2,6,23,.18) 0%, rgba(2,6,23,.28) 100%)",
      }}
    >
      <div
        className="h-full flex items-center justify-center text-[13px] font-semibold text-white"
        style={{
          width: `${red}%`,
          background:
            "linear-gradient(90deg, rgba(239,68,68,.96) 0%, rgba(239,68,68,.86) 50%, rgba(239,68,68,.96) 100%)",
          boxShadow: "inset 0 0 16px rgba(0,0,0,.18)",
        }}
      >
        {showRed ? `${red}%` : ""}
      </div>
      <div
        className="h-full flex items-center justify-center text-[13px] font-semibold text-white"
        style={{
          width: `${green}%`,
          background:
            "linear-gradient(90deg, rgba(16,185,129,.96) 0%, rgba(16,185,129,.86) 50%, rgba(16,185,129,.96) 100%)",
          boxShadow: "inset 0 0 16px rgba(0,0,0,.18)",
        }}
      >
        {showGreen ? `${green}%` : ""}
      </div>
      {/* crisp divider where the colors meet */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: `${red}%`,
          width: 1,
          background: "rgba(0,0,0,.38)",
          boxShadow: "0 0 0 1px rgba(255,255,255,.06)",
        }}
      />
    </div>
  )
}

function Pill({
  children,
  tone = "cyan",
  className,
}: {
  children: React.ReactNode
  tone?: "cyan" | "gold" | "muted"
  className?: string
}) {
  const styles =
    tone === "gold"
      ? {
          background: "rgba(255,215,0,.18)",
          color: "#FFD700",
          border: "1px solid rgba(255,215,0,.35)",
        }
      : tone === "muted"
      ? {
          background: "rgba(148,163,184,.12)",
          color: "hsl(var(--fs-foreground))",
          border: "1px solid rgba(148,163,184,.25)",
        }
      : {
          background: "rgba(14,165,233,.16)",
          color: "hsl(var(--fs-primary))",
          border: "1px solid rgba(14,165,233,.35)",
        }
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2 py-[3px] text-[11px] font-semibold",
        className
      )}
      style={styles}
    >
      {children}
    </span>
  )
}

/* ---------------------------------- view ---------------------------------- */
export default function PremiumScreenerSection() {
  // demo data to match prototype
  const rows = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      intraday: { red: 31, green: 69 },
      daily: { red: 22, green: 78 },
      advanced: { adx: 45, emaAligned: true, volPct: 74, alert: true, fav: true },
    },
    {
      symbol: "BTCUSD",
      name: "Bitcoin",
      intraday: { red: 53, green: 47 },
      daily: { red: 37, green: 63 },
      advanced: { adx: 32, emaAligned: false, volPct: 62, alert: true, fav: true },
    },
    {
      symbol: "EURUSD",
      name: "Euro/Dollar",
      intraday: { red: 42, green: 58 },
      daily: { red: 48, green: 52 },
      advanced: { adx: 18, emaAligned: true, volPct: 28, alert: false, fav: false },
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      intraday: { red: 67, green: 33 },
      daily: { red: 58, green: 42 },
      advanced: { adx: 38, emaAligned: false, volPct: 35, alert: false, fav: false },
    },
    {
      symbol: "ETHUSD",
      name: "Ethereum",
      intraday: { red: 28, green: 72 },
      daily: { red: 35, green: 65 },
      advanced: { adx: 41, emaAligned: true, volPct: 58, alert: true, fav: false },
    },
    {
      symbol: "GBPUSD",
      name: "Pound/Dollar",
      intraday: { red: 51, green: 49 },
      daily: { red: 46, green: 54 },
      advanced: { adx: 22, emaAligned: true, volPct: 19, alert: false, fav: false },
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      intraday: { red: 24, green: 76 },
      daily: { red: 19, green: 81 },
      advanced: { adx: 52, emaAligned: true, volPct: 73, alert: true, fav: true },
    },
    {
      symbol: "SPX",
      name: "S&P 500",
      intraday: { red: 39, green: 61 },
      daily: { red: 33, green: 67 },
      advanced: { adx: 29, emaAligned: true, volPct: 31, alert: false, fav: false },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-[34px] font-semibold text-white tracking-tight">
          Premium Screener
        </h1>
        <p className="text-[16px]" style={{ color: "hsl(var(--fs-muted))" }}>
          Real-time multi-timeframe trend analysis
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3">
          <SelectLike defaultValue="All Asset Classes" options={["All Asset Classes", "Forex", "Crypto", "Stocks", "Indices"]} />
          <SelectLike defaultValue="All Trends" options={["All Trends", "Strong Bullish", "Bullish", "Neutral", "Bearish", "Strong Bearish"]} />
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              color="hsl(var(--fs-muted))"
            />
            <input
              placeholder="Search symbols..."
              className="h-10 w-full rounded-lg pl-9 pr-3 text-[14px]"
              style={{
                background: "hsl(var(--fs-bg-2))",
                border: "1px solid hsl(var(--fs-border))",
                color: "hsl(var(--fs-foreground))",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:justify-end">
          <button className="h-10 rounded-lg px-3 text-[14px] flex items-center"
            style={{
              background: "hsl(var(--fs-bg-2))",
              border: "1px solid hsl(var(--fs-border))",
              color: "hsl(var(--fs-foreground))",
            }}>
            <RefreshCcw size={16} className="mr-2" />
            Last updated: 2 mins ago
          </button>
          <button
            className="h-10 rounded-lg px-3 text-[14px] flex items-center"
            style={{
              background: "transparent",
              border: "1px solid hsl(var(--fs-primary))",
              color: "hsl(var(--fs-primary))",
            }}
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: "hsl(var(--fs-bg-2))",
          border: "1px solid hsl(var(--fs-border))",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              className="[&>th]:py-4 [&>th]:px-6 text-left text-white"
              style={{
                background:
                  "linear-gradient(180deg, rgba(15,23,42,.98) 0%, rgba(15,23,42,.92) 100%)",
                borderBottom: "1px solid hsl(var(--fs-border))",
              }}
            >
              <th className="w-[180px] font-semibold tracking-wide">SYMBOL</th>
              <th className="text-center font-semibold tracking-wide">INTRADAY</th>
              <th className="text-center font-semibold tracking-wide">DAILY</th>
              <th className="text-center font-semibold tracking-wide">
                <span className="align-middle">ADVANCED</span>{" "}
                <Pill tone="gold" className="ml-2 align-middle">PRO</Pill>
              </th>
            </tr>
            <tr
              className="[&>th]:py-2 [&>th]:px-6 text-[12px] text-center"
              style={{
                color: "hsl(var(--fs-muted))",
                borderBottom: "1px solid hsl(var(--fs-border))",
                letterSpacing: ".02em",
              }}
            >
              <th />
              <th>1M | 5M | 15M | 1H</th>
              <th>4H | 1D | 1W</th>
              <th>ADX | EMA | VOL | ALERTS</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.symbol}
                className="group transition-colors"
                style={{
                  borderBottom: "1px solid hsl(var(--fs-border))",
                  background: i % 2 ? "rgba(255,255,255,.01)" : "transparent",
                  height: 72,
                }}
              >
                {/* SYMBOL */}
                <td className="px-6">
                  <div className="flex items-center gap-3">
                    {r.advanced.fav ? (
                      <Star size={16} color="hsl(var(--fs-primary))" />
                    ) : (
                      <StarOutline size={16} color="hsl(var(--fs-muted))" />
                    )}
                    <div>
                      <div className="text-white font-medium tracking-wide">
                        {r.symbol}
                      </div>
                      <div className="text-[12px]" style={{ color: "hsl(var(--fs-muted))" }}>
                        {r.name}
                      </div>
                    </div>
                  </div>
                </td>

                {/* INTRADAY */}
                <td className="px-6 align-middle">
                  <StackedBar red={r.intraday.red} green={r.intraday.green} />
                </td>

                {/* DAILY */}
                <td className="px-6 align-middle">
                  <StackedBar red={r.daily.red} green={r.daily.green} />
                </td>

                {/* ADVANCED */}
                <td className="px-6 align-middle">
                  <div
                    className="grid grid-cols-4 items-center text-white"
                    style={{ columnGap: "18px" }}
                  >
                    {/* ADX */}
                    <div className="text-center">
                      <span
                        className={cx(
                          "text-[14px] font-medium",
                          r.advanced.adx >= 25
                            ? "text-[hsl(160,84%,39%)]"
                            : "text-[hsl(215,20%,65%)]"
                        )}
                      >
                        {r.advanced.adx}{" "}
                        <ArrowUp size={14} className="inline -mt-[2px]" />
                      </span>
                    </div>

                    {/* EMA */}
                    <div className="flex items-center justify-center gap-1">
                      {r.advanced.emaAligned ? (
                        <>
                          <Check size={16} color="hsl(160,84%,39%)" />
                          <span className="text-[13px] text-[hsl(160,84%,39%)]">
                            Aligned
                          </span>
                        </>
                      ) : (
                        <>
                          <X size={16} color="hsl(0,84%,57%)" />
                          <span className="text-[13px] text-[hsl(0,84%,57%)]">
                            Crossed
                          </span>
                        </>
                      )}
                    </div>

                    {/* VOL */}
                    <div className="flex items-center justify-center">
                      <div
                        className="w-[10px] rounded-sm"
                        style={{
                          height: `${Math.max(4, Math.min(26, (r.advanced.volPct / 100) * 26))}px`,
                          background: "rgba(14,165,233,.85)",
                          boxShadow: "0 0 6px rgba(14,165,233,.35)",
                        }}
                        title="Relative Volume"
                      />
                    </div>

                    {/* ALERT (icon wrapped with title/aria) */}
                    <div
                      className="flex items-center justify-center"
                      title={r.advanced.alert ? "Alert set" : "No alert"}
                      aria-label={r.advanced.alert ? "Alert set" : "No alert"}
                    >
                      <Bell
                        size={18}
                        color={
                          r.advanced.alert
                            ? "hsl(var(--fs-primary))"
                            : "hsl(var(--fs-muted))"
                        }
                      />
                    </div>
                  </div>

                  {/* visual separators */}
                  <div className="pointer-events-none relative">
                    <div
                      className="absolute left-1/4 top-[-40px] bottom-[-40px]"
                      style={{ width: 1, background: "rgba(148,163,184,.18)" }}
                    />
                    <div
                      className="absolute left-2/4 top-[-40px] bottom-[-40px]"
                      style={{ width: 1, background: "rgba(148,163,184,.18)" }}
                    />
                    <div
                      className="absolute left-3/4 top-[-40px] bottom-[-40px]"
                      style={{ width: 1, background: "rgba(148,163,184,.18)" }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-sm" style={{ color: "hsl(var(--fs-muted))" }}>
            Showing 1–8 of 8 assets
          </div>
          <button
            className="h-10 rounded-lg px-3 text-[14px]"
            style={{
              background: "transparent",
              border: "1px solid hsl(var(--fs-primary))",
              color: "hsl(var(--fs-primary))",
            }}
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- small parts ------------------------------ */
function SelectLike({
  defaultValue,
  options,
}: {
  defaultValue: string
  options: string[]
}) {
  return (
    <select
      defaultValue={defaultValue}
      className="h-10 rounded-lg px-3 text-[14px] min-w-[200px]"
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
  )
}

