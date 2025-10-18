import { test, expect } from '@playwright/test';

test.describe('Negotiation Flow - Core Business Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('021: Navigate to negotiation from hotel details', async ({ page }) => {
    // First search for hotels
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Click on first hotel
    const firstHotel = page.locator('[data-testid="hotel-card"]').first();
    await firstHotel.click();
    await page.waitForLoadState('networkidle');
    
    // Click negotiate button
    const negotiateButton = page.locator('[data-testid="negotiate-button"]');
    await expect(negotiateButton).toBeVisible();
    await negotiateButton.click();
    
    // Verify navigation to negotiate page
    await expect(page).toHaveURL(/\/negotiate/);
  });

  test('022: Negotiation API returns valid discount', async ({ page }) => {
    // Navigate directly to negotiate page with known hotel ID
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
    
    // Wait for negotiation to process
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    // Check if discount was applied
    const originalPrice = page.locator('[data-testid="original-price"]');
    const discountedPrice = page.locator('[data-testid="discounted-price"]');
    const savings = page.locator('[data-testid="savings-amount"]');
    
    await expect(originalPrice).toBeVisible();
    await expect(discountedPrice).toBeVisible();
    await expect(savings).toBeVisible();
    
    // Verify discount calculation (should be 15% default)
    const originalText = await originalPrice.textContent();
    const discountedText = await discountedPrice.textContent();
    
    const original = parseInt(originalText?.replace(/[₦,]/g, '') || '0');
    const discounted = parseInt(discountedText?.replace(/[₦,]/g, '') || '0');
    
    // Verify 15% discount applied
    const expectedDiscount = Math.round(original * 0.15);
    const actualDiscount = original - discounted;
    
    expect(actualDiscount).toBeCloseTo(expectedDiscount, -2); // Allow ±100 NGN variance
  });

  test('023: Countdown timer functionality', async ({ page }) => {
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
    
    // Wait for negotiation result
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    // Check timer exists and is counting down
    const timer = page.locator('[data-testid="countdown-timer"]');
    await expect(timer).toBeVisible();
    
    // Get initial timer value
    const initialTime = await timer.textContent();
    expect(initialTime).toMatch(/\d{1,2}:\d{2}/); // Format: MM:SS
    
    // Wait 3 seconds and verify timer decreased
    await page.waitForTimeout(3000);
    const updatedTime = await timer.textContent();
    
    // Convert to seconds for comparison
    const initialSeconds = timeToSeconds(initialTime || '');
    const updatedSeconds = timeToSeconds(updatedTime || '');
    
    expect(updatedSeconds).toBeLessThan(initialSeconds);
  });

  test('024: Timer expiry changes negotiation status', async ({ page }) => {
    // Use page clock to speed up time
    await page.clock.install({ time: new Date('2024-12-01T10:00:00') });
    
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
    
    // Wait for initial negotiation
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    // Fast-forward 5 minutes (300 seconds)
    await page.clock.fastForward('05:00');
    
    // Verify expired state
    const expiredMessage = page.locator('[data-testid="expired-message"]');
    await expect(expiredMessage).toBeVisible();
    
    // Verify book button is disabled
    const bookButton = page.locator('[data-testid="book-now-button"]');
    await expect(bookButton).toBeDisabled();
  });

  test('025: Book now preserves negotiated price', async ({ page }) => {
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
    
    // Wait for negotiation and get discounted price
    await page.waitForSelector('[data-testid="negotiation-result"]');
    const discountedPriceText = await page.locator('[data-testid="discounted-price"]').textContent();
    const negotiatedPrice = parseInt(discountedPriceText?.replace(/[₦,]/g, '') || '0');
    
    // Click book now
    await page.locator('[data-testid="book-now-button"]').click();
    
    // Verify navigation to booking page with price
    await expect(page).toHaveURL(/\/book/);
    
    // Verify price is preserved on booking page
    const bookingPrice = page.locator('[data-testid="booking-total"]');
    await expect(bookingPrice).toBeVisible();
    
    const bookingPriceText = await bookingPrice.textContent();
    const bookingPriceValue = parseInt(bookingPriceText?.replace(/[₦,]/g, '') || '0');
    
    expect(bookingPriceValue).toBe(negotiatedPrice);
  });

  test('026: No discount scenario handling', async ({ page }) => {
    // Use hotel ID that might not have discount
    await page.goto('/negotiate?propertyId=non-existent-hotel');
    await page.waitForLoadState('networkidle');
    
    // Should show no offer message
    const noOfferMessage = page.locator('[data-testid="no-offer-message"]');
    await expect(noOfferMessage).toBeVisible();
    
    // Verify original price still shown
    const originalPrice = page.locator('[data-testid="original-price"]');
    await expect(originalPrice).toBeVisible();
  });

  test('027: Multiple negotiation attempts on same property', async ({ page }) => {
    const propertyUrl = '/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03';
    
    // First negotiation
    await page.goto(propertyUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    const firstDiscount = await page.locator('[data-testid="discounted-price"]').textContent();
    
    // Refresh page (simulate new negotiation)
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    const secondDiscount = await page.locator('[data-testid="discounted-price"]').textContent();
    
    // Discounts should be consistent
    expect(firstDiscount).toBe(secondDiscount);
  });

  test('028: Negotiation with different check-in dates', async ({ page }) => {
    // Test with single night
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-02');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    const singleNightPrice = await page.locator('[data-testid="discounted-price"]').textContent();
    const singleNight = parseInt(singleNightPrice?.replace(/[₦,]/g, '') || '0');
    
    // Test with multiple nights
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-05');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    const multiNightPrice = await page.locator('[data-testid="discounted-price"]').textContent();
    const multiNight = parseInt(multiNightPrice?.replace(/[₦,]/g, '') || '0');
    
    // Multi-night should be significantly more than single night
    expect(multiNight).toBeGreaterThan(singleNight * 2);
  });
});

test.describe('Negotiation Progress States', () => {
  test('029: Loading state during negotiation', async ({ page }) => {
    // Slow down network to catch loading state
    await page.route('**/api/negotiate', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    
    // Should show loading indicator
    const loadingIndicator = page.locator('[data-testid="negotiation-loading"]');
    await expect(loadingIndicator).toBeVisible();
    
    // Wait for negotiation to complete
    await page.waitForSelector('[data-testid="negotiation-result"]');
    
    // Loading should be hidden
    await expect(loadingIndicator).not.toBeVisible();
  });

  test('030: Network error handling', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/negotiate', route => route.abort());
    
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    
    // Should show error message
    const errorMessage = page.locator('[data-testid="negotiation-error"]');
    await expect(errorMessage).toBeVisible();
    
    // Should offer retry option
    const retryButton = page.locator('[data-testid="retry-negotiation"]');
    await expect(retryButton).toBeVisible();
  });
});

// Helper function to convert MM:SS to seconds
function timeToSeconds(timeString: string): number {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}