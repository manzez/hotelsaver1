import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, expect } from '@playwright/test';

let browser: Browser;
let context: BrowserContext;
let page: Page;

// Hooks
Before(async () => {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  page = await context.newPage();
});

After(async () => {
  await page?.close();
  await context?.close();
  await browser?.close();
});

// Common Steps
Given('I am on the HotelSaver homepage', async () => {
  await page.goto('/');
  await expect(page).toHaveTitle(/HotelSaver/);
});

Given('I am on the homepage', async () => {
  await page.goto('/');
});

// Search Steps
Given('the search bar displays default dates {string}', async (dateRange: string) => {
  const dateField = page.locator('[data-testid="date-picker-field"]');
  await expect(dateField).toContainText(dateRange);
});

When('I view the search bar', async () => {
  await page.locator('[data-testid="search-bar"]').waitFor();
});

When('I enter {string} in the location field', async (location: string) => {
  await page.locator('[data-testid="location-input"]').fill(location);
});

When('I select check-in date as {string}', async (date: string) => {
  await page.locator('[data-testid="date-picker-field"]').click();
  // Wait for date picker modal
  await page.locator('[data-testid="date-picker-modal"]').waitFor();
  // Select the date (implementation depends on date picker component)
  await page.locator(`[data-date="${date}"]`).click();
});

When('I select check-out date as {string}', async (date: string) => {
  // Select checkout date in the same modal
  await page.locator(`[data-date="${date}"]`).click();
  await page.locator('[data-testid="date-picker-done"]').click();
});

When('I set guests to {string}', async (guestInfo: string) => {
  await page.locator('[data-testid="guest-picker"]').click();
  // Parse guest info like "3 adults, 1 child, 2 rooms"
  const guestMatch = guestInfo.match(/(\d+) adults?, (\d+) child(?:ren)?, (\d+) rooms?/);
  if (guestMatch) {
    const [, adults, children, rooms] = guestMatch;
    
    // Set adults
    const adultsInput = page.locator('[data-testid="adults-count"]');
    await adultsInput.fill(adults);
    
    // Set children
    const childrenInput = page.locator('[data-testid="children-count"]');
    await childrenInput.fill(children);
    
    // Set rooms
    const roomsInput = page.locator('[data-testid="rooms-count"]');
    await roomsInput.fill(rooms);
  }
  await page.locator('[data-testid="guest-picker-done"]').click();
});

When('I select budget range {string}', async (budgetRange: string) => {
  const budgetMap: Record<string, string> = {
    'Under ₦80k': 'u80',
    '₦80k–₦130k': '80_130',
    '₦130k–₦200k': '130_200',
    '₦200k+': '200p'
  };
  
  const budgetValue = budgetMap[budgetRange];
  await page.locator(`[data-budget="${budgetValue}"]`).click();
});

When('I select stay type {string}', async (stayType: string) => {
  await page.locator(`[data-stay-type="${stayType.toLowerCase()}"]`).click();
});

When('I click the search button', async () => {
  await page.locator('[data-testid="search-submit"]').click();
});

// Search Results Steps
Then('I should be redirected to the search results page', async () => {
  await expect(page).toHaveURL(/\/search/);
});

Then('I should see search results for {string}', async (city: string) => {
  await page.locator('[data-testid="search-results"]').waitFor();
  const resultsHeader = page.locator('[data-testid="results-header"]');
  await expect(resultsHeader).toContainText(city);
});

Then('I should see {string} in the results summary', async (nightsInfo: string) => {
  const summary = page.locator('[data-testid="results-summary"]');
  await expect(summary).toContainText(nightsInfo);
});

Then('I should see hotels with prices between ₦{int} and ₦{int}', async (minPrice: number, maxPrice: number) => {
  const hotelCards = page.locator('[data-testid="hotel-card"]');
  const count = await hotelCards.count();
  
  for (let i = 0; i < count; i++) {
    const priceElement = hotelCards.nth(i).locator('[data-testid="hotel-price"]');
    const priceText = await priceElement.textContent();
    const price = parseInt(priceText?.replace(/[₦,]/g, '') || '0');
    expect(price).toBeGreaterThanOrEqual(minPrice);
    expect(price).toBeLessThanOrEqual(maxPrice);
  }
});

// Assertion Steps
Then('I should see {string} as default dates', async (dateRange: string) => {
  const dateField = page.locator('[data-testid="date-picker-field"]');
  await expect(dateField).toContainText(dateRange);
});

Then('I should see {string} as default guests', async (guestInfo: string) => {
  const guestField = page.locator('[data-testid="guest-picker-display"]');
  await expect(guestField).toContainText(guestInfo);
});

Then('I should see {string} as default budget', async (budgetRange: string) => {
  const budgetField = page.locator('[data-testid="budget-display"]');
  await expect(budgetField).toContainText(budgetRange);
});

export { page, context, browser };