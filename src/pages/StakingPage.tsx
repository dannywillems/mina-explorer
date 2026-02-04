import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, Calendar, Clock } from 'lucide-react';
import {
  useBlockProducersByPeriod,
  useNetworkState,
  TIME_PERIOD_OPTIONS,
  type TimePeriod,
} from '@/hooks';
import { HashLink, LoadingSpinner } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function StakingPage(): ReactNode {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('7d');
  const { result, loading, error } = useBlockProducersByPeriod(
    selectedPeriod,
    25,
  );
  const { networkState } = useNetworkState();

  const totalBlocks = networkState?.maxBlockHeight.canonicalMaxBlockHeight || 0;
  const selectedOption = TIME_PERIOD_OPTIONS.find(
    o => o.value === selectedPeriod,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Block Producers</h1>
        <p className="mt-1 text-muted-foreground">
          Top validators by block production over time
        </p>
      </div>

      {/* Time Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Time period:</span>
        <div className="flex flex-wrap gap-2">
          {TIME_PERIOD_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                selectedPeriod === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner text="Loading block producers..." />}

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && result && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                    {result.producers.length}
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
                    Blocks in Period
                  </div>
                  <div className="text-2xl font-semibold">
                    {formatNumber(result.totalBlocks)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
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

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-purple-500/10 p-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Selected Period
                  </div>
                  <div className="text-lg font-semibold">
                    {selectedOption?.label || 'Unknown'}
                  </div>
                </div>
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
                {result.producers.map((producer, index) => {
                  const share =
                    result.totalBlocks > 0
                      ? (
                          (producer.blocksProduced / result.totalBlocks) *
                          100
                        ).toFixed(1)
                      : '0.0';
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
                              style={{
                                width: `${Math.min(100, parseFloat(share))}%`,
                              }}
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

          {/* Period Info */}
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            <p>
              Showing data from{' '}
              <span className="font-medium text-foreground">
                {new Date(result.startDate).toLocaleDateString()}
              </span>{' '}
              to{' '}
              <span className="font-medium text-foreground">
                {new Date(result.endDate).toLocaleDateString()}
              </span>
            </p>
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
