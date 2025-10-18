import { test, expect } from '@playwright/test';

test.describe('Booking Flow - Form Validation & Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page with negotiated price
    await page.goto('/book?propertyId=hotel-1&price=127500&checkIn=2024-12-01&checkOut=2024-12-03');
    await page.waitForLoadState('networkidle');
  });

  test('031: Booking form displays correct details', async ({ page }) => {
    // Verify booking summary shows correct information
    const bookingSummary = page.locator('[data-testid="booking-summary"]');
    await expect(bookingSummary).toBeVisible();
    
    // Check property details
    const propertyName = page.locator('[data-testid="property-name"]');
    await expect(propertyName).toBeVisible();
    
    // Check dates
    const checkInDisplay = page.locator('[data-testid="check-in-display"]');
    const checkOutDisplay = page.locator('[data-testid="check-out-display"]');
    
    await expect(checkInDisplay).toContainText('Dec 1, 2024');
    await expect(checkOutDisplay).toContainText('Dec 3, 2024');
    
    // Check price
    const totalPrice = page.locator('[data-testid="booking-total"]');
    await expect(totalPrice).toContainText('₦127,500');
  });

  test('032: Contact form validation - required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('[data-testid="submit-booking"]');
    await submitButton.click();
    
    // Should show validation errors
    const nameError = page.locator('[data-testid="name-error"]');
    const emailError = page.locator('[data-testid="email-error"]');
    const phoneError = page.locator('[data-testid="phone-error"]');
    
    await expect(nameError).toBeVisible();
    await expect(emailError).toBeVisible();
    await expect(phoneError).toBeVisible();
  });

  test('033: Email validation', async ({ page }) => {
    // Test invalid email formats
    const emailInput = page.locator('[data-testid="email-input"]');
    const invalidEmails = ['invalid', 'test@', '@domain.com', 'test..test@domain.com'];
    
    for (const email of invalidEmails) {
      await emailInput.fill(email);
      await page.locator('[data-testid="submit-booking"]').click();
      
      const emailError = page.locator('[data-testid="email-error"]');
      await expect(emailError).toBeVisible();
    }
    
    // Test valid email
    await emailInput.fill('test@example.com');
    const emailError = page.locator('[data-testid="email-error"]');
    await expect(emailError).not.toBeVisible();
  });

  test('034: Phone number validation', async ({ page }) => {
    const phoneInput = page.locator('[data-testid="phone-input"]');
    
    // Test invalid phone numbers
    await phoneInput.fill('123');
    await page.locator('[data-testid="submit-booking"]').click();
    
    const phoneError = page.locator('[data-testid="phone-error"]');
    await expect(phoneError).toBeVisible();
    
    // Test valid Nigerian phone number
    await phoneInput.fill('+2348012345678');
    await expect(phoneError).not.toBeVisible();
  });

  test('035: Successful booking submission', async ({ page }) => {
    // Fill out complete form
    await page.locator('[data-testid="name-input"]').fill('John Doe');
    await page.locator('[data-testid="email-input"]').fill('john.doe@example.com');
    await page.locator('[data-testid="phone-input"]').fill('+2348012345678');
    
    // Add special requests
    await page.locator('[data-testid="special-requests"]').fill('Late check-in expected');
    
    // Submit booking
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Should show success message
    const successMessage = page.locator('[data-testid="booking-success"]');
    await expect(successMessage).toBeVisible();
    
    // Should display booking ID
    const bookingId = page.locator('[data-testid="booking-id"]');
    await expect(bookingId).toBeVisible();
    
    const bookingIdText = await bookingId.textContent();
    expect(bookingIdText).toMatch(/BK\d+/); // Format: BK followed by numbers
  });

  test('036: Booking confirmation details', async ({ page }) => {
    // Complete booking process
    await page.locator('[data-testid="name-input"]').fill('Jane Smith');
    await page.locator('[data-testid="email-input"]').fill('jane@example.com');
    await page.locator('[data-testid="phone-input"]').fill('+2349087654321');
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Wait for confirmation page
    await page.waitForSelector('[data-testid="booking-success"]');
    
    // Verify confirmation details
    const confirmationDetails = page.locator('[data-testid="confirmation-details"]');
    await expect(confirmationDetails).toBeVisible();
    
    // Check that all booking details are displayed
    await expect(page.locator('[data-testid="confirm-guest-name"]')).toContainText('Jane Smith');
    await expect(page.locator('[data-testid="confirm-email"]')).toContainText('jane@example.com');
    await expect(page.locator('[data-testid="confirm-total"]')).toContainText('₦127,500');
  });

  test('037: WhatsApp contact link functionality', async ({ page }) => {
    // Look for WhatsApp contact link
    const whatsappLink = page.locator('[data-testid="whatsapp-contact"]');
    
    if (await whatsappLink.isVisible()) {
      const href = await whatsappLink.getAttribute('href');
      expect(href).toContain('wa.me');
      expect(href).toContain('2347077775545'); // Nigerian phone number
    }
  });
});

