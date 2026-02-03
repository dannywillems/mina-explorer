import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { formatHash, formatAddress } from '@/utils/formatters';

interface HashLinkProps {
  hash: string;
  type: 'block' | 'transaction' | 'account';
  truncate?: boolean;
  prefixLength?: number;
}

export function HashLink({
  hash,
  type,
  truncate = true,
  prefixLength = 8,
}: HashLinkProps): ReactNode {
  const pathMap = {
    block: `/block/${hash}`,
    transaction: `/tx/${hash}`,
    account: `/account/${hash}`,
  };

  const displayText =
    truncate && type === 'account'
      ? formatAddress(hash, prefixLength)
      : truncate
        ? formatHash(hash, prefixLength)
        : hash;

  return (
    <Link to={pathMap[type]} className="font-monospace text-decoration-none">
      {displayText}
    </Link>
  );
}
