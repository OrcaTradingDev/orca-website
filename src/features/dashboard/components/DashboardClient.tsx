"use client";

// Pre-compiled Tailwind v4 output — provides all utility classes for dashboard components.
// Plain CSS (not a module) because Tailwind utilities must remain unhashed/global.
import "../styles/dashboard.css";

import { useState } from "react";
import Sidebar from "@/features/dashboard/components/Sidebar";
import PremiumScreenerSection from "@/features/dashboard/components/PremiumScreenerSection";
import WatchlistSection from "@/features/dashboard/components/WatchlistSection";
import SavedAlertsSection from "@/features/dashboard/components/SavedAlertsSection";
import FiltersSettingsSection from "@/features/dashboard/components/FiltersSettingsSection";
import TrendingSection from "@/features/dashboard/components/TrendingSection";
import ToolsSection from "@/features/dashboard/components/ToolsSection";
import BotSection from "@/features/dashboard/components/BotSection";
import AccountSection from "@/features/dashboard/components/AccountSection";
import SubscriptionSection from "@/features/dashboard/components/SubscriptionSection";

const SECTIONS: Record<string, React.ReactNode> = {
  screener: <PremiumScreenerSection />,
  watchlist: <WatchlistSection />,
  alerts: <SavedAlertsSection />,
  filters: <FiltersSettingsSection />,
  trending: <TrendingSection />,
  tools: <ToolsSection />,
  bot: <BotSection />,
  account: <AccountSection />,
  subscription: <SubscriptionSection />,
};

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState("screener");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-[64px]">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <main
        className="p-12 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarCollapsed ? "64px" : "260px" }}
      >
        <div className="max-w-[1400px]">
          {SECTIONS[activeSection] ?? <PremiumScreenerSection />}
        </div>
      </main>
    </div>
  );
}
