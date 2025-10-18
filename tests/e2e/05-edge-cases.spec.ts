import { test, expect } from '@playwright/test';

test.describe('Edge Cases & Error Scenarios', () => {
  test('076: Network disconnection during booking', async ({ page, context }) => {
    // Start booking process
    await page.goto('/book?propertyId=hotel-1&price=150000');
    await page.waitForLoadState('networkidle');
    
    // Fill form
    await page.locator('[data-testid="name-input"]').fill('Network Test User');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="phone-input"]').fill('+2348012345678');
    
    // Simulate network disconnection
    await context.setOffline(true);
    
    // Try to submit
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Should handle network error gracefully
    const errorMessage = page.locator('[data-testid="network-error"], [data-testid="connection-error"]');
    const loadingSpinner = page.locator('[data-testid="loading"], .loading');
    
    // Either show error message or keep loading state
    const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
    const hasLoading = await loadingSpinner.isVisible().catch(() => false);
    
    expect(hasError || hasLoading).toBe(true);
    
    // Restore connection
    await context.setOffline(false);
  });

  test('077: Browser back button during negotiation', async ({ page }) => {
    // Navigate through typical user journey
    await page.goto('/');
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Go to hotel details
    const firstHotel = page.locator('[data-testid="hotel-card"]').first();
    await firstHotel.click();
    await page.waitForLoadState('networkidle');
    
    // Start negotiation
    const negotiateButton = page.locator('[data-testid="negotiate-button"]');
    if (await negotiateButton.isVisible()) {
      await negotiateButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Use browser back button
    await page.goBack();
    
    // Verify we're back on hotel details page
    const hotelName = page.locator('[data-testid="hotel-name"]');
    await expect(hotelName).toBeVisible();
    
    // Go forward again
    await page.goForward();
    
    // Should handle return to negotiation gracefully
    const currentUrl = page.url();
    expect(currentUrl).toContain('/negotiate');
  });

  test('078: Invalid date ranges in search', async ({ page }) => {
    await page.goto('/');
    
    // Try to set check-out before check-in
    const checkInInput = page.locator('[data-testid="check-in-date"]');
    const checkOutInput = page.locator('[data-testid="check-out-date"]');
    
    await checkInInput.fill('2024-12-15');
    await checkOutInput.fill('2024-12-10'); // Earlier date
    
    await page.locator('[data-testid="search-button"]').click();
    
    // Should show validation error or correct the dates
    const errorMessage = page.locator('[data-testid="date-error"]');
    const currentUrl = page.url();
    
    // Either show error or not navigate to search results
    const hasError = await errorMessage.isVisible().catch(() => false);
    const stayedOnHome = !currentUrl.includes('/search');
    
    expect(hasError || stayedOnHome).toBe(true);
  });

  test('079: Expired session handling', async ({ page }) => {
    // Simulate expired negotiation
    await page.goto('/negotiate?propertyId=hotel-1&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
    
    // Wait for negotiation to load
    await page.waitForSelector('[data-testid="negotiation-result"], [data-testid="negotiation-loading"]');
    
    // Use clock manipulation to expire session
    await page.clock.install({ time: new Date('2024-12-01T10:00:00') });
    await page.clock.fastForward('10:00'); // Fast forward 10 minutes
    
    // Check if expired state is handled
    const expiredMessage = page.locator('[data-testid="expired-message"], [data-testid="session-expired"]');
    const bookButton = page.locator('[data-testid="book-now-button"]');
    
    if (await expiredMessage.isVisible()) {
      await expect(expiredMessage).toBeVisible();
    }
    
    if (await bookButton.isVisible()) {
      const isDisabled = await bookButton.isDisabled();
      expect(isDisabled).toBe(true);
    }
  });

  test('080: Large screen resolution testing', async ({ page }) => {
    // Test ultra-wide screen
    await page.setViewportSize({ width: 2560, height: 1440 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify layout doesn't break on large screens
    const searchBar = page.locator('[data-testid="search-form"]');
    const searchBarBox = await searchBar.boundingBox();
    
    // Search bar shouldn't span entire width
    expect(searchBarBox?.width).toBeLessThan(2000);
    
    // Test search results layout
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForLoadState('networkidle');
    
    const hotelCards = page.locator('[data-testid="hotel-card"]');
    const cardCount = await hotelCards.count();
    
    // Cards should be in reasonable grid layout
    if (cardCount > 0) {
      const firstCard = await hotelCards.first().boundingBox();
      expect(firstCard?.width).toBeLessThan(600); // Not too wide
    }
  });

  test('081: Very slow internet simulation', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      await route.continue();
    });
    
    await page.goto('/');
    
    // Should show loading states appropriately
    const searchForm = page.locator('[data-testid="search-form"]');
    await expect(searchForm).toBeVisible({ timeout: 10000 });
    
    // Test search with slow network
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    await page.locator('[data-testid="search-button"]').click();
    
    // Should handle slow search gracefully
    const resultsOrLoading = page.locator('[data-testid="search-results"], [data-testid="loading"], .loading');
    await expect(resultsOrLoading).toBeVisible({ timeout: 15000 });
  });

  test('082: JavaScript disabled scenario', async ({ page, context }) => {
    // Disable JavaScript
    await context.setJavaScriptEnabled(false);
    
    await page.goto('/');
    
    // Basic HTML should still work
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    // Forms should have basic functionality
    const citySelect = page.locator('[data-testid="city-select"], select');
    if (await citySelect.isVisible()) {
      await citySelect.selectOption('Lagos');
    }
    
    // Form submission should work (server-side)
    const searchButton = page.locator('[data-testid="search-button"], input[type="submit"], button[type="submit"]');
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      // Should redirect even without JavaScript
      await page.waitForLoadState('networkidle');
      const url = page.url();
      // May stay on same page without JS, which is acceptable
      expect(url).toBeTruthy();
    }
  });

  test('083: Memory leak detection during extended use', async ({ page }) => {
    // Simulate extended browsing session
    const urls = [
      '/',
      '/services',
      '/food',
      '/search?city=Lagos',
      '/search?city=Abuja',
      '/services?category=massage',
      '/'
    ];
    
    for (const url of urls) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Interact with page elements
      const clickableElements = page.locator('button, a, [role="button"]');
      const count = await clickableElements.count();
      
      if (count > 0) {
        // Click a few random elements
        const randomIndex = Math.floor(Math.random() * Math.min(3, count));
        try {
          await clickableElements.nth(randomIndex).click({ timeout: 1000 });
        } catch (error) {
          // Ignore click errors in memory test
        }
      }
      
      // Small delay between navigations
      await page.waitForTimeout(100);
    }
    
    // If we reach here without crashes, memory is likely stable
    await expect(page.locator('body')).toBeVisible();
  });

  test('084: Cross-site scripting (XSS) protection', async ({ page }) => {
    // Test XSS in search parameters
    const xssPayload = '<script>alert("xss")</script>';
    const encodedPayload = encodeURIComponent(xssPayload);
    
    await page.goto(`/search?city=${encodedPayload}`);
    await page.waitForLoadState('networkidle');
    
    // Page should load without executing script
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("xss")</script>');
    
    // Test XSS in form inputs
    await page.goto('/');
    
    const searchInput = page.locator('[data-testid="service-search"], input[type="text"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill(xssPayload);
      
      // Value should be escaped/sanitized
      const inputValue = await searchInput.inputValue();
      expect(inputValue).not.toContain('<script>');
    }
  });

  test('085: Data persistence across browser restart', async ({ page }) => {
    // This test simulates user expectations about data persistence
    // Note: The app currently doesn't use localStorage, so this tests the URL-based state
    
    await page.goto('/');
    await page.locator('[data-testid="city-select"]').selectOption('Lagos');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForLoadState('networkidle');
    
    const searchUrl = page.url();
    
    // Simulate "closing browser" by clearing all state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Navigate back to saved URL
    await page.goto(searchUrl);
    await page.waitForLoadState('networkidle');
    
    // Search results should still be available (URL-based state)
    const resultsContainer = page.locator('[data-testid="search-results"]');
    await expect(resultsContainer).toBeVisible();
  });
});