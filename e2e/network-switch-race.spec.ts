import { test, expect, isMocked, FIXTURE_DATA } from './fixtures';

/**
 * #66 — switching networks while a slow request is in flight must never render
 * the previous network's data.
 *
 * The archive client is a shared singleton whose endpoint is swapped in place,
 * so a slow request dispatched for network A is still outstanding when the user
 * switches to B. If A resolves last it would overwrite B's data — for an
 * explorer, one network's blocks shown under another network's label. The fix
 * is a per-hook request generation guard that discards superseded responses.
 *
 * Here network A (mesa) is deliberately slow and network B (devnet) is instant,
 * with disjoint block heights, so the stale A response lands *after* the switch.
 * Requires the mock harness.
 */
test.describe('network switch race (#66)', () => {
  // Both networks report the SAME max block height so that the stale response's
  // setTotalBlocks is a no-op. That mattered when usePaginatedBlocks had a second
  // effect keyed on the total, which would have refetched on a height change and
  // incidentally masked the race; that effect is gone, but an equal total still
  // keeps the two responses interchangeable in every respect except the rows, which
  // is what makes the rendered rows unambiguous evidence of which network won.
  const SHARED_MAX_HEIGHT = 950000;
  function markedBlocks(base: number): unknown {
    const clone = JSON.parse(JSON.stringify(FIXTURE_DATA.blocks));
    const count = clone.data.blocks.length;
    clone.data.blocks = clone.data.blocks.map(
      (b: Record<string, unknown>, i: number) => ({
        ...b,
        blockHeight: base + (count - 1 - i), // descending, like real data
      }),
    );
    clone.data.networkState = {
      maxBlockHeight: {
        canonicalMaxBlockHeight: SHARED_MAX_HEIGHT,
        pendingMaxBlockHeight: SHARED_MAX_HEIGHT,
      },
    };
    return clone;
  }

  /**
   * The same marked blocks in mina-explorer-api's DTO shape.
   *
   * Mesa reads the REST backend now, so THIS race is cross-backend: mesa over REST against
   * devnet over the archive. That is a better test of the guard than the original, which
   * raced two archives — the generation guard has to hold regardless of which client
   * dispatched the superseded request.
   *
   * `totalCount` stays SHARED_MAX_HEIGHT for the reason the constant exists: an equal total
   * keeps the stale response's setTotalBlocks a no-op, so the two responses differ only in
   * their rows and nothing but the request-generation guard can decide which one wins.
   */
  function markedRestBlocks(base: number): unknown {
    const clone = JSON.parse(JSON.stringify(FIXTURE_DATA.blocks));
    const count = clone.data.blocks.length;
    return {
      data: clone.data.blocks.map((b: Record<string, unknown>, i: number) => ({
        accountAddress: b.creator,
        accountImg: null,
        accountName: null,
        blockHeight: base + (count - 1 - i),
        coinbase: 0,
        epoch: null,
        globalSlotSinceGenesis: null,
        isCanonical: true,
        slot: null,
        stateHash: b.stateHash,
        timestamp: Date.parse(b.dateTime as string),
        transactionsCount: 0,
      })),
      totalElements: SHARED_MAX_HEIGHT,
      totalPages: 1,
      totalCount: SHARED_MAX_HEIGHT,
    };
  }

  test('a slow previous-network response never overwrites the new network', async ({
    page,
  }) => {
    test.skip(!isMocked, 'requires the mock harness (CI or MOCK_API=true)');

    const MESA_BASE = 800000; // slow network → heights 800,00x
    const DEVNET_BASE = 900000; // fast network → heights 900,00x
    let mesaBlocksRequested = false;
    let mesaBlocksFulfilled = false;

    // The blocks-list query is named GetBlocksFull/Basic/Minimal/Paginated
    // (all carry per-block userCommands summaries, so match by name, not by
    // field). Excludes GetBlocksByDateRange (staking) and single-block detail.
    const isBlocksList = (postData: string | null): boolean => {
      try {
        const query = JSON.parse(postData || '{}').query || '';
        return query.includes('GetBlocks') && !query.includes('ByDateRange');
      } catch {
        return false;
      }
    };

    // Mesa now reads mina-explorer-api, so the slow side is the REST backend, matched on
    // its path shape rather than a GraphQL query name.
    await page.route(/\/mina-mesa\/v1\/blocks/, async route => {
      mesaBlocksRequested = true;
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(markedRestBlocks(MESA_BASE)),
      });
      mesaBlocksFulfilled = true;
    });

    // Devnet reads mina-explorer-api too now, so BOTH sides of the race are REST. That is
    // the original #66 scenario restored: one shared client whose endpoint is swapped in
    // place, rather than two independent archive clients. The fast side answers instantly.
    await page.route(/\/mina-devnet\/v1\/blocks/, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(markedRestBlocks(DEVNET_BASE)),
      });
    });

    // Start on mesa; the blocks request is now in flight (and slow).
    await page.goto('/#/blocks?network=mesa');
    await expect(
      page.locator('header button').filter({ hasText: 'Mesa' }).first(),
    ).toBeVisible({ timeout: 10000 });
    await expect.poll(() => mesaBlocksRequested, { timeout: 10000 }).toBe(true);

    // Switch to devnet before mesa resolves.
    await page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first()
      .click();
    await page.locator('button:has-text("Devnet")').first().click();

    // Devnet data renders (fast response).
    await expect(page.getByText(/900,00\d/).first()).toBeVisible({
      timeout: 10000,
    });

    // Wait until the stale mesa response has actually been delivered to the app
    // (its 1500ms delay elapsed), then give the app a moment to (incorrectly)
    // apply it if the guard were absent...
    await expect.poll(() => mesaBlocksFulfilled, { timeout: 5000 }).toBe(true);
    await page.waitForTimeout(500);

    // ...the guard must have discarded it: mesa heights never appear and the
    // devnet data is still on screen under the devnet label.
    await expect(page.getByText(/800,00\d/)).toHaveCount(0);
    await expect(page.getByText(/900,00\d/).first()).toBeVisible();
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();
  });
});
