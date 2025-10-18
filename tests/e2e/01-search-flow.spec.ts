import { test, expect, Page } from '@playwright/test';

// Test Data Constants
const TEST_CITIES = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
const BUDGET_RANGES = [
  { key: 'u80', label: 'Under ₦80k', min: 0, max: 80000 },
  { key: '80_130', label: '₦80k–₦130k', min: 80000, max: 130000 },
  { key: '130_200', label: '₦130k–₦200k', min: 130000, max: 200000 },
  { key: '200p', label: '₦200k+', min: 200000, max: 999999999 }
];

test.describe('Search Flow - Core Functionality', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('001: Homepage loads with search form', async () => {
    // Verify page title and main elements
    await expect(page).toHaveTitle(/HotelSaver/);
    
    // Check search form elements exist
    await expect(page.locator('[data-testid="city-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-picker"]')).toBeVisible();
    await expect(page.locator('[data-testid="guest-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
  });

  test('002: City selection works for all Nigerian cities', async () => {
    const citySelect = page.locator('[data-testid="city-select"]');
    
    for (const city of TEST_CITIES) {
      await citySelect.selectOption(city);
      await expect(citySelect).toHaveValue(city);
    }
  });

  test('003: Date picker initializes correctly on desktop', async () => {
    // Test date picker opens and accepts valid dates
    await page.locator('[data-testid="check-in-date"]').click();
    await expect(page.locator('.react-datepicker')).toBeVisible();
    
    // Select tomorrow as check-in
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayElement = page.locator(`[aria-label*="${tomorrow.getDate()}"]`).first();
    await dayElement.click();
    
    // Verify date was selected
    const checkInValue = await page.locator('[data-testid="check-in-date"]').inputValue();
    expect(checkInValue).toBeTruthy();
  });

  test('004: Guest counter functionality', async () => {
    // Test adult count increment/decrement
    const adultsPlus = page.locator('[data-testid="adults-plus"]');
    const adultsMinus = page.locator('[data-testid="adults-minus"]');
    const adultsCount = page.locator('[data-testid="adults-count"]');
    
    // Initial value should be 2
    await expect(adultsCount).toHaveText('2');
    
    // Increment adults
    await adultsPlus.click();
    await expect(adultsCount).toHaveText('3');
    
    // Decrement adults
    await adultsMinus.click();
    await expect(adultsCount).toHaveText('2');
    
    // Test minimum value (cannot go below 1)
    await adultsMinus.click();
    await expect(adultsCount).toHaveText('1');
    await adultsMinus.click();
    await expect(adultsCount).toHaveText('1'); // Should stay at 1
  });

  test('005: Budget range selection', async () => {
    for (const budget of BUDGET_RANGES) {
      await page.locator(`[data-testid="budget-${budget.key}"]`).click();
      
      // Verify selection is active
      await expect(page.locator(`[data-testid="budget-${budget.key}"]`)).toHaveClass(/active/);
    }
  });

  test('006: Form validation - requires city selection', async () => {
    // Try to search without selecting city
    await page.locator('[data-testid="search-button"]').click();
    
    // Should show validation error or remain on page
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/search');
  });

  test('007: Valid search redirects to results page', async () => {
    // Fill out complete search form
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    
    // Set check-in date (tomorrow)
    await page.locator('[data-testid="check-in-date"]').click();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.locator(`[aria-label*="${tomorrow.getDate()}"]`).first().click();
    
    // Set check-out date (day after tomorrow)
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    await page.locator(`[aria-label*="${dayAfter.getDate()}"]`).first().click();
    
    // Submit search
    await page.locator('[data-testid="search-button"]').click();
    
    // Verify redirection to search results
    await expect(page).toHaveURL(/\/search/);
  });

  test('008: Search parameters preserved in URL', async () => {
    // Perform search with specific parameters
    await page.locator('[data-testid="city-select"]').selectOption('Abuja');
    await page.locator('[data-testid="adults-plus"]').click(); // 3 adults
    await page.locator('[data-testid="budget-80_130"]').click();
    await page.locator('[data-testid="search-button"]').click();
    
    // Check URL contains search parameters
    const url = page.url();
    expect(url).toContain('city=Abuja');
    expect(url).toContain('adults=3');
    expect(url).toContain('budget=80_130');
  });
});

test.describe('Search Results - Data Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to search results with known parameters
    await page.goto('/search?city=Lagos&budget=u80&adults=2&children=0&rooms=1');
    await page.waitForLoadState('networkidle');
  });

  test('009: Search results display for Lagos', async () => {
    // Verify results are shown
    const resultsContainer = page.locator('[data-testid="search-results"]');
    await expect(resultsContainer).toBeVisible();
    
    // Check that hotel cards are displayed
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    await expect(hotelCards.first()).toBeVisible();
  });

  test('010: Hotel prices within budget range', async () => {
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    const count = await hotelCards.count();
    
    for (let i = 0; i < count; i++) {
      const priceElement = hotelCards.nth(i).locator('[data-testid="hotel-price"]');
      const priceText = await priceElement.textContent();
      
      // Extract numeric price (remove ₦ and commas)
      const price = parseInt(priceText?.replace(/[₦,]/g, '') || '0');
      
      // Verify price is under 80k (selected budget range)
      expect(price).toBeLessThan(80000);
    }
  });

  test('011: Hotel data consistency', async () => {
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    const firstCard = hotelCards.first();
    
    // Verify required elements exist
    await expect(firstCard.locator('[data-testid="hotel-name"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="hotel-city"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="hotel-stars"]')).toBeVisible();
    await expect(firstCard.locator('[data-testid="hotel-price"]')).toBeVisible();
    
    // Verify city matches search parameter (Lagos)
    const cityText = await firstCard.locator('[data-testid="hotel-city"]').textContent();
    expect(cityText).toContain('Lagos');
  });

  test('012: Nights calculation accuracy', async () => {
    // Test with specific date range
    const checkIn = '2024-12-01';
    const checkOut = '2024-12-03';
    
    await page.goto(`/search?city=Lagos&checkIn=${checkIn}&checkOut=${checkOut}&adults=2`);
    await page.waitForLoadState('networkidle');
    
    // Verify nights calculation (2 nights between Dec 1-3)
    const nightsDisplay = page.locator('[data-testid="nights-count"]');
    await expect(nightsDisplay).toHaveText('2 nights');
  });

  test('013: Tax calculation (7.5% VAT)', async () => {
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    const firstCard = hotelCards.first();
    
    // Get base price
    const basePriceText = await firstCard.locator('[data-testid="hotel-price"]').textContent();
    const basePrice = parseInt(basePriceText?.replace(/[₦,]/g, '') || '0');
    
    // Click to view details and check tax calculation
    await firstCard.click();
    await page.waitForLoadState('networkidle');
    
    // Verify tax amount (7.5% of base price for multi-night stays)
    const taxElement = page.locator('[data-testid="tax-amount"]');
    if (await taxElement.isVisible()) {
      const taxText = await taxElement.textContent();
      const taxAmount = parseInt(taxText?.replace(/[₦,]/g, '') || '0');
      const expectedTax = Math.round(basePrice * 0.075);
      
      expect(taxAmount).toBe(expectedTax);
    }
  });
});

