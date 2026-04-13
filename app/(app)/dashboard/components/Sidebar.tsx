"use client";

import { useState, useEffect } from "react";
import {
  Star, Bell, SlidersHorizontal, TrendingUp, Grid, Bot,
  User, Crown, BarChart3, Menu
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuthStore } from "@/app/store/authStore";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ activeSection, onSectionChange, onCollapsedChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (onCollapsedChange) onCollapsedChange(isCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const handleToggle = () => {
    if (!isCollapsed) {
      // Collapsing: fade out expanded header first, then swap
      setHeaderVisible(false);
      setTimeout(() => setIsCollapsed(true), 180);
    } else {
      // Expanding: swap first, then fade in
      setIsCollapsed(false);
      setTimeout(() => setHeaderVisible(true), 50);
    }
  };

  const navItems = [
    { id: "screener", label: "Premium Screener", icon: BarChart3 },
    { id: "watchlist", label: "Watchlist", icon: Star },
    { id: "alerts", label: "Saved Alerts", icon: Bell },
    { id: "filters", label: "Filters & Settings", icon: SlidersHorizontal },
    { id: "trending", label: "Trending Assets", icon: TrendingUp },
    { id: "tools", label: "Tools & Features", icon: Grid },
    { id: "bot", label: "Bot Integration", icon: Bot, badge: "Soon" },
    { id: "account", label: "Account Settings", icon: User },
    { id: "subscription", label: "Subscription", icon: Crown },
  ];

  return (
    <>
      {/* Tooltip styles injected globally */}
      <style>{`
        .sidebar-nav-btn { position: relative; }
        .sidebar-tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1E293B;
          color: #E2E8F0;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.15s;
          z-index: 100;
          border: 1px solid #2D3748;
        }
        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #2D3748;
        }
        .sidebar-nav-btn:hover .sidebar-tooltip { opacity: 1; }
        nav::-webkit-scrollbar { width: 4px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: #2D3748; border-radius: 2px; }
      `}</style>

      <div
        style={{
          width: isCollapsed ? '64px' : '260px',
          height: 'calc(100vh - 64px)',
          backgroundColor: '#14181F',
          borderRight: '1px solid #1E293B',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          left: 0,
          top: '64px',
          transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 40,
          overflow: 'hidden',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ borderBottom: '1px solid #1E293B', flexShrink: 0 }}>

          {/* EXPANDED: logo + subtle inline toggle */}
          {!isCollapsed && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 14px 18px 18px',
                opacity: headerVisible ? 1 : 0,
                transition: 'opacity 0.18s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg, #00C4EE 0%, #0EA5E9 100%)',
                  borderRadius: '8px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <TrendingUp style={{ width: '18px', height: '18px', color: 'white' }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', lineHeight: '1.2' }}>
                    Flowscreener
                  </div>
                  <div style={{ color: '#64748B', fontSize: '12px' }}>by OrcaTrading</div>
                </div>
              </div>

              {/* Subtle toggle — no aggressive cyan fill on hover */}
              <button
                onClick={handleToggle}
                style={{
                  width: '30px', height: '30px',
                  background: 'transparent',
                  border: '1px solid #2D3748',
                  borderRadius: '7px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1E293B';
                  e.currentTarget.style.borderColor = '#3D4758';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = '#2D3748';
                }}
                aria-label="Collapse sidebar"
              >
                <Menu style={{ width: '14px', height: '14px', color: '#94A3B8' }} />
              </button>
            </div>
          )}

          {/* COLLAPSED: toggle IS the icon — same size/shape as logo box */}
          {isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 0' }}>
              <button
                onClick={handleToggle}
                style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg, #00C4EE 0%, #0EA5E9 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.82'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                aria-label="Expand sidebar"
              >
                <Menu style={{ width: '16px', height: '16px', color: 'white' }} />
              </button>
            </div>
          )}
        </div>

        {/* ── NAVIGATION ── */}
        <nav style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '10px 0',
          scrollbarWidth: 'thin', scrollbarColor: '#2D3748 transparent',
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className="sidebar-nav-btn"
                onClick={() => onSectionChange(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  gap: '11px',
                  padding: isCollapsed ? '10px 0' : '10px 16px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  backgroundColor: isActive ? 'rgba(0, 196, 238, 0.08)' : 'transparent',
                  color: isActive ? '#00C4EE' : '#64748B',
                  border: 'none',
                  borderLeft: `3px solid ${isActive ? '#00C4EE' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit', fontSize: '13px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748B';
                  }
                }}
              >
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />

                {!isCollapsed && (
                  <>
                    <span style={{
                      flex: 1, textAlign: 'left', whiteSpace: 'nowrap',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <Badge style={{
                        background: '#0EA5E9', color: 'white',
                        fontSize: '10px', fontWeight: 600,
                        padding: '2px 7px', flexShrink: 0,
                        border: 'none',
                      }}>
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Custom tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="sidebar-tooltip">
                    {item.label}{item.badge ? ` · ${item.badge}` : ''}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── USER PROFILE ── */}
        <div style={{
          padding: '14px 14px',
          borderTop: '1px solid #1E293B',
          display: 'flex', alignItems: 'center',
          gap: '10px', flexShrink: 0, overflow: 'hidden',
        }}>
          <Avatar style={{
            width: '34px', height: '34px', flexShrink: 0,
            border: '2px solid #2D3748',
          }}>
            <AvatarFallback style={{
              background: 'linear-gradient(135deg, #0EA5E9, #00C4EE)',
              color: 'white', fontWeight: 600, fontSize: '13px',
            }}>
              {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </AvatarFallback>
          </Avatar>

          <div style={{
            overflow: 'hidden',
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? '0px' : '180px',
            transition: 'opacity 0.2s, max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{
              color: 'white', fontSize: '13px', fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.name}
            </div>
            <span style={{
              background: 'linear-gradient(90deg, #FFD700, #FFA500)',
              color: '#7a4800', fontSize: '10px', fontWeight: 700,
              padding: '1px 7px', borderRadius: '4px',
              display: 'inline-block', marginTop: '3px',
            }}>
              Premium
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
