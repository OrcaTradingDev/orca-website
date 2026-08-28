import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OrcaTrading · Multi-timeframe screener, trading technology and the framework underneath',
  description: 'A screener that reads every timeframe on one row, a journal that grades the decision, a free academy, and a room full of people doing all of it out loud together.',
  keywords: 'trading screener, multi-timeframe analysis, OTOS, trading journal, forex screener, crypto screener, machine learning forecast',
  authors: [{ name: 'OrcaTrading' }],
  openGraph: {
    title: 'OrcaTrading · One way of reading the market',
    description: 'A free screener with ML forecasting, a free academy, and The Pod. All running on one framework.',
    type: 'website',
    locale: 'en_US',
  },
  robots: { index: true, follow: true },
}

const DISCORD_URL    = process.env.NEXT_PUBLIC_DISCORD_URI   ?? '#'
const CLIENT_HUB_URL = process.env.NEXT_PUBLIC_CLIENT_HUB_URI ?? DISCORD_URL

export default function Page() {
  const faq = [
    ['I am a complete beginner. Is this for me?',
     'Yes, and the Academy is built on that assumption. It starts at what a market is and what makes price move, rather than at setups, so nothing earlier is treated as obvious. The free screener gives you something to apply it to the same day, and no question in the Discord is treated as too basic to ask.'],
    ['I have traded for years. Is there anything here for me?',
     'The screener is the part most experienced traders use first: a read across five timeframes on 36 instruments without opening six charts. The Pod is the other half, because a room that argues back is harder to find than another course.'],
    ['Does the free Academy cover everything?',
     'No, and it does not pretend to. It covers the foundations: what markets are, how price moves, what liquidity and risk actually mean. The depth is in The Pod Library.'],
    ['Is the Academy really free, or is it a lead magnet?',
     'It is free, and it stays free. You can finish all of it and use the free screener tier without paying for anything. The Pod is the paid step, and it exists because a room of people reviewing each other is a different product from a course.'],
    ['Is the screener still in beta?',
     'No. There is a free version live right now that you can use today, and it gets new features regularly. The ML forecast and the forward state model are recent additions.'],
    ['What makes the Journal different from any other trading journal?',
     'Most journals record what happened to your money. This one records how the decision was made, stage by stage, and grades it A+ to D on that basis. It logs a no trade as a real outcome rather than an empty day, and because every entry carries the screener context it was taken in, the analytics can show you which market conditions you genuinely handle well.'],
    ['Do I need to connect a broker to use the screener?',
     'No. The screener is read only. Nothing touches an account and no capital is involved.'],
    ['What does the ML forecast actually show?',
     'It does not predict a price. It draws a fan of possible paths with percentile bands, which is a way of showing how wide the range of outcomes currently is. A narrow fan and a wide fan mean very different things about risk.'],
    ['What happens when the system is wrong?',
     'It will be. Every position is sized on the assumption that any single trade fails, and the invalidation level is set before entry rather than after. What the system will not do is take a setup that failed a check because the last one lost.'],
    ['Can I cancel The Pod?',
     'Yes. Cancel any time and your access runs until the end of the billing period.'],
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        .lp {
          --bg:      #070B0F;
          --bg-alt:  #090F14;
          --bg-deep: #05080B;
          --surface:   #0E161D;
          --surface-2: #0B1218;
          --line:   #16212A;
          --line-2: #1E2E38;
          --line-3: #2A3A44;

          --text:   #E8EFF3;
          --text-2: #93A5B0;
          --text-3: #7D8E99;
          --text-4: #7A8A93;

          --cyan:      #3ECFF0;
          --cyan-dim:  #6FD8E8;
          --cyan-deep: #06202B;
          --cyan-line: #1B4A5C;
          --cyan-bg:   #0B1F28;

          --teal:      #35D6A4;
          --teal-dim:  #62DFB8;
          --teal-deep: #071510;
          --teal-line: #1D4A3C;
          --teal-bg:   #0C1F1A;

          --amber:      #E0A73C;
          --amber-line: #4A3B1B;
          --amber-bg:   #201A0C;

          --violet:      #8B7CF0;
          --violet-line: #3A3270;
          --violet-bg:   #15122B;

          --discord: #5865F2;

          --f-display: "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif;
          --f-body:    "Inter",  system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

          --gut:  clamp(20px, 5vw, 120px);
          --maxw: 1200px;
          --sec-y: clamp(48px, 6vw, 76px);

          background: var(--bg);
          color: var(--text);
          font-family: var(--f-body);
          font-size: 16px;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        .lp *, .lp *::before, .lp *::after { box-sizing: border-box; }
        .lp h1,.lp h2,.lp h3,.lp h4 { font-family: var(--f-display); margin: 0; line-height: 1.08; letter-spacing: -0.03em; text-wrap: balance; }
        .lp p  { margin: 0; }
        .lp img { max-width: 100%; height: auto; display: block; }
        .lp a  { color: var(--cyan); text-decoration: none; }
        .lp a:hover { color: #8CE6FA; }
        .lp ul { margin: 0; padding: 0; list-style: none; }

        .lp .wrap  { max-width: var(--maxw); margin: 0 auto; }
        .lp .sec   { padding: var(--sec-y) var(--gut); }
        .lp .band  { background: var(--bg-alt); border-block: 1px solid var(--line); }
        .lp .eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--cyan); font-family: var(--f-body); }
        .lp .lede    { font-size: clamp(15.5px, 1.7vw, 17px); line-height: 1.63; color: var(--text-2); }
        .lp .stack-40 { display: flex; flex-direction: column; gap: 36px; }
        .lp .stack-32 { display: flex; flex-direction: column; gap: 32px; }
        .lp .stack-24 { display: flex; flex-direction: column; gap: 24px; }

        /* Buttons */
        .lp .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: var(--f-display); font-weight: 600; font-size: 15.5px;
          min-height: 52px; padding: 0 26px; border-radius: 999px;
          border: 1px solid transparent; cursor: pointer; text-align: center;
          transition: background .18s, border-color .18s, transform .18s, color .18s;
          text-decoration: none;
        }
        .lp .btn-primary  { background: var(--cyan); color: var(--cyan-deep); }
        .lp .btn-primary:hover  { background: #68DCF6; color: var(--cyan-deep); transform: translateY(-1px); }
        .lp .btn-ghost    { background: transparent; color: #C9D6DD; border-color: var(--line-3); }
        .lp .btn-ghost:hover    { border-color: #3D5563; color: var(--text); }
        .lp .btn-discord  { background: var(--discord); color: #fff; }
        .lp .btn-discord:hover  { background: #6C77F4; transform: translateY(-1px); }
        .lp .btn-free     { background: var(--teal-bg); color: var(--teal-dim); border-color: var(--teal-line); }
        .lp .btn-free:hover     { background: #0f2820; border-color: var(--teal); }
        .lp .btn-sm { min-height: 44px; font-size: 14.5px; padding: 0 20px; }

        /* Hero */
        .lp .hero { padding: clamp(40px,6vw,80px) var(--gut) clamp(44px,5vw,68px); background: radial-gradient(900px 420px at 18% 26%, #0D2733 0%, var(--bg) 72%); }
        .lp .hero-in { display: grid; grid-template-columns: minmax(0,.92fr) minmax(0,1.08fr); gap: clamp(32px,4vw,56px); align-items: center; max-width: var(--maxw); margin: 0 auto; }
        .lp .hero-copy { display: flex; flex-direction: column; gap: 22px; }
        .lp .hero h1 { font-size: clamp(33px,4vw,50px); font-weight: 700; letter-spacing: -0.035em; }
        .lp .hero h1 em { font-style: normal; color: var(--cyan); }

        .lp .badge { display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; border: 1px solid var(--teal-line); background: var(--teal-bg); border-radius: 999px; padding: 6px 14px; }
        .lp .badge span { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: var(--teal-dim); }
        .lp .dot { width: 6px; height: 6px; border-radius: 999px; background: var(--teal); flex-shrink: 0; animation: lp-pulse 2.4s ease-in-out infinite; }
        @keyframes lp-pulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }

        .lp .hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
        .lp .hero-sub  { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
        .lp .hero-sub-note { font-size: 13px; color: var(--text-3); }
        .lp .underlink { font-size: 13.5px; color: var(--text-2); border-bottom: 1px solid var(--line-3); padding-bottom: 1px; }
        .lp .underlink:hover { color: var(--text); border-bottom-color: var(--text-3); }

        .lp .frame { border: 1px solid var(--line-2); border-radius: 12px; overflow: hidden; background: var(--surface-2); box-shadow: 0 28px 70px rgba(0,0,0,.6); }
        .lp .frame-bar { display: flex; align-items: center; gap: 7px; padding: 11px 14px; border-bottom: 1px solid #16232C; background: var(--surface); }
        .lp .frame-bar i { width: 9px; height: 9px; border-radius: 999px; background: var(--line-3); display: block; }
        .lp .frame-bar span { font-size: 11px; color: #7C8E99; margin-left: 10px; }
        .lp .frame-cap { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 12px 4px 0; font-size: 12.5px; color: var(--text-3); }
        .lp .frame-cap b { color: var(--teal); font-weight: 500; }
        @media (max-width: 1080px) { .lp .hero-in { grid-template-columns: 1fr; gap: 36px; } .lp .hero-copy { max-width: 640px; } }

        /* Proof */
        .lp .proof { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 1px; background: var(--line); border-block: 1px solid var(--line); }
        .lp .proof div { background: var(--bg-alt); padding: 26px clamp(20px,3vw,40px); display: flex; flex-direction: column; gap: 5px; }
        .lp .proof b { font-family: var(--f-display); font-size: clamp(23px,2.8vw,29px); font-weight: 700; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
        .lp .proof span { font-size: 13px; color: #8A9BA6; line-height: 1.45; }
        @media (max-width: 820px) { .lp .proof { grid-template-columns: 1fr 1fr; } }

        /* Free strip */
        .lp .free-strip { background: var(--teal-deep); border-bottom: 1px solid #0f2a20; padding: clamp(36px,5vw,60px) var(--gut); }
        .lp .free-strip-in { max-width: var(--maxw); margin: 0 auto; display: grid; grid-template-columns: 210px 1fr; gap: clamp(36px,5vw,72px); align-items: start; }
        .lp .free-left { display: flex; flex-direction: column; gap: 10px; padding-top: 6px; }
        .lp .free-big { font-family: var(--f-display); font-size: clamp(40px,5vw,60px); font-weight: 800; letter-spacing: -0.045em; color: var(--teal); line-height: 1; }
        .lp .free-sub { font-size: 13px; color: #4A8070; line-height: 1.55; max-width: 180px; }
        .lp .free-items { display: flex; flex-direction: column; border-left: 1px solid #1A4035; }
        .lp .free-item { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: center; padding: 22px 0 22px 30px; border-bottom: 1px solid #122E24; }
        .lp .free-item:last-child { border-bottom: none; }
        .lp .free-item-copy { display: flex; flex-direction: column; gap: 5px; }
        .lp .free-item-copy b { font-family: var(--f-display); font-size: 18px; font-weight: 600; letter-spacing: -0.02em; color: var(--text); }
        .lp .free-item-copy p { font-size: 14px; line-height: 1.52; color: #507A6A; }
        .lp .free-item-copy p strong { color: #89C4B0; font-weight: 500; }
        @media (max-width: 760px) {
          .lp .free-strip-in { grid-template-columns: 1fr; gap: 28px; }
          .lp .free-items { border-left: none; border-top: 1px solid #1A4035; }
          .lp .free-item { padding-left: 0; grid-template-columns: 1fr; gap: 14px; }
        }

        /* Head */
        .lp .head { display: flex; flex-direction: column; gap: 14px; max-width: 720px; }
        .lp .head h2 { font-size: clamp(28px,4vw,42px); font-weight: 700; }
        .lp .head h2.sm { font-size: clamp(26px,3.4vw,34px); }

        /* Cards */
        .lp .cards { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; }
        @media (max-width: 1080px) { .lp .cards { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 620px)  { .lp .cards { grid-template-columns: 1fr; } }

        .lp .card { background: var(--surface); border: 1px solid var(--line-2); border-top: 2px solid var(--line-3); border-radius: 10px; padding: 24px 22px 22px; display: flex; flex-direction: column; gap: 12px; transition: border-color .2s, transform .2s; }
        .lp .card:hover { transform: translateY(-2px); border-color: #2A414D; }
        .lp .card.free-c  { border-top-color: var(--teal); }
        .lp .card.free-c:hover { border-top-color: var(--teal-dim); }
        .lp .card.paid-c  { border-top-color: var(--violet); }
        .lp .card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .lp .card h3  { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .lp .card p   { font-size: 14.5px; line-height: 1.58; color: #8A9BA6; }
        .lp .card .go { font-size: 13.5px; color: var(--cyan); margin-top: auto; padding-top: 6px; }
        .lp .card.free-c .go { color: var(--teal); }
        .lp .card.paid-c .go { color: var(--violet); }

        .lp .tag { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 4px; border: 1px solid; white-space: nowrap; }
        .lp .tag-live   { color: var(--cyan-dim);  border-color: var(--cyan-line);   background: var(--cyan-bg); }
        .lp .tag-member { color: var(--violet);    border-color: var(--violet-line);  background: var(--violet-bg); }
        .lp .tag-free   { font-size: 11.5px; font-weight: 800; letter-spacing: 0.05em; padding: 5px 10px; border-radius: 5px; color: var(--teal); border: 1.5px solid var(--teal-line); background: var(--teal-bg); white-space: nowrap; box-shadow: 0 0 10px rgba(53,214,164,0.14); }

        /* Loop */
        .lp .loop { border: 1px solid #1A2831; border-radius: 12px; background: linear-gradient(180deg,#0A1218 0%,#080D12 100%); padding: 30px clamp(20px,3vw,40px) 26px; display: flex; flex-direction: column; gap: 18px; }
        .lp .loop-row { display: flex; align-items: center; gap: 0; flex-wrap: wrap; }
        .lp .loop-step { flex: 1 1 130px; display: flex; flex-direction: column; gap: 4px; }
        .lp .loop-step b { font-family: var(--f-display); font-size: 15.5px; font-weight: 600; }
        .lp .loop-step span { font-size: 12.5px; color: #8A9BA6; }
        .lp .loop-arrow { flex: 0 0 46px; color: var(--line-3); }
        .lp .loop-back { display: flex; align-items: center; gap: 12px; border-top: 1px dashed #1F3D49; padding-top: 14px; }
        .lp .loop-back span { font-size: 12.5px; color: #7F9BA6; }
        @media (max-width: 720px) { .lp .loop-arrow { display: none; } .lp .loop-row { gap: 16px; } .lp .loop-step { flex: 1 1 44%; } }

        /* Screener */
        .lp .screener-top { display: grid; grid-template-columns: 520px minmax(0,1fr); gap: 56px; align-items: end; }
        @media (max-width: 1080px) { .lp .screener-top { grid-template-columns: 1fr; gap: 28px; align-items: start; } }
        .lp .callouts { display: flex; flex-direction: column; gap: 16px; }
        .lp .callout { font-size: 14.5px; line-height: 1.58; color: #8A9BA6; }
        .lp .callout b { color: var(--text); font-weight: 500; }

        .lp .shots { display: grid; grid-template-columns: 1fr; gap: 18px; }
        .lp .shot { border: 1px solid var(--line-2); border-radius: 10px; overflow: hidden; background: var(--surface-2); margin: 0; }
        .lp .shot figcaption { padding: 13px 18px; border-top: 1px solid #16232C; font-size: 13px; color: #8A9BA6; }

        .lp .shipping { display: flex; align-items: flex-start; gap: 14px; border: 1px solid var(--teal-line); background: var(--teal-bg); border-radius: 10px; padding: 18px 22px; }
        .lp .shipping svg { flex-shrink: 0; margin-top: 2px; }
        .lp .shipping p { font-size: 14.5px; line-height: 1.58; color: #B6D8CC; }
        .lp .shipping b { color: var(--text); font-weight: 500; }

        .lp .jrn-two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 940px) { .lp .jrn-two { grid-template-columns: 1fr; } }

        /* Journal */
        .lp .jrn-top { display: grid; grid-template-columns: 520px minmax(0,1fr); gap: 56px; align-items: end; }
        @media (max-width: 1080px) { .lp .jrn-top { grid-template-columns: 1fr; gap: 28px; align-items: start; } }

        .lp .funnel { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 10px; }
        @media (max-width: 940px) { .lp .funnel { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .lp .funnel { grid-template-columns: 1fr; } }
        .lp .stage { background: var(--surface); border: 1px solid var(--line-2); border-radius: 8px; padding: 14px 15px 15px; display: flex; flex-direction: column; gap: 5px; }
        .lp .stage i { font-style: normal; font-family: var(--f-body); font-size: 10px; font-weight: 600; letter-spacing: 0.11em; color: var(--cyan); }
        .lp .stage b { font-family: var(--f-display); font-size: 14.5px; font-weight: 600; letter-spacing: -0.01em; }
        .lp .stage span { font-size: 12.5px; line-height: 1.45; color: #8A9BA6; }

        .lp .jpoints { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 820px) { .lp .jpoints { grid-template-columns: 1fr; } }
        .lp .jpoint { display: flex; gap: 13px; align-items: flex-start; }
        .lp .jpoint svg { flex-shrink: 0; margin-top: 2px; color: var(--cyan); }
        .lp .jpoint div { display: flex; flex-direction: column; gap: 4px; }
        .lp .jpoint b { font-family: var(--f-display); font-size: 16px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .jpoint p { font-size: 14.5px; line-height: 1.55; color: #8A9BA6; }

        .lp .quoteline { border-left: 2px solid var(--cyan); background: var(--surface-2); border-radius: 0 8px 8px 0; padding: 16px 20px; display: flex; flex-direction: column; gap: 6px; }
        .lp .quoteline b { font-family: var(--f-display); font-size: 16.5px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .quoteline span { font-size: 14px; line-height: 1.55; color: #8A9BA6; }

        /* Academy */
        .lp .acad { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 56px; align-items: start; }
        @media (max-width: 940px) { .lp .acad { grid-template-columns: 1fr; gap: 32px; } }

        .lp .chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .lp .chip { font-family: var(--f-display); font-size: 13.5px; font-weight: 500; color: #C4D3DA; background: var(--surface); border: 1px solid var(--line-2); border-radius: 999px; padding: 8px 15px; }
        .lp .chip.k { color: var(--cyan-dim); border-color: var(--cyan-line); background: var(--cyan-bg); }

        .lp .acad-list { display: flex; flex-direction: column; gap: 14px; }
        .lp .acad-item { display: flex; gap: 14px; align-items: flex-start; border-top: 1px solid #1C2830; padding-top: 14px; }
        .lp .acad-item:first-child { border-top: 0; padding-top: 0; }
        .lp .acad-item svg { flex-shrink: 0; margin-top: 2px; }
        .lp .acad-item div { display: flex; flex-direction: column; gap: 4px; }
        .lp .acad-item b { font-family: var(--f-display); font-size: 16px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .acad-item p { font-size: 14.5px; line-height: 1.55; color: #8A9BA6; }

        .lp .qlist { display: flex; flex-direction: column; gap: 10px; }
        .lp .qlist li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; line-height: 1.55; color: #A6B6C0; }
        .lp .qlist li svg { flex-shrink: 0; margin-top: 3px; color: var(--cyan); }

        .lp .ladder { border: 1px solid var(--line-2); border-radius: 12px; background: linear-gradient(180deg,#0C141A 0%,#0A1015 100%); padding: 28px clamp(20px,3vw,34px); display: flex; flex-direction: column; gap: 22px; }
        .lp .ladder h3 { font-size: 21px; font-weight: 600; letter-spacing: -0.02em; }
        .lp .ladder > p { font-size: 15.5px; line-height: 1.6; color: #93A5B0; max-width: 74ch; }
        .lp .rungs { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
        @media (max-width: 820px) { .lp .rungs { grid-template-columns: 1fr; } }
        .lp .rung { background: var(--surface); border: 1px solid var(--line-2); border-left: 2px solid var(--cyan); border-radius: 8px; padding: 16px 18px; display: flex; flex-direction: column; gap: 5px; }
        .lp .rung.paid { border-left-color: var(--violet); }
        .lp .rung b { font-family: var(--f-display); font-size: 15.5px; font-weight: 600; }
        .lp .rung span { font-size: 13.5px; line-height: 1.5; color: #8A9BA6; }
        .lp .rung .cost { font-family: var(--f-body); font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--teal); }
        .lp .rung.paid .cost { color: var(--violet); }

        /* Who */
        .lp .forwho { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 24px; }
        @media (max-width: 940px) { .lp .forwho { grid-template-columns: 1fr; } }
        .lp .who { background: var(--surface); border: 1px solid var(--line-2); border-radius: 10px; padding: 26px 26px 28px; display: flex; flex-direction: column; gap: 11px; }
        .lp .who .lbl { font-family: var(--f-display); font-size: 12px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--cyan); }
        .lp .who h3 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .lp .who p { font-size: 15px; line-height: 1.58; color: #8A9BA6; }
        .lp .who.adv .lbl { color: var(--violet); }
        .lp .together { display: flex; align-items: flex-start; gap: 14px; border: 1px solid var(--line-2); background: var(--surface-2); border-radius: 10px; padding: 18px 22px; }
        .lp .together svg { flex-shrink: 0; margin-top: 2px; color: var(--cyan); }
        .lp .together p { font-size: 15px; line-height: 1.58; color: #A6B6C0; }
        .lp .together b { color: var(--text); font-weight: 500; }

        /* Pod */
        .lp .pod-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
        @media (max-width: 940px) { .lp .pod-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 620px) { .lp .pod-grid { grid-template-columns: 1fr; } }
        .lp .pod { background: var(--surface); border: 1px solid var(--line-2); border-radius: 10px; padding: 22px 20px; display: flex; flex-direction: column; gap: 9px; }
        .lp .pod-h { display: flex; align-items: center; gap: 10px; }
        .lp .pod-h svg { flex-shrink: 0; color: var(--violet); }
        .lp .pod h3 { font-size: 16.5px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .pod p { font-size: 14px; line-height: 1.55; color: #8A9BA6; }

        .lp .library { grid-column: 1/-1; background: var(--surface-2); border: 1px solid var(--violet-line); border-radius: 10px; padding: 24px clamp(20px,3vw,28px); display: flex; flex-direction: column; gap: 16px; }
        .lp .lib-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .lp .lib-head svg { color: var(--violet); flex-shrink: 0; }
        .lp .lib-head h3 { font-size: 17px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .lib-head span { font-size: 14px; color: #8A9BA6; }
        .lp .lib-grid { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); gap: 12px; }
        @media (max-width: 940px) { .lp .lib-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 520px) { .lp .lib-grid { grid-template-columns: 1fr; } }
        .lp .lib { background: var(--surface); border: 1px solid var(--line-2); border-radius: 8px; padding: 16px 16px 18px; display: flex; flex-direction: column; gap: 6px; }
        .lp .lib b { font-family: var(--f-display); font-size: 15px; font-weight: 600; letter-spacing: -0.015em; }
        .lp .lib span { font-size: 13.5px; line-height: 1.5; color: #8A9BA6; }
        .lp .pod-cta { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }

        /* Trial badge */
        .lp .trial-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,#1B4A5C,#1D4A3C); border: 1px solid #2A6A58; border-radius: 999px; padding: 7px 16px; align-self: flex-start; }
        .lp .trial-badge span { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: var(--teal-dim); }
        .lp .trial-callout { display: flex; align-items: center; gap: 14px; background: linear-gradient(135deg,var(--teal-deep),#0A1A14); border: 1px solid var(--teal-line); border-radius: 12px; padding: 18px 22px; }
        .lp .trial-callout svg { flex-shrink: 0; color: var(--teal); }
        .lp .trial-callout p { font-size: 15px; line-height: 1.55; color: #B6D8CC; }
        .lp .trial-callout b { color: var(--teal-dim); font-weight: 600; }
        .lp .btn-trial { background: linear-gradient(135deg,var(--teal),#2CC494); color: #041A13; font-weight: 700; border: none; box-shadow: 0 0 28px rgba(53,214,164,0.35); }
        .lp .btn-trial:hover { background: linear-gradient(135deg,#58E8C0,#35D6A4); transform: translateY(-2px); box-shadow: 0 0 38px rgba(53,214,164,0.5); color: #041A13; }

        /* Pricing */
        .lp .plans { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
        @media (max-width: 940px) { .lp .plans { grid-template-columns: 1fr; } }
        .lp .plan { background: var(--surface); border: 1px solid var(--line-2); border-radius: 12px; padding: 28px 28px 30px; display: flex; flex-direction: column; gap: 14px; }
        .lp .plan.hi { background: linear-gradient(160deg,#13102A 0%,#0E0C1E 100%); border-color: var(--violet-line); box-shadow: 0 0 0 1px #3A3270, 0 20px 60px rgba(139,124,240,0.15); position: relative; overflow: hidden; }
        .lp .plan.hi::before { content: ""; position: absolute; inset: 0; background: radial-gradient(500px 240px at 50% -40px,rgba(139,124,240,0.12) 0%,transparent 70%); pointer-events: none; }
        .lp .plan.hi::after { content: "BEST VALUE"; position: absolute; top: 16px; right: -28px; background: var(--violet); color: #fff; font-size: 9px; font-weight: 800; letter-spacing: 0.14em; padding: 5px 36px; transform: rotate(45deg); }
        .lp .plan h3 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
        .lp .plan .fig { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
        .lp .plan .fig b { font-family: var(--f-display); font-size: 36px; font-weight: 700; letter-spacing: -0.03em; }
        .lp .plan .fig span { font-size: 14px; color: #8A9BA6; }
        .lp .plan .trial-line { font-size: 13px; color: var(--teal-dim); font-weight: 600; background: var(--teal-bg); border: 1px solid var(--teal-line); border-radius: 6px; padding: 7px 12px; display: flex; align-items: center; gap: 8px; }
        .lp .plan p { font-size: 14.5px; line-height: 1.58; color: #8A9BA6; }
        .lp .plan ul { display: flex; flex-direction: column; gap: 8px; }
        .lp .plan li { display: flex; gap: 10px; align-items: flex-start; font-size: 14px; line-height: 1.5; color: #A6B6C0; }
        .lp .plan li::before { content: ""; width: 5px; height: 5px; border-radius: 999px; background: var(--cyan); margin-top: 8px; flex-shrink: 0; }
        .lp .plan.hi li::before { background: var(--violet); }
        .lp .plan .btn { margin-top: auto; }
        .lp .btn-pod { background: linear-gradient(135deg,#7B6AE0,#9B8CF8); color: #fff; box-shadow: 0 0 24px rgba(139,124,240,0.4); border: none; font-weight: 700; }
        .lp .btn-pod:hover { background: linear-gradient(135deg,#8B7CF0,#B0A0FF); transform: translateY(-2px); box-shadow: 0 0 36px rgba(139,124,240,0.55); color: #fff; }
        .lp .plan-foot { font-size: 13.5px; line-height: 1.6; color: var(--text-3); }

        /* FAQ */
        .lp .faq-layout { display: grid; grid-template-columns: 340px minmax(0,1fr); gap: 70px; }
        @media (max-width: 1080px) { .lp .faq-layout { grid-template-columns: 1fr; gap: 32px; } }
        .lp details { border-top: 1px solid #1C2830; }
        .lp details:last-child { border-bottom: 1px solid #1C2830; }
        .lp details summary { list-style: none; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 0; font-family: var(--f-display); font-size: 17px; font-weight: 600; letter-spacing: -0.015em; color: var(--text); min-height: 56px; user-select: none; }
        .lp details summary::-webkit-details-marker { display: none; }
        .lp details summary::after { content: "+"; flex-shrink: 0; font-size: 20px; font-weight: 300; color: var(--text-3); line-height: 1; }
        .lp details[open] summary::after { content: "×"; }
        .lp .faq-ans { padding: 0 0 20px; font-size: 14.5px; line-height: 1.62; color: #8A9BA6; max-width: 68ch; }

        /* Closing */
        .lp .closing { background: radial-gradient(760px 300px at 50% 0%,#0D2733 0%,var(--bg) 70%); border-top: 1px solid var(--line); display: flex; flex-direction: column; align-items: center; gap: 20px; text-align: center; }
        .lp .closing h2 { font-size: clamp(30px,4.6vw,44px); font-weight: 700; letter-spacing: -0.035em; }
        .lp .closing .lede { max-width: 560px; }
        .lp .closing-ctas { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

        /* Footer */
        .lp .foot { background: var(--bg-deep); border-top: 1px solid var(--line); padding: 52px var(--gut) 36px; }
        .lp .foot-in { max-width: var(--maxw); margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
        .lp .foot-cols { display: grid; grid-template-columns: 300px repeat(3,minmax(0,1fr)); gap: 40px; }
        @media (max-width: 820px) { .lp .foot-cols { grid-template-columns: 1fr 1fr; gap: 28px; } }
        .lp .foot-brand p { font-size: 13.5px; line-height: 1.6; color: var(--text-3); margin-top: 10px; }
        .lp .foot-col h4 { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; color: var(--text-4); margin-bottom: 12px; font-family: var(--f-body); }
        .lp .foot-col ul { display: flex; flex-direction: column; gap: 9px; }
        .lp .foot-col a { font-size: 13.5px; color: #8A9BA6; }
        .lp .foot-col a:hover { color: var(--text); }
        .lp .risk { font-size: 12.5px; line-height: 1.7; color: #808F98; border-top: 1px solid #131C23; padding-top: 20px; }
        .lp .foot-base { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 12px; color: var(--text-4); }

        .lp .mark { font-family: var(--f-display); font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--text); white-space: nowrap; }
        .lp .mark .accent { color: var(--cyan); }
      `}</style>

      <div className="lp">

        {/* HERO */}
        <section className="hero">
          <div className="hero-in">
            <div className="hero-copy">
              <div className="badge">
                <span className="dot" />
                <span>Screener live · 7-day free trial</span>
              </div>

              <h1>One way of reading the market.<br /><em>Four ways to use it.</em></h1>

              <p className="lede" style={{ maxWidth: 510 }}>
                There&apos;s a screener that reads every timeframe on one row so you stop switching charts. A journal that scores how the decision was made, not what it cost you. An academy that starts at what a market actually is — free, no card. And a Discord where all of it gets argued about, also free. Nothing here contradicts itself because everything runs on the same rules.
              </p>

              <div className="hero-ctas">
                <a className="btn btn-trial" href="/screener">Try the screener free — 7 days</a>
                <a className="btn btn-discord" href={CLIENT_HUB_URL} target="_blank" rel="noopener noreferrer">Join the Discord</a>
              </div>

              <div className="hero-sub">
                <span className="hero-sub-note">No card needed to start.</span>
                <a className="underlink" href="/academy">Or start with the free Academy →</a>
              </div>
            </div>

            <div>
              <div className="frame">
                <div className="frame-bar"><i /><i /><i /><span>tradewithorca.com/screener</span></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/screener.jpg" width={1700} height={993} alt="The OrcaTrading screener: one row per instrument showing bias on each timeframe, an alignment score out of four, an Orca status, a score out of 100, and a forward state of improving, stable or deteriorating." />
              </div>
              <p className="frame-cap">Live screener. <b>One row per instrument, five timeframes, and a status that is usually off.</b></p>
            </div>
          </div>
        </section>

        {/* PROOF */}
        <section className="proof" aria-label="At a glance">
          <div><b style={{ color: 'var(--teal)' }}>Free</b><span>Screener free tier, full Academy, and Discord — live right now, no card</span></div>
          <div><b>36</b><span>instruments across forex, crypto, stocks and indices</span></div>
          <div><b>5</b><span>timeframes on every one — 30M, 1H, 4H, 1D, 1W</span></div>
          <div><b style={{ color: 'var(--cyan)' }}>ML</b><span>forecasting built in: price fan, expansion, forward state</span></div>
        </section>

        {/* FREE STRIP */}
        <section className="free-strip" aria-label="What is free">
          <div className="free-strip-in">
            <div className="free-left">
              <span className="free-big">Free.<br />Right<br />now.</span>
              <span className="free-sub">No card. No trial that ends. Nothing that becomes paid midway through.</span>
            </div>
            <div className="free-items">
              <div className="free-item">
                <div className="free-item-copy">
                  <b>Screener — free tier</b>
                  <p>Read <strong>36 instruments across five timeframes.</strong> Bias bars, alignment score, Orca status. Open it in under a minute, no account needed to look around.</p>
                </div>
                <a className="btn btn-free btn-sm" href="/screener">Open it →</a>
              </div>
              <div className="free-item">
                <div className="free-item-copy">
                  <b>The Academy</b>
                  <p>Starts at what a market actually is, not at setups. <strong>No prior knowledge assumed,</strong> no cost anywhere in it, no upsell wall halfway through.</p>
                </div>
                <a className="btn btn-free btn-sm" href="/academy">Start here →</a>
              </div>
              <div className="free-item">
                <div className="free-item-copy">
                  <b>The Discord</b>
                  <p>Post your charts, ask what you are looking at, read what everyone else is seeing. <strong>Active every day.</strong> Nobody charges you to talk.</p>
                </div>
                <a className="btn btn-discord btn-sm" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Join →</a>
              </div>
            </div>
          </div>
        </section>

        {/* WHO THIS IS FOR */}
        <section className="sec band" id="who">
          <div className="wrap stack-32">
            <div className="head">
              <span className="eyebrow">Who this is for</span>
              <h2 className="sm">Wherever you are in it, this is built to help.</h2>
              <p className="lede">Trading is one of the few things people are expected to learn alone, from strangers selling certainty. That gap is the reason all of this exists. Beginner or ten years in, there is a way in here that fits where you actually are.</p>
            </div>
            <div className="forwho">
              <div className="who">
                <span className="lbl">If you are starting out</span>
                <h3>Start at the actual beginning.</h3>
                <p>You do not need to already know what a timeframe is, or own a strategy, or have an account funded. The Academy starts at what a market is and what makes price move, and it costs nothing. Nobody here will sell you a shortcut, because there is not one.</p>
              </div>
              <div className="who adv">
                <span className="lbl">If you have been at this a while</span>
                <h3>You probably do not need another course.</h3>
                <p>You need a faster read across timeframes so you stop opening six charts, a second opinion that argues back instead of agreeing, and somewhere to work out why a good decision still lost. That is the screener and The Pod.</p>
              </div>
            </div>
            <div className="together">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20"/><circle cx="10" cy="8" r="3.4"/><path d="M20 20v-1.5a3.5 3.5 0 00-2.6-3.4M15.4 4.6a3.4 3.4 0 010 6.6"/></svg>
              <p><b>Both of those people are in the same room, on purpose.</b> Beginners ask the questions experienced traders stopped asking and should not have. Experienced traders answer them and find out what they only half understood. That is most of the value, and it is why the education is open rather than locked away.</p>
            </div>
          </div>
        </section>

        {/* THE SYSTEM */}
        <section className="sec" id="system">
          <div className="wrap stack-40">
            <div className="head">
              <span className="eyebrow">The Orca system</span>
              <h2>Four surfaces. One set of rules underneath.</h2>
              <p className="lede">Every part answers a different question, and all of them read the market the same way. What the screener calls a valid setup is what the journal will grade you against, what the Academy teaches you to spot, and what The Pod will pull apart afterwards.</p>
            </div>
            <div className="cards">
              <article className="card free-c">
                <div className="card-top">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-6 4 4 5-8"/><path d="M3 21h18"/></svg>
                  <span className="tag-free">FREE TIER</span>
                </div>
                <h3>Screener</h3>
                <p>Where you read the market. Bias on every timeframe, alignment scored out of four, and a status that tells you when the conditions are not there.</p>
                <a className="go" href="#screener">See the screener →</a>
              </article>
              <article className="card">
                <div className="card-top">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h7M8 13h7M8 17h4"/></svg>
                  <span className="tag tag-live">LIVE</span>
                </div>
                <h3>Journal</h3>
                <p>Where the decision gets made and then graded. It runs the OTOS funnel stage by stage and scores your process rather than your luck.</p>
                <a className="go" href="#journal">Inside the Journal →</a>
              </article>
              <article className="card free-c">
                <div className="card-top">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#35D6A4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5z"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z"/></svg>
                  <span className="tag-free">FREE</span>
                </div>
                <h3>Academy</h3>
                <p>Where the foundations get taught, free. What a market is, what moves price, what risk means, in the same vocabulary the tools use. No prior knowledge assumed.</p>
                <a className="go" href="#academy">What you learn →</a>
              </article>
              <article className="card paid-c">
                <div className="card-top">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B7CF0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20"/><circle cx="10" cy="8" r="3.4"/><path d="M20 20v-1.5a3.5 3.5 0 00-2.6-3.4M15.4 4.6a3.4 3.4 0 010 6.6"/></svg>
                  <span className="tag tag-member">MEMBERSHIP</span>
                </div>
                <h3>The Pod</h3>
                <p>Where it gets practised with other people. Weekly calls, chart reviews, wins and losses pulled apart honestly, and a library that goes past the Academy.</p>
                <a className="go" href="#pod">Inside The Pod →</a>
              </article>
            </div>
            <div className="loop">
              <div className="loop-row">
                <div className="loop-step"><b>Read</b><span>Screener</span></div>
                <svg className="loop-arrow" width="46" height="12" viewBox="0 0 46 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M0 6h40"/><path d="M36 2l4 4-4 4"/></svg>
                <div className="loop-step"><b>Decide</b><span>Journal, the OTOS funnel</span></div>
                <svg className="loop-arrow" width="46" height="12" viewBox="0 0 46 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M0 6h40"/><path d="M36 2l4 4-4 4"/></svg>
                <div className="loop-step"><b>Execute</b><span>Your broker</span></div>
                <svg className="loop-arrow" width="46" height="12" viewBox="0 0 46 12" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M0 6h40"/><path d="M36 2l4 4-4 4"/></svg>
                <div className="loop-step"><b>Review</b><span>Journal, The Pod</span></div>
              </div>
              <div className="loop-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2F5B6C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>
                <span>The Journal sits on both sides of that loop, which is how the review actually changes the next read.</span>
              </div>
            </div>
          </div>
        </section>

        {/* SCREENER */}
        <section className="sec band" id="screener">
          <div className="wrap stack-40">
            <div className="screener-top">
              <div className="head">
                <span className="eyebrow">The screener</span>
                <h2>Five charts, one row.</h2>
                <p className="lede">It reads every timeframe on an instrument and tells you whether they agree. Alignment is scored, not asserted, and when the timeframes disagree it says so instead of picking a side.</p>
              </div>
              <div className="callouts">
                <p className="callout"><b>Bias bars</b> show direction and strength on each timeframe side by side, so a conflict is visible before you open a single chart.</p>
                <p className="callout"><b>Alignment</b> is a number out of four — how many timeframes agree right now. Most instruments, most days, are not at four.</p>
                <p className="callout"><b>Orca Status</b> is the output: off, caution, watch long or on long. When it says off, conditions are not there. That is most of the time.</p>
                <p className="callout"><b>Forward state</b> tells you the direction of travel — improving, stable or deteriorating — from the ML model. Direction, not a price prediction.</p>
              </div>
            </div>

            <figure className="shot">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/screener.jpg" width={1700} height={993} alt="Screener rows showing per-timeframe bias bars, alignment out of four, Orca status pills, score, ADX, EMA alignment, expansion percentage, ATR range and forward state." loading="lazy" />
              <figcaption>The list. Every instrument, every timeframe, scored and sorted. Look at how many rows say OFF.</figcaption>
            </figure>

            <div className="jrn-two">
              <figure className="shot">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/screener-detail.jpg" width={1700} height={937} alt="MSFT detail view with a price chart and ML forecast fan, the Orca status and score, the multi-timeframe breakdown, ADX and EMA readings, and an itemised score breakdown out of 100." loading="lazy" />
                <figcaption>The instrument. The forecast fan, the timeframe breakdown, and every component of the score itemised.</figcaption>
              </figure>
              <div className="stack-24" style={{ justifyContent: 'center' }}>
                <div className="trial-callout">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  <p><b>7 days free. No card.</b> Try every instrument, every timeframe, the ML forecast and the forward state model — completely free. If you decide it is not for you, you close the tab and nothing happens.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                  <a className="btn btn-trial" href="/screener">Start your 7-day free trial</a>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No card needed to start.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* JOURNAL */}
        <section className="sec" id="journal">
          <div className="wrap stack-40">
            <div className="jrn-top">
              <div className="head">
                <span className="eyebrow">OrcaJournal</span>
                <h2>A journal that grades the decision, not the profit.</h2>
                <p className="lede">Every other journal asks what you made. This one asks whether the decision was any good, because that is the part you can actually control and repeat. It runs on OTOS, the decision process the whole system is built on.</p>
              </div>
              <div className="jpoints">
                <div className="jpoint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                  <div><b>Process followed, as a number</b><p>The headline metric is not your P&amp;L. It is how often you actually did what you said you would.</p></div>
                </div>
                <div className="jpoint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>
                  <div><b>A no trade is a logged outcome</b><p>Stopping honestly at any stage is recorded as a success, not as a blank day.</p></div>
                </div>
                <div className="jpoint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-6 4 4 5-8"/><path d="M3 21h18"/></svg>
                  <div><b>Graded A+ to D on quality</b><p>Every entry is scored on how it was decided, so a lucky win cannot flatter you.</p></div>
                </div>
                <div className="jpoint">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="4"/></svg>
                  <div><b>Wired into the screener</b><p>Each decision stores the Orca score and status at the time, so you learn which conditions you handle well.</p></div>
                </div>
              </div>
            </div>

            <div className="stack-24">
              <h3 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 700, fontFamily: 'var(--f-display)', letterSpacing: '-0.02em' }}>The OTOS funnel, run one stage at a time.</h3>
              <p className="lede" style={{ maxWidth: '74ch' }}>Every decision goes top to bottom through the same seven stages, and you can stop honestly at any of them. Stopping is a successful outcome, which is the whole idea.</p>
              <div className="funnel">
                <div className="stage"><i>STAGE 1</i><b>Read the world</b><span>Can I describe this market plainly?</span></div>
                <div className="stage"><i>STAGE 2</i><b>Check yourself</b><span>How much can I risk, and am I fit to trade?</span></div>
                <div className="stage"><i>STAGE 3</i><b>The green light gates</b><span>Three vetoes, in order. Any single one ends it.</span></div>
                <div className="stage"><i>STAGE 4</i><b>Pick the play</b><span>Which execution model expresses this read?</span></div>
                <div className="stage"><i>STAGE 5</i><b>Size it</b><span>Conviction, risk, sized from the stop.</span></div>
                <div className="stage"><i>STAGE 6</i><b>Draw the line</b><span>Thesis, and what would make it wrong.</span></div>
                <div className="stage"><i>STAGE 7</i><b>The lesson</b><span>What the outcome actually taught you.</span></div>
                <div className="stage" style={{ borderColor: 'var(--cyan-line)', background: 'var(--cyan-bg)' }}><i style={{ color: 'var(--cyan-dim)' }}>ANY STAGE</i><b>Stop</b><span>Logged as a clean no trade, not a failure.</span></div>
              </div>
            </div>

            <div className="quoteline">
              <b>It also tells you which conditions you are actually good in.</b>
              <span>Because every decision carries its screener context, the analytics group your results by market character, conviction, Orca score band and Orca status. That is how you find out that your best play in a range is not your best play in a trend, using your own trades rather than someone&apos;s opinion.</span>
            </div>

            <div>
              <a className="btn btn-primary" href="/journal">Open the Journal</a>
            </div>
          </div>
        </section>

        {/* ACADEMY */}
        <section className="sec band" id="academy">
          <div className="wrap stack-40">
            <div className="head">
              <span className="eyebrow">Orca Academy</span>
              <h2>The Academy is free. It starts at the ground floor.</h2>
              <p className="lede">Most trading education assumes you already know what a market is and jumps straight to setups, which is why so many people end up copying entries they cannot explain. The Academy goes back further than that, and it costs nothing.</p>
            </div>

            <div className="acad">
              <div className="stack-24">
                <h3 style={{ fontSize: 20, fontWeight: 600, fontFamily: 'var(--f-display)', letterSpacing: '-0.02em' }}>Questions it answers</h3>
                <p className="lede" style={{ fontSize: 15.5 }}>If any of these feel too basic to ask out loud, that is exactly the problem it exists to fix.</p>
                <ul className="qlist">
                  {[
                    'What is a market, and who is on the other side of your trade?',
                    'What actually makes price move, and what only looks like it does?',
                    'What is liquidity, and why does price so often go where it should not?',
                    'Why do two timeframes disagree, and which one are you meant to believe?',
                    'How do you read a chart without memorising patterns off a list?',
                    'What is risk, and how much should a single trade be allowed to cost you?',
                  ].map(q => (
                    <li key={q}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 015.2.9c0 1.8-2.6 2.4-2.6 2.4"/><path d="M12 17h.01"/></svg>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="acad-list">
                {[
                  { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>, title: 'Taught on live charts', body: 'Real instruments, in real conditions, screensharing the chart rather than a deck of finished examples chosen after the fact.' },
                  { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5z"/><path d="M20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5z"/></svg>, title: 'Built to be used, not collected', body: 'Every lesson maps to something you can go and do on the free screener the same day.' },
                  { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>, title: 'No card, no upsell wall', body: 'You can finish the entire Academy and use the free screener without ever paying for anything. Nothing in it is a teaser for something else.' },
                  { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#3ECFF0" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 100-16 8 8 0 000 16z"/><path d="M12 8v4l2.5 2.5"/></svg>, title: 'No prior knowledge assumed', body: 'Start from zero if that is where you are. Nothing earlier is treated as obvious and no question in the Discord is treated as too basic.' },
                ].map(item => (
                  <div key={item.title} className="acad-item">
                    {item.icon}
                    <div><b>{item.title}</b><p>{item.body}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ladder">
              <h3>The Academy is the foundation. It is not everything.</h3>
              <p>Being honest about that is the point. The Academy gives you the ground to stand on and the vocabulary the rest of the system uses. Learning what to notice, how to interpret it, how structure behaves, how to think through a decision — that work continues in The Pod Library.</p>
              <div className="rungs">
                <div className="rung"><span className="cost">Free</span><b>Academy</b><span>The fundamentals. What markets are, what moves price, what risk means.</span></div>
                <div className="rung"><span className="cost">Free tier</span><b>Screener</b><span>Apply it daily. See the reads you have just learned to interpret, on live instruments.</span></div>
                <div className="rung paid"><span className="cost">Membership</span><b>The Pod Library</b><span>See, Read, Wyckoff, OTOS and The Trader. Where the depth is, plus the room to practise in.</span></div>
              </div>
              <div className="stack-24" style={{ gap: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>One vocabulary runs the whole way through, from the first free lesson to the screener columns to every check in the system.</p>
                <div className="chips">
                  {['State', 'Location', 'Liquidity', 'Pressure'].map(c => <span key={c} className="chip k">{c}</span>)}
                  {['Test', 'Effort vs Result', 'Failure', 'Release', 'Expectation', 'Opportunity', 'Execution'].map(c => <span key={c} className="chip">{c}</span>)}
                </div>
              </div>
            </div>

            <div>
              <a className="btn btn-primary" href="/academy">Start the Academy, free</a>
            </div>
          </div>
        </section>

        {/* THE POD */}
        <section className="sec" id="pod">
          <div className="wrap stack-40">
            <div className="head">
              <span className="eyebrow">The Pod · Membership</span>
              <h2>The part you cannot do alone.</h2>
              <p className="lede">The Academy gives you the foundations. The Pod is where the depth lives, where you use it in front of other people who will tell you when your reasoning is off, and where you can hand over your journal and have the decisions read back to you.</p>
            </div>

            <div className="pod-grid">
              {[
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>, title: 'Weekly Calls', body: 'Regular sessions on markets, trading concepts, decision-making, and the problems members are actually facing that week.' },
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18"/><rect x="4" y="11" width="4" height="6"/><rect x="10" y="6" width="4" height="11"/><rect x="16" y="9" width="4" height="8"/></svg>, title: 'Chart Reviews', body: 'Post your charts, ideas and trades, and get feedback on the thinking behind them rather than a verdict on the outcome.' },
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, title: 'Ask Bennie', body: 'A dedicated place to ask me directly when you are stuck or want a second read on something.' },
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>, title: 'Market Watch', body: 'What we are seeing in current markets, and how the concepts translate into conditions that are live right now.' },
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M5 7h14M7 7l-3 6a3 3 0 006 0zM17 7l-3 6a3 3 0 006 0z"/></svg>, title: 'Wins & Losses', body: 'Not a profit-flexing channel. A place to study both good and bad outcomes and work out what actually happened.' },
                { icon: <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h7M8 13h7M8 17h4"/><circle cx="18.5" cy="17.5" r="3.5" fill="none"/><path d="M17 17.5l1 1 2-2"/></svg>, title: 'Share your Journal', body: 'Pod members can share their journal for direct coaching. The actual decisions, stage by stage, read back to you.' },
              ].map(item => (
                <article key={item.title} className="pod">
                  <div className="pod-h">{item.icon}<h3>{item.title}</h3></div>
                  <p>{item.body}</p>
                </article>
              ))}

              <div className="library">
                <div className="lib-head">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V5a1 1 0 011-1h3v16H5a1 1 0 01-1-1z"/><path d="M8 4h4v16H8z"/><path d="M12.4 4.6l3.9 1 3.8 14.3-4-1z"/></svg>
                  <h3>The Pod Library</h3>
                  <span>Where the education continues past the free Academy.</span>
                </div>
                <div className="lib-grid">
                  {[['See','Learning what to notice.'],['Read','Learning to interpret what you are seeing.'],['Wyckoff','Understanding market behaviour and structure.'],['OTOS','A structured way of thinking through the market.'],['The Trader','Psychology, behaviour, and developing yourself as the decision-maker.']].map(([t,d]) => (
                    <div key={t} className="lib"><b>{t}</b><span>{d}</span></div>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Plus additional tools and materials as the library develops.</span>
              </div>
            </div>

            <div className="pod-cta">
              <a className="btn btn-pod" href={CLIENT_HUB_URL} target="_blank" rel="noopener noreferrer">Start your free 7-day trial</a>
              <a className="btn btn-ghost" href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Or start in the free Discord</a>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="sec band" id="pricing">
          <div className="wrap stack-32">
            <div className="head">
              <span className="eyebrow">Pricing</span>
              <h2 className="sm">Most of it is free. One part is not.</h2>
            </div>
            <div className="plans">
              <div className="plan">
                <h3>Free</h3>
                <div className="fig"><b style={{ color: 'var(--teal)' }}>€0</b><span>no card, no clock</span></div>
                <ul>
                  <li>Screener free tier, live right now</li>
                  <li>OrcaJournal</li>
                  <li>The entire Orca Academy, foundations included</li>
                  <li>The free Discord</li>
                </ul>
                <a className="btn btn-ghost" href="/screener">Start free</a>
              </div>
              <div className="plan hi">
                <h3>The Pod</h3>
                <div className="fig"><b style={{ color: '#B0A0FF' }}>€19.99</b><span>per month</span></div>
                <ul>
                  <li>Weekly calls and chart reviews</li>
                  <li>Ask Bennie, Market Watch, Wins &amp; Losses</li>
                  <li>The Pod Library: See, Read, Wyckoff, OTOS, The Trader</li>
                  <li>Share your journal for direct coaching</li>
                </ul>
                <a className="btn btn-pod" href={CLIENT_HUB_URL} target="_blank" rel="noopener noreferrer">Join The Pod</a>
              </div>
              <div className="plan">
                <h3>Screener Premium</h3>
                <div className="fig"><b>€29.99</b><span>per month</span></div>
                <div className="trial-line">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                  7-day free trial — no card needed
                </div>
                <ul>
                  <li>Every instrument and every timeframe</li>
                  <li>Advanced columns, ML forecast and forward state</li>
                  <li>Alerts and watchlists</li>
                </ul>
                <a className="btn btn-trial" href="/screener">Start your free 7-day trial</a>
              </div>
            </div>
            <p className="plan-foot">OrcaBot 2.0 is a separate one-time purchase for people who want the execution layer. It is not required for anything above. <a href="/orcabot">See what it does</a>.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="sec" id="about">
          <div className="wrap faq-layout">
            <div className="head">
              <span className="eyebrow">Questions</span>
              <h2 className="sm">Including the awkward ones.</h2>
            </div>
            <div>
              {faq.map(([q, a]) => (
                <details key={q}>
                  <summary>{q}</summary>
                  <div className="faq-ans">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="sec closing" id="close">
          <h2>Start with the read. The rest can wait.</h2>
          <p className="lede">Try the full screener free for 7 days — no card. Or join the Discord and start with the Academy right now.</p>
          <div className="closing-ctas">
            <a className="btn btn-trial" href="/screener">Try free for 7 days</a>
            <a className="btn btn-discord" href={CLIENT_HUB_URL} target="_blank" rel="noopener noreferrer">Join the Discord</a>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No card needed. Cancel any time. The Academy and Discord are always free.</span>
        </section>

        {/* FOOTER */}
        <footer className="foot">
          <div className="foot-in">
            <div className="foot-cols">
              <div className="foot-brand">
                <div className="mark"><span className="accent">Orca</span>Trading</div>
                <p>A multi-timeframe screener, a journal that grades the decision, a free academy, and the room where it all gets practised.</p>
              </div>
              <div className="foot-col">
                <h4>PRODUCT</h4>
                <ul>
                  <li><a href="/screener">Screener</a></li>
                  <li><a href="/journal">OrcaJournal</a></li>
                  <li><a href="/orcabot">OrcaBot 2.0</a></li>
                  <li><a href="/academy">Academy</a></li>
                  <li><a href={CLIENT_HUB_URL} target="_blank" rel="noopener noreferrer">The Pod</a></li>
                </ul>
              </div>
              <div className="foot-col">
                <h4>COMPANY</h4>
                <ul>
                  <li><a href="/about">About</a></li>
                  <li><a href="/contact">Contact</a></li>
                  <li><a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">Discord</a></li>
                </ul>
              </div>
              <div className="foot-col">
                <h4>LEGAL</h4>
                <ul>
                  <li><a href="/impressum">Impressum</a></li>
                  <li><a href="/datenschutz">Datenschutzerklärung</a></li>
                  <li><a href="/agb">AGB</a></li>
                  <li><a href="/risk">Risk disclosure</a></li>
                </ul>
              </div>
            </div>
            <p className="risk">Trading foreign exchange, CFDs and crypto assets carries a high level of risk and can result in the loss of your entire capital. OrcaTrading provides analysis tools and educational material. Nothing on this site is investment advice or a recommendation to buy or sell any instrument. Past performance does not indicate future results. Only trade with money you can afford to lose.</p>
            <div className="foot-base">
              <span>© 2026 OrcaTrading</span><span>·</span>
              <span>Engineered in Germany</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
