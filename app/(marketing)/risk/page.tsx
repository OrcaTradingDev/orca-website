import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Risk Disclosure — OrcaTrading',
}

export default function RiskPage() {
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
        .legal li { margin-bottom: 6px; }
        .legal .warning {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 10px;
          padding: 20px 24px;
          margin-bottom: 36px;
          color: #FCA5A5;
          font-size: .95rem;
          line-height: 1.65;
        }
      `}</style>
      <div className="legal">
        <div className="wrap">
          <h1>Risk Disclosure</h1>
          <p className="sub">Please read this carefully before using any OrcaTrading tools.</p>

          <div className="warning">
            Trading foreign exchange, CFDs, and crypto assets carries a high level of risk and may
            result in the loss of your entire invested capital. You should not trade with money you
            cannot afford to lose. OrcaTrading is an educational and analytical tool — it is not a
            licensed financial advisor, broker, or investment service.
          </div>

          <h2>No investment advice</h2>
          <p>
            Nothing on tradewithorca.com — including the screener, journal, academy content, Discord
            messages, or Pod calls — constitutes investment advice, a recommendation to buy or sell
            any financial instrument, or a solicitation to trade. All content is provided for
            informational and educational purposes only.
          </p>

          <h2>Market risk</h2>
          <p>
            Financial markets are inherently unpredictable. Past performance of any strategy,
            signal, or tool does not guarantee future results. The screener identifies conditions
            based on technical analysis frameworks — this does not mean those conditions will
            result in profitable trades.
          </p>
          <p>
            You may lose more than your initial deposit when trading leveraged products such as
            CFDs or forex. Leverage amplifies both gains and losses.
          </p>

          <h2>Tool limitations</h2>
          <p>
            The OrcaTrading screener, ML forecast, and journal are analytical tools. They are subject
            to limitations including:
          </p>
          <ul>
            <li>Data delays or inaccuracies from third-party market data providers</li>
            <li>Technical downtime or service interruptions</li>
            <li>Model limitations in the ML forecast — it shows a range of outcomes, not a prediction</li>
            <li>Human error in how results are interpreted and acted upon</li>
          </ul>

          <h2>Suitability</h2>
          <p>
            Trading is not suitable for everyone. Before trading, you should consider your
            experience level, investment objectives, financial resources, and risk tolerance.
            If you are uncertain, seek independent financial advice from a qualified and regulated
            advisor in your jurisdiction.
          </p>

          <h2>Regulatory status</h2>
          <p>
            OrcaTrading is not a regulated financial institution, broker, or investment firm.
            We do not hold any financial services licence. We do not accept or hold client funds,
            execute trades on your behalf, or provide personalised investment recommendations.
          </p>

          <h2>Third-party platforms</h2>
          <p>
            Links or references to brokers, exchanges, or other platforms are provided for
            convenience only. We are not responsible for the services, practices, or losses
            arising from the use of third-party platforms.
          </p>

          <h2>Jurisdiction</h2>
          <p>
            This risk disclosure does not constitute legal or regulatory advice. Requirements
            vary by country. It is your responsibility to ensure that trading is legal in your
            jurisdiction and that you comply with all applicable laws and regulations.
          </p>

          <h2>Questions</h2>
          <p>
            If you have questions about this disclosure, contact us at{' '}
            <a href="mailto:J.benjelloun2000@gmail.com">J.benjelloun2000@gmail.com</a>.
          </p>
        </div>
      </div>
    </>
  )
}
