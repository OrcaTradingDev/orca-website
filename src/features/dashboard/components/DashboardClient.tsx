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
import AdminSection from "@/features/dashboard/components/AdminSection";
import JournalSection from "@/features/journal/components/JournalSection";
import { useAuthStore } from "@/store/auth-store";

function ScreenerAccessGate() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-5xl mb-6">🔒</div>
      <h2 className="text-2xl font-bold text-white mb-3">Screener Access Required</h2>
      <p className="text-[#94A3B8] max-w-md mb-8 leading-relaxed">
        The OrcaTrading Flowscreener is available to approved users. Reach out to get access.
      </p>
      <a
        href="mailto:support@tradewithorca.com"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00D4FF] text-black font-semibold hover:bg-[#00B8E6] transition-colors"
      >
        Request Access
      </a>
    </div>
  );
}

const SECTIONS: Record<string, React.ReactNode> = {
  journal: <JournalSection />,
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
  const user = useAuthStore((s) => s.user);
  const hasScreenerAccess = user?.screenerAccess ?? false;
  const isAdmin = user?.isAdmin ?? false;

  const renderSection = () => {
    if (activeSection === "admin") {
      return isAdmin ? <AdminSection /> : null;
    }
    if (activeSection === "screener") {
      return <PremiumScreenerSection />;
    }
    return SECTIONS[activeSection] ?? <ScreenerAccessGate />;
  };

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
          {renderSection()}
        </div>
      </main>
    </div>
  );
}
