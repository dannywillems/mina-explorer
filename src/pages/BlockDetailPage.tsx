import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlock } from '@/hooks';
import { BlockDetail } from '@/components/blocks';

export function BlockDetailPage(): ReactNode {
  const { identifier } = useParams<{ identifier: string }>();
  const { block, loading, error } = useBlock(identifier || '');

  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/blocks">Blocks</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {identifier}
          </li>
        </ol>
      </nav>
      <BlockDetail block={block} loading={loading} error={error} />
    </div>
  );
}
