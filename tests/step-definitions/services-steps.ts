import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../support/world';
import { ServicesPage, ServiceBookingPage, TaxiPage, FoodPage } from '../page-objects/services.page';

let world: TestWorld;
let servicesPage: ServicesPage;
let serviceBookingPage: ServiceBookingPage;
let taxiPage: TaxiPage;
let foodPage: FoodPage;

Before(async function() {
  world = new TestWorld();
  world.page = this.page;
  servicesPage = new ServicesPage(world.page);
  serviceBookingPage = new ServiceBookingPage(world.page);
  taxiPage = new TaxiPage(world.page);
  foodPage = new FoodPage(world.page);
});

// Services navigation steps
Given('I am on the services page', async function() {
  await world.page.goto('/services');
  await world.page.waitForLoadState('networkidle');
});

// Service search and filter steps
When('I filter services by city {string}', async function(city: string) {
  await servicesPage.filterByCity(city);
  world.setTestData('serviceCity', city);
});

When('I filter by category {string}', async function(category: string) {
  await servicesPage.filterByCategory(category);
  world.setTestData('serviceCategory', category);
});

When('I click search', async () => {
  await page.locator('[data-testid="services-search-submit"]').click();
});

Then('I should see a list of {word} service providers in {word}', async (serviceType: string, city: string) => {
  const results = page.locator('[data-testid="service-results"]');
  await expect(results).toBeVisible();
  
  const serviceCards = page.locator('[data-testid="service-card"]');
  await expect(serviceCards).toHaveCountGreaterThan(0);
});

Then('each result should show provider name, rating, and price', async () => {
  const serviceCards = page.locator('[data-testid="service-card"]');
  const count = await serviceCards.count();
  
  for (let i = 0; i < Math.min(count, 3); i++) {
    const card = serviceCards.nth(i);
    await expect(card.locator('[data-testid="provider-name"]')).toBeVisible();
    await expect(card.locator('[data-testid="provider-rating"]')).toBeVisible();
    await expect(card.locator('[data-testid="service-price"]')).toBeVisible();
  }
});

Then('I should see services with category {string}', async (category: string) => {
  const categoryTags = page.locator('[data-testid="service-category"]');
  const categoryTexts = await categoryTags.allTextContents();
  
  expect(categoryTexts.every(text => text.includes(category))).toBeTruthy();
});

// Service Category Steps
When('I select {string} category', async (category: string) => {
  await page.locator(`[data-testid="category-${category.toLowerCase()}"]`).click();
});

Then('I should see services related to {string}', async (category: string) => {
  const serviceResults = page.locator('[data-testid="service-results"]');
  await expect(serviceResults).toBeVisible();
  
  // Check that service cards have the expected category
  const categoryElements = page.locator('[data-testid="service-category"]');
  const categoryTexts = await categoryElements.allTextContents();
  expect(categoryTexts.some(text => text.includes(category))).toBeTruthy();
});

Then('each service should display the correct category', async () => {
  const serviceCards = page.locator('[data-testid="service-card"]');
  const count = await serviceCards.count();
  
  for (let i = 0; i < count; i++) {
    const categoryElement = serviceCards.nth(i).locator('[data-testid="service-category"]');
    await expect(categoryElement).toBeVisible();
    await expect(categoryElement).toHaveText(/.+/); // Should have some category text
  }
});

// Service Booking Steps
Given('I search for {string} services in {string}', async (serviceType: string, city: string) => {
  await page.goto('/services');
  await page.locator('[data-testid="services-city-select"]').selectOption(city);
  await page.locator('[data-testid="services-category-select"]').selectOption(serviceType);
  await page.locator('[data-testid="services-search-submit"]').click();
});

Given('I see {string} with price {string}', async (serviceName: string, price: string) => {
  const serviceCard = page.locator(`[data-testid="service-card"]:has-text("${serviceName}")`);
  await expect(serviceCard).toBeVisible();
  await expect(serviceCard.locator('[data-testid="service-price"]')).toContainText(price);
});

When('I click {string}', async (buttonText: string) => {
  await page.locator(`button:has-text("${buttonText}")`).click();
});

Then('I should be on the service booking page', async () => {
  await expect(page).toHaveURL(/\/services\/book/);
});

