import type { ReactNode } from 'react';
import { useNetworkState, useNetwork } from '@/hooks';
import { formatNumber } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common';

export function NetworkStats(): ReactNode {
  const { networkState, loading, error } = useNetworkState();
  const { network } = useNetwork();

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <LoadingSpinner size="sm" text="Loading network stats..." />
        </div>
      </div>
    );
  }

  if (error || !networkState) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger mb-0" role="alert">
            Failed to load network stats
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted mb-1">Network</div>
            <h4 className="mb-0">
              {network.displayName}
              {network.isTestnet && (
                <span className="ms-2 badge bg-warning text-dark fs-6">
                  Testnet
                </span>
              )}
            </h4>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted mb-1">Block Height</div>
            <h4 className="mb-0 font-monospace">
              {formatNumber(
                networkState.maxBlockHeight.canonicalMaxBlockHeight,
              )}
            </h4>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted mb-1">Pending Height</div>
            <h4 className="mb-0 font-monospace">
              {formatNumber(networkState.maxBlockHeight.pendingMaxBlockHeight)}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}
