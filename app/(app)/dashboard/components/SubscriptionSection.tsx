import { Check, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

export default function SubscriptionSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white mb-2">Subscription</h1>
        <p className="text-[#94A3B8]">Manage your plan and billing</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-12">
        {/* Free Plan */}
        <div className="bg-[#14181F] border border-[#1E293B] rounded-lg p-6">
          <Badge className="bg-[#94A3B8]/20 text-[#94A3B8] mb-4">Current Plan</Badge>
          <h2 className="text-white mb-2">Free Plan</h2>
          <div className="text-white text-3xl mb-6">$0<span className="text-[#94A3B8] text-lg">/month</span></div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Check className="w-4 h-4" />
              <span>Limited symbols</span>
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Check className="w-4 h-4" />
              <span>Basic timeframes</span>
            </div>
            <div className="flex items-center gap-2 text-[#94A3B8]">
              <Check className="w-4 h-4" />
              <span>Standard support</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#94A3B8]">Saved assets</span>
                <span className="text-white">10/20</span>
              </div>
              <Progress value={50} className="h-2 bg-[#1A1F2E] [&>div]:bg-[#00D4FF]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#94A3B8]">Active alerts</span>
                <span className="text-white">3/5</span>
              </div>
              <Progress value={60} className="h-2 bg-[#1A1F2E] [&>div]:bg-[#00D4FF]" />
            </div>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 border-2 border-[#FFD700] rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/20 rounded-full blur-3xl -mt-10 -mr-10" />
          <Badge className="bg-[#FFD700] text-black mb-4">Upgrade</Badge>
          <h2 className="text-white mb-2">Premium Plan</h2>
          <div className="flex items-baseline gap-2 mb-6">
            <div className="text-white text-3xl">$29<span className="text-[#94A3B8] text-lg">/month</span></div>
            <span className="text-[#94A3B8] text-sm">or $299/year</span>
          </div>
          
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Check className="w-4 h-4" />
              <span className="text-white">Unlimited assets</span>
            </div>
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Check className="w-4 h-4" />
              <span className="text-white">All timeframes</span>
            </div>
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Check className="w-4 h-4" />
              <span className="text-white">Advanced analytics</span>
            </div>
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Check className="w-4 h-4" />
              <span className="text-white">Priority support</span>
            </div>
            <div className="flex items-center gap-2 text-[#FFD700]">
              <Check className="w-4 h-4" />
              <span className="text-white">Custom alerts</span>
            </div>
          </div>

          <Button className="w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFC700] hover:to-[#FF9500] text-black">
            Upgrade Now
          </Button>
        </div>
      </div>

      {/* Billing Section */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-lg p-6">
        <h2 className="text-white mb-6">Billing Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1E293B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1A1F2E] rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#00D4FF]" />
              </div>
              <div>
                <div className="text-white">Payment method</div>
                <div className="text-[#94A3B8] text-sm">Card ending in •••• 4242</div>
              </div>
            </div>
            <Button variant="outline" className="border-[#2D3748] text-[#00D4FF] hover:bg-[#1A1F2E]">
              Update
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[#1E293B]">
            <div>
              <div className="text-white">Next billing date</div>
              <div className="text-[#94A3B8] text-sm">December 1, 2025</div>
            </div>
          </div>
          <div className="py-3">
            <a href="#" className="text-[#00D4FF] hover:underline text-sm">
              View invoices →
            </a>
          </div>
          <div className="pt-4">
            <Button variant="ghost" className="text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10">
              Cancel Subscription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
