export interface GraphQLResponse<T> {
  data: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
}

export interface NetworkState {
  maxBlockHeight: {
    canonicalMaxBlockHeight: number;
    pendingMaxBlockHeight: number;
  };
}

export interface PaginationParams {
  limit: number;
  offset?: number;
}

export interface BlocksQueryParams extends PaginationParams {
  canonical?: boolean;
}

export interface TransactionsQueryParams extends PaginationParams {
  canonical?: boolean;
  from?: string;
  to?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
