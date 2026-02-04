import { useState, type ReactNode } from 'react';
import { useNetwork } from '@/hooks';

export function NetworkSelector(): ReactNode {
  const {
    network,
    setNetwork,
    availableNetworks,
    customEndpoint,
    setCustomEndpoint,
  } = useNetwork();
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [inputValue, setInputValue] = useState(customEndpoint || '');

  const handleCustomSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCustomEndpoint(inputValue.trim());
      setShowCustomInput(false);
    }
  };

  const handleClearCustom = (): void => {
    setCustomEndpoint(null);
    setInputValue('');
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {network.displayName}
        {network.isTestnet && (
          <span className="ms-1 badge bg-warning text-dark">Testnet</span>
        )}
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end"
        style={{ minWidth: '300px' }}
      >
        {availableNetworks.map(net => (
          <li key={net.id}>
            <button
              className={`dropdown-item ${net.id === network.id && !customEndpoint ? 'active' : ''}`}
              onClick={() => setNetwork(net.id)}
            >
              {net.displayName}
              {net.isTestnet && (
                <span className="ms-1 badge bg-warning text-dark">Testnet</span>
              )}
            </button>
          </li>
        ))}
        <li>
          <hr className="dropdown-divider" />
        </li>
        {customEndpoint && (
          <li>
            <div className="dropdown-item-text">
              <div className="d-flex justify-content-between align-items-center">
                <small
                  className="text-muted text-truncate"
                  style={{ maxWidth: '200px' }}
                >
                  {customEndpoint}
                </small>
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={handleClearCustom}
                >
                  Clear
                </button>
              </div>
            </div>
          </li>
        )}
        <li>
          {showCustomInput ? (
            <div className="dropdown-item-text">
              <form onSubmit={handleCustomSubmit}>
                <div className="input-group input-group-sm">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://archive-node.example.com"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    autoFocus
                  />
                  <button className="btn btn-primary" type="submit">
                    Set
                  </button>
                </div>
                <small className="text-muted mt-1 d-block">
                  Enter GraphQL endpoint URL
                </small>
              </form>
            </div>
          ) : (
            <button
              className="dropdown-item"
              onClick={e => {
                e.stopPropagation();
                setShowCustomInput(true);
              }}
            >
              Custom Endpoint...
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}
