import { Bot, Zap, Bell, Code2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROADMAP = [
  {
    icon: Zap,
    label: "Webhook signals",
    desc: "Push OrcaBot ON/WATCH signals to any platform via configurable webhooks.",
    eta: "Q3 2026",
  },
  {
    icon: Bot,
    label: "Broker integration",
    desc: "Connect supported brokers for semi-automated order execution based on signals.",
    eta: "Q4 2026",
  },
  {
    icon: Code2,
    label: "REST API access",
    desc: "Programmatic access to all screener data, OrcaBot signals, and historical scores.",
    eta: "Q4 2026",
  },
  {
    icon: Bell,
    label: "Smart alert engine",
    desc: "Fire alerts on signal transitions, score thresholds, and market phase changes.",
    eta: "Q1 2027",
  },
] as const;

export default function BotSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Bot Integration</h1>
        <p className="text-[#94A3B8]">Automate your workflow with OrcaBot signals</p>
      </div>

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0D1F3C] to-[#14181F] border border-[#1E293B] rounded-xl p-8 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#00D4FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 bg-[#00D4FF]/10 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-[#00D4FF]" />
            </div>
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-0">In Development</Badge>
          </div>
          <h2 className="text-white text-2xl font-bold mb-3">Coming Soon</h2>
          <p className="text-[#94A3B8] max-w-lg leading-relaxed mb-6">
            We&apos;re building automation features that connect OrcaBot signals directly to your
            trading setup — from simple webhooks to full broker integration. No more manual signal
            monitoring.
          </p>
          <Button
            variant="outline"
            className="border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10 hover:border-[#00D4FF]"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </div>
      </div>

      {/* Roadmap */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Roadmap</h2>
        <div className="space-y-0">
          {ROADMAP.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-start gap-4 py-4 ${
                  idx < ROADMAP.length - 1 ? "border-b border-[#1E293B]" : ""
                }`}
              >
                <div className="w-9 h-9 bg-[#1A1F2E] rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#64748B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">{item.label}</div>
                  <div className="text-[#64748B] text-sm mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
                <div className="text-[#64748B] text-xs font-mono shrink-0 mt-1 bg-[#1A1F2E] px-2 py-1 rounded">
                  {item.eta}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Request access CTA */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="text-white font-medium">Early access</div>
          <div className="text-[#64748B] text-sm mt-0.5">
            Interested in beta testing bot features? Get in touch.
          </div>
        </div>
        <a
          href="mailto:support@tradewithorca.com"
          className="inline-flex items-center gap-2 text-[#00D4FF] text-sm font-semibold hover:underline"
        >
          Contact us <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
