import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isValidBlockHash,
  isBlockHeight,
  isValidPublicKey,
} from '@/utils/formatters';

type SearchType = 'block' | 'account' | 'unknown';

interface SearchResult {
  type: SearchType;
  path: string;
}

export function useSearch(): {
  search: (query: string) => void;
  parseQuery: (query: string) => SearchResult;
} {
  const navigate = useNavigate();

  const parseQuery = useCallback((query: string): SearchResult => {
    const trimmed = query.trim();

    if (isBlockHeight(trimmed)) {
      return { type: 'block', path: `/block/${trimmed}` };
    }

    if (isValidBlockHash(trimmed)) {
      return { type: 'block', path: `/block/${trimmed}` };
    }

    if (isValidPublicKey(trimmed)) {
      return { type: 'account', path: `/account/${trimmed}` };
    }

    return { type: 'unknown', path: '' };
  }, []);

  const search = useCallback(
    (query: string): void => {
      const result = parseQuery(query);
      if (result.type !== 'unknown' && result.path) {
        navigate(result.path);
      }
    },
    [navigate, parseQuery],
  );

  return { search, parseQuery };
}
