import { Given, When, Then, Before, After } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../support/world';
import { SearchPage } from '../page-objects/search.page';
import { NavigationHelper } from '../page-objects/navigation.page';

// World setup
let world: TestWorld;
let searchPage: SearchPage;
let navigationHelper: NavigationHelper;

Before(async function() {
  world = new TestWorld();
  world.page = this.page;
  searchPage = new SearchPage(world.page);
  navigationHelper = new NavigationHelper(world.page);
});

After(async function() {
  // Cleanup if needed
});

// Navigation steps
Given('I am on the HotelSaver homepage', async function() {
  await navigationHelper.goToHomepage();
  await expect(world.page).toHaveURL('/');
});

Given('I am on the {string} page', async function(pageName: string) {
  const pageMap: Record<string, string> = {
    'services': '/services',
    'food': '/food',
    'airport taxi': '/airport-taxi',
    'apartments': '/apartments'
  };
  
  const url = pageMap[pageName.toLowerCase()];
  if (url) {
    await world.page.goto(url);
    await navigationHelper.waitForPageLoad();
  }
});

// Search form steps
When('I enter {string} as the destination city', async function(city: string) {
  await searchPage.selectCity(city);
  world.setTestData('searchCity', city);
});

When('I select check-in date {string} and check-out date {string}', async function(checkIn: string, checkOut: string) {
  await searchPage.selectDates(checkIn, checkOut);
  world.setTestData('checkInDate', checkIn);
  world.setTestData('checkOutDate', checkOut);
  
  // Calculate nights
  const nights = world.calculateNights(checkIn, checkOut);
  world.setTestData('nights', nights);
});

When('I set {int} adults, {int} children, and {int} rooms', async function(adults: number, children: number, rooms: number) {
  await searchPage.setGuestCounts(adults, children, rooms);
  world.setTestData('adults', adults);
  world.setTestData('children', children);
  world.setTestData('rooms', rooms);
  
  // Calculate required rooms based on occupancy
  const requiredRooms = world.calculateRoomsNeeded(adults, children);
  world.setTestData('requiredRooms', requiredRooms);
});

When('I select the {string} budget range', async function(budget: string) {
  await searchPage.selectBudget(budget);
  world.setTestData('budget', budget);
});

When('I click the search button', async function() {
  await searchPage.performSearch();
});

When('I perform a search', async function() {
  await searchPage.performSearch();
});

// Results validation steps
Then('I should see search results for {string}', async function(city: string) {
  await searchPage.waitForResults();
  
  // Verify URL contains search parameters
  const url = await navigationHelper.getCurrentUrl();
  expect(url).toContain('/search');
  expect(url).toContain(`city=${encodeURIComponent(city)}`);
});

Then('I should see hotels in the {string} price range', async function(budget: string) {
  await searchPage.waitForResults();
  
  // Check that results are displayed
  const hotelCards = world.page.locator('[data-testid="hotel-card"]');
  const count = await hotelCards.count();
  expect(count).toBeGreaterThan(0);
  
  // Verify budget parameter in URL
  const url = await navigationHelper.getCurrentUrl();
  const budgetMap: Record<string, string> = {
    'Under ₦80k': 'u80',
    '₦80k–₦130k': '80_130',
    '₦130k–₦200k': '130_200',
    '₦200k+': '200p'
  };
  
  const expectedBudget = budgetMap[budget];
  if (expectedBudget) {
    expect(url).toContain(`budget=${expectedBudget}`);
  }
});

Then('each hotel should display the nightly rate', async function() {
  const hotelCards = world.page.locator('[data-testid="hotel-card"]');
  const count = await hotelCards.count();
  
  for (let i = 0; i < count; i++) {
    const card = hotelCards.nth(i);
    const priceElement = card.locator('[data-testid="hotel-price"]');
    const priceText = await priceElement.textContent();
    
    // Check price format (₦XX,XXX)
    expect(priceText).toMatch(/₦[\d,]+/);
  }
});

Then('room count should be correctly calculated for {int} adults and {int} children', async function(adults: number, children: number) {
  const calculatedRooms = world.calculateRoomsNeeded(adults, children);
  const actualRooms = world.getTestData('rooms') || 1;
  
  // Verify sufficient rooms are selected
  expect(actualRooms).toBeGreaterThanOrEqual(calculatedRooms);
  
  // Store for later validation
  world.setTestData('calculatedRooms', calculatedRooms);
});

Then('the search should show hotels accommodating the total guest count', async function() {
  const adults = world.getTestData('adults') || 2;
  const children = world.getTestData('children') || 0;
  const rooms = world.getTestData('rooms') || 1;
  const totalGuests = adults + children;
  
  // Verify search URL contains correct guest parameters
  const url = await navigationHelper.getCurrentUrl();
  expect(url).toContain(`adults=${adults}`);
  expect(url).toContain(`children=${children}`);
  expect(url).toContain(`rooms=${rooms}`);
  
  // Store total for later calculations
  world.setTestData('totalGuests', totalGuests);
});

// Error handling steps
Then('I should see an error message', async function() {
  const errorElement = world.page.locator('[data-testid="error-message"]');
  await expect(errorElement).toBeVisible();
});

Then('I should see {string} message', async function(expectedMessage: string) {
  const messageElement = world.page.locator(`text="${expectedMessage}"`);
  await expect(messageElement).toBeVisible();
});

// Form validation steps
Then('the search button should be disabled', async function() {
  const searchButton = world.page.locator('[data-testid="search-button"]');
  await expect(searchButton).toBeDisabled();
});

Then('I should see validation errors', async function() {
  const errorElements = world.page.locator('[data-testid="validation-error"]');
  const count = await errorElements.count();
  expect(count).toBeGreaterThan(0);
});

// URL validation steps
Then('the URL should contain the search parameters', async function() {
  const url = await navigationHelper.getCurrentUrl();
  expect(url).toContain('/search');
  
  // Check that essential parameters are present
  const city = world.getTestData('searchCity');
  const checkIn = world.getTestData('checkInDate');
  const checkOut = world.getTestData('checkOutDate');
  
  if (city) expect(url).toContain(`city=${encodeURIComponent(city)}`);
  if (checkIn) expect(url).toContain('checkIn=');
  if (checkOut) expect(url).toContain('checkOut=');
});

// Mobile responsive steps
When('I am using a mobile device', async function() {
  await world.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
});

When('I am using a desktop browser', async function() {
  await world.page.setViewportSize({ width: 1280, height: 720 }); // Desktop size
});

Then('the search interface should be mobile-friendly', async function() {
  // Check that mobile search elements are visible
  const mobileSearchCard = world.page.locator('.search-card');
  await expect(mobileSearchCard).toBeVisible();
  
  // Verify responsive layout
  const viewport = world.page.viewportSize();
  if (viewport && viewport.width < 768) {
    // Mobile-specific checks
    const guestPicker = world.page.locator('[data-testid="guest-picker-trigger"]');
    await expect(guestPicker).toBeVisible();
  }
});