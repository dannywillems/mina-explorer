import type { ReactNode } from 'react';
import { useNetworkState, useNetwork, useBlocks } from '@/hooks';
import { formatNumber } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common';

// Mina has 7140 slots per epoch
const SLOTS_PER_EPOCH = 7140;

export function NetworkStats(): ReactNode {
  const { networkState, loading, error } = useNetworkState();
  const { network } = useNetwork();
  const { blocks } = useBlocks(1);

  // Get epoch info from the latest block
  const latestBlock = blocks?.[0];
  const epoch = latestBlock?.epoch;
  const slot = latestBlock?.slot;
  const slotProgress = slot
    ? ((slot / SLOTS_PER_EPOCH) * 100).toFixed(1)
    : null;

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
      <div className="col-6 col-md-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted small mb-1">Network</div>
            <h5 className="mb-0">
              {network.displayName}
              {network.isTestnet && (
                <span
                  className="ms-2 badge bg-warning text-dark"
                  style={{ fontSize: '0.6rem' }}
                >
                  Testnet
                </span>
              )}
            </h5>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted small mb-1">Block Height</div>
            <h5 className="mb-0 font-monospace text-primary">
              {formatNumber(
                networkState.maxBlockHeight.canonicalMaxBlockHeight,
              )}
            </h5>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted small mb-1">Epoch</div>
            <h5 className="mb-0 font-monospace text-primary">
              {epoch !== undefined ? formatNumber(epoch) : '-'}
            </h5>
            {slot !== undefined && slotProgress && (
              <div className="mt-2">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${slotProgress}%` }}
                    aria-valuenow={parseFloat(slotProgress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <small className="text-muted">
                  {formatNumber(slot)} / {formatNumber(SLOTS_PER_EPOCH)} slots
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="card h-100">
          <div className="card-body text-center">
            <div className="text-muted small mb-1">Pending Height</div>
            <h5 className="mb-0 font-monospace">
              {formatNumber(networkState.maxBlockHeight.pendingMaxBlockHeight)}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
}
