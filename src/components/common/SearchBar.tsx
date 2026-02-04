import { useState, type FormEvent, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '@/hooks';
import { cn } from '@/lib/utils';

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
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="flex">
        <input
          type="text"
          className={cn(
            'h-9 w-full min-w-[200px] rounded-l-md border border-r-0 border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
            error && 'border-destructive focus:ring-destructive',
          )}
          placeholder={placeholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setError(null);
          }}
        />
        <button
          className="inline-flex h-9 items-center gap-2 rounded-r-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          type="submit"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      )}
    </form>
  );
}
