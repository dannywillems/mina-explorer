import { NETWORKS, DEFAULT_NETWORK } from '@/config';
import { getClient } from './client';

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

// Transaction detail types
export interface TransactionDetail {
  hash: string;
  type: 'user_command' | 'zkapp_command';
  status: 'pending' | 'confirmed';
  blockHeight?: number;
  blockStateHash?: string;
  dateTime?: string;
  // User command fields
  kind?: string;
  from?: string;
  to?: string;
  amount?: string;
  fee: string;
  memo?: string;
  nonce?: number;
  failureReason?: string | null | undefined;
  // zkApp command fields
  feePayer?: string;
  accountUpdates?: number;
}

// Query to search for transactions in recent blocks
const SEARCH_TRANSACTION_QUERY = `
  query SearchTransaction($limit: Int!) {
    blocks(
      limit: $limit
      sortBy: BLOCKHEIGHT_DESC
    ) {
      blockHeight
      stateHash
      dateTime
      transactions {
        userCommands {
          hash
          kind
          from
          to
          amount
          fee
          memo
          nonce
          failureReason
        }
        zkappCommands {
          hash
          failureReasons {
            failures
          }
          zkappCommand {
            memo
            feePayer {
              body {
                publicKey
                fee
              }
            }
            accountUpdates {
              body {
                publicKey
              }
            }
          }
        }
      }
    }
  }
`;

interface SearchTransactionResponse {
  blocks: Array<{
    blockHeight: number;
    stateHash: string;
    dateTime: string;
    transactions: {
      userCommands: Array<{
        hash: string;
        kind: string;
        from: string;
        to: string;
        amount: string;
        fee: string;
        memo: string;
        nonce: number;
        failureReason: string | null;
      }>;
      zkappCommands: Array<{
        hash: string;
        failureReasons: Array<{ failures: string[] }> | null;
        zkappCommand: {
          memo: string;
          feePayer: {
            body: {
              publicKey: string;
              fee: string;
            };
          };
          accountUpdates: Array<{
            body: {
              publicKey: string;
            };
          }>;
        };
      }>;
    };
  }>;
}

/**
 * Search for a transaction by hash
 * First checks pending pool, then searches confirmed blocks
 */
export async function fetchTransactionByHash(
  hash: string,
): Promise<TransactionDetail | null> {
  // First, try to find in pending transactions
  try {
    const pendingTxs = await fetchPendingTransactions();
    const pendingTx = pendingTxs.find(tx => tx.hash === hash);
    if (pendingTx) {
      return {
        hash: pendingTx.hash,
        type: 'user_command',
        status: 'pending',
        kind: pendingTx.kind,
        from: pendingTx.from,
        to: pendingTx.to,
        amount: pendingTx.amount,
        fee: pendingTx.fee,
        memo: pendingTx.memo,
        nonce: pendingTx.nonce,
      };
    }
  } catch {
    // Daemon might not be available, continue to search archive
  }

  // Try to find in pending zkApp commands
  try {
    const pendingZkApps = await fetchPendingZkAppCommands();
    const pendingZkApp = pendingZkApps.find(tx => tx.hash === hash);
    if (pendingZkApp) {
      return {
        hash: pendingZkApp.hash,
        type: 'zkapp_command',
        status: 'pending',
        feePayer: pendingZkApp.feePayer,
        fee: pendingZkApp.fee,
        memo: pendingZkApp.memo,
      };
    }
  } catch {
    // Daemon might not be available, continue to search archive
  }

  // Search in confirmed blocks (archive node)
  const client = getClient();
  try {
    const data = await client.query<SearchTransactionResponse>(
      SEARCH_TRANSACTION_QUERY,
      { limit: 1000 },
    );

    for (const block of data.blocks) {
      // Search in user commands
      const userCmd = block.transactions.userCommands?.find(
        tx => tx.hash === hash,
      );
      if (userCmd) {
        return {
          hash: userCmd.hash,
          type: 'user_command',
          status: 'confirmed',
          blockHeight: block.blockHeight,
          blockStateHash: block.stateHash,
          dateTime: block.dateTime,
          kind: userCmd.kind,
          from: userCmd.from,
          to: userCmd.to,
          amount: userCmd.amount,
          fee: userCmd.fee,
          memo: userCmd.memo,
          nonce: userCmd.nonce,
          failureReason: userCmd.failureReason,
        };
      }

      // Search in zkApp commands
      const zkAppCmd = block.transactions.zkappCommands?.find(
        tx => tx.hash === hash,
      );
      if (zkAppCmd) {
        return {
          hash: zkAppCmd.hash,
          type: 'zkapp_command',
          status: 'confirmed',
          blockHeight: block.blockHeight,
          blockStateHash: block.stateHash,
          dateTime: block.dateTime,
          feePayer: zkAppCmd.zkappCommand.feePayer.body.publicKey,
          fee: zkAppCmd.zkappCommand.feePayer.body.fee,
          memo: zkAppCmd.zkappCommand.memo,
          accountUpdates: zkAppCmd.zkappCommand.accountUpdates?.length || 0,
          failureReason: zkAppCmd.failureReasons
            ?.flatMap(fr => fr.failures)
            .join(', '),
        };
      }
    }
  } catch (error) {
    console.error('[API] Error searching for transaction:', error);
  }

  return null;
}

