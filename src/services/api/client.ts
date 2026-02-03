import type { GraphQLResponse, GraphQLError } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public errors?: GraphQLError[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  setEndpoint(endpoint: string): void {
    this.endpoint = endpoint;
  }

  getEndpoint(): string {
    return this.endpoint;
  }

  async query<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as GraphQLResponse<T>;

    if (result.errors && result.errors.length > 0) {
      const errorMessages = result.errors.map(e => e.message).join(', ');
      throw new ApiError(`GraphQL error: ${errorMessages}`, result.errors);
    }

    return result.data;
  }
}

let clientInstance: GraphQLClient | null = null;

export function getClient(endpoint?: string): GraphQLClient {
  if (!clientInstance && endpoint) {
    clientInstance = new GraphQLClient(endpoint);
  }
  if (!clientInstance) {
    throw new Error('GraphQL client not initialized. Provide an endpoint.');
  }
  return clientInstance;
}

export function initClient(endpoint: string): GraphQLClient {
  clientInstance = new GraphQLClient(endpoint);
  return clientInstance;
}
