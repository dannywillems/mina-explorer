import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useBlocks } from '@/hooks';
import { HashLink, TimeAgo, Amount, LoadingSpinner } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function RecentBlocks(): ReactNode {
  const { blocks, loading, error, refresh } = useBlocks(10);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">Recent Blocks</h2>
        <div className="flex items-center gap-2">
          <button
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent',
              loading && 'opacity-50',
            )}
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={cn(loading && 'animate-spin')} />
            Refresh
          </button>
          <Link
            to="/blocks"
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <LoadingSpinner text="Loading blocks..." />
        ) : error ? (
          <div className="m-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Height</th>
                  <th className="px-4 py-3">Producer</th>
                  <th className="px-4 py-3 text-right">Coinbase</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blocks.map(block => (
                  <tr
                    key={block.stateHash}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/block/${block.blockHeight}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {formatNumber(block.blockHeight)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <HashLink
                        hash={block.creator}
                        type="account"
                        prefixLength={6}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Amount value={block.coinbase || '0'} />
                    </td>
                    <td className="px-4 py-3">
                      <TimeAgo dateTime={block.dateTime} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
