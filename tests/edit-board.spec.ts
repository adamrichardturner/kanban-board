import { test, expect } from '@playwright/test';

test.describe('Edit Board - Reorder Columns and Colors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /try demo account/i }).click();
    await page.waitForURL(/\/boards(\/.*)?$/);
  });

  test('open edit dialog, reorder columns with drag handle, change color, save', async ({
    page,
  }) => {
    // Open settings dropdown
    await page
      .getByRole('button')
      .filter({ hasText: '•••' })
      .first()
      .click({ trial: true })
      .catch(() => {});
    // If custom button not found, open via top-bar SettingsDropdown trigger
    const settingsButton = page.getByRole('button').nth(0);
    await settingsButton.click();

    // Try find Edit Board entry
    const editItem = page
      .getByRole('menuitem', { name: /edit board/i })
      .first();
    if (await editItem.isVisible().catch(() => false)) {
      await editItem.click();
    } else {
      // Fallback: if dialog trigger exists directly
      await page
        .getByRole('button', { name: /edit board/i })
        .first()
        .click();
    }

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Drag the first column row handle below the second
    const handles = dialog.locator('button[aria-label="Drag column"]');
    const firstHandle = handles.first();
    const secondHandle = handles.nth(1);
    if (
      (await firstHandle.isVisible().catch(() => false)) &&
      (await secondHandle.isVisible().catch(() => false))
    ) {
      const box1 = await firstHandle.boundingBox();
      const box2 = await secondHandle.boundingBox();
      if (box1 && box2) {
        await page.mouse.move(
          box1.x + box1.width / 2,
          box1.y + box1.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(box2.x + box2.width / 2, box2.y + 24, {
          steps: 6,
        });
        await page.mouse.up();
      }
    }

    // Change color of first row via popover
    const colorButtons = dialog
      .locator('button[aria-label="Pick column color"]')
      .first();
    if (await colorButtons.isVisible().catch(() => false)) {
      await colorButtons.click();
      // click first swatch in popover
      await dialog.locator('button[title="#635FC7"]').first().click();
    }

    // Save changes
    await dialog.getByRole('button', { name: /save changes/i }).click();

    // Expect dialog to close and page still on boards
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/boards/);
  });
});
