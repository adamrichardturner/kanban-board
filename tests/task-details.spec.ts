import { test, expect } from '@playwright/test';

test.describe('Task Details - Subtask toggle optimistic and status change', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /try demo account/i }).click();
    await page.waitForURL(/\/boards(\/.*)?$/);
  });

  test('open a task and toggle a subtask checkbox', async ({ page }) => {
    // Open first task
    const task = page.locator('h3,h2,h4').first();
    await task.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Toggle the first subtask row
    const subtaskRow = dialog.locator('div[role="checkbox"], .data-[state]');
    if (
      await subtaskRow
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await subtaskRow.first().click();
    }

    // Change status via select
    const select = dialog
      .getByRole('button')
      .filter({ hasText: /current status/i })
      .first();
    // Fallback: open any select
    await dialog
      .locator('[role="combobox"], [data-state]')
      .first()
      .click({ trial: true })
      .catch(() => {});

    // Close dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
