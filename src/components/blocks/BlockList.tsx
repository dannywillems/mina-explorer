import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HashLink, TimeAgo, Amount, LoadingSpinner } from '@/components/common';
import { formatNumber } from '@/utils/formatters';
import type { BlockSummary } from '@/types';

interface BlockListProps {
  blocks: BlockSummary[];
  loading: boolean;
  error: string | null;
}

export function BlockList({
  blocks,
  loading,
  error,
}: BlockListProps): ReactNode {
  if (loading) {
    return <LoadingSpinner text="Loading blocks..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No blocks found.
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Height</th>
            <th>State Hash</th>
            <th>Block Producer</th>
            <th>Time</th>
            <th className="text-end">Coinbase</th>
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
                <HashLink hash={block.stateHash} type="block" />
              </td>
              <td>
                <HashLink hash={block.creator} type="account" />
              </td>
              <td>
                <TimeAgo dateTime={block.dateTime} />
              </td>
              <td className="text-end">
                <Amount value={block.coinbase || '0'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
