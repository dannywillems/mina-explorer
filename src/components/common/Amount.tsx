import type { ReactNode } from 'react';
import { formatMina } from '@/utils/formatters';
import { usePrice, useHistoricalPrice } from '@/hooks';
import { convertToFiat, formatFiatValue } from '@/services/api/price';
import { cn } from '@/lib/utils';

interface AmountProps {
  value: string | number;
  symbol?: string;
  className?: string;
  showFiat?: boolean;
  /**
   * Transaction date for historical price lookup.
   * When provided, shows the value at transaction time instead of current price.
   */
  transactionDate?: string | Date | null | undefined;
}

export function Amount({
  value,
  symbol = 'MINA',
  className = '',
  showFiat = false,
  transactionDate,
}: AmountProps): ReactNode {
  const { price: currentPrice } = usePrice();
  const { price: historicalPrice, loading: historicalLoading } =
    useHistoricalPrice(showFiat ? transactionDate : null);

  const formatted = formatMina(value);

  // Determine which price to use
  // If we have a transaction date and historical price, use that
  // Otherwise fall back to current price
  const effectivePrice = historicalPrice
    ? { usd: historicalPrice.usd, eur: historicalPrice.eur }
    : currentPrice
      ? { usd: currentPrice.usd, eur: currentPrice.eur }
      : null;

  const isHistorical = !!historicalPrice;

  // Calculate fiat value if requested and price is available
  let fiatDisplay: string | null = null;
  if (showFiat && effectivePrice) {
    const valueStr = typeof value === 'number' ? value.toString() : value;
    const { usd } = convertToFiat(
      valueStr,
      effectivePrice.usd,
      effectivePrice.eur,
    );
    if (usd >= 0.01) {
      fiatDisplay = formatFiatValue(usd, 'USD');
    }
  }

  return (
    <span className={cn('font-mono tabular-nums', className)}>
      {formatted} {symbol}
      {showFiat && historicalLoading && (
        <span className="ml-1 text-muted-foreground">(loading...)</span>
      )}
      {fiatDisplay && !historicalLoading && (
        <span
          className="ml-1 text-muted-foreground"
          title={
            isHistorical
              ? `Value at transaction time (${historicalPrice?.date})`
              : 'Current value'
          }
        >
          ({fiatDisplay}
          {isHistorical && <span className="text-xs"> at tx time</span>})
        </span>
      )}
    </span>
  );
}
