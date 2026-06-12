"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard, List, Calendar, BarChart2, Trophy,
  FileText, Target, Brain, Tag, Upload, Link, Settings,
  Menu, Plus, BookOpen,
} from "lucide-react";
import type { JournalSection } from "./JournalApp";

interface NavItem {
  id: JournalSection;
  label: string;
  icon: React.ElementType;
  soon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",   label: "Dashboard",         icon: LayoutDashboard },
  { id: "trades",      label: "Trades",             icon: List },
  { id: "calendar",    label: "Calendar",           icon: Calendar,  soon: true },
  { id: "analytics",   label: "Analytics",          icon: BarChart2, soon: true },
  { id: "improvement", label: "Improvement Center", icon: Trophy,    soon: true },
  { id: "reports",     label: "Reports",            icon: FileText,  soon: true },
  { id: "goals",       label: "Goals",              icon: Target,    soon: true },
  { id: "psychology",  label: "Psychology",         icon: Brain,     soon: true },
  { id: "tags",        label: "Tags & Strategies",  icon: Tag,       soon: true },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: "import",       label: "Import Trades",  icon: Upload },
  { id: "integrations", label: "Integrations",   icon: Link,     soon: true },
  { id: "settings",     label: "Settings",       icon: Settings },
];

interface Props {
  active: JournalSection;
  onNavigate: (s: JournalSection) => void;
  onLogTrade: () => void;
  onCollapse: (c: boolean) => void;
}

export default function JournalSidebar({ active, onNavigate, onLogTrade, onCollapse }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => { onCollapse(collapsed); }, [collapsed, onCollapse]);

  const toggle = () => {
    if (!collapsed) {
      setHeaderVisible(false);
      setTimeout(() => setCollapsed(true), 150);
    } else {
      setCollapsed(false);
      setTimeout(() => setHeaderVisible(true), 50);
    }
  };

  const W = collapsed ? "64px" : "240px";

  return (
    <aside style={{
      position: "fixed", top: "64px", left: 0, bottom: 0,
      width: W, background: "#14181F", borderRight: "1px solid #1E293B",
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      zIndex: 40, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1E293B", flexShrink: 0 }}>
        {!collapsed ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 14px 18px 16px",
            opacity: headerVisible ? 1 : 0, transition: "opacity 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "34px", height: "34px", flexShrink: 0,
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BookOpen style={{ width: "17px", height: "17px", color: "white" }} />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: "1.2" }}>OrcaJournal</div>
                <div style={{ color: "#475569", fontSize: "11px" }}>Trader Development</div>
              </div>
            </div>
            <button onClick={toggle} style={toggleBtnStyle}>
              <Menu style={{ width: "14px", height: "14px", color: "#94A3B8" }} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 0" }}>
            <button onClick={toggle} style={toggleBtnStyle}>
              <Menu style={{ width: "16px", height: "16px", color: "white" }} />
            </button>
          </div>
        )}
      </div>

      {/* Log Trade button */}
      {!collapsed && (
        <div style={{ padding: "12px 12px 4px" }}>
          <button
            onClick={onLogTrade}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
              gap: "6px", padding: "9px",
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
              border: "none", borderRadius: "8px",
              color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}
          >
            <Plus style={{ width: "14px", height: "14px" }} />
            Log Trade
          </button>
        </div>
      )}

      {/* Main nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {NAV_ITEMS.map((item) => (
          <NavBtn
            key={item.id}
            item={item}
            isActive={active === item.id}
            collapsed={collapsed}
            onClick={() => !item.soon && onNavigate(item.id)}
          />
        ))}
      </nav>

      {/* Bottom nav */}
      <div style={{ borderTop: "1px solid #1E293B", padding: "8px 0" }}>
        {BOTTOM_ITEMS.map((item) => (
          <NavBtn
            key={item.id}
            item={item}
            isActive={active === item.id}
            collapsed={collapsed}
            onClick={() => !item.soon && onNavigate(item.id)}
          />
        ))}
      </div>
    </aside>
  );
}

function NavBtn({ item, isActive, collapsed, onClick }: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        width: "100%", display: "flex", alignItems: "center",
        gap: "10px", padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
        border: "none",
        borderLeft: isActive ? "2px solid #6366F1" : "2px solid transparent",
        cursor: item.soon ? "default" : "pointer",
        color: isActive ? "#A5B4FC" : item.soon ? "#334155" : "#64748B",
        fontSize: "13px", fontWeight: isActive ? 600 : 400,
        transition: "all 0.12s",
        textAlign: "left",
      }}
    >
      <Icon style={{ width: "17px", height: "17px", flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.soon && (
            <span style={{
              fontSize: "9px", fontWeight: 600, padding: "1px 5px",
              background: "#1E293B", color: "#475569", borderRadius: "3px",
            }}>SOON</span>
          )}
        </>
      )}
    </button>
  );
}

const toggleBtnStyle: React.CSSProperties = {
  background: "transparent", border: "none", cursor: "pointer",
  padding: "4px", borderRadius: "6px", display: "flex", alignItems: "center",
};
