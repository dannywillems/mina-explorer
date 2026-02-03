import { createContext, useContext, useState, type ReactNode } from 'react';
import { NETWORKS, DEFAULT_NETWORK, type NetworkConfig } from '@/config';
import { initClient, getClient } from '@/services/api';

interface NetworkContextValue {
  network: NetworkConfig;
  setNetwork: (networkId: string) => void;
  availableNetworks: NetworkConfig[];
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

// Initialize client immediately with default network
initClient(NETWORKS[DEFAULT_NETWORK].endpoint);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps): ReactNode {
  const [network, setNetworkState] = useState<NetworkConfig>(
    NETWORKS[DEFAULT_NETWORK],
  );

  const setNetwork = (networkId: string): void => {
    const newNetwork = NETWORKS[networkId];
    if (newNetwork) {
      setNetworkState(newNetwork);
      getClient().setEndpoint(newNetwork.endpoint);
    }
  };

  const availableNetworks = Object.values(NETWORKS);

  return (
    <NetworkContext.Provider value={{ network, setNetwork, availableNetworks }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