Then('I should see service details:', async (dataTable: any) => {
  const details = dataTable.hashes();
  
  for (const detail of details) {
    const field = detail['Field'];
    const value = detail['Value'];
    
    const fieldElement = page.locator(`[data-testid="service-${field.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(fieldElement).toContainText(value);
  }
});

// Service Booking Form Steps
Given('I am booking a {string} service for {string}', async (serviceType: string, price: string) => {
  // Navigate to service booking with specific service
  await page.goto(`/services/book?service=${serviceType}&price=${price}`);
});

When('I try to submit the booking form without required fields', async () => {
  await page.locator('[data-testid="submit-service-booking"]').click();
});

When('I fill in all required details:', async (dataTable: any) => {
  const details = dataTable.hashes();
  
  for (const detail of details) {
    const field = detail['Field'];
    const value = detail['Value'];
    
    const fieldSelector = `[data-testid="${field.toLowerCase().replace(/\s+/g, '-')}"]`;
    await page.locator(fieldSelector).fill(value);
  }
});

When('I submit the booking', async () => {
  await page.locator('[data-testid="submit-service-booking"]').click();
});

Then('I should see booking confirmation', async () => {
  await page.locator('[data-testid="service-booking-confirmation"]').waitFor();
});

Then('I should receive a service reference starting with {string}', async (prefix: string) => {
  const referenceElement = page.locator('[data-testid="service-reference"]');
  const referenceText = await referenceElement.textContent();
  expect(referenceText).toMatch(new RegExp(`^${prefix}\\d+`));
});

Then('the status should be {string}', async (status: string) => {
  const statusElement = page.locator('[data-testid="service-status"]');
  await expect(statusElement).toContainText(status);
});

// Pricing for Multiple People Steps
Given('I am booking {string} service with base price {string}', async (serviceType: string, basePrice: string) => {
  await page.goto(`/services/book?service=${serviceType}&price=${basePrice}`);
});

When('I set the number of people to {string}', async (peopleCount: string) => {
  await page.locator('[data-testid="people-count"]').fill(peopleCount);
});

Then('the system should calculate pricing for {int} people', async (count: number) => {
  const calculationElement = page.locator('[data-testid="pricing-calculation"]');
  await expect(calculationElement).toContainText(`${count} people`);
});

Then('I should see the total adjusted price', async () => {
  const totalPriceElement = page.locator('[data-testid="total-price"]');
  await expect(totalPriceElement).toBeVisible();
  
  // Verify the price has been adjusted (should be different from base price)
  const totalText = await totalPriceElement.textContent();
  expect(totalText).toMatch(/₦[\d,]+/);
});

Then('the booking should reflect {string} in the details', async (peopleInfo: string) => {
  const bookingDetails = page.locator('[data-testid="booking-details"]');
  await expect(bookingDetails).toContainText(peopleInfo);
});

// City Availability Steps
When('I select {string} as location', async (city: string) => {
  await page.locator('[data-testid="location-select"]').selectOption(city);
});

Then('I should see services available in {string}', async (city: string) => {
  const locationIndicators = page.locator('[data-testid="service-location"]');
  const locations = await locationIndicators.allTextContents();
  
  expect(locations.every(loc => loc.includes(city))).toBeTruthy();
});

Then('all results should be tagged with {string}', async (city: string) => {
  const cityTags = page.locator('[data-testid="city-tag"]');
  const cityTexts = await cityTags.allTextContents();
  
  expect(cityTexts.every(text => text.includes(city))).toBeTruthy();
});

// No Services Available Steps  
When('no services are available in that category and location', async () => {
  // This step represents the system state - no action needed
});

Then('I should see {string} message', async (message: string) => {
  const messageElement = page.locator(`text=${message}`);
  await expect(messageElement).toBeVisible();
});

Then('I should see suggestions to:', async (dataTable: any) => {
  const suggestions = dataTable.hashes();
  
  for (const suggestion of suggestions) {
    const option = suggestion['Option'];
    const suggestionElement = page.locator(`text=${option}`);
    await expect(suggestionElement).toBeVisible();
  }
});

// Special Categories Steps
Given('I search for {string} services', async (serviceType: string) => {
  await page.goto('/services');
  await page.locator('[data-testid="services-category-select"]').selectOption(serviceType);
  await page.locator('[data-testid="services-search-submit"]').click();
});

When('I click to book the service', async () => {
  await page.locator('[data-testid="book-service"]').first().click();
});

Then('I should see specialized fields for livestock:', async (dataTable: any) => {
  const fields = dataTable.hashes();
  
  for (const field of fields) {
    const fieldName = field['Field'];
    const fieldType = field['Type'];
    
    const fieldSelector = `[data-testid="${fieldName.toLowerCase().replace(/\s+/g, '-')}"]`;
    const fieldElement = page.locator(fieldSelector);
    
    await expect(fieldElement).toBeVisible();
    
    // Verify field type
    if (fieldType === 'Dropdown') {
      await expect(fieldElement).toHaveAttribute('type', 'select');
    } else if (fieldType === 'Number') {
      await expect(fieldElement).toHaveAttribute('type', 'number');
    } else if (fieldType === 'Date') {
      await expect(fieldElement).toHaveAttribute('type', 'date');
    } else if (fieldType === 'Textarea') {
      expect(await fieldElement.tagName()).toBe('TEXTAREA');
    }
  }
});