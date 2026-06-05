"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useScreenerStore, ALL_ASSET_CLASSES, ALL_TIMEFRAMES } from "@/store/screener-store";

export default function FiltersSettingsSection() {
  const store = useScreenerStore();

  // Local draft state — only committed on Save
  const [selectedClasses,  setSelectedClasses]  = useState<string[]>(store.enabledAssetClasses);
  const [selectedTFs,      setSelectedTFs]      = useState<string[]>(store.enabledTimeframes);
  const [autoRefresh,      setAutoRefresh]      = useState(store.autoRefresh);
  const [refreshInterval,  setRefreshInterval]  = useState([store.refreshInterval]);
  const [emailAlerts,      setEmailAlerts]      = useState(store.emailAlerts);
  const [browserAlerts,    setBrowserAlerts]    = useState(store.browserAlerts);
  const [saved,            setSaved]            = useState(false);

  const toggleClass = (c: string) =>
    setSelectedClasses((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  const toggleTF = (tf: string) =>
    setSelectedTFs((prev) =>
      prev.includes(tf) ? prev.filter((x) => x !== tf) : [...prev, tf]
    );

  const handleSave = () => {
    store.setScreenerSettings({
      enabledAssetClasses: selectedClasses,
      enabledTimeframes:   selectedTFs,
      autoRefresh,
      refreshInterval:     refreshInterval[0],
      emailAlerts,
      browserAlerts,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isDirty =
    JSON.stringify(selectedClasses.slice().sort()) !== JSON.stringify(store.enabledAssetClasses.slice().sort()) ||
    JSON.stringify(selectedTFs.slice().sort())     !== JSON.stringify(store.enabledTimeframes.slice().sort())   ||
    autoRefresh     !== store.autoRefresh     ||
    refreshInterval[0] !== store.refreshInterval ||
    emailAlerts     !== store.emailAlerts     ||
    browserAlerts   !== store.browserAlerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-white text-[32px]">Filters & Settings</h1>
        <p className="text-[#94A3B8]">Customise your screener preferences</p>
      </div>

      {/* Asset classes */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1.5">Asset Classes</h2>
        <p className="text-[#64748B] text-sm mb-5">
          Choose which asset classes appear in the screener table.
        </p>
        <div className="flex gap-2 flex-wrap">
          {ALL_ASSET_CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => toggleClass(c)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedClasses.includes(c)
                  ? "bg-[#00D4FF]/10 border-[#00D4FF]/50 text-[#00D4FF]"
                  : "bg-[#1A1F2E] border-[#2D3748] text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {selectedClasses.length === 0 && (
          <p className="text-[#EF4444] text-xs mt-3">
            At least one asset class must be selected.
          </p>
        )}
      </div>

      {/* Timeframe display */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-1.5">Timeframe Display</h2>
        <p className="text-[#64748B] text-sm mb-5">
          Select which timeframes are visible in the screener columns.
        </p>
        <div className="flex gap-2 flex-wrap">
          {ALL_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => toggleTF(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-mono font-medium border transition-colors ${
                selectedTFs.includes(tf)
                  ? "bg-[#00D4FF]/10 border-[#00D4FF]/50 text-[#00D4FF]"
                  : "bg-[#1A1F2E] border-[#2D3748] text-[#64748B] hover:text-[#94A3B8]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <p className="text-[#475569] text-xs mt-3">
          Controls which timeframe labels are shown in the column headers.
        </p>
      </div>

      {/* Display settings */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Display Settings</h2>
        <div className="space-y-6 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Auto-refresh data</Label>
              <p className="text-[#64748B] text-xs mt-0.5">Keep the screener updated automatically</p>
            </div>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-[#00D4FF]"
            />
          </div>

          {autoRefresh && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-[#94A3B8] text-sm">Refresh interval</Label>
                <span className="text-[#00D4FF] text-sm font-semibold">{refreshInterval[0]}s</span>
              </div>
              <Slider
                value={refreshInterval}
                onValueChange={setRefreshInterval}
                min={30}
                max={300}
                step={30}
                className="[&_[role=slider]]:bg-[#00D4FF] [&_[role=slider]]:border-[#00D4FF]"
              />
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>30s (fastest)</span>
                <span>5 min</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-5">Notifications</h2>
        <div className="space-y-5 max-w-sm">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Email alerts</Label>
              <p className="text-[#64748B] text-xs mt-0.5">Receive alerts at your registered email</p>
            </div>
            <Switch
              checked={emailAlerts}
              onCheckedChange={setEmailAlerts}
              className="data-[state=checked]:bg-[#00D4FF]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-sm">Browser notifications</Label>
              <p className="text-[#64748B] text-xs mt-0.5">Push notifications in this browser</p>
            </div>
            <Switch
              checked={browserAlerts}
              onCheckedChange={setBrowserAlerts}
              className="data-[state=checked]:bg-[#00D4FF]"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={selectedClasses.length === 0}
          className={`px-8 font-semibold transition-all ${
            saved
              ? "bg-[#10B981] hover:bg-[#10B981] text-white"
              : "bg-[#00D4FF] hover:bg-[#00B8E6] text-black"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        {isDirty && !saved && (
          <span className="text-[#F59E0B] text-sm">You have unsaved changes</span>
        )}
      </div>
    </div>
  );
}
