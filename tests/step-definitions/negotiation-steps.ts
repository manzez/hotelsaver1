import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { page } from './common-steps';

// Negotiation Steps
Given('I have searched for hotels in {string}', async (city: string) => {
  await page.goto(`/search?city=${city}`);
  await page.locator('[data-testid="search-results"]').waitFor();
});

Given('I can see hotel search results', async () => {
  await page.locator('[data-testid="hotel-card"]').first().waitFor();
});

Given('I see a hotel {string} with base price {string}', async (hotelName: string, price: string) => {
  const hotelCard = page.locator(`[data-testid="hotel-card"]:has-text("${hotelName}")`);
  await expect(hotelCard).toBeVisible();
  await expect(hotelCard.locator('[data-testid="hotel-price"]')).toContainText(price);
});

When('I click {string} button', async (buttonText: string) => {
  await page.locator(`button:has-text("${buttonText}")`).click();
});

Then('I should be redirected to the negotiation page', async () => {
  await expect(page).toHaveURL(/\/negotiate/);
});

Then('I should see the original price {string}', async (originalPrice: string) => {
  const originalPriceElement = page.locator('[data-testid="original-price"]');
  await expect(originalPriceElement).toContainText(originalPrice);
});

When('I submit the negotiation request', async () => {
  await page.locator('[data-testid="negotiate-submit"]').click();
});

Then('I should see a discounted offer', async () => {
  await page.locator('[data-testid="discount-offer"]').waitFor();
});

Then('I should see the discount percentage applied \\({int}% default\\)', async (percentage: number) => {
  const discountElement = page.locator('[data-testid="discount-percentage"]');
  await expect(discountElement).toContainText(`${percentage}%`);
});

Then('I should see the savings amount {string}', async (savingsAmount: string) => {
  const savingsElement = page.locator('[data-testid="savings-amount"]');
  await expect(savingsElement).toContainText(savingsAmount);
});

Then('I should see the new price {string}', async (newPrice: string) => {
  const newPriceElement = page.locator('[data-testid="negotiated-price"]');
  await expect(newPriceElement).toContainText(newPrice);
});

Then('I should see a {int}-minute countdown timer', async (minutes: number) => {
  const timerElement = page.locator('[data-testid="countdown-timer"]');
  await expect(timerElement).toBeVisible();
  // Check that timer shows something close to the expected minutes
  const timerText = await timerElement.textContent();
  expect(timerText).toMatch(/[4-5]:[0-5][0-9]/); // Should show 4:xx or 5:xx
});

Then('I should see {string}', async (expectedText: string) => {
  await expect(page.locator('body')).toContainText(expectedText);
});

// Pricing Calculation Steps
Given('I have selected dates {string} \\({int} nights\\)', async (dateRange: string, nights: number) => {
  // This assumes the dates are already set in the URL or previous navigation
  const nightsDisplay = page.locator('[data-testid="nights-count"]');
  await expect(nightsDisplay).toContainText(`${nights} night`);
});

Given('I have selected {string}', async (guestConfiguration: string) => {
  // Verify the guest configuration is displayed correctly
  const guestDisplay = page.locator('[data-testid="guest-configuration"]');
  await expect(guestDisplay).toContainText(guestConfiguration);
});

Given('I see a hotel with base price {string}', async (basePrice: string) => {
  const priceElement = page.locator('[data-testid="base-price"]');
  await expect(priceElement).toContainText(basePrice);
});

Then('I should see the calculation breakdown:', async (dataTable: any) => {
  const rows = dataTable.hashes();
  
  for (const row of rows) {
    const item = row['Item'];
    const calculation = row['Calculation'];
    const amount = row['Amount'];
    
    // Find the breakdown row for this item
    const breakdownRow = page.locator(`[data-testid="breakdown-${item.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(breakdownRow).toBeVisible();
    
    if (calculation) {
      await expect(breakdownRow).toContainText(calculation);
    }
    
    await expect(breakdownRow).toContainText(amount);
  }
});

When('I negotiate the price', async () => {
  await page.locator('[data-testid="negotiate-button"]').click();
  await page.locator('[data-testid="negotiate-submit"]').click();
});

Then('the system should calculate:', async (dataTable: any) => {
  const calculations = dataTable.hashes();
  
  for (const calc of calculations) {
    const component = calc['Component'];
    const value = calc['Value'];
    
    const calculationElement = page.locator(`[data-testid="${component.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(calculationElement).toContainText(value);
  }
});

// Timer Steps
Given('I have received a negotiated price offer', async () => {
  // Assumes we're on the negotiation page with an active offer
  await page.locator('[data-testid="negotiated-offer"]').waitFor();
});

When('I see the {int}-minute countdown timer', async (minutes: number) => {
  const timer = page.locator('[data-testid="countdown-timer"]');
  await expect(timer).toBeVisible();
});

Then('the timer should count down from {string}', async (startTime: string) => {
  const timer = page.locator('[data-testid="countdown-timer"]');
  // Wait a moment and verify the timer is counting down
  await page.waitForTimeout(2000);
  const currentTime = await timer.textContent();
  // The current time should be less than the start time
  expect(currentTime).not.toBe(startTime);
});

Then('the timer should update every second', async () => {
  const timer = page.locator('[data-testid="countdown-timer"]');
  const initialTime = await timer.textContent();
  
  // Wait 2 seconds and check that time has changed
  await page.waitForTimeout(2000);
  const updatedTime = await timer.textContent();
  
  expect(updatedTime).not.toBe(initialTime);
});

When('the timer reaches {string}', async (endTime: string) => {
  // Wait for timer to reach specified time (for testing, we might need to mock this)
  await page.waitForFunction(
    (targetTime) => {
      const timerElement = document.querySelector('[data-testid="countdown-timer"]');
      return timerElement?.textContent === targetTime;
    },
    endTime,
    { timeout: 10000 }
  );
});

Then('I should see {string} message', async (message: string) => {
  await expect(page.locator(`text=${message}`)).toBeVisible();
});

Then('the {string} button should be disabled', async (buttonText: string) => {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeDisabled();
});

Then('I should see a {string} button', async (buttonText: string) => {
  const button = page.locator(`button:has-text("${buttonText}")`);
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
});