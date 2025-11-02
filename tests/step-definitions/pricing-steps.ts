import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../support/world';
import { HotelDetailsPage, NegotiationPage } from '../page-objects/booking.page';

let world: TestWorld;
let hotelDetailsPage: HotelDetailsPage;
let negotiationPage: NegotiationPage;

Before(async function() {
  world = new TestWorld();
  world.page = this.page;
  hotelDetailsPage = new HotelDetailsPage(world.page);
  negotiationPage = new NegotiationPage(world.page);
});

// Hotel selection and pricing steps
Given('I am viewing a hotel with base price {string}', async function(basePrice: string) {
  // Extract numeric value from price string (e.g., "₦150,000" -> 150000)
  const numericPrice = parseInt(basePrice.replace(/[₦,]/g, ''));
  world.setTestData('basePrice', numericPrice);
  world.setTestData('basePriceFormatted', basePrice);
});

When('I view the hotel pricing breakdown', async function() {
  const priceInfo = await hotelDetailsPage.getPriceBreakdown();
  world.setTestData('priceBreakdown', priceInfo);
});

Then('the base price should be {string} per night', async function(expectedPrice: string) {
  const basePriceElement = world.page.locator('[data-testid="base-price"]');
  const actualPrice = await basePriceElement.textContent();
  expect(actualPrice).toBe(expectedPrice);
});

Then('the total should be calculated as base price × {int} nights', async function(nights: number) {
  const basePrice = world.getTestData('basePrice');
  const expectedSubtotal = basePrice * nights;
  
  const subtotalElement = world.page.locator('[data-testid="subtotal-price"]');
  const subtotalText = await subtotalElement.textContent();
  const actualSubtotal = parseInt(subtotalText?.replace(/[₦,]/g, '') || '0');
  
  expect(actualSubtotal).toBe(expectedSubtotal);
  world.setTestData('subtotal', expectedSubtotal);
});

Then('VAT should be {string}% of the subtotal', async function(vatRate: string) {
  const vatRateDecimal = parseFloat(vatRate) / 100; // "7.5" -> 0.075
  const subtotal = world.getTestData('subtotal');
  const nights = world.getTestData('nights') || 1;
  
  let expectedVAT = 0;
  if (nights > 1) {
    expectedVAT = Math.round(subtotal * vatRateDecimal);
  }
  
  const vatElement = world.page.locator('[data-testid="vat-amount"]');
  const vatText = await vatElement.textContent();
  const actualVAT = parseInt(vatText?.replace(/[₦,]/g, '') || '0');
  
  expect(actualVAT).toBe(expectedVAT);
  world.setTestData('vat', expectedVAT);
});

Then('the final total should include VAT for multi-night stays', async function() {
  const subtotal = world.getTestData('subtotal');
  const vat = world.getTestData('vat');
  const expectedTotal = subtotal + vat;
  
  const totalElement = world.page.locator('[data-testid="total-price"]');
  const totalText = await totalElement.textContent();
  const actualTotal = parseInt(totalText?.replace(/[₦,]/g, '') || '0');
  
  expect(actualTotal).toBe(expectedTotal);
  world.setTestData('finalTotal', expectedTotal);
});

// Negotiation flow steps
When('I click the negotiate button', async function() {
  await hotelDetailsPage.clickNegotiate();
  await world.page.waitForURL('**/negotiate**');
});

When('I start the negotiation process', async function() {
  await hotelDetailsPage.clickNegotiate();
});

Then('I should be redirected to the negotiation page', async function() {
  await expect(world.page).toHaveURL(/.*\/negotiate.*/);
});

Then('I should see the negotiation interface', async function() {
  // Wait for negotiation result
  await negotiationPage.waitForNegotiationResult();
  
  // Check if offer or no-offer state is displayed
  const hasOffer = await negotiationPage.discountedPrice.isVisible();
  const hasNoOffer = await negotiationPage.noOfferMessage.isVisible();
  
  expect(hasOffer || hasNoOffer).toBeTruthy();
});

// Discount calculation steps
When('the system applies a {string}% discount', async function(discountRate: string) {
  const rate = parseFloat(discountRate) / 100; // "15" -> 0.15
  const basePrice = world.getTestData('basePrice');
  
  const expectedDiscount = Math.round(basePrice * rate);
  const expectedDiscountedPrice = basePrice - expectedDiscount;
  
  world.setTestData('discountRate', rate);
  world.setTestData('expectedDiscount', expectedDiscount);
  world.setTestData('expectedDiscountedPrice', expectedDiscountedPrice);
});

Then('the discounted price should be {string}', async function(expectedPrice: string) {
  const negotiationResult = await negotiationPage.getNegotiationResult();
  
  if (negotiationResult.hasOffer) {
    const discountedText = negotiationResult.discounted;
    expect(discountedText).toBe(expectedPrice);
  } else {
    throw new Error('No discount offer available to validate price');
  }
});

