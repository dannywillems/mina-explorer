import { test, expect, isMocked } from './fixtures';
import { DAEMON_URL } from './mock-api';
import type { Page } from '@playwright/test';

/**
 * The app-wide consensus bar: UTC wall clock plus the network's consensus time
 * now (absolute slot, epoch, slot-in-epoch).
 *
 * The number under test is wall-clock derived, not chain derived — it must keep
 * advancing when block production does not, and it must never be confused with
 * the best tip's slot that the homepage Epoch card shows.
 */

/** Strip thousands separators from a rendered figure. */
function toNumber(text: string | null): number {
  return Number((text ?? '').replace(/[^\d]/g, ''));
}

async function readConsensus(
  page: Page,
): Promise<{ globalSlot: number; epoch: number; slot: number }> {
  return {
    globalSlot: toNumber(
      await page.getByTestId('consensus-global-slot').textContent(),
    ),
    epoch: toNumber(await page.getByTestId('consensus-epoch').textContent()),
    slot: toNumber(await page.getByTestId('consensus-slot').textContent()),
  };
}

test.describe('consensus time bar', () => {
  test('renders on every page', async ({ page }) => {
    for (const path of ['/', '/blocks', '/transactions', '/staking']) {
      await page.goto(`/#${path}`);
      await expect(page.getByTestId('consensus-time-bar')).toBeVisible();
      await expect(page.getByTestId('utc-clock')).toBeVisible();
    }
  });

  test('UTC clock is formatted and ticking', async ({ page }) => {
    await page.goto('/');
    const clock = page.getByTestId('utc-clock');
    await expect(clock).toHaveText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    // The seconds must advance on their own, with no navigation or re-render
    // from anything else on the page.
    const first = await clock.textContent();
    await expect(clock).not.toHaveText(first ?? '', { timeout: 5000 });
  });

  test('absolute slot reconciles with the epoch/slot pair', async ({
    page,
  }) => {
    test.skip(!isMocked, 'requires the mock harness (CI or MOCK_API=true)');
    await page.goto('/');
    await expect(page.getByTestId('consensus-global-slot')).toBeVisible();

    const { globalSlot, epoch, slot } = await readConsensus(page);

    // This identity is the whole reason the bar shows the since-hard-fork slot
    // rather than the since-genesis one: only this count adds up.
    expect(globalSlot).toBe(epoch * 7140 + slot);
    expect(epoch).toBe(61);
    expect(slot).toBeGreaterThanOrEqual(3570);
  });

  test('chain start is parsed out of the daemon format and shown in UTC', async ({
    page,
  }) => {
    test.skip(!isMocked, 'requires the mock harness (CI or MOCK_API=true)');
    await page.goto('/');

    // The daemon sends "2024-06-05 00:00:00.000000Z" — a space instead of `T`
    // and six fractional digits, which Date does not have to accept. Rendering
    // it correctly is the proof the normalisation ran.
    await expect(page.getByTestId('chain-start')).toHaveText(
      '2024-06-05 00:00:00',
    );
    await expect(page.getByTestId('chain-start')).toHaveAttribute(
      'datetime',
      '2024-06-05T00:00:00.000Z',
    );
  });

  test('keeps the UTC clock when the daemon is unreachable', async ({
    page,
  }) => {
    test.skip(!isMocked, 'requires the mock harness (CI or MOCK_API=true)');

    // Registered after the fixture's handler, so it wins for daemonStatus.
    await page.route(DAEMON_URL, async route => {
      const body = route.request().postData() ?? '';
      if (body.includes('daemonStatus')) {
        await route.fulfill({ status: 500, body: '' });
        return;
      }
      await route.fallback();
    });

    await page.goto('/');
    await expect(page.getByTestId('utc-clock')).toBeVisible();
    // Degraded, not crashed and not hidden: the wall clock is still true.
    await expect(page.getByTestId('consensus-time-status')).toHaveText(
      'unavailable',
    );
  });
});
