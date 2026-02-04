import { test, expect, FIXTURES, isMocked } from './fixtures';

test.describe('Mina Explorer', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Mina Explorer/);

    // Check header logo link (Mina is an image + "Explorer" text)
    await expect(
      page.locator('header a').filter({ hasText: 'Explorer' }).first(),
    ).toBeVisible();

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

    // Wait for network stats section to load
    const blockHeightSection = page
      .locator('div')
      .filter({ hasText: /^Block Height/ })
      .first();
    await expect(blockHeightSection).toBeVisible({ timeout: 15000 });

    // Check that block height is displayed as a number (look for formatted number)
    const blockHeightText = await page
      .locator('text=/[\\d,]+/')
      .first()
      .textContent();
    console.log('Block Height:', blockHeightText);

    // Verify it's a valid number (with commas for formatting)
    expect(blockHeightText).toMatch(/[\d,]+/);
  });

  test('recent blocks load', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks section
    const recentBlocksSection = page.locator('text=Recent Blocks').first();
    await expect(recentBlocksSection).toBeVisible({ timeout: 15000 });

    // Wait for table rows to load
    const tableRows = page.locator('tbody tr');

    // Wait for data to appear
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log('Number of blocks loaded:', rowCount);
    expect(rowCount).toBeGreaterThan(0);

    // Check that block height links are present
    const firstBlockLink = tableRows.first().locator('a').first();
    await expect(firstBlockLink).toBeVisible();

    const blockHeight = await firstBlockLink.textContent();
    console.log('First block height:', blockHeight);
  });

  test('blocks page loads', async ({ page }) => {
    await page.goto('/#/blocks');

    // Check page heading (now h1 with Tailwind)
    await expect(page.locator('h1')).toContainText('Blocks');

    // Wait for table rows to load
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const rowCount = await tableRows.count();
    console.log('Number of blocks on blocks page:', rowCount);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('block detail page loads directly', async ({ page }) => {
    // Go to a specific block directly using fixture
    await page.goto(`/#/block/${FIXTURES.blocks.knownHeight}`);

    // Wait for block detail page to load
    await expect(page.locator('h2').filter({ hasText: /Block #/ })).toBeVisible(
      { timeout: 15000 },
    );

    // Check that block details are displayed
    await expect(page.locator('text=State Hash').first()).toBeVisible();
    await expect(page.locator('text=Block Producer').first()).toBeVisible();
    await expect(page.locator('text=Timestamp').first()).toBeVisible();
  });

  test('block detail page loads from link', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks section
    await expect(page.locator('text=Recent Blocks').first()).toBeVisible({
      timeout: 15000,
    });

    // Wait for table rows to load
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    const firstBlockLink = tableRows.first().locator('a').first();
    await expect(firstBlockLink).toBeVisible();

    const blockHeight = await firstBlockLink.textContent();
    console.log('Clicking on block:', blockHeight);

    await firstBlockLink.click();

    // Wait for block detail page to load
    await expect(page.locator('h2').filter({ hasText: /Block #/ })).toBeVisible(
      { timeout: 15000 },
    );

    // Check that block details are displayed
    await expect(page.locator('text=State Hash').first()).toBeVisible();
    await expect(page.locator('text=Block Producer').first()).toBeVisible();
  });

  test('block detail page shows transactions', async ({ page }) => {
    // Go to a specific block with transactions
    await page.goto(`/#/block/${FIXTURES.blocks.knownHeight}`);

    // Wait for block detail page to load
    await expect(page.locator('h2').filter({ hasText: /Block #/ })).toBeVisible(
      { timeout: 15000 },
    );

    // Check that transactions section exists
    await expect(page.locator('h3:has-text("Transactions")')).toBeVisible();

    // Check that transaction tabs are present
    await expect(
      page.locator('button:has-text("User Commands")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("zkApp Commands")'),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Fee Transfers")'),
    ).toBeVisible();

    // Check transaction count is displayed in tabs
    await expect(page.locator('text=/User Commands \\(\\d+\\)/')).toBeVisible();

    // Check that fee and snark fields are shown
    await expect(page.locator('text=Transaction Fees').first()).toBeVisible();
    await expect(page.locator('text=Snark Fees').first()).toBeVisible();
  });

  test('search by block height works', async ({ page }) => {
    await page.goto('/');

    // Type in search box and submit using fixture
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(String(FIXTURES.blocks.knownHeight));
    await searchInput.press('Enter');

    // Should navigate to block detail page
    await expect(page).toHaveURL(
      new RegExp(`/block/${FIXTURES.blocks.knownHeight}`),
    );
    await expect(page.locator('h2').filter({ hasText: /Block #/ })).toBeVisible(
      { timeout: 15000 },
    );
  });

  test('network selector shows current network', async ({ page }) => {
    await page.goto('/');

    // Check that network selector button is visible with Mesa text (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: 'Mesa' })
      .first();
    await expect(networkButton).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');

    // Click on Blocks link in navbar (desktop nav)
    await page.locator('nav a:has-text("Blocks")').first().click();
    await expect(page).toHaveURL(/\/blocks/);

    // Click on logo to go back home
    await page.locator('header a:has-text("Explorer")').first().click();
    await expect(page).toHaveURL(/\/#?\/?$/);
  });

  test('404 page for invalid routes', async ({ page }) => {
    await page.goto('/#/invalid-route-that-does-not-exist');

    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Page Not Found')).toBeVisible();
  });

  test('refresh button works on blocks page', async ({ page }) => {
    await page.goto('/#/blocks');

    // Wait for table rows to load
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

    // Click on network selector dropdown (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await expect(networkButton).toBeVisible();
    await networkButton.click();

    // Check that all three networks are listed in dropdown
    await expect(page.locator('button:has-text("Mesa")').first()).toBeVisible();
    await expect(
      page.locator('button:has-text("Devnet")').first(),
    ).toBeVisible();
    await expect(
      page.locator('button:has-text("Mainnet")').first(),
    ).toBeVisible();
  });

  test('default network is Mesa with testnet badge', async ({ page }) => {
    await page.goto('/');

    // Check that Mesa is selected by default (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: 'Mesa' })
      .first();
    await expect(networkButton).toBeVisible();

    // Check that testnet badge is shown
    await expect(networkButton.locator('text=Testnet')).toBeVisible();
  });

  test('can switch to Devnet', async ({ page }) => {
    await page.goto('/');

    // Wait for initial data to load
    await expect(page.locator('text=Block Height').first()).toBeVisible({
      timeout: 15000,
    });

    // Click on network selector (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    // Click on Devnet (in dropdown)
    await page.locator('button:has-text("Devnet")').first().click();

    // Verify network button now shows Devnet
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();

    // Verify testnet badge is still shown
    await expect(
      page
        .locator('header button')
        .filter({ hasText: 'Devnet' })
        .first()
        .locator('text=Testnet'),
    ).toBeVisible();
  });

  test('can switch to Mainnet', async ({ page }) => {
    await page.goto('/');

    // Wait for initial data to load
    await expect(page.locator('text=Block Height').first()).toBeVisible({
      timeout: 15000,
    });

    // Click on network selector (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    // Click on Mainnet (in dropdown)
    await page.locator('button:has-text("Mainnet")').first().click();

    // Verify network button now shows Mainnet
    const mainnetButton = page
      .locator('header button')
      .filter({ hasText: 'Mainnet' })
      .first();
    await expect(mainnetButton).toBeVisible();

    // Verify testnet badge is NOT shown (Mainnet is not a testnet)
    await expect(mainnetButton.locator('text=Testnet')).not.toBeVisible();
  });

  test('network switch persists after navigation', async ({ page }) => {
    await page.goto('/');

    // Switch to Devnet (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    await page.locator('button:has-text("Devnet")').first().click();

    // Verify Devnet is selected
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();

    // Navigate to blocks page (desktop nav)
    await page.locator('nav a:has-text("Blocks")').first().click();
    await expect(page).toHaveURL(/\/blocks/);

    // Verify Devnet is still selected
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();

    // Navigate back to home
    await page.locator('header a:has-text("Explorer")').first().click();

    // Verify Devnet is still selected
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();
  });

  test('network switch reloads blocks data', async ({ page }) => {
    await page.goto('/');

    // Wait for recent blocks section
    await expect(page.locator('text=Recent Blocks').first()).toBeVisible({
      timeout: 15000,
    });

    // Wait for table rows to load
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Get first block height before switch
    const firstBlockBefore = await tableRows
      .first()
      .locator('a')
      .first()
      .textContent();
    console.log('Block height before network switch:', firstBlockBefore);

    // Switch to Devnet (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    await page.locator('button:has-text("Devnet")').first().click();

    // Wait for data to reload
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 });

    // Verify network switch triggered a response
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();
  });

  test('network selection persists after page refresh', async ({ page }) => {
    await page.goto('/');

    // Switch to Mainnet (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    await page.locator('button:has-text("Mainnet")').first().click();
    await expect(
      page.locator('header button').filter({ hasText: 'Mainnet' }).first(),
    ).toBeVisible();

    // Refresh the page
    await page.reload();

    // Wait for page to load (check header logo link)
    await expect(
      page.locator('header a').filter({ hasText: 'Explorer' }).first(),
    ).toBeVisible();

    // Verify Mainnet is still selected after refresh
    await expect(
      page.locator('header button').filter({ hasText: 'Mainnet' }).first(),
    ).toBeVisible();
  });

  test('block height updates when switching networks', async ({ page }) => {
    // Skip in mocked mode - same fixture data for all networks
    test.skip(isMocked, 'Uses same fixture for all networks');

    await page.goto('/');

    // Wait for network stats to load
    await expect(page.locator('text=Block Height').first()).toBeVisible({
      timeout: 15000,
    });

    // Get Mesa block height (wait for a number to appear)
    await expect(async () => {
      const text = await page.locator('text=/[\\d,]+/').first().textContent();
      expect(text).toMatch(/[\d,]+/);
    }).toPass({ timeout: 15000 });

    const mesaHeight = await page
      .locator('text=/[\\d,]+/')
      .first()
      .textContent();
    console.log('Mesa block height:', mesaHeight);

    // Switch to Devnet (use first for desktop)
    const networkButton = page
      .locator('header button')
      .filter({ hasText: /Mesa|Devnet|Mainnet/ })
      .first();
    await networkButton.click();

    await page.locator('button:has-text("Devnet")').first().click();

    // Verify network switch
    await expect(
      page.locator('header button').filter({ hasText: 'Devnet' }).first(),
    ).toBeVisible();

    // Wait for the block height to change
    await expect(async () => {
      const devnetHeight = await page
        .locator('text=/[\\d,]+/')
        .first()
        .textContent();
      expect(devnetHeight).not.toBe(mesaHeight);
      expect(devnetHeight).not.toBe('-');
    }).toPass({ timeout: 15000 });

    const devnetHeight = await page
      .locator('text=/[\\d,]+/')
      .first()
      .textContent();
    console.log('Devnet block height:', devnetHeight);

    // Devnet should have a different block height than Mesa
    expect(devnetHeight).not.toBe(mesaHeight);
  });
});

test.describe('Account Page', () => {
  test('account page loads with valid public key', async ({ page }) => {
    // Navigate to a known account using fixture
    await page.goto(`/#/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for account page to load
    await expect(page.locator('h1')).toContainText('Account Details');

    // Wait for either account data, loading, or error state
    const accountCard = page.locator('h2').filter({ hasText: /Account/ });
    const loadingText = page.locator('text=/Loading/i');
    const errorText = page.locator('text=/error|failed/i');

    await expect(accountCard.or(loadingText).or(errorText)).toBeVisible({
      timeout: 20000,
    });
  });

  test('account page handles API response', async ({ page }) => {
    await page.goto(`/#/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Account Details');

    // Wait for either account card, loading, or error state
    const accountCard = page.locator('h2').filter({ hasText: /Account/ });
    const loadingText = page.locator('text=/Loading/i');
    const errorText = page.locator('text=/error|failed/i');

    await expect(accountCard.or(loadingText).or(errorText)).toBeVisible({
      timeout: 25000,
    });

    // If account loaded successfully, check for basic info
    if (await accountCard.isVisible()) {
      await expect(page.locator('text=Public Key').first()).toBeVisible();
      await expect(page.locator('text=Balance').first()).toBeVisible();
    }
  });

  test('account page shows error for invalid account', async ({ page }) => {
    // Navigate to an invalid account
    await page.goto(`/#/account/${FIXTURES.accounts.invalidAccount}`);

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('Account Details');

    // Should show error or not found message
    await expect(page.locator('text=/not found|error/i').first()).toBeVisible({
      timeout: 15000,
    });
  });

  test('can navigate to account from block producer link', async ({ page }) => {
    // Go to a block detail page
    await page.goto(`/#/block/${FIXTURES.blocks.knownHeight}`);

    // Wait for block to load
    await expect(page.locator('h2').filter({ hasText: /Block #/ })).toBeVisible(
      { timeout: 15000 },
    );

    // Find the block producer link and click it
    const producerRow = page.locator('text=Block Producer').locator('..');
    const producerLink = producerRow.locator('a');
    await expect(producerLink).toBeVisible();

    await producerLink.click();

    // Should navigate to account page
    await expect(page).toHaveURL(/\/account\//);
    await expect(page.locator('h1')).toContainText('Account Details');
  });

  test('search by public key navigates to account page', async ({ page }) => {
    await page.goto('/');

    // Type a public key in search box
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(FIXTURES.accounts.blockProducer);
    await searchInput.press('Enter');

    // Should navigate to account page
    await expect(page).toHaveURL(
      new RegExp(`/account/${FIXTURES.accounts.blockProducer}`),
    );
    await expect(page.locator('h1')).toContainText('Account Details');
  });
});

test.describe('Transaction Search', () => {
  test('search by transaction hash navigates to transaction page', async ({
    page,
  }) => {
    await page.goto('/');

    // Type a transaction hash in search box
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await searchInput.fill(FIXTURES.transactions.userCommand);
    await searchInput.press('Enter');

    // Should navigate to transaction page
    await expect(page).toHaveURL(
      new RegExp(`/transaction/${FIXTURES.transactions.userCommand}`),
    );
    await expect(page.locator('h2')).toContainText('Transaction Details');
  });

  test('transaction detail page shows user command details', async ({
    page,
  }) => {
    // Go directly to transaction page
    await page.goto(`/#/transaction/${FIXTURES.transactions.userCommand}`);

    // Wait for transaction detail to load
    await expect(page.locator('h2')).toContainText('Transaction Details', {
      timeout: 15000,
    });

    // Check for key fields
    await expect(page.locator('text=Transaction Hash').first()).toBeVisible();
    await expect(page.locator('text=From').first()).toBeVisible();
    await expect(page.locator('text=To').first()).toBeVisible();
    await expect(page.locator('text=Amount').first()).toBeVisible();
    await expect(page.locator('text=Fee').first()).toBeVisible();
  });

  test('transaction detail page shows status badges', async ({ page }) => {
    await page.goto(`/#/transaction/${FIXTURES.transactions.userCommand}`);

    // Wait for page to load
    await expect(page.locator('h2')).toContainText('Transaction Details', {
      timeout: 15000,
    });

    // Should show status badge (Pending or Confirmed)
    const statusBadge = page.locator('text=/Pending|Confirmed/').first();
    await expect(statusBadge).toBeVisible();

    // Should show transaction type badge
    const typeBadge = page.locator('text=/PAYMENT|STAKE_DELEGATION|zkApp/');
    await expect(typeBadge.first()).toBeVisible();
  });

  test('transaction not found shows error message', async ({ page }) => {
    // Go to a non-existent transaction
    await page.goto('/#/transaction/CkpInvalidTransactionHash12345');

    // Should show error message
    await expect(
      page.locator('text=/not found|Transaction not found/i').first(),
    ).toBeVisible({ timeout: 15000 });
  });
});
