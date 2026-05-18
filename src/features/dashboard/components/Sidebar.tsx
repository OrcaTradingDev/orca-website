"use client";

import { useState, useEffect } from "react";
import {
  Star, Bell, SlidersHorizontal, TrendingUp, Grid, Bot,
  User, Crown, BarChart3, Menu,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: "screener",     label: "Premium Screener",  icon: BarChart3 },
  { id: "watchlist",    label: "Watchlist",          icon: Star },
  { id: "alerts",       label: "Saved Alerts",       icon: Bell },
  { id: "filters",      label: "Filters & Settings", icon: SlidersHorizontal },
  { id: "trending",     label: "Trending Assets",    icon: TrendingUp },
  { id: "tools",        label: "Tools & Features",   icon: Grid },
  { id: "bot",          label: "Bot Integration",    icon: Bot,  badge: "Soon" },
  { id: "account",      label: "Account Settings",   icon: User },
  { id: "subscription", label: "Subscription",       icon: Crown },
] as const;

export default function Sidebar({ activeSection, onSectionChange, onCollapsedChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    onCollapsedChange?.(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const handleToggle = () => {
    if (!isCollapsed) {
      setHeaderVisible(false);
      setTimeout(() => setIsCollapsed(true), 180);
    } else {
      setIsCollapsed(false);
      setTimeout(() => setHeaderVisible(true), 50);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <aside
      style={{
        width: isCollapsed ? "64px" : "260px",
        height: "calc(100vh - 64px)",
        backgroundColor: "#14181F",
        borderRight: "1px solid #1E293B",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: "64px",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ borderBottom: "1px solid #1E293B", flexShrink: 0 }}>
        {!isCollapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 14px 20px 18px",
              opacity: headerVisible ? 1 : 0,
              transition: "opacity 0.18s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "linear-gradient(135deg, #00C4EE 0%, #0EA5E9 100%)",
                borderRadius: "8px", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <TrendingUp style={{ width: "18px", height: "18px", color: "white" }} />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 600, fontSize: "14px", lineHeight: "1.2" }}>
                  Flowscreener
                </div>
                <div style={{ color: "#64748B", fontSize: "12px" }}>by OrcaTrading</div>
              </div>
            </div>

            <button
              onClick={handleToggle}
              aria-label="Collapse sidebar"
              className={styles["sidebar-toggle-btn"]}
            >
              <Menu style={{ width: "14px", height: "14px", color: "#94A3B8" }} />
            </button>
          </div>
        )}

        {isCollapsed && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
            <button
              onClick={handleToggle}
              aria-label="Expand sidebar"
              className={styles["sidebar-toggle-icon"]}
            >
              <Menu style={{ width: "16px", height: "16px", color: "white" }} />
            </button>
          </div>
        )}
      </div>

      {/* ── NAVIGATION ── */}
      <nav className={styles["sidebar-nav"]}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              data-active={isActive}
              className={`${styles["sidebar-nav-btn"]}${isActive ? " " + styles["sidebar-nav-btn--active"] : ""}`}
              style={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon style={{ width: "20px", height: "20px", flexShrink: 0 }} />

              {!isCollapsed && (
                <>
                  <span className={styles["sidebar-nav-btn__label"]}>{item.label}</span>
                  {"badge" in item && item.badge && (
                    <Badge className={styles["sidebar-nav-btn__badge"]}>{item.badge}</Badge>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── USER PROFILE ── */}
      <div className={styles["sidebar-user"]}>
        <Avatar className={styles["sidebar-user__avatar"]}>
          <AvatarFallback className={styles["sidebar-user__avatar-fallback"]}>
            {initials}
          </AvatarFallback>
        </Avatar>

        <div
          className={styles["sidebar-user__info"]}
          style={{
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? "0px" : "180px",
          }}
        >
          <div className={styles["sidebar-user__name"]}>{user?.name}</div>
          <span className={styles["sidebar-user__badge"]}>Premium</span>
        </div>
      </div>
    </aside>
  );
}
