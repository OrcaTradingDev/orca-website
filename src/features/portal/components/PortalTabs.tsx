'use client';

import { User, BookOpen, Download } from 'lucide-react';
import type { PortalTab } from '@/store/portal-store';
import s from './portal.module.css';

const TABS: { id: PortalTab; label: string; Icon: React.ElementType }[] = [
  { id: 'profile',   label: 'My Profile',    Icon: User },
  { id: 'knowledge', label: 'Knowledge Base', Icon: BookOpen },
  { id: 'cbots',     label: 'cBot Sets',      Icon: Download },
];

interface PortalTabsProps {
  active:   PortalTab;
  onChange: (tab: PortalTab) => void;
}

export default function PortalTabs({ active, onChange }: PortalTabsProps) {
  return (
    <div className={s.tabBar} role="tablist" aria-label="Portal navigation">
      <div className={s.tabBarInner}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            id={`portal-tab-${id}`}
            role="tab"
            aria-selected={active === id}
            aria-controls={`portal-panel-${id}`}
            onClick={() => onChange(id)}
            className={`${s.tabBtn}${active === id ? ' ' + s.tabBtnActive : ''}`}
          >
            <Icon className={s.tabIcon} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
