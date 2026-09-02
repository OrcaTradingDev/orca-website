'use client'

export default function JournalPage() {
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
