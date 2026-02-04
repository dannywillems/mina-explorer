import type { ReactNode } from 'react';

export function TransactionsPage(): ReactNode {
  return (
    <div>
      <h2 className="mb-4">Transactions</h2>
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <h4 className="text-muted mb-3">Coming Soon</h4>
            <p className="text-muted">
              Transaction explorer is under development. Check back soon for the
              ability to browse and search transactions on the Mina network.
            </p>
            <p className="text-muted small">
              In the meantime, you can view transactions within block details or
              search for specific transaction hashes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
