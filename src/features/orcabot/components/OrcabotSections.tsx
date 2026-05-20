import { ArrowRight, Check, X, Shield, Zap, Clock, Users, MessageCircle, BookOpen, FileText, Headphones, Monitor, Star, Quote } from 'lucide-react';
import s from './orcabot.module.css';

const DISCORD_URI = process.env.NEXT_PUBLIC_DISCORD_URI ?? 'https://discord.gg/your-invite-code';

const PROBLEM_CARDS = [
  { title: 'Bad entries & inconsistent execution', desc: 'Chasing price, entering differently every time. No repeatability.' },
  { title: 'Emotional decision-making', desc: 'Revenge trades. Panic exits. Ignoring rules when it matters most.' },
  { title: 'Overtrading', desc: "Taking setups that aren't there — because sitting still feels wrong." },
  { title: 'No structure', desc: 'Every day is different. No process. Nothing to rely on.' },
];

const PILLARS = [
  { num: '01', title: 'You Decide', desc: "Set your directional bias — up or down. One clear decision per day. That's your only job." },
  { num: '02', title: 'The System Filters', desc: "Momentum, structure, and timing must all align before any entry triggers. If they don't, no trade is taken." },
  { num: '03', title: 'Execution is Automatic', desc: 'Entries, risk, trade management, and exits. Same structure. Every single time. No emotion. No error.' },
];

const LAYERS_LEFT = [
  { num: '1', title: 'Directional Bias', desc: "You look at the daily chart and set one bias: long or short. That's your only input. No execution decisions happen here — it's purely a directional filter." },
  { num: '2', title: 'Momentum Alignment', desc: 'The system monitors market conditions across multiple lower timeframes. Only when sustained directional pressure is detected — not random volatility — does it proceed.' },
  { num: '3', title: 'Structural Confirmation', desc: 'Even with aligned momentum, the system waits. Price must expand, retrace, then confirm intent in the original direction. No confirmation, no trade.' },
];

const LAYERS_RIGHT = [
  { num: '4', title: 'Precision Entry', desc: 'Execution triggers only when all prior conditions are met. A rule-based entry model ensures no chasing, confirmed reaction, and full consistency across every trade.' },
  { num: '5', title: 'Risk & Trade Management', desc: 'Every trade is managed with predefined parameters. Fixed risk, predetermined exits, zero manual interference. The same structure, every single time.' },
];

const RECEIVE_ITEMS = [
  { num: '1', title: 'Licensed Access to OrcaBot', desc: 'Your personal license key for the automated execution system. Secured to your cTrader username — non-transferable.' },
  { num: '2', title: 'Private Client Hub (Discord)', desc: 'Updates, direct support, community, and the ability to request improvements directly from the team.' },
  { num: '3', title: 'Ongoing Support', desc: "Fast answers, guidance, and direct communication with the team. You're never on your own." },
  { num: '4', title: 'Setup & Usage Manuals', desc: 'Step-by-step guides to set up correctly and avoid common mistakes. Everything you need from day one.' },
  { num: '5', title: 'Personal Onboarding Call', desc: '1-on-1 call for smooth setup and confidence from day one. We walk you through the entire process.' },
  { num: '6', title: 'Access to Future Updates', desc: 'Improvements, new features, and the ability to provide feedback. Early adopters lock in their price forever.' },
];

const PHASES = [
  { phase: 'Phase 1 — Early Access', price: '€500', current: true },
  { phase: 'Phase 2 — Validated', price: '€1,000', current: false },
  { phase: 'Phase 3 — Expansion', price: '€1,500', current: false },
  { phase: 'Phase 4 — Established', price: '€2,500', current: false },
  { phase: 'Phase 5 — Exclusive', price: '€3,500', current: false },
];

