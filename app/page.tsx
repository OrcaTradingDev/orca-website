// app/page.tsx

export default function Page() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <header className="section no-x-scroll" style={{ paddingTop: "3.5rem" }}>
        <div className="container">
          <p className="eyebrow">Engineered in Germany</p>
          <h1>Automate, Analyze, Trade Smarter</h1>
          <p style={{ maxWidth: 900, color: "#b7c6d8", marginTop: "0.75rem" }}>
            OrcaTrading unites automation and market analytics in one transparent
            ecosystem.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.15rem", flexWrap: "wrap" }}>
            <a className="btn btn--primary" href="#pricing">View Screener</a>
            <a className="btn btn--ghost" href="#products">Explore platform</a>
          </div>
        </div>
      </header>

      {/* ---------- CORE VALUES ---------- */}
      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: "1rem" }}>Core values</h2>

          <div className="grid grid--3">
            <article className="tile">
              <h3>Automation with trust</h3>
              <p>
                Algorithms are rules-based, data-verified, and transparent across our community.
                <br />
                <span style={{ color: "#67ffd1" }}>
                  Avg. execution latency: 35ms • 12-month live test data
                </span>
              </p>
            </article>

            <article className="tile">
              <h3>Insights in seconds</h3>
              <p>
                Screener gives fast regime reads, trend strength, and a clean overview that aids real decisions.
              </p>
            </article>

            <article className="tile">
              <h3>Iterate with feedback</h3>
              <p>
                We publish changes, share metrics, and adjust features alongside users—not behind closed doors.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- PRODUCTS ---------- */}
      <section id="products" className="section">
        <div className="container">
          <h2 style={{ marginBottom: "1rem" }}>Product previews</h2>
          <div className="grid grid--3">
            <article className="tile">
              <h3>OrcaScreener</h3>
              <p>
                Dashboard sample: trend strength, regime (bullish/bearish), watchlists and alerts.
              </p>
            </article>
            <article className="tile">
              <h3>OrcaBot</h3>
              <p>
                Automated trend-following bot preview: strategy parameters, risk controls, and execution logs.
              </p>
            </article>
            <article className="tile">
              <h3>OrcaJournal</h3>
              <p>
                Performance tracking: stats, expectancy, review prompts for fast improvement.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- PRICING ---------- */}
      <section id="pricing" className="section" aria-label="Pricing">
        <div className="container">
          <h2 style={{ marginBottom: "1rem" }}>Membership &amp; Pricing</h2>

          {/* A. Standalone “Free during Beta” block — full width on mobile */}
          <div className="pricing">
            <div className="pricing__beta card--elevated">
              <h3 style={{ marginBottom: "0.35rem" }}>
                <span>Screener (Free during Beta)</span>
                <span className="price"> €0</span>
              </h3>
              <ul className="ul">
                <li>Full Screener access</li>
                <li>Community &amp; updates</li>
                <li>Basic alerts</li>
              </ul>
              <li>Watchlist/alerts</li>
              <li>Discord support</li>
              <a className="btn btn--primary btn--gradient-blue" href="#">
                Choose plan
              </a>
            </div>

            {/* Plans visible after V1 launch */}
            <p style={{ margin: "0.75rem 0 0.25rem", fontWeight: 700, color: "#b7c6d8" }}>
              After V1 Launch
            </p>

            <div className="pricing__plans">
              <article className="plan">
                <h3>Starter <span className="plan__price">€3.99</span></h3>
                <ul className="ul">
                  <li>Daily regime read</li>
                  <li>Basic transparency</li>
                  <li>Email support</li>
                </ul>
                <a className="btn btn--primary btn--gradient-blue" href="#">
                  Choose plan
                </a>
              </article>

              <article className="plan">
                <h3>Premium <span className="plan__price">€8.99</span></h3>
                <ul className="ul">
                  <li>Advanced alerts &amp; watchlists</li>
                  <li>Transparency dashboard</li>
                  <li>Priority support</li>
                </ul>
                <a className="btn btn--primary btn--gradient-blue" href="#">
                  Choose plan
                </a>
              </article>

              <article className="plan">
                <h3>Institutional <span className="plan__price">(Future)</span></h3>
                <ul className="ul">
                  <li>Custom dashboards</li>
                  <li>Advanced APIs &amp; SLAs</li>
                  <li>Dedicated onboarding</li>
                </ul>
                <a className="btn btn--primary btn--gradient-blue" href="#">
                  Choose plan
                </a>
              </article>
            </div>
          </div>
        </div>

        <div className="page-bottom-safe" />
      </section>
    </>
  );
}

