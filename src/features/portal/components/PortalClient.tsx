'use client';

import { usePortalStore, type PortalTab } from '@/store/portal-store';
import PortalHeader   from './PortalHeader';
import PortalTabs     from './PortalTabs';
import ProfileSection   from './ProfileSection';
import KnowledgeSection from './KnowledgeSection';
import CbotSetsSection  from './CbotSetsSection';
import s from './portal.module.css';

const SECTION_MAP: Record<PortalTab, React.ReactNode> = {
  profile:   <ProfileSection />,
  knowledge: <KnowledgeSection />,
  cbots:     <CbotSetsSection />,
};

export default function PortalClient() {
  const { activeTab, setActiveTab } = usePortalStore();

  return (
    <div className={s.portalPage}>
      <PortalHeader />
      <PortalTabs active={activeTab} onChange={setActiveTab} />

      <div className={s.portalWrap}>
        <div className={s.portalContent}>
          {SECTION_MAP[activeTab]}
        </div>
      </div>
    </div>
  );
}
