import { test, expect } from '@playwright/test';

test.describe('Authentication - Demo Login', () => {
  test('logs in via Try Demo Account and navigates to first board', async ({
    page,
  }) => {
    await page.goto('/');

    // Click demo login button
    const demoBtn = page.getByRole('button', { name: /try demo account/i });
    await expect(demoBtn).toBeVisible();
    await demoBtn.click();

    // Ensure we navigate to /boards or /boards/:id
    await page.waitForURL(/\/boards(\/.*)?$/, { timeout: 15000 });

    // Top bar rendered with logo
    await expect(page.getByAltText('Kanban Board Logo').first()).toBeVisible();

    // Ensure loading spinner is not stuck
    await expect(page.locator('img[alt="Loading..."]').first()).toHaveCount(0);
  });
});
