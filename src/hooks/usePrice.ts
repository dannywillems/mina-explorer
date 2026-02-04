import { useState, useEffect } from 'react';
import { fetchCurrentPrice, type MINAPrice } from '@/services/api/price';

interface UsePriceResult {
  price: MINAPrice | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Auto-refresh interval (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function usePrice(): UsePriceResult {
  const [price, setPrice] = useState<MINAPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      const data = await fetchCurrentPrice();
      setPrice(data);
      setError(null);
    } catch (err) {
      // Don't overwrite existing price on error (stale data is better than none)
      if (!price) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch MINA price',
        );
      }
      console.warn('[Price] Failed to fetch MINA price:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { price, loading, error, refetch: fetchData };
}
