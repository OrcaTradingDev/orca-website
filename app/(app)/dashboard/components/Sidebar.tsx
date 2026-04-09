// app/(app)/dashboard/components/Sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Star, Bell, SlidersHorizontal, TrendingUp, Grid, Bot, 
  User, Crown, BarChart3, Menu, X
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useAuthStore } from "@/app/store/authStore"

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ activeSection, onSectionChange, onCollapsedChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(isCollapsed);
    }
  }, [isCollapsed, onCollapsedChange]);

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
    <div 
      style={{
        width: isCollapsed ? '80px' : '280px',
        height: 'calc(100vh - 64px)',
        backgroundColor: '#14181F',
        borderRight: '1px solid #1E293B',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: '64px',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width',
        zIndex: 40,
      }}
    >
      {/* Professional Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          right: isCollapsed ? '-16px' : '-16px',
          top: '24px',
          zIndex: 50,
          width: '32px',
          height: '32px',
          backgroundColor: '#1E293B',
          border: '2px solid #00D4FF',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#00D4FF';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 212, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1E293B';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <Menu style={{ width: '18px', height: '18px', color: '#00D4FF', transition: 'color 0.2s' }} />
        ) : (
          <X style={{ width: '18px', height: '18px', color: '#00D4FF', transition: 'color 0.2s' }} />
        )}
      </button>

      {/* Logo/Brand */}
      <div 
        style={{
          padding: isCollapsed ? '24px 16px' : '24px',
          borderBottom: '1px solid #1E293B',
          transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: isCollapsed ? '0' : '12px',
          transition: 'gap 0.4s cubic-bezier(0.4, 0, 0.2, 1), justify-content 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #00D4FF 0%, #0EA5E9 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 212, 255, 0.2)',
          }}>
            <TrendingUp style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div style={{
            overflow: 'hidden',
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? '0px' : '200px',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Flowscreener
            </div>
            <div style={{ color: '#94A3B8', fontSize: '14px', whiteSpace: 'nowrap' }}>
              by OrcaTrading
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: '16px',
        paddingBottom: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#2D3748 transparent',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '12px 28px' : '12px 20px',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                color: isActive ? '#00D4FF' : '#94A3B8',
                border: 'none',
                borderLeft: `4px solid ${isActive ? '#00D4FF' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 31, 46, 0.5)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderLeft = '4px solid #2D3748';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.borderLeft = '4px solid transparent';
                }
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon style={{ 
                width: '20px', 
                height: '20px', 
                flexShrink: 0,
                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1,
                opacity: isCollapsed ? 0 : 1,
                maxWidth: isCollapsed ? '0px' : '200px',
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
              }}>
                <span style={{
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}>
                  {item.label}
                </span>
                {item.badge && (
                  <Badge className="bg-[#0EA5E9] text-white text-xs px-2 py-0" style={{
                    flexShrink: 0,
                    fontSize: '11px',
                  }}>
                    {item.badge}
                  </Badge>
                )}
              </div>

              {/* Active indicator line */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(180deg, #00D4FF 0%, #0EA5E9 100%)',
                  boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div style={{
        padding: isCollapsed ? '20px 16px' : '20px',
        borderTop: '1px solid #1E293B',
        transition: 'padding 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          gap: isCollapsed ? '0' : '12px',
          transition: 'gap 0.4s cubic-bezier(0.4, 0, 0.2, 1), justify-content 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <Avatar className="w-10 h-10" style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            border: '2px solid #2D3748',
            transition: 'border-color 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#00D4FF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#2D3748';
          }}
          >
            <AvatarFallback 
              style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #00D4FF 100%)',
                color: 'white',
                fontWeight: 600,
              }}
            >
              {/* Dynamic Initials: Takes first letter of first two words */}
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
            </AvatarFallback>
          </Avatar>
          <div style={{ 
            flex: 1, 
            overflow: 'hidden',
            opacity: isCollapsed ? 0 : 1,
            maxWidth: isCollapsed ? '0px' : '200px',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.1s, max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            <div style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user.name}
            </div>
            <Badge 
              style={{
                background: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)',
                color: 'black',
                fontSize: '11px',
                marginTop: '4px',
                fontWeight: 600,
                border: 'none',
                display: 'inline-block',
              }}
            >
              Premium
            </Badge>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles injected via style tag */}
      <style>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
        nav::-webkit-scrollbar-thumb {
          background-color: #2D3748;
          border-radius: 3px;
          transition: background-color 0.2s;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background-color: #3D4758;
        }
      `}</style>
    </div>
  );
}
