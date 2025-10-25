import { test, expect } from '@playwright/test';

// New food ordering flow: restaurants -> order modal -> confirmation

test.describe('Food ordering flow (restaurants)', () => {
  test('Happy path: immediate delivery window', async ({ page }) => {
    await page.goto('/food');
    await page.waitForLoadState('networkidle');

    // Open the first restaurant order modal
    const orderButtons = page.locator('button:has-text("Order Now")');
    await expect(orderButtons.first()).toBeVisible();
    await orderButtons.first().click();

    // Modal should be visible
    await expect(page.getByText(/Order from/i)).toBeVisible();

    // Add two items (increment first menu item twice)
    const plusButtons = page.locator('div:has-text("Menu")').locator('button:has-text("+")');
    const plusCount = await plusButtons.count();
    if (plusCount > 0) {
      await plusButtons.nth(0).click();
      await plusButtons.nth(0).click();
    }

    // Fill contact details
    await page.getByPlaceholder('Full name').fill('Playwright Customer');
    await page.getByPlaceholder('Phone (WhatsApp)').fill('2347012345678');
    await page.getByPlaceholder('Delivery address').fill('10 Allen Ave, Ikeja, Lagos');

    // Submit order
    const confirmBtn = page.getByRole('button', { name: /Confirm Order/i });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Confirm we landed on confirmation page
    await expect(page).toHaveURL(/\/food\/confirmation/);
    await expect(page.getByText('Order Confirmed')).toBeVisible();

    // Reference should appear and start with FD
    const refRow = page.getByText('Reference:');
    await expect(refRow).toBeVisible();
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/FD\d{10,}/);
  });

  test('Scheduled delivery: set date and time', async ({ page }) => {
    await page.goto('/food');
    await page.waitForLoadState('networkidle');

    // Open first restaurant order modal
    const orderButtons = page.locator('button:has-text("Order Now")');
    await orderButtons.first().click();
    await expect(page.getByText(/Order from/i)).toBeVisible();

    // Add one item to enable confirm
    const plusButtons = page.locator('div:has-text("Menu")').locator('button:has-text("+")');
    if (await plusButtons.count()) {
      await plusButtons.first().click();
    }

    // Fill contact details
    await page.getByPlaceholder('Full name').fill('Schedule Customer');
    await page.getByPlaceholder('Phone (WhatsApp)').fill('2348090011223');
    await page.getByPlaceholder('Delivery address').fill('15 Admiralty Way, Lekki Phase 1, Lagos');

    // Set schedule date/time to tomorrow at 13:30
    const tomorrow = new Date(Date.now() + 24*60*60*1000);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    await page.locator('input[type="date"]').fill(dateStr);
    await page.locator('input[type="time"]').fill('13:30');

    // Submit order
    const confirmBtn = page.getByRole('button', { name: /Confirm Order/i });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Confirmation page with scheduled window
    await expect(page).toHaveURL(/\/food\/confirmation/);
    await expect(page.getByText('Order Confirmed')).toBeVisible();
    const detailsText = await page.textContent('.space-y-2');
    expect(detailsText || '').toMatch(/Delivery window:\s*Scheduled/);
  });
});
