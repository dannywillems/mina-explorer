/**
 * Test fixtures with real data from Mesa network
 * These are used to avoid constantly querying the node during tests
 */

export const FIXTURES = {
  // Known block heights that exist on Mesa network
  blocks: {
    // A block height that should always exist
    knownHeight: 25500,
    // A recent block height (update periodically)
    recentHeight: 25800,
  },

  // Known public keys from Mesa network (block producers)
  accounts: {
    // Block producer account - known to exist
    blockProducer: 'B62qiy32p8kAKnny8ZFwoMhYpBppM1DWVCqAPBYNcXnsAHhnfAAuXgg',
    // Another known account
    knownAccount: 'B62qpge4uMq4Vv5Rvc8Gw9qSquUYd6xoW1pz7HQkMSHm6h1o7pvLPAN',
    // Invalid/non-existent account for testing error states
    invalidAccount: 'B62qinvalidaccountaddressthatdoesnotexist12345678901234',
  },

  // State hashes from Mesa network
  stateHashes: {
    // A known state hash
    known: '3NKeMoncuHab5ScarV5ViyF16cJPT4taWNSaTLS64Dp67wuXigPZ',
  },
};
