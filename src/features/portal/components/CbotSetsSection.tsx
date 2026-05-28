'use client';

import {
  Shield, Zap, Download, Clock,
  Pencil, Trash2, GripVertical, Upload, Plus, AlertTriangle,
} from 'lucide-react';
import { usePortalStore } from '@/store/portal-store';
import type { CbotSet } from '../types/portal';
import s from './portal.module.css';

/* ── Mock data ─────────────────────────────────────── */
const SAFE_SETS: CbotSet[] = [
  {
    id: 'safe-1', name: 'OrcaBot Conservative v2.4', risk: 'safe',
    description: 'Low-risk, trend-following algo optimised for EUR/USD and GBP/USD on H4. Capital preservation first.',
    version: 'v2.4', fileSize: '2.1 MB', updatedAt: '2025-05-08',
    downloadUrl: '/downloads/orcabot-conservative-v2.4.algo',
    pairs: ['EUR/USD', 'GBP/USD'], timeframes: ['H4', 'D1'], winRate: '68%',
  },
  {
    id: 'safe-2', name: 'OrcaBot Swing Safe v1.9', risk: 'safe',
    description: 'Swing trading set with tight risk per trade (0.5%). Designed for calm macro environments.',
    version: 'v1.9', fileSize: '1.8 MB', updatedAt: '2025-04-22',
    downloadUrl: '/downloads/orcabot-swing-safe-v1.9.algo',
    pairs: ['EUR/USD', 'USD/JPY', 'AUD/USD'], timeframes: ['H1', 'H4'], winRate: '63%',
  },
  {
    id: 'safe-3', name: 'OrcaBot Range Finder v1.2', risk: 'safe',
    description: 'Range-bound market strategy for low-volatility sessions. Auto-detects consolidation zones.',
    version: 'v1.2', fileSize: '1.5 MB', updatedAt: '2025-03-15',
    downloadUrl: '/downloads/orcabot-range-v1.2.algo',
    pairs: ['EUR/USD', 'USD/CHF'], timeframes: ['H1'], winRate: '61%',
  },
];

const AGGRESSIVE_SETS: CbotSet[] = [
  {
    id: 'agg-1', name: 'OrcaBot Scalper Pro v1.8', risk: 'aggressive',
    description: 'High-frequency scalping algo for M15. Max drawdown 15%. Not for the faint-hearted.',
    version: 'v1.8', fileSize: '2.6 MB', updatedAt: '2025-05-10',
    downloadUrl: '/downloads/orcabot-scalper-pro-v1.8.algo',
    pairs: ['EUR/USD', 'GBP/JPY'], timeframes: ['M15', 'M30'], winRate: '74%',
  },
  {
    id: 'agg-2', name: 'OrcaBot News Trader v2.1', risk: 'aggressive',
    description: 'Capitalises on high-impact news events. Requires fast execution broker (ECN recommended).',
    version: 'v2.1', fileSize: '3.0 MB', updatedAt: '2025-04-30',
    downloadUrl: '/downloads/orcabot-news-v2.1.algo',
    pairs: ['GBP/USD', 'USD/JPY', 'EUR/USD'], timeframes: ['M5', 'M15'], winRate: '71%',
  },
  {
    id: 'agg-3', name: 'OrcaBot London Breakout v1.5', risk: 'aggressive',
    description: 'Momentum breakout strategy targeting the London open session. Compound-friendly.',
    version: 'v1.5', fileSize: '2.2 MB', updatedAt: '2025-03-28',
    downloadUrl: '/downloads/orcabot-london-v1.5.algo',
    pairs: ['GBP/USD', 'EUR/USD'], timeframes: ['M30', 'H1'], winRate: '69%',
  },
];

