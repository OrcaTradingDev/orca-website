'use client'

import { useEffect } from 'react'

export default function JournalPage() {
  useEffect(() => {
    // Write the API base URL to localStorage so the journal HTML (same-origin
    // static file) can call the backend without needing build-time env vars.
    try {
      localStorage.setItem(
        'orca_api_base',
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      )
    } catch { /* ignore in private-browsing mode */ }
  }, [])

  return (
    <iframe
      src="/journal-app.html"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        border: 'none',
        zIndex: 100,
      }}
      title="OrcaJournal"
    />
  )
}
