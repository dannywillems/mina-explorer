import type { ReactNode } from 'react';
import { useBlocks } from '@/hooks';
import { BlockList } from '@/components/blocks';

export function BlocksPage(): ReactNode {
  const { blocks, loading, error, refresh } = useBlocks(50);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-boxes me-2"></i>
          Blocks
        </h2>
        <button
          className="btn btn-outline-secondary"
          onClick={refresh}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
      <BlockList blocks={blocks} loading={loading} error={error} />
    </div>
  );
}
