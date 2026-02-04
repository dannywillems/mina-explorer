import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { usePrice } from '@/hooks';
import { cn } from '@/lib/utils';

export function PriceDisplay(): ReactNode {
  const { price, loading, error } = usePrice();

  if (loading && !price) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="animate-pulse">MINA: --</span>
      </div>
    );
  }

  if (error && !price) {
    return null; // Don't show anything if we can't fetch price
  }

  if (!price) {
    return null;
  }

  const change = price.usd_24h_change;
  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;

  return (
    <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1 text-sm">
      <span className="font-medium">MINA</span>
      <span className="font-mono">
        $
        {price.usd.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })}
      </span>
      {change !== null && (
        <span
          className={cn(
            'flex items-center gap-0.5 text-xs',
            isPositive && 'text-green-600 dark:text-green-400',
            isNegative && 'text-red-600 dark:text-red-400',
            !isPositive && !isNegative && 'text-muted-foreground',
          )}
        >
          {isPositive && <TrendingUp size={12} />}
          {isNegative && <TrendingDown size={12} />}
          {!isPositive && !isNegative && <Minus size={12} />}
          {Math.abs(change).toFixed(1)}%
        </span>
      )}
    </div>
  );
}
