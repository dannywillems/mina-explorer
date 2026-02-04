/**
 * API mocking utilities for e2e tests
 * Uses Playwright route interception to return fixture data instead of real API calls
 */

import type { Page, Route } from '@playwright/test';
import { FIXTURE_DATA, FIXTURES } from './fixtures';

/**
 * Check if we should mock API responses (CI environment)
 */
export function shouldMockApi(): boolean {
  return process.env.CI === 'true' || process.env.MOCK_API === 'true';
}

/**
 * Setup API mocking for a page
 * Intercepts GraphQL requests and returns fixture data
 */
export async function setupApiMocks(page: Page): Promise<void> {
  if (!shouldMockApi()) {
    return;
  }

  // Mock archive node GraphQL endpoints (all networks)
  // Patterns: *-archive-node-api.gcp.o1test.net, archive-node-api.gcp.o1test.net
  await page.route(
    '**/*archive-node-api.gcp.o1test.net/**',
    handleArchiveRequest,
  );

  // Mock daemon GraphQL endpoints (all networks)
  // Patterns: *-plain-*.gcp.o1test.net/graphql
  await page.route('**/*plain*.gcp.o1test.net/graphql', handleDaemonRequest);
}

/**
 * Handle archive node GraphQL requests
 */
async function handleArchiveRequest(route: Route): Promise<void> {
  const request = route.request();
  const postData = request.postData();

  if (!postData) {
    await route.continue();
    return;
  }

  try {
    const body = JSON.parse(postData);
    const query = body.query || '';

    // Handle block detail queries (with userCommands or zkappCommands)
    // Note: feeTransfer alone is not sufficient as block list queries also include it
    if (
      query.includes('blocks') &&
      (query.includes('userCommands') || query.includes('zkappCommands'))
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FIXTURE_DATA.blockDetail),
      });
      return;
    }

    // Handle blocks list queries
    if (query.includes('blocks')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FIXTURE_DATA.blocks),
      });
      return;
    }

    // Handle network state queries
    if (query.includes('networkState')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            networkState: FIXTURE_DATA.blocks.data.networkState,
          },
        }),
      });
      return;
    }

    // Default: continue with real request
    await route.continue();
  } catch {
    await route.continue();
  }
}

/**
 * Handle daemon GraphQL requests
 */
async function handleDaemonRequest(route: Route): Promise<void> {
  const request = route.request();
  const postData = request.postData();

  if (!postData) {
    await route.continue();
    return;
  }

  try {
    const body = JSON.parse(postData);
    const query = body.query || '';

    // Handle account queries
    if (query.includes('account')) {
      const variables = body.variables || {};
      const publicKey = variables.publicKey;

      // Return null for invalid accounts
      if (publicKey === FIXTURES.accounts.invalidAccount) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              account: null,
            },
          }),
        });
        return;
      }

      // Return fixture account data
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FIXTURE_DATA.account),
      });
      return;
    }

    // Handle pooled transactions queries
    if (
      query.includes('pooledUserCommands') ||
      query.includes('pooledZkappCommands')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FIXTURE_DATA.transactions),
      });
      return;
    }

    // Default: continue with real request
    await route.continue();
  } catch {
    await route.continue();
  }
}
