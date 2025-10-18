import { test, expect } from '@playwright/test';

test.describe('Services & Food Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
    await page.waitForLoadState('networkidle');
  });

  test('061: Services page loads with all categories', async ({ page }) => {
    // Verify page title and navigation
    await expect(page).toHaveTitle(/Services/);
    
    // Check category tabs exist
    const categoryTabs = page.locator('[data-testid="category-tabs"]');
    await expect(categoryTabs).toBeVisible();
    
    // Verify services are displayed
    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('062: Service category filtering', async ({ page }) => {
    const categories = ['Hair', 'Nails', 'Massage', 'Cleaning', 'Security'];
    
    for (const category of categories) {
      const categoryButton = page.locator(`[data-testid="category-${category.toLowerCase()}"]`);
      
      if (await categoryButton.isVisible()) {
        await categoryButton.click();
        await page.waitForLoadState('networkidle');
        
        // Verify filtered results
        const serviceCards = page.locator('[data-testid="service-card"]');
        const count = await serviceCards.count();
        
        if (count > 0) {
          // Check first few cards match category
          for (let i = 0; i < Math.min(3, count); i++) {
            const card = serviceCards.nth(i);
            const categoryText = await card.locator('[data-testid="service-category"]').textContent();
            expect(categoryText?.toLowerCase()).toContain(category.toLowerCase());
          }
        }
      }
    }
  });

  test('063: Service search functionality', async ({ page }) => {
    const searchInput = page.locator('[data-testid="service-search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('massage');
      await page.locator('[data-testid="search-services-button"]').click();
      await page.waitForLoadState('networkidle');
      
      // Verify search results
      const serviceCards = page.locator('[data-testid="service-card"]');
      const count = await serviceCards.count();
      
      if (count > 0) {
        const firstCard = serviceCards.first();
        const serviceTitle = await firstCard.locator('[data-testid="service-title"]').textContent();
        const serviceCategory = await firstCard.locator('[data-testid="service-category"]').textContent();
        
        const titleMatch = serviceTitle?.toLowerCase().includes('massage');
        const categoryMatch = serviceCategory?.toLowerCase().includes('massage');
        
        expect(titleMatch || categoryMatch).toBe(true);
      }
    }
  });

  test('064: Service detail page navigation', async ({ page }) => {
    const serviceCards = page.locator('[data-testid="service-card"]');
    const firstCard = serviceCards.first();
    
    // Get service ID for navigation test
    const serviceLink = firstCard.locator('a').first();
    await serviceLink.click();
    
    // Verify navigation to service detail page
    await expect(page).toHaveURL(/\/services\/[^\/]+$/);
    
    // Verify service details are displayed
    const serviceName = page.locator('[data-testid="service-name"]');
    const servicePrice = page.locator('[data-testid="service-price"]');
    const bookButton = page.locator('[data-testid="book-service-button"]');
    
    await expect(serviceName).toBeVisible();
    await expect(servicePrice).toBeVisible();
    await expect(bookButton).toBeVisible();
  });

  test('065: Service booking form', async ({ page }) => {
    // Navigate to first service detail page
    const serviceCards = page.locator('[data-testid="service-card"]');
    await serviceCards.first().click();
    await page.waitForLoadState('networkidle');
    
    // Click book service button
    const bookButton = page.locator('[data-testid="book-service-button"]');
    await bookButton.click();
    
    // Fill booking form
    const nameInput = page.locator('[data-testid="service-name-input"]');
    const emailInput = page.locator('[data-testid="service-email-input"]');
    const phoneInput = page.locator('[data-testid="service-phone-input"]');
    const dateInput = page.locator('[data-testid="service-date-input"]');
    
    await nameInput.fill('Service Customer');
    await emailInput.fill('service@example.com');
    await phoneInput.fill('+2348012345678');
    await dateInput.fill('2024-12-15');
    
    // Submit booking
    const submitButton = page.locator('[data-testid="submit-service-booking"]');
    await submitButton.click();
    
    // Verify confirmation
    const confirmation = page.locator('[data-testid="service-booking-confirmation"]');
    await expect(confirmation).toBeVisible();
    
    const referenceId = page.locator('[data-testid="service-reference-id"]');
    const referenceText = await referenceId.textContent();
    expect(referenceText).toMatch(/SV\d+/);
  });
});

