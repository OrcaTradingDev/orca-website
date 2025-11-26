import { Bot } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function BotSection() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white mb-2">Bot Integration</h1>
        <p className="text-[#94A3B8]">Automate your trading workflow</p>
      </div>

      <div className="flex items-center justify-center min-h-[500px]">
        <div className="max-w-[600px] bg-[#14181F] border border-[#1E293B] rounded-lg p-12 text-center">
          <div className="w-20 h-20 bg-[#00D4FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-[#00D4FF]" />
          </div>
          <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] mb-4">In Development</Badge>
          <h2 className="text-white mb-4">Coming Soon</h2>
          <p className="text-[#94A3B8] mb-8 leading-relaxed">
            We're building powerful bot integration features. Connect your trading bots, 
            automate signals, and execute strategies directly from Flowscreener. Stay tuned 
            for updates on this exciting new capability.
          </p>
          <Button variant="outline" className="border-[#00D4FF] text-[#00D4FF] hover:bg-[#00D4FF] hover:text-white">
            Notify Me
          </Button>
        </div>
      </div>
    </div>
  );
}
