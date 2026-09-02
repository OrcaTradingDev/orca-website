import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — OrcaTrading',
  description:
    'OrcaTrading exists because trading is one of the few things people are expected to learn alone, from strangers selling certainty. We built something honest instead.',
  openGraph: {
    title: 'About OrcaTrading',
    description:
      'A multi-timeframe screener, a journal that grades the decision, a free academy, and the room where it gets practised. All running on one framework.',
  },
}

const DISCORD_URL    = process.env.NEXT_PUBLIC_DISCORD_URI   ?? '#'

export default function AboutPage() {
  return (
    <>
      <style>{`
        :root {
          --bg:      #070B0F;
          --surface: #0E1318;
          --border:  rgba(255,255,255,.07);
          --text:    #E8ECF0;
          --muted:   #7A8694;
          --cyan:    #3ECFF0;
          --teal:    #35D6A4;
          --violet:  #8B7CF0;
          --radius:  12px;
        }

        .ab *, .ab *::before, .ab *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ab {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
        }

        .ab .wrap { max-width: 820px; margin: 0 auto; padding: 0 24px; }

        .ab h1 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 700; line-height: 1.12; letter-spacing: -.03em; text-wrap: balance; }
        .ab h2 { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; line-height: 1.2; text-wrap: balance; }
        .ab h3 { font-size: 1rem; font-weight: 600; line-height: 1.3; }
        .ab p  { color: var(--muted); }
        .ab p + p { margin-top: 1em; }
        .ab strong { color: var(--text); font-weight: 600; }

        .ab .eyebrow {
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 12px;
        }

        /* hero */
        .ab-hero {
          padding: 96px 0 72px;
          border-bottom: 1px solid var(--border);
        }
        .ab-hero h1 em { font-style: normal; color: var(--cyan); }
        .ab-hero .lead {
          margin-top: 24px;
          font-size: 1.15rem;
          color: var(--muted);
          max-width: 640px;
          line-height: 1.7;
        }
        .ab-hero .lead strong { color: var(--text); }
        .ab-hero .sub {
          margin-top: 16px;
          font-size: .95rem;
          color: var(--muted);
          max-width: 580px;
        }
        .ab .origin-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .72rem;
          color: var(--muted);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px 12px;
          margin-bottom: 24px;
        }
        .ab .origin-tag::before {
          content: '';
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--teal);
          flex-shrink: 0;
        }

        /* sections */
        .ab-section {
          padding: 72px 0;
          border-bottom: 1px solid var(--border);
        }
        .ab-section .head { margin-bottom: 36px; }
        .ab-section .head h2 { margin-bottom: 10px; }
        .ab-section .head p { font-size: 1rem; max-width: 600px; }

        /* philosophy */
        .ab-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .ab-pillar {
          background: var(--surface);
          padding: 28px 24px;
          border-left: 3px solid transparent;
          transition: border-color .15s;
        }
        .ab-pillar:hover { border-left-color: var(--cyan); }
        .ab-pillar h3 { margin-bottom: 10px; color: var(--text); }
        .ab-pillar p  { font-size: .875rem; line-height: 1.6; }

        /* founder */
        .ab-founder {
          display: flex;
          gap: 40px;
          align-items: flex-start;
        }
        .ab-founder__photo {
          flex-shrink: 0;
          width: 110px;
          height: 110px;
          border-radius: 10px;
          object-fit: cover;
          background: var(--surface);
          border: 1px solid var(--border);
          display: block;
        }
        .ab-founder__text h2 { margin-bottom: 12px; }
        .ab-founder__text p  { font-size: 1rem; }
        @media (max-width: 580px) {
          .ab-founder { flex-direction: column; gap: 20px; }
          .ab-founder__photo { width: 80px; height: 80px; }
        }

        /* products */
        .ab-products {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 12px;
          margin-top: 36px;
        }
        .ab-product {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ab-product__tag {
          font-size: .62rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 999px;
          display: inline-block;
          align-self: flex-start;
          margin-bottom: 4px;
        }
        .ab-product__tag--free   { background: rgba(62,207,240,.12); color: var(--cyan); }
        .ab-product__tag--live   { background: rgba(53,214,164,.12); color: var(--teal); }
        .ab-product__tag--member { background: rgba(139,124,240,.12); color: var(--violet); }
        .ab-product h3 { font-size: .95rem; }
        .ab-product p  { font-size: .855rem; line-height: 1.55; }

        /* community */
        .ab-community {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 36px;
          margin-top: 36px;
        }
        .ab-community h3 { font-size: 1.1rem; margin-bottom: 12px; }
        .ab-community p  { font-size: .95rem; max-width: 600px; }
        .ab-community p + p { margin-top: .85em; }

        /* honest */
        .ab-honest-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 36px;
        }
        .ab-honest-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
        }
        .ab-honest-block h3 { margin-bottom: 14px; font-size: .85rem; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
        .ab-honest-block ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .ab-honest-block li {
          font-size: .875rem;
          color: var(--muted);
          padding-left: 16px;
          position: relative;
          line-height: 1.5;
        }
        .ab-honest-block li::before {
          content: '';
          position: absolute;
          left: 0; top: 8px;
          width: 5px; height: 5px;
          border-radius: 50%;
        }
        .ab-honest-block--yes li::before { background: var(--teal); }
        .ab-honest-block--no  li::before { background: rgba(255,255,255,.2); }
        @media (max-width: 580px) {
          .ab-honest-grid { grid-template-columns: 1fr; }
        }

        /* cta */
        .ab-cta {
          padding: 80px 0;
          text-align: center;
        }
        .ab-cta h2 { margin-bottom: 14px; }
        .ab-cta p  { font-size: 1rem; margin-bottom: 28px; max-width: 500px; margin-left: auto; margin-right: auto; }
        .ab-cta__btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center;
          background: var(--cyan); color: #070B0F;
          font-weight: 700; font-size: .875rem;
          padding: 12px 22px; border-radius: 999px;
          text-decoration: none; transition: opacity .15s;
        }
        .btn-primary:hover { opacity: .88; }
        .btn-ghost {
          display: inline-flex; align-items: center;
          background: transparent; color: var(--text);
          font-weight: 600; font-size: .875rem;
          padding: 12px 22px; border-radius: 999px;
          text-decoration: none;
          border: 1px solid var(--border);
          transition: border-color .15s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,.2); }
      `}</style>

      <div className="ab">

        {/* HERO */}
        <section className="ab-hero">
          <div className="wrap">
            <div className="origin-tag">Engineered in Germany · Est. 2024</div>
            <h1>We built what we couldn&apos;t find.<br /><em>A framework for reading the market.</em></h1>
            <p className="lead">
              OrcaTrading is a multi-timeframe screener, a journal that grades the decision, a free academy,
              and the room where it all gets practised together.{' '}
              <strong>All of it runs on one set of rules, because contradicting yourself is how most traders fail.</strong>
            </p>
            <p className="sub">
              Trading is one of the few things people are expected to learn alone, from strangers selling certainty.
              The gap that creates is the reason all of this exists.
            </p>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The philosophy</div>
              <h2>Process over profit. Honesty over hype.</h2>
              <p>
                Every part of OrcaTrading was built on the same convictions.
                They sound simple. They are not common.
              </p>
            </div>
            <div className="ab-pillars">
              <div className="ab-pillar">
                <h3>Start at the actual beginning</h3>
                <p>
                  Most trading education assumes you know what a market is and jumps straight to setups.
                  We go back further. To what a market is, what moves price, what liquidity actually means.
                  It costs nothing, because the foundations should not be behind a paywall.
                </p>
              </div>
              <div className="ab-pillar">
                <h3>One vocabulary, all the way through</h3>
                <p>
                  What the screener calls a valid setup is what the journal grades you against, what the
                  Academy teaches you to spot, and what The Pod pulls apart afterwards. Nothing here
                  contradicts itself, because it all reads the market the same way.
                </p>
              </div>
              <div className="ab-pillar">
                <h3>Grade the decision, not the outcome</h3>
                <p>
                  A lucky trade is not a good trade. A good decision that loses is still a good decision.
                  The journal is built on that distinction. It scores how the decision was made,
                  stage by stage, so the part you can control is the part that improves.
                </p>
              </div>
              <div className="ab-pillar">
                <h3>No shortcut exists</h3>
                <p>
                  Nobody here will sell you one. The system will tell you when conditions are not there.
                  The journal records a no-trade as a clean outcome, not a blank day. That is the
                  whole design: do the right thing, honestly, every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOUNDER */}
        <section className="ab-section">
          <div className="wrap">
            <div className="eyebrow">The founder</div>
            <h2>Built by a trader, for traders.</h2>
            <p style={{ marginTop: 12 }}>
              OrcaTrading was founded by <strong>Bennie</strong>. A trader who got tired of the gap
              between what trading education promises and what it actually delivers. The tools were
              built because they were needed, not because there was a market opportunity. The academy
              is free because Bennie knows what it costs to learn this without one.
            </p>
            <p>
              The Pod is not a course library behind a paywall. It is a room where Bennie is present
              every week, calling out setups, reviewing decisions, and pulling apart wins and losses
              in front of everyone who needs to see it. That is not scalable. That is the point.
            </p>
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">What we built</div>
              <h2>Four surfaces. One set of rules underneath.</h2>
              <p>
                Every part answers a different question. None of them contradict the others,
                because they all read the market the same way.
              </p>
            </div>
            <div className="ab-products">
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--free">Free tier live</span>
                <h3>The Screener</h3>
                <p>
                  36 instruments across five timeframes on one row. Bias bars, alignment scored
                  out of four, Orca status, ML forecast and forward state. What do conditions look like
                  right now, across the whole market.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--live">Live</span>
                <h3>OrcaJournal</h3>
                <p>
                  Grades the decision, not the profit. Runs the OTOS funnel stage by stage and scores
                  your process A+ to D. A lucky win cannot be repeated. A good process that lost can be.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--free">Free · Always</span>
                <h3>Orca Academy</h3>
                <p>
                  Starts at what a market actually is. Not at setups. No prior knowledge assumed,
                  no cost anywhere in it, no upsell wall halfway through. You can finish all of it
                  and use the free screener without ever paying for anything.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--member">Membership</span>
                <h3>The Pod</h3>
                <p>
                  Weekly calls. Chart reviews. A library that goes past the Academy. A room where
                  Bennie is present and decisions get pulled apart honestly in front of the people
                  who need to see it. €19.99/month. Cancel any time.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--free">Free · Always</span>
                <h3>The Discord</h3>
                <p>
                  Post your charts, ask what you are looking at, read what everyone else is seeing.
                  Active every day. Beginners and experienced traders in the same room, on purpose.
                  Nobody charges you to talk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMMUNITY */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The community</div>
              <h2>The room is the product, not the bonus.</h2>
              <p>
                Every other community is a byproduct of a course. Ours is the reason the course is free.
              </p>
            </div>
            <div className="ab-community">
              <h3>Beginners and experienced traders in the same room, on purpose.</h3>
              <p>
                Beginners ask the questions experienced traders stopped asking and should not have.
                Experienced traders answer them and find out what they only half understood.
                That is most of the value in any serious trading education, and it only works if
                neither group is locked away from the other.
              </p>
              <p>
                The Academy is free so the room stays mixed. The Pod goes further, into the depth,
                the coaching, the library, but the foundation is always open.
                A community that only talks to itself stops learning.
              </p>
            </div>
          </div>
        </section>

        {/* HONEST */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The honest part</div>
              <h2>What we are, and what we are not.</h2>
              <p>
                A system that tells you what you want to hear is a system that cannot teach you anything.
                Here is the version we will stand behind.
              </p>
            </div>
            <div className="ab-honest-grid">
              <div className="ab-honest-block ab-honest-block--yes">
                <h3>What OrcaTrading is</h3>
                <ul>
                  <li>A structured framework for reading markets and making decisions</li>
                  <li>A screener that tells you when conditions are not there, which is most of the time</li>
                  <li>A journal that grades process, so improving is possible rather than optional</li>
                  <li>An academy that starts from zero, for free, with no upsell wall</li>
                  <li>A community where the team is present and questions are answered directly</li>
                  <li>Tools that say so when the setup is not valid</li>
                </ul>
              </div>
              <div className="ab-honest-block ab-honest-block--no">
                <h3>What OrcaTrading is not</h3>
                <ul>
                  <li>A signal service telling you when to buy and sell</li>
                  <li>A guarantee of profit or risk-free trading</li>
                  <li>A shortcut to replace discipline and process</li>
                  <li>Investment advice or a recommendation to trade any instrument</li>
                  <li>A fully automated system that requires nothing from you</li>
                  <li>Another course that jumps to setups before you understand the market</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHERE WE ARE */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">Where we are</div>
              <h2>Early, growing, and building in public.</h2>
              <p>
                OrcaTrading is built in Germany by a small team that trades the same markets,
                uses the same tools, and argues in the same Discord as every member.
              </p>
            </div>
            <p style={{ maxWidth: '600px', fontSize: '1rem' }}>
              The screener is live. The journal is live. The Academy is being built out.
              The Pod Library is growing. The webhook API, broker integration, and risk calculator
              are on the roadmap.
            </p>
            <p style={{ maxWidth: '600px', fontSize: '1rem', marginTop: '14px' }}>
              Early adopters lock in their prices. Clients request features directly.
              The team reads every message. That is not a marketing claim.
              It is how the system has been built so far, and it is the only way to build something
              worth using.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="ab-cta">
          <div className="wrap">
            <h2>Start with the free parts.</h2>
            <p>
              The Academy. The screener free tier. The Discord.
              No card, and nothing becomes paid halfway through.
            </p>
            <div className="ab-cta__btns">
              <a href={DISCORD_URL} className="btn-primary" target="_blank" rel="noopener noreferrer">
                Join the Discord
              </a>
              <a href="/#academy" className="btn-ghost">
                Start the Academy
              </a>
            </div>
            <p style={{ fontSize: '.82rem', marginTop: '20px' }}>
              Or{' '}
              <a href="/" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                go back to the full overview
              </a>
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