Then('the savings amount should be {string}', async function(expectedSavings: string) {
  const negotiationResult = await negotiationPage.getNegotiationResult();
  
  if (negotiationResult.hasOffer) {
    const savingsText = negotiationResult.savings;
    expect(savingsText).toBe(expectedSavings);
  } else {
    throw new Error('No discount offer available to validate savings');
  }
});

Then('I should see a {int}-minute countdown timer', async function(minutes: number) {
  const negotiationResult = await negotiationPage.getNegotiationResult();
  
  if (negotiationResult.hasOffer && negotiationResult.timeLeft) {
    // Timer should show something like "4:59" for a fresh 5-minute timer
    const timePattern = /[0-4]:[0-5][0-9]/; // 0:00 to 4:59
    expect(negotiationResult.timeLeft).toMatch(timePattern);
  }
});

// Room-based pricing calculations
When('I have {int} rooms selected for {int} nights', async function(rooms: number, nights: number) {
  world.setTestData('selectedRooms', rooms);
  world.setTestData('nights', nights);
});

Then('the total should be calculated as \\(base price × rooms × nights)', async function() {
  const basePrice = world.getTestData('basePrice');
  const rooms = world.getTestData('selectedRooms');
  const nights = world.getTestData('nights');
  
  const expectedSubtotal = basePrice * rooms * nights;
  
  // Find subtotal display element
  const subtotalElement = world.page.locator('[data-testid="subtotal-price"]');
  const subtotalText = await subtotalElement.textContent();
  const actualSubtotal = parseInt(subtotalText?.replace(/[₦,]/g, '') || '0');
  
  expect(actualSubtotal).toBe(expectedSubtotal);
  world.setTestData('roomBasedSubtotal', expectedSubtotal);
});

Then('room-based VAT should be calculated on the total room cost', async function() {
  const roomSubtotal = world.getTestData('roomBasedSubtotal');
  const nights = world.getTestData('nights');
  
  let expectedVAT = 0;
  if (nights > 1) {
    expectedVAT = Math.round(roomSubtotal * 0.075); // 7.5% VAT
  }
  
  const vatElement = world.page.locator('[data-testid="vat-amount"]');
  const vatText = await vatElement.textContent();
  const actualVAT = parseInt(vatText?.replace(/[₦,]/g, '') || '0');
  
  expect(actualVAT).toBe(expectedVAT);
});

// Offer expiry steps
When('I wait for the offer to expire', async function() {
  // Wait for expiry message (5 minutes + buffer)
  await negotiationPage.waitForExpiry();
});

Then('the offer should expire after {int} minutes', async function(minutes: number) {
  // Check that expired message is shown
  const expiredMessage = negotiationPage.expiredMessage;
  await expect(expiredMessage).toBeVisible({ timeout: (minutes * 60 + 10) * 1000 });
});

Then('I should see an expired offer message', async function() {
  const expiredMessage = negotiationPage.expiredMessage;
  await expect(expiredMessage).toBeVisible();
});

// No offer scenarios
Then('I should see a "no discount available" message', async function() {
  const noOfferMessage = negotiationPage.noOfferMessage;
  await expect(noOfferMessage).toBeVisible();
  
  const messageText = await noOfferMessage.textContent();
  expect(messageText).toContain('no discount');
});

Then('no countdown timer should be displayed', async function() {
  const timer = negotiationPage.timer;
  await expect(timer).not.toBeVisible();
});

// Price validation helpers
Then('all prices should be displayed in Nigerian Naira format', async function() {
  const priceElements = world.page.locator('[data-testid*="price"]');
  const count = await priceElements.count();
  
  for (let i = 0; i < count; i++) {
    const element = priceElements.nth(i);
    const priceText = await element.textContent();
    
    if (priceText && priceText.trim()) {
      // Check for ₦ symbol and comma formatting
      expect(priceText).toMatch(/₦[\d,]+/);
    }
  }
});

Then('discount calculations should be mathematically accurate', async function() {
  const basePrice = world.getTestData('basePrice');
  const discountRate = world.getTestData('discountRate') || 0.15;
  
  const expectedDiscount = Math.round(basePrice * discountRate);
  const expectedDiscountedPrice = basePrice - expectedDiscount;
  
  // Verify the calculations match what's displayed
  const negotiationResult = await negotiationPage.getNegotiationResult();
  
  if (negotiationResult.hasOffer) {
    const displayedOriginal = parseInt(negotiationResult.original?.replace(/[₦,]/g, '') || '0');
    const displayedDiscounted = parseInt(negotiationResult.discounted?.replace(/[₦,]/g, '') || '0');
    const displayedSavings = parseInt(negotiationResult.savings?.replace(/[₦,]/g, '') || '0');
    
    expect(displayedOriginal).toBe(basePrice);
    expect(displayedDiscounted).toBe(expectedDiscountedPrice);
    expect(displayedSavings).toBe(expectedDiscount);
    
    // Verify mathematical relationship
    expect(displayedOriginal - displayedSavings).toBe(displayedDiscounted);
  }
});