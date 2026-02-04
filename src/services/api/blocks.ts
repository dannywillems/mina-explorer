import { getClient } from './client';
import type { BlockSummary, BlockDetail, NetworkState } from '@/types';

// Full query with protocolState and networkState (for nodes that support it)
const BLOCKS_QUERY_FULL = `
  query GetBlocksFull($limit: Int!) {
    blocks(
      limit: $limit
      sortBy: BLOCKHEIGHT_DESC
    ) {
      blockHeight
      stateHash
      creator
      dateTime
      protocolState {
        consensusState {
          epoch
          slot
          slotSinceGenesis
        }
      }
      transactions {
        coinbase
      }
    }
    networkState {
      maxBlockHeight {
        canonicalMaxBlockHeight
      }
    }
  }
`;

// Basic query without protocolState (for Mesa and other nodes)
const BLOCKS_QUERY_BASIC = `
  query GetBlocksBasic($limit: Int!) {
    blocks(
      limit: $limit
      sortBy: BLOCKHEIGHT_DESC
    ) {
      blockHeight
      stateHash
      creator
      dateTime
      transactions {
        coinbase
      }
    }
    networkState {
      maxBlockHeight {
        canonicalMaxBlockHeight
      }
    }
  }
`;

const BLOCK_BY_HEIGHT_QUERY = `
  query GetBlockByHeight($blockHeightGte: Int!, $blockHeightLt: Int!) {
    blocks(
      query: { blockHeight_gte: $blockHeightGte, blockHeight_lt: $blockHeightLt }
      limit: 1
    ) {
      blockHeight
      stateHash
      creator
      dateTime
      transactions {
        coinbase
      }
    }
    networkState {
      maxBlockHeight {
        canonicalMaxBlockHeight
      }
    }
  }
`;

const NETWORK_STATE_QUERY = `
  query GetNetworkState {
    networkState {
      maxBlockHeight {
        canonicalMaxBlockHeight
        pendingMaxBlockHeight
      }
    }
  }
`;

interface ApiBlock {
  blockHeight: number;
  stateHash: string;
  creator: string;
  dateTime: string;
  protocolState?: {
    consensusState: {
      epoch: number;
      slot: number;
      slotSinceGenesis: number;
    };
  };
  transactions: {
    coinbase: string;
  };
}

interface BlocksResponse {
  blocks: ApiBlock[];
  networkState: {
    maxBlockHeight: {
      canonicalMaxBlockHeight: number;
    };
  };
}

interface NetworkStateResponse {
  networkState: NetworkState;
}

function mapApiBlockToSummary(
  block: ApiBlock,
  canonicalMaxBlockHeight: number,
): BlockSummary {
  return {
    blockHeight: block.blockHeight,
    stateHash: block.stateHash,
    creator: block.creator,
    dateTime: block.dateTime,
    txFees: '0',
    snarkFees: '0',
    canonical: block.blockHeight <= canonicalMaxBlockHeight,
    coinbase: block.transactions.coinbase,
    epoch: block.protocolState?.consensusState.epoch,
    slot: block.protocolState?.consensusState.slot,
    slotSinceGenesis: block.protocolState?.consensusState.slotSinceGenesis,
  };
}

function mapApiBlockToDetail(
  block: ApiBlock,
  canonicalMaxBlockHeight: number,
): BlockDetail {
  return {
    blockHeight: block.blockHeight,
    stateHash: block.stateHash,
    parentHash: '',
    creator: block.creator,
    creatorAccount: { publicKey: block.creator },
    dateTime: block.dateTime,
    txFees: '0',
    snarkFees: '0',
    canonical: block.blockHeight <= canonicalMaxBlockHeight,
    receivedTime: block.dateTime,
    winnerAccount: { publicKey: block.creator },
    protocolState: {
      consensusState: {
        epoch: 0,
        slot: 0,
        blockHeight: block.blockHeight,
      },
      previousStateHash: '',
    },
    transactions: {
      userCommands: [],
      zkappCommands: [],
      feeTransfer: [],
      coinbase: block.transactions.coinbase,
    },
  };
}

export async function fetchBlocks(limit: number = 25): Promise<BlockSummary[]> {
  const client = getClient();

  // Try full query first (with protocolState for epoch/slot info)
  try {
    const data = await client.query<BlocksResponse>(BLOCKS_QUERY_FULL, {
      limit,
    });
    const canonicalMax =
      data.networkState.maxBlockHeight.canonicalMaxBlockHeight;
    return data.blocks.map(block => mapApiBlockToSummary(block, canonicalMax));
  } catch (error) {
    // If full query fails (e.g., Mesa doesn't support protocolState),
    // fall back to basic query
    console.log('[API] Full blocks query failed, trying basic query...');
    const data = await client.query<BlocksResponse>(BLOCKS_QUERY_BASIC, {
      limit,
    });
    const canonicalMax =
      data.networkState.maxBlockHeight.canonicalMaxBlockHeight;
    return data.blocks.map(block => mapApiBlockToSummary(block, canonicalMax));
  }
}

export async function fetchBlockByHeight(
  blockHeight: number,
): Promise<BlockDetail | null> {
  const client = getClient();
  const data = await client.query<BlocksResponse>(BLOCK_BY_HEIGHT_QUERY, {
    blockHeightGte: blockHeight,
    blockHeightLt: blockHeight + 1,
  });
  if (data.blocks.length === 0) {
    return null;
  }
  const canonicalMax = data.networkState.maxBlockHeight.canonicalMaxBlockHeight;
  return mapApiBlockToDetail(data.blocks[0], canonicalMax);
}

export async function fetchBlockByHash(
  stateHash: string,
): Promise<BlockDetail | null> {
  // The API doesn't support querying by stateHash directly
  // We need to search through recent blocks
  const client = getClient();

  let data: BlocksResponse;
  try {
    data = await client.query<BlocksResponse>(BLOCKS_QUERY_FULL, {
      limit: 100,
    });
  } catch {
    // Fallback to basic query
    data = await client.query<BlocksResponse>(BLOCKS_QUERY_BASIC, {
      limit: 100,
    });
  }

  const block = data.blocks.find(b => b.stateHash === stateHash);
  if (!block) {
    return null;
  }
  const canonicalMax = data.networkState.maxBlockHeight.canonicalMaxBlockHeight;
  return mapApiBlockToDetail(block, canonicalMax);
}

export async function fetchNetworkState(): Promise<NetworkState> {
  const client = getClient();
  const data = await client.query<NetworkStateResponse>(NETWORK_STATE_QUERY);
  return data.networkState;
}
