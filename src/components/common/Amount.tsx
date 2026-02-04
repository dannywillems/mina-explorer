import type { ReactNode } from 'react';
import { formatMina } from '@/utils/formatters';
import { usePrice } from '@/hooks';
import { convertToFiat, formatFiatValue } from '@/services/api/price';
import { cn } from '@/lib/utils';

interface AmountProps {
  value: string | number;
  symbol?: string;
  className?: string;
  showFiat?: boolean;
}

export function Amount({
  value,
  symbol = 'MINA',
  className = '',
  showFiat = false,
}: AmountProps): ReactNode {
  const { price } = usePrice();
  const formatted = formatMina(value);

  // Calculate fiat value if requested and price is available
  let fiatDisplay: string | null = null;
  if (showFiat && price) {
    const valueStr = typeof value === 'number' ? value.toString() : value;
    const { usd } = convertToFiat(valueStr, price.usd, price.eur);
    if (usd >= 0.01) {
      fiatDisplay = formatFiatValue(usd, 'USD');
    }
  }

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatted} {symbol}
      {fiatDisplay && (
        <span className="ml-1 text-muted-foreground">({fiatDisplay})</span>
      )}
    </span>
  );
}
