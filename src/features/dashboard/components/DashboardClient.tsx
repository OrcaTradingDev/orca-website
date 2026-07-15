"use client";

// Live Tailwind v4 source — @tailwindcss/postcss regenerates this on every build,
// so new utility classes used anywhere in the dashboard always get compiled in.
// (Previously imported a frozen, manually-generated snapshot — dashboard.css —
// that silently stopped picking up new classes after May 25; switched back to
// the live source per dashboard-tw.css's own intended usage.)
// Plain CSS (not a module) because Tailwind utilities must remain unhashed/global.
import "../styles/dashboard-tw.css";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import MobileBottomNav from "@/features/dashboard/components/MobileBottomNav";
import { useAuthStore } from "@/store/auth-store";

const SECTIONS: Record<string, React.ReactNode> = {
  watchlist:    <WatchlistSection />,
  alerts:       <SavedAlertsSection />,
  filters:      <FiltersSettingsSection />,
  trending:     <TrendingSection />,
  tools:        <ToolsSection />,
  bot:          <BotSection />,
  account:      <AccountSection />,
  subscription: <SubscriptionSection />,
};

// ── Payment-success banner (shown briefly after Stripe redirect) ───────────────

function UpgradingBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)",
        border: "1px solid rgba(99,102,241,0.4)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "8px",
      }}
    >
      {/* spinner */}
      <div
        style={{
          width: "18px", height: "18px",
          border: "2px solid rgba(99,102,241,0.3)",
          borderTopColor: "#6366F1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          flexShrink: 0,
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div>
        <div style={{ color: "#A5B4FC", fontWeight: 600, fontSize: "14px" }}>
          Payment received — activating your Advanced Screener access…
        </div>
        <div style={{ color: "#6366F180", fontSize: "12px", marginTop: "2px" }}>
          This only takes a moment.
        </div>
      </div>
    </div>
  );
}

// ── Shared hook: detects mobile viewport ─────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// ── Free screener layout (no sidebar) ─────────────────────────────────────────

function FreeScreenerLayout() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const refreshAuth  = useAuthStore((s) => s.refreshAuth);
  const hasAccess    = useAuthStore((s) => s.user?.screenerAccess ?? false);

  const [upgrading, setUpgrading] = useState(false);

  // Detect ?upgraded=1 redirect from Stripe and refresh the JWT
  useEffect(() => {
    if (!searchParams.get("upgraded")) return;
    setUpgrading(true);

    const activate = async () => {
      // Give the Stripe webhook ~3 s to arrive and update the DB first
      await new Promise((r) => setTimeout(r, 3000));
      await refreshAuth();
      // Clean the URL regardless of whether it worked
      router.replace("/screener", { scroll: false });
    };

    activate();
  }, [searchParams, refreshAuth, router]);

  // If refresh gave us access, the parent will re-render the full layout
  // (because hasAccess is now true). Nothing else to do here.

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-[64px]">
      <main className="p-3 sm:p-8 md:p-12">
        <div className="max-w-[1400px] mx-auto">
          {upgrading && <UpgradingBanner />}
          <PremiumScreenerSection freeOnly={true} />
        </div>
      </main>
    </div>
  );
}

// ── Full (paid) layout ─────────────────────────────────────────────────────────

function FullScreenerLayout() {
  const [activeSection, setActiveSection] = useState("screener");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAdmin = useAuthStore((s) => s.user?.isAdmin ?? false);
  const isMobile = useIsMobile();

  const renderSection = () => {
    if (activeSection === "admin") {
      return isAdmin ? <AdminSection /> : null;
    }
    if (activeSection === "screener") {
      return <PremiumScreenerSection />;
    }
    return SECTIONS[activeSection] ?? null;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white pt-[64px] pb-[60px] sm:pb-0">
      {/* Sidebar — desktop only */}
      <div className="hidden sm:block">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onCollapsedChange={setIsSidebarCollapsed}
        />
      </div>

      <main
        className="p-3 sm:p-8 md:p-12 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (isSidebarCollapsed ? "64px" : "260px") }}
      >
        <div className="max-w-[1400px]">
          {renderSection()}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={setActiveSection} />
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function DashboardClient() {
  const token             = useAuthStore((s) => s.token);
  const hasScreenerAccess = useAuthStore((s) => s.user?.screenerAccess ?? false);
  const isAdmin           = useAuthStore((s) => s.user?.isAdmin ?? false);
  const refreshAuth       = useAuthStore((s) => s.refreshAuth);

  // screener_access/is_admin are baked into the JWT at login and otherwise
  // sit stale for up to 30 days — an admin flipping someone's access in the
  // admin panel (or a Stripe webhook landing outside the upgraded=1 redirect
  // flow below) has no way to reach an already-logged-in session. Refreshing
  // once per dashboard load closes that gap without polling.
  useEffect(() => {
    if (token) refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Admins always get the full layout regardless of screener_access
  if (hasScreenerAccess || isAdmin) {
    return <FullScreenerLayout />;
  }

  return <FreeScreenerLayout />;
}
