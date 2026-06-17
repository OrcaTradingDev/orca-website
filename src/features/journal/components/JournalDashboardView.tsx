"use client";

import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart2, Target, Award, Brain, Trophy } from "lucide-react";
import { useJournalStats, useJournalTrades, useEquity, useOrcaAnalytics } from "../hooks/useJournal";
import { useAccountSize } from "../hooks/useAccountSize";
import type { Trade } from "../types/journal";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined) => {
  if (n == null) return "—";
  const abs = Math.abs(n);
  const s = abs >= 1000 ? `$${(abs / 1000).toFixed(1)}k` : `$${abs.toFixed(2)}`;
  return n < 0 ? `−${s}` : `+${s}`;
};

const pnlColor = (v: number | null | undefined) => {
  if (v == null) return "#94A3B8";
  return v > 0 ? "#10B981" : v < 0 ? "#EF4444" : "#94A3B8";
};

const SESSION_LABELS: Record<string, string> = {
  LONDON: "London", NEW_YORK: "New York", ASIAN: "Asian", OTHER: "Other",
};

const EMOTION_LABELS: Record<string, string> = {
  CALM: "😌 Calm", NEUTRAL: "😐 Neutral", ANXIOUS: "😰 Anxious",
  EXCITED: "😄 Excited", FEARFUL: "😨 Fearful", FRUSTRATED: "😤 Frustrated", GREEDY: "🤑 Greedy",
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub?: string; color?: string; icon?: React.ElementType;
}) {
  return (
    <div style={{
      background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px",
      padding: "18px 20px", display: "flex", flexDirection: "column", gap: "4px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {Icon && <Icon style={{ width: "12px", height: "12px" }} />}
        {label}
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: color ?? "white", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: "12px", color: "#64748B" }}>{sub}</div>}
    </div>
  );
}

// ── Equity curve ──────────────────────────────────────────────────────────────

