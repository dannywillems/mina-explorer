import { getClient } from './client';
import type { Account } from '@/types';

const ACCOUNT_QUERY = `
  query GetAccount($publicKey: String!) {
    account(query: { publicKey: $publicKey }) {
      publicKey
      balance {
        total
        liquid
        locked
      }
      nonce
      delegate
      votingFor
      receiptChainHash
      timing {
        initialMinimumBalance
        cliffTime
        cliffAmount
        vestingPeriod
        vestingIncrement
      }
      permissions {
        editState
        access
        send
        receive
        setDelegate
        setPermissions
        setVerificationKey
        setZkappUri
        editActionState
        setTokenSymbol
        incrementNonce
        setVotingFor
        setTiming
      }
      zkappState
      zkappUri
      tokenSymbol
    }
  }
`;

// Simplified query in case the full query doesn't work
const ACCOUNT_SIMPLE_QUERY = `
  query GetAccount($publicKey: String!) {
    account(query: { publicKey: $publicKey }) {
      publicKey
      balance {
        total
      }
      nonce
      delegate
    }
  }
`;

interface AccountResponse {
  account: Account | null;
}

export async function fetchAccount(publicKey: string): Promise<Account | null> {
  const client = getClient();

  // Try the full query first
  try {
    const data = await client.query<AccountResponse>(ACCOUNT_QUERY, {
      publicKey,
    });
    return data.account;
  } catch {
    // Fall back to simple query
    try {
      const data = await client.query<AccountResponse>(ACCOUNT_SIMPLE_QUERY, {
        publicKey,
      });
      if (data.account) {
        return {
          ...data.account,
          balance: {
            total: data.account.balance.total,
            liquid: null,
            locked: null,
          },
          votingFor: null,
          receiptChainHash: null,
          timing: null,
          permissions: null,
          zkappState: null,
          zkappUri: null,
          tokenSymbol: null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
