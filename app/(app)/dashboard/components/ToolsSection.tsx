import { Search, PieChart, Calendar, Calculator, LineChart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function ToolsSection() {
  const tools = [
    {
      id: 1,
      name: "Advanced Screener",
      description: "Our premium multi-timeframe scanner",
      icon: Search,
      available: true,
      badge: null,
    },
    {
      id: 2,
      name: "Portfolio Tracker",
      description: "Track and analyze your investments",
      icon: PieChart,
      available: false,
      badge: "Coming Soon",
    },
    {
      id: 3,
      name: "Economic Calendar",
      description: "Stay updated with market events",
      icon: Calendar,
      available: false,
      badge: "Coming Soon",
    },
    {
      id: 4,
      name: "Risk Calculator",
      description: "Calculate position sizing and risk",
      icon: Calculator,
      available: false,
      badge: "Coming Soon",
    },
    {
      id: 5,
      name: "Backtesting Tool",
      description: "Test your strategies on historical data",
      icon: LineChart,
      available: false,
      badge: "In Development",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-white mb-2">Tools & Features</h1>
        <p className="text-[#94A3B8]">Explore our trading toolkit</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              className={`bg-[#14181F] border border-[#1E293B] rounded-lg p-6 ${
                tool.available
                  ? "hover:border-[#00D4FF] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:-translate-y-1 cursor-pointer"
                  : "opacity-60"
              } transition-all`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#00D4FF]/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#00D4FF]" />
                </div>
                {tool.badge && (
                  <Badge
                    className={`${
                      tool.badge === "In Development"
                        ? "bg-[#00D4FF]/20 text-[#00D4FF]"
                        : "bg-[#FFD700]/20 text-[#FFD700]"
                    }`}
                  >
                    {tool.badge}
                  </Badge>
                )}
              </div>
              <h3 className="text-white mb-2">{tool.name}</h3>
              <p className="text-[#94A3B8] text-sm mb-4">{tool.description}</p>
              {tool.available ? (
                <Button className="w-full bg-[#00D4FF] hover:bg-[#00B8E6] text-white">
                  Launch
                </Button>
              ) : (
                <Button disabled className="w-full" variant="secondary">
                  Unavailable
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
