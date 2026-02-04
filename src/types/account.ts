export interface Account {
  publicKey: string;
  balance: {
    total: string;
    liquid: string | null;
    locked: string | null;
  };
  nonce: number;
  delegate: string | null;
  votingFor: string | null;
  receiptChainHash: string | null;
  timing: AccountTiming | null;
  permissions: AccountPermissions | null;
  zkappState: string[] | null;
  zkappUri: string | null;
  tokenSymbol: string | null;
}

export interface AccountTiming {
  initialMinimumBalance: string | null;
  cliffTime: number | null;
  cliffAmount: string | null;
  vestingPeriod: number | null;
  vestingIncrement: string | null;
}

export interface AccountPermissions {
  editState: string;
  access: string;
  send: string;
  receive: string;
  setDelegate: string;
  setPermissions: string;
  // setVerificationKey can be a string or an object with auth requirements
  setVerificationKey: string | Record<string, unknown>;
  setZkappUri: string;
  editActionState: string;
  setTokenSymbol: string;
  incrementNonce: string;
  setVotingFor: string;
  setTiming: string;
}

export interface AccountTransaction {
  hash: string;
  kind: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  dateTime: string;
  blockHeight: number;
  failureReason: string | null;
}

export interface AccountSummary {
  publicKey: string;
  balance: string;
  nonce: number;
  isZkApp: boolean;
  delegate: string | null;
}
