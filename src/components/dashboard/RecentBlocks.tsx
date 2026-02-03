import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useBlocks } from '@/hooks';
import { HashLink, TimeAgo, Amount, LoadingSpinner } from '@/components/common';
import { formatNumber } from '@/utils/formatters';

export function RecentBlocks(): ReactNode {
  const { blocks, loading, error, refresh } = useBlocks(10);

  return (
    <div className="card h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-boxes me-2"></i>
          Recent Blocks
        </h5>
        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={refresh}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <Link to="/blocks" className="btn btn-sm btn-primary">
            View All
          </Link>
        </div>
      </div>
      <div className="card-body p-0">
        {loading ? (
          <LoadingSpinner text="Loading blocks..." />
        ) : error ? (
          <div className="alert alert-danger m-3" role="alert">
            {error}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Height</th>
                  <th>Producer</th>
                  <th className="text-end">Coinbase</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map(block => (
                  <tr key={block.stateHash}>
                    <td>
                      <Link
                        to={`/block/${block.blockHeight}`}
                        className="fw-semibold"
                      >
                        {formatNumber(block.blockHeight)}
                      </Link>
                    </td>
                    <td>
                      <HashLink
                        hash={block.creator}
                        type="account"
                        prefixLength={6}
                      />
                    </td>
                    <td className="text-end">
                      <Amount value={block.coinbase || '0'} />
                    </td>
                    <td>
                      <TimeAgo dateTime={block.dateTime} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