function EquityCurve() {
  const { data = [], isLoading } = useEquity();
  const { accountSize } = useAccountSize();

  const tickColor  = "#475569";
  const gridColor  = "#1E293B";

  const totalPnl   = data.length > 0 ? data[data.length - 1].cumulative_pnl : 0;
  const isProfit   = totalPnl >= 0;
  const lineColor  = isProfit ? "#10B981" : "#EF4444";
  const gradientId = isProfit ? "equityGreen" : "equityRed";

  // When account size is known: show absolute equity value (Robinhood style).
  // Prepend a synthetic "Start" point at accountSize so the line begins flat.
  // Normalise everything to { date, value } so Recharts has a stable shape.
  const hasAccount = accountSize != null && accountSize > 0;
  const chartData: { date: string; value: number }[] = hasAccount
    ? [
        { date: "Start", value: accountSize! },
        ...data.map((pt) => ({ date: pt.date, value: accountSize! + pt.cumulative_pnl })),
      ]
    : data.map((pt) => ({ date: pt.date, value: pt.cumulative_pnl }));
  const currentEquity = hasAccount ? accountSize! + totalPnl : null;
  const pctChange     = hasAccount && accountSize! > 0 ? (totalPnl / accountSize!) * 100 : null;

  // Y-axis formatter — shows "$10.5k" or "$500" depending on scale
  const yFmt = (v: number) => {
    const abs = Math.abs(v);
    if (abs >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000)     return `$${(v / 1_000).toFixed(1)}k`;
    return `$${v.toFixed(0)}`;
  };

  return (
    <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
        <div style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>Equity Curve</div>

        {data.length > 0 && (
          hasAccount && currentEquity != null ? (
            /* Robinhood-style header: big equity value + delta */
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "white", fontSize: "20px", fontWeight: 700, lineHeight: 1.1 }}>
                ${currentEquity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ color: pnlColor(totalPnl), fontSize: "12px", marginTop: "2px" }}>
                {totalPnl >= 0 ? "+" : "−"}${Math.abs(totalPnl).toFixed(2)}
                {pctChange != null && (
                  <span style={{ marginLeft: "4px", opacity: 0.8 }}>
                    ({totalPnl >= 0 ? "+" : ""}{pctChange.toFixed(2)}%)
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Fallback: just show cumulative PnL */
            <span style={{ color: pnlColor(totalPnl), fontSize: "14px", fontWeight: 600 }}>
              {fmt(totalPnl)}
            </span>
          )
        )}
      </div>

      {isLoading || data.length === 0 ? (
        <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: "13px" }}>
          {isLoading ? "Loading…" : "No closed trades yet"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lineColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: tickColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string) => v === "Start" ? "Start" : v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: tickColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yFmt}
              width={58}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
              labelStyle={{ color: "#94A3B8" }}
              formatter={(v: number) => [
                hasAccount
                  ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `$${v.toFixed(2)}`,
                hasAccount ? "Account Value" : "Cumulative PnL",
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: lineColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// ── PnL distribution donut ────────────────────────────────────────────────────

function PnlDistribution() {
  const { data: stats } = useJournalStats();

  if (!stats || stats.closed_trades === 0) {
    return (
      <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px" }}>
        <div style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "12px" }}>PnL Distribution</div>
        <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "#334155", fontSize: "13px" }}>No data yet</div>
      </div>
    );
  }

  const pieData = [
    { name: "Winners", value: stats.winning_trades, color: "#10B981" },
    { name: "Losers",  value: stats.losing_trades,  color: "#EF4444" },
  ];

  return (
    <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px" }}>
      <div style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>PnL Distribution</div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                dataKey="value" paddingAngle={3} startAngle={90} endAngle={450}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ color: "#64748B", fontSize: "9px", fontWeight: 600 }}>TOTAL</div>
            <div style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>{stats.closed_trades}</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {pieData.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <div>
                <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: "#64748B", fontSize: "12px" }}>
                  {d.value} ({stats.closed_trades > 0 ? ((d.value / stats.closed_trades) * 100).toFixed(1) : 0}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Orca improvement center widget ────────────────────────────────────────────

function OrcaImprovementWidget() {
  const { data } = useOrcaAnalytics();

  if (!data?.has_data) {
    return (
      <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Trophy style={{ width: "16px", height: "16px", color: "#6366F1" }} />
          <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>Orca Improvement Center</span>
        </div>
        <div style={{ color: "#475569", fontSize: "13px", lineHeight: 1.6 }}>
          Log trades manually to unlock AI-powered insights about your strengths, weaknesses and focus areas.
        </div>
      </div>
    );
  }

  // Find best and worst phase by win rate (min 2 trades)
  const qualified = data.by_phase.filter((p) => p.trades >= 2 && p.win_rate != null);
  const best  = qualified.length > 0 ? qualified.reduce((a, b) => (a.win_rate! > b.win_rate! ? a : b)) : null;
  const worst = qualified.length > 0 ? qualified.reduce((a, b) => (a.win_rate! < b.win_rate! ? a : b)) : null;

  // Find best orca status
  const bestStatus = data.by_status.find((s) => s.status === "ON") ?? data.by_status[0];

  return (
    <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy style={{ width: "16px", height: "16px", color: "#6366F1" }} />
          <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>Orca Improvement Center</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
        <ImprovementCard
          emoji="🏆"
          label="Top Strength"
          title={best ? `${best.phase} phase` : "—"}
          sub={best ? `Win rate: ${best.win_rate?.toFixed(1)}%` : "More data needed"}
          color="#10B981"
        />
        <ImprovementCard
          emoji="⚠️"
          label="Biggest Weakness"
          title={worst ? `${worst.phase} phase` : "—"}
          sub={worst ? `Win rate: ${worst.win_rate?.toFixed(1)}%` : "More data needed"}
          color="#EF4444"
        />
        <ImprovementCard
          emoji="🎯"
          label="OrcaBot Signal"
          title={bestStatus ? `${bestStatus.status} status` : "—"}
          sub={bestStatus ? `${bestStatus.win_rate?.toFixed(1)}% win rate (${bestStatus.trades} trades)` : "—"}
          color="#6366F1"
        />
      </div>
    </div>
  );
}

function ImprovementCard({ emoji, label, title, sub, color }: {
  emoji: string; label: string; title: string; sub: string; color: string;
}) {
  return (
    <div style={{ background: "#0B0F19", borderRadius: "10px", padding: "14px", border: "1px solid #1E293B", textAlign: "center" }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{emoji}</div>
      <div style={{ color: "#64748B", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</div>
      <div style={{ color, fontSize: "13px", fontWeight: 600, marginBottom: "2px" }}>{title}</div>
      <div style={{ color: "#475569", fontSize: "11px" }}>{sub}</div>
    </div>
  );
}

// ── Recent trades ─────────────────────────────────────────────────────────────

function RecentTrades() {
  const { data } = useJournalTrades({ pageSize: 8 });
  const trades = data?.trades ?? [];

  return (
    <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>Recent Trades</span>
        {data && data.total > 8 && (
          <span style={{ color: "#6366F1", fontSize: "12px" }}>{data.total} total</span>
        )}
      </div>

      {trades.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#334155", fontSize: "13px" }}>No trades yet</div>
      ) : (
        <>
          {/* Header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 65px 70px 80px 60px 55px 90px 110px 1fr",
            padding: "8px 20px", gap: "8px",
          }}>
            {["DATE", "MARKET", "DIR", "RESULT", "PNL", "R:R", "SCORE", "STATUS", "PHASE", "NOTES"].map((h) => (
              <div key={h} style={{ color: "#334155", fontSize: "10px", fontWeight: 600, letterSpacing: "0.05em" }}>{h}</div>
            ))}
          </div>
          {trades.map((t) => <RecentTradeRow key={t.id} trade={t} />)}
        </>
      )}
    </div>
  );
}

function RecentTradeRow({ trade }: { trade: Trade }) {
  const pnl = trade.pnl != null ? parseFloat(trade.pnl) : null;
  const rr  = trade.rr  != null ? parseFloat(trade.rr)  : null;
  const isWin = pnl != null && pnl > 0;
  const isLoss = pnl != null && pnl < 0;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "90px 1fr 65px 70px 80px 60px 55px 90px 110px 1fr",
      padding: "10px 20px", gap: "8px", borderTop: "1px solid #0F1822",
      alignItems: "center",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#0F1822")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ color: "#64748B", fontSize: "12px" }}>{trade.trade_date}</div>
      <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{trade.market}</div>
      <span style={{
        display: "inline-block", fontSize: "11px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
        background: trade.direction === "LONG" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
        color: trade.direction === "LONG" ? "#10B981" : "#EF4444",
      }}>{trade.direction}</span>
      <span style={{
        display: "inline-block", fontSize: "11px", fontWeight: 600, padding: "2px 6px", borderRadius: "4px",
        background: isWin ? "rgba(16,185,129,0.1)" : isLoss ? "rgba(239,68,68,0.1)" : "transparent",
        color: isWin ? "#10B981" : isLoss ? "#EF4444" : "#64748B",
      }}>
        {isWin ? "WIN" : isLoss ? "LOSS" : "—"}
      </span>
      <div style={{ color: pnl != null ? pnlColor(pnl) : "#64748B", fontSize: "13px", fontWeight: 600 }}>
        {pnl != null ? (pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`) : "—"}
      </div>
      <div style={{ color: "#94A3B8", fontSize: "12px" }}>{rr != null ? `${rr.toFixed(2)}R` : "—"}</div>
      <div>
        {trade.orca_score != null ? (
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "34px", height: "20px", borderRadius: "5px", fontSize: "11px", fontWeight: 700,
            background: trade.orca_score >= 70 ? "#10B98120" : trade.orca_score >= 50 ? "#F59E0B20" : "#64748B20",
            color: trade.orca_score >= 70 ? "#10B981" : trade.orca_score >= 50 ? "#F59E0B" : "#64748B",
          }}>{trade.orca_score}</span>
        ) : <span style={{ color: "#334155", fontSize: "12px" }}>—</span>}
      </div>
      <div>
        {trade.orca_status ? (
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px",
            background: trade.orca_status === "ON" ? "#10B98118" : trade.orca_status === "WATCH" ? "#F59E0B18" : "#64748B18",
            color: trade.orca_status === "ON" ? "#10B981" : trade.orca_status === "WATCH" ? "#F59E0B" : "#64748B",
          }}>{trade.orca_status}</span>
        ) : <span style={{ color: "#334155", fontSize: "12px" }}>—</span>}
      </div>
      <div style={{ color: "#64748B", fontSize: "12px" }}>{trade.market_phase ?? "—"}</div>
      <div style={{ color: "#475569", fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {trade.notes ?? ""}
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

interface Props { onLogTrade: () => void; }

export default function JournalDashboardView({ onLogTrade }: Props) {
  const { data: stats, isLoading } = useJournalStats();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0 }}>Dashboard</h1>
          <p style={{ color: "#64748B", fontSize: "13px", margin: "2px 0 0" }}>Your trading overview</p>
        </div>
        <button
          onClick={onLogTrade}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
            border: "none", borderRadius: "10px", padding: "10px 18px",
            color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer",
          }}
        >
          + Log Trade
        </button>
      </div>

      {/* Stats row */}
      {isLoading ? (
        <div style={{ color: "#475569", fontSize: "13px" }}>Loading…</div>
      ) : stats && stats.total_trades > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
          <StatCard label="Total PnL" value={fmt(stats.total_pnl)} sub={`${stats.closed_trades} closed trades`}
            color={pnlColor(stats.total_pnl)} icon={stats.total_pnl >= 0 ? TrendingUp : TrendingDown} />
          <StatCard label="Win Rate" value={`${stats.win_rate.toFixed(1)}%`}
            sub={`${stats.winning_trades}W / ${stats.losing_trades}L`}
            color={stats.win_rate >= 50 ? "#10B981" : "#EF4444"} icon={Target} />
          <StatCard label="Profit Factor"
            value={stats.profit_factor != null ? stats.profit_factor.toFixed(2) : "—"}
            color={stats.profit_factor != null && stats.profit_factor >= 1.5 ? "#10B981" : undefined}
            icon={BarChart2} />
          <StatCard label="Avg R:R"
            value={stats.avg_rr != null ? `${stats.avg_rr.toFixed(2)}R` : "—"}
            icon={Award} />
          <StatCard label="Total Trades" value={String(stats.total_trades)}
            sub={`${stats.open_trades} open`} icon={BarChart2} />
          {stats.avg_confidence != null && (
            <StatCard label="Avg Confidence" value={`${stats.avg_confidence.toFixed(1)}/10`} icon={Brain} />
          )}
        </div>
      ) : (
        <EmptyState onLogTrade={onLogTrade} />
      )}

      {/* Charts row */}
      {stats && stats.total_trades > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
          <EquityCurve />
          <PnlDistribution />
        </div>
      )}

      {/* Orca Improvement Center */}
      {stats && stats.total_trades > 0 && <OrcaImprovementWidget />}

      {/* Recent trades */}
      {stats && stats.total_trades > 0 && <RecentTrades />}
    </div>
  );
}

function EmptyState({ onLogTrade }: { onLogTrade: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "56px", marginBottom: "16px" }}>📓</div>
      <div style={{ color: "white", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>Welcome to OrcaJournal</div>
      <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
        Start logging your trades to track performance, identify patterns, and become a more consistent trader.
      </div>
      <button onClick={onLogTrade} style={{
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        border: "none", borderRadius: "10px", padding: "12px 24px",
        color: "white", fontSize: "15px", fontWeight: 600, cursor: "pointer",
      }}>
        Log your first trade
      </button>
    </div>
  );
}
