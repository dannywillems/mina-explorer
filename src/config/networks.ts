export interface NetworkConfig {
  id: string;
  name: string;
  displayName: string;
  endpoint: string;
  isTestnet: boolean;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mesa: {
    id: 'mesa',
    name: 'mesa',
    displayName: 'Mesa',
    endpoint: 'https://mesa-archive-node-api.gcp.o1test.net',
    isTestnet: true,
  },
  devnet: {
    id: 'devnet',
    name: 'devnet',
    displayName: 'Devnet',
    endpoint: 'https://devnet-archive-node-api.gcp.o1test.net',
    isTestnet: true,
  },
  mainnet: {
    id: 'mainnet',
    name: 'mainnet',
    displayName: 'Mainnet',
    endpoint: 'https://archive-node-api.gcp.o1test.net',
    isTestnet: false,
  },
};

export const DEFAULT_NETWORK = 'mesa';