const FAQS = [
  { q: 'Do I need trading experience?', a: <><strong>No.</strong> The system has been designed to simplify the process as much as possible. Your only responsibility is to determine whether you expect price to move up or down. By using our tool, you will learn more along the way. If you're brand new to trading, we strongly recommend starting on a demo account first and making full use of the learning resources and direct support available inside our Discord community.</> },
  { q: 'Is this fully automated?', a: <><strong>No, this is a semi-automated system.</strong> You define the direction; the system handles execution, entries, exits, and risk management. This keeps the most important part involved in the markets — human discretion — while removing the most common source of failures: execution.</> },
  { q: 'What platforms do I need?', a: <><strong>TradingView and cTrader.</strong> You'll need access to TradingView for your daily charting and analysis. To run OrcaBot, you'll need access to cTrader. The system itself will be provided separately with full setup instructions.</> },
  { q: 'What happens if I choose the wrong bias?', a: <><strong>The system is built to handle this.</strong> If you set OrcaBot up for buys only and the market crashes the whole day, the bot will not take a trade. If the market is slowly falling while your directional bias is bullish, trades may result in a loss. This is absolutely normal, and expected.</> },
  { q: 'How much time does it take per day?', a: <><strong>Very little.</strong> The process is designed to take only a few minutes per day. Open the chart, decide your bias (buy or sell) for the next day, set the system. After that, the system does the rest.</> },
  { q: 'Are profits guaranteed?', a: <><strong>No.</strong> There are no guarantees of profit. Trading always involves risk, and results will vary between users. The focus of this system is not perfection, but consistency in execution and structure. You should only trade with capital you can afford to lose.</> },
  { q: 'How many trades does the system take?', a: <><strong>This depends on market conditions.</strong> OrcaBot only executes on behalf of your personal directional bias, and when specific conditions are met. Some days may have multiple trades, while others may have none.</> },
  { q: 'Do I need to monitor trades constantly?', a: <><strong>No.</strong> Once the system is set, it operates automatically based on predefined rules. There is no need for constant monitoring.</> },
  { q: 'What makes this different from other bots?', a: <><strong>Most automated systems remove the human completely.</strong> This system keeps the most important part involved in the markets: human discretion. While still removing the most common source of failures and errors: execution.</> },
  { q: 'Will OrcaBot improve over time?', a: <><strong>Absolutely.</strong> The system will continue to evolve through updates, optimizations, and user feedback. All clients will benefit from ongoing improvements.</> },
];

export function OrcabotHero() {
  return (
    <section className={s.hero}>
      <div className={s.heroBg} />
      <div className={s.heroGrid} />
      <div className={s.container} style={{ position: 'relative' }}>
        <div className={s.heroBadge}><span /> Early Access — Limited Availability</div>
        <h1 className={s.heroTitle}>
          One Decision.<br /><em>Precision Execution.</em><br />Consistent Results.
        </h1>
        <p className={s.heroSub}>
          OrcaBot 2.0 is the hybrid automated trading system that removes execution errors
          while keeping you in control. You set the direction. The system does the rest.
        </p>
        <div className={s.heroPills}>
          <span><Zap size={14} /> Fully automated execution</span>
          <span><Shield size={14} /> Built-in safety filters</span>
          <span><Clock size={14} /> Minutes per day</span>
          <span><Users size={14} /> Private client community</span>
        </div>
        <div className={s.heroCta}>
          <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="#pricing">Get Early Access — €500 <ArrowRight size={18} /></a>
          <a className={`${s.btn} ${s.btnGhost}`} href="#how-it-works">See How It Works</a>
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.problemGrid}>
          <div>
            <p className={s.sectionLabel}>The Problem</p>
            <h2 className={s.sectionTitle}>Most Traders Don't Fail<br />Because <em>They're Wrong.</em></h2>
            <p className={s.bodyText}>
              They fail because of everything that comes after. Bad entries. Late reactions.
              Overtrading. Cutting winners early, or letting losers run. Acting on emotion during
              bad days — realizing only when it's already too late.
            </p>
            <div className={s.callout}>
              Execution is where accounts disappear.<br />Not strategy. Not analysis. Execution.
            </div>
          </div>
          <div className={s.problemCards}>
            {PROBLEM_CARDS.map((item) => (
              <div key={item.title} className={s.problemCard}><h4>{item.title}</h4><p>{item.desc}</p></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>The Solution</p>
        <h2 className={s.sectionTitle} style={{ maxWidth: 700 }}>
          We Don't Remove the Human.<br /><em>We Remove the Weakness.</em>
        </h2>
        <p className={s.bodyText}>
          OrcaBot 2.0 is a hybrid automated trading system. You provide the direction.
          The system provides the execution. Once you set your bias, everything else is
          handled — entries, exits, risk, and trade management. No emotions. No errors.
        </p>
        <div className={s.pillars}>
          {PILLARS.map((p) => (
            <div key={p.num} className={s.pillar}>
              <div className={s.pillarNum}>{p.num}</div>
              <h3>{p.title}</h3><p>{p.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: 'var(--ob-muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
            Fully automated bots lack context. Manual trading lacks consistency.<br />
            <strong style={{ color: 'var(--ob-text)' }}>OrcaBot 2.0 combines the best of both.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className={s.section} id="how-it-works">
      <div className={s.container}>
        <p className={s.sectionLabel}>How It Works</p>
        <h2 className={s.sectionTitle}>Five Layers. <em>Zero Guesswork.</em></h2>
        <p className={s.bodyText}>Every trade passes through five layers of validation. If any single layer fails, no trade is taken. Period.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 3rem', marginTop: '2.5rem' }}>
          <div className={s.layers}>
            {LAYERS_LEFT.map((l) => (
              <div key={l.num} className={s.layer}>
                <div className={s.layerNum}>{l.num}</div>
                <div className={s.layerContent}><h3>{l.title}</h3><p>{l.desc}</p></div>
              </div>
            ))}
          </div>
          <div className={s.layers}>
            {LAYERS_RIGHT.map((l) => (
              <div key={l.num} className={s.layer}>
                <div className={s.layerNum}>{l.num}</div>
                <div className={s.layerContent}><h3>{l.title}</h3><p>{l.desc}</p></div>
              </div>
            ))}
            <div className={s.keyNote} style={{ marginTop: '1rem' }}>
              🔒 <strong>Key Principle:</strong> The system does not trade continuously.
              If alignment isn't present across all layers, no trade is taken. Period.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DifferencesSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>What Makes This Different</p>
        <h2 className={s.sectionTitle}>It Doesn't Replace the Trader.<br /><em>It Completes Them.</em></h2>
        <p className={s.bodyText}>
          Fully automated systems fail because they lack context. Manual trading fails because
          of inconsistency. OrcaBot 2.0 sits right in the middle — combining human judgment
          with machine-grade execution.
        </p>
        <div className={s.compare}>
          <div className={`${s.compareCol} ${s.compareColBad}`}>
            <h3><X size={16} /> Traditional Bots</h3>
            {['No market context awareness', 'Over-trade in bad conditions', 'Break down during volatility', 'Require constant monitoring'].map(t => (
              <div key={t} className={s.compareItem}><X size={15} color="var(--ob-red)" />{t}</div>
            ))}
          </div>
          <div className={`${s.compareCol} ${s.compareColGood}`}>
            <h3><Check size={16} /> OrcaBot 2.0</h3>
            {['Human context + system execution', 'Filters out low-quality setups', 'Waits for full alignment', 'Set it and walk away'].map(t => (
              <div key={t} className={s.compareItem}><Check size={15} color="var(--ob-green)" />{t}</div>
            ))}
          </div>
        </div>
        <div className={s.safetyNote}>
          <h4>Built-In Safety</h4>
          <p>
            Even when your bias is wrong, the internal filters protect trade quality.
            When conditions don't align, it simply won't trade — <strong>saving you money even when you were wrong.</strong>
            The system doesn't just find good trades. It keeps you out of bad ones.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ReceiveSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>What You Receive</p>
        <h2 className={s.sectionTitle}>Everything You Need.<br /><em>Nothing You Don't.</em></h2>
        <p className={s.bodyText}>
          Upon joining, you gain access to a complete system designed to make your trading process structured, simple, and consistent.
        </p>
        <div className={s.receiveGrid}>
          {RECEIVE_ITEMS.map((item) => (
            <div key={item.num} className={s.receiveCard}>
              <div className={s.receiveCardNum}>{item.num}</div>
              <h4>{item.title}</h4><p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialSection() {
  return (
    <section className={`${s.section} ${s.testiSection}`}>
      <div className={s.container}>
        <p className={s.sectionLabel}>Client Results</p>
        <h2 className={s.sectionTitle}>
          Real People.<br /><em>Real Outcomes.</em>
        </h2>
        <p className={s.bodyText}>
          OrcaBot is early-stage, and we're not going to plaster fake numbers across this page.
          Here's what our first client had to say — unedited, in their own words.
        </p>
        <div className={s.testiPullquote}>
          <span className={s.testiPullquoteMark}>"</span>
          <p className={s.testiPullquoteText}>
            My role is quite simple: I determine the daily bias,
            and the bot takes care of executing the trades.{' '}
            <strong>An ideal way to participate in the markets
              without needing to be behind my screen all day.</strong>
          </p>
        </div>
        <div className={s.testiBadge}>
          <span /> Verified Client — Phase 1 Early Access
        </div>
        <div className={s.testiMain}>
          <div className={s.testiTimeline}>
            <div className={s.testiTlStep}>
              <div className={s.testiTlStepDate}>March 26</div>
              <div className={s.testiTlStepLabel}>First contact — Zoom walkthrough scheduled</div>
            </div>
            <div className={s.testiTlStep}>
              <div className={s.testiTlStepDate}>April</div>
              <div className={s.testiTlStepLabel}>Testing phase — regular check-ins with Bennie</div>
            </div>
            <div className={s.testiTlStep}>
              <div className={s.testiTlStepDate}>May — Live</div>
              <div className={s.testiTlStepLabel}>Running on demo — ~10% in first 10 trading days</div>
            </div>
          </div>
          <div className={s.testiReview}>
            <div className={s.testiReviewStars}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="var(--ob-gold)" strokeWidth={0} />)}
            </div>
            <p className={s.testiPara}>
              On March 26th, I was contacted by Bennie through social media after he saw a video
              I made about trading. He reached out to explore the possibility of starting a
              collaboration with his company, Orca Bot. Shortly after, we scheduled a Zoom call
              via Discord where he walked me through the trading bot and the overall concept in
              detail. He clearly explained how the bot works, the strategy behind it, and what
              is expected from the user.
            </p>
            <div className={s.testiHighlight}>
              <Quote size={15} color="var(--ob-cyan)" />
              <strong>That level of transparency gave me confidence.</strong>
            </div>
            <p className={s.testiPara}>
              After taking a few days to think it over, I decided to move forward and became
              one of the first customers of Orca Bot. During April, the bot was still in its
              testing phase, but since the beginning of May it has been running live.
              Throughout that period, Bennie and I stayed in touch regularly via Zoom, where
              I was able to ask questions and gain a deeper understanding of how everything
              works. I really appreciate that level of personal support.
            </p>
            <p className={s.testiPara}>
              Since the bot went live, I started using it on a demo account. In the first
              10 trading days, it generated approximately 10% return. My role is quite simple:
              I determine the daily bias, and the bot takes care of executing the trades.
            </p>
            <div className={`${s.testiHighlight} ${s.testiHighlightGreen}`}>
              <Quote size={15} color="var(--ob-green)" />
              As a beginner trader, this is currently an ideal way for me to participate in
              the markets <strong>without needing to be behind my screen all day.</strong>
            </div>
            <p className={s.testiPara}>
              I'm excited to see how things develop further as I gain more experience and
              continue learning how to work with the bot.
            </p>
            <div className={s.testiAuthor}>
              <div className={s.testiAvatar}>H</div>
              <div>
                <div className={s.testiAuthorName}>Hans</div>
                <div className={s.testiAuthorRole}>Phase 1 Client · Beginner Trader</div>
              </div>
            </div>
          </div>
          <div className={s.testiStats}>
            <div className={s.testiStat}>
              <span className={s.testiStatSup}>Return</span>
              <div className={`${s.testiStatVal} ${s.testiStatValGreen}`}>~10%</div>
              <div className={s.testiStatLabel}>First 10 trading days on demo</div>
            </div>
            <div className={s.testiStat}>
              <span className={s.testiStatSup}>Active</span>
              <div className={s.testiStatVal}>10+</div>
              <div className={s.testiStatLabel}>Trading days running live</div>
            </div>
            <div className={s.testiStat}>
              <span className={s.testiStatSup}>Daily input</span>
              <div className={s.testiStatVal}>Mins</div>
              <div className={s.testiStatLabel}>No screen-watching required</div>
            </div>
          </div>
        </div>
        <p className={s.testiFooter}>
          Early access is live. More client results will be shared as they come in.
        </p>
      </div>
    </section>
  );
}

export function BeginnerSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>New to Trading?</p>
        <h2 className={s.sectionTitle}>
          Zero Experience?<br />
          <em>You're in the Right Place.</em>
        </h2>
        <p className={s.bodyText}>
          OrcaBot was built to be accessible — not just for experienced traders, but for anyone
          who wants to approach the markets in a structured, disciplined way. You don't need a
          background in finance. You need a process. We provide that process, and everything around it.
        </p>

        <div className={s.beginner}>
          <div className={s.beginnerHeader}>
            <div className={s.beginnerIcon}>
              <Users size={28} color="var(--ob-cyan)" />
            </div>
            <div>
              <h3 className={s.beginnerHeading}>
                OrcaTrading is a <em>Community.</em><br />Not just a product.
              </h3>
              <p className={s.beginnerLead}>
                When you join, you're not buying a file and disappearing. You're entering a
                growing community of traders at every level — from complete beginners to
                experienced professionals — all working toward the same goal: consistent,
                disciplined trading. Our team is actively involved. We answer questions, create
                educational guides, and improve the system based on your feedback.
                You will never be left behind.
              </p>
            </div>
          </div>

          <div className={s.demoBanner}>
            <div className={s.demoBannerIcon}>
              <Monitor size={22} color="#f59e0b" />
            </div>
            <div>
              <p className={s.demoBannerTitle}>
                💡 Our Recommendation for Beginners — Start on a Demo Account First
              </p>
              <p className={s.demoBannerDesc}>
                If you're new to trading or new to automated systems, we{' '}
                <strong>strongly recommend starting with a demo account.</strong> It costs
                nothing extra and lets you watch OrcaBot execute in live market conditions —
                without any financial risk. Get comfortable with how the system behaves,
                understand how to set your bias, and build real confidence before switching
                to live capital. There's no rush. The system performs identically on demo
                as it does on a live account.
              </p>
            </div>
          </div>

          <div className={s.supportGrid}>
            <div className={s.supportItem}>
              <div className={s.supportItemIcon} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <BookOpen size={20} color="var(--ob-cyan)" />
              </div>
              <div>
                <h4>Learning Documents & Educational Guides</h4>
                <p>
                  We continuously create and update educational materials — from understanding
                  market basics to reading charts and applying the correct directional bias.
                  All resources are shared directly inside the community, free for every client.
                </p>
              </div>
            </div>
            <div className={s.supportItem}>
              <div className={s.supportItemIcon} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <FileText size={20} color="var(--ob-green)" />
              </div>
              <div>
                <h4>Strategy Manuals Built Around the Bot</h4>
                <p>
                  Dedicated strategy documents explain the market concepts OrcaBot is built
                  to execute on — giving you the understanding behind every trade, not just
                  the outcome. You'll learn while the system works for you.
                </p>
              </div>
            </div>
            <div className={s.supportItem}>
              <div className={s.supportItemIcon} style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Headphones size={20} color="#f59e0b" />
              </div>
              <div>
                <h4>Direct Support — Every Step of the Way</h4>
                <p>
                  Questions answered. Setup issues resolved. Bias decisions discussed. Our team
                  is present inside the community every day. No tickets, no delays — just direct
                  access to people who want to see you succeed.
                </p>
              </div>
            </div>
            <div className={s.supportItem}>
              <div className={s.supportItemIcon} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <Users size={20} color="#a78bfa" />
              </div>
              <div>
                <h4>A Community That Grows Together</h4>
                <p>
                  Share your progress, ask anything, learn from others. Every client is part
                  of the same community — beginners and veterans side by side, working toward
                  the same goals. Nobody trades alone here.
                </p>
              </div>
            </div>
          </div>

          <div className={s.beginnerDiscord}>
            <div className={s.beginnerDiscordText}>
              <h4>Join our Discord — to learn about us.</h4>
              <p>
                Our public Discord is the best place to learn more about OrcaTrading, follow
                our journey, and ask any questions before you decide. General guides and
                educational resources are shared there too. Once you become a client, you'll
                receive access to our private hub — where all live updates, strategy documents,
                direct support, and client communication take place.
              </p>
            </div>
            <a className={s.btnDiscord} href={DISCORD_URI} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} /> Join Our Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExpectationsSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>Expectations</p>
        <h2 className={s.sectionTitle}>Honest Results.<br /><em>No Overpromises.</em></h2>
        <p className={s.bodyText}>
          We believe in being direct about what this system can and cannot do.
          Trading always involves risk, and no system eliminates that.
        </p>
        <div className={s.expectGrid}>
          <div className={`${s.expectCol} ${s.expectColYes}`}>
            <h4>✓ What You Can Expect</h4>
            {['A structured, repeatable process', 'Consistent behavior on every trade', 'Safety filters that protect you when wrong', 'A process that takes minutes per day', 'Continuous support and improvements'].map(t => (
              <div key={t} className={s.expectItem}><Check size={15} color="var(--ob-green)" /> {t}</div>
            ))}
          </div>
          <div className={`${s.expectCol} ${s.expectColNo}`}>
            <h4>✗ What You Should NOT Expect</h4>
            {['Guaranteed profits or risk-free trading', 'Winning every trade or every day', 'A system requiring zero input from you', 'Immediate or overnight results', 'A shortcut to replace discipline'].map(t => (
              <div key={t} className={s.expectItem}><X size={15} color="var(--ob-red)" /> {t}</div>
            ))}
          </div>
        </div>
        <div className={s.quote}>
          "Trading isn't profitable by doing more. It's profitable by doing the right things, consistently."
        </div>
      </div>
    </section>
  );
}

export function WhoItIsForSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>Who This Is For</p>
        <h2 className={s.sectionTitle}>Built for Discipline.<br /><em>Not for Everyone.</em></h2>
        <div className={s.forGrid}>
          <div className={`${s.forCol} ${s.forColYes}`}>
            <h3>This is for you if…</h3>
            {['You want a structured approach to trading', 'You understand direction but struggle with execution', "You're willing to follow a clear process", 'You prefer clarity over complexity', 'You want to reduce emotional decisions', 'You can make one simple daily decision'].map(t => (
              <div key={t} className={s.forItem}><Check size={15} color="var(--ob-green)" /> {t}</div>
            ))}
          </div>
          <div className={`${s.forCol} ${s.forColNo}`}>
            <h3>This is NOT for you if…</h3>
            {['You expect guaranteed profits', 'You want zero input or responsibility', "You won't follow rules or a process", 'You override systems on impulse', 'You expect constant trades or instant results', "You're searching for shortcuts"].map(t => (
              <div key={t} className={s.forItem}><X size={15} color="var(--ob-red)" /> {t}</div>
            ))}
          </div>
        </div>
        <div className={s.responsibilityNote}>
          <strong>This system simplifies trading, but it does not remove responsibility.</strong><br />
          Your ability to define direction and remain consistent will directly impact your results.
        </div>
      </div>
    </section>
  );
}

export function OrcabotPricingSection() {
  return (
    <section className={s.section} id="pricing">
      <div className={s.container}>
        <p className={s.sectionLabel}>Pricing</p>
        <h2 className={s.sectionTitle}>Structured Access.<br /><em>Progressive Pricing.</em></h2>
        <p className={s.bodyText}>
          Access is released in structured phases. Each phase reflects increasing validation
          and demand. Early participants lock in their entry price permanently.
        </p>
        <div className={s.pricingWrap}>
          <div className={s.priceHero}>
            <div className={s.priceHeroLabel}>Current Phase — Early Access</div>
            <div className={s.priceHeroAmount}>€500</div>
            <div className={s.priceHeroNote}>One-time · Limited availability</div>
            <p className={s.priceHeroDesc}>
              The lowest available entry point while the system transitions from final testing
              into broader use. Your price is locked in — later phases will only increase.
            </p>
            <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="https://buy.stripe.com/placeholder" target="_blank" rel="noopener noreferrer">
              Apply for Early Access <ArrowRight size={18} />
            </a>
            <p className={s.ctaNote} style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--ob-muted)' }}>
              You'll be contacted to schedule your personal onboarding call after purchase.
            </p>
          </div>
          <div className={s.phasesTable}>
            <div className={s.phasesHeader}>Future Phases — Prices Will Increase</div>
            {PHASES.map((row) => (
              <div key={row.phase} className={`${s.phaseRow}${row.current ? ` ${s.phaseRowCurrent}` : ''}`}>
                <span className={s.phaseRowName}>{row.phase}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {row.current && <span className={s.phaseCurrentTag}>Current</span>}
                  <span className={s.phaseRowPrice}>{row.price}</span>
                </div>
              </div>
            ))}
          </div>
          <p className={s.priceLock}>🔒 Your entry price is locked in forever. Later phases will only be more expensive.</p>
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <p className={s.sectionLabel}>FAQ</p>
        <h2 className={s.sectionTitle}>Your Questions, <em>Answered.</em></h2>
        <div className={s.faq}>
          {FAQS.map((item) => (
            <div key={item.q} className={s.faqItem}><h4>{item.q}</h4><p>{item.a}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrcabotCtaSection() {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.cta}>
          <h2>Ready to Simplify Your Trading?</h2>
          <p>
            Secure your early access today. Limited spots available at the Phase 1 price.
            Your position is locked in from the moment you join.
          </p>
          <a className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} href="https://buy.stripe.com/placeholder" target="_blank" rel="noopener noreferrer">
            Get Early Access — €500 <ArrowRight size={20} />
          </a>
          <p className={s.ctaNote}>
            Early access · Limited availability · Price locks in at entry phase<br />
            Questions? Reach out to us on{' '}
            <a href={DISCORD_URI} style={{ color: 'var(--ob-cyan)' }} target="_blank" rel="noopener noreferrer">Discord</a>
            {' '}or visit{' '}
            <a href="https://www.tradewithorca.com" style={{ color: 'var(--ob-cyan)' }}>tradewithorca.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function DisclaimerSection() {
  return (
    <div className={s.disclaimer}>
      <div className={s.container}>
        <p>
          <strong>Risk Disclaimer:</strong> The information, software, and services provided are for educational and informational purposes only and do not constitute financial, investment, or trading advice. Nothing provided should be interpreted as a recommendation to buy or sell any financial instrument. Trading financial markets involves significant risk. There is no guarantee of profit, and losses can occur. You may lose part or all of your trading capital. Past performance is not indicative of future results. You remain fully responsible for choosing your directional bias, operating the system correctly, and managing your own trading account and capital. The system does not make independent financial decisions on your behalf. By purchasing and using this system, you acknowledge that you understand the risks involved in trading and accept full responsibility for your actions.
        </p>
      </div>
    </div>
  );
}
