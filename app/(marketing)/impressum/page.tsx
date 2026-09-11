import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum — OrcaTrading',
}

export default function ImpressumPage() {
  return (
    <>
      <style>{`
        .legal { background: #070B0F; color: #E8ECF0; font-family: 'Inter', system-ui, sans-serif; font-size: 1rem; line-height: 1.7; -webkit-font-smoothing: antialiased; min-height: 100vh; }
        .legal *, .legal *::before, .legal *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .legal .wrap { max-width: 720px; margin: 0 auto; padding: 80px 24px 100px; }
        .legal h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); font-weight: 700; letter-spacing: -.02em; margin-bottom: 8px; }
        .legal .sub { color: #7A8694; font-size: .9rem; margin-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,.07); padding-bottom: 32px; }
        .legal h2 { font-size: 1rem; font-weight: 600; color: #3ECFF0; margin: 36px 0 8px; text-transform: uppercase; letter-spacing: .08em; font-size: .75rem; }
        .legal p { color: #94A3B8; margin-bottom: 8px; }
        .legal a { color: #3ECFF0; text-decoration: none; }
        .legal a:hover { text-decoration: underline; }
        .legal .placeholder { color: rgba(255,120,80,.8); font-style: italic; }
      `}</style>
      <div className="legal">
        <div className="wrap">
          <h1>Impressum</h1>
          <p className="sub">Angaben gemäß § 5 TMG</p>

          <h2>Anbieter</h2>
          <p><span className="placeholder">[Vollständiger Name / Firmenname]</span></p>
          <p><span className="placeholder">[Straße und Hausnummer]</span></p>
          <p><span className="placeholder">[PLZ Ort, Deutschland]</span></p>

          <h2>Kontakt</h2>
          <p>E-Mail: <a href="mailto:J.benjelloun2000@gmail.com">J.benjelloun2000@gmail.com</a></p>

          <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>Bennie Benjelloun</p>
          <p><span className="placeholder">[Adresse wie oben]</span></p>

          <h2>Haftungsausschluss</h2>
          <p>
            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
            Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
            Seiten verantwortlich.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </div>
      </div>
    </>
  )
}
