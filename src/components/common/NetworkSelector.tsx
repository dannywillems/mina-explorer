import type { ReactNode } from 'react';
import { useNetwork } from '@/hooks';

export function NetworkSelector(): ReactNode {
  const { network, setNetwork, availableNetworks } = useNetwork();

  if (availableNetworks.length <= 1) {
    return (
      <span className="badge bg-secondary">
        {network.displayName}
        {network.isTestnet && (
          <span className="ms-1 badge bg-warning text-dark">Testnet</span>
        )}
      </span>
    );
  }

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
      <ul className="dropdown-menu">
        {availableNetworks.map(net => (
          <li key={net.id}>
            <button
              className={`dropdown-item ${net.id === network.id ? 'active' : ''}`}
              onClick={() => setNetwork(net.id)}
            >
              {net.displayName}
              {net.isTestnet && (
                <span className="ms-1 badge bg-warning text-dark">Testnet</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
