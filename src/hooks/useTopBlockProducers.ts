import { useState, useEffect } from 'react';
import {
  fetchTopBlockProducers,
  type TopBlockProducer,
} from '@/services/api/blocks';
import { useNetwork } from './useNetwork';

interface UseTopBlockProducersResult {
  producers: TopBlockProducer[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTopBlockProducers(
  sampleSize: number = 500,
  topN: number = 10,
): UseTopBlockProducersResult {
  const [producers, setProducers] = useState<TopBlockProducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTopBlockProducers(sampleSize, topN);
      setProducers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch top producers',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [network.id, sampleSize, topN]);

  return { producers, loading, error, refetch: fetchData };
}
