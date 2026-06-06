import type { Metadata } from 'next';
import { PortalClient } from '@/features/portal';

export const metadata: Metadata = {
  title: 'Client Portal — OrcaBot | OrcaTrading',
  description: 'Access your OrcaBot files, educational resources, and account details.',
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return <PortalClient />;
}
