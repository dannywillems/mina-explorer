import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTransaction } from '@/hooks';
import { HashLink, Amount, LoadingSpinner } from '@/components/common';
import { formatDateTime, formatNumber, decodeMemo } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export function TransactionDetailPage(): ReactNode {
  const { hash } = useParams<{ hash: string }>();
  const { transaction, loading, error } = useTransaction(hash || '');

  return (
    <div className="space-y-4">
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight size={14} />
          <li>
            <Link to="/transactions" className="hover:text-foreground">
              Transactions
            </Link>
          </li>
          <ChevronRight size={14} />
          <li className="max-w-[200px] truncate font-medium text-foreground">
            {hash}
          </li>
        </ol>
      </nav>

      <TransactionDetail
        transaction={transaction}
        loading={loading}
        error={error}
      />
    </div>
  );
}

interface TransactionDetailProps {
  transaction: ReturnType<typeof useTransaction>['transaction'];
  loading: boolean;
  error: string | null;
}

function TransactionDetail({
  transaction,
  loading,
  error,
}: TransactionDetailProps): ReactNode {
  if (loading) {
    return <LoadingSpinner text="Searching for transaction..." />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="rounded-md bg-warning/10 p-4 text-sm text-warning">
        Transaction not found. It may not exist or is older than the search
        range.
      </div>
    );
  }

  const isUserCommand = transaction.type === 'user_command';
  const isPending = transaction.status === 'pending';

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Transaction Details</h2>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isPending
                ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                : 'bg-green-500/10 text-green-600 dark:text-green-400',
            )}
          >
            {isPending ? 'Pending' : 'Confirmed'}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isUserCommand
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
            )}
          >
            {isUserCommand ? transaction.kind || 'User Command' : 'zkApp'}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1 border-b border-border pb-2">
              <span className="text-muted-foreground">Transaction Hash</span>
              <span className="break-all font-mono text-sm">
                {transaction.hash}
              </span>
            </div>

            {transaction.blockHeight && (
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Block Height</span>
                <Link
                  to={`/block/${transaction.blockHeight}`}
                  className="font-mono text-primary hover:underline"
                >
                  {formatNumber(transaction.blockHeight)}
                </Link>
              </div>
            )}

            {transaction.dateTime && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Timestamp</span>
                <span>{formatDateTime(transaction.dateTime)}</span>
              </div>
            )}

            {isUserCommand && transaction.from && (
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">From</span>
                <HashLink hash={transaction.from} type="account" />
              </div>
            )}

            {isUserCommand && transaction.to && (
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">To</span>
                <HashLink hash={transaction.to} type="account" />
              </div>
            )}

            {!isUserCommand && transaction.feePayer && (
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Fee Payer</span>
                <HashLink hash={transaction.feePayer} type="account" />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {isUserCommand && transaction.amount && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Amount</span>
                <Amount value={transaction.amount} />
              </div>
            )}

            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Fee</span>
              <Amount value={transaction.fee} />
            </div>

            {isUserCommand && transaction.nonce !== undefined && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Nonce</span>
                <span className="font-mono">{transaction.nonce}</span>
              </div>
            )}

            {!isUserCommand && transaction.accountUpdates !== undefined && (
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Account Updates</span>
                <span className="font-mono">{transaction.accountUpdates}</span>
              </div>
            )}

            {transaction.memo && (
              <div className="flex flex-col gap-1 border-b border-border pb-2">
                <span className="text-muted-foreground">Memo</span>
                <span className="break-all text-sm">
                  {decodeMemo(transaction.memo) || '(empty)'}
                </span>
              </div>
            )}

            {transaction.failureReason && (
              <div className="flex flex-col gap-1 border-b border-border pb-2">
                <span className="text-muted-foreground">Failure Reason</span>
                <span className="text-sm text-destructive">
                  {transaction.failureReason}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
