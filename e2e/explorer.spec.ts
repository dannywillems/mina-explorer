import { test, expect } from '@playwright/test';

test.describe('Mina Explorer', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Mina Explorer/);

    // Check main heading (Mina is now an image, so just check for Explorer)
    await expect(page.locator('h1')).toContainText('Explorer');

    // Check search bar is present (use first() to handle multiple)
    await expect(
      page.locator('input[placeholder*="Search"]').first(),
    ).toBeVisible();

    // Check network stats section
    await expect(page.locator('text=Network').first()).toBeVisible();
    await expect(page.locator('text=Block Height').first()).toBeVisible();
  });

  test('network stats load data', async ({ page }) => {
    await page.goto('/');

    // Wait for network stats to load
    const blockHeightCard = page
      .locator('.card')
      .filter({ hasText: 'Block Height' });
    await expect(blockHeightCard).toBeVisible({ timeout: 15000 });

    // Check that block height is displayed as a number
    const blockHeightText = await blockHeightCard.locator('h4').textContent();
    console.log('Block Height:', blockHeightText);

    // Verify it's a valid number (with commas for formatting)
    expect(blockHeightText).toMatch(/[\d,]+/);
  });

  test('recent blocks load', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks section
    const recentBlocksSection = page
      .locator('.card')
      .filter({ hasText: 'Recent Blocks' });
    await expect(recentBlocksSection).toBeVisible({ timeout: 15000 });

    // Check that blocks table has rows
    const tableRows = recentBlocksSection.locator('tbody tr');

    // Wait for at least one block to load
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log('Number of blocks loaded:', rowCount);
    expect(rowCount).toBeGreaterThan(0);

    // Check that block height links are present
    const firstBlockLink = tableRows.first().locator('a').first();
    await expect(firstBlockLink).toBeVisible();

    // Get the block height from the first row
    const blockHeight = await firstBlockLink.textContent();
    console.log('First block height:', blockHeight);
  });

  test('blocks page loads', async ({ page }) => {
    await page.goto('/#/blocks');

    // Check page heading
    await expect(page.locator('h2')).toContainText('Blocks');

    // Wait for blocks table to load
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log('Number of blocks on blocks page:', rowCount);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('block detail page loads directly', async ({ page }) => {
    // Go to a specific block directly
    await page.goto('/#/block/25500');

    // Wait for block detail page to load
    await expect(
      page.locator('.card-header h5').filter({ hasText: /Block #/ }),
    ).toBeVisible({ timeout: 15000 });

    // Check that block details are displayed
    await expect(page.locator('text=State Hash').first()).toBeVisible();
    await expect(page.locator('text=Block Producer').first()).toBeVisible();
    await expect(page.locator('text=Timestamp').first()).toBeVisible();
  });

  test('block detail page loads from link', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks to load
    const recentBlocksSection = page
      .locator('.card')
      .filter({ hasText: 'Recent Blocks' });
    await expect(recentBlocksSection).toBeVisible({ timeout: 15000 });

    // Click on the first block
    const firstBlockLink = recentBlocksSection
      .locator('tbody tr')
      .first()
      .locator('a')
      .first();
    await expect(firstBlockLink).toBeVisible({ timeout: 15000 });

    const blockHeight = await firstBlockLink.textContent();
    console.log('Clicking on block:', blockHeight);

    await firstBlockLink.click();

    // Wait for block detail page to load
    await expect(
      page.locator('.card-header h5').filter({ hasText: /Block #/ }),
    ).toBeVisible({ timeout: 15000 });

    // Check that block details are displayed
    await expect(page.locator('text=State Hash').first()).toBeVisible();
    await expect(page.locator('text=Block Producer').first()).toBeVisible();
  });

  test('search by block height works', async ({ page }) => {
    await page.goto('/');

    // Type in search box and submit
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill('25500');
    await searchInput.press('Enter');

    // Should navigate to block detail page
    await expect(page).toHaveURL(/\/block\/25500/);
    await expect(
      page.locator('.card-header h5').filter({ hasText: /Block #/ }),
    ).toBeVisible({ timeout: 15000 });
  });

  test('network selector shows current network', async ({ page }) => {
    await page.goto('/');

    // Check that network selector button is visible with Mesa text
    await expect(
      page.locator('button.dropdown-toggle:has-text("Mesa")'),
    ).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Click on Blocks link in navbar
    await page.click('a.nav-link:has-text("Blocks")');
    await expect(page).toHaveURL(/\/blocks/);

    // Click on logo to go back home
    await page.click('a.navbar-brand');
    await expect(page).toHaveURL(/\/#?\/?$/);
  });

  test('404 page for invalid routes', async ({ page }) => {
    await page.goto('/#/invalid-route-that-does-not-exist');

    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });

  test('refresh button works on blocks page', async ({ page }) => {
    await page.goto('/#/blocks');

    // Wait for blocks to load
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Click refresh button
    const refreshButton = page.locator('button:has(.bi-arrow-clockwise)');
    await refreshButton.click();

    // Blocks should still be visible after refresh
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });
  });
});
