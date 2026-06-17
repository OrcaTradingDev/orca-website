"use client";

import { useState } from "react";
import { Check, Shield, Zap, BookOpen } from "lucide-react";
import { useCoachingSettings, useUpdateCoachingSettings } from "../hooks/useJournal";

// ── Toggle switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked, onChange, disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      role="switch"
      aria-checked={checked}
      style={{
        width: "48px", height: "26px", borderRadius: "99px",
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "#10B981" : "#1E293B",
        position: "relative", flexShrink: 0, transition: "background 0.2s",
        outline: "none",
      }}
    >
      <span style={{
        position: "absolute", top: "3px",
        left: checked ? "24px" : "3px",
        width: "20px", height: "20px", borderRadius: "50%",
        background: "white", transition: "left 0.2s",
      }} />
    </button>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function JournalSettingsView() {
  const { data: settings, isLoading } = useCoachingSettings();
  const mutation = useUpdateCoachingSettings();
  const [saved, setSaved] = useState(false);

  const toggle = async () => {
    if (!settings) return;
    await mutation.mutateAsync({ journal_coaching_access: !settings.journal_coaching_access });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isOn = settings?.journal_coaching_access ?? false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "680px" }}>
      {/* Page header */}
      <div>
        <h1 style={{ color: "white", fontSize: "22px", fontWeight: 700, margin: 0 }}>Settings</h1>
        <p style={{ color: "#64748B", fontSize: "13px", margin: "2px 0 0" }}>Manage your journal preferences</p>
      </div>

      {/* Coaching access */}
      <div style={{ background: "#14181F", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{
              width: "38px", height: "38px", borderRadius: "9px", flexShrink: 0,
              background: "linear-gradient(135deg, #6366F120 0%, #8B5CF620 100%)",
              border: "1px solid #6366F130",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <BookOpen style={{ width: "18px", height: "18px", color: "#8B5CF6" }} />
            </div>
            <div>
              <div style={{ color: "white", fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>
                Coaching Access
              </div>
              <div style={{ color: "#64748B", fontSize: "13px", lineHeight: 1.6, maxWidth: "440px" }}>
                Allow OrcaTrading staff to review your journal data for educational and coaching purposes.
                Your data is never shared with third parties.
              </div>
            </div>
          </div>
          {isLoading ? (
            <div style={{ width: "48px", height: "26px", background: "#1E293B", borderRadius: "99px" }} />
          ) : (
            <ToggleSwitch checked={isOn} onChange={toggle} disabled={mutation.isPending} />
          )}
        </div>

        {/* Status block */}
        <div style={{
          background: "#0B0F19", borderRadius: "8px", padding: "14px 16px",
          border: "1px solid #1E293B", display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <Shield style={{ width: "15px", height: "15px", color: isOn ? "#10B981" : "#475569", flexShrink: 0, marginTop: "1px" }} />
          <div>
            <div style={{ color: isOn ? "#10B981" : "#64748B", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
              {isOn ? "Access Enabled — Staff can review your:" : "Private Mode — Only you can see your data"}
            </div>
            {isOn && (
              <ul style={{ margin: 0, padding: "0 0 0 16px", color: "#64748B", fontSize: "13px", lineHeight: 1.9 }}>
                <li>Trade History & Analytics</li>
                <li>Performance Statistics</li>
                <li>Psychology Tracking</li>
              </ul>
            )}
          </div>
        </div>

        {isOn && (
          <div style={{
            marginTop: "14px", padding: "12px 16px",
            background: "rgba(99,102,241,0.08)", borderRadius: "8px",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#94A3B8", fontSize: "12px", lineHeight: 1.6,
          }}>
            By enabling this, you confirm: your data will remain confidential, it will never be sold or
            shared with third parties, and access may be revoked at any time.
          </div>
        )}

        {saved && (
          <div style={{
            marginTop: "12px", display: "flex", alignItems: "center", gap: "6px",
            color: "#10B981", fontSize: "13px",
          }}>
            <Check style={{ width: "14px", height: "14px" }} />
            Settings saved
          </div>
        )}
      </div>

      {/* Upcoming integrations preview */}
      <div style={{ background: "#14181F", border: "1px dashed #1E293B", borderRadius: "12px", padding: "24px", opacity: 0.65 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
            background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap style={{ width: "17px", height: "17px", color: "#F59E0B" }} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>cTrader Auto-Sync</span>
              <span style={{
                background: "#1E293B", color: "#64748B", fontSize: "10px", fontWeight: 600,
                padding: "2px 7px", borderRadius: "4px",
              }}>COMING SOON</span>
            </div>
            <div style={{ color: "#64748B", fontSize: "13px", marginTop: "2px" }}>
              Connect your cTrader account to automatically import all trades — no manual entry or CSV export needed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
