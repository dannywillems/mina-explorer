/**
 * The /#/blocks toolbar: canonicality filter, page size, and jump-to-height.
 *
 * All three are invisible when they go wrong. A filter that never reaches the query still
 * renders twenty plausible blocks; a 200-row page that silently served 50 still renders
 * blocks; a height jump that lands on the wrong page still renders blocks. So these tests
 * assert on the REQUESTS and on the POSITION of a known height within the page, never on
 * "some rows appeared".
 *
 * The mock below is a faithful miniature of mina-explorer-api, measured against production
 * on 2026-08-27:
 *
 * - `page` is zero-based and the window is `page * size`; there is no `offset` param.
 * - `size` is 1..50 and answers **HTTP 400** outside that range — it does not clamp. This is
 *   what forces 100- and 200-row pages to be stitched client-side.
 * - `type` PARTITIONS the list on `isCanonical`: CANONICAL + ORPHANED = ALL, exactly.
 * - `ALL` contains orphan siblings, so heights REPEAT in it — which is precisely why
 *   `tip - height` is not an offset and the height jump has to search.
 * - `totalElements`/`totalPages`/`last` are capped for Blockberry parity; only `totalCount`
 *   is true. The mock reproduces the cap so a reader that trusted them would fail here.
 */

import { test, expect, type Page, type Route } from '@playwright/test';
import { ARCHIVE_URL, DAEMON_URL, REST_URL } from './mock-api';

/** Heights above this are the unfinalized tip window; at or below, k-finalized. */
const CANONICAL_MAX = 710;
const TIP = 1000;
/** Heights that carry a losing fork sibling, so the `ALL` list repeats them. */
const FORKED_HEIGHTS = [700, 500, 300];

interface Row {
  blockHeight: number;
  stateHash: string;
  isCanonical: boolean;
  accountAddress: string;
  coinbase: number;
  timestamp: number;
  transactionsCount: number;
  epoch: number | null;
  slot: number | null;
  globalSlotSinceGenesis: number | null;
}

function makeRow(height: number, canonical: boolean): Row {
  return {
    blockHeight: height,
    stateHash: `3N${canonical ? 'C' : 'O'}${String(height).padStart(6, '0')}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    isCanonical: canonical,
    accountAddress: `B62q${canonical ? 'canon' : 'orphn'}${String(height).padStart(6, '0')}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
    coinbase: 720,
    timestamp: 1700000000000 + height * 180000,
    transactionsCount: 0,
    epoch: 0,
    slot: height,
    globalSlotSinceGenesis: height,
  };
}

/**
 * The whole `ALL` list, height-descending, orphan sibling immediately after its winner.
 *
 * 1000 canonical-chain heights, of which the top 290 are unfinalized, plus 3 fork
 * siblings: 1003 rows, 710 canonical, 293 non-canonical.
 */
const ALL_ROWS: Row[] = (() => {
  const rows: Row[] = [];
  for (let h = TIP; h >= 1; h--) {
    rows.push(makeRow(h, h <= CANONICAL_MAX));
    if (FORKED_HEIGHTS.includes(h)) rows.push(makeRow(h, false));
  }
  return rows;
})();

const CANONICAL_ROWS = ALL_ROWS.filter(r => r.isCanonical);
const ORPHANED_ROWS = ALL_ROWS.filter(r => !r.isCanonical);

interface RestCall {
  page: number;
  size: number;
  type: string;
}

/** Route both backends; record every blocks request the app makes. */
async function routeApi(page: Page): Promise<RestCall[]> {
  const calls: RestCall[] = [];

  await page.route(REST_URL, async (route: Route) => {
    const url = new URL(route.request().url());
    if (!url.pathname.endsWith('/blocks')) {
      await route.fulfill({ status: 404, body: '{"error":"not found"}' });
      return;
    }

    const size = Number(url.searchParams.get('size'));
    const pageNum = Number(url.searchParams.get('page'));
    const type = url.searchParams.get('type') ?? 'ALL';
    calls.push({ page: pageNum, size, type });

    // The real ceiling, reproduced. A client that passed 100 straight through lands here.
    if (!Number.isInteger(size) || size < 1 || size > 50) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ status: 400, error: 'Bad Request' }),
      });
      return;
    }

    const source =
      type === 'CANONICAL'
        ? CANONICAL_ROWS
        : type === 'ORPHANED'
          ? ORPHANED_ROWS
          : ALL_ROWS;
    const slice = source.slice(pageNum * size, pageNum * size + size);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: slice,
        // Capped exactly as production caps them, so nothing here can pass by reading them.
        totalElements: Math.min(source.length, 500),
        totalPages: Math.ceil(Math.min(source.length, 500) / size),
        last: (pageNum + 1) * size >= Math.min(source.length, 500),
        totalCount: source.length,
      }),
    });
  });

  await page.route(ARCHIVE_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });
  await page.route(DAEMON_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: {} }),
    });
  });

  return calls;
}