/* ── Sub-components ─────────────────────────────────── */
function CbotCard({ set, isAdminMode }: { set: CbotSet; isAdminMode: boolean }) {
  const isSafe = set.risk === 'safe';

  return (
    <article
      id={`cbot-card-${set.id}`}
      className={`${s.cbotCard} ${isSafe ? s.cbotCardSafe : s.cbotCardAggressive}${isAdminMode ? ' ' + s.adminOverlayCard : ''}`}
    >
      {/* Admin controls */}
      {isAdminMode && (
        <div className={s.adminCardControls}>
          <button className={`${s.adminIconBtn} ${s.adminDragHandle}`} title="Drag to reorder" aria-label="Drag to reorder">
            <GripVertical size={12} />
          </button>
          <button className={`${s.adminIconBtn} ${s.adminIconBtnEdit}`} title="Edit" aria-label={`Edit ${set.name}`}>
            <Pencil size={12} />
          </button>
          <button className={`${s.adminIconBtn} ${s.adminIconBtnDelete}`} title="Delete" aria-label={`Delete ${set.name}`}>
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Top row */}
      <div className={s.cbotCardTop}>
        <span className={`${s.riskTag} ${isSafe ? s.riskTagSafe : s.riskTagAggressive}`}>
          {isSafe ? '⬤ Safe' : '⬤ Aggressive'}
        </span>
        <span className={s.cbotVersion}>{set.version}</span>
      </div>

      <h3 className={s.cbotName}>{set.name}</h3>
      <p className={s.cbotDesc}>{set.description}</p>

      {/* Pairs */}
      <div className={s.cbotPairs}>
        {set.pairs.map((p) => (
          <span key={p} className={s.cbotPairTag}>{p}</span>
        ))}
        {set.timeframes.map((tf) => (
          <span key={tf} className={s.cbotPairTag}>{tf}</span>
        ))}
      </div>

      {/* Meta row */}
      <div className={s.cbotMeta}>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <Clock size={11} /> Updated {new Date(set.updatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
        {set.winRate && <span style={{ color: isSafe ? 'var(--color-safe)' : 'var(--color-aggressive)', fontWeight: 700 }}>{set.winRate} Win Rate</span>}
      </div>

      {/* Download */}
      <a
        href={set.downloadUrl}
        download
        id={`cbot-download-${set.id}`}
        className={`${s.cbotDownloadBtn} ${isSafe ? s.cbotDownloadBtnSafe : s.cbotDownloadBtnAggressive}`}
      >
        <Download size={14} />
        Download .algo File
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.75 }}>{set.fileSize}</span>
      </a>
    </article>
  );
}

function CategorySection({
  title, desc, icon: Icon, sets, isAdminMode,
  iconClass, uploadZoneId,
}: {
  title: string; desc: string; icon: React.ElementType;
  sets: CbotSet[]; isAdminMode: boolean;
  iconClass: string; uploadZoneId: string;
}) {
  const isSafe = iconClass === s.cbotCategoryIconSafe;
  return (
    <section className={s.cbotCategory}>
      <div className={s.cbotCategoryHeader}>
        <div className={`${s.cbotCategoryIcon} ${iconClass}`}>
          <Icon size={18} />
        </div>
        <div>
          <h3 className={s.cbotCategoryTitle}>{title}</h3>
          <p className={s.cbotCategoryDesc}>{desc}</p>
        </div>
        <span className={`${s.riskTag} ${isSafe ? s.riskTagSafe : s.riskTagAggressive}`}>
          {isSafe ? 'Low Risk' : 'High Risk'}
        </span>
      </div>

      {!isSafe && (
        <div className={s.adminBanner} style={{ borderColor: 'var(--color-aggressive-border)', background: 'var(--color-aggressive-10)', marginBottom: 'var(--space-4)' }}>
          <AlertTriangle size={15} style={{ color: 'var(--color-aggressive)', flexShrink: 0 }} />
          <span className={s.adminBannerText} style={{ color: 'var(--color-aggressive)' }}>
            High-risk sets — only for experienced traders. Past results are not indicative of future performance.
          </span>
        </div>
      )}

      <div className={s.cbotGrid}>
        {sets.map((set) => (
          <CbotCard key={set.id} set={set} isAdminMode={isAdminMode} />
        ))}
        {isAdminMode && (
          <button className={s.uploadDropzone} id={uploadZoneId} type="button">
            <div className={s.uploadDropzoneIcon}><Upload size={18} /></div>
            <span className={s.uploadDropzoneText}>Upload cBot Set</span>
            <span className={s.uploadDropzoneHint}>.algo files only — max 50 MB</span>
          </button>
        )}
      </div>
    </section>
  );
}

/* ── Main Component ─────────────────────────────────── */
export default function CbotSetsSection() {
  const isAdminMode = usePortalStore((st) => st.isAdminMode);

  return (
    <div id="portal-panel-cbots" role="tabpanel" aria-labelledby="portal-tab-cbots">
      <div className={s.sectionHeader}>
        <div>
          <h2 className={s.sectionTitle}><Download size={18} /> cBot Sets</h2>
          <p className={s.sectionSubtitle}>
            Your licensed OrcaBot .algo files — download and import directly into cTrader
          </p>
        </div>
        {isAdminMode && (
          <button className={s.adminActionBtn} id="cbots-add-set-btn">
            <Plus size={13} /> Add New Set
          </button>
        )}
      </div>

      {isAdminMode && (
        <div className={s.adminBanner}>
          <Pencil size={15} className={s.adminBannerIcon} />
          <span className={s.adminBannerText}>Admin Mode — upload dropzones and edit controls are active</span>
        </div>
      )}

      <CategorySection
        title="Safe Sets"
        desc="Conservative strategies with controlled drawdown and lower risk profiles"
        icon={Shield}
        sets={SAFE_SETS}
        isAdminMode={isAdminMode}
        iconClass={s.cbotCategoryIconSafe}
        uploadZoneId="safe-upload-dropzone"
      />

      <CategorySection
        title="Aggressive Sets"
        desc="Higher-frequency, higher-risk strategies for experienced traders"
        icon={Zap}
        sets={AGGRESSIVE_SETS}
        isAdminMode={isAdminMode}
        iconClass={s.cbotCategoryIconAggressive}
        uploadZoneId="aggressive-upload-dropzone"
      />
    </div>
  );
}
