import { NETWORKS, DEFAULT_NETWORK } from '@/config';

const NETWORK_KEY = 'mina-explorer-network';

function getDaemonEndpoint(): string {
  const savedNetwork = localStorage.getItem(NETWORK_KEY);
  const networkId =
    savedNetwork && NETWORKS[savedNetwork] ? savedNetwork : DEFAULT_NETWORK;
  return NETWORKS[networkId].daemonEndpoint;
}

export interface PendingTransaction {
  hash: string;
  kind: string;
  amount: string;
  fee: string;
  from: string;
  to: string;
  memo: string;
  nonce: number;
}

export interface PendingZkAppCommand {
  hash: string;
  feePayer: string;
  fee: string;
  memo: string;
}

interface DaemonUserCommandResponse {
  pooledUserCommands: Array<{
    hash: string;
    kind: string;
    amount: string;
    fee: string;
    from: string;
    to: string;
    memo: string;
    nonce: number;
  }>;
}

interface DaemonZkAppCommandResponse {
  pooledZkappCommands: Array<{
    hash: string;
    zkappCommand: {
      memo: string;
      feePayer: {
        body: {
          publicKey: string;
          fee: string;
        };
      };
    };
  }>;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

const POOLED_USER_COMMANDS_QUERY = `
  query GetPooledUserCommands {
    pooledUserCommands {
      hash
      kind
      amount
      fee
      from
      to
      memo
      nonce
    }
  }
`;

const POOLED_ZKAPP_COMMANDS_QUERY = `
  query GetPooledZkAppCommands {
    pooledZkappCommands {
      hash
      zkappCommand {
        memo
        feePayer {
          body {
            publicKey
            fee
          }
        }
      }
    }
  }
`;

async function queryDaemon<T>(query: string): Promise<T> {
  const endpoint = getDaemonEndpoint();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  if (!result.data) {
    throw new Error('No data in response');
  }

  return result.data;
}

function isCorsError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    (error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('CORS'))
  );
}

export async function fetchPendingTransactions(): Promise<
  PendingTransaction[]
> {
  try {
    const data = await queryDaemon<DaemonUserCommandResponse>(
      POOLED_USER_COMMANDS_QUERY,
    );
    return data.pooledUserCommands;
  } catch (error) {
    if (isCorsError(error)) {
      throw new Error(
        'Unable to reach daemon endpoint. The Mina daemon does not allow ' +
          'cross-origin requests from this domain.',
      );
    }
    throw error;
  }
}

export async function fetchPendingZkAppCommands(): Promise<
  PendingZkAppCommand[]
> {
  try {
    const data = await queryDaemon<DaemonZkAppCommandResponse>(
      POOLED_ZKAPP_COMMANDS_QUERY,
    );
    return data.pooledZkappCommands.map(cmd => ({
      hash: cmd.hash,
      feePayer: cmd.zkappCommand.feePayer.body.publicKey,
      fee: cmd.zkappCommand.feePayer.body.fee,
      memo: cmd.zkappCommand.memo,
    }));
  } catch (error) {
    if (isCorsError(error)) {
      throw new Error(
        'Unable to reach daemon endpoint. The Mina daemon does not allow ' +
          'cross-origin requests from this domain.',
      );
    }
    throw error;
  }
}
