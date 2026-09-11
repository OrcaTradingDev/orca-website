import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AGB — OrcaTrading',
}

export default function AgbPage() {
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
      `}</style>
      <div className="legal">
        <div className="wrap">
          <h1>Allgemeine Geschäftsbedingungen</h1>
          <p className="sub">Zuletzt aktualisiert: September 2025</p>

          <h2>1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen gelten für die Nutzung der Plattform OrcaTrading
            unter tradewithorca.com. Anbieter ist Bennie Benjelloun (nachfolgend „wir" oder „OrcaTrading").
            Mit der Registrierung oder Nutzung der Plattform akzeptierst du diese AGB.
          </p>

          <h2>2. Leistungsbeschreibung</h2>
          <p>OrcaTrading bietet folgende Dienste an:</p>
          <ul>
            <li><strong>Screener (kostenloser Tier):</strong> Zugang zum Multi-Timeframe-Screener mit eingeschränktem Funktionsumfang.</li>
            <li><strong>Screener Premium:</strong> Vollständiger Zugang zum Screener gegen monatliche Gebühr.</li>
            <li><strong>OrcaJournal:</strong> Trading-Journal zur Entscheidungsanalyse.</li>
            <li><strong>Orca Academy:</strong> Kostenloses Bildungsangebot zu Märkten und Trading-Grundlagen.</li>
            <li><strong>The Pod:</strong> Community-Mitgliedschaft mit wöchentlichen Calls, Chart-Reviews und Bibliothek.</li>
            <li><strong>Discord:</strong> Kostenloser Community-Bereich.</li>
          </ul>

          <h2>3. Registrierung und Konto</h2>
          <p>
            Die Registrierung erfolgt ausschließlich über Google OAuth. Du bist verpflichtet, dein
            Konto vor unbefugtem Zugriff zu schützen. Du darfst kein Konto im Namen einer anderen
            Person erstellen oder dein Konto auf Dritte übertragen.
          </p>

          <h2>4. Preise und Zahlung</h2>
          <p>
            Für kostenpflichtige Angebote gelten die zum Zeitpunkt der Buchung angezeigten Preise.
            Die Zahlung erfolgt über Stripe. Bei Abonnements wird die Gebühr monatlich im Voraus
            erhoben. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer, sofern
            nicht anders angegeben.
          </p>

          <h2>5. Kündigung und Widerruf</h2>
          <p>
            Abonnements (Screener Premium, The Pod) können jederzeit zum Ende des laufenden
            Abrechnungszeitraums gekündigt werden. Die Kündigung erfolgt über den Bereich
            „Billing" in deinem Konto. Nach der Kündigung bleibt der Zugang bis zum Ende
            des bezahlten Zeitraums bestehen.
          </p>
          <p>
            Verbraucher haben das gesetzliche Widerrufsrecht von 14 Tagen. Das Widerrufsrecht
            erlischt bei digitalen Inhalten vorzeitig, wenn du ausdrücklich zugestimmt hast,
            dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen.
          </p>

          <h2>6. Nutzungsbeschränkungen</h2>
          <p>Es ist untersagt:</p>
          <ul>
            <li>Inhalte der Plattform automatisiert auszulesen (Scraping)</li>
            <li>Zugangsdaten weiterzugeben oder Konten zu teilen</li>
            <li>Inhalte ohne ausdrückliche Genehmigung kommerziell weiterzuverwenden</li>
            <li>Die Plattform für illegale Zwecke zu nutzen</li>
          </ul>

          <h2>7. Haftungsbeschränkung</h2>
          <p>
            OrcaTrading haftet nicht für Handelsverluste, die auf der Nutzung unserer Tools beruhen.
            Alle Inhalte dienen ausschließlich Informations- und Bildungszwecken und stellen keine
            Anlageberatung dar. Wir übernehmen keine Haftung für die Verfügbarkeit oder
            Unterbrechung der Dienste.
          </p>

          <h2>8. Geistiges Eigentum</h2>
          <p>
            Alle Inhalte der Plattform — Software, Texte, Screener-Algorithmen, Akademie-Inhalte —
            sind Eigentum von OrcaTrading und urheberrechtlich geschützt. Die Nutzung ist
            ausschließlich für den persönlichen, nicht-kommerziellen Gebrauch gestattet.
          </p>

          <h2>9. Änderungen der AGB</h2>
          <p>
            Wir behalten uns vor, diese AGB zu ändern. Wesentliche Änderungen werden dir per
            E-Mail oder durch eine Benachrichtigung auf der Plattform mitgeteilt. Die weitere
            Nutzung der Plattform nach Inkrafttreten der Änderungen gilt als Zustimmung.
          </p>

          <h2>10. Anwendbares Recht und Gerichtsstand</h2>
          <p>
            Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Für Verbraucher gilt
            das Recht des Wohnstaates, soweit dies zwingend vorgeschrieben ist.
          </p>

          <h2>11. Kontakt</h2>
          <p>
            Bei Fragen zu diesen AGB wende dich an:{' '}
            <a href="mailto:J.benjelloun2000@gmail.com">J.benjelloun2000@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  )
}
