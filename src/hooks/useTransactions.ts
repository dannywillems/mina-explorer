import { useState, useEffect, useCallback } from 'react';
import {
  fetchPendingTransactions,
  fetchPendingZkAppCommands,
  fetchTransactionByHash,
  fetchAccountTransactions,
  fetchTransactionsPaginated,
  type PendingTransaction,
  type PendingZkAppCommand,
  type TransactionDetail,
  type AccountTransaction,
  type ConfirmedTransaction,
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

interface UseTransactionResult {
  transaction: TransactionDetail | null;
  loading: boolean;
  error: string | null;
}

export function useTransaction(hash: string): UseTransactionResult {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  useEffect(() => {
    if (!hash) {
      setTransaction(null);
      setLoading(false);
      return;
    }

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTransactionByHash(hash);
        if (!data) {
          setError('Transaction not found');
        }
        setTransaction(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch transaction',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hash, network.id]);

  return { transaction, loading, error };
}

interface UseAccountTransactionsResult {
  transactions: AccountTransaction[];
  loading: boolean;
  error: string | null;
}

export function useAccountTransactions(
  publicKey: string,
): UseAccountTransactionsResult {
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { network } = useNetwork();

  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAccountTransactions(publicKey);
        setTransactions(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch account transactions',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey, network.id]);

  return { transactions, loading, error };
}

interface UsePaginatedTransactionsResult {
  transactions: ConfirmedTransaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalBlockHeight: number;
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

export function usePaginatedTransactions(
  blocksPerPage: number = 50,
): UsePaginatedTransactionsResult {
  const { network } = useNetwork();
  const [transactions, setTransactions] = useState<ConfirmedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalBlockHeight, setTotalBlockHeight] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalBlockHeight / blocksPerPage));

  const loadPage = useCallback(
    async (pageNum: number, forceRefresh: boolean = false) => {
      setLoading(true);
      setError(null);

      try {
        let cursor: number | undefined;
        if (pageNum > 1 && totalBlockHeight > 0) {
          cursor = totalBlockHeight - (pageNum - 1) * blocksPerPage + 1;
          if (cursor <= 0) cursor = undefined;
        }

        const data = await fetchTransactionsPaginated(blocksPerPage, cursor);
        setTransactions(data.transactions);
        setHasMore(data.hasMore);

        if (pageNum === 1 || forceRefresh || totalBlockHeight === 0) {
          setTotalBlockHeight(data.totalBlockHeight);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch transactions',
        );
      } finally {
        setLoading(false);
      }
    },
    [blocksPerPage, totalBlockHeight],
  );

  // Reset and load when network changes
  useEffect(() => {
    setPage(1);
    setTotalBlockHeight(0);
    loadPage(1, true);
  }, [network.id, blocksPerPage]);

  // Load page when page number changes
  useEffect(() => {
    if (totalBlockHeight > 0) {
      loadPage(page);
    }
  }, [page, totalBlockHeight]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);

  const refresh = useCallback(() => {
    setPage(1);
    loadPage(1, true);
  }, [loadPage]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    totalBlockHeight,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
}
