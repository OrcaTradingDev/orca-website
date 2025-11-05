export default function Page() {
  const styles = {
    page: {
      fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
      color: "#e8eefc",
      background: "#0b1220",
      minHeight: "100dvh",
    },
    container: { maxWidth: 1120, margin: "0 auto", padding: "0 20px" },
    badge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      padding: "8px 12px",
      backdropFilter: "blur(6px)",
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
    },
    h1: { fontSize: 48, lineHeight: 1.05, fontWeight: 800, margin: "18px 0 0" },
    sub: {
      marginTop: 16,
      fontSize: 18,
      color: "rgba(255,255,255,0.75)",
      maxWidth: 720,
      marginInline: "auto",
    },
    ctas: {
      display: "flex",
      gap: 12,
      marginTop: 24,
      justifyContent: "center",
      flexWrap: "wrap",
    },
    primary: {
      background: "#22d3ee",
      color: "#06202a",
      border: "1px solid #0ea5b7",
      boxShadow: "0 8px 24px rgba(34,211,238,0.35)",
      borderRadius: 12,
      padding: "12px 18px",
      fontWeight: 700,
      cursor: "pointer",
    },
    secondary: {
      background: "#ecfeff",
      color: "#06202a",
      borderRadius: 12,
      padding: "12px 18px",
      fontWeight: 700,
      border: "1px solid rgba(6,32,42,0.15)",
      cursor: "pointer",
      textDecoration: "none",
    },
    hero: { position: "relative", overflow: "hidden" },
    glow: {
      position: "absolute",
      inset: -200 as unknown as number, // TS happy
      background:
        "radial-gradient(ellipse at center, rgba(34,211,238,0.18), transparent 55%)",
      pointerEvents: "none",
    },
    grid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
      opacity: 0.4,
      pointerEvents: "none",
    },
    heroInner: { position: "relative", padding: "96px 0 48px", textAlign: "center" },
    tickerRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      marginTop: 32,
      maxWidth: 880,
      marginInline: "auto",
    },
    card: {
      background: "rgba(15,23,41,0.9)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: 16,
    },
    cardHead: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
    },
    spark: {
      marginTop: 12,
      height: 40,
      borderRadius: 8,
      background:
        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
    },
    section: { padding: "72px 0" },
    h2: { fontSize: 32, lineHeight: 1.15, fontWeight: 800 },
    p: { marginTop: 10, maxWidth: 760, color: "rgba(255,255,255,0.78)" },
    pillarsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      marginTop: 28,
    },
    toolGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      marginTop: 28,
    },
    li: { marginTop: 6 },
    footer: {
      padding: "48px 0",
      color: "rgba(255,255,255,0.6)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      marginTop: 40,
    },
    row: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      alignItems: "start",
      marginTop: 24,
    },
    trust: {
      display: "flex",
      gap: 12,
      justifyContent: "center",
      marginTop: 18,
      flexWrap: "wrap",
      color: "rgba(255,255,255,0.72)",
      fontSize: 14,
    },
    pill: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      padding: "6px 10px",
    },
    priceGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: 16,
      marginTop: 28,
    },
    priceCard: {
      background: "rgba(11,18,32,0.9)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 20,
    },
  } as const;

  const Pillar = ({
    title,
    desc,
    metric,
  }: {
    title: string;
    desc: string;
    metric?: string;
  }) => (
    <div style={styles.card}>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
      <div style={{ marginTop: 6, color: "rgba(255,255,255,0.75)" }}>{desc}</div>
      {metric ? (
        <div style={{ marginTop: 10, fontSize: 13, color: "#34d399" }}>{metric}</div>
      ) : null}
    </div>
  );

  const Tool = ({ title, desc }: { title: string; desc: string }) => (
    <div style={styles.card}>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
      <div style={{ marginTop: 8, color: "rgba(255,255,255,0.75)" }}>{desc}</div>
    </div>
  );

  const Price = ({
    name,
    price,
    bullets,
    highlight,
  }: {
    name: string;
    price: string;
    bullets: string[];
    highlight?: boolean;
  }) => (
    <div
      style={{
        ...styles.priceCard,
        ...(highlight ? { borderColor: "#22d3ee" } : {}),
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{name}</div>
        <div style={{ fontWeight: 800, color: "#22d3ee" }}>{price}</div>
      </div>
      <ul style={{ marginTop: 12, color: "rgba(255,255,255,0.8)", paddingLeft: 16 }}>
        {bullets.map((b) => (
          <li key={b} style={styles.li}>
            • {b}
          </li>
        ))}
      </ul>
      <button style={{ ...styles.primary, width: "100%", marginTop: 16 }}>Choose plan</button>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.glow} />
        <div style={styles.grid} />
        <div style={{ ...styles.container, ...styles.heroInner }}>
          <div style={styles.badge}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22d3ee" }} />
            Engineered in Germany
          </div>
          <h1 style={styles.h1}>Automate, Analyze, Trade Smarter</h1>
          <p style={styles.sub}>
            OrcaTrading unites automation and market analytics in one transparent ecosystem.
          </p>
          <div style={styles.ctas}>
            <button style={styles.primary}>Explore platform</button>
            <a href="#tools" style={styles.secondary}>
              View Screener
            </a>
          </div>

          {/* TRUST SIGNALS */}
          <div style={styles.trust}>
            <span style={styles.pill}>Built in Germany</span>
            <span style={styles.pill}>Transparent performance</span>
            <span style={styles.pill}>Secure infrastructure</span>
          </div>

          {/* Decorative ticker cards */}
          <div style={styles.tickerRow} aria-hidden>
            {[
              { s: "EUR/USD", p: "+2.4%", c: "#34d399" },
              { s: "AAPL", p: "+5.7%", c: "#34d399" },
              { s: "BTC/USD", p: "-1.2%", c: "#ef4444" },
            ].map((t) => (
              <div key={t.s} style={styles.card}>
                <div style={styles.cardHead}>
                  <span>{t.s}</span>
                  <span style={{ color: t.c }}>{t.p}</span>
                </div>
                <div style={styles.spark} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section style={styles.section} id="values">
        <div style={styles.container}>
          <h2 style={styles.h2}>Core values</h2>
          <div style={styles.p}>What defines how we build and ship.</div>
          <div style={styles.pillarsGrid}>
            <Pillar
              title="Automation with trust"
              desc="Algorithms are rules-based, data-verified, and transparent across our community."
              metric="Avg. execution latency: 35ms • 12-month live test data"
            />
            <Pillar
              title="Insights in seconds"
              desc="Visual screener with multi-timeframe analysis, adaptable from scalpers to long-term investors."
            />
            <Pillar
              title="Community collaboration"
              desc="We identify trader pain points together → analyze → develop solutions. Your feedback shapes the roadmap."
            />
          </div>
        </div>
      </section>

      {/* TOOLS PREVIEW */}
      <section style={styles.section} id="tools">
        <div style={styles.container}>
          <h2 style={styles.h2}>Product previews</h2>
          <div style={styles.row}>
            <Tool
              title="OrcaScreener"
              desc="Dashboard sample: trend strength, regime (bullish/bearish), watchlists and alerts."
            />
            <Tool
              title="OrcaBot"
              desc="Automated trend-following bot preview: strategy parameters, risk controls, and execution logs."
            />
            <Tool
              title="OrcaJournal"
              desc="Performance tracking: stats, expectancy, review prompts for fast improvement."
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={styles.section} id="pricing">
        <div style={styles.container}>
          <h2 style={styles.h2}>Membership & Pricing</h2>
          <div style={styles.p}>
            Full access to the Screener is <strong>free during beta</strong>. Pricing begins at the
            V1 launch. After launch, the <strong>Free</strong> tier remains (complete Screener), and{" "}
            <strong>Premium</strong> adds advanced features.
          </div>

          {/* NOW — BETA */}
          <div style={{ marginTop: 18, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>
            Now — Beta
          </div>
          <div style={{ ...styles.priceGrid, gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
            <Price
              name="Screener (Free during Beta)"
              price="€0"
              bullets={["Full Screener access", "Community & updates", "Basic alerts"]}
              highlight
            />
          </div>

          {/* AFTER V1 LAUNCH */}
          <div style={{ marginTop: 28, fontWeight: 800, color: "rgba(255,255,255,0.9)" }}>
            After V1 Launch
          </div>
          <div style={styles.priceGrid}>
            <Price
              name="Free"
              price="€0"
              bullets={["Complete Screener", "Community access", "Basic alerts"]}
            />
            <Price
              name="Premium"
              price="€8,99/mo"
              bullets={["Advanced alerts & watchlists", "Transparency dashboard", "Priority support"]}
            />
            <Price
              name="Institutional (Future)"
              price="Contact us"
              bullets={["Custom dashboards", "Advanced APIs & SLAs", "Dedicated onboarding"]}
            />
          </div>
        </div>
      </section>

      {/* TRUST & COMPLIANCE */}
      <section style={styles.section} id="compliance">
        <div style={styles.container}>
          <h2 style={styles.h2}>Trust & compliance</h2>
          <ul style={{ ...styles.p, paddingLeft: 18 }}>
            <li style={styles.li}>
              German entity: <strong>OrcaTrading GmbH, Straelen</strong>
            </li>
            <li style={styles.li}>Data hosted in EU-compliant infrastructure</li>
            <li style={styles.li}>No investment advice. Technology provider only.</li>
            <li style={styles.li}>Legal: Impressum · Datenschutzerklärung · Risk disclosure</li>
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ ...styles.section, textAlign: "center" }} id="onboarding">
        <div style={styles.container}>
          <h2 style={styles.h2}>Experience data-driven automation and analytics.</h2>
          <div style={styles.ctas}>
            <button style={styles.primary}>Join beta</button>
            <button style={{ ...styles.secondary, cursor: "pointer" } as React.CSSProperties}>
              Become premium
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.container}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              © {new Date().getFullYear()} OrcaTrading GmbH · Straelen ·{" "}
              <a href="mailto:contact@orcatrading.com" style={{ color: "#a5b4cf", textDecoration: "none" }}>
                contact@orcatrading.com
              </a>
            </div>
            <div>
              <a href="#" style={{ color: "#a5b4cf", marginRight: 12, textDecoration: "none" }}>
                Impressum
              </a>
              <a href="#" style={{ color: "#a5b4cf", marginRight: 12, textDecoration: "none" }}>
                Datenschutzerklärung
              </a>
              <a href="#" style={{ color: "#a5b4cf", marginRight: 12, textDecoration: "none" }}>
                AGB
              </a>
              <a href="#" style={{ color: "#a5b4cf", textDecoration: "none" }}>Risk disclosure</a>
            </div>
          </div>
          <div style={{ marginTop: 8, color: "rgba(255,255,255,0.55)" }}>
            engineered in Germany, built for traders and investors.
          </div>
        </div>
      </footer>
    </div>
  );
}

