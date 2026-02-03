import type { ReactNode } from 'react';
import { HashLink, Amount, LoadingSpinner } from '@/components/common';
import { formatDateTime, formatNumber } from '@/utils/formatters';
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
  if (loading) {
    return <LoadingSpinner text="Loading block..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (!block) {
    return (
      <div className="alert alert-warning" role="alert">
        Block not found.
      </div>
    );
  }

  return (
    <div>
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-box me-2"></i>
            Block #{formatNumber(block.blockHeight)}
          </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th className="text-muted" style={{ width: '40%' }}>
                      Block Height
                    </th>
                    <td className="font-monospace">
                      {formatNumber(block.blockHeight)}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-muted">State Hash</th>
                    <td>
                      <span
                        className="font-monospace text-break"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {block.stateHash}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <th className="text-muted">Timestamp</th>
                    <td>{formatDateTime(block.dateTime)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th className="text-muted" style={{ width: '40%' }}>
                      Block Producer
                    </th>
                    <td>
                      <HashLink hash={block.creator} type="account" />
                    </td>
                  </tr>
                  <tr>
                    <th className="text-muted">Coinbase Reward</th>
                    <td>
                      <Amount value={block.transactions?.coinbase || '0'} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Transaction details are not available in this API. Use the events and
        actions queries for zkApp data.
      </div>
    </div>
  );
}
