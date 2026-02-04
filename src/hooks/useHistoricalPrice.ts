import { useState, useEffect } from 'react';
import {
  fetchHistoricalPrice,
  type HistoricalPrice,
} from '@/services/api/price';

interface UseHistoricalPriceResult {
  price: HistoricalPrice | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch historical MINA price for a specific date
 * @param date ISO date string (e.g., "2024-01-15T12:30:00Z") or Date object
 */
export function useHistoricalPrice(
  date: string | Date | null | undefined,
): UseHistoricalPriceResult {
  const [price, setPrice] = useState<HistoricalPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setPrice(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        // Don't fetch historical price for dates in the future or very recent
        const now = new Date();
        const daysDiff =
          (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24);

        // If transaction is less than 1 day old, don't fetch historical
        // (current price is close enough)
        if (daysDiff < 1) {
          setPrice(null);
          setLoading(false);
          return;
        }

        const data = await fetchHistoricalPrice(dateObj);
        setPrice(data);
      } catch (err) {
        console.warn('[HistoricalPrice] Failed to fetch:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch historical price',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return { price, loading, error };
}
