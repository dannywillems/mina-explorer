import { useState, type ReactNode } from 'react';
import { HashLink, Amount, LoadingSpinner } from '@/components/common';
import { formatDateTime, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import type { BlockDetail as BlockDetailType } from '@/types';

interface BlockDetailProps {
  block: BlockDetailType | null;
  loading: boolean;
  error: string | null;
}

export function BlockDetail({
  block,
  loading,
  error,
}: BlockDetailProps): ReactNode {
  const [showJson, setShowJson] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading block..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!block) {
    return (
      <div className="rounded-md bg-warning/10 p-4 text-sm text-warning">
        Block not found.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-semibold">
          Block #{formatNumber(block.blockHeight)}
        </h2>
        <button
          className={cn(
            'rounded-md border border-input px-3 py-1.5 text-sm',
            'transition-colors hover:bg-accent',
          )}
          onClick={() => setShowJson(!showJson)}
        >
          {showJson ? 'Hide JSON' : 'View JSON'}
        </button>
      </div>
      <div className="p-6">
        {showJson ? (
          <pre className="max-h-[600px] overflow-auto rounded-md bg-accent p-4 font-mono text-xs">
            {JSON.stringify(block, null, 2)}
          </pre>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Block Height</span>
                <span className="font-mono">
                  {formatNumber(block.blockHeight)}
                </span>
              </div>
              <div className="flex flex-col gap-1 border-b border-border pb-2">
                <span className="text-muted-foreground">State Hash</span>
                <span className="break-all font-mono text-sm">
                  {block.stateHash}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Timestamp</span>
                <span>{formatDateTime(block.dateTime)}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Block Producer</span>
                <HashLink hash={block.creator} type="account" />
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Coinbase Reward</span>
                <Amount value={block.transactions?.coinbase || '0'} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
