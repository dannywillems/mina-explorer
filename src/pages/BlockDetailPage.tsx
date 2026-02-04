import type { ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useBlock } from '@/hooks';
import { BlockDetail } from '@/components/blocks';

export function BlockDetailPage(): ReactNode {
  const { identifier } = useParams<{ identifier: string }>();
  const { block, loading, error } = useBlock(identifier || '');

  return (
    <div className="space-y-4">
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight size={14} />
          <li>
            <Link to="/blocks" className="hover:text-foreground">
              Blocks
            </Link>
          </li>
          <ChevronRight size={14} />
          <li className="font-medium text-foreground">{identifier}</li>
        </ol>
      </nav>
      <BlockDetail block={block} loading={loading} error={error} />
    </div>
  );
}
