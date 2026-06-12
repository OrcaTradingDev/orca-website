"use client";

import { useState, useCallback } from "react";
import JournalSidebar from "./JournalSidebar";
import JournalDashboardView from "./JournalDashboardView";
import JournalTradesView from "./JournalTradesView";
import JournalImportView from "./JournalImportView";
import JournalSettingsView from "./JournalSettingsView";
import { TradeFormModal } from "./TradeFormModal";
import type { Trade } from "../types/journal";
import "../../dashboard/styles/dashboard.css";

export type JournalSection =
  | "dashboard"
  | "trades"
  | "calendar"
  | "analytics"
  | "improvement"
  | "reports"
  | "goals"
  | "psychology"
  | "tags"
  | "import"
  | "integrations"
  | "settings";

export default function JournalApp() {
  const [activeSection, setActiveSection] = useState<JournalSection>("dashboard");
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openLogTrade = useCallback(() => {
    setEditTrade(null);
    setShowTradeForm(true);
  }, []);

  const openEdit = useCallback((trade: Trade) => {
    setEditTrade(trade);
    setShowTradeForm(true);
  }, []);

  const closeForm = useCallback(() => {
    setShowTradeForm(false);
    setEditTrade(null);
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <JournalDashboardView onLogTrade={openLogTrade} />;
      case "trades":
        return <JournalTradesView onEdit={openEdit} onLogTrade={openLogTrade} />;
      case "import":
        return <JournalImportView onImported={() => setActiveSection("trades")} />;
      case "settings":
        return <JournalSettingsView />;
      default:
        return <ComingSoon section={activeSection} />;
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "#0B0F19",
      display: "flex",
      paddingTop: "64px",
    }}>
      <JournalSidebar
        active={activeSection}
        onNavigate={setActiveSection}
        onLogTrade={openLogTrade}
        onCollapse={setSidebarCollapsed}
      />

      <main style={{
        flex: 1,
        marginLeft: sidebarCollapsed ? "64px" : "240px",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        padding: "32px 36px",
        minWidth: 0,
      }}>
        {renderContent()}
      </main>

      {showTradeForm && (
        <TradeFormModal
          initial={editTrade ?? undefined}
          onClose={closeForm}
          onSaved={closeForm}
        />
      )}
    </div>
  );
}

function ComingSoon({ section }: { section: string }) {
  const labels: Record<string, string> = {
    calendar: "Calendar",
    analytics: "Analytics",
    improvement: "Improvement Center",
    reports: "Reports",
    goals: "Goals",
    psychology: "Psychology",
    tags: "Tags & Strategies",
    integrations: "Integrations",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
      <div style={{ color: "white", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>{labels[section] ?? section}</div>
      <div style={{ color: "#64748B", fontSize: "14px" }}>This section is coming in a future phase.</div>
    </div>
  );
}
