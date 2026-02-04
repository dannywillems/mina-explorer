import { useState, type ReactNode, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { isValidPublicKey, formatHash } from '@/utils/formatters';
import { cn } from '@/lib/utils';

// Notable accounts / whales for easy access (mainnet)
const NOTABLE_ACCOUNTS = [
  {
    name: 'o1Labs',
    publicKey: 'B62qiy32p8kAKnny8ZFwoMhYpBppM1DWVCqAPBYNcXnsAHhnfAAuXgg',
  },
  {
    name: 'Binance',
    publicKey: 'B62qrRvo5wngd5WA1dgXkQpCdQMRDndusmjfWXWT1LgsSFFdBS9RCsV',
  },
  {
    name: 'Coinbase',
    publicKey: 'B62qpge4uMq4Vv5Rvc8Gw9qSquUYd6xoW1pz7HQkMSHm6h1o7pvLPAN',
  },
];

export function AccountsPage(): ReactNode {
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
          <h2 className="font-semibold">Notable Accounts</h2>
        </div>
        <div className="p-6">
          <p className="mb-4 text-muted-foreground">
            Quick links to notable Mina accounts and whales.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Public Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {NOTABLE_ACCOUNTS.map(account => (
                  <tr
                    key={account.publicKey}
                    className="transition-colors hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 font-medium">{account.name}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/account/${account.publicKey}`}
                        className="font-mono text-primary hover:underline"
                      >
                        {formatHash(account.publicKey, 8)}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
