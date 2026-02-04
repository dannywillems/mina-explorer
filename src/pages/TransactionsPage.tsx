import type { ReactNode } from 'react';

export function TransactionsPage(): ReactNode {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="py-8 text-center">
          <h2 className="mb-3 text-xl font-semibold text-muted-foreground">
            Coming Soon
          </h2>
          <p className="mb-4 text-muted-foreground">
            Transaction explorer is under development. Check back soon for the
            ability to browse and search transactions on the Mina network.
          </p>
          <p className="text-sm text-muted-foreground">
            In the meantime, you can view transactions within block details or
            search for specific transaction hashes.
          </p>
        </div>
      </div>
    </div>
  );
}