test.describe('Date Calculations - Edge Cases', () => {
  test('014: Same-day check-in/check-out (0 nights)', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    
    await page.goto(`/search?city=Lagos&checkIn=${today}&checkOut=${today}&adults=2`);
    await page.waitForLoadState('networkidle');
    
    // Should show 0 nights
    const nightsDisplay = page.locator('[data-testid="nights-count"]');
    await expect(nightsDisplay).toHaveText('0 nights');
  });

  test('015: Extended stay calculation (30+ nights)', async ({ page }) => {
    const checkIn = '2024-12-01';
    const checkOut = '2025-01-15'; // 45 nights
    
    await page.goto(`/search?city=Lagos&checkIn=${checkIn}&checkOut=${checkOut}&adults=2`);
    await page.waitForLoadState('networkidle');
    
    // Should show 45 nights
    const nightsDisplay = page.locator('[data-testid="nights-count"]');
    await expect(nightsDisplay).toHaveText('45 nights');
  });

  test('016: Month boundary calculation', async ({ page }) => {
    const checkIn = '2024-11-30';
    const checkOut = '2024-12-02'; // Crosses November-December boundary
    
    await page.goto(`/search?city=Lagos&checkIn=${checkIn}&checkOut=${checkOut}&adults=2`);
    await page.waitForLoadState('networkidle');
    
    // Should show 2 nights
    const nightsDisplay = page.locator('[data-testid="nights-count"]');
    await expect(nightsDisplay).toHaveText('2 nights');
  });

  test('017: Year boundary calculation', async ({ page }) => {
    const checkIn = '2024-12-30';
    const checkOut = '2025-01-02'; // Crosses 2024-2025 boundary
    
    await page.goto(`/search?city=Lagos&checkIn=${checkIn}&checkOut=${checkOut}&adults=2`);
    await page.waitForLoadState('networkidle');
    
    // Should show 3 nights
    const nightsDisplay = page.locator('[data-testid="nights-count"]');
    await expect(nightsDisplay).toHaveText('3 nights');
  });
});

test.describe('Mobile-Specific Tests', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone X dimensions

  test('018: Mobile date picker uses native input', async ({ page }) => {
    await page.goto('/');
    
    // Check if native date input is used on mobile
    const dateInput = page.locator('[data-testid="check-in-date"]');
    await expect(dateInput).toHaveAttribute('type', 'date');
  });

  test('019: Mobile hamburger menu functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check hamburger menu button exists
    const hamburgerButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(hamburgerButton).toBeVisible();
    
    // Click to open menu
    await hamburgerButton.click();
    
    // Verify menu is open
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
    
    // Test menu navigation links
    await expect(page.locator('[data-testid="menu-hotels"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-services"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-food"]')).toBeVisible();
  });

  test('020: Mobile search form responsiveness', async ({ page }) => {
    await page.goto('/');
    
    // Verify form elements stack vertically on mobile
    const searchForm = page.locator('[data-testid="search-form"]');
    await expect(searchForm).toBeVisible();
    
    // Check that search button spans full width on mobile
    const searchButton = page.locator('[data-testid="search-button"]');
    const buttonBox = await searchButton.boundingBox();
    const viewportWidth = 375; // Mobile viewport width
    
    // Button should be nearly full width (allowing for padding)
    expect(buttonBox?.width).toBeGreaterThan(viewportWidth * 0.8);
  });
});