// app/page.tsx
export default function Page() {
  return (
    <>
      {/* HERO */}
      <section className="section">
        <div className="container">
          <span className="pill" aria-label="country of origin">
            ● Engineered in Germany
          </span>

          <h1 style={{ marginTop: "16px" }}>
            Automate, <br /> Analyze, Trade Smarter
          </h1>

          <p className="lede" style={{ maxWidth: 760 }}>
            OrcaTrading unites automation and market analytics in one transparent
            ecosystem.
          </p>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 520 }}>
            <a className="btn btn--brand" href="#pricing">
              View Screener
            </a>
            <a className="btn" href="#values">
              Explore platform
            </a>
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section id="values" className="section">
        <div className="container">
          <h2>Core values</h2>
          <p className="lede">What defines how we build and ship.</p>

          <div className="grid grid--cards">
            <article className="card">
              <h3 className="card__title">Automation with trust</h3>
              <p>
                Algorithms are rules-based, data-verified, and transparent across our
                community.
              </p>
              <p className="muted" style={{ marginTop: 12 }}>
                Avg. execution latency: <strong>35ms</strong> • 12-month live test
                data
              </p>
            </article>

            <article className="card">
              <h3 className="card__title">Insights in seconds</h3>
              <p>
                Visual screener with multi-timeframe analysis, adaptable from scalpers
                to long-term investors.
              </p>
            </article>

            <article className="card">
              <h3 className="card__title">Community collaboration</h3>
              <p>
                We identify trader pain points together → analyze → develop solutions.
                Your feedback shapes the roadmap.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEWS */}
      <section className="section">
        <div className="container">
          <h2>Product previews</h2>

          <div className="grid grid--cards">
            <article className="card">
              <h3 className="card__title">OrcaScreener</h3>
              <p>
                Dashboard sample: trend strength, regime (bullish/bearish), watchlists
                and alerts.
              </p>
            </article>

            <article className="card">
              <h3 className="card__title">OrcaBot</h3>
              <p>
                Automated trend-following bot preview: strategy parameters, risk
                controls, and execution logs.
              </p>
            </article>

            <article className="card">
              <h3 className="card__title">OrcaJournal</h3>
              <p>
                Performance tracking: stats, expectancy, and quick review prompts for
                faster improvement.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="section">
        <div className="container">
          <h2>Membership &amp; Pricing</h2>
          <p className="lede">
            Full access to the Screener is free during beta. Pricing begins at the V1
            launch.
          </p>

          <div className="grid grid--pricing">
            <article className="card plan">
              <h3 className="card__title">Free</h3>
              <div className="plan__price">€0</div>
              <ul className="plan__features">
                <li>Complete Screener</li>
                <li>Community access</li>
                <li>Basic alerts</li>
              </ul>
              <a className="btn btn--brand" href="#">
                Choose plan
              </a>
            </article>

            <article className="card plan">
              <h3 className="card__title">Premium</h3>
              <div className="plan__price">€8.99</div>
              <ul className="plan__features">
                <li>Advanced alerts &amp; watchlists</li>
                <li>Transparency dashboard</li>
                <li>Priority support</li>
              </ul>
              <a className="btn btn--brand" href="#">
                Choose plan
              </a>
            </article>

            <article className="card plan">
              <h3 className="card__title">Institutional (Future)</h3>
              <div className="plan__price">Custom</div>
              <ul className="plan__features">
                <li>Custom dashboards</li>
                <li>Advanced APIs &amp; SLAs</li>
                <li>Dedicated onboarding</li>
              </ul>
              <a className="btn btn--brand" href="#">
                Choose plan
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section className="section">
        <div className="container">
          <h2>Trust &amp; compliance</h2>
          <ul className="plan__features" style={{ maxWidth: 860 }}>
            <li>German entity: OrcaTrading GmbH, Straelen</li>
            <li>Data hosted in EU-compliant infrastructure</li>
            <li>No investment advice — technology provider</li>
          </ul>
        </div>
      </section>
    </>
  );
}

