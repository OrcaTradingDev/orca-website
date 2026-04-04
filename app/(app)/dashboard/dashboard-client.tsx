// app/(app)/dashboard/dashboard-client.tsx
"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import PremiumScreenerSection from "./components/PremiumScreenerSection";
import WatchlistSection from "./components/WatchlistSection";
import SavedAlertsSection from "./components/SavedAlertsSection";
import FiltersSettingsSection from "./components/FiltersSettingsSection";
import TrendingSection from "./components/TrendingSection";
import ToolsSection from "./components/ToolsSection";
import BotSection from "./components/BotSection";
import AccountSection from "./components/AccountSection";
import SubscriptionSection from "./components/SubscriptionSection";

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState("screener");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "screener":
        return <PremiumScreenerSection />;
      case "watchlist":
        return <WatchlistSection />;
      case "alerts":
        return <SavedAlertsSection />;
      case "filters":
        return <FiltersSettingsSection />;
      case "trending":
        return <TrendingSection />;
      case "tools":
        return <ToolsSection />;
      case "bot":
        return <BotSection />;
      case "account":
        return <AccountSection />;
      case "subscription":
        return <SubscriptionSection />;
      default:
        return <PremiumScreenerSection />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-[64px]">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
      />
      
      <main 
        className="p-12 transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: isSidebarCollapsed ? '80px' : '280px' 
        }}
      >
        <div className="max-w-[1400px]">
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
