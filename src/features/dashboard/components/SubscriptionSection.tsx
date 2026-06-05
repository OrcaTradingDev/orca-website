import { Check, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Subscription</h1>
        <p className="text-[#94A3B8]">Manage your plan and billing</p>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-2 gap-5">
        {/* Free */}
        <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
          <Badge className="bg-[#64748B]/20 text-[#94A3B8] border-0 mb-4">Current Plan</Badge>
          <h2 className="text-white font-semibold text-xl mb-1">Free</h2>
          <div className="text-white text-3xl font-bold mb-6">
            $0<span className="text-[#64748B] text-base font-normal">/month</span>
          </div>
          <div className="space-y-3 mb-6">
            {[
              "Access to OrcaBot screener",
              "Up to 5 watchlist assets",
              "Up to 3 saved alerts",
              "Standard refresh rate",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-[#94A3B8] text-sm">
                <Check className="w-4 h-4 text-[#64748B] shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="h-px bg-[#1E293B] mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Watchlist assets</span>
              <span className="text-white">0 / 5</span>
            </div>
            <div className="h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden">
              <div className="h-full bg-[#64748B] rounded-full" style={{ width: "0%" }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#64748B]">Active alerts</span>
              <span className="text-white">0 / 3</span>
            </div>
            <div className="h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden">
              <div className="h-full bg-[#64748B] rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Premium */}
        <div className="relative bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/5 border-2 border-[#FFD700]/60 rounded-xl p-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFD700]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <Badge className="bg-[#FFD700] text-black font-semibold border-0 mb-4">Upgrade</Badge>
            <h2 className="text-white font-semibold text-xl mb-1">Premium</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-white text-3xl font-bold">$29</span>
              <span className="text-[#94A3B8] text-base">/month</span>
              <span className="text-[#64748B] text-sm">or $249/year</span>
            </div>
            <div className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Unlimited watchlist assets",
                "Unlimited saved alerts",
                "Priority data refresh",
                "Advanced ADX & EMA metrics",
                "OrcaBot signal history",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-[#FFD700] shrink-0" />
                  <span className="text-white">{f}</span>
                </div>
              ))}
            </div>
            <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF9500] text-black font-bold">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Billing</h2>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-4 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A1F2E] rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Payment method</div>
                <div className="text-[#64748B] text-xs mt-0.5">No card on file</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#2D3748] text-[#00D4FF] hover:bg-[#1A1F2E]"
            >
              Add Card
            </Button>
          </div>
          <div className="flex items-center justify-between py-4 border-b border-[#1E293B]">
            <div>
              <div className="text-white text-sm font-medium">Current plan</div>
              <div className="text-[#64748B] text-xs mt-0.5">Free — no billing cycle</div>
            </div>
          </div>
          <div className="pt-4">
            <a
              href="mailto:support@tradewithorca.com"
              className="text-[#00D4FF] text-sm hover:underline"
            >
              Questions about billing? Contact support →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
