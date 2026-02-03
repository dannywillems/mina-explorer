import { NETWORKS, DEFAULT_NETWORK } from './networks';

export const config = {
  apiEndpoint:
    import.meta.env.VITE_API_ENDPOINT || NETWORKS[DEFAULT_NETWORK].endpoint,
  defaultNetwork: import.meta.env.VITE_DEFAULT_NETWORK || DEFAULT_NETWORK,
};

export { NETWORKS, DEFAULT_NETWORK } from './networks';
export type { NetworkConfig } from './networks';
