// app/(marketing)/page.tsx
import { Metadata } from 'next'
import { MessageCircle, TrendingUp, Zap, Shield, Users, ArrowRight } from 'lucide-react'

// SEO Optimization - Metadata
export const metadata: Metadata = {
  title: 'OrcaTrading - Smart Trading Automation & Market Analytics',
  description: 'Advanced trading screener with real-time multi-timeframe trend analysis. Automate your trading strategy with transparent, data-driven insights. Free during beta.',
  keywords: 'trading automation, market screener, trend analysis, trading bot, technical analysis, forex screener, crypto screener, stock screener',
  authors: [{ name: 'OrcaTrading' }],
  openGraph: {
    title: 'OrcaTrading - Smart Trading Automation & Market Analytics',
    description: 'Advanced trading screener with real-time multi-timeframe trend analysis. Free during beta.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OrcaTrading - Smart Trading Automation',
    description: 'Advanced trading screener with real-time trend analysis. Free during beta.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function Page() {
  return (
    <>
      {/* ---------- HERO SECTION ---------- */}
      <header className="section no-x-scroll" style={{ paddingTop: 'clamp(3rem, 8vw, 5rem)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
            <p className="eyebrow">Engineered in Germany 🇩🇪</p>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: '1.2',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #9cd3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Automate, Analyze, Trade Smarter
            </h1>
            <p style={{ 
              maxWidth: '700px', 
              color: "#b7c6d8", 
              marginTop: "1rem",
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              margin: '0 auto',
              lineHeight: '1.7',
            }}>
              Real-time multi-timeframe trend analysis with transparent, data-driven insights. 
              Join our community of smart traders.
            </p>

            {/* Primary CTA - Single, clear action */}
            <div style={{ 
              display: "flex", 
              gap: "1rem", 
              marginTop: "2rem",
              justifyContent: 'center',
              flexWrap: "wrap" 
            }}>
              <a 
                className="btn btn--primary" 
                href="/dashboard"
                style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
              >
                Try Free Screener
                <ArrowRight style={{ marginLeft: '0.5rem', width: '18px', height: '18px' }} />
              </a>
              <a 
                className="btn btn--ghost" 
                href="#community"
                style={{ fontSize: '1.05rem', padding: '1rem 2rem' }}
              >
                <MessageCircle style={{ marginRight: '0.5rem', width: '18px', height: '18px' }} />
                Join Discord
              </a>
            </div>

            {/* Social proof */}
            <div style={{ 
              marginTop: '2.5rem', 
              paddingTop: '2rem',
              borderTop: '1px solid rgba(157, 180, 201, 0.1)',
              display: 'flex',
              gap: '2rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '0.9rem',
              color: '#9db4c9',
            }}>
              <div>
                <strong style={{ color: '#67ffd1', fontSize: '1.2rem' }}>35ms</strong>
                <div>Avg. latency</div>
              </div>
              <div>
                <strong style={{ color: '#67ffd1', fontSize: '1.2rem' }}>24/7</strong>
                <div>Live monitoring</div>
              </div>
              <div>
                <strong style={{ color: '#67ffd1', fontSize: '1.2rem' }}>Free</strong>
                <div>During beta</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- FEATURES SECTION ---------- */}
      <section className="section" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="container">
          <h2 style={{ 
            marginBottom: "2.5rem", 
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          }}>
            Why traders choose OrcaTrading
          </h2>

          <div className="grid grid--3">
            <article className="tile" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #24c6ff 0%, #0ea5e9 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(36, 198, 255, 0.25)',
              }}>
                <Shield style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>Transparent & Trustworthy</h3>
              <p style={{ color: '#b7c6d8' }}>
                Rules-based algorithms verified with 12 months of live test data. 
                No black boxes, no hidden risks.
              </p>
            </article>

            <article className="tile" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)',
              }}>
                <Zap style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>Real-Time Insights</h3>
              <p style={{ color: '#b7c6d8' }}>
                Multi-timeframe trend analysis delivered in seconds. 
                Make informed decisions with live market data.
              </p>
            </article>

            <article className="tile" style={{ textAlign: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 1rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)',
              }}>
                <Users style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <h3 style={{ marginBottom: '0.75rem' }}>Community-Driven</h3>
              <p style={{ color: '#b7c6d8' }}>
                Built with trader feedback. Join our Discord to shape features 
                and share strategies.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- PRODUCT SHOWCASE ---------- */}
      <section id="products" className="section" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="container">
          <h2 style={{ 
            marginBottom: "2.5rem", 
            textAlign: 'center',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          }}>
            Powerful tools for modern traders
          </h2>
          
          <div className="grid grid--3">
            <article className="card--elevated">
              <div style={{
                width: '40px',
                height: '40px',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #00D4FF 0%, #0EA5E9 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp style={{ width: '22px', height: '22px', color: 'white' }} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Premium Screener</h3>
              <p style={{ color: '#b7c6d8', marginBottom: '1rem' }}>
                Multi-timeframe trend analysis with intraday, daily, and advanced indicators. 
                Spot opportunities across forex, crypto, stocks, and indices.
              </p>
              <a 
                href="/dashboard" 
                style={{ 
                  color: '#24c6ff', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 600,
                }}
              >
                Try now (Free)
                <ArrowRight style={{ marginLeft: '0.5rem', width: '16px', height: '16px' }} />
              </a>
            </article>

            <article className="tile">
              <h3 style={{ marginBottom: '0.5rem', opacity: 0.7 }}>
                OrcaBot
                <span style={{ 
                  marginLeft: '0.5rem',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}>
                  Coming Soon
                </span>
              </h3>
              <p style={{ color: '#9db4c9' }}>
                Automated trend-following bot with customizable strategy parameters, 
                risk controls, and detailed execution logs.
              </p>
            </article>

            <article className="tile">
              <h3 style={{ marginBottom: '0.5rem', opacity: 0.7 }}>
                OrcaJournal
                <span style={{ 
                  marginLeft: '0.5rem',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '4px',
                  fontWeight: 700,
                }}>
                  Coming Soon
                </span>
              </h3>
              <p style={{ color: '#9db4c9' }}>
                Track performance metrics, analyze expectancy, and get AI-powered 
                insights for continuous improvement.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- PRICING SECTION ---------- */}
      <section id="pricing" className="section" aria-label="Pricing" style={{ paddingTop: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ 
              marginBottom: "0.75rem",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: '#b7c6d8', fontSize: '1.1rem' }}>
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="pricing">
            {/* Beta Offer - Highlighted */}
            <div className="pricing__beta" style={{ 
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto 3rem',
            }}>
              <h3 style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
                fontSize: 'clamp(1.5rem, 3vw, 1.75rem)',
              }}>
                Premium Screener
                <span style={{ 
                  color: '#7ee6ff',
                  fontWeight: 800,
                  fontSize: 'clamp(1.75rem, 4vw, 2rem)',
                }}>
                  Free
                </span>
              </h3>
              <p style={{ 
                color: '#67ffd1',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}>
                🎉 Free during beta - Full access, no credit card required
              </p>
              <ul className="ul" style={{ 
                textAlign: 'left',
                maxWidth: '400px',
                margin: '0 auto 1.5rem',
                listStyle: 'none',
                padding: 0,
              }}>
                <li style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                  Real-time multi-timeframe analysis
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                  All asset classes (Forex, Crypto, Stocks)
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                  Custom watchlists & alerts
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                  Discord community access
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative', marginBottom: '0.5rem' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#10b981' }}>✓</span>
                  Priority feature requests
                </li>
              </ul>
              <a 
                className="btn btn--primary" 
                href="/dashboard"
                style={{ 
                  fontSize: '1.1rem',
                  padding: '1rem 2.5rem',
                  boxShadow: '0 0 0 8px rgba(36, 198, 255, 0.15)',
                }}
              >
                Start Trading Smarter
              </a>
            </div>

            {/* Future Plans Teaser */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ 
                margin: '0 0 1.5rem', 
                fontWeight: 600, 
                color: "#9db4c9",
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Coming after V1 launch
              </p>

              <div className="pricing__plans">
                <article className="plan">
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Starter
                    <span className="plan__price" style={{ marginLeft: '0.5rem' }}>Free</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#9db4c9', marginBottom: '1rem' }}>
                    Always free forever
                  </p>
                  <ul className="ul" style={{ fontSize: '0.9rem', color: '#b7c6d8' }}>
                    <li>Daily regime overview</li>
                    <li>Basic trend indicators</li>
                    <li>Email support</li>
                  </ul>
                </article>

                <article className="plan" style={{
                  border: '2px solid #24c6ff',
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg, #24c6ff 0%, #0ea5e9 100%)',
                    color: 'white',
                    padding: '0.25rem 1rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Most Popular
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Premium
                    <span className="plan__price" style={{ marginLeft: '0.5rem' }}>€8.99/mo</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#9db4c9', marginBottom: '1rem' }}>
                    For serious traders
                  </p>
                  <ul className="ul" style={{ fontSize: '0.9rem', color: '#b7c6d8' }}>
                    <li>Everything in Free</li>
                    <li>Advanced alerts & filters</li>
                    <li>API access</li>
                    <li>Priority support</li>
                  </ul>
                </article>

                <article className="plan">
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Institutional
                    <span className="plan__price" style={{ marginLeft: '0.5rem' }}>Custom</span>
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#9db4c9', marginBottom: '1rem' }}>
                    For teams & funds
                  </p>
                  <ul className="ul" style={{ fontSize: '0.9rem', color: '#b7c6d8' }}>
                    <li>White-label solutions</li>
                    <li>Dedicated infrastructure</li>
                    <li>SLA guarantees</li>
                    <li>Onboarding & training</li>
                  </ul>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- COMMUNITY / DISCORD SECTION ---------- */}
      <section 
        id="community" 
        className="section" 
        style={{ 
          paddingTop: 'clamp(3rem, 6vw, 5rem)',
          paddingBottom: 'clamp(3rem, 6vw, 5rem)',
        }}
      >
        <div className="container">
          <div className="card--elevated" style={{ 
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3rem)',
            background: 'radial-gradient(120% 120% at 50% 0%, rgba(88, 101, 242, 0.15), transparent 50%), #0f1924',
            border: '1px solid rgba(88, 101, 242, 0.3)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1.5rem',
              background: '#5865F2',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(88, 101, 242, 0.3)',
            }}>
              <MessageCircle style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>

            <h2 style={{ 
              marginBottom: "1rem",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}>
              Join our trading community
            </h2>
            <p style={{ 
              color: '#b7c6d8',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              lineHeight: '1.7',
            }}>
              Connect with fellow traders, get real-time support, share strategies, 
              and help shape the future of OrcaTrading. Our team is active daily.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#5865F2',
                  marginBottom: '0.25rem',
                }}>
                  24/7
                </div>
                <div style={{ fontSize: '0.9rem', color: '#9db4c9' }}>
                  Community Support
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#5865F2',
                  marginBottom: '0.25rem',
                }}>
                  Active
                </div>
                <div style={{ fontSize: '0.9rem', color: '#9db4c9' }}>
                  Daily Updates
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 700, 
                  color: '#5865F2',
                  marginBottom: '0.25rem',
                }}>
                  Free
                </div>
                <div style={{ fontSize: '0.9rem', color: '#9db4c9' }}>
                  Always & Forever
                </div>
              </div>
            </div>

            <a 
              className="btn btn--primary" 
              href="https://discord.gg/your-invite-code"
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                background: '#5865F2',
                fontSize: '1.1rem',
                padding: '1rem 2.5rem',
                boxShadow: '0 0 0 8px rgba(88, 101, 242, 0.15)',
              }}
            >
              <MessageCircle style={{ marginRight: '0.75rem', width: '20px', height: '20px' }} />
              Join Discord Community
            </a>

            <p style={{ 
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: '#9db4c9',
            }}>
              Get instant access to exclusive channels, market insights, and beta features
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="section" style={{ paddingBottom: 'clamp(4rem, 8vw, 6rem)' }}>
        <div className="container">
          <div style={{
            textAlign: 'center',
            padding: 'clamp(2.5rem, 5vw, 4rem)',
            background: 'linear-gradient(135deg, rgba(36, 198, 255, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)',
            border: '1px solid rgba(36, 198, 255, 0.2)',
            borderRadius: '24px',
          }}>
            <h2 style={{ 
              marginBottom: "1rem",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            }}>
              Ready to trade smarter?
            </h2>
            <p style={{ 
              color: '#b7c6d8',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}>
              Join hundreds of traders using OrcaTrading to make better decisions
            </p>
            <a 
              className="btn btn--primary" 
              href="/dashboard"
              style={{ 
                fontSize: '1.1rem',
                padding: '1.1rem 3rem',
              }}
            >
              Get Started Free
              <ArrowRight style={{ marginLeft: '0.75rem', width: '20px', height: '20px' }} />
            </a>
          </div>
        </div>
      </section>

      <div className="page-bottom-safe" />
    </>
  )
}
