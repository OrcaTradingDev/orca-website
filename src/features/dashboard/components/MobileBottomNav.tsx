"use client";

import { BarChart3, Star, Bell, User, Crown } from "lucide-react";

const MOBILE_NAV = [
  { id: "screener",     label: "Screener",   icon: BarChart3 },
  { id: "watchlist",   label: "Watchlist",  icon: Star      },
  { id: "alerts",      label: "Alerts",     icon: Bell      },
  { id: "account",     label: "Account",    icon: User      },
  { id: "subscription",label: "Plan",       icon: Crown     },
];

interface MobileBottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function MobileBottomNav({ activeSection, onSectionChange }: MobileBottomNavProps) {
  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center"
      style={{
        background: "#14181F",
        borderTop: "1px solid #1E293B",
        height: "60px",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {MOBILE_NAV.map(({ id, label, icon: Icon }) => {
        const active = activeSection === id;
        return (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
            style={{ color: active ? "#00D4FF" : "#64748B" }}
          >
            <Icon style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "10px", fontWeight: active ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
