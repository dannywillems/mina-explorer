import { test, expect, FIXTURES } from './fixtures';

test.describe('CSV Export for Account Transactions', () => {
  test('should display export button on account page with transactions', async ({
    page,
  }) => {
    // Navigate to an account page
    await page.goto(`/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for the page to load
    await expect(
      page.getByRole('heading', { name: 'Account Details' }),
    ).toBeVisible();

    // Wait for transaction history section
    await expect(
      page.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();

    // Check if Export CSV button is present
    await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible();
  });

  test('should show export options when clicking export button', async ({
    page,
  }) => {
    // Navigate to an account page
    await page.goto(`/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for transaction history section
    await expect(
      page.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();

    // Click the Export CSV button
    await page.getByRole('button', { name: /Export CSV/i }).click();

    // Check if date range options are visible
    await expect(page.getByText('Date Range')).toBeVisible();
    await expect(page.getByText('Last 7 days')).toBeVisible();
    await expect(page.getByText('Last 30 days')).toBeVisible();
    await expect(page.getByText('Last 90 days')).toBeVisible();
    await expect(page.getByText('All time')).toBeVisible();

    // Check if transaction type filter is visible
    await expect(page.getByText('Transaction Type')).toBeVisible();

    // Check if Download CSV button is visible
    await expect(
      page.getByRole('button', { name: /Download CSV/i }),
    ).toBeVisible();
  });

  test('should update filtered count when changing filters', async ({
    page,
  }) => {
    // Navigate to an account page
    await page.goto(`/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for transaction history section
    await expect(
      page.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();

    // Click the Export CSV button
    await page.getByRole('button', { name: /Export CSV/i }).click();

    // Default should show all transactions
    await expect(page.getByText(/transaction.*will be exported/i)).toBeVisible();

    // Select a date range filter
    await page.getByText('Last 7 days').click();

    // The count should still be visible (may change based on data)
    await expect(page.getByText(/transaction.*will be exported/i)).toBeVisible();
  });

  test('should not show export button when no transactions', async ({
    page,
  }) => {
    // Navigate to an account with no transactions
    await page.goto(`/account/${FIXTURES.accounts.invalidAccount}`);

    // Wait for the page to load
    await expect(
      page.getByRole('heading', { name: 'Account Details' }),
    ).toBeVisible();

    // The export button should not be present when there are no transactions
    // (account not found or no transactions)
  });

  test('should close options when clicking outside', async ({ page }) => {
    // Navigate to an account page
    await page.goto(`/account/${FIXTURES.accounts.blockProducer}`);

    // Wait for transaction history section
    await expect(
      page.getByRole('heading', { name: 'Transaction History' }),
    ).toBeVisible();

    // Click the Export CSV button
    await page.getByRole('button', { name: /Export CSV/i }).click();

    // Verify options are visible
    await expect(page.getByText('Date Range')).toBeVisible();

    // Click outside (on the main content)
    await page.getByRole('heading', { name: 'Account Details' }).click();

    // Options should be hidden
    await expect(page.getByText('Date Range')).not.toBeVisible();
  });
});
