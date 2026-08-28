import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — OrcaTrading',
  description:
    'OrcaTrading exists because trading is one of the few things people are expected to learn alone, from strangers selling certainty. We built something honest instead.',
  openGraph: {
    title: 'About OrcaTrading',
    description:
      'A multi-timeframe screener, a journal that grades the decision, a free academy, and the room where it gets practised — all running on one framework.',
  },
}

const DISCORD_URL    = process.env.NEXT_PUBLIC_DISCORD_URI   ?? '#'
const CLIENT_HUB_URL = process.env.NEXT_PUBLIC_CLIENT_HUB_URI ?? DISCORD_URL

export default function AboutPage() {
  return (
    <>
      <style>{`
        /* ── tokens ────────────────────────────────── */
        :root {
          --bg:         #070B0F;
          --surface:    #0E1318;
          --border:     rgba(255,255,255,.07);
          --text:       #E8ECF0;
          --muted:      #7A8694;
          --cyan:       #3ECFF0;
          --teal:       #35D6A4;
          --violet:     #8B7CF0;
          --amber:      #F0A535;
          --radius:     12px;
        }

        /* ── reset ─────────────────────────────────── */
        .ab *,
        .ab *::before,
        .ab *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ab {
          background: var(--bg);
          color: var(--text);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1rem;
          line-height: 1.65;
          -webkit-font-smoothing: antialiased;
        }

        /* ── layout ─────────────────────────────────── */
        .ab .wrap  { max-width: 820px; margin: 0 auto; padding: 0 24px; }
        .ab .wrap--wide { max-width: 1060px; margin: 0 auto; padding: 0 24px; }

        /* ── type ───────────────────────────────────── */
        .ab h1 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 700; line-height: 1.12; letter-spacing: -.03em; text-wrap: balance; }
        .ab h2 { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 700; line-height: 1.2; text-wrap: balance; }
        .ab h3 { font-size: 1.1rem; font-weight: 600; line-height: 1.3; }
        .ab p  { color: var(--muted); }
        .ab p + p { margin-top: 1em; }
        .ab strong { color: var(--text); font-weight: 600; }

        .ab .eyebrow {
          font-size: .7rem;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 12px;
        }

        /* ── hero ───────────────────────────────────── */
        .ab-hero {
          padding: 100px 0 80px;
          border-bottom: 1px solid var(--border);
        }
        .ab-hero h1 { margin-bottom: 24px; }
        .ab-hero h1 em { font-style: normal; color: var(--cyan); }
        .ab-hero .lead {
          font-size: 1.2rem;
          color: var(--muted);
          max-width: 660px;
          line-height: 1.7;
        }
        .ab-hero .lead strong { color: var(--text); }
        .ab-hero .origin {
          margin-top: 20px;
          font-size: 1rem;
          color: var(--muted);
          max-width: 660px;
        }

        /* ── section base ───────────────────────────── */
        .ab-section {
          padding: 72px 0;
          border-bottom: 1px solid var(--border);
        }
        .ab-section:last-of-type { border-bottom: none; }

        .ab-section .head { margin-bottom: 40px; }
        .ab-section .head h2 { margin-bottom: 12px; }
        .ab-section .head p { font-size: 1.05rem; max-width: 620px; }

        /* ── philosophy pillars ─────────────────────── */
        .ab-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }
        .ab-pillar {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 24px;
        }
        .ab-pillar__icon {
          font-size: 1.4rem;
          margin-bottom: 14px;
          display: block;
          line-height: 1;
        }
        .ab-pillar h3 { margin-bottom: 8px; }
        .ab-pillar p  { font-size: .9rem; }

        /* ── founder ────────────────────────────────── */
        .ab-founder {
          display: flex;
          gap: 48px;
          align-items: flex-start;
        }
        .ab-founder__avatar {
          flex-shrink: 0;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cyan), var(--violet));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: #070B0F;
          letter-spacing: -.03em;
        }
        .ab-founder__text h2 { margin-bottom: 12px; }
        .ab-founder__text p  { font-size: 1.05rem; }
        @media (max-width: 600px) {
          .ab-founder { flex-direction: column; gap: 24px; }
        }

        /* ── products grid ──────────────────────────── */
        .ab-products {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 16px;
          margin-top: 40px;
        }
        .ab-product {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ab-product__tag {
          font-size: .65rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 999px;
          display: inline-block;
          align-self: flex-start;
        }
        .ab-product__tag--free    { background: rgba(62,207,240,.15); color: var(--cyan); }
        .ab-product__tag--live    { background: rgba(53,214,164,.15); color: var(--teal); }
        .ab-product__tag--member  { background: rgba(139,124,240,.15); color: var(--violet); }
        .ab-product__tag--early   { background: rgba(240,165,53,.15); color: var(--amber); }
        .ab-product h3 { font-size: 1rem; }
        .ab-product p  { font-size: .875rem; }

        /* ── community block ────────────────────────── */
        .ab-community {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 40px;
          margin-top: 40px;
        }
        .ab-community h3 { font-size: 1.25rem; margin-bottom: 12px; }
        .ab-community p  { font-size: 1rem; max-width: 620px; }
        .ab-community p + p { margin-top: .9em; }

        /* ── framework strip ────────────────────────── */
        .ab-framework {
          background: linear-gradient(135deg, rgba(62,207,240,.08), rgba(139,124,240,.08));
          border: 1px solid rgba(62,207,240,.15);
          border-radius: var(--radius);
          padding: 36px 40px;
          margin-top: 40px;
        }
        .ab-framework h3 { margin-bottom: 12px; }
        .ab-framework p  { font-size: .95rem; max-width: 600px; }
        .ab-vocab {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 20px;
        }
        .ab-vocab span {
          font-size: .75rem;
          font-weight: 600;
          letter-spacing: .06em;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(255,255,255,.06);
          border: 1px solid var(--border);
          color: var(--text);
          text-transform: uppercase;
        }

        /* ── honest section ─────────────────────────── */
        .ab-honest-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 40px;
        }
        .ab-honest-block {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px 24px;
        }
        .ab-honest-block h3 { margin-bottom: 12px; font-size: .95rem; }
        .ab-honest-block ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ab-honest-block li {
          font-size: .875rem;
          color: var(--muted);
          padding-left: 18px;
          position: relative;
        }
        .ab-honest-block li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 9px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .ab-honest-block--yes li::before { background: var(--teal); }
        .ab-honest-block--no  li::before { background: var(--muted); opacity: .4; }
        @media (max-width: 600px) {
          .ab-honest-grid { grid-template-columns: 1fr; }
        }

        /* ── footer cta ─────────────────────────────── */
        .ab-cta {
          padding: 80px 0;
          text-align: center;
        }
        .ab-cta h2 { margin-bottom: 16px; }
        .ab-cta p  { font-size: 1.05rem; margin-bottom: 32px; }
        .ab-cta__btns {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--cyan);
          color: #070B0F;
          font-weight: 700;
          font-size: .9rem;
          padding: 13px 24px;
          border-radius: 999px;
          text-decoration: none;
          transition: opacity .15s;
          letter-spacing: -.01em;
        }
        .btn-primary:hover { opacity: .88; }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--text);
          font-weight: 600;
          font-size: .9rem;
          padding: 13px 24px;
          border-radius: 999px;
          text-decoration: none;
          border: 1px solid var(--border);
          transition: border-color .15s, color .15s;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,.2); color: #fff; }

        /* ── misc ───────────────────────────────────── */
        .ab .origin-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: .75rem;
          color: var(--muted);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px 12px;
          margin-bottom: 24px;
        }
        .ab .origin-tag::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--teal);
          flex-shrink: 0;
        }
      `}</style>

      <div className="ab">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="ab-hero">
          <div className="wrap">
            <div className="origin-tag">Engineered in Germany · Est. 2024</div>
            <h1>We built what we couldn&apos;t find.<br /><em>A framework for reading the market.</em></h1>
            <p className="lead" style={{ marginTop: '24px' }}>
              OrcaTrading is a multi-timeframe screener, a journal that grades the decision, a free academy,
              and the room where it all gets practised together.{' '}
              <strong>All of it runs on one set of rules, because contradicting yourself is how most traders
              fail.</strong>
            </p>
            <p className="origin">
              Trading is one of the few things people are expected to learn alone, from strangers selling certainty.
              The gap that creates is the reason all of this exists.
            </p>
          </div>
        </section>

        {/* ── PHILOSOPHY ────────────────────────────────────── */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The philosophy</div>
              <h2>Process over profit. Honesty over hype.</h2>
              <p>
                Every part of OrcaTrading was built on the same three convictions.
                They sound simple. They are not common.
              </p>
            </div>
            <div className="ab-pillars">
              <div className="ab-pillar">
                <span className="ab-pillar__icon">🎯</span>
                <h3>Start at the actual beginning</h3>
                <p>
                  Most trading education assumes you know what a market is and jumps straight to setups.
                  We go back further than that — to what a market is, what moves price, what liquidity
                  actually means. It costs nothing, because the foundations should not be behind a paywall.
                </p>
              </div>
              <div className="ab-pillar">
                <span className="ab-pillar__icon">📐</span>
                <h3>One vocabulary, all the way through</h3>
                <p>
                  What the screener calls a valid setup is what the journal grades you against, what the
                  Academy teaches you to spot, and what The Pod pulls apart afterwards. Nothing here
                  contradicts itself, because it all reads the market the same way.
                </p>
              </div>
              <div className="ab-pillar">
                <span className="ab-pillar__icon">🔍</span>
                <h3>Grade the decision, not the outcome</h3>
                <p>
                  A lucky trade is not a good trade. A good decision that loses is still a good decision.
                  The journal is built on that distinction — it scores how the decision was made,
                  stage by stage, so that what you can actually control is what improves over time.
                </p>
              </div>
              <div className="ab-pillar">
                <span className="ab-pillar__icon">🤝</span>
                <h3>No shortcut exists</h3>
                <p>
                  Nobody here will sell you one. The system will tell you when conditions are not there.
                  The journal will record a no trade as a clean outcome, not a blank day. That is the
                  whole design: do the right thing, honestly, every time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOUNDER ───────────────────────────────────────── */}
        <section className="ab-section">
          <div className="wrap">
            <div className="ab-founder">
              <div className="ab-founder__avatar">B</div>
              <div className="ab-founder__text">
                <div className="eyebrow">The founder</div>
                <h2>Built by a trader, for traders.</h2>
                <p>
                  OrcaTrading was founded by <strong>Bennie</strong> — a trader who got tired of the gap
                  between what trading education promises and what it actually delivers. The tools were
                  built because they were needed, not because there was a market opportunity. The academy
                  is free because Bennie knows what it costs to learn this without one.
                </p>
                <p>
                  The Pod is not a course library behind a paywall. It is a room where Bennie is present
                  every week — calling out setups, reviewing decisions, pulling apart wins and losses in
                  front of everyone who needs to see it. That is not scalable. That is the point.
                </p>
                <p>
                  OrcaBot 2.0 came from the same conviction applied to execution: most traders do not
                  fail because their read was wrong. They fail in the space between the read and the
                  trade. OrcaBot removes that space.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THE FRAMEWORK ─────────────────────────────────── */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">The Orca framework</div>
              <h2>OTOS. The decision process that runs everything.</h2>
              <p>
                OTOS is the structured way of thinking through any market situation, stage by stage,
                with a clear exit at each one. It is what the journal runs on, what the Academy teaches,
                and what The Pod practises. Not a system you learn once — a process you repeat until
                it becomes how you think.
              </p>
            </div>
            <div className="ab-framework">
              <h3>One vocabulary. Seven stages.</h3>
              <p>
                Read the world. Check yourself. Pass the green light gates. Pick the play. Size it.
                Draw the line. Learn from what happens. At any stage, stopping honestly is a logged
                success — not an empty day, not a failure.
              </p>
              <p style={{ marginTop: '12px' }}>
                The vocabulary that runs through every tool — screener columns, journal fields,
                Academy lessons, Pod discussions — is built from the same core concepts:
              </p>
              <div className="ab-vocab">
                {['State','Location','Liquidity','Pressure','Test','Effort vs Result',
                  'Failure','Release','Expectation','Opportunity','Execution'].map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── THE PRODUCTS ──────────────────────────────────── */}
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
                  Reads 36 instruments across five timeframes on one row. Bias bars, alignment scored
                  out of four, Orca status, ML forecast and forward state. The answer to the question:
                  what do conditions look like right now, across the whole market?
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--live">Live</span>
                <h3>OrcaJournal</h3>
                <p>
                  Grades the decision, not the profit. Runs the OTOS funnel stage by stage and scores
                  your process A+ to D. Because a lucky win cannot be repeated, and a good process that
                  lost can be.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--free">Free · Always</span>
                <h3>Orca Academy</h3>
                <p>
                  Starts at what a market actually is — not at setups. No prior knowledge assumed.
                  No cost anywhere in it. No upsell wall halfway through. You can finish all of it and
                  use the free screener without ever paying for anything.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--member">Membership</span>
                <h3>The Pod</h3>
                <p>
                  Weekly calls. Chart reviews. A library that goes past the Academy. A room where
                  Bennie is present and where decisions get pulled apart honestly in front of the people
                  who need to see it. €19.99/month. Cancel any time.
                </p>
              </div>
              <div className="ab-product">
                <span className="ab-product__tag ab-product__tag--early">Early access</span>
                <h3>OrcaBot 2.0</h3>
                <p>
                  Hybrid automated trading for cTrader. You set the directional bias — one decision per
                  day. The system handles entries, exits, risk, and trade management. Five-layer
                  validation means it only fires when conditions are actually there.
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

        {/* ── COMMUNITY ─────────────────────────────────────── */}
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
                Beginners ask the questions experienced traders stopped asking — and should not have.
                Experienced traders answer them and find out what they only half understood.
                That is most of the value in any serious trading education, and it only works if
                neither group is locked away from the other.
              </p>
              <p>
                The Academy is free so the room stays mixed. The Pod membership goes further — into
                the depth, the coaching, the library — but the foundation is always open.
                Because a community that only talks to itself stops learning.
              </p>
              <p>
                OrcaBot clients get their own private hub — direct support, live updates, strategy
                documents, and a team that is present every day. When you buy OrcaBot you are not
                buying a file. You are entering a relationship with the people who built it.
              </p>
            </div>
          </div>
        </section>

        {/* ── HONEST ────────────────────────────────────────── */}
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
                  <li>A screener that tells you when conditions are not there — which is most of the time</li>
                  <li>A journal that grades process, so improving is possible rather than optional</li>
                  <li>An academy that starts from zero, for free, with no upsell wall</li>
                  <li>A community where the team is present and questions are answered directly</li>
                  <li>Tools built by a trader for traders, that say so when the setup is not valid</li>
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
                  <li>Another course that jumps to setups before you understand what a market is</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── ORIGIN / WHERE WE ARE ─────────────────────────── */}
        <section className="ab-section">
          <div className="wrap">
            <div className="head">
              <div className="eyebrow">Where we are</div>
              <h2>Early, growing, and building in public.</h2>
              <p>
                OrcaTrading is built in Germany by a small team that trades the same markets,
                uses the same tools, and argues in the same Discord as every member.
                We are not a finished product — we are a growing system that gets better because
                the people using it tell us how.
              </p>
            </div>
            <p style={{ maxWidth: '620px', fontSize: '1.05rem' }}>
              The screener is live. The journal is live. The Academy is being built out.
              OrcaBot 2.0 is in early access with its first clients running it live.
              The Pod Library is growing. The webhook API, broker integration, and risk calculator
              are on the roadmap.
            </p>
            <p style={{ maxWidth: '620px', fontSize: '1.05rem', marginTop: '16px' }}>
              Early adopters lock in their prices. Clients get to request features directly.
              The team reads every message. That is not a marketing claim —
              it is how the system has been built so far, and it is the only way to build something
              worth using.
            </p>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className="ab-cta">
          <div className="wrap">
            <h2>Start with the free parts. There are a lot of them.</h2>
            <p>
              The Academy. The screener free tier. The Discord. None of it requires a card,
              and none of it becomes paid halfway through.
            </p>
            <div className="ab-cta__btns">
              <a href={DISCORD_URL} className="btn-primary" target="_blank" rel="noopener noreferrer">
                Join the Discord
              </a>
              <a href="/#academy" className="btn-ghost">
                Start the Academy
              </a>
            </div>
            <p style={{ fontSize: '.85rem', marginTop: '20px' }}>
              Or{' '}
              <a href="/" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
                go back to the full overview →
              </a>
            </p>
          </div>
        </section>

      </div>
    </>
  )
}
