// app/(marketing)/orcabot/page.tsx
import { Metadata } from 'next'
import { ArrowRight, Check, X, Shield, Zap, Clock, Users, MessageCircle, BookOpen, FileText, Headphones, Monitor } from 'lucide-react'

export const metadata: Metadata = {
  title: 'OrcaBot 2.0 — The Hybrid Automated Trading System | OrcaTrading',
  description: 'One decision. Precision execution. Consistent results. OrcaBot 2.0 is the hybrid automated trading system that removes execution errors while keeping you in control.',
  keywords: 'OrcaBot, automated trading bot, hybrid trading system, cTrader bot, trading automation, forex bot',
}

export default function OrcaBotPage() {
  const DISCORD_URI = process.env.NEXT_PUBLIC_DISCORD_URI || "https://discord.gg/your-invite-code";
  return (
    <>
      <style>{`
        .ob-page {
          --ob-bg:        #070f1a;
          --ob-surface:   #0d1b2a;
          --ob-card:      #0f1f30;
          --ob-border:    #1a2e44;
          --ob-cyan:      #00d4ff;
          --ob-cyan-dim:  rgba(0, 212, 255, 0.12);
          --ob-cyan-glow: rgba(0, 212, 255, 0.25);
          --ob-green:     #10b981;
          --ob-red:       #ef4444;
          --ob-text:      #e6edf7;
          --ob-muted:     #7a9ab8;
          --ob-gold:      #f59e0b;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          background: var(--ob-bg);
          color: var(--ob-text);
        }
        .ob-hero {
          position: relative; overflow: hidden;
          padding: clamp(5rem, 12vw, 9rem) 0 clamp(4rem, 8vw, 7rem);
          text-align: center;
        }
        .ob-hero__bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.13) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(16,185,129,0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .ob-hero__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 30%, transparent 80%);
          pointer-events: none;
        }
        .ob-hero__badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.35rem 1rem; border: 1px solid rgba(0,212,255,0.3); border-radius: 999px;
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--ob-cyan); background: var(--ob-cyan-dim); margin-bottom: 1.75rem;
        }
        .ob-hero__badge span {
          width: 6px; height: 6px; border-radius: 50%; background: var(--ob-cyan);
          animation: ob-pulse 2s ease-in-out infinite;
        }
        @keyframes ob-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .ob-hero__title {
          font-size: clamp(2.6rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.08;
          letter-spacing: -0.03em; margin: 0 0 0.5rem; max-width: 820px; margin-inline: auto;
        }
        .ob-hero__title em {
          font-style: normal;
          background: linear-gradient(135deg, #00d4ff 0%, #10b981 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .ob-hero__sub {
          font-size: clamp(1rem, 2vw, 1.2rem); color: var(--ob-muted);
          max-width: 600px; margin: 1.25rem auto 0; line-height: 1.75;
        }
        .ob-hero__pills {
          display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;
          margin-top: 2rem; font-size: 0.85rem; color: var(--ob-muted);
        }
        .ob-hero__pills span { display: flex; align-items: center; gap: 0.4rem; }
        .ob-hero__pills svg { color: var(--ob-cyan); }
        .ob-hero__cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2.5rem; }
        .ob-section { padding: clamp(3.5rem, 7vw, 6rem) 0; }
        .ob-container { width: min(1100px, 92vw); margin-inline: auto; }
        .ob-section-label {
          font-size: 0.7rem; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ob-cyan); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.6rem;
        }
        .ob-section-label::before {
          content: ''; display: block; width: 28px; height: 2px; background: var(--ob-cyan); border-radius: 2px;
        }
        .ob-section-title {
          font-size: clamp(1.9rem, 4vw, 3rem); font-weight: 900; line-height: 1.1;
          letter-spacing: -0.02em; margin: 0 0 1.25rem;
        }
        .ob-section-title em { font-style: normal; color: var(--ob-cyan); }
        .ob-body { font-size: 1.05rem; color: var(--ob-muted); line-height: 1.8; max-width: 640px; }
        .ob-problem-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem;
          align-items: center; margin-top: 3rem;
        }
        @media (max-width: 768px) { .ob-problem-grid { grid-template-columns: 1fr; } }
        .ob-problem-cards { display: grid; gap: 1rem; }
        .ob-problem-card {
          background: var(--ob-card); border: 1px solid var(--ob-border);
          border-left: 3px solid var(--ob-red); border-radius: 12px; padding: 1.1rem 1.25rem;
        }
        .ob-problem-card h4 { font-size: 0.9rem; font-weight: 700; color: var(--ob-text); margin: 0 0 0.3rem; }
        .ob-problem-card p  { font-size: 0.85rem; color: var(--ob-muted); margin: 0; line-height: 1.6; }
        .ob-callout {
          margin-top: 1.5rem; padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03));
          border: 1px solid rgba(239,68,68,0.2); border-radius: 12px;
          font-size: 1rem; font-weight: 700; color: #fca5a5; line-height: 1.6;
        }
        .ob-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-top: 2.5rem; }
        @media (max-width: 768px) { .ob-pillars { grid-template-columns: 1fr; } }
        .ob-pillar {
          background: var(--ob-card); border: 1px solid var(--ob-border);
          border-top: 3px solid var(--ob-cyan); border-radius: 16px; padding: 2rem 1.5rem;
        }
        .ob-pillar__num {
          font-size: 2.5rem; font-weight: 900; color: var(--ob-cyan); opacity: 0.25;
          line-height: 1; margin-bottom: 0.75rem; font-variant-numeric: tabular-nums;
        }
        .ob-pillar h3 { font-size: 1.05rem; font-weight: 700; margin: 0 0 0.6rem; }
        .ob-pillar p  { font-size: 0.88rem; color: var(--ob-muted); margin: 0; line-height: 1.7; }
        .ob-layers { position: relative; margin-top: 2.5rem; }
        .ob-layer {
          display: grid; grid-template-columns: 56px 1fr; gap: 1.5rem;
          align-items: flex-start; margin-bottom: 0; position: relative;
        }
        .ob-layer:not(:last-child)::after {
          content: ''; position: absolute; left: 27px; top: 56px; bottom: -1px; width: 2px;
          background: linear-gradient(to bottom, var(--ob-cyan), transparent); opacity: 0.25;
        }
        .ob-layer__num {
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, var(--ob-cyan), #0ea5e9);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 900; color: #04131f; flex-shrink: 0;
          box-shadow: 0 0 20px rgba(0,212,255,0.25);
        }
        .ob-layer__content { padding: 0.75rem 0 2rem; }
        .ob-layer__content h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.5rem; }
        .ob-layer__content p  { font-size: 0.9rem; color: var(--ob-muted); margin: 0; line-height: 1.75; }
        .ob-key-note {
          margin-top: 1.5rem; padding: 1.25rem 1.5rem;
          background: var(--ob-cyan-dim); border: 1px solid rgba(0,212,255,0.2); border-radius: 12px;
          font-size: 0.95rem; font-weight: 600; color: var(--ob-cyan);
        }
        .ob-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 2.5rem; }
        @media (max-width: 640px) { .ob-compare { grid-template-columns: 1fr; } }
        .ob-compare-col { border-radius: 16px; padding: 2rem; }
        .ob-compare-col--bad  { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2); }
        .ob-compare-col--good { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.25); }
        .ob-compare-col h3 { font-size: 1rem; font-weight: 800; margin: 0 0 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .ob-compare-col--bad h3  { color: #f87171; }
        .ob-compare-col--good h3 { color: #34d399; }
        .ob-compare-item { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.9rem; font-size: 0.9rem; line-height: 1.5; color: var(--ob-muted); }
        .ob-compare-item svg { flex-shrink: 0; margin-top: 2px; }
        .ob-safety-note { margin-top: 2rem; padding: 1.5rem; background: var(--ob-surface); border: 1px solid var(--ob-border); border-radius: 14px; }
        .ob-safety-note h4 { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ob-cyan); margin: 0 0 0.6rem; }
        .ob-safety-note p { font-size: 0.9rem; color: var(--ob-muted); margin: 0; line-height: 1.75; }
        .ob-safety-note strong { color: var(--ob-text); }
        .ob-receive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.1rem; margin-top: 2.5rem; }
        @media (max-width: 900px) { .ob-receive-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 540px) { .ob-receive-grid { grid-template-columns: 1fr; } }
        .ob-receive-card { background: var(--ob-card); border: 1px solid var(--ob-border); border-radius: 14px; padding: 1.5rem; transition: border-color 0.2s; }
        .ob-receive-card:hover { border-color: rgba(0,212,255,0.3); }
        .ob-receive-card__num { font-size: 1.5rem; font-weight: 900; color: var(--ob-cyan); margin-bottom: 0.6rem; line-height: 1; }
        .ob-receive-card h4 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.4rem; }
        .ob-receive-card p  { font-size: 0.83rem; color: var(--ob-muted); margin: 0; line-height: 1.65; }

        /* ══ BEGINNER SUPPORT SECTION ══ */
        .ob-beginner {
          position: relative; overflow: hidden;
          background: linear-gradient(145deg, rgba(0,212,255,0.07) 0%, rgba(16,185,129,0.04) 50%, var(--ob-card) 100%);
          border: 1px solid rgba(0,212,255,0.18); border-radius: 24px;
          padding: clamp(2.5rem, 5vw, 4rem); margin-top: 3rem;
        }
        .ob-beginner::before {
          content: ''; position: absolute; top: -60px; left: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%); pointer-events: none;
        }
        .ob-beginner::after {
          content: ''; position: absolute; top: 0; left: 3rem; right: 3rem; height: 2px;
          background: linear-gradient(90deg, transparent, var(--ob-cyan), rgba(16,185,129,0.7), transparent);
        }
        .ob-beginner__header {
          display: grid; grid-template-columns: auto 1fr; gap: 1.25rem;
          align-items: flex-start; margin-bottom: 2rem;
        }
        @media (max-width: 640px) { .ob-beginner__header { grid-template-columns: 1fr; } }
        .ob-beginner__icon {
          width: 64px; height: 64px; border-radius: 18px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(16,185,129,0.15));
          border: 1px solid rgba(0,212,255,0.25); display: flex; align-items: center; justify-content: center;
        }
        .ob-beginner__heading { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; line-height: 1.15; margin: 0 0 0.6rem; }
        .ob-beginner__heading em { font-style: normal; color: var(--ob-cyan); }
        .ob-beginner__lead { font-size: 0.97rem; color: var(--ob-muted); line-height: 1.8; margin: 0; max-width: 680px; }
        .ob-demo-banner {
          display: flex; align-items: flex-start; gap: 1.25rem;
          padding: 1.5rem 1.75rem;
          background: rgba(245,158,11,0.07);
          border: 1px solid rgba(245,158,11,0.25); border-left: 4px solid #f59e0b;
          border-radius: 14px; margin-bottom: 2rem;
        }
        @media (max-width: 580px) { .ob-demo-banner { flex-direction: column; gap: 0.75rem; } }
        .ob-demo-banner__icon {
          width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
          background: rgba(245,158,11,0.15); display: flex; align-items: center; justify-content: center;
        }
        .ob-demo-banner__title { font-size: 0.95rem; font-weight: 800; color: #fcd34d; margin: 0 0 0.35rem; }
        .ob-demo-banner__desc { font-size: 0.88rem; color: var(--ob-muted); margin: 0; line-height: 1.7; }
        .ob-demo-banner__desc strong { color: var(--ob-text); }
        .ob-support-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
        @media (max-width: 640px) { .ob-support-grid { grid-template-columns: 1fr; } }
        .ob-support-item {
          display: flex; align-items: flex-start; gap: 1rem; padding: 1.25rem;
          background: var(--ob-surface); border: 1px solid var(--ob-border); border-radius: 14px;
          transition: border-color 0.2s;
        }
        .ob-support-item:hover { border-color: rgba(0,212,255,0.25); }
        .ob-support-item__icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ob-support-item h4 { font-size: 0.9rem; font-weight: 700; margin: 0 0 0.3rem; }
        .ob-support-item p  { font-size: 0.82rem; color: var(--ob-muted); margin: 0; line-height: 1.65; }
        .ob-beginner__discord {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap; padding: 1.75rem 2rem;
          background: radial-gradient(ellipse 80% 80% at 0% 50%, rgba(88,101,242,0.12), transparent 60%), var(--ob-surface);
          border: 1px solid rgba(88,101,242,0.3); border-radius: 16px;
        }
        .ob-beginner__discord-text h4 { font-size: 1.05rem; font-weight: 800; margin: 0 0 0.3rem; }
        .ob-beginner__discord-text p { font-size: 0.88rem; color: var(--ob-muted); margin: 0; line-height: 1.65; max-width: 480px; }
        .ob-btn--discord {
          display: inline-flex; align-items: center; gap: 0.55rem;
          background: #5865F2; color: #fff; border-radius: 999px; border: 0;
          cursor: pointer; text-decoration: none; font-weight: 700; font-size: 0.95rem;
          padding: 0.85rem 1.75rem; transition: background 0.2s; white-space: nowrap; flex-shrink: 0;
          box-shadow: 0 0 0 6px rgba(88,101,242,0.18);
        }
        .ob-btn--discord:hover { background: #6875f5; }

        .ob-expect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2.5rem; }
        @media (max-width: 640px) { .ob-expect-grid { grid-template-columns: 1fr; } }
        .ob-expect-col h4 { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 1.1rem; }
        .ob-expect-col--yes h4 { color: var(--ob-green); }
        .ob-expect-col--no  h4 { color: var(--ob-red); }
        .ob-expect-item { display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 0.85rem; font-size: 0.9rem; color: var(--ob-muted); line-height: 1.55; }
        .ob-expect-item svg { flex-shrink: 0; margin-top: 2px; }
        .ob-quote {
          margin-top: 2.5rem; padding: 2rem; background: var(--ob-surface);
          border: 1px solid var(--ob-border); border-left: 3px solid var(--ob-cyan); border-radius: 14px;
          font-style: italic; font-size: 1.1rem; color: var(--ob-muted); line-height: 1.75; text-align: center;
        }
        .ob-for-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 2.5rem; }
        @media (max-width: 640px) { .ob-for-grid { grid-template-columns: 1fr; } }
        .ob-for-col { border-radius: 16px; padding: 2rem; }
        .ob-for-col--yes { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); }
        .ob-for-col--no  { background: rgba(239,68,68,0.04);  border: 1px solid rgba(239,68,68,0.15); }
        .ob-for-col h3 { font-size: 0.75rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; margin: 0 0 1.25rem; }
        .ob-for-col--yes h3 { color: #34d399; }
        .ob-for-col--no  h3 { color: #f87171; }
        .ob-for-item { display: flex; align-items: flex-start; gap: 0.7rem; margin-bottom: 0.85rem; font-size: 0.9rem; color: var(--ob-muted); line-height: 1.55; }
        .ob-for-item svg { flex-shrink: 0; margin-top: 2px; }
        .ob-responsibility-note { margin-top: 1.5rem; padding: 1.25rem 1.5rem; background: var(--ob-surface); border: 1px solid var(--ob-border); border-radius: 12px; font-size: 0.9rem; color: var(--ob-muted); text-align: center; line-height: 1.7; }
        .ob-responsibility-note strong { color: var(--ob-text); }
        .ob-pricing-wrap { margin-top: 3rem; display: grid; gap: 2rem; }
        .ob-price-hero {
          background: linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(0,212,255,0.03) 100%);
          border: 1px solid rgba(0,212,255,0.3); border-radius: 20px;
          padding: clamp(2rem, 4vw, 3rem); text-align: center; position: relative; overflow: hidden;
        }
        .ob-price-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,212,255,0.08), transparent 70%); pointer-events: none;
        }
        .ob-price-hero__label { display: inline-block; padding: 0.3rem 0.9rem; background: var(--ob-cyan); color: #04131f; border-radius: 999px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.25rem; }
        .ob-price-hero__amount { font-size: clamp(3.5rem, 8vw, 5.5rem); font-weight: 900; color: var(--ob-cyan); line-height: 1; letter-spacing: -0.04em; margin-bottom: 0.25rem; }
        .ob-price-hero__note { font-size: 0.85rem; color: var(--ob-muted); margin-bottom: 1.5rem; }
        .ob-price-hero__desc { font-size: 0.95rem; color: var(--ob-muted); max-width: 480px; margin: 0 auto 2rem; line-height: 1.7; }
        .ob-phases-table { background: var(--ob-card); border: 1px solid var(--ob-border); border-radius: 14px; overflow: hidden; }
        .ob-phases-header { padding: 1rem 1.5rem; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ob-muted); border-bottom: 1px solid var(--ob-border); }
        .ob-phase-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid var(--ob-border); font-size: 0.9rem; }
        .ob-phase-row:last-child { border-bottom: none; }
        .ob-phase-row--current { background: var(--ob-cyan-dim); }
        .ob-phase-row__name { color: var(--ob-muted); }
        .ob-phase-row--current .ob-phase-row__name { color: var(--ob-text); font-weight: 600; }
        .ob-phase-row__price { font-weight: 800; color: var(--ob-cyan); }
        .ob-phase-current-tag { font-size: 0.65rem; font-weight: 700; padding: 0.2rem 0.5rem; background: var(--ob-cyan); color: #04131f; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
        .ob-price-lock { margin-top: 1rem; font-size: 0.85rem; color: var(--ob-muted); text-align: center; }
        .ob-faq { display: grid; gap: 1px; margin-top: 2.5rem; background: var(--ob-border); border: 1px solid var(--ob-border); border-radius: 16px; overflow: hidden; }
        .ob-faq-item { background: var(--ob-card); padding: 1.5rem; }
        .ob-faq-item h4 { font-size: 0.95rem; font-weight: 700; margin: 0 0 0.6rem; color: var(--ob-text); }
        .ob-faq-item p { font-size: 0.88rem; color: var(--ob-muted); margin: 0; line-height: 1.75; }
        .ob-faq-item p strong { color: var(--ob-text); }
        .ob-cta {
          margin-top: 3rem; padding: clamp(3rem, 6vw, 5rem);
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.12), transparent 60%), var(--ob-surface);
          border: 1px solid rgba(0,212,255,0.2); border-radius: 24px; text-align: center;
        }
        .ob-cta h2 { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 1rem; }
        .ob-cta p { font-size: 1.05rem; color: var(--ob-muted); max-width: 500px; margin: 0 auto 2rem; line-height: 1.75; }
        .ob-cta-note { margin-top: 1.25rem; font-size: 0.82rem; color: var(--ob-muted); }
        .ob-disclaimer { padding: 2.5rem 0; border-top: 1px solid var(--ob-border); }
        .ob-disclaimer p { font-size: 0.78rem; color: #4a6070; line-height: 1.75; max-width: 820px; margin-inline: auto; text-align: center; }
        .ob-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          border-radius: 999px; border: 0; cursor: pointer; text-decoration: none;
          font-weight: 700; font-size: 1rem; padding: 0.9rem 2rem; transition: all 0.2s;
        }
        .ob-btn--primary { background: var(--ob-cyan); color: #04131f; box-shadow: 0 0 0 6px rgba(0,212,255,0.15); }
        .ob-btn--primary:hover { background: #33ddff; box-shadow: 0 0 0 8px rgba(0,212,255,0.22); }
        .ob-btn--ghost { background: transparent; color: var(--ob-text); border: 1px solid var(--ob-border); }
        .ob-btn--ghost:hover { border-color: rgba(0,212,255,0.3); color: var(--ob-cyan); }
        .ob-btn--lg { font-size: 1.1rem; padding: 1.1rem 2.75rem; }
        .ob-divider { border: none; border-top: 1px solid var(--ob-border); margin: 0; }
      `}</style>

      <div className="ob-page">

        {/* ── HERO ── */}
        <section className="ob-hero">
          <div className="ob-hero__bg" />
          <div className="ob-hero__grid" />
          <div className="ob-container" style={{ position: 'relative' }}>
            <div className="ob-hero__badge"><span /> Early Access — Limited Availability</div>
            <h1 className="ob-hero__title">
              One Decision.<br /><em>Precision Execution.</em><br />Consistent Results.
            </h1>
            <p className="ob-hero__sub">
              OrcaBot 2.0 is the hybrid automated trading system that removes execution errors
              while keeping you in control. You set the direction. The system does the rest.
            </p>
            <div className="ob-hero__pills">
              <span><Zap size={14} /> Fully automated execution</span>
              <span><Shield size={14} /> Built-in safety filters</span>
              <span><Clock size={14} /> Minutes per day</span>
              <span><Users size={14} /> Private client community</span>
            </div>
            <div className="ob-hero__cta">
              <a className="ob-btn ob-btn--primary ob-btn--lg" href="#pricing">Get Early Access — €500 <ArrowRight size={18} /></a>
              <a className="ob-btn ob-btn--ghost" href="#how-it-works">See How It Works</a>
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── THE PROBLEM ── */}
        <section className="ob-section">
          <div className="ob-container">
            <div className="ob-problem-grid">
              <div>
                <p className="ob-section-label">The Problem</p>
                <h2 className="ob-section-title">Most Traders Don't Fail<br />Because <em>They're Wrong.</em></h2>
                <p className="ob-body">
                  They fail because of everything that comes after. Bad entries. Late reactions.
                  Overtrading. Cutting winners early, or letting losers run. Acting on emotion during
                  bad days — realizing only when it's already too late.
                </p>
                <div className="ob-callout">
                  Execution is where accounts disappear.<br />Not strategy. Not analysis. Execution.
                </div>
              </div>
              <div className="ob-problem-cards">
                {[
                  { title: 'Bad entries & inconsistent execution', desc: 'Chasing price, entering differently every time. No repeatability.' },
                  { title: 'Emotional decision-making', desc: 'Revenge trades. Panic exits. Ignoring rules when it matters most.' },
                  { title: 'Overtrading', desc: "Taking setups that aren't there — because sitting still feels wrong." },
                  { title: 'No structure', desc: 'Every day is different. No process. Nothing to rely on.' },
                ].map((item) => (
                  <div key={item.title} className="ob-problem-card"><h4>{item.title}</h4><p>{item.desc}</p></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── THE SOLUTION ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">The Solution</p>
            <h2 className="ob-section-title" style={{ maxWidth: 700 }}>
              We Don't Remove the Human.<br /><em>We Remove the Weakness.</em>
            </h2>
            <p className="ob-body">
              OrcaBot 2.0 is a hybrid automated trading system. You provide the direction.
              The system provides the execution. Once you set your bias, everything else is
              handled — entries, exits, risk, and trade management. No emotions. No errors.
            </p>
            <div className="ob-pillars">
              {[
                { num: '01', title: 'You Decide', desc: "Set your directional bias — up or down. One clear decision per day. That's your only job." },
                { num: '02', title: 'The System Filters', desc: "Momentum, structure, and timing must all align before any entry triggers. If they don't, no trade is taken." },
                { num: '03', title: 'Execution is Automatic', desc: 'Entries, risk, trade management, and exits. Same structure. Every single time. No emotion. No error.' },
              ].map((p) => (
                <div key={p.num} className="ob-pillar">
                  <div className="ob-pillar__num">{p.num}</div>
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

        <hr className="ob-divider" />

        {/* ── HOW IT WORKS ── */}
        <section className="ob-section" id="how-it-works">
          <div className="ob-container">
            <p className="ob-section-label">How It Works</p>
            <h2 className="ob-section-title">Five Layers. <em>Zero Guesswork.</em></h2>
            <p className="ob-body">Every trade passes through five layers of validation. If any single layer fails, no trade is taken. Period.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 3rem', marginTop: '2.5rem' }}>
              <div className="ob-layers">
                {[
                  { num: '1', title: 'Directional Bias', desc: "You look at the daily chart and set one bias: long or short. That's your only input. No execution decisions happen here — it's purely a directional filter." },
                  { num: '2', title: 'Momentum Alignment', desc: 'The system monitors market conditions across multiple lower timeframes. Only when sustained directional pressure is detected — not random volatility — does it proceed.' },
                  { num: '3', title: 'Structural Confirmation', desc: 'Even with aligned momentum, the system waits. Price must expand, retrace, then confirm intent in the original direction. No confirmation, no trade.' },
                ].map((l) => (
                  <div key={l.num} className="ob-layer">
                    <div className="ob-layer__num">{l.num}</div>
                    <div className="ob-layer__content"><h3>{l.title}</h3><p>{l.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="ob-layers">
                {[
                  { num: '4', title: 'Precision Entry', desc: 'Execution triggers only when all prior conditions are met. A rule-based entry model ensures no chasing, confirmed reaction, and full consistency across every trade.' },
                  { num: '5', title: 'Risk & Trade Management', desc: 'Every trade is managed with predefined parameters. Fixed risk, predetermined exits, zero manual interference. The same structure, every single time.' },
                ].map((l) => (
                  <div key={l.num} className="ob-layer">
                    <div className="ob-layer__num">{l.num}</div>
                    <div className="ob-layer__content"><h3>{l.title}</h3><p>{l.desc}</p></div>
                  </div>
                ))}
                <div className="ob-key-note" style={{ marginTop: '1rem' }}>
                  🔒 <strong>Key Principle:</strong> The system does not trade continuously.
                  If alignment isn't present across all layers, no trade is taken. Period.
                </div>
              </div>
            </div>
            <style>{`@media(max-width:768px){.ob-five-layers-grid{grid-template-columns:1fr!important}}`}</style>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── WHAT MAKES IT DIFFERENT ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">What Makes This Different</p>
            <h2 className="ob-section-title">It Doesn't Replace the Trader.<br /><em>It Completes Them.</em></h2>
            <p className="ob-body">
              Fully automated systems fail because they lack context. Manual trading fails because
              of inconsistency. OrcaBot 2.0 sits right in the middle — combining human judgment
              with machine-grade execution.
            </p>
            <div className="ob-compare">
              <div className="ob-compare-col ob-compare-col--bad">
                <h3><X size={16} /> Traditional Bots</h3>
                {['No market context awareness','Over-trade in bad conditions','Break down during volatility','Require constant monitoring'].map(t => (
                  <div key={t} className="ob-compare-item"><X size={15} color="var(--ob-red)" />{t}</div>
                ))}
              </div>
              <div className="ob-compare-col ob-compare-col--good">
                <h3><Check size={16} /> OrcaBot 2.0</h3>
                {['Human context + system execution','Filters out low-quality setups','Waits for full alignment','Set it and walk away'].map(t => (
                  <div key={t} className="ob-compare-item"><Check size={15} color="var(--ob-green)" />{t}</div>
                ))}
              </div>
            </div>
            <div className="ob-safety-note">
              <h4>Built-In Safety</h4>
              <p>
                Even when your bias is wrong, the internal filters protect trade quality.
                When conditions don't align, it simply won't trade — <strong>saving you money even when you were wrong.</strong>
                The system doesn't just find good trades. It keeps you out of bad ones.
              </p>
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── WHAT YOU RECEIVE ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">What You Receive</p>
            <h2 className="ob-section-title">Everything You Need.<br /><em>Nothing You Don't.</em></h2>
            <p className="ob-body">
              Upon joining, you gain access to a complete system designed to make your trading process structured, simple, and consistent.
            </p>
            <div className="ob-receive-grid">
              {[
                { num: '1', title: 'Licensed Access to OrcaBot', desc: 'Your personal license key for the automated execution system. Secured to your cTrader username — non-transferable.' },
                { num: '2', title: 'Private Client Hub (Discord)', desc: 'Updates, direct support, community, and the ability to request improvements directly from the team.' },
                { num: '3', title: 'Ongoing Support', desc: "Fast answers, guidance, and direct communication with the team. You're never on your own." },
                { num: '4', title: 'Setup & Usage Manuals', desc: 'Step-by-step guides to set up correctly and avoid common mistakes. Everything you need from day one.' },
                { num: '5', title: 'Personal Onboarding Call', desc: '1-on-1 call for smooth setup and confidence from day one. We walk you through the entire process.' },
                { num: '6', title: 'Access to Future Updates', desc: 'Improvements, new features, and the ability to provide feedback. Early adopters lock in their price forever.' },
              ].map((item) => (
                <div key={item.num} className="ob-receive-card">
                  <div className="ob-receive-card__num">{item.num}</div>
                  <h4>{item.title}</h4><p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ════════════════════════════════════════
            NEW — ZERO EXPERIENCE? RIGHT PLACE.
        ════════════════════════════════════════ */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">New to Trading?</p>
            <h2 className="ob-section-title">
              Zero Experience?<br />
              <em>You're in the Right Place.</em>
            </h2>
            <p className="ob-body">
              OrcaBot was built to be accessible — not just for experienced traders, but for anyone
              who wants to approach the markets in a structured, disciplined way. You don't need a
              background in finance. You need a process. We provide that process, and everything around it.
            </p>

            <div className="ob-beginner">

              {/* Header block */}
              <div className="ob-beginner__header">
                <div className="ob-beginner__icon">
                  <Users size={28} color="var(--ob-cyan)" />
                </div>
                <div>
                  <h3 className="ob-beginner__heading">
                    OrcaTrading is a <em>Community.</em><br />Not just a product.
                  </h3>
                  <p className="ob-beginner__lead">
                    When you join, you're not buying a file and disappearing. You're entering a
                    growing community of traders at every level — from complete beginners to
                    experienced professionals — all working toward the same goal: consistent,
                    disciplined trading. Our team is actively involved. We answer questions, create
                    educational guides, and improve the system based on your feedback.
                    You will never be left behind.
                  </p>
                </div>
              </div>

              {/* Demo account recommendation banner */}
              <div className="ob-demo-banner">
                <div className="ob-demo-banner__icon">
                  <Monitor size={22} color="#f59e0b" />
                </div>
                <div>
                  <p className="ob-demo-banner__title">
                    💡 Our Recommendation for Beginners — Start on a Demo Account First
                  </p>
                  <p className="ob-demo-banner__desc">
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

              {/* Four support pillars */}
              <div className="ob-support-grid">
                <div className="ob-support-item">
                  <div className="ob-support-item__icon" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
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
                <div className="ob-support-item">
                  <div className="ob-support-item__icon" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
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
                <div className="ob-support-item">
                  <div className="ob-support-item__icon" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
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
                <div className="ob-support-item">
                  <div className="ob-support-item__icon" style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}>
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

              {/* Discord CTA — embedded in the box */}
              <div className="ob-beginner__discord">
                <div className="ob-beginner__discord-text">
                  <h4>Everything happens on Discord — and it's free to join.</h4>
                  <p>
                    All guides, strategy documents, support, live updates, and client communication
                    live inside our Discord server. Whether you're an existing client or just
                    starting to explore, this is where you'll find everything — and everyone —
                    you need. Come say hello. We're in there every single day.
                  </p>
                </div>
                <a
                  className="ob-btn--discord"
                  href={DISCORD_URI}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={18} />
                  Join Our Discord
                </a>
              </div>

            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── EXPECTATIONS ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">Expectations</p>
            <h2 className="ob-section-title">Honest Results.<br /><em>No Overpromises.</em></h2>
            <p className="ob-body">
              We believe in being direct about what this system can and cannot do.
              Trading always involves risk, and no system eliminates that.
            </p>
            <div className="ob-expect-grid">
              <div className="ob-expect-col ob-expect-col--yes">
                <h4>✓ What You Can Expect</h4>
                {['A structured, repeatable process','Consistent behavior on every trade','Safety filters that protect you when wrong','A process that takes minutes per day','Continuous support and improvements'].map(t => (
                  <div key={t} className="ob-expect-item"><Check size={15} color="var(--ob-green)" /> {t}</div>
                ))}
              </div>
              <div className="ob-expect-col ob-expect-col--no">
                <h4>✗ What You Should NOT Expect</h4>
                {['Guaranteed profits or risk-free trading','Winning every trade or every day','A system requiring zero input from you','Immediate or overnight results','A shortcut to replace discipline'].map(t => (
                  <div key={t} className="ob-expect-item"><X size={15} color="var(--ob-red)" /> {t}</div>
                ))}
              </div>
            </div>
            <div className="ob-quote">
              "Trading isn't profitable by doing more. It's profitable by doing the right things, consistently."
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── WHO IT'S FOR ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">Who This Is For</p>
            <h2 className="ob-section-title">Built for Discipline.<br /><em>Not for Everyone.</em></h2>
            <div className="ob-for-grid">
              <div className="ob-for-col ob-for-col--yes">
                <h3>This is for you if…</h3>
                {['You want a structured approach to trading','You understand direction but struggle with execution',"You're willing to follow a clear process",'You prefer clarity over complexity','You want to reduce emotional decisions','You can make one simple daily decision'].map(t => (
                  <div key={t} className="ob-for-item"><Check size={15} color="var(--ob-green)" /> {t}</div>
                ))}
              </div>
              <div className="ob-for-col ob-for-col--no">
                <h3>This is NOT for you if…</h3>
                {['You expect guaranteed profits','You want zero input or responsibility',"You won't follow rules or a process",'You override systems on impulse','You expect constant trades or instant results',"You're searching for shortcuts"].map(t => (
                  <div key={t} className="ob-for-item"><X size={15} color="var(--ob-red)" /> {t}</div>
                ))}
              </div>
            </div>
            <div className="ob-responsibility-note">
              <strong>This system simplifies trading, but it does not remove responsibility.</strong><br />
              Your ability to define direction and remain consistent will directly impact your results.
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── PRICING ── */}
        <section className="ob-section" id="pricing">
          <div className="ob-container">
            <p className="ob-section-label">Pricing</p>
            <h2 className="ob-section-title">Structured Access.<br /><em>Progressive Pricing.</em></h2>
            <p className="ob-body">
              Access is released in structured phases. Each phase reflects increasing validation
              and demand. Early participants lock in their entry price permanently.
            </p>
            <div className="ob-pricing-wrap">
              <div className="ob-price-hero">
                <div className="ob-price-hero__label">Current Phase — Early Access</div>
                <div className="ob-price-hero__amount">€500</div>
                <div className="ob-price-hero__note">One-time · Limited availability · Tax excluded</div>
                <p className="ob-price-hero__desc">
                  The lowest available entry point while the system transitions from final testing
                  into broader use. Your price is locked in — later phases will only increase.
                </p>
                <a className="ob-btn ob-btn--primary ob-btn--lg" href="https://buy.stripe.com/placeholder" target="_blank" rel="noopener noreferrer">
                  Apply for Early Access <ArrowRight size={18} />
                </a>
                <p className="ob-cta-note" style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--ob-muted)' }}>
                  You'll be contacted to schedule your personal onboarding call after purchase.
                </p>
              </div>
              <div className="ob-phases-table">
                <div className="ob-phases-header">Future Phases — Prices Will Increase</div>
                {[
                  { phase: 'Phase 1 — Early Access', price: '€500',   current: true  },
                  { phase: 'Phase 2 — Validated',    price: '€1,000', current: false },
                  { phase: 'Phase 3 — Expansion',    price: '€1,500', current: false },
                  { phase: 'Phase 4 — Established',  price: '€2,500', current: false },
                  { phase: 'Phase 5 — Exclusive',    price: '€3,500', current: false },
                ].map((row) => (
                  <div key={row.phase} className={`ob-phase-row${row.current ? ' ob-phase-row--current' : ''}`}>
                    <span className="ob-phase-row__name">{row.phase}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {row.current && <span className="ob-phase-current-tag">Current</span>}
                      <span className="ob-phase-row__price">{row.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="ob-price-lock">🔒 Your entry price is locked in forever. Later phases will only be more expensive.</p>
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── FAQ ── */}
        <section className="ob-section">
          <div className="ob-container">
            <p className="ob-section-label">FAQ</p>
            <h2 className="ob-section-title">Your Questions, <em>Answered.</em></h2>
            <div className="ob-faq">
              {[
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
              ].map((item) => (
                <div key={item.q} className="ob-faq-item"><h4>{item.q}</h4><p>{item.a}</p></div>
              ))}
            </div>
          </div>
        </section>

        <hr className="ob-divider" />

        {/* ── FINAL CTA ── */}
        <section className="ob-section">
          <div className="ob-container">
            <div className="ob-cta">
              <h2>Ready to Simplify Your Trading?</h2>
              <p>
                Secure your early access today. Limited spots available at the Phase 1 price.
                Your position is locked in from the moment you join.
              </p>
              <a className="ob-btn ob-btn--primary ob-btn--lg" href="https://buy.stripe.com/placeholder" target="_blank" rel="noopener noreferrer">
                Get Early Access — €500 <ArrowRight size={20} />
              </a>
              <p className="ob-cta-note">
                Early access · Limited availability · Price locks in at entry phase<br />
                Questions? Reach out to us on{' '}
                <a href={DISCORD_URI} style={{ color: 'var(--ob-cyan)' }} target="_blank" rel="noopener noreferrer">Discord</a>
                {' '}or visit{' '}
                <a href="https://www.tradewithorca.com" style={{ color: 'var(--ob-cyan)' }}>tradewithorca.com</a>
              </p>
            </div>
          </div>
        </section>

        {/* ── RISK DISCLAIMER ── */}
        <div className="ob-disclaimer">
          <div className="ob-container">
            <p>
              <strong>Risk Disclaimer:</strong> The information, software, and services provided are for educational and informational purposes only and do not constitute financial, investment, or trading advice. Nothing provided should be interpreted as a recommendation to buy or sell any financial instrument. Trading financial markets involves significant risk. There is no guarantee of profit, and losses can occur. You may lose part or all of your trading capital. Past performance is not indicative of future results. You remain fully responsible for choosing your directional bias, operating the system correctly, and managing your own trading account and capital. The system does not make independent financial decisions on your behalf. By purchasing and using this system, you acknowledge that you understand the risks involved in trading and accept full responsibility for your actions.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
