import type { ReactNode } from 'react';
import { formatMina } from '@/utils/formatters';
import { cn } from '@/lib/utils';

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
    <span className={cn('font-mono tabular-nums', className)}>
      {formatted} {symbol}
    </span>
  );
}
