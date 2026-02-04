import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, TrendingUp } from 'lucide-react';
import { useTopBlockProducers, useNetworkState } from '@/hooks';
import { HashLink, LoadingSpinner } from '@/components/common';
import { formatNumber } from '@/utils/formatters';

export function StakingPage(): ReactNode {
  const { producers, loading, error } = useTopBlockProducers(1000, 25);
  const { networkState } = useNetworkState();

  const totalBlocks = networkState?.maxBlockHeight.canonicalMaxBlockHeight || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Block Producers</h1>
        <p className="mt-1 text-muted-foreground">
          Top validators by recent block production (last 1,000 blocks)
        </p>
      </div>

      {loading && <LoadingSpinner text="Loading block producers..." />}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Active Producers
                  </div>
                  <div className="text-2xl font-semibold">
                    {producers.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Blocks
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(totalBlocks)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2 lg:col-span-1">
              <div className="text-sm text-muted-foreground">Sample Period</div>
              <div className="text-2xl font-semibold">1,000 blocks</div>
              <div className="mt-1 text-xs text-muted-foreground">
                ~50 hours of network activity
              </div>
            </div>
          </div>

          {/* Producers Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Block Producer</th>
                  <th className="px-4 py-3 text-right">Blocks Produced</th>
                  <th className="px-4 py-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {producers.map((producer, index) => {
                  const share = (
                    (producer.blocksProduced / 1000) *
                    100
                  ).toFixed(1);
                  return (
                    <tr
                      key={producer.publicKey}
                      className="transition-colors hover:bg-accent/50"
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className={
                            index < 3
                              ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'
                              : 'text-muted-foreground'
                          }
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <HashLink hash={producer.publicKey} type="account" />
                          {index === 0 && (
                            <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                              Top Producer
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatNumber(producer.blocksProduced)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 rounded-full bg-secondary">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-mono text-sm">
                            {share}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold">About Block Producers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Block producers (validators) stake MINA and participate in
              consensus to produce blocks. Delegators can stake their MINA with
              a block producer to earn staking rewards. View an{' '}
              <Link to="/accounts" className="text-primary hover:underline">
                account&apos;s details
              </Link>{' '}
              to see who they delegate to.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
