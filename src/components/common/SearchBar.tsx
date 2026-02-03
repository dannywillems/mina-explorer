import { useState, type FormEvent, type ReactNode } from 'react';
import { useSearch } from '@/hooks';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search by block height or state hash...',
  className = '',
}: SearchBarProps): ReactNode {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { search, parseQuery } = useSearch();

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setError(null);

    const result = parseQuery(query);
    if (result.type === 'unknown') {
      setError('Invalid search query. Enter a block height or state hash.');
      return;
    }

    search(query);
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="input-group">
        <input
          type="text"
          className={`form-control ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setError(null);
          }}
        />
        <button className="btn btn-primary" type="submit">
          <i className="bi bi-search"></i>
        </button>
      </div>
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </form>
  );
}
