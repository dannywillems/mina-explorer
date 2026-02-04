import { useState, type ReactNode, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidPublicKey } from '@/utils/formatters';

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
    </div>
  );
}
