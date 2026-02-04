import { useState, type ReactNode, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isValidPublicKey, formatHash } from '@/utils/formatters';

// Notable accounts / whales for easy access
const NOTABLE_ACCOUNTS = [
  {
    name: 'Mina Foundation',
    publicKey: 'B62qnLVz8wM7MfJsuYbjFf4UWbwrUBEL5ZdawExxxHvXL3nwGA8uK94',
  },
  {
    name: 'o1Labs',
    publicKey: 'B62qiy32p8kAKnny8ZFwoMhYpBppM1DWVCqAPBYNcXnsAHhnfAAuXgg',
  },
  {
    name: 'Auro Wallet',
    publicKey: 'B62qjsV6WQwTeEWrNrRRBP6VaaLvQhwWTnFi4WP4LQjGvpfZEumXzxb',
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
    <div>
      <h2 className="mb-4">Account Lookup</h2>
      <div className="card">
        <div className="card-body">
          <p className="text-muted mb-4">
            Enter a Mina public key to view account details, balance, and zkApp
            state.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="publicKey" className="form-label">
                Public Key
              </label>
              <input
                type="text"
                className={`form-control font-monospace ${error ? 'is-invalid' : ''}`}
                id="publicKey"
                placeholder="B62q..."
                value={publicKey}
                onChange={e => {
                  setPublicKey(e.target.value);
                  setError(null);
                }}
              />
              {error && <div className="invalid-feedback">{error}</div>}
              <div className="form-text">
                Public keys start with B62 and are 55 characters long.
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              View Account
            </button>
          </form>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="mb-0">Notable Accounts</h5>
        </div>
        <div className="card-body">
          <p className="text-muted mb-3">
            Quick links to notable Mina accounts and whales.
          </p>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Public Key</th>
                </tr>
              </thead>
              <tbody>
                {NOTABLE_ACCOUNTS.map(account => (
                  <tr key={account.publicKey}>
                    <td className="fw-medium">{account.name}</td>
                    <td>
                      <Link
                        to={`/account/${account.publicKey}`}
                        className="font-monospace"
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
