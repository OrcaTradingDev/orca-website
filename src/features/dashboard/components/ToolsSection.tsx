import { BarChart3, PieChart, Calendar, Calculator, LineChart, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    id: 1,
    name: "Orca Flowscreener",
    description:
      "Real-time multi-timeframe scanner with Orca signals, market phase detection, pullback analysis, and ADX/EMA metrics.",
    icon: BarChart3,
    status: "live" as const,
  },
  {
    id: 2,
    name: "Portfolio Tracker",
    description: "Track and analyse your open positions across asset classes with real-time P&L.",
    icon: PieChart,
    status: "soon" as const,
  },
  {
    id: 3,
    name: "Economic Calendar",
    description: "Stay ahead of high-impact events — central bank decisions, NFP, CPI, and more.",
    icon: Calendar,
    status: "soon" as const,
  },
  {
    id: 4,
    name: "Risk Calculator",
    description: "Calculate precise position sizes, risk-reward ratios, and optimal stop levels.",
    icon: Calculator,
    status: "soon" as const,
  },
  {
    id: 5,
    name: "Strategy Backtester",
    description: "Test Orca signal strategies against historical multi-timeframe data.",
    icon: LineChart,
    status: "dev" as const,
  },
] as const;

const STATUS_MAP = {
  live: { label: "Live",        cls: "bg-[#10B981]/20 text-[#10B981] border-0" },
  soon: { label: "Coming Soon", cls: "bg-[#FFD700]/20 text-[#FFD700] border-0" },
  dev:  { label: "In Dev",      cls: "bg-[#00D4FF]/20 text-[#00D4FF] border-0" },
} as const;

export default function ToolsSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Tools & Features</h1>
        <p className="text-[#94A3B8]">Your full OrcaTrading toolkit</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon   = tool.icon;
          const s      = STATUS_MAP[tool.status];
          const isLive = tool.status === "live";

          return (
            <div
              key={tool.id}
              className={`bg-[#14181F] border rounded-xl p-6 flex flex-col transition-all ${
                isLive
                  ? "border-[#00D4FF]/30 hover:border-[#00D4FF] hover:shadow-[0_0_24px_rgba(0,212,255,0.12)] cursor-pointer"
                  : "border-[#1E293B] opacity-60"
              }`}
            >
              {/* Icon + badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-lg flex items-center justify-center ${
                    isLive ? "bg-[#00D4FF]/10" : "bg-[#1A1F2E]"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isLive ? "text-[#00D4FF]" : "text-[#64748B]"}`} />
                </div>
                <Badge className={s.cls}>{s.label}</Badge>
              </div>

              {/* Text */}
              <h3 className="text-white font-semibold mb-1.5">{tool.name}</h3>
              <p className="text-[#64748B] text-sm flex-1 mb-4 leading-relaxed">{tool.description}</p>

              {/* CTA */}
              {isLive ? (
                <div className="flex items-center gap-1.5 text-[#00D4FF] text-sm font-semibold">
                  Open in Screener <ArrowRight className="w-4 h-4" />
                </div>
              ) : (
                <div className="text-[#2D3748] text-sm">Available soon →</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
