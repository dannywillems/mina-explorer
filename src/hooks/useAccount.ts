import { useState, useEffect } from 'react';
import { fetchAccount } from '@/services/api/accounts';
import { useNetwork } from './useNetwork';
import type { Account } from '@/types';

interface UseAccountResult {
  account: Account | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAccount(publicKey: string | undefined): UseAccountResult {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  const fetchData = async (): Promise<void> => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAccount(publicKey);
      setAccount(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch account');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [publicKey, network.id]);

  return { account, loading, error, refetch: fetchData };
}
