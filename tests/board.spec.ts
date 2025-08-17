import { test, expect } from '@playwright/test';

test.describe('Boards - Columns and Tasks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    const demoBtn = page.getByRole('button', { name: /try demo account/i });
    await demoBtn.click();
    await page.waitForURL(/\/boards(\/.*)?$/);
  });

  test('renders columns and tasks; can open task details dialog', async ({
    page,
  }) => {
    // Columns render
    const columns = page.locator(
      '[data-rbd-droppable-id], div:has-text("This board is empty")',
    );
    await expect(columns.first()).toBeVisible();

    // Find a task card by role (Card uses divs; fallback to heading text in card)
    const anyTaskTitle = page.locator('h3,h2,h4').first();
    await expect(anyTaskTitle).toBeVisible();

    // Click the card container (closest clickable)
    await anyTaskTitle.click();

    // Task Details dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close dialog by pressing Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
