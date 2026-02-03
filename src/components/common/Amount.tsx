import type { ReactNode } from 'react';
import { formatMina } from '@/utils/formatters';

interface AmountProps {
  value: string | number;
  symbol?: string;
  className?: string;
}

export function Amount({
  value,
  symbol = 'MINA',
  className = '',
}: AmountProps): ReactNode {
  const formatted = formatMina(value);

  return (
    <span className={`font-monospace ${className}`}>
      {formatted} {symbol}
    </span>
  );
}
