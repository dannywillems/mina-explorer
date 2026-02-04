import { useState, type ReactNode, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { isValidPublicKey, formatHash } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { useTopBlockProducers, useNetwork } from '@/hooks';
import { LoadingSpinner } from '@/components/common';

export function AccountsPage(): ReactNode {
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { network } = useNetwork();
  const {
    producers,
    loading: producersLoading,
    error: producersError,
  } = useTopBlockProducers(500, 10);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    const trimmed = publicKey.trim();

    if (!trimmed) {
      setError('Please enter a public key');
      return;
    }

    if (!isValidPublicKey(trimmed)) {
      setError(
        'Invalid public key format. Must start with B62 and be 55 characters.',
      );
      return;
    }

    setError(null);
    navigate(`/account/${trimmed}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Account Lookup</h1>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="mb-4 text-muted-foreground">
          Enter a Mina public key to view account details, balance, and zkApp
          state.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="publicKey"
              className="mb-2 block text-sm font-medium"
            >
              Public Key
            </label>
            <input
              type="text"
              id="publicKey"
              placeholder="B62q..."
              value={publicKey}
              onChange={e => {
                setPublicKey(e.target.value);
                setError(null);
              }}
              className={cn(
                'w-full rounded-md border bg-background px-3 py-2 font-mono text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                error ? 'border-destructive' : 'border-input',
              )}
            />
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
            <p className="mt-1 text-sm text-muted-foreground">
              Public keys start with B62 and are 55 characters long.
            </p>
          </div>
          <button
            type="submit"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Search size={16} />
            View Account
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Top Block Producers</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Most active block producers on {network.displayName} (last 500
            blocks)
          </p>
        </div>
        <div className="p-6">
          {producersLoading ? (
            <LoadingSpinner text="Loading top producers..." />
          ) : producersError ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {producersError}
            </div>
          ) : producers.length === 0 ? (
            <p className="text-muted-foreground">No block producers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Public Key</th>
                    <th className="px-4 py-3 text-right">Blocks Produced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {producers.map((producer, index) => (
                    <tr
                      key={producer.publicKey}
                      className="transition-colors hover:bg-accent/50"
                    >
                      <td className="px-4 py-3 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/account/${producer.publicKey}`}
                          className="font-mono text-primary hover:underline"
                        >
                          {formatHash(producer.publicKey, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {producer.blocksProduced}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