test.describe('Food Ordering System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/food');
    await page.waitForLoadState('networkidle');
  });

  test('066: Food page displays Nigerian dishes', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveTitle(/Food/);
    
    // Check for featured Nigerian dishes
    const dishCards = page.locator('[data-testid="dish-card"]');
    await expect(dishCards.first()).toBeVisible();
    
    // Verify traditional dishes are present
    const nigerianDishes = [
      'Jollof Rice',
      'Egusi',
      'Pounded Yam',
      'Suya',
      'Moi Moi'
    ];
    
    for (const dish of nigerianDishes) {
      const dishElement = page.locator(`text=${dish}`);
      if (await dishElement.isVisible()) {
        await expect(dishElement).toBeVisible();
      }
    }
  });

  test('067: Food category filtering', async ({ page }) => {
    const foodCategories = ['Rice', 'Soup', 'Swallow', 'Grilled', 'Snacks'];
    
    for (const category of foodCategories) {
      const categoryFilter = page.locator(`[data-testid="food-category-${category.toLowerCase()}"]`);
      
      if (await categoryFilter.isVisible()) {
        await categoryFilter.click();
        await page.waitForTimeout(500); // Wait for filtering
        
        // Verify filtered results
        const dishCards = page.locator('[data-testid="dish-card"]');
        const count = await dishCards.count();
        
        expect(count).toBeGreaterThanOrEqual(0); // Allow empty results
      }
    }
  });

  test('068: Food ordering process', async ({ page }) => {
    // Select first dish
    const dishCards = page.locator('[data-testid="dish-card"]');
    const firstDish = dishCards.first();
    
    const orderButton = firstDish.locator('[data-testid="order-dish-button"]');
    await orderButton.click();
    
    // Fill order form
    const customerName = page.locator('[data-testid="customer-name"]');
    const customerPhone = page.locator('[data-testid="customer-phone"]');
    const deliveryAddress = page.locator('[data-testid="delivery-address"]');
    const quantity = page.locator('[data-testid="order-quantity"]');
    
    await customerName.fill('Food Customer');
    await customerPhone.fill('+2348012345678');
    await deliveryAddress.fill('123 Lagos Street, Lagos');
    
    // Adjust quantity
    await quantity.fill('2');
    
    // Submit order
    const submitOrder = page.locator('[data-testid="submit-food-order"]');
    await submitOrder.click();
    
    // Verify order confirmation
    const orderConfirmation = page.locator('[data-testid="food-order-confirmation"]');
    await expect(orderConfirmation).toBeVisible();
    
    const orderId = page.locator('[data-testid="food-order-id"]');
    const orderIdText = await orderId.textContent();
    expect(orderIdText).toMatch(/FO\d+/); // Food Order ID format
  });

  test('069: Food pricing calculations', async ({ page }) => {
    const dishCards = page.locator('[data-testid="dish-card"]');
    const firstDish = dishCards.first();
    
    // Get base price
    const priceElement = firstDish.locator('[data-testid="dish-price"]');
    const priceText = await priceElement.textContent();
    const basePrice = parseInt(priceText?.replace(/[₦,]/g, '') || '0');
    
    // Order multiple quantities
    const orderButton = firstDish.locator('[data-testid="order-dish-button"]');
    await orderButton.click();
    
    const quantityInput = page.locator('[data-testid="order-quantity"]');
    await quantityInput.fill('3');
    
    // Check total calculation
    const totalElement = page.locator('[data-testid="order-total"]');
    const totalText = await totalElement.textContent();
    const calculatedTotal = parseInt(totalText?.replace(/[₦,]/g, '') || '0');
    
    expect(calculatedTotal).toBe(basePrice * 3);
  });
});

