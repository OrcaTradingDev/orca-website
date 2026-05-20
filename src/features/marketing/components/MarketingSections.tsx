import {
  MessageCircle, TrendingUp, Zap, Shield, Users,
  ArrowRight, Bot, BarChart3, Star, Check,
} from 'lucide-react';
import s from './marketing.module.css';

const DISCORD_URI = process.env.NEXT_PUBLIC_DISCORD_URI ?? 'https://discord.gg/your-invite-code';

const STATS = [
  { val: '35ms', lbl: 'Avg. latency' },
  { val: '24/7', lbl: 'Live monitoring' },
  { val: 'Free', lbl: 'During beta' },
  { val: '12mo', lbl: 'Live test data' },
] as const;

const TRUST_ITEMS = [
  'Rules-based algorithms', 'Multi-asset coverage', 'Personal onboarding',
  'Private Discord community', 'Supportive Eco-System',
] as const;

const FEATURES = [
  { icon: Shield, color: 'var(--color-primary)', bg: 'linear-gradient(135deg,rgba(0,212,255,.13),rgba(0,212,255,.05))', border: 'rgba(0,212,255,0.18)', title: 'Transparent & Verified', desc: 'Rules-based algorithms backed by 12 months of live data. No black boxes, no hidden risks — just clear, accountable logic.' },
  { icon: Zap, color: 'var(--color-success)', bg: 'linear-gradient(135deg,rgba(15,186,126,.13),rgba(15,186,126,.05))', border: 'rgba(15,186,126,0.18)', title: 'Real-Time Insights', desc: 'Multi-timeframe trend analysis in seconds. Spot opportunities across forex, crypto, stocks, and indices before the crowd.' },
  { icon: Users, color: '#818cf8', bg: 'linear-gradient(135deg,rgba(129,140,248,.13),rgba(129,140,248,.05))', border: 'rgba(129,140,248,0.18)', title: 'Community-Driven', desc: 'Built alongside active traders. Join our Discord to shape features, share strategies, and get direct daily access to the team.' },
] as const;

const ORCA_CHECKS = [
  'Hybrid automation — human direction, machine execution',
  'Five-layer filtering — only high-quality setups',
  'Built-in safety — filters protect you even when wrong',
  'Minutes per day — set it and walk away',
] as const;

const TRADE_CARDS = [
  { bg: 'rgba(15,186,126,0.12)', Icon: TrendingUp, color: 'var(--color-success)', pair: 'EURUSD · Long Entry', sub: 'All 5 layers confirmed · Risk 1%', badge: 'Executed', badgeCls: 'tradeBadgeGreen' },
  { bg: 'var(--color-primary-10)', Icon: Shield, color: 'var(--color-primary)', pair: 'GBPJPY · Filter Active', sub: 'Momentum layer pending', badge: 'Waiting', badgeCls: 'tradeBadgeCyan' },
  { bg: 'rgba(255,255,255,0.04)', Icon: BarChart3, color: 'var(--color-muted)', pair: 'XAUUSD · Setup Skipped', sub: 'Conditions not met · Protected', badge: 'Skipped', badgeCls: 'tradeBadgeDim' },
] as const;

const PRODUCTS = [
  { href: '/dashboard', icon: BarChart3, iconBg: 'var(--color-primary-10)', iconBorder: 'rgba(0,212,255,0.22)', iconColor: 'var(--color-primary)', tag: 'Live · Free', tagCls: 'productTagLive', title: 'Premium Screener', desc: 'Multi-timeframe trend analysis with intraday, daily, and advanced indicators. Spot opportunities across forex, crypto, stocks, and indices.', linkLabel: 'Try now (Free)', dim: false },
  { href: '/orcabot', icon: Bot, iconBg: 'var(--color-primary-10)', iconBorder: 'rgba(0,212,255,0.20)', iconColor: 'var(--color-primary)', tag: 'Early Access', tagCls: 'productTagEarly', title: 'OrcaBot 2.0', desc: 'Hybrid automated trading. You set the direction. The system handles execution, risk, and trade management. One decision per day.', linkLabel: 'Learn more', dim: false },
  { href: '#', icon: Star, iconBg: 'rgba(129,140,248,0.1)', iconBorder: 'rgba(129,140,248,0.15)', iconColor: '#818cf8', tag: 'Coming Soon', tagCls: 'productTagSoon', title: 'OrcaJournal', desc: 'Track performance metrics, analyze expectancy, and get AI-powered insights for continuous improvement in your trading.', linkLabel: 'In development', dim: true },
] as const;

const BETA_FEATURES = [
  'Real-time multi-timeframe analysis', 'All asset classes (Forex, Crypto, Stocks)',
  'Custom watchlists & alerts', 'Discord community access',
  'Priority feature requests', 'No credit card needed',
] as const;

