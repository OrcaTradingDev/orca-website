// app/not-found.tsx
import { ArrowRight, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        .nf {
          --bg:       #060d18;
          --cyan:     #00d4ff;
          --green:    #0fba7e;
          --text:     #e8eef8;
          --text2:    #c4d0df;
          --muted:    #6b8aaa;
          --border:   #172233;
          --card:     #0e1b2b;
          font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        /* ── Ambient background ── */
        .nf-bg {
          position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,212,255,0.055) 0%, transparent 65%),
            radial-gradient(ellipse 35% 30% at 15% 80%, rgba(15,186,126,0.04) 0%, transparent 55%),
            radial-gradient(ellipse 30% 25% at 85% 20%, rgba(0,100,255,0.04) 0%, transparent 55%);
        }

        /* Dot grid */
        .nf-dots {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(circle, rgba(0,212,255,0.07) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 10%, transparent 80%);
        }

        /* ── Sonar ── */
        .nf-sonar {
          position: relative;
          width: 340px; height: 340px;
          margin: 0 auto 2.5rem;
          flex-shrink: 0;
        }

        /* Outer rings */
        .nf-ring {
          position: absolute; border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.12);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }
        .nf-ring--1 { width: 100%; height: 100%; border-color: rgba(0,212,255,0.10); }
        .nf-ring--2 { width: 70%;  height: 70%;  border-color: rgba(0,212,255,0.13); }
        .nf-ring--3 { width: 40%;  height: 40%;  border-color: rgba(0,212,255,0.18); }

        /* Sweep arm */
        .nf-sweep {
          position: absolute; inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            transparent 75%,
            rgba(0,212,255,0.18) 88%,
            rgba(0,212,255,0.55) 100%
          );
          animation: sonar-sweep 3s linear infinite;
        }
        @keyframes sonar-sweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* Sweep trail glow */
        .nf-sweep::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 50%; height: 2px;
          margin-top: -1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.7));
          transform-origin: left center;
          border-radius: 0 999px 999px 0;
        }

        /* Crosshair lines */
        .nf-cross {
          position: absolute; inset: 0;
          pointer-events: none;
        }
        .nf-cross::before,
        .nf-cross::after {
          content: '';
          position: absolute; background: rgba(0,212,255,0.07);
        }
        .nf-cross::before {
          width: 1px; height: 100%;
          left: 50%; transform: translateX(-50%);
        }
        .nf-cross::after {
          height: 1px; width: 100%;
          top: 50%; transform: translateY(-50%);
        }

        /* 404 in the middle */
        .nf-404 {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 5.5rem;
          font-weight: 700;
          letter-spacing: -0.06em;
          line-height: 1;
          font-family: 'DM Mono', monospace;
          color: var(--text);
          text-shadow: 0 0 40px rgba(0,212,255,0.25);
          user-select: none;
          animation: glitch 6s ease-in-out infinite;
        }
        @keyframes glitch {
          0%, 90%, 100% { clip-path: none; transform: translate(-50%, -50%); color: var(--text); }
          91%  { clip-path: inset(20% 0 55% 0); transform: translate(calc(-50% - 3px), -50%); color: var(--cyan); }
          92%  { clip-path: inset(55% 0 20% 0); transform: translate(calc(-50% + 3px), -50%); color: var(--text); }
          93%  { clip-path: none; transform: translate(-50%, -50%); }
        }

        /* Sonar ping dots */
        .nf-ping {
          position: absolute;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 8px var(--cyan), 0 0 16px rgba(0,212,255,0.4);
        }
        .nf-ping::after {
          content: '';
          position: absolute; inset: -6px;
          border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.35);
          animation: ping-ripple 2.5s ease-out infinite;
        }
        @keyframes ping-ripple {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        /* Place pings off-center to feel organic */
        .nf-ping--a { top: 22%; left: 62%; animation-delay: 0.4s; }
        .nf-ping--b { top: 64%; left: 30%; width: 5px; height: 5px; animation-delay: 1.3s; }

        /* Green dot — "found" signal */
        .nf-ping--c {
          top: 38%; left: 70%;
          width: 5px; height: 5px;
          background: var(--green);
          box-shadow: 0 0 8px var(--green);
        }
        .nf-ping--c::after { border-color: rgba(15,186,126,0.35); }

        /* ── Text block ── */
        .nf-body {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 480px;
          padding: 0 1.5rem;
        }

        .nf-label {
          display: inline-flex; align-items: center; gap: 0.5rem;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--cyan);
          margin-bottom: 1.1rem;
        }
        .nf-label-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--cyan); box-shadow: 0 0 6px var(--cyan);
          animation: dot-pulse 2s ease-in-out infinite;
        }
        @keyframes dot-pulse {
          0%,100% { opacity:1; box-shadow: 0 0 6px var(--cyan); }
          50%      { opacity:0.3; box-shadow: 0 0 2px var(--cyan); }
        }

        .nf-headline {
          font-size: clamp(1.8rem, 4vw, 2.4rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin: 0 0 0.9rem;
          color: var(--text);
        }
        .nf-headline em { font-style: normal; color: var(--cyan); }

        .nf-desc {
          font-size: 1rem;
          color: var(--muted);
          line-height: 1.8;
          margin: 0 0 2.25rem;
        }

        .nf-actions {
          display: flex; gap: 0.75rem;
          justify-content: center; flex-wrap: wrap;
        }

        /* ── Buttons (matching site style) ── */
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 0.45rem; border-radius: 999px; border: 0;
          cursor: pointer; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 0.95rem;
          padding: 0.8rem 1.7rem;
          transition: all 0.22s ease;
          white-space: nowrap;
        }
        .btn-primary {
          background: var(--cyan); color: #04111e;
        }
        .btn-primary:hover {
          background: #26daff;
          box-shadow: 0 0 0 7px rgba(0,212,255,0.14);
          transform: translateY(-1px);
        }
        .btn-ghost {
          background: rgba(255,255,255,0.04);
          color: var(--text2);
          border: 1px solid #1d2d42;
        }
        .btn-ghost:hover {
          border-color: rgba(0,212,255,0.28);
          color: var(--cyan);
          background: rgba(0,212,255,0.05);
        }

        /* ── Ticker strip at bottom — feels trading-y ── */
        .nf-ticker {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          border-top: 1px solid var(--border);
          padding: 0.65rem 0;
          overflow: hidden;
          pointer-events: none;
        }
        .nf-ticker-track {
          display: flex; gap: 3rem;
          white-space: nowrap;
          animation: ticker-scroll 18s linear infinite;
          width: max-content;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .nf-ticker-item {
          display: flex; align-items: center; gap: 0.45rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.72rem; color: var(--muted);
          opacity: 0.55;
        }
        .nf-ticker-item--red  .nf-tick-val { color: #f87171; }
        .nf-ticker-item--green .nf-tick-val { color: var(--green); }

        .nf-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          position: relative;
          z-index: 1;
          padding: 2rem 0 5rem;
        }
      `}</style>

      <div className="nf">
        <div className="nf-bg" />
        <div className="nf-dots" />

        <div className="nf-wrap">
          {/* Sonar */}
          <div className="nf-sonar">
            <div className="nf-ring nf-ring--1" />
            <div className="nf-ring nf-ring--2" />
            <div className="nf-ring nf-ring--3" />
            <div className="nf-cross" />
            <div className="nf-sweep" />

            {/* Ping dots */}
            <div className="nf-ping nf-ping--a" />
            <div className="nf-ping nf-ping--b" />
            <div className="nf-ping nf-ping--c" />

            {/* 404 */}
            <div className="nf-404">404</div>
          </div>

          {/* Text */}
          <div className="nf-body">
            <div className="nf-label">
              <span className="nf-label-dot" />
              Signal lost
            </div>

            <h1 className="nf-headline">
              This page drifted<br /><em>off the chart.</em>
            </h1>

            <p className="nf-desc">
              Our scanners swept the entire market — no signal found.
              The page you're looking for doesn't exist or was moved.
            </p>

            <div className="nf-actions">
              <a className="btn btn-primary" href="/">
                <Home size={15} /> Back to Home
              </a>
              <a className="btn btn-ghost" href="/dashboard">
                Open Screener <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* Ticker strip */}
        <div className="nf-ticker">
          <div className="nf-ticker-track">
            {/* duplicated for seamless loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '3rem' }}>
                {[
                  { sym: 'EURUSD', val: '404.00', dir: 'red' },
                  { sym: 'XAUUSD', val: '404.04', dir: 'red' },
                  { sym: 'BTCUSD', val: '404.00', dir: 'green' },
                  { sym: 'GBPJPY', val: '404.02', dir: 'red' },
                  { sym: 'NASDAQ', val: '404.01', dir: 'green' },
                  { sym: 'ORCABOT', val: 'SEARCHING', dir: 'green' },
                  { sym: 'SPX500', val: '404.03', dir: 'red' },
                  { sym: 'ETHBTC', val: '404.00', dir: 'green' },
                ].map(t => (
                  <div key={t.sym} className={`nf-ticker-item nf-ticker-item--${t.dir}`}>
                    <span>{t.sym}</span>
                    <span className="nf-tick-val">{t.val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
