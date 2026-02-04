import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { useBlocks } from '@/hooks';
import { BlockList } from '@/components/blocks';
import { cn } from '@/lib/utils';

export function BlocksPage(): ReactNode {
  const { blocks, loading, error, refresh } = useBlocks(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blocks</h1>
        <button
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent',
            loading && 'opacity-50',
          )}
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
          Refresh
        </button>
      </div>
      <BlockList blocks={blocks} loading={loading} error={error} />
    </div>
  );
}
