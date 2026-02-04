import { createContext, useContext, useState, type ReactNode } from 'react';
import { NETWORKS, DEFAULT_NETWORK, type NetworkConfig } from '@/config';
import { initClient, getClient } from '@/services/api';

const CUSTOM_ENDPOINT_KEY = 'mina-explorer-custom-endpoint';
const NETWORK_KEY = 'mina-explorer-network';

interface NetworkContextValue {
  network: NetworkConfig;
  setNetwork: (networkId: string) => void;
  availableNetworks: NetworkConfig[];
  customEndpoint: string | null;
  setCustomEndpoint: (endpoint: string | null) => void;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

function getInitialEndpoint(): {
  network: NetworkConfig;
  customEndpoint: string | null;
} {
  // Check for custom endpoint first
  const savedCustom = localStorage.getItem(CUSTOM_ENDPOINT_KEY);
  if (savedCustom) {
    return {
      network: {
        id: 'custom',
        name: 'custom',
        displayName: 'Custom',
        endpoint: savedCustom,
        isTestnet: true,
      },
      customEndpoint: savedCustom,
    };
  }

  // Check for saved network selection
  const savedNetwork = localStorage.getItem(NETWORK_KEY);
  if (savedNetwork && NETWORKS[savedNetwork]) {
    return {
      network: NETWORKS[savedNetwork],
      customEndpoint: null,
    };
  }

  return {
    network: NETWORKS[DEFAULT_NETWORK],
    customEndpoint: null,
  };
}

// Initialize client immediately with default or saved custom endpoint
const initial = getInitialEndpoint();
initClient(initial.network.endpoint);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps): ReactNode {
  const [network, setNetworkState] = useState<NetworkConfig>(initial.network);
  const [customEndpoint, setCustomEndpointState] = useState<string | null>(
    initial.customEndpoint,
  );

  const setNetwork = (networkId: string): void => {
    const newNetwork = NETWORKS[networkId];
    if (newNetwork) {
      setNetworkState(newNetwork);
      setCustomEndpointState(null);
      localStorage.removeItem(CUSTOM_ENDPOINT_KEY);
      localStorage.setItem(NETWORK_KEY, networkId);
      getClient().setEndpoint(newNetwork.endpoint);
    }
  };

  const setCustomEndpoint = (endpoint: string | null): void => {
    if (endpoint) {
      const customNetwork: NetworkConfig = {
        id: 'custom',
        name: 'custom',
        displayName: 'Custom',
        endpoint: endpoint,
        isTestnet: true,
      };
      setNetworkState(customNetwork);
      setCustomEndpointState(endpoint);
      localStorage.setItem(CUSTOM_ENDPOINT_KEY, endpoint);
      getClient().setEndpoint(endpoint);
    } else {
      setCustomEndpointState(null);
      localStorage.removeItem(CUSTOM_ENDPOINT_KEY);
      setNetwork(DEFAULT_NETWORK);
    }
  };

  const availableNetworks = Object.values(NETWORKS);

  return (
    <NetworkContext.Provider
      value={{
        network,
        setNetwork,
        availableNetworks,
        customEndpoint,
        setCustomEndpoint,
      }}
    >
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
