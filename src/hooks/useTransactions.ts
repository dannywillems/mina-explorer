import { useState, useEffect } from 'react';
import {
  fetchPendingTransactions,
  fetchPendingZkAppCommands,
  type PendingTransaction,
  type PendingZkAppCommand,
} from '@/services/api/transactions';
import { useNetwork } from './useNetwork';

interface UsePendingTransactionsResult {
  transactions: PendingTransaction[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UsePendingZkAppCommandsResult {
  commands: PendingZkAppCommand[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePendingTransactions(): UsePendingTransactionsResult {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPendingTransactions();
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch transactions',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [network.id]);

  return { transactions, loading, error, refetch: fetchData };
}

export function usePendingZkAppCommands(): UsePendingZkAppCommandsResult {
  const [commands, setCommands] = useState<PendingZkAppCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPendingZkAppCommands();
      setCommands(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch zkApp commands',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [network.id]);

  return { commands, loading, error, refetch: fetchData };
}