// Account transaction type for history
export interface AccountTransaction {
  hash: string;
  type: 'sent' | 'received' | 'zkapp';
  kind?: string | undefined;
  counterparty?: string | undefined;
  amount?: string | undefined;
  fee: string;
  blockHeight: number;
  dateTime: string;
  memo?: string | undefined;
}

/**
 * Fetch transaction history for an account
 * Returns sent and received transactions
 */
export async function fetchAccountTransactions(
  publicKey: string,
  limit: number = 500,
): Promise<AccountTransaction[]> {
  const client = getClient();
  const transactions: AccountTransaction[] = [];

  try {
    const data = await client.query<SearchTransactionResponse>(
      SEARCH_TRANSACTION_QUERY,
      { limit },
    );

    for (const block of data.blocks) {
      // Check user commands
      for (const cmd of block.transactions.userCommands || []) {
        if (cmd.from === publicKey) {
          transactions.push({
            hash: cmd.hash,
            type: 'sent',
            kind: cmd.kind,
            counterparty: cmd.to,
            amount: cmd.amount,
            fee: cmd.fee,
            blockHeight: block.blockHeight,
            dateTime: block.dateTime,
            memo: cmd.memo,
          });
        } else if (cmd.to === publicKey) {
          transactions.push({
            hash: cmd.hash,
            type: 'received',
            kind: cmd.kind,
            counterparty: cmd.from,
            amount: cmd.amount,
            fee: cmd.fee,
            blockHeight: block.blockHeight,
            dateTime: block.dateTime,
            memo: cmd.memo,
          });
        }
      }

      // Check zkApp commands
      for (const cmd of block.transactions.zkappCommands || []) {
        const feePayer = cmd.zkappCommand.feePayer.body.publicKey;
        const affectedAccounts = cmd.zkappCommand.accountUpdates?.map(
          u => u.body.publicKey,
        );

        if (feePayer === publicKey || affectedAccounts?.includes(publicKey)) {
          transactions.push({
            hash: cmd.hash,
            type: 'zkapp',
            counterparty: feePayer === publicKey ? undefined : feePayer,
            fee: cmd.zkappCommand.feePayer.body.fee,
            blockHeight: block.blockHeight,
            dateTime: block.dateTime,
            memo: cmd.zkappCommand.memo,
          });
        }
      }
    }
  } catch (error) {
    console.error('[API] Error fetching account transactions:', error);
  }

  // Sort by block height descending (newest first)
  return transactions.sort((a, b) => b.blockHeight - a.blockHeight);
}
