export { GraphQLClient, ApiError, getClient, initClient } from './client';
export {
  fetchBlocks,
  fetchBlocksPaginated,
  fetchBlockByHeight,
  fetchBlockByHash,
  fetchNetworkState,
  type BlocksPage,
} from './blocks';
export { fetchAccount } from './accounts';
export {
  fetchTransactionsPaginated,
  type ConfirmedTransaction,
  type TransactionsPageResult,
} from './transactions';
export {
  fetchBlocksForAnalytics,
  calculateNetworkAnalytics,
  aggregateDailyStats,
  type BlockStats,
  type DailyStats,
  type NetworkAnalytics,
} from './analytics';
