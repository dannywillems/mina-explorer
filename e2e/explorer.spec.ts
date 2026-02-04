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
    const refreshButton = page.locator('button:has-text("Refresh")');
    await refreshButton.click();

    // Blocks should still be visible after refresh
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Network Picker', () => {
  test('dropdown shows all available networks', async ({ page }) => {
    await page.goto('/');

    // Click on network selector dropdown
    const networkButton = page.locator('button.dropdown-toggle');
    await expect(networkButton).toBeVisible();
    await networkButton.click();

    // Check that all three networks are listed
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    await expect(dropdownMenu.locator('text=Mesa')).toBeVisible();
    await expect(dropdownMenu.locator('text=Devnet')).toBeVisible();
    await expect(dropdownMenu.locator('text=Mainnet')).toBeVisible();
  });

  test('default network is Mesa with testnet badge', async ({ page }) => {
    await page.goto('/');

    // Check that Mesa is selected by default
    const networkButton = page.locator('button.dropdown-toggle');
    await expect(networkButton).toContainText('Mesa');

    // Check that testnet badge is shown
    await expect(
      networkButton.locator('.badge:has-text("Testnet")'),
    ).toBeVisible();
  });

  test('can switch to Devnet', async ({ page }) => {
    await page.goto('/');

    // Wait for initial data to load
    const blockHeightCard = page
      .locator('.card')
      .filter({ hasText: 'Block Height' });
    await expect(blockHeightCard).toBeVisible({ timeout: 15000 });

    // Click on network selector
    const networkButton = page.locator('button.dropdown-toggle');
    await networkButton.click();

    // Wait for dropdown menu to be visible
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    // Click on Devnet
    await dropdownMenu.locator('button:has-text("Devnet")').click();

    // Verify network button now shows Devnet
    await expect(networkButton).toContainText('Devnet');

    // Verify testnet badge is still shown (Devnet is a testnet)
    await expect(
      networkButton.locator('.badge:has-text("Testnet")'),
    ).toBeVisible();

    // Wait for data to reload with new network
    await expect(blockHeightCard.locator('h4')).not.toBeEmpty({
      timeout: 15000,
    });
  });

  test('can switch to Mainnet', async ({ page }) => {
    await page.goto('/');

    // Wait for initial data to load
    const blockHeightCard = page
      .locator('.card')
      .filter({ hasText: 'Block Height' });
    await expect(blockHeightCard).toBeVisible({ timeout: 15000 });

    // Click on network selector
    const networkButton = page.locator('button.dropdown-toggle');
    await networkButton.click();

    // Wait for dropdown menu to be visible
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    // Click on Mainnet
    await dropdownMenu.locator('button:has-text("Mainnet")').click();

    // Verify network button now shows Mainnet
    await expect(networkButton).toContainText('Mainnet');

    // Verify testnet badge is NOT shown (Mainnet is not a testnet)
    await expect(
      networkButton.locator('.badge:has-text("Testnet")'),
    ).not.toBeVisible();
  });

  test('selected network is marked as active in dropdown', async ({ page }) => {
    await page.goto('/');

    // Click on network selector
    const networkButton = page.locator('button.dropdown-toggle');
    await networkButton.click();

    // Wait for dropdown menu to be visible
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    // Check that Mesa (default) has the active class
    const mesaItem = dropdownMenu.locator('button:has-text("Mesa")');
    await expect(mesaItem).toHaveClass(/active/);

    // Devnet should not have the active class
    const devnetItem = dropdownMenu.locator('button:has-text("Devnet")');
    await expect(devnetItem).not.toHaveClass(/active/);
  });

  test('network switch persists after navigation', async ({ page }) => {
    await page.goto('/');

    // Switch to Devnet
    const networkButton = page.locator('button.dropdown-toggle');
    await networkButton.click();

    // Wait for dropdown menu to be visible
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    await dropdownMenu.locator('button:has-text("Devnet")').click();

    // Verify Devnet is selected
    await expect(networkButton).toContainText('Devnet');

    // Navigate to blocks page
    await page.click('a.nav-link:has-text("Blocks")');
    await expect(page).toHaveURL(/\/blocks/);

    // Verify Devnet is still selected
    await expect(networkButton).toContainText('Devnet');

    // Navigate back to home
    await page.click('a.navbar-brand');

    // Verify Devnet is still selected
    await expect(networkButton).toContainText('Devnet');
  });

  test('network switch reloads blocks data', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks to load
    const recentBlocksSection = page
      .locator('.card')
      .filter({ hasText: 'Recent Blocks' });
    await expect(recentBlocksSection).toBeVisible({ timeout: 15000 });

    const tableRows = recentBlocksSection.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Get first block height before switch
    const firstBlockBefore = await tableRows
      .first()
      .locator('a')
      .first()
      .textContent();
    console.log('Block height before network switch:', firstBlockBefore);

    // Switch to Devnet
    const networkButton = page.locator('button.dropdown-toggle');
    await networkButton.click();

    // Wait for dropdown menu to be visible
    const dropdownMenu = page.locator('.dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    await dropdownMenu.locator('button:has-text("Devnet")').click();

    // Wait for data to reload
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Get first block height after switch
    const firstBlockAfter = await tableRows
      .first()
      .locator('a')
      .first()
      .textContent();
    console.log('Block height after network switch:', firstBlockAfter);

    // Block heights should exist (data loaded successfully)
    expect(firstBlockAfter).toBeTruthy();
  });
});
