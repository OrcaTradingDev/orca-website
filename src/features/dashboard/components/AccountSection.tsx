"use client";

import { useState, useEffect } from "react";
import { Mail, Shield, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const LOCAL_KEY = "orca_account_prefs";

interface LocalPrefs {
  emailNotifications: boolean;
  browserNotifications: boolean;
  timezone: string;
}

const DEFAULT_LOCAL: LocalPrefs = {
  emailNotifications: true,
  browserNotifications: false,
  timezone: "utc",
};

function loadLocal(): LocalPrefs {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...DEFAULT_LOCAL, ...JSON.parse(raw) } : DEFAULT_LOCAL;
  } catch {
    return DEFAULT_LOCAL;
  }
}

export default function AccountSection() {
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [local, setLocal]             = useState<LocalPrefs>(DEFAULT_LOCAL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => { setLocal(loadLocal()); }, []);

  const setL = <K extends keyof LocalPrefs>(key: K, value: LocalPrefs[K]) =>
    setLocal((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    setSaving(true);
    setError(null);
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Failed to save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "??";

  const tier = user?.isAdmin
    ? { label: "Admin",   color: "text-[#A78BFA]" }
    : user?.screenerAccess
    ? { label: "Premium", color: "text-[#00D4FF]" }
    : { label: "Free",    color: "text-[#64748B]" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Account</h1>
        <p className="text-[#94A3B8]">Manage your profile and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <div className="flex items-center gap-5 pb-5 mb-5 border-b border-[#1E293B]">
          <Avatar className="w-16 h-16 shrink-0">
            {user?.picture && <AvatarImage src={user.picture} alt={user?.name ?? ""} />}
            <AvatarFallback className="bg-gradient-to-br from-[#00D4FF] to-[#0EA5E9] text-white font-bold text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-white font-semibold text-lg leading-tight">
              {user?.name ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 text-[#94A3B8] text-sm mt-1">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {user?.email ?? "—"}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Shield className="w-3.5 h-3.5 text-[#00D4FF]" />
              <span className={`text-xs font-semibold ${tier.color}`}>{tier.label}</span>
              <span className="text-[#64748B] text-xs">· Google account</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[#64748B] text-xs mb-1">Account ID</div>
            <div className="text-white font-mono text-xs truncate">
              {user?.id ? `${user.id.slice(0, 20)}…` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[#64748B] text-xs mb-1">Screener Access</div>
            <div className={user?.screenerAccess ? "text-[#10B981] font-medium" : "text-[#64748B]"}>
              {user?.screenerAccess ? "✓ Enabled" : "Not enabled"}
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-[#00D4FF]" />
          <h2 className="text-white font-semibold">Preferences</h2>
        </div>
        <div className="space-y-5 max-w-sm">
          <div className="grid gap-2">
            <Label className="text-[#94A3B8] text-sm">Timezone</Label>
            <Select value={local.timezone} onValueChange={(v) => setL("timezone", v)}>
              <SelectTrigger className="bg-[#1A1F2E] border-[#2D3748] text-white focus:border-[#00D4FF]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1F2E] border-[#2D3748] text-white">
                <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                <SelectItem value="est">EST (GMT−5)</SelectItem>
                <SelectItem value="cst">CST (GMT−6)</SelectItem>
                <SelectItem value="pst">PST (GMT−8)</SelectItem>
                <SelectItem value="cet">CET (GMT+1)</SelectItem>
                <SelectItem value="gmt8">SGT/HKT (GMT+8)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Email notifications</Label>
              <p className="text-[#64748B] text-xs mt-0.5">Alerts sent to your registered email</p>
            </div>
            <Switch
              className="data-[state=checked]:bg-[#00D4FF]"
              checked={local.emailNotifications}
              onCheckedChange={(v) => setL("emailNotifications", v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Browser notifications</Label>
              <p className="text-[#64748B] text-xs mt-0.5">Push notifications in this browser</p>
            </div>
            <Switch
              className="data-[state=checked]:bg-[#00D4FF]"
              checked={local.browserNotifications}
              onCheckedChange={(v) => setL("browserNotifications", v)}
            />
          </div>
        </div>
        {error && <p className="mt-4 text-[#EF4444] text-sm">{error}</p>}
        <Button
          className="mt-6 bg-[#00D4FF] hover:bg-[#00B8E6] text-black font-semibold px-6"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : saved ? "Saved" : "Save Preferences"}
        </Button>
      </div>

      {/* Sign out */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="text-white font-medium">Sign out</div>
          <div className="text-[#64748B] text-sm mt-0.5">You&apos;ll be redirected to the login page</div>
        </div>
        <Button
          variant="outline"
          className="border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