/** The height rendered in row `index` (0-based) of the table. */
async function heightAt(page: Page, index: number): Promise<number> {
  const cell = page.locator('tbody tr').nth(index).locator('td').first();
  const text = (await cell.innerText()).trim().split('\n')[0] ?? '';
  return Number(text.replace(/[^\d]/g, ''));
}

async function rowHeights(page: Page): Promise<number[]> {
  const texts = await page.locator('tbody tr td:first-child').allInnerTexts();
  return texts.map(t => Number((t.split('\n')[0] ?? '').replace(/[^\d]/g, '')));
}

test.describe('blocks page controls', () => {
  test.beforeEach(async ({ page }) => {
    // Page size and filter persist in localStorage; start every test from the defaults so
    // one test's selection cannot decide another's outcome.
    //
    // Guarded by a sentinel because addInitScript runs on EVERY navigation, reloads
    // included — unguarded it also wipes the preference the persistence test is checking
    // survived, which reads as a broken feature rather than a broken fixture.
    await page.addInitScript(() => {
      try {
        if (sessionStorage.getItem('e2e-prefs-reset')) return;
        sessionStorage.setItem('e2e-prefs-reset', '1');
        localStorage.removeItem('mina-explorer-blocks-page-size');
        localStorage.removeItem('mina-explorer-blocks-filter');
      } catch {
        /* storage blocked — defaults apply anyway */
      }
    });
  });

  test('defaults to 20 rows of the unfiltered list in one request', async ({
    page,
  }) => {
    const calls = await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    expect(await rowHeights(page)).toHaveLength(20);
    // A 20-row page at offset 0 sits on the API's own grid, so it must still cost exactly
    // one request — the offset plumbing must not turn the common case into a stitch.
    const first = calls[0];
    expect(first?.page).toBe(0);
    expect(first?.size).toBe(20);
    expect(first?.type).toBe('ALL');

    // 1003 rows / 20. Reading the capped totalElements (500) would say 25 pages.
    await expect(page.getByText('of 51')).toBeVisible();
    await expect(page.getByText('1,003 total blocks')).toBeVisible();
  });

  test('the canonical filter asks for CANONICAL and repages against its own total', async ({
    page,
  }) => {
    const calls = await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    // Unfiltered, the tip is 1000 and carries a Pending badge.
    expect(await heightAt(page, 0)).toBe(TIP);

    await page
      .getByTestId('blocks-filter')
      .getByRole('button', { name: 'Canonical', exact: true })
      .click();

    // The k-finalized list starts 290 blocks below the tip. That is the filter working,
    // not the page going stale — and it is the single most surprising thing about it.
    await expect
      .poll(async () => heightAt(page, 0), { timeout: 15000 })
      .toBe(CANONICAL_MAX);

    expect(calls.some(c => c.type === 'CANONICAL')).toBe(true);

    // 710 canonical rows / 20 = 36 pages, NOT 1003 / 20 = 51. Carrying the unfiltered total
    // over would page against a denominator from a different list.
    await expect(page.getByText('of 36')).toBeVisible();
    await expect(page.getByText('710 total blocks')).toBeVisible();

    // Every row is canonical, so no Pending badge survives anywhere on the page.
    await expect(page.getByText('Pending', { exact: true })).toHaveCount(0);
  });

  test('the non-canonical filter is the exact complement', async ({ page }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByTestId('blocks-filter')
      .getByRole('button', { name: 'Non-canonical' })
      .click();

    // 293 = 1003 - 710. The partition is what keeps the page count honest.
    await expect(page.getByText('293 total blocks')).toBeVisible({
      timeout: 15000,
    });
    // It includes the live tip, which is why it is labelled "non-canonical" and not
    // "orphaned" — the top 290 blocks are simply not finalized yet.
    expect(await heightAt(page, 0)).toBe(TIP);
  });

  test('a 200-row page is stitched from four 50-row requests', async ({
    page,
  }) => {
    const calls = await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });
    calls.length = 0;

    await page
      .getByTestId('blocks-page-size')
      .getByRole('button', { name: '200' })
      .click();

    await expect
      .poll(async () => (await rowHeights(page)).length, { timeout: 15000 })
      .toBe(200);

    // Nothing may ask for more than the API allows — that is a 400, not a short page.
    expect(calls.every(c => c.size <= 50)).toBe(true);
    expect(calls.filter(c => c.size === 50)).toHaveLength(4);

    // And the stitch must be in order and gapless across the chunk seams.
    const heights = await rowHeights(page);
    expect(heights[0]).toBe(TIP);
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]).toBeLessThanOrEqual(heights[i - 1] as number);
    }
  });

  test('page size 100 survives a reload', async ({ page }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByTestId('blocks-page-size')
      .getByRole('button', { name: '100', exact: true })
      .click();
    await expect
      .poll(async () => (await rowHeights(page)).length, { timeout: 15000 })
      .toBe(100);

    await page.reload();
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });
    await expect
      .poll(async () => (await rowHeights(page)).length, { timeout: 15000 })
      .toBe(100);
  });

  test('jumping to a height puts it at the page midpoint', async ({ page }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId('blocks-goto-height').fill('500');
    await page.getByRole('button', { name: 'Go' }).click();

    // Rows above height 500 in `ALL`: 290 unfinalized (711..1000) + 210 canonical
    // (501..710) + the fork sibling at 700 = 501. With a 20-row page the target therefore
    // lands at index 10 — the midpoint — which is only true if the offset was SEARCHED for.
    // Subtracting from the tip would have said 500 and put it at index 9.
    await expect
      .poll(async () => heightAt(page, 10), { timeout: 15000 })
      .toBe(500);

    const heights = await rowHeights(page);
    expect(heights).toHaveLength(20);
    // Ten newer blocks above it and nine older below — the point of centring is context.
    expect(heights[0]).toBeGreaterThan(500);
    expect(heights[heights.length - 1]).toBeLessThan(500);
  });

  test('after a jump the newest blocks are still reachable from page 1', async ({
    page,
  }) => {
    // The regression this pins: centring a height means the page grid no longer starts on a
    // multiple of the page size. Sliding EVERY boundary down by the remainder — the obvious
    // implementation — left the newest rows in front of page 1 and reachable from no page
    // at all, "First page" included. Page 1 is short instead, so the tiling stays complete.
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    await page.getByTestId('blocks-goto-height').fill('500');
    await page.getByRole('button', { name: 'Go' }).click();
    await expect
      .poll(async () => heightAt(page, 10), { timeout: 15000 })
      .toBe(500);

    await page.getByTitle('First page').click();

    // The very newest block, not the one 11 rows down from it.
    await expect
      .poll(async () => heightAt(page, 0), { timeout: 15000 })
      .toBe(TIP);
  });

  test('jumping works under the canonical filter, where the offset differs', async ({
    page,
  }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    await page
      .getByTestId('blocks-filter')
      .getByRole('button', { name: 'Canonical', exact: true })
      .click();
    await expect
      .poll(async () => heightAt(page, 0), { timeout: 15000 })
      .toBe(CANONICAL_MAX);

    await page.getByTestId('blocks-goto-height').fill('500');
    await page.getByRole('button', { name: 'Go' }).click();

    // In the canonical list height 500 sits at offset 710 - 500 = 210, not 501. Same target,
    // different offset — which is why the search is run per filter rather than cached.
    await expect
      .poll(async () => heightAt(page, 10), { timeout: 15000 })
      .toBe(500);
    await expect(page.getByText('Pending', { exact: true })).toHaveCount(0);
  });

  test('the page number is editable and jumps directly', async ({ page }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    const field = page.getByTestId('blocks-page-number');
    await field.fill('40');
    await field.press('Enter');

    // Page 40 of 20-row pages starts at offset 780; ALL_ROWS[780] is what must appear.
    const expected = ALL_ROWS[780]?.blockHeight as number;
    await expect
      .poll(async () => heightAt(page, 0), { timeout: 15000 })
      .toBe(expected);
    await expect(field).toHaveValue('40');
  });

  test('an out-of-range page number is refused, not clamped silently', async ({
    page,
  }) => {
    await routeApi(page);
    await page.goto('/#/blocks');
    await expect(page.locator('tbody tr').first()).toBeVisible({
      timeout: 15000,
    });

    const before = await heightAt(page, 0);
    const field = page.getByTestId('blocks-page-number');
    await field.fill('99999');
    await field.press('Enter');

    // The field snaps back to the page actually shown rather than leaving a number on
    // screen that does not describe the table under it.
    await expect(field).toHaveValue('1');
    expect(await heightAt(page, 0)).toBe(before);
  });
});
