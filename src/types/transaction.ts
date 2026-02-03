export type TransactionKind = 'PAYMENT' | 'STAKE_DELEGATION' | 'ZKAPP';

export interface Transaction {
  hash: string;
  kind: TransactionKind;
  from: string;
  to: string;
  amount: string;
  fee: string;
  memo: string;
  nonce: number;
  blockHeight: number;
  blockStateHash: string;
  dateTime: string;
  failureReason: string | null;
  canonical: boolean;
}

export interface TransactionDetail extends Transaction {
  block: {
    blockHeight: number;
    stateHash: string;
    dateTime: string;
  };
}

export interface ZkAppTransaction {
  hash: string;
  memo: string;
  feePayer: {
    publicKey: string;
    fee: string;
  };
  accountUpdates: ZkAppAccountUpdate[];
  blockHeight: number;
  blockStateHash: string;
  dateTime: string;
  failureReason: string[] | null;
}

export interface ZkAppAccountUpdate {
  publicKey: string;
  tokenId: string;
  balanceChange: {
    magnitude: string;
    sgn: string;
  };
  callDepth: number;
  callData: string;
  events: string[][];
  actions: string[][];
}

export interface InternalCommand {
  hash: string;
  type: 'FEE_TRANSFER' | 'COINBASE';
  receiver: string;
  fee: string;
  blockHeight: number;
  blockStateHash: string;
  dateTime: string;
}
