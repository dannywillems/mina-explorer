import { useState, type ReactNode } from 'react';
import { RefreshCw, Info } from 'lucide-react';
import { HashLink, Amount, LoadingSpinner } from '@/components/common';
import {
  usePendingTransactions,
  usePendingZkAppCommands,
  useNetwork,
} from '@/hooks';
import { cn } from '@/lib/utils';

type Tab = 'user' | 'zkapp';

export function TransactionsPage(): ReactNode {
  const [activeTab, setActiveTab] = useState<Tab>('user');
  const [showUserQuery, setShowUserQuery] = useState(false);
  const [showZkAppQuery, setShowZkAppQuery] = useState(false);
  const { network } = useNetwork();

  const {
    transactions,
    loading: txLoading,
    error: txError,
    refetch: refetchTx,
  } = usePendingTransactions();

  const {
    commands,
    loading: zkLoading,
    error: zkError,
    refetch: refetchZk,
  } = usePendingZkAppCommands();

  const userCommandsQuery = `query {
  pooledUserCommands {
    hash
    kind
    amount
    fee
    from
    to
    memo
    nonce
  }
}`;

  const zkAppCommandsQuery = `query {
  pooledZkappCommands {
    hash
    zkappCommand {
      memo
      feePayer {
        body {
          publicKey
          fee
        }
      }
    }
  }
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pending Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Mempool on {network.displayName}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('user')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              User Transactions ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('zkapp')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === 'zkapp'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              zkApp Commands ({commands.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                activeTab === 'user'
                  ? setShowUserQuery(!showUserQuery)
                  : setShowZkAppQuery(!showZkAppQuery)
              }
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Show GraphQL query"
            >
              <Info size={16} />
            </button>
            <button
              onClick={() => (activeTab === 'user' ? refetchTx() : refetchZk())}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {activeTab === 'user' && showUserQuery && (
          <div className="border-b border-border bg-accent/30 px-6 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              GraphQL Query (Daemon Endpoint: {network.displayName})
            </p>
            <pre className="overflow-x-auto rounded bg-accent p-3 font-mono text-xs">
              {userCommandsQuery}
            </pre>
          </div>
        )}

        {activeTab === 'zkapp' && showZkAppQuery && (
          <div className="border-b border-border bg-accent/30 px-6 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              GraphQL Query (Daemon Endpoint: {network.displayName})
            </p>
            <pre className="overflow-x-auto rounded bg-accent p-3 font-mono text-xs">
              {zkAppCommandsQuery}
            </pre>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'user' ? (
            txLoading ? (
              <LoadingSpinner text="Loading pending transactions..." />
            ) : txError ? (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {txError}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-muted-foreground">
                No pending transactions in the mempool.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Hash</th>
                      <th className="px-4 py-3">From</th>
                      <th className="px-4 py-3">To</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Fee</th>
                      <th className="px-4 py-3 text-right">Nonce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map(tx => (
                      <tr
                        key={tx.hash}
                        className="transition-colors hover:bg-accent/50"
                      >
                        <td className="px-4 py-3">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {tx.kind}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <HashLink hash={tx.hash} type="transaction" />
                        </td>
                        <td className="px-4 py-3">
                          <HashLink hash={tx.from} type="account" />
                        </td>
                        <td className="px-4 py-3">
                          <HashLink hash={tx.to} type="account" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Amount value={tx.amount} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Amount value={tx.fee} />
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm">
                          {tx.nonce}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : zkLoading ? (
            <LoadingSpinner text="Loading pending zkApp commands..." />
          ) : zkError ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {zkError}
            </div>
          ) : commands.length === 0 ? (
            <p className="text-muted-foreground">
              No pending zkApp commands in the mempool.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Hash</th>
                    <th className="px-4 py-3">Fee Payer</th>
                    <th className="px-4 py-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {commands.map(cmd => (
                    <tr
                      key={cmd.hash}
                      className="transition-colors hover:bg-accent/50"
                    >
                      <td className="px-4 py-3">
                        <HashLink hash={cmd.hash} type="transaction" />
                      </td>
                      <td className="px-4 py-3">
                        <HashLink hash={cmd.feePayer} type="account" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Amount value={cmd.fee} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
