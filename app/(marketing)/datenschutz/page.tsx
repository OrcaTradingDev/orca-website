import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung — OrcaTrading',
}

export default function DatenschutzPage() {
  return (
    <>
      <style>{`
        .legal { background: #070B0F; color: #E8ECF0; font-family: 'Inter', system-ui, sans-serif; font-size: 1rem; line-height: 1.7; -webkit-font-smoothing: antialiased; min-height: 100vh; }
        .legal *, .legal *::before, .legal *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .legal .wrap { max-width: 720px; margin: 0 auto; padding: 80px 24px 100px; }
        .legal h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 700; letter-spacing: -.02em; margin-bottom: 8px; }
        .legal .sub { color: #7A8694; font-size: .9rem; margin-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,.07); padding-bottom: 32px; }
        .legal h2 { font-size: .75rem; font-weight: 600; color: #3ECFF0; margin: 36px 0 8px; text-transform: uppercase; letter-spacing: .08em; }
        .legal p { color: #94A3B8; margin-bottom: 10px; }
        .legal ul { color: #94A3B8; padding-left: 20px; margin-bottom: 10px; }
        .legal li { margin-bottom: 4px; }
        .legal a { color: #3ECFF0; text-decoration: none; }
        .legal a:hover { text-decoration: underline; }
        .legal .placeholder { color: rgba(255,120,80,.8); font-style: italic; }
      `}</style>
      <div className="legal">
        <div className="wrap">
          <h1>Datenschutzerklärung</h1>
          <p className="sub">Zuletzt aktualisiert: September 2025</p>

          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der DSGVO ist Bennie Benjelloun, erreichbar unter{' '}
            <a href="mailto:J.benjelloun2000@gmail.com">J.benjelloun2000@gmail.com</a>.
          </p>

          <h2>2. Welche Daten wir erheben</h2>
          <p>Wenn du dich anmeldest oder unsere Plattform nutzt, verarbeiten wir folgende Daten:</p>
          <ul>
            <li>Name und E-Mail-Adresse (über Google-Login)</li>
            <li>Profilbild-URL von Google</li>
            <li>Abonnementstatus (kostenlos oder Premium)</li>
            <li>Journal-Einträge (nur wenn du die Freigabe ausdrücklich aktiviert hast)</li>
            <li>Technische Zugriffsdaten (IP-Adresse, Browser, Zeitstempel) über Server-Logs</li>
          </ul>

          <h2>3. Zweck der Verarbeitung</h2>
          <ul>
            <li>Bereitstellung und Absicherung des Nutzerkontos</li>
            <li>Verwaltung von Abonnements und Zahlungen (über Stripe)</li>
            <li>Verbesserung der Plattform durch optionales Journal-Daten-Sharing</li>
            <li>Einhaltung gesetzlicher Verpflichtungen</li>
          </ul>

          <h2>4. Rechtsgrundlage</h2>
          <p>
            Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
            sowie Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) für optionale Funktionen wie das
            Journal-Daten-Sharing.
          </p>

          <h2>5. Drittanbieter</h2>
          <p>Wir setzen folgende Drittanbieter ein:</p>
          <ul>
            <li><strong>Google OAuth</strong> — Authentifizierung. Datenschutzrichtlinie: policies.google.com/privacy</li>
            <li><strong>Stripe</strong> — Zahlungsabwicklung. Datenschutzrichtlinie: stripe.com/de/privacy</li>
            <li><strong>Vercel</strong> — Hosting des Frontends (USA). Angemessenes Schutzniveau durch Standardvertragsklauseln.</li>
            <li><strong>Render</strong> — Hosting des Backends (USA). Angemessenes Schutzniveau durch Standardvertragsklauseln.</li>
          </ul>

          <h2>6. Speicherdauer</h2>
          <p>
            Deine Daten werden gespeichert, solange dein Konto aktiv ist. Nach einer Kontolöschung
            werden personenbezogene Daten innerhalb von 30 Tagen gelöscht, soweit keine gesetzlichen
            Aufbewahrungspflichten entgegenstehen.
          </p>

          <h2>7. Deine Rechte</h2>
          <p>Du hast das Recht auf:</p>
          <ul>
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerruf einer Einwilligung jederzeit ohne Angabe von Gründen</li>
          </ul>
          <p>
            Zur Ausübung deiner Rechte wende dich an:{' '}
            <a href="mailto:J.benjelloun2000@gmail.com">J.benjelloun2000@gmail.com</a>
          </p>

          <h2>8. Beschwerderecht</h2>
          <p>
            Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            Die zuständige Behörde richtet sich nach deinem Wohnort in Deutschland.
          </p>

          <h2>9. Cookies</h2>
          <p>
            Wir verwenden ausschließlich technisch notwendige Cookies für die Sitzungsverwaltung
            (OAuth-Login). Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
          </p>
        </div>
      </div>
    </>
  )
}
