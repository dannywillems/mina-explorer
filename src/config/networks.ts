export interface NetworkConfig {
  id: string;
  name: string;
  displayName: string;
  /** Archive node GraphQL endpoint for historical data (blocks, transactions) */
  archiveEndpoint: string;
  /** Mina daemon GraphQL endpoint for real-time account data */
  daemonEndpoint: string;
  isTestnet: boolean;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mesa: {
    id: 'mesa',
    name: 'mesa',
    displayName: 'Mesa',
    archiveEndpoint: 'https://mesa-archive-node-api.gcp.o1test.net',
    // Mesa uses devnet daemon for now (no dedicated mesa daemon endpoint)
    daemonEndpoint: 'https://devnet-plain-1.gcp.o1test.net/graphql',
    isTestnet: true,
  },
  devnet: {
    id: 'devnet',
    name: 'devnet',
    displayName: 'Devnet',
    archiveEndpoint: 'https://devnet-archive-node-api.gcp.o1test.net',
    daemonEndpoint: 'https://devnet-plain-1.gcp.o1test.net/graphql',
    isTestnet: true,
  },
  mainnet: {
    id: 'mainnet',
    name: 'mainnet',
    displayName: 'Mainnet',
    archiveEndpoint: 'https://archive-node-api.gcp.o1test.net',
    daemonEndpoint: 'https://mainnet-plain-1.gcp.o1test.net/graphql',
    isTestnet: false,
  },
};

export const DEFAULT_NETWORK = 'mesa';
