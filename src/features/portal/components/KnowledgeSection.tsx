'use client';

import { useState } from 'react';
import {
  BookOpen, FileText, Video, AlignLeft,
  Plus, Pencil, Trash2, GripVertical, Upload,
} from 'lucide-react';
import { usePortalStore } from '@/store/portal-store';
import type { KnowledgeItem, KnowledgeCategory } from '../types/portal';
import s from './portal.module.css';

/* ── Mock data ─────────────────────────────────────── */
const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: 'kb-1', title: 'OrcaBot 2.0 — Quick Start Guide',
    description: 'Get up and running in under 15 minutes. Install, configure, and run your first automated trade on cTrader.',
    category: 'getting-started', fileType: 'pdf', pages: 18, updatedAt: '2025-05-01', isNew: true,
  },
  {
    id: 'kb-2', title: 'cTrader Setup & Account Linking',
    description: 'Step-by-step walkthrough for linking your broker account and importing OrcaBot algo files into cTrader.',
    category: 'ctrader-guides', fileType: 'pdf', pages: 24, updatedAt: '2025-04-20',
  },
  {
    id: 'kb-3', title: 'Risk Management Fundamentals',
    description: 'Core principles for protecting your capital. Position sizing, drawdown limits, and stop-loss strategy.',
    category: 'risk-management', fileType: 'article', updatedAt: '2025-04-15',
  },
  {
    id: 'kb-4', title: 'Understanding Safe vs Aggressive Sets',
    description: 'Deep-dive into how Safe and Aggressive cBot configurations differ in logic, targets, and risk profile.',
    category: 'risk-management', fileType: 'video', duration: '22 min', updatedAt: '2025-03-30', isNew: true,
  },
  {
    id: 'kb-5', title: 'Advanced Parameter Tuning',
    description: 'Fine-tune OrcaBot parameters for your specific broker spread, session times, and risk appetite.',
    category: 'advanced-strategies', fileType: 'pdf', pages: 32, updatedAt: '2025-03-10',
  },
  {
    id: 'kb-6', title: 'May 2025 — OrcaBot Changelog & Updates',
    description: 'Release notes for v2.4 including new pair support, improved entry logic, and bug fixes.',
    category: 'updates', fileType: 'article', updatedAt: '2025-05-10', isNew: true,
  },
];

const CATEGORIES: { id: KnowledgeCategory | 'all'; label: string }[] = [
  { id: 'all',                label: 'All' },
  { id: 'getting-started',    label: 'Getting Started' },
  { id: 'ctrader-guides',     label: 'cTrader Guides' },
  { id: 'risk-management',    label: 'Risk Management' },
  { id: 'advanced-strategies', label: 'Advanced' },
  { id: 'updates',            label: 'Updates' },
];

const CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  'getting-started':    'Getting Started',
  'ctrader-guides':     'cTrader Guide',
  'risk-management':    'Risk Mgmt',
  'advanced-strategies': 'Advanced',
  'updates':            'Update',
};

function FileIcon({ type }: { type: KnowledgeItem['fileType'] }) {
  if (type === 'pdf')     return <FileText size={18} />;
  if (type === 'video')   return <Video size={18} />;
  return <AlignLeft size={18} />;
}

function fileMeta(item: KnowledgeItem) {
  if (item.fileType === 'pdf' && item.pages)     return `${item.pages} pages`;
  if (item.fileType === 'video' && item.duration) return item.duration;
  return 'Article';
}

/* ── Component ──────────────────────────────────────── */
export default function KnowledgeSection() {
  const isAdminMode = usePortalStore((st) => st.isAdminMode);
  const [activeFilter, setActiveFilter] = useState<KnowledgeCategory | 'all'>('all');

  const filtered = activeFilter === 'all'
    ? KNOWLEDGE_ITEMS
    : KNOWLEDGE_ITEMS.filter((i) => i.category === activeFilter);

  return (
    <div id="portal-panel-knowledge" role="tabpanel" aria-labelledby="portal-tab-knowledge">

      {/* Section header */}
      <div className={s.sectionHeader}>
        <div>
          <h2 className={s.sectionTitle}><BookOpen size={18} /> Knowledge Base</h2>
          <p className={s.sectionSubtitle}>
            Your premium gated library — guides, videos, and strategies
          </p>
        </div>
        {isAdminMode && (
          <button className={s.adminActionBtn} id="kb-upload-btn">
            <Plus size={13} /> Upload New Material
          </button>
        )}
      </div>

      {/* Admin banner */}
      {isAdminMode && (
        <div className={s.adminBanner} role="alert">
          <Pencil size={15} className={s.adminBannerIcon} />
          <span className={s.adminBannerText}>
            Admin Mode — hover cards to reveal edit controls
          </span>
        </div>
      )}

      {/* Category filters */}
      <div className={s.kbFilters} role="group" aria-label="Filter knowledge base">
        {CATEGORIES.map(({ id, label }) => (
          <button
            key={id}
            id={`kb-filter-${id}`}
            onClick={() => setActiveFilter(id as KnowledgeCategory | 'all')}
            className={`${s.filterBtn}${activeFilter === id ? ' ' + s.filterBtnActive : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={s.kbGrid}>
        {filtered.map((item) => (
          <article
            key={item.id}
            id={`kb-card-${item.id}`}
            className={`${s.kbCard}${isAdminMode ? ' ' + s.adminOverlayCard : ''}`}
          >
            {/* Admin controls */}
            {isAdminMode && (
              <div className={s.adminCardControls}>
                <button className={`${s.adminIconBtn} ${s.adminDragHandle}`} title="Drag to reorder" aria-label="Drag to reorder">
                  <GripVertical size={12} />
                </button>
                <button className={`${s.adminIconBtn} ${s.adminIconBtnEdit}`} title="Edit" aria-label="Edit item">
                  <Pencil size={12} />
                </button>
                <button className={`${s.adminIconBtn} ${s.adminIconBtnDelete}`} title="Delete" aria-label="Delete item">
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Card content */}
            {item.isNew && <span className={s.newBadge}>New</span>}

            <div className={s.kbCardTop}>
              <div className={`${s.kbIconWrap} ${
                item.fileType === 'pdf'
                  ? s.kbIconPdf
                  : item.fileType === 'video'
                    ? s.kbIconVideo
                    : s.kbIconArticle
              }`}>
                <FileIcon type={item.fileType} />
              </div>
              <span className={s.kbCategoryTag}>{CATEGORY_LABELS[item.category]}</span>
            </div>

            <h3 className={s.kbTitle}>{item.title}</h3>
            <p className={s.kbDesc}>{item.description}</p>

            <div className={s.kbMeta}>
              <span>{fileMeta(item)}</span>
              <span className={s.kbMetaDot} />
              <span>Updated {new Date(item.updatedAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
            </div>

            <div className={s.kbActions}>
              <a
                href={`/portal/resources/${item.id}`}
                id={`kb-read-${item.id}`}
                className={s.btnRead}
              >
                <BookOpen size={13} />
                {item.fileType === 'video' ? 'Watch' : 'Read'}
              </a>
            </div>
          </article>
        ))}

        {/* Admin upload dropzone */}
        {isAdminMode && (
          <button className={s.uploadDropzone} id="kb-upload-dropzone" type="button">
            <div className={s.uploadDropzoneIcon}><Upload size={18} /></div>
            <span className={s.uploadDropzoneText}>Upload New Material</span>
            <span className={s.uploadDropzoneHint}>PDF, MP4 or Markdown — max 100 MB</span>
          </button>
        )}
      </div>
    </div>
  );
}
