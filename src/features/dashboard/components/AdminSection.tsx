"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth-store";

interface UserRow {
  email: string;
  name: string | null;
  picture: string | null;
  screener_access: boolean;
  created_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AdminSection() {
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setUsers(await res.json());
    } catch (e) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleAccess = async (email: string, current: boolean) => {
    setToggling(email);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${encodeURIComponent(email)}/screener-access`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access: !current }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setUsers((prev) =>
        prev.map((u) => u.email === email ? { ...u, screener_access: !current } : u)
      );
    } catch {
      setError(`Failed to update access for ${email}`);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">User Access Management</h2>
        <p className="text-[#94A3B8] mt-1">Grant or revoke screener access for users.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="bg-[#14181F] border border-[#1E293B] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-xs text-[#64748B] uppercase tracking-wider px-6 py-3 border-b border-[#1E293B]">
          <span className="w-10" />
          <span>User</span>
          <span className="w-32 text-center">Screener Access</span>
          <span className="w-24 text-right">Joined</span>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-[#94A3B8]">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center text-[#94A3B8]">No users yet.</div>
        ) : (
          users.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-6 py-4 border-b border-[#1E293B] last:border-0 hover:bg-[#1A1F2E] transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 mr-4">
                {u.picture ? (
                  <img src={u.picture} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-white text-sm font-bold">
                    {(u.name ?? u.email)[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name + email */}
              <div>
                <div className="text-white text-sm font-medium">{u.name ?? "—"}</div>
                <div className="text-[#64748B] text-xs">{u.email}</div>
              </div>

              {/* Toggle */}
              <div className="w-32 flex justify-center">
                <button
                  onClick={() => toggleAccess(u.email, u.screener_access)}
                  disabled={toggling === u.email}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                    u.screener_access ? "bg-[#00D4FF]" : "bg-[#1E293B]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      u.screener_access ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Joined date */}
              <div className="w-24 text-right text-xs text-[#64748B]">
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
