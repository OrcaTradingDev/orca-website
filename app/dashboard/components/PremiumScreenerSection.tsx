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

/* ---------- tiny utils ---------- */
function cx(...a: Array<string | false | undefined>) {
  return a.filter(Boolean).join(" ")
}

/* ---------- stacked bar with gradients + labels ---------- */
function StackedBar({ red, green }: { red: number; green: number }) {
  const showRed = red > 15
  const showGreen = green > 15

  return (
    <div
      className="relative h-9 w-full overflow-hidden rounded-lg"
      style={{
        boxShadow:
          "inset 0 0 0 1px rgba(30,41,59,.55), inset 0 1px 0 rgba(255,255,255,.03)",
      }}
    >
      <div
        className="h-full flex items-center justify-center text-[13px] font-semibold text-white"
        style={{
          width: `${red}%`,
          background:
            "linear-gradient(90deg, rgba(239,68,68,.95) 0%, rgba(239,68,68,.85) 50%, rgba(239,68,68,.95) 100%)",
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
            "linear-gradient(90deg, rgba(16,185,129,.95) 0%, rgba(16,185,129,.85) 50%, rgba(16,185,129,.95) 100%)",
          boxShadow: "inset 0 0 16px rgba(0,0,0,.18)",
        }}
      >
        {showGreen ? `${green}%` : ""}
      </div>

      {/* clean divider where they meet */}
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

/* ---------- main section ---------- */
export default function PremiumScreenerSection() {
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
        <h1 className="text-[34px] font-semibold text-white">Premium Screener</h1>
        <p className="muted text-[16px]">
          Real-time multi-timeframe trend analysis
        </p>
      </div>

      {/* Controls — two rows compact like Figma */}
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <select
          aria-label="Asset Class"
          className="h-10 rounded-lg px-3 text-[14px]"
          style={{
            background: "hsl(var(--fs-bg-2))",
            border: "1px solid hsl(var(--fs-border))",
            color: "hsl(var(--fs-foreground))",
            outline: "none",
          }}
          defaultValue="All Asset Classes"
        >
          {[
            "All Asset Classes",
            "Forex",
            "Crypto",
            "Stocks",
            "Indices",
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <select
          aria-label="Trend Strength"
          className="h-10 rounded-lg px-3 text-[14px]"
          style={{
            background: "hsl(var(--fs-bg-2))",
            border: "1px solid hsl(var(--fs-border))",
            color: "hsl(var(--fs-foreground))",
            outline: "none",
          }}
          defaultValue="All Trends"
        >
          {[
            "All Trends",
            "Strong Bullish",
            "Bullish",
            "Neutral",
            "Bearish",
            "Strong Bearish",
          ].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <div className="relative md:col-span-1 xl:col-span-2">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
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

        <div className="flex items-center gap-2 md:justify-end">
          <button className="btn h-10">
            <RefreshCcw size={16} className="mr-2" />
            <span>Last updated: 2 mins ago</span>
          </button>
          <button
            className="btn h-10"
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
          boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        }}
      >
        <table className="w-full text-sm">
          {/* header */}
          <thead>
            <tr
              className="[&>th]:py-4 [&>th]:px-5 text-left text-white"
              style={{
                background: "linear-gradient(0deg, rgba(15,23,42,1) 0%, rgba(15,23,42,.94) 100%)",
                borderBottom: "1px solid hsl(var(--fs-border))",
              }}
            >
              <th className="w-[160px]">SYMBOL</th>
              <th className="text-center">INTRADAY</th>
              <th className="text-center">DAILY</th>
              <th className="text-center">
                ADVANCED{" "}
                <span
                  className="ml-2 rounded-full px-2 py-[2px] text-[11px] font-semibold"
                  style={{
                    background: "rgba(255,215,0,.2)",
                    color: "#FFD700",
                    border: "1px solid rgba(255,215,0,.35)",
                  }}
                >
                  PRO
                </span>
              </th>
            </tr>
            <tr
              className="[&>th]:py-2 [&>th]:px-5 text-[12px] text-center"
              style={{ color: "hsl(var(--fs-muted))", borderBottom: "1px solid hsl(var(--fs-border))" }}
            >
              <th />
              <th>1M | 5M | 15M | 1H</th>
              <th>4H | 1D | 1W</th>
              <th>ADX | EMA | VOL | ALERTS</th>
            </tr>
          </thead>

          {/* rows */}
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.symbol}
                className="group transition-colors"
                style={{
                  borderBottom: "1px solid hsl(var(--fs-border))",
                  background: i % 2 ? "rgba(255,255,255,.01)" : "transparent",
                  height: 68,
                }}
              >
                {/* SYMBOL */}
                <td className="px-5">
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
                <td className="px-5">
                  <StackedBar red={r.intraday.red} green={r.intraday.green} />
                </td>

                {/* DAILY */}
                <td className="px-5">
                  <StackedBar red={r.daily.red} green={r.daily.green} />
                </td>

                {/* ADVANCED */}
                <td className="px-5">
                  <div className="flex items-center justify-center gap-6 text-white">
                    {/* ADX */}
                    <div
                      className={cx(
                        "min-w-[64px] text-center",
                        r.advanced.adx >= 25
                          ? "text-[hsl(160,84%,39%)]"
                          : "text-[hsl(var(--fs-muted-h),var(--fs-muted-s),var(--fs-muted-l))] muted"
                      )}
                      title="Average Directional Index"
                    >
                      {r.advanced.adx} <ArrowUp size={14} className="inline -mt-[2px]" />
                    </div>

                    {/* EMA */}
                    <div
                      className={cx(
                        "min-w-[84px] flex items-center justify-center gap-1",
                        r.advanced.emaAligned ? "text-[hsl(160,84%,39%)]" : "text-[hsl(0,84%,57%)]"
                      )}
                      title="EMA alignment"
                    >
                      {r.advanced.emaAligned ? <Check size={14} /> : <X size={14} />}
                      <span className="text-[13px]">
                        {r.advanced.emaAligned ? "Aligned" : "Crossed"}
                      </span>
                    </div>

                    {/* VOL */}
                    <div className="min-w-[32px] flex items-end justify-center h-6" title="Relative Volume">
                      <div
                        className="w-[10px] rounded-sm"
                        style={{
                          height: `${Math.max(4, Math.min(24, (r.advanced.volPct / 100) * 24))}px`,
                          background: "rgba(14,165,233,.85)", // cyan-ish
                          boxShadow: "0 0 6px rgba(14,165,233,.35)",
                        }}
                      />
                    </div>

                    {/* ALERT */}
                    <button
                      className="min-w-[24px]"
                      title={r.advanced.alert ? "Alert set" : "No alert"}
                      aria-label="Toggle alert"
                    >
                      <Bell
                        size={18}
                        color={
                          r.advanced.alert
                            ? "hsl(var(--fs-primary))"
                            : "hsl(var(--fs-muted))"
                        }
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* footer */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="muted text-sm">Showing 1–8 of 8 assets</div>
          <button
            className="btn h-10"
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

