import { useState, type ReactNode } from 'react';
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
  const [showJson, setShowJson] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Loading block..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
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
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Block #{formatNumber(block.blockHeight)}</h5>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? 'Hide JSON' : 'View JSON'}
          </button>
        </div>
        <div className="card-body">
          {showJson ? (
            <pre
              className="bg-dark text-light p-3 rounded"
              style={{
                maxHeight: '600px',
                overflow: 'auto',
                fontSize: '0.8rem',
              }}
            >
              {JSON.stringify(block, null, 2)}
            </pre>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <table className="table table-borderless table-sm">
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
                          style={{ fontSize: '0.8rem' }}
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
                <table className="table table-borderless table-sm">
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
          )}
        </div>
      </div>
    </div>
  );
}
