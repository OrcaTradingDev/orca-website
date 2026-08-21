"use client";

// Kept for backwards-compat — old sub-components import this type.
export type JournalSection = string;

// The OTOS journal is a self-contained HTML app that manages its own state via
// localStorage (key: otos_journal_v1). Embedding it as an iframe on the same
// origin means localStorage is shared — data persists across refreshes and
// return visits automatically. The OrcaTrading navbar sits above (64px), so
// the iframe fills the remaining viewport height.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function JournalApp() {
  const src = `/otos-journal.html?apiBase=${encodeURIComponent(API_BASE)}`;
  return (
    <iframe
      src={src}
      style={{
        display: "block",
        width: "100%",
        height: "calc(100vh - 64px)",
        border: "none",
      }}
      title="OTOS Trading Journal"
    />
  );
}