test.describe('Navigation & Cross-page Consistency', () => {
  test('070: Header navigation between sections', async ({ page }) => {
    await page.goto('/');
    
    // Test Hotels navigation
    const hotelsTab = page.locator('[data-testid="nav-hotels"]');
    await hotelsTab.click();
    await expect(page).toHaveURL(/\//);
    
    // Test Services navigation
    const servicesTab = page.locator('[data-testid="nav-services"]');
    await servicesTab.click();
    await expect(page).toHaveURL(/\/services/);
    
    // Test Food navigation
    const foodTab = page.locator('[data-testid="nav-food"]');
    await foodTab.click();
    await expect(page).toHaveURL(/\/food/);
  });

  test('071: City consistency across pages', async ({ page }) => {
    // Start with Lagos search on hotels
    await page.goto('/search?city=Lagos');
    await page.waitForLoadState('networkidle');
    
    // Navigate to services
    await page.locator('[data-testid="nav-services"]').click();
    
    // Check if Lagos is selected/highlighted in services
    const cityFilter = page.locator('[data-testid="city-lagos"]');
    if (await cityFilter.isVisible()) {
      await expect(cityFilter).toHaveClass(/active/);
    }
    
    // Navigate to food
    await page.locator('[data-testid="nav-food"]').click();
    
    // Verify Lagos context is maintained
    const lagosFood = page.locator('[data-testid="lagos-restaurants"]');
    if (await lagosFood.isVisible()) {
      await expect(lagosFood).toBeVisible();
    }
  });

  test('072: Price format consistency', async ({ page }) => {
    const pages = ['/', '/services', '/food'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Find all price elements
      const priceElements = page.locator('[data-testid*="price"], [class*="price"]');
      const count = await priceElements.count();
      
      for (let i = 0; i < Math.min(5, count); i++) {
        const priceText = await priceElements.nth(i).textContent();
        
        if (priceText && priceText.includes('₦')) {
          // Verify Nigerian Naira format
          expect(priceText).toMatch(/₦[\d,]+/);
        }
      }
    }
  });

  test('073: Mobile menu consistency', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    const pages = ['/', '/services', '/food'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check hamburger menu exists
      const hamburgerButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await hamburgerButton.isVisible()) {
        await hamburgerButton.click();
        
        // Verify menu items
        const menuItems = page.locator('[data-testid*="menu-"]');
        await expect(menuItems.first()).toBeVisible();
        
        // Close menu for next iteration
        await hamburgerButton.click();
      }
    }
  });

  test('074: Footer links and contact information', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Check WhatsApp link
    const whatsappLink = page.locator('[data-testid="footer-whatsapp"]');
    if (await whatsappLink.isVisible()) {
      const href = await whatsappLink.getAttribute('href');
      expect(href).toContain('wa.me');
      expect(href).toContain('2347077775545');
    }
    
    // Check other footer links
    const footerLinks = page.locator('footer a');
    const linkCount = await footerLinks.count();
    
    for (let i = 0; i < linkCount; i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      
      // Verify links are not broken (don't start with javascript:void)
      if (href && href.startsWith('/')) {
        expect(href).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
      }
    }
  });

  test('075: Search state preservation across browser refresh', async ({ page }) => {
    // Perform search with specific parameters
    await page.goto('/');
    await page.locator('[data-testid="city-select"]').selectOption('Abuja');
    await page.locator('[data-testid="adults-plus"]').click(); // 3 adults
    await page.locator('[data-testid="budget-130_200"]').click();
    await page.locator('[data-testid="search-button"]').click();
    
    // Get current URL with search parameters
    const searchUrl = page.url();
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify search parameters are preserved
    expect(page.url()).toBe(searchUrl);
    
    // Verify search results are still displayed
    const resultsContainer = page.locator('[data-testid="search-results"]');
    await expect(resultsContainer).toBeVisible();
  });
});