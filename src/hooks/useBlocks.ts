import { useState, useEffect, useCallback } from 'react';
import {
  fetchBlocks,
  fetchBlockByHeight,
  fetchBlockByHash,
  fetchNetworkState,
} from '@/services/api';
import { useNetwork } from './useNetwork';
import type { BlockSummary, BlockDetail, NetworkState } from '@/types';

interface UseBlocksResult {
  blocks: BlockSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useBlocks(limit: number = 25): UseBlocksResult {
  const { network } = useNetwork();
  const [blocks, setBlocks] = useState<BlockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlocks(limit);
      setBlocks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Refetch when network changes
  useEffect(() => {
    loadBlocks();
  }, [loadBlocks, network.id]);

  return { blocks, loading, error, refresh: loadBlocks };
}

interface UseBlockResult {
  block: BlockDetail | null;
  loading: boolean;
  error: string | null;
}

export function useBlock(identifier: string | number): UseBlockResult {
  const { network } = useNetwork();
  const [block, setBlock] = useState<BlockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlock = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        let data: BlockDetail | null;
        if (
          typeof identifier === 'number' ||
          /^\d+$/.test(String(identifier))
        ) {
          data = await fetchBlockByHeight(Number(identifier));
        } else {
          data = await fetchBlockByHash(String(identifier));
        }
        setBlock(data);
        if (!data) {
          setError('Block not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch block');
      } finally {
        setLoading(false);
      }
    };

    loadBlock();
  }, [identifier, network.id]);

  return { block, loading, error };
}

interface UseNetworkStateResult {
  networkState: NetworkState | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNetworkState(): UseNetworkStateResult {
  const { network } = useNetwork();
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNetworkState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNetworkState();
      setNetworkState(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch network state',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch when network changes
  useEffect(() => {
    loadNetworkState();
  }, [loadNetworkState, network.id]);

  return { networkState, loading, error, refresh: loadNetworkState };
}
