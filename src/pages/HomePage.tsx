import type { ReactNode } from 'react';
import { NetworkStats, RecentBlocks } from '@/components/dashboard';

export function HomePage(): ReactNode {
  return (
    <div className="space-y-6">
      <NetworkStats />
      <RecentBlocks />
    </div>
  );
}