const PLANS = [
  { name: 'Starter', price: 'Free', priceSub: 'forever', pop: false, feats: ['Daily regime overview', 'Basic trend indicators', 'Email support'] },
  { name: 'Premium', price: '€8.99', priceSub: '/ mo', pop: true, feats: ['Everything in Free', 'Advanced alerts & filters', 'API access', 'Priority support'] },
  { name: 'Institutional', price: 'Custom', priceSub: '', pop: false, feats: ['White-label solutions', 'Dedicated infrastructure', 'SLA guarantees', 'Onboarding & training'] },
] as const;

const DISCORD_STATS = [
  { val: '24/7', lbl: 'Community Support' },
  { val: 'Active', lbl: 'Daily Updates' },
  { val: 'Free', lbl: 'Always & Forever' },
] as const;

// ─────────────────────────────────────────────────────────────
export function HeroSection() {
  return (
    <section className={s.hero}>
      <div className={s.heroMesh} />
      <div className={s.heroDots} />
      <div className={s.heroLine} />
      <div className={s.wrap} style={{ position: 'relative' }}>
        <div className={s.badge}><span className={s.badgeDot} />Engineered in Germany</div>
        <h1 className={s.h1}>
          Automate, Analyze,<br />
          <span className={s.shimmer}>Trade Smarter.</span>
        </h1>
        <p className={s.sub}>
          Real-time multi-timeframe trend analysis with transparent, data-driven insights.
          Built for traders who want an edge — not a guessing game.
        </p>
        <div className={s.ctas}>
          <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="/dashboard">Try Free Screener <ArrowRight size={17} /></a>
          <a className={`${s.btn} ${s.btnGhost} ${s.btnLg}`} href="/orcabot"><Bot size={17} /> OrcaBot 2.0</a>
        </div>
        <div className={s.stats}>
          {STATS.map(st => (
            <div key={st.val}>
              <div className={s.statVal}>{st.val}</div>
              <div className={s.statLbl}>{st.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustBar() {
  return (
    <div className={s.trust}>
      <div className={`${s.trustInner} ${s.wrap}`}>
        {TRUST_ITEMS.map(t => (
          <div key={t} className={s.trustItem}><span className={s.trustDot} />{t}</div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className={s.section}>
      <div className={s.wrap}>
        <div className={s.textCenter} style={{ maxWidth: 620, marginInline: 'auto' }}>
          <p className={s.label} style={{ justifyContent: 'center' }}>Why OrcaTrading</p>
          <h2 className={s.h2}>Built Different. <em>By Design.</em></h2>
          <p className={s.lead} style={{ marginInline: 'auto', textAlign: 'center' }}>
            Every signal verified with live data. Every rule transparent. Every tool engineered to give you a real, measurable edge.
          </p>
        </div>
        <div className={s.featGrid}>
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={s.feat}>
                <div className={s.featIcon} style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <Icon size={24} color={f.color} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function OrcaBotFeatureSection() {
  return (
    <section className={s.section}>
      <div className={s.wrap}>
        <p className={s.label} style={{ marginBottom: '1.75rem' }}>Featured Product</p>
        <div className={s.orca}>
          <div className={s.orcaLeft}>
            <div className={s.orcaBadge}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'inline-block', boxShadow: '0 0 6px var(--color-primary)' }} />
              Early Access · Limited Spots
            </div>
            <h2 className={s.orcaTitle}>OrcaBot 2.0<br /><em>One Decision.<br />Precision Execution.</em></h2>
            <p className={s.orcaDesc}>
              The hybrid automated trading system that removes execution errors while keeping you in control.
              You set the bias — the system handles entries, risk, and exits. No emotion. No errors.
            </p>
            <div className={s.orcaChecks}>
              {ORCA_CHECKS.map(t => (
                <div key={t} className={s.orcaCheck}><Check size={16} /> {t}</div>
              ))}
            </div>
            <div className={s.orcaCtas}>
              <a className={`${s.btn} ${s.btnPrimary}`} href="/orcabot">Learn More <ArrowRight size={16} /></a>
              <a className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} href="/orcabot#pricing">See Pricing</a>
            </div>
          </div>
          <div className={s.orcaRight}>
            <div className={s.cards}>
              {TRADE_CARDS.map(tc => {
                const Icon = tc.Icon;
                return (
                  <div key={tc.pair} className={s.tradeCard}>
                    <div className={s.tradeIcon} style={{ background: tc.bg }}><Icon size={20} color={tc.color} /></div>
                    <div className={s.tradeInfo}><h4>{tc.pair}</h4><p>{tc.sub}</p></div>
                    <span className={`${s.tradeBadge} ${s[tc.badgeCls as keyof typeof s]}`}>{tc.badge}</span>
                  </div>
                );
              })}
            </div>
            <div className={s.priceCallout}>
              <div>
                <div className={s.priceCalloutLabel}>Phase 1 — Early Access</div>
                <div className={s.priceCalloutAmount}>€500</div>
                <div className={s.priceCalloutSub}>One-time · Price locks at entry</div>
              </div>
              <div className={s.priceCalloutRight}>
                Price increases each phase.<strong>Early adopters locked forever.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsSection() {
  return (
    <section className={s.section} id="products">
      <div className={s.wrap}>
        <p className={s.label}>Our Tools</p>
        <h2 className={s.h2}>Powerful Tools<br /><em>For Modern Traders.</em></h2>
        <div className={s.productsGrid}>
          {PRODUCTS.map(prod => {
            const Icon = prod.icon;
            const Wrapper = prod.dim ? 'div' : 'a';
            const extraProps = prod.dim ? {} : { href: prod.href };
            return (
              <Wrapper
                key={prod.title}
                {...extraProps}
                className={`${s.product}${prod.dim ? ` ${s.productDim}` : ''}`}
              >
                <div className={s.productHead}>
                  <div className={s.productIcon} style={{ background: prod.iconBg, border: `1px solid ${prod.iconBorder}` }}>
                    <Icon size={20} color={prod.iconColor} />
                  </div>
                  <span className={`${s.productTag} ${s[prod.tagCls as keyof typeof s]}`}>{prod.tag}</span>
                </div>
                <h3>{prod.title}</h3>
                <p>{prod.desc}</p>
                <span className={`${s.productLink}${prod.dim ? ` ${s.productLinkDim}` : ''}`}>{prod.linkLabel}{!prod.dim && <ArrowRight size={14} />}</span>
              </Wrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className={s.section} id="pricing">
      <div className={s.wrap}>
        <div className={`${s.textCenter} ${s.mb6}`} style={{ maxWidth: 540, marginInline: 'auto', marginBottom: '2.5rem' }}>
          <p className={s.label} style={{ justifyContent: 'center' }}>Pricing</p>
          <h2 className={s.h2}>Simple. <em>Transparent.</em></h2>
          <p className={s.lead} style={{ marginInline: 'auto', textAlign: 'center' }}>Start free. Upgrade when you're ready.</p>
        </div>
        <div className={s.pricingHero}>
          <div className={s.betaTag}>🎉 Free During Beta — No Credit Card Required</div>
          <div className={s.freeNum}>Free</div>
          <p className={s.pricingDesc}>Full access to the Premium Screener while we're in beta. No cost, no limits, no commitment.</p>
          <ul className={s.featList}>
            {BETA_FEATURES.map(t => <li key={t}>{t}</li>)}
          </ul>
          <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="/dashboard" style={{ position: 'relative', zIndex: 1 }}>
            Start Trading Smarter <ArrowRight size={18} />
          </a>
        </div>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
          Plans after launch
        </p>
        <div className={s.plans}>
          {PLANS.map(plan => (
            <div key={plan.name} className={`${s.plan}${plan.pop ? ` ${s.planPop}` : ''}`}>
              {plan.pop && <div className={s.planBadge}>Most Popular</div>}
              <div className={s.planName}>{plan.name}</div>
              <div className={s.planPrice}>{plan.price}{plan.priceSub && <span> {plan.priceSub}</span>}</div>
              {plan.feats.map(f => <div key={f} className={s.planFeat}>{f}</div>)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiscordSection() {
  return (
    <section className={s.section} id="community">
      <div className={s.wrap}>
        <div className={s.discord}>
          <div className={s.discordIcon}><MessageCircle size={32} color="white" /></div>
          <h2>Join Our Trading Community</h2>
          <p>Connect with fellow traders, get real-time support, share strategies, and help shape OrcaTrading. Our team is active every day.</p>
          <div className={s.discordStats}>
            {DISCORD_STATS.map(ds => (
              <div key={ds.val}><div className={s.dsVal}>{ds.val}</div><div className={s.dsLbl}>{ds.lbl}</div></div>
            ))}
          </div>
          <a className={`${s.btn} ${s.btnDiscord} ${s.btnLg}`} href={DISCORD_URI} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={20} /> Join Discord Community
          </a>
          <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--color-muted)' }}>
            Instant access to exclusive channels, market insights, and beta features
          </p>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className={s.section} style={{ paddingBottom: 'clamp(5rem, 10vw, 7rem)' }}>
      <div className={s.wrap}>
        <div className={s.ctaStrip}>
          <h2>Ready to Trade Smarter?</h2>
          <p>Join traders using OrcaTrading for a real edge — free screener, hybrid automation, and a community that actually helps.</p>
          <div className={s.ctaButtons}>
            <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="/dashboard">Get Started Free <ArrowRight size={18} /></a>
            <a className={`${s.btn} ${s.btnGhost}`} href="/orcabot">Explore OrcaBot</a>
          </div>
        </div>
      </div>
    </section>
  );
}
