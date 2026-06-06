'use client';

import {
  User, Mail, Calendar, Crown, CheckCircle,
  MessageSquare, ExternalLink, Headphones, Edit2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePortalStore } from '@/store/portal-store';
import s from './portal.module.css';

const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URI ?? 'https://discord.gg/orcatrading';

export default function ProfileSection() {
  const user        = useAuthStore((st) => st.user);
  const isAdminMode = usePortalStore((st) => st.isAdminMode);

  return (
    <div id="portal-panel-profile" role="tabpanel" aria-labelledby="portal-tab-profile">

      <div className={s.sectionHeader}>
        <div>
          <h2 className={s.sectionTitle}><User size={18} /> My Profile</h2>
          <p className={s.sectionSubtitle}>Your account details and subscription status</p>
        </div>
        {isAdminMode && (
          <button className={s.adminActionBtn} id="admin-edit-profile-btn">
            <Edit2 size={13} /> Edit User
          </button>
        )}
      </div>

      <div className={s.profileGrid}>

        {/* Account Details */}
        <div className={s.profileCard}>
          <p className={s.profileCardTitle}><User size={12} /> Account Details</p>

          <div className={s.profileRow}>
            <span className={s.profileRowLabel}><Mail size={12} style={{ display:'inline', marginRight:4 }} />Email</span>
            <span className={s.profileRowValue}>{user?.email ?? '—'}</span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}><User size={12} style={{ display:'inline', marginRight:4 }} />Full Name</span>
            <span className={s.profileRowValue}>{user?.name ?? '—'}</span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}><Calendar size={12} style={{ display:'inline', marginRight:4 }} />Member Since</span>
            <span className={s.profileRowValue}>May 2025</span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}>Auth Method</span>
            <span className={s.profileRowValue}>Google OAuth</span>
          </div>
        </div>

        {/* Subscription Info */}
        <div className={s.profileCard}>
          <p className={s.profileCardTitle}><Crown size={12} /> Subscription</p>

          <div className={s.profileRow}>
            <span className={s.profileRowLabel}>Plan</span>
            <span className={s.profileRowValue}>OrcaBot Standard</span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}>Status</span>
            <span className={s.profileRowValue} style={{ color: 'var(--color-success)', display:'flex', alignItems:'center', gap:4 }}>
              <CheckCircle size={13} /> Active
            </span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}>Purchase Date</span>
            <span className={s.profileRowValue}>1 May 2025</span>
          </div>
          <div className={s.profileRow}>
            <span className={s.profileRowLabel}>License</span>
            <span className={s.profileRowValue}>Lifetime</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className={`${s.profileCard} ${s.profileCardFull}`}>
          <p className={s.profileCardTitle}>Quick Access</p>
          <div className={s.quickLinks}>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="profile-discord-link"
              className={`${s.quickLink} ${s.quickLinkDiscord}`}
            >
              <MessageSquare size={14} /> Join Discord Community
            </a>
            <a
              href="mailto:support@orcatrading.com"
              id="profile-support-link"
              className={s.quickLink}
            >
              <Headphones size={14} /> Contact Support
            </a>
            <a
              href="/orcabot"
              id="profile-orcabot-link"
              className={s.quickLink}
            >
              <ExternalLink size={14} /> OrcaBot Product Page
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
