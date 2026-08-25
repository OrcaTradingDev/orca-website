"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  email: string;
  name: string | null;
  picture: string | null;
  screener_access: boolean;
  created_at: string | null;
}

interface ScreenerConfig {
  // OrcaBot Score
  score_multiplier: number;
  adx_factor_base: number;
  adx_factor_range: number;
  adx_factor_cap: number;
  ema_alignment_bonus: number;
  // Status thresholds
  on_long_daily_min: number;
  on_short_daily_max: number;
  on_adx_min: number;
  on_long_intraday_min: number;
  on_short_intraday_max: number;
  watch_long_daily_min: number;
  watch_short_daily_max: number;
  // Market Phase
  phase_low_adx_max: number;
  phase_strong_adx_min: number;
  phase_exhaustion_adx_min: number;
  phase_divergence_min: number;
  phase_pullback_bull_min: number;
  phase_pullback_bear_max: number;
  // Pullback types
  pullback_deep_intraday_max: number;
  pullback_healthy_divergence_min: number;
  pullback_failed_intraday_min: number;
}

const DEFAULT_CONFIG: ScreenerConfig = {
  score_multiplier: 4.0,
  adx_factor_base: 0.8,
  adx_factor_range: 0.4,
  adx_factor_cap: 50,
  ema_alignment_bonus: 5.0,
  on_long_daily_min: 60,
  on_short_daily_max: 40,
  on_adx_min: 25,
  on_long_intraday_min: 50,
  on_short_intraday_max: 50,
  watch_long_daily_min: 55,
  watch_short_daily_max: 45,
  phase_low_adx_max: 20,
  phase_strong_adx_min: 25,
  phase_exhaustion_adx_min: 35,
  phase_divergence_min: 20,
  phase_pullback_bull_min: 60,
  phase_pullback_bear_max: 40,
  pullback_deep_intraday_max: 30,
  pullback_healthy_divergence_min: 30,
  pullback_failed_intraday_min: 60,
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// ─── Live score/signal preview (runs entirely in TypeScript) ─────────────────

function computePreview(
  daily: number, intraday: number, longterm: number,
  adx: number, ema: boolean, cfg: ScreenerConfig
) {
  // Score
  const weighted = intraday * 0.30 + daily * 0.50 + longterm * 0.20;
  const deviation = Math.abs(weighted - 50);
  const adxNorm = Math.min(adx, cfg.adx_factor_cap) / cfg.adx_factor_cap;
  const adxFactor = cfg.adx_factor_base + adxNorm * cfg.adx_factor_range;
  let score = deviation * cfg.score_multiplier * adxFactor;
  if (ema) score += cfg.ema_alignment_bonus;
  const orcaScore = Math.max(0, Math.min(100, Math.round(score)));

  // Status
  const strongBull = daily >= cfg.on_long_daily_min && adx >= cfg.on_adx_min && ema;
  const strongBear = daily <= cfg.on_short_daily_max && adx >= cfg.on_adx_min && ema;
  let status = "OFF", direction = "FLAT";
  if (strongBull && intraday >= cfg.on_long_intraday_min)  { status = "ON";    direction = "LONG ONLY"; }
  else if (strongBear && intraday <= cfg.on_short_intraday_max) { status = "ON"; direction = "SHORT ONLY"; }
  else if (daily >= cfg.watch_long_daily_min)  { status = "WATCH"; direction = "WATCH LONG"; }
  else if (daily <= cfg.watch_short_daily_max) { status = "WATCH"; direction = "WATCH SHORT"; }

  // Phase
  const divergence = Math.abs(daily - intraday);
  let phase = "Continuation";
  if (adx < cfg.phase_low_adx_max) {
    phase = divergence > cfg.phase_divergence_min ? "Compression" : "Chop";
  } else if (adx >= cfg.phase_strong_adx_min && ema) {
    phase = adx >= cfg.phase_exhaustion_adx_min ? "Exhaustion" : "Healthy Trend";
  } else if (divergence >= cfg.phase_divergence_min) {
    if ((daily >= cfg.phase_pullback_bull_min && intraday < cfg.on_long_intraday_min) ||
        (daily <= cfg.phase_pullback_bear_max && intraday > cfg.on_short_intraday_max)) {
      phase = "Pullback";
    }
  }

  return { orcaScore, status, direction, phase };
}

// ─── Re-usable sub-components ─────────────────────────────────────────────────

function SliderRow({
  label, description, value, min, max, step = 1, onChange,
}: {
  label: string; description: string; value: number;
  min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-white">{label}</span>
          <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
        </div>
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 text-right text-sm font-mono text-[#00D4FF] bg-[#0B0F19] border border-[#1E293B] rounded px-2 py-1 focus:outline-none focus:border-[#00D4FF]"
        />
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#00D4FF] bg-[#1E293B]"
      />
      <div className="flex justify-between text-xs text-[#334155]">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1E293B] flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

// ─── Tab: User Management ─────────────────────────────────────────────────────

function UserManagementTab() {
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setUsers(await res.json());
    } catch { setError("Failed to load users."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleAccess = async (email: string, current: boolean) => {
    setToggling(email);
    try {
      const res = await fetch(
        `${API_BASE}/admin/users/${encodeURIComponent(email)}/screener-access`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ access: !current }),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      setUsers((prev) =>
        prev.map((u) => u.email === email ? { ...u, screener_access: !current } : u)
      );
    } catch { setError(`Failed to update ${email}`); }
    finally { setToggling(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">User Access Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Grant or revoke screener access for users.</p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] text-xs text-[#64748B] uppercase tracking-wider px-6 py-3 border-b border-[#1E293B]">
          <span className="w-10" /><span>User</span>
          <span className="w-32 text-center">Screener Access</span>
          <span className="w-24 text-right">Joined</span>
        </div>
        {loading ? (
          <div className="px-6 py-12 text-center text-[#94A3B8]">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#94A3B8]">No users yet.</div>
        ) : users.map((u) => (
          <div key={u.email}
            className="grid grid-cols-[auto_1fr_auto_auto] items-center px-6 py-4 border-b border-[#1E293B] last:border-0 hover:bg-[#1A1F2E] transition-colors">
            <div className="w-10 mr-4">
              {u.picture ? (
                <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-white text-sm font-bold">
                  {(u.name ?? u.email)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{u.name ?? "—"}</div>
              <div className="text-[#64748B] text-xs">{u.email}</div>
            </div>
            <div className="w-32 flex justify-center">
              <button
                onClick={() => toggleAccess(u.email, u.screener_access)}
                disabled={toggling === u.email}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${u.screener_access ? "bg-[#00D4FF]" : "bg-[#1E293B]"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${u.screener_access ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            <div className="w-24 text-right text-xs text-[#64748B]">
              {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Screener Lab ────────────────────────────────────────────────────────

function ScreenerLabTab() {
  const token = useAuthStore((s) => s.token);
  const [saved, setSaved] = useState<ScreenerConfig>(DEFAULT_CONFIG);
  const [cfg, setCfg]     = useState<ScreenerConfig>(DEFAULT_CONFIG);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [resetting, setResetting] = useState(false);
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);

  // Live preview inputs
  const [prev, setPrev] = useState({ daily: 61, intraday: 60, longterm: 63, adx: 50, ema: true });

  const isDirty = JSON.stringify(cfg) !== JSON.stringify(saved);

  const flash = (msg: string) => {
    setFlashMsg(msg);
    setTimeout(() => setFlashMsg(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/screener-config`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setSaved(data); setCfg(data);
      } catch { setError("Could not load config — showing defaults."); }
      finally { setLoading(false); }
    })();
  }, [token]);

  const set = (key: keyof ScreenerConfig) => (v: number) =>
    setCfg((prev) => ({ ...prev, [key]: v }));

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/screener-config`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setSaved(data); setCfg(data);
      flash("Saved ✓");
    } catch { setError("Save failed."); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    setResetting(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/screener-config/reset`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSaved(DEFAULT_CONFIG); setCfg(DEFAULT_CONFIG);
      flash("Reset to defaults ✓");
    } catch { setError("Reset failed."); }
    finally { setResetting(false); }
  };

  const preview = computePreview(prev.daily, prev.intraday, prev.longterm, prev.adx, prev.ema, cfg);

  const scoreColor = preview.orcaScore >= 70 ? "#10B981"
    : preview.orcaScore >= 50 ? "#F59E0B"
    : preview.orcaScore >= 30 ? "#F97316"
    : "#94A3B8";

  const statusColor = preview.status === "ON" ? "#10B981"
    : preview.status === "WATCH" ? "#F59E0B"
    : "#94A3B8";

  if (loading) return <div className="py-20 text-center text-[#94A3B8]">Loading config…</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Screener Lab</h2>
          <p className="text-[#94A3B8] text-sm mt-1">
            Tune every formula parameter live. Changes take effect on the next screener refresh (within 60 s).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {flashMsg && (
            <span className="text-green-400 text-sm font-medium">{flashMsg}</span>
          )}
          {isDirty && !flashMsg && (
            <span className="text-amber-400 text-sm">Unsaved changes</span>
          )}
          <button
            onClick={handleReset}
            disabled={resetting || saving}
            className="px-4 py-2 text-sm rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] disabled:opacity-40 transition-colors"
          >
            {resetting ? "Resetting…" : "Reset defaults"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-5 py-2 text-sm rounded-lg bg-[#00D4FF] text-black font-semibold hover:bg-[#00B8E6] disabled:opacity-40 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      {/* Live Calculator */}
      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1E293B] flex items-center gap-2">
          <span>⚡</span>
          <h3 className="text-sm font-semibold text-white">Live Score Calculator</h3>
          <span className="text-xs text-[#64748B] ml-1">— adjust inputs below, see output instantly</span>
        </div>
        <div className="p-5 flex flex-wrap gap-8">
          {/* Inputs */}
          <div className="flex-1 min-w-[260px] grid grid-cols-2 gap-4">
            {(["daily","intraday","longterm"] as const).map((k) => (
              <div key={k}>
                <label className="text-xs text-[#64748B] uppercase tracking-wider block mb-1">
                  {k === "daily" ? "Daily 4H %" : k === "intraday" ? "Intraday %" : "Long-term 1D %"}
                </label>
                <input type="range" min={0} max={100} value={prev[k]}
                  onChange={(e) => setPrev(p => ({ ...p, [k]: +e.target.value }))}
                  className="w-full accent-[#00D4FF]" />
                <div className="text-right text-sm font-mono text-[#00D4FF]">{prev[k]}%</div>
              </div>
            ))}
            <div>
              <label className="text-xs text-[#64748B] uppercase tracking-wider block mb-1">ADX</label>
              <input type="range" min={0} max={100} value={prev.adx}
                onChange={(e) => setPrev(p => ({ ...p, adx: +e.target.value }))}
                className="w-full accent-[#00D4FF]" />
              <div className="text-right text-sm font-mono text-[#00D4FF]">{prev.adx}</div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#64748B] uppercase tracking-wider">EMA Aligned</label>
              <button
                onClick={() => setPrev(p => ({ ...p, ema: !p.ema }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${prev.ema ? "bg-[#00D4FF]" : "bg-[#1E293B]"}`}
              >
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${prev.ema ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="flex gap-6 flex-wrap items-center">
            <div className="text-center">
              <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Score</div>
              <div className="text-4xl font-bold font-mono" style={{ color: scoreColor }}>
                {preview.orcaScore}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Status</div>
              <div className="text-xl font-bold" style={{ color: statusColor }}>{preview.status}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Direction</div>
              <div className="text-sm font-semibold text-white">{preview.direction}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Phase</div>
              <div className="text-sm font-semibold text-[#94A3B8]">{preview.phase}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Formula */}
      <SectionCard title="OrcaBot Score Formula" icon="🎯">
        <SliderRow label="Score Multiplier" min={0.5} max={12} step={0.5} value={cfg.score_multiplier}
          description="Scales how much each bull% deviation point contributes to the score (currently 4)"
          onChange={set("score_multiplier")} />
        <SliderRow label="ADX Factor Base" min={0.1} max={1.5} step={0.1} value={cfg.adx_factor_base}
          description="Minimum ADX multiplier applied even when ADX = 0"
          onChange={set("adx_factor_base")} />
        <SliderRow label="ADX Factor Range" min={0.0} max={1.5} step={0.1} value={cfg.adx_factor_range}
          description="Extra multiplier added when ADX hits the cap (max = base + range)"
          onChange={set("adx_factor_range")} />
        <SliderRow label="ADX Factor Cap" min={20} max={100} step={5} value={cfg.adx_factor_cap}
          description="ADX readings above this are treated as equal to the cap"
          onChange={set("adx_factor_cap")} />
        <SliderRow label="EMA Alignment Bonus" min={0} max={25} step={1} value={cfg.ema_alignment_bonus}
          description="Flat score bonus (pts) added when EMA 9 › 21 › 50 or 9 ‹ 21 ‹ 50"
          onChange={set("ema_alignment_bonus")} />
      </SectionCard>

      {/* Status Thresholds */}
      <SectionCard title="Signal Status Thresholds" icon="🚦">
        <SliderRow label="ON LONG — daily_bull ≥" min={51} max={85} value={cfg.on_long_daily_min}
          description="Minimum daily bull% required to consider an ON LONG signal"
          onChange={set("on_long_daily_min")} />
        <SliderRow label="ON SHORT — daily_bull ≤" min={15} max={49} value={cfg.on_short_daily_max}
          description="Maximum daily bull% required to consider an ON SHORT signal"
          onChange={set("on_short_daily_max")} />
        <SliderRow label="ON requires ADX ≥" min={10} max={50} value={cfg.on_adx_min}
          description="Minimum ADX to confirm a trend is strong enough for an ON signal"
          onChange={set("on_adx_min")} />
        <SliderRow label="ON LONG — intraday_bull ≥" min={35} max={65} value={cfg.on_long_intraday_min}
          description="Intraday must be at or above this to confirm the ON LONG (avoids false triggers during pullbacks)"
          onChange={set("on_long_intraday_min")} />
        <SliderRow label="ON SHORT — intraday_bull ≤" min={35} max={65} value={cfg.on_short_intraday_max}
          description="Intraday must be at or below this to confirm ON SHORT"
          onChange={set("on_short_intraday_max")} />
        <SliderRow label="WATCH LONG — daily_bull ≥" min={51} max={75} value={cfg.watch_long_daily_min}
          description="Lower threshold for WATCH LONG (must be less than ON LONG threshold)"
          onChange={set("watch_long_daily_min")} />
        <SliderRow label="WATCH SHORT — daily_bull ≤" min={25} max={49} value={cfg.watch_short_daily_max}
          description="Upper threshold for WATCH SHORT (must be greater than ON SHORT threshold)"
          onChange={set("watch_short_daily_max")} />
      </SectionCard>

      {/* Market Phase */}
      <SectionCard title="Market Phase Thresholds" icon="🌊">
        <SliderRow label="Low ADX ceiling" min={5} max={35} value={cfg.phase_low_adx_max}
          description="ADX below this → Chop or Compression (no confirmed trend)"
          onChange={set("phase_low_adx_max")} />
        <SliderRow label="Strong trend ADX floor" min={15} max={45} value={cfg.phase_strong_adx_min}
          description="ADX at or above this + EMA aligned → Expansion or Healthy Trend"
          onChange={set("phase_strong_adx_min")} />
        <SliderRow label="Exhaustion ADX floor" min={20} max={70} value={cfg.phase_exhaustion_adx_min}
          description="ADX at or above this (in strong zone) → Exhaustion warning"
          onChange={set("phase_exhaustion_adx_min")} />
        <SliderRow label="Divergence min for Pullback" min={5} max={40} value={cfg.phase_divergence_min}
          description="Minimum |daily − intraday| gap to classify a Pullback or Compression"
          onChange={set("phase_divergence_min")} />
        <SliderRow label="Pullback bull threshold" min={51} max={80} value={cfg.phase_pullback_bull_min}
          description="daily_bull must be ≥ this for bullish Pullback classification"
          onChange={set("phase_pullback_bull_min")} />
        <SliderRow label="Pullback bear threshold" min={20} max={49} value={cfg.phase_pullback_bear_max}
          description="daily_bull must be ≤ this for bearish Pullback classification"
          onChange={set("phase_pullback_bear_max")} />
      </SectionCard>

      {/* Pullback Types */}
      <SectionCard title="Pullback Type Thresholds" icon="↩️">
        <SliderRow label="Deep pullback — intraday ≤" min={10} max={45} value={cfg.pullback_deep_intraday_max}
          description="Bull Pullback: intraday below this → Deep (extreme retracement, wait for recovery)"
          onChange={set("pullback_deep_intraday_max")} />
        <SliderRow label="Healthy pullback — divergence ≥" min={10} max={50} value={cfg.pullback_healthy_divergence_min}
          description="Bull Pullback: daily−intraday gap ≥ this → Healthy (textbook entry zone)"
          onChange={set("pullback_healthy_divergence_min")} />
        <SliderRow label="Failed pullback — intraday ≥" min={51} max={80} value={cfg.pullback_failed_intraday_min}
          description="Bear Pullback: intraday surges above this → Failed (counter-trend risk)"
          onChange={set("pullback_failed_intraday_min")} />
      </SectionCard>
    </div>
  );
}

// ─── Member Journals tab ──────────────────────────────────────────────────────

interface SharedMember {
  email: string;
  name: string | null;
  updated_at: string | null;
}

function MemberJournalsTab() {
  const token = useAuthStore((s) => s.token);
  const [members, setMembers] = useState<SharedMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ email: string; name: string | null; data: unknown } | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/admin/member-journals`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setMembers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const openJournal = useCallback(async (email: string, name: string | null) => {
    if (!token) return;
    setViewLoading(true);
    try {
      const r = await fetch(`${API_BASE}/admin/member-journals/${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      setViewing({ email, name, data: j.data });
    } catch {
      /* ignore */
    } finally {
      setViewLoading(false);
    }
  }, [token]);

  if (viewing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewing(null)}
            className="px-3 py-1.5 text-xs rounded border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155] transition-colors"
          >
            ← Back
          </button>
          <span className="text-white font-medium">{viewing.name ?? viewing.email}</span>
          <span className="text-[#64748B] text-sm">{viewing.email}</span>
        </div>
        <MemberJournalViewer data={viewing.data} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#94A3B8] text-sm">
        Members who have opted in to share their journal with you.
      </p>
      {loading ? (
        <p className="text-[#64748B] text-sm">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-[#64748B] text-sm">No members are currently sharing their journal.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.email}
              className="flex items-center justify-between bg-[#0F1520] border border-[#1E293B] rounded-xl px-5 py-4"
            >
              <div>
                <p className="text-white text-sm font-medium">{m.name ?? m.email}</p>
                <p className="text-[#64748B] text-xs mt-0.5">{m.email}</p>
                {m.updated_at && (
                  <p className="text-[#64748B] text-xs mt-0.5">
                    Last synced {new Date(m.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => openJournal(m.email, m.name)}
                disabled={viewLoading}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#00D4FF] text-black hover:bg-[#00B8D9] transition-colors disabled:opacity-50"
              >
                View Journal
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberJournalViewer({ data }: { data: unknown }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const journalSrc = `/otos-journal.html?readOnly=1&apiBase=${encodeURIComponent(API_BASE)}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function onLoad() {
      iframe?.contentWindow?.postMessage({ type: "orca_inject_journal", data }, "*");
    }
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [data]);

  return (
    <iframe
      ref={iframeRef}
      src={journalSrc}
      style={{ display: "block", width: "100%", height: "calc(100vh - 220px)", border: "none", borderRadius: "12px" }}
      title="Member Journal"
    />
  );
}

// ─── Tab: Pod Sharing ─────────────────────────────────────────────────────────

function PodSharingTab() {
  const { token } = useAuthStore();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/admin/pod-sharing`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setEnabled(d.enabled))
      .catch(() => setMsg("Failed to load setting"));
  }, [token]);

  const toggle = async () => {
    if (enabled === null) return;
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch(`${API_BASE}/admin/pod-sharing`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!r.ok) throw new Error(await r.text());
      setEnabled(!enabled);
      setMsg(`Journal sharing ${!enabled ? "enabled" : "disabled"}.`);
    } catch {
      setMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-6 space-y-5 max-w-lg">
      <div>
        <h2 className="text-white font-semibold text-base">Pod Journal Sharing</h2>
        <p className="text-[#64748B] text-sm mt-1">
          When enabled, members see the "Share journal with OrcaTrading" toggle in their journal settings. When disabled, the option is locked and hidden.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${enabled ? "bg-[#00D4FF]" : "bg-[#1E293B]"}`} onClick={toggle}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-7" : "translate-x-1"}`} />
        </div>
        <span className="text-sm text-white">
          {enabled === null ? "Loading…" : enabled ? "Enabled — members can share" : "Disabled — sharing locked"}
        </span>
        {saving && <span className="text-xs text-[#64748B]">Saving…</span>}
      </div>

      {msg && <p className="text-xs text-[#00D4FF]">{msg}</p>}
    </div>
  );
}

// ─── Kronos Admin Tab ────────────────────────────────────────────────────────

function KronosTab() {
  const { token } = useAuthStore();
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const forceRun = async () => {
    setRunning(true);
    setStatus(null);
    try {
      const r = await fetch(`${API_BASE}/admin/force-kronos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      setStatus(d.message ?? (r.ok ? "Started." : "Failed."));
    } catch {
      setStatus("Request failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-[#0B0F19] border border-[#1E293B] rounded-xl p-6 space-y-5 max-w-lg">
      <div>
        <h2 className="text-white font-semibold text-base">Kronos Forecasts</h2>
        <p className="text-[#64748B] text-sm mt-1">
          Force a full Kronos re-run for all symbols (4H + 1D). Clears stored forecasts
          first so the staleness check is bypassed. Runs in the background — takes
          several minutes depending on symbol count.
        </p>
      </div>
      <button
        onClick={forceRun}
        disabled={running}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 hover:bg-[#00D4FF]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {running ? "Triggering…" : "Force Re-run Now"}
      </button>
      {status && <p className="text-xs text-[#94A3B8]">{status}</p>}
    </div>
  );
}


// ─── Main AdminSection ────────────────────────────────────────────────────────

type Tab = "users" | "screener" | "journals" | "pod" | "kronos";

export default function AdminSection() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "users",    label: "User Management", icon: "👥" },
    { id: "screener", label: "Screener Lab",     icon: "⚙️" },
    { id: "journals", label: "Member Journals",  icon: "📓" },
    { id: "pod",      label: "Pod Sharing",      icon: "🔒" },
    { id: "kronos",   label: "Kronos",           icon: "🔮" },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin</h1>
        <p className="text-[#94A3B8] text-sm mt-1">Founder access only.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#14181F] border border-[#1E293B] rounded-xl p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === t.id
                ? "bg-[#0B0F19] text-white shadow"
                : "text-[#64748B] hover:text-[#94A3B8]"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "users"    && <UserManagementTab />}
      {activeTab === "screener" && <ScreenerLabTab />}
      {activeTab === "journals" && <MemberJournalsTab />}
      {activeTab === "pod"      && <PodSharingTab />}
      {activeTab === "kronos"   && <KronosTab />}
    </div>
  );
}
