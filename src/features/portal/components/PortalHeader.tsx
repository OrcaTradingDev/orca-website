'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Shield, Zap, Settings2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePortalStore } from '@/store/portal-store';
import { Switch } from '@/components/ui/switch';
import s from './portal.module.css';

export default function PortalHeader() {
  const user       = useAuthStore((state) => state.user);
  const { isAdminMode, toggleAdmin } = usePortalStore();
  const [imgError, setImgError] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  return (
    <header className={s.portalHeader}>
      <div className={s.portalHeaderInner}>

        {/* Left — user identity */}
        <div className={s.portalHeaderLeft}>
          <div className={s.avatarWrap}>
            {user?.picture && !imgError ? (
              <Image
                src={user.picture}
                alt={user.name ?? 'User'}
                width={56}
                height={56}
                className={s.avatarImg}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className={s.avatar}>{initials}</div>
            )}
            <span className={s.statusDot} title="Account active" />
          </div>

          <div className={s.userInfo}>
            <span className={s.userName}>{user?.name ?? 'Trader'}</span>
            <span className={s.userEmail}>{user?.email ?? '—'}</span>
            <div className={s.userBadges}>
              <span className={`${s.badge} ${s.badgeClient}`}>
                <Shield size={10} />
                OrcaBot Client
              </span>
              <span className={`${s.badge} ${s.badgeActive}`}>
                Active
              </span>
              {isAdminMode && (
                <span className={`${s.badge} ${s.badgeAdmin}`}>
                  <Settings2 size={10} />
                  Admin Mode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right — admin toggle */}
        <div className={s.portalHeaderRight}>
          <div className={s.adminToggleWrap}>
            <Zap size={13} className={isAdminMode ? s.adminToggleLabelActive : ''} />
            <span className={`${s.adminToggleLabel} ${isAdminMode ? s.adminToggleLabelActive : ''}`}>
              Admin
            </span>
            <Switch
              id="admin-mode-toggle"
              checked={isAdminMode}
              onCheckedChange={toggleAdmin}
              aria-label="Toggle admin mode"
            />
          </div>
        </div>

      </div>
    </header>
  );
}