test.describe('Booking Edge Cases & Error Handling', () => {
  test('038: Expired negotiation booking attempt', async ({ page }) => {
    // Try to book with an expired price parameter
    await page.goto('/book?propertyId=hotel-1&price=expired');
    
    // Should show error message about expired pricing
    const expiredError = page.locator('[data-testid="expired-price-error"]');
    await expect(expiredError).toBeVisible();
  });

  test('039: Invalid property ID booking', async ({ page }) => {
    await page.goto('/book?propertyId=invalid-hotel&price=100000');
    
    // Should show property not found error
    const notFoundError = page.locator('[data-testid="property-not-found"]');
    await expect(notFoundError).toBeVisible();
  });

  test('040: Booking without negotiated price', async ({ page }) => {
    await page.goto('/book?propertyId=hotel-1'); // No price parameter
    
    // Should redirect to negotiation or show error
    const url = page.url();
    expect(url).toMatch(/\/(negotiate|book)/);
    
    if (url.includes('/book')) {
      // If staying on book page, should show price missing error
      const priceError = page.locator('[data-testid="price-missing-error"]');
      await expect(priceError).toBeVisible();
    }
  });

  test('041: Network failure during booking submission', async ({ page }) => {
    // Simulate network failure for booking API
    await page.route('**/api/book', route => route.abort());
    
    await page.goto('/book?propertyId=hotel-1&price=127500');
    
    // Fill out form
    await page.locator('[data-testid="name-input"]').fill('Test User');
    await page.locator('[data-testid="email-input"]').fill('test@example.com');
    await page.locator('[data-testid="phone-input"]').fill('+2348012345678');
    
    // Try to submit
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Should show network error
    const networkError = page.locator('[data-testid="network-error"]');
    await expect(networkError).toBeVisible();
    
    // Should offer retry option
    const retryButton = page.locator('[data-testid="retry-booking"]');
    await expect(retryButton).toBeVisible();
  });

  test('042: Form data persistence during errors', async ({ page }) => {
    await page.goto('/book?propertyId=hotel-1&price=127500');
    
    // Fill out form
    await page.locator('[data-testid="name-input"]').fill('Persistent User');
    await page.locator('[data-testid="email-input"]').fill('persistent@example.com');
    await page.locator('[data-testid="phone-input"]').fill('invalid-phone');
    
    // Submit with invalid phone
    await page.locator('[data-testid="submit-booking"]').click();
    
    // Form should show error but preserve other values
    const nameValue = await page.locator('[data-testid="name-input"]').inputValue();
    const emailValue = await page.locator('[data-testid="email-input"]').inputValue();
    
    expect(nameValue).toBe('Persistent User');
    expect(emailValue).toBe('persistent@example.com');
  });
});

test.describe('Booking Price Calculations', () => {
  test('043: Single night booking calculation', async ({ page }) => {
    await page.goto('/book?propertyId=hotel-1&price=85000&checkIn=2024-12-01&checkOut=2024-12-02');
    
    // Single night should not have tax
    const taxDisplay = page.locator('[data-testid="tax-amount"]');
    if (await taxDisplay.isVisible()) {
      await expect(taxDisplay).toContainText('₦0');
    }
    
    const totalDisplay = page.locator('[data-testid="booking-total"]');
    await expect(totalDisplay).toContainText('₦85,000');
  });

  test('044: Multi-night booking with tax calculation', async ({ page }) => {
    const basePrice = 85000;
    const nights = 3;
    const subtotal = basePrice * nights; // 255,000
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = subtotal + tax;
    
    await page.goto(`/book?propertyId=hotel-1&price=${total}&checkIn=2024-12-01&checkOut=2024-12-04`);
    
    // Verify tax calculation display
    const taxDisplay = page.locator('[data-testid="tax-amount"]');
    if (await taxDisplay.isVisible()) {
      const taxText = await taxDisplay.textContent();
      const displayedTax = parseInt(taxText?.replace(/[₦,]/g, '') || '0');
      expect(displayedTax).toBe(tax);
    }
    
    const totalDisplay = page.locator('[data-testid="booking-total"]');
    const totalText = await totalDisplay.textContent();
    const displayedTotal = parseInt(totalText?.replace(/[₦,]/g, '') || '0');
    expect(displayedTotal).toBe(total);
  });

  test('045: Large party booking calculation', async ({ page }) => {
    // Test booking with multiple rooms and guests
    await page.goto('/book?propertyId=hotel-1&price=200000&adults=6&children=2&rooms=3');
    
    // Verify guest details are displayed correctly
    const guestSummary = page.locator('[data-testid="guest-summary"]');
    await expect(guestSummary).toContainText('6 adults');
    await expect(guestSummary).toContainText('2 children');
    await expect(guestSummary).toContainText('3 rooms');
  });
});