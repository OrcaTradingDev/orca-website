import { Star, Bell, SlidersHorizontal, TrendingUp, Grid, Bot, User, Crown, BarChart3 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const navItems = [
    { id: "screener", label: "Premium Screener", icon: BarChart3 },
    { id: "watchlist", label: "Watchlist", icon: Star },
    { id: "alerts", label: "Saved Alerts", icon: Bell },
    { id: "filters", label: "Filters & Settings", icon: SlidersHorizontal },
    { id: "trending", label: "Trending Assets", icon: TrendingUp },
    { id: "tools", label: "Tools & Features", icon: Grid },
    { id: "bot", label: "Bot Integration", icon: Bot, badge: "Coming Soon" },
    { id: "account", label: "Account Settings", icon: User },
    { id: "subscription", label: "Subscription", icon: Crown },
  ];

  return (
    <div className="w-[280px] h-[calc(100vh-64px)] bg-[#14181F] border-r border-[#1E293B] flex flex-col fixed left-0 top-[64px]">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00D4FF] to-[#0EA5E9] rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">Flowscreener</div>
            <div className="text-[#94A3B8] text-sm">by OrcaTrading</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-5 py-3 transition-all duration-200
                ${isActive 
                  ? "text-[#00D4FF] bg-[#1A1F2E] border-l-4 border-[#00D4FF]" 
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1A1F2E] border-l-4 border-transparent"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="bg-[#0EA5E9] text-white text-xs px-2 py-0">
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-5 border-t border-[#1E293B]">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-[#0EA5E9] text-white">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="text-white text-sm">John Doe</div>
            <Badge className="bg-[#FFD700] text-black text-xs mt-1">Premium</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}