// app/(marketing)/page.tsx
import { Metadata } from 'next'
import {
  MessageCircle, TrendingUp, Zap, Shield, Users,
  ArrowRight, Bot, BarChart3, Star, Check, Lock, Clock
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'OrcaTrading — Automate, Analyze, Trade Smarter',
  description: 'Advanced trading screener with real-time multi-timeframe trend analysis. Automate your trading strategy with transparent, data-driven insights. Free during beta.',
  keywords: 'trading automation, market screener, trend analysis, trading bot, OrcaBot, forex screener, crypto screener',
  authors: [{ name: 'OrcaTrading' }],
  openGraph: {
    title: 'OrcaTrading — Automate, Analyze, Trade Smarter',
    description: 'Advanced trading screener with real-time multi-timeframe trend analysis. Free during beta.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
}

export default function Page() {
  const DISCORD_URI = process.env.NEXT_PUBLIC_DISCORD_URI || "https://discord.gg/your-invite-code";
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        /* ─────────────────────────────────────────
           DESIGN TOKENS
        ───────────────────────────────────────── */
        .hp {
          --bg:          #060d18;
          --bg2:         #090f1c;
          --surface:     #0c1624;
          --card:        #0e1b2b;
          --card2:       #111f30;
          --border:      #172233;
          --border2:     #1d2d42;
          --cyan:        #00d4ff;
          --cyan-20:     rgba(0,212,255,0.20);
          --cyan-10:     rgba(0,212,255,0.10);
          --cyan-05:     rgba(0,212,255,0.05);
          --green:       #0fba7e;
          --green-15:    rgba(15,186,126,0.15);
          --text:        #e8eef8;
          --text2:       #c4d0df;
          --muted:       #6b8aaa;
          --muted2:      #4d6880;
          font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
        }

        /* ─────────────────────────────────────────
           UTILITY
        ───────────────────────────────────────── */
        .hp-wrap    { width: min(1140px, 92vw); margin-inline: auto; }
        .hp-divider { border: none; border-top: 1px solid var(--border); margin: 0; }

        /* ─────────────────────────────────────────
           HERO
        ───────────────────────────────────────── */
        .hp-hero {
          position: relative;
          overflow: hidden;
          padding: clamp(6rem, 14vw, 10rem) 0 clamp(5rem, 10vw, 8rem);
          text-align: center;
        }

        .hp-hero-mesh {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 100% 65% at 50% -8%, rgba(0,212,255,0.16) 0%, transparent 65%),
            radial-gradient(ellipse 55% 40% at 10% 90%,  rgba(15,186,126,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 45% 35% at 90% 85%,  rgba(0,120,255,0.06) 0%, transparent 55%);
        }

        .hp-hero-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(0,212,255,0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%);
        }

        .hp-hero-line {
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 600px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent);
        }

        .hp-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 999px;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--cyan);
          background: rgba(0,212,255,0.07);
          backdrop-filter: blur(8px);
          margin-bottom: 2.25rem;
        }
        .hp-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 6px var(--cyan);
          animation: dot-pulse 2s ease-in-out infinite;
        }
        @keyframes dot-pulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px var(--cyan); }
          50% { opacity:0.35; box-shadow: 0 0 2px var(--cyan); }
        }

        .hp-h1 {
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin: 0 0 1.5rem;
          max-width: 900px;
          margin-inline: auto;
          color: var(--text);
        }
        .hp-h1 .shimmer {
          background: linear-gradient(
            110deg,
            var(--cyan) 0%,
            #40e8ff 30%,
            var(--green) 55%,
            #40e8ff 75%,
            var(--cyan) 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        .hp-sub {
          font-size: clamp(1.05rem, 2vw, 1.2rem);
          color: var(--muted);
          max-width: 560px;
          margin: 0 auto 2.75rem;
          line-height: 1.8;
          font-weight: 400;
        }

        .hp-ctas {
          display: flex; gap: 0.875rem;
          justify-content: center; flex-wrap: wrap;
          margin-bottom: 4rem;
        }

        .hp-stats {
          display: flex; gap: clamp(2.5rem, 5vw, 5rem);
          justify-content: center; flex-wrap: wrap;
          padding-top: 3rem;
          border-top: 1px solid var(--border);
        }
        .hp-stat-val {
          font-size: clamp(1.75rem, 3.5vw, 2.25rem);
          font-weight: 700; letter-spacing: -0.035em;
          color: var(--cyan); line-height: 1;
          margin-bottom: 0.35rem;
        }
        .hp-stat-lbl {
          /* FIX 1: was 0.8rem — bumped for legibility */
          font-size: 0.92rem; color: var(--muted);
          font-weight: 500; letter-spacing: 0.01em;
        }

        /* ─────────────────────────────────────────
           TRUST BAR
        ───────────────────────────────────────── */
        .hp-trust {
          background: var(--surface);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 1.15rem 0;
        }
        .hp-trust-inner {
          display: flex; gap: 2.5rem; align-items: center;
          justify-content: center; flex-wrap: wrap;
        }
        .hp-trust-item {
          display: flex; align-items: center; gap: 0.55rem;
          /* FIX 1: was 0.83rem */
          font-size: 0.93rem; color: var(--text2);
          font-weight: 500; white-space: nowrap;
        }
        .hp-trust-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--green);
          box-shadow: 0 0 6px var(--green);
          flex-shrink: 0;
        }

        /* ─────────────────────────────────────────
           SECTION COMMONS
        ───────────────────────────────────────── */
        .hp-section { padding: clamp(5rem, 9vw, 7.5rem) 0; }

        /* FIX 1: hp-label — bigger, more presence */
        .hp-label {
          display: flex; align-items: center; gap: 0.65rem;
          /* was 0.68rem */
          font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--cyan); margin-bottom: 0.9rem;
        }
        .hp-label::before {
          content: ''; display: block;
          width: 22px; height: 2px;
          background: linear-gradient(90deg, var(--cyan), transparent);
          border-radius: 2px;
        }
        .hp-label::after {
          content: ''; display: block;
          width: 22px; height: 2px;
          background: linear-gradient(90deg, transparent, var(--cyan));
          border-radius: 2px;
        }

        .hp-h2 {
          font-size: clamp(2.2rem, 4.5vw, 3.2rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.03em; margin: 0 0 1.1rem;
          color: var(--text);
        }
        .hp-h2 em { font-style: normal; color: var(--cyan); }

        .hp-lead {
          /* FIX 1: was 1.05rem */
          font-size: 1.1rem; color: var(--muted);
          line-height: 1.8; max-width: 580px; font-weight: 400;
        }

        /* ─────────────────────────────────────────
           WHY — FEATURE CARDS
        ───────────────────────────────────────── */
        .hp-feat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem; margin-top: 3rem;
        }
        @media(max-width:900px){ .hp-feat-grid { grid-template-columns: 1fr; } }

        .hp-feat {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2.25rem 2rem;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden;
        }
        .hp-feat::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(0,212,255,0.06), transparent 65%);
          opacity: 0; transition: opacity 0.3s;
        }
        .hp-feat:hover {
          border-color: rgba(0,212,255,0.28);
          transform: translateY(-4px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,212,255,0.1);
        }
        .hp-feat:hover::before { opacity: 1; }

        .hp-feat-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.5rem; position: relative; z-index: 1;
        }
        .hp-feat h3 {
          /* FIX 1: was 1.05rem */
          font-size: 1.15rem; font-weight: 600;
          margin: 0 0 0.65rem; position: relative; z-index: 1;
        }
        .hp-feat p {
          /* FIX 1: was 0.88rem */
          font-size: 0.97rem; color: var(--text2);
          margin: 0; line-height: 1.75; position: relative; z-index: 1;
        }

        /* ─────────────────────────────────────────
           ORCABOT FEATURED
        ───────────────────────────────────────── */
        .hp-orca {
          position: relative; overflow: hidden;
          background: var(--card);
          border: 1px solid var(--border2);
          border-radius: 24px;
          padding: clamp(2.75rem, 5vw, 4.5rem);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media(max-width:800px){ .hp-orca { grid-template-columns:1fr; gap:2.5rem; } }

        .hp-orca::before {
          content: '';
          position: absolute; top: 0; left: 3rem; right: 3rem; height: 1px;
          background: linear-gradient(90deg, transparent, var(--cyan), transparent);
        }
        .hp-orca::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 65% at 100% 45%, rgba(0,212,255,0.06), transparent 60%),
            radial-gradient(ellipse 35% 45% at 0% 55%, rgba(15,186,126,0.04), transparent 55%);
        }

        .hp-orca-left { position: relative; z-index: 1; }

        .hp-orca-badge {
          display: inline-flex; align-items: center; gap: 0.45rem;
          padding: 0.32rem 0.9rem;
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 999px;
          /* FIX 1: was 0.67rem */
          font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--cyan); background: var(--cyan-10);
          margin-bottom: 1.4rem;
        }

        .hp-orca-title {
          font-size: clamp(1.9rem, 3.5vw, 2.6rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.03em; margin: 0 0 1.1rem;
        }
        .hp-orca-title em { font-style: normal; color: var(--cyan); }

        .hp-orca-desc {
          /* FIX 1: was 1rem */
          font-size: 1.05rem; color: var(--text2);
          line-height: 1.8; margin: 0 0 1.75rem; max-width: 440px;
        }

        .hp-orca-checks {
          display: flex; flex-direction: column; gap: 0.65rem;
          margin-bottom: 2.25rem;
        }
        .hp-orca-check {
          display: flex; align-items: center; gap: 0.7rem;
          /* FIX 1: was 0.88rem */
          font-size: 1rem; color: var(--text2); font-weight: 500;
        }
        .hp-orca-check svg { color: var(--green); flex-shrink: 0; }

        .hp-orca-ctas { display: flex; gap: 0.75rem; flex-wrap: wrap; }

        .hp-orca-right { position: relative; z-index: 1; }

        .hp-cards { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem; }

        .hp-trade-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.1rem 1.4rem;
          display: flex; align-items: center; gap: 1rem;
          transition: border-color 0.25s;
        }
        .hp-trade-card:first-child { border-color: rgba(15,186,126,0.3); }
        .hp-trade-card:hover { border-color: rgba(0,212,255,0.2); }

        .hp-trade-icon {
          width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .hp-trade-info h4 {
          /* FIX 1: was 0.88rem */
          font-size: 0.95rem; font-weight: 600; margin: 0 0 0.18rem;
        }
        .hp-trade-info p  {
          /* FIX 1: was 0.77rem */
          font-size: 0.85rem; color: var(--muted); margin: 0;
        }
        .hp-trade-badge {
          margin-left: auto; flex-shrink: 0;
          /* FIX 1: was 0.7rem */
          font-size: 0.78rem; font-weight: 700; padding: 0.25rem 0.7rem;
          border-radius: 7px; letter-spacing: 0.04em;
        }
        .hp-trade-badge--green { background: var(--green-15); color: #2de89a; }
        .hp-trade-badge--cyan  { background: var(--cyan-10);  color: var(--cyan); }
        .hp-trade-badge--dim   { background: rgba(255,255,255,0.04); color: var(--muted2); }

        .hp-price-callout {
          background: var(--bg2);
          border: 1px solid rgba(0,212,255,0.18);
          border-radius: 16px;
          padding: 1.25rem 1.6rem;
          display: flex; align-items: center;
          justify-content: space-between; gap: 1rem; flex-wrap: wrap;
        }
        .hp-price-callout-label {
          /* FIX 1: was 0.67rem */
          font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--muted); margin-bottom: 0.25rem;
        }
        .hp-price-callout-amount {
          font-size: 2.1rem; font-weight: 700;
          color: var(--cyan); letter-spacing: -0.04em; line-height: 1;
        }
        .hp-price-callout-sub {
          /* FIX 1: was 0.75rem */
          font-size: 0.85rem; color: var(--muted); margin-top: 0.2rem;
        }
        .hp-price-callout-right {
          /* FIX 1: was 0.82rem */
          font-size: 0.9rem; color: var(--muted); line-height: 1.65; text-align: right;
        }
        .hp-price-callout-right strong { color: var(--text2); display: block; }

        /* ─────────────────────────────────────────
           PRODUCTS
        ───────────────────────────────────────── */
        .hp-products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem; margin-top: 3rem;
        }
        @media(max-width:900px){ .hp-products-grid { grid-template-columns: 1fr; } }

        .hp-product {
          background: var(--card);
          border: 1px solid var(--border);
          border-top: 2px solid var(--border2);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          text-decoration: none; color: inherit;
          display: flex; flex-direction: column;
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
          position: relative; overflow: hidden;
        }
        .hp-product:hover {
          border-color: rgba(0,212,255,0.3);
          border-top-color: var(--cyan);
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.25);
        }
        .hp-product--dim { opacity: 0.55; pointer-events: none; }

        .hp-product-head {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 1.25rem;
        }
        .hp-product-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        .hp-product-tag {
          /* FIX 1: was 0.65rem */
          font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.7rem;
          border-radius: 8px; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .hp-product-tag--live  { background: var(--green-15); color: #2de89a; }
        .hp-product-tag--early { background: var(--cyan-10); color: var(--cyan); }
        .hp-product-tag--soon  { background: rgba(255,255,255,0.05); color: var(--muted); }

        .hp-product h3 {
          /* FIX 1: was 1.05rem */
          font-size: 1.12rem; font-weight: 600; margin: 0 0 0.55rem;
        }
        .hp-product p  {
          /* FIX 1: was 0.85rem */
          font-size: 0.95rem; color: var(--text2); margin: 0 0 1.5rem; line-height: 1.7; flex: 1;
        }
        .hp-product-link {
          display: inline-flex; align-items: center; gap: 0.4rem;
          /* FIX 1: was 0.85rem */
          font-size: 0.92rem; font-weight: 600; color: var(--cyan);
          margin-top: auto;
        }
        .hp-product-link--dim { color: var(--muted); }

        /* ─────────────────────────────────────────
           PRICING
           FIX 2: Aurora gradient on the free box
        ───────────────────────────────────────── */
        .hp-pricing-hero {
          position: relative; overflow: hidden;
          border: 1px solid rgba(0,212,255,0.22);
          border-radius: 22px;
          padding: clamp(2.5rem, 5vw, 3.75rem);
          text-align: center; margin-bottom: 1.75rem;

          /* Aurora base */
          background:
            /* moving aurora streaks */
            radial-gradient(ellipse 80% 55% at 20% 0%, rgba(0,212,255,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 60% 45% at 80% 10%, rgba(15,186,126,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(0,100,255,0.08) 0%, transparent 55%),
            /* base fill */
            linear-gradient(160deg, rgba(0,212,255,0.06) 0%, rgba(0,212,255,0.02) 50%, rgba(15,186,126,0.04) 100%),
            var(--card);
        }

        /* Shimmer top line */
        .hp-pricing-hero::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 500px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.6), rgba(15,186,126,0.4), transparent);
        }

        /* Subtle animated aurora sweep */
        .hp-pricing-hero::after {
          content: '';
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 70% 35% at 15% 50%, rgba(15,186,126,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 30% at 85% 40%, rgba(0,212,255,0.07) 0%, transparent 55%);
          animation: aurora-drift 8s ease-in-out infinite alternate;
        }
        @keyframes aurora-drift {
          0%   { opacity: 0.6; transform: translateY(0px) scale(1); }
          100% { opacity: 1;   transform: translateY(-8px) scale(1.03); }
        }

        .hp-beta-tag {
          display: inline-block;
          /* FIX 1: was 0.72rem */
          font-size: 0.82rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--green);
          margin-bottom: 1rem; position: relative; z-index: 1;
        }
        .hp-free-num {
          font-size: clamp(4rem, 9vw, 6rem);
          font-weight: 700; color: var(--cyan);
          line-height: 1; letter-spacing: -0.05em; margin-bottom: 0.75rem;
          position: relative; z-index: 1;
        }
        .hp-pricing-desc {
          /* FIX 1: was 1rem */
          font-size: 1.05rem; color: var(--text2);
          max-width: 420px; margin: 0 auto 2rem; line-height: 1.75;
          position: relative; z-index: 1;
        }
        .hp-feat-list {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 0.6rem 2rem; max-width: 480px;
          margin: 0 auto 2.5rem; text-align: left;
          position: relative; z-index: 1;
        }
        @media(max-width:500px){ .hp-feat-list { grid-template-columns: 1fr; } }
        .hp-feat-list li {
          list-style: none;
          display: flex; align-items: center; gap: 0.55rem;
          /* FIX 1: was 0.88rem */
          font-size: 0.97rem; color: var(--text2); font-weight: 500;
        }
        .hp-feat-list li::before {
          content: '✓'; color: var(--green); font-weight: 700; flex-shrink: 0;
        }

        /* Plans */
        .hp-plans {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.1rem;
        }
        @media(max-width:768px){ .hp-plans { grid-template-columns: 1fr; } }

        .hp-plan {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px; padding: 1.75rem;
          position: relative;
        }
        .hp-plan--pop {
          border-color: rgba(0,212,255,0.3);
          background: linear-gradient(160deg, rgba(0,212,255,0.07), var(--card));
        }
        .hp-plan-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: var(--cyan); color: #04111e;
          /* FIX 1: was 0.62rem */
          font-size: 0.7rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.22rem 0.85rem; border-radius: 999px;
          white-space: nowrap;
        }
        .hp-plan-name {
          /* FIX 1: was 0.72rem */
          font-size: 0.82rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--muted); margin: 0 0 0.4rem;
        }
        .hp-plan-price {
          font-size: 1.75rem; font-weight: 700;
          letter-spacing: -0.03em; margin: 0 0 1rem;
        }
        .hp-plan-price span {
          /* FIX 1: was 0.82rem */
          font-size: 0.9rem; font-weight: 400; color: var(--muted);
        }
        .hp-plan-feat {
          display: flex; align-items: center; gap: 0.5rem;
          /* FIX 1: was 0.83rem */
          font-size: 0.92rem; color: var(--text2);
          margin-bottom: 0.45rem; font-weight: 500;
        }
        .hp-plan-feat::before { content: '✓'; color: var(--green); font-weight: 700; }

        /* ─────────────────────────────────────────
           DISCORD
        ───────────────────────────────────────── */
        .hp-discord {
          background:
            radial-gradient(ellipse 70% 70% at 50% -10%, rgba(88,101,242,0.16), transparent 60%),
            var(--surface);
          border: 1px solid rgba(88,101,242,0.22);
          border-radius: 24px;
          padding: clamp(3rem, 6vw, 5rem);
          text-align: center;
        }
        .hp-discord-icon {
          width: 68px; height: 68px; margin: 0 auto 1.75rem;
          background: #5865F2; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 16px 48px rgba(88,101,242,0.4);
        }
        .hp-discord h2 {
          font-size: clamp(1.8rem, 3.5vw, 2.5rem);
          font-weight: 700; letter-spacing: -0.025em; margin: 0 0 1rem;
        }
        .hp-discord p {
          /* FIX 1: was 1rem */
          font-size: 1.05rem; color: var(--text2);
          max-width: 500px; margin: 0 auto 2.5rem; line-height: 1.8;
        }
        .hp-discord-stats {
          display: flex; gap: clamp(2.5rem, 5vw, 5rem);
          justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem;
        }
        .hp-ds-val {
          font-size: 1.85rem; font-weight: 700;
          color: #818cf8; letter-spacing: -0.03em; margin-bottom: 0.25rem;
        }
        .hp-ds-lbl {
          /* FIX 1: was 0.8rem */
          font-size: 0.92rem; color: var(--muted); font-weight: 500;
        }

        /* ─────────────────────────────────────────
           FINAL CTA
        ───────────────────────────────────────── */
        .hp-cta-strip {
          background: linear-gradient(135deg, rgba(0,212,255,0.09), rgba(0,212,255,0.02));
          border: 1px solid rgba(0,212,255,0.16);
          border-radius: 24px;
          padding: clamp(3rem, 6vw, 5rem);
          text-align: center; position: relative; overflow: hidden;
        }
        .hp-cta-strip::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 400px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.45), transparent);
        }
        .hp-cta-strip h2 {
          font-size: clamp(1.9rem, 4vw, 2.75rem);
          font-weight: 700; letter-spacing: -0.03em; margin: 0 0 1rem;
        }
        .hp-cta-strip p {
          /* FIX 1: was 1.05rem, keeping same but bumping color */
          font-size: 1.05rem; color: var(--text2);
          max-width: 460px; margin: 0 auto 2.5rem; line-height: 1.75;
        }

        /* ─────────────────────────────────────────
           BUTTONS
        ───────────────────────────────────────── */
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.5rem; border-radius: 999px; border: 0;
          cursor: pointer; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.97rem;
          padding: 0.875rem 1.875rem;
          transition: all 0.22s ease;
          white-space: nowrap;
        }
        .btn-primary {
          background: var(--cyan); color: #04111e;
          box-shadow: 0 0 0 0 rgba(0,212,255,0.35);
        }
        .btn-primary:hover {
          background: #26daff;
          color: #04111e;
          box-shadow: 0 0 0 8px rgba(0,212,255,0.15), 0 4px 20px rgba(0,212,255,0.3);
          transform: translateY(-1px);
        }
        .btn-ghost {
          background: rgba(255,255,255,0.04);
          color: var(--text2);
          border: 1px solid var(--border2);
        }
        .btn-ghost:hover {
          border-color: rgba(0,212,255,0.28);
          color: var(--cyan); background: var(--cyan-05);
        }
        .btn-discord {
          background: #5865F2; color: #fff;
          box-shadow: 0 0 0 0 rgba(88,101,242,0.35);
        }
        .btn-discord:hover {
          background: #6772f5;
          box-shadow: 0 0 0 8px rgba(88,101,242,0.15);
        }
        .btn-lg { font-size: 1.05rem; padding: 1rem 2.25rem; }
        .btn-sm { font-size: 0.9rem; padding: 0.7rem 1.4rem; }

        .text-center { text-align: center; }
        .mt-12 { margin-top: 3rem; }
        .mb-6  { margin-bottom: 1.5rem; }
      `}</style>

      <div className="hp">

        {/* ══════════ HERO ══════════ */}
        <section className="hp-hero">
          <div className="hp-hero-mesh" />
          <div className="hp-hero-dots" />
          <div className="hp-hero-line" />

          <div className="hp-wrap" style={{ position: 'relative' }}>
            <div className="hp-badge">
              <span className="hp-badge-dot" />
              Engineered in Germany
            </div>

            <h1 className="hp-h1">
              Automate, Analyze,<br />
              <span className="shimmer">Trade Smarter.</span>
            </h1>

            <p className="hp-sub">
              Real-time multi-timeframe trend analysis with transparent,
              data-driven insights. Built for traders who want an edge —
              not a guessing game.
            </p>

            <div className="hp-ctas">
              <a className="btn btn-primary btn-lg" href="/dashboard">
                Try Free Screener <ArrowRight size={17} />
              </a>
              <a className="btn btn-ghost btn-lg" href="/orcabot">
                <Bot size={17} /> OrcaBot 2.0
              </a>
            </div>

            <div className="hp-stats">
              {[
                { val: '35ms', lbl: 'Avg. latency' },
                { val: '24/7', lbl: 'Live monitoring' },
                { val: 'Free', lbl: 'During beta' },
                { val: '12mo', lbl: 'Live test data' },
              ].map(s => (
                <div key={s.val} className="hp-stat">
                  <div className="hp-stat-val">{s.val}</div>
                  <div className="hp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ TRUST BAR ══════════ */}
        <div className="hp-trust">
          <div className="hp-trust-inner hp-wrap">
            {[
              'Rules-based algorithms',
              'Multi-asset coverage',
              'Personal onboarding',
              'Private Discord community',
              'Supportive Eco-System'
            ].map(t => (
              <div key={t} className="hp-trust-item">
                <span className="hp-trust-dot" /> {t}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════ WHY ORCATRADING ══════════ */}
        <section className="hp-section">
          <div className="hp-wrap">
            <div className="text-center" style={{ maxWidth: 620, marginInline: 'auto' }}>
              <p className="hp-label" style={{ justifyContent: 'center' }}>Why OrcaTrading</p>
              <h2 className="hp-h2">Built Different. <em>By Design.</em></h2>
              <p className="hp-lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
                Every signal verified with live data. Every rule transparent.
                Every tool engineered to give you a real, measurable edge.
              </p>
            </div>

            <div className="hp-feat-grid">
              <div className="hp-feat">
                <div className="hp-feat-icon" style={{ background: 'linear-gradient(135deg,#00d4ff22,#00d4ff08)', border: '1px solid rgba(0,212,255,0.18)' }}>
                  <Shield size={24} color="var(--cyan)" />
                </div>
                <h3>Transparent &amp; Verified</h3>
                <p>Rules-based algorithms backed by 12 months of live data. No black boxes, no hidden risks — just clear, accountable logic.</p>
              </div>
              <div className="hp-feat">
                <div className="hp-feat-icon" style={{ background: 'linear-gradient(135deg,#0fba7e22,#0fba7e08)', border: '1px solid rgba(15,186,126,0.18)' }}>
                  <Zap size={24} color="var(--green)" />
                </div>
                <h3>Real-Time Insights</h3>
                <p>Multi-timeframe trend analysis in seconds. Spot opportunities across forex, crypto, stocks, and indices before the crowd.</p>
              </div>
              <div className="hp-feat">
                <div className="hp-feat-icon" style={{ background: 'linear-gradient(135deg,#818cf822,#818cf808)', border: '1px solid rgba(129,140,248,0.18)' }}>
                  <Users size={24} color="#818cf8" />
                </div>
                <h3>Community-Driven</h3>
                <p>Built alongside active traders. Join our Discord to shape features, share strategies, and get direct daily access to the team.</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="hp-divider" />

        {/* ══════════ ORCABOT FEATURED ══════════ */}
        <section className="hp-section">
          <div className="hp-wrap">
            <p className="hp-label" style={{ marginBottom: '1.75rem' }}>Featured Product</p>
            <div className="hp-orca">
              <div className="hp-orca-left">
                <div className="hp-orca-badge">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', display: 'inline-block', boxShadow: '0 0 6px var(--cyan)' }} />
                  Early Access · Limited Spots
                </div>
                <h2 className="hp-orca-title">
                  OrcaBot 2.0<br />
                  <em>One Decision.<br />Precision Execution.</em>
                </h2>
                <p className="hp-orca-desc">
                  The hybrid automated trading system that removes execution errors
                  while keeping you in control. You set the bias — the system handles
                  entries, risk, and exits. No emotion. No errors.
                </p>
                <div className="hp-orca-checks">
                  {[
                    'Hybrid automation — human direction, machine execution',
                    'Five-layer filtering — only high-quality setups',
                    'Built-in safety — filters protect you even when wrong',
                    'Minutes per day — set it and walk away',
                  ].map(t => (
                    <div key={t} className="hp-orca-check">
                      <Check size={16} /> {t}
                    </div>
                  ))}
                </div>
                <div className="hp-orca-ctas">
                  <a className="btn btn-primary" href="/orcabot">
                    Learn More <ArrowRight size={16} />
                  </a>
                  <a className="btn btn-ghost btn-sm" href="/orcabot#pricing">
                    See Pricing
                  </a>
                </div>
              </div>

              <div className="hp-orca-right">
                <div className="hp-cards">
                  <div className="hp-trade-card">
                    <div className="hp-trade-icon" style={{ background: 'rgba(15,186,126,0.12)' }}>
                      <TrendingUp size={20} color="var(--green)" />
                    </div>
                    <div className="hp-trade-info">
                      <h4>EURUSD · Long Entry</h4>
                      <p>All 5 layers confirmed · Risk 1%</p>
                    </div>
                    <span className="hp-trade-badge hp-trade-badge--green">Executed</span>
                  </div>
                  <div className="hp-trade-card">
                    <div className="hp-trade-icon" style={{ background: 'var(--cyan-10)' }}>
                      <Shield size={20} color="var(--cyan)" />
                    </div>
                    <div className="hp-trade-info">
                      <h4>GBPJPY · Filter Active</h4>
                      <p>Momentum layer pending</p>
                    </div>
                    <span className="hp-trade-badge hp-trade-badge--cyan">Waiting</span>
                  </div>
                  <div className="hp-trade-card">
                    <div className="hp-trade-icon" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <BarChart3 size={20} color="var(--muted)" />
                    </div>
                    <div className="hp-trade-info">
                      <h4>XAUUSD · Setup Skipped</h4>
                      <p>Conditions not met · Protected</p>
                    </div>
                    <span className="hp-trade-badge hp-trade-badge--dim">Skipped</span>
                  </div>
                </div>

                <div className="hp-price-callout">
                  <div>
                    <div className="hp-price-callout-label">Phase 1 — Early Access</div>
                    <div className="hp-price-callout-amount">€500</div>
                    <div className="hp-price-callout-sub">One-time · Price locks at entry</div>
                  </div>
                  <div className="hp-price-callout-right">
                    Price increases each phase.
                    <strong>Early adopters locked forever.</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="hp-divider" />

        {/* ══════════ TOOLS ══════════ */}
        <section className="hp-section" id="products">
          <div className="hp-wrap">
            <p className="hp-label">Our Tools</p>
            <h2 className="hp-h2">Powerful Tools<br /><em>For Modern Traders.</em></h2>

            <div className="hp-products-grid">
              {/* FIX 3: Premium Screener icon now matches OrcaBot/OrcaJournal style — dark bg + outline, not filled cyan */}
              <a className="hp-product" href="/dashboard">
                <div className="hp-product-head">
                  <div className="hp-product-icon" style={{ background: 'var(--cyan-10)', border: '1px solid rgba(0,212,255,0.22)' }}>
                    <BarChart3 size={20} color="var(--cyan)" />
                  </div>
                  <span className="hp-product-tag hp-product-tag--live">Live · Free</span>
                </div>
                <h3>Premium Screener</h3>
                <p>Multi-timeframe trend analysis with intraday, daily, and advanced indicators. Spot opportunities across forex, crypto, stocks, and indices.</p>
                <span className="hp-product-link">Try now (Free) <ArrowRight size={14} /></span>
              </a>

              <a className="hp-product" href="/orcabot">
                <div className="hp-product-head">
                  <div className="hp-product-icon" style={{ background: 'var(--cyan-10)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Bot size={20} color="var(--cyan)" />
                  </div>
                  <span className="hp-product-tag hp-product-tag--early">Early Access</span>
                </div>
                <h3>OrcaBot 2.0</h3>
                <p>Hybrid automated trading. You set the direction. The system handles execution, risk, and trade management. One decision per day.</p>
                <span className="hp-product-link">Learn more <ArrowRight size={14} /></span>
              </a>

              <div className="hp-product hp-product--dim">
                <div className="hp-product-head">
                  <div className="hp-product-icon" style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)' }}>
                    <Star size={20} color="#818cf8" />
                  </div>
                  <span className="hp-product-tag hp-product-tag--soon">Coming Soon</span>
                </div>
                <h3>OrcaJournal</h3>
                <p>Track performance metrics, analyze expectancy, and get AI-powered insights for continuous improvement in your trading.</p>
                <span className="hp-product-link hp-product-link--dim">In development</span>
              </div>
            </div>
          </div>
        </section>

        <hr className="hp-divider" />

        {/* ══════════ PRICING ══════════ */}
        <section className="hp-section" id="pricing">
          <div className="hp-wrap">
            <div className="text-center mb-6" style={{ maxWidth: 540, marginInline: 'auto', marginBottom: '2.5rem' }}>
              <p className="hp-label" style={{ justifyContent: 'center' }}>Pricing</p>
              <h2 className="hp-h2">Simple. <em>Transparent.</em></h2>
              <p className="hp-lead" style={{ marginInline: 'auto', textAlign: 'center' }}>
                Start free. Upgrade when you're ready.
              </p>
            </div>

            {/* FIX 2: Aurora gradient box */}
            <div className="hp-pricing-hero">
              <div className="hp-beta-tag">🎉 Free During Beta — No Credit Card Required</div>
              <div className="hp-free-num">Free</div>
              <p className="hp-pricing-desc">
                Full access to the Premium Screener while we're in beta.
                No cost, no limits, no commitment.
              </p>
              <ul className="hp-feat-list">
                {[
                  'Real-time multi-timeframe analysis',
                  'All asset classes (Forex, Crypto, Stocks)',
                  'Custom watchlists & alerts',
                  'Discord community access',
                  'Priority feature requests',
                  'No credit card needed',
                ].map(t => <li key={t}>{t}</li>)}
              </ul>
              <a className="btn btn-primary btn-lg" href="/dashboard" style={{ position: 'relative', zIndex: 1 }}>
                Start Trading Smarter <ArrowRight size={18} />
              </a>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1.25rem' }}>
              Plans after launch
            </p>
            <div className="hp-plans">
              <div className="hp-plan">
                <div className="hp-plan-name">Starter</div>
                <div className="hp-plan-price">Free <span>forever</span></div>
                {['Daily regime overview', 'Basic trend indicators', 'Email support'].map(t => (
                  <div key={t} className="hp-plan-feat">{t}</div>
                ))}
              </div>
              <div className="hp-plan hp-plan--pop">
                <div className="hp-plan-badge">Most Popular</div>
                <div className="hp-plan-name">Premium</div>
                <div className="hp-plan-price">€8.99 <span>/ mo</span></div>
                {['Everything in Free', 'Advanced alerts & filters', 'API access', 'Priority support'].map(t => (
                  <div key={t} className="hp-plan-feat">{t}</div>
                ))}
              </div>
              <div className="hp-plan">
                <div className="hp-plan-name">Institutional</div>
                <div className="hp-plan-price">Custom</div>
                {['White-label solutions', 'Dedicated infrastructure', 'SLA guarantees', 'Onboarding & training'].map(t => (
                  <div key={t} className="hp-plan-feat">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="hp-divider" />

        {/* ══════════ DISCORD ══════════ */}
        <section className="hp-section" id="community">
          <div className="hp-wrap">
            <div className="hp-discord">
              <div className="hp-discord-icon">
                <MessageCircle size={32} color="white" />
              </div>
              <h2>Join Our Trading Community</h2>
              <p>Connect with fellow traders, get real-time support, share strategies, and help shape OrcaTrading. Our team is active every day.</p>
              <div className="hp-discord-stats">
                {[
                  { val: '24/7', lbl: 'Community Support' },
                  { val: 'Active', lbl: 'Daily Updates' },
                  { val: 'Free', lbl: 'Always & Forever' },
                ].map(s => (
                  <div key={s.val}>
                    <div className="hp-ds-val">{s.val}</div>
                    <div className="hp-ds-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <a className="btn btn-discord btn-lg" href={DISCORD_URI} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={20} /> Join Discord Community
              </a>
              <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                Instant access to exclusive channels, market insights, and beta features
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="hp-section" style={{ paddingBottom: 'clamp(5rem, 10vw, 7rem)' }}>
          <div className="hp-wrap">
            <div className="hp-cta-strip">
              <h2>Ready to Trade Smarter?</h2>
              <p>Join traders using OrcaTrading for a real edge — free screener, hybrid automation, and a community that actually helps.</p>
              <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a className="btn btn-primary btn-lg" href="/dashboard">
                  Get Started Free <ArrowRight size={18} />
                </a>
                <a className="btn btn-ghost" href="/orcabot">
                  Explore OrcaBot
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="page-bottom-safe" />
      </div>
    </>
  )
}
