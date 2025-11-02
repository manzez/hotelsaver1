import { Given, When, Then, Before } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { TestWorld } from '../support/world';
import { BookingPage, ConfirmationPage } from '../page-objects/booking.page';

let world: TestWorld;
let bookingPage: BookingPage;
let confirmationPage: ConfirmationPage;

Before(async function() {
  world = new TestWorld();
  world.page = this.page;
  bookingPage = new BookingPage(world.page);
  confirmationPage = new ConfirmationPage(world.page);
});

// Booking form steps
When('I proceed to the booking page', async function() {
  await world.page.waitForURL('**/book**');
});

When('I am on the booking page', async function() {
  await expect(world.page).toHaveURL(/.*\/book.*/);
});

When('I fill in the guest details:', async function(dataTable: any) {
  const guestData = dataTable.hashes()[0];
  
  await bookingPage.fillGuestDetails(
    guestData.name,
    guestData.email, 
    guestData.phone,
    guestData.requests
  );
  
  // Store guest data for validation
  world.setTestData('guestName', guestData.name);
  world.setTestData('guestEmail', guestData.email);
  world.setTestData('guestPhone', guestData.phone);
  world.setTestData('specialRequests', guestData.requests);
});

When('I provide guest information', async function() {
  const defaultGuest = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+234801234567'
  };
  
  await bookingPage.fillGuestDetails(
    defaultGuest.name,
    defaultGuest.email,
    defaultGuest.phone
  );
  
  world.setTestData('guestName', defaultGuest.name);
  world.setTestData('guestEmail', defaultGuest.email);
  world.setTestData('guestPhone', defaultGuest.phone);
});

When('I click confirm booking', async function() {
  await bookingPage.confirmBooking();
});

When('I submit the booking form', async function() {
  await bookingPage.confirmBooking();
});

// Form validation steps
Then('I should see the booking form', async function() {
  const nameInput = bookingPage.nameInput;
  const emailInput = bookingPage.emailInput;
  const phoneInput = bookingPage.phoneInput;
  
  await expect(nameInput).toBeVisible();
  await expect(emailInput).toBeVisible();
  await expect(phoneInput).toBeVisible();
});

Then('all required fields should be present', async function() {
  const requiredFields = [
    bookingPage.nameInput,
    bookingPage.emailInput,
    bookingPage.phoneInput,
    bookingPage.confirmBookingButton
  ];
  
  for (const field of requiredFields) {
    await expect(field).toBeVisible();
  }
});

Then('the booking summary should show correct details', async function() {
  const summary = await bookingPage.getBookingSummary();
  
  // Verify summary contains key information
  expect(summary.summary).toBeDefined();
  expect(summary.price).toBeDefined();
  
  // Check that price format is correct
  expect(summary.price).toMatch(/₦[\d,]+/);
});

// Booking confirmation steps
Then('I should be redirected to the confirmation page', async function() {
  await expect(world.page).toHaveURL(/.*\/confirmation.*/);
});

Then('I should see a booking confirmation', async function() {
  const confirmationMessage = confirmationPage.confirmationMessage;
  await expect(confirmationMessage).toBeVisible();
});

Then('I should receive a booking reference number', async function() {
  const bookingRef = await confirmationPage.getBookingReference();
  
  expect(bookingRef).toBeDefined();
  expect(bookingRef).toMatch(/BK\d+/); // Format: BK followed by numbers
  
  world.setTestData('bookingReference', bookingRef);
});

Then('the booking reference should follow the format {string}', async function(expectedFormat: string) {
  const bookingRef = await confirmationPage.getBookingReference();
  
  // Convert format description to regex pattern
  let pattern = expectedFormat
    .replace('BK', 'BK')
    .replace('{timestamp}', '\\d+');
  
  const regex = new RegExp(pattern);
  expect(bookingRef).toMatch(regex);
});

// Email validation steps
Then('the email should be validated', async function() {
  const emailInput = bookingPage.emailInput;
  
  // Check that email input has email validation
  const inputType = await emailInput.getAttribute('type');
  expect(inputType).toBe('email');
});

When('I enter an invalid email {string}', async function(invalidEmail: string) {
  await bookingPage.emailInput.fill(invalidEmail);
  world.setTestData('invalidEmail', invalidEmail);
});

Then('I should see an email validation error', async function() {
  // Try to submit and check for validation
  await bookingPage.confirmBookingButton.click();
  
  const emailInput = bookingPage.emailInput;
  const validationMessage = await emailInput.evaluate(
    (input: HTMLInputElement) => input.validationMessage
  );
  
  expect(validationMessage).toBeTruthy();
});

// Phone number validation steps
When('I enter phone number {string}', async function(phoneNumber: string) {
  await bookingPage.phoneInput.fill(phoneNumber);
  world.setTestData('phoneNumber', phoneNumber);
});

Then('the phone number should be accepted', async function() {
  const phoneValue = await bookingPage.phoneInput.inputValue();
  const expectedPhone = world.getTestData('phoneNumber');
  expect(phoneValue).toBe(expectedPhone);
});

// Price preservation steps
Then('the negotiated price should be preserved', async function() {
  const finalPrice = await bookingPage.finalPrice.textContent();
  const negotiatedPrice = world.getTestData('negotiatedPrice');
  
  if (negotiatedPrice) {
    expect(finalPrice).toBe(negotiatedPrice);
  } else {
    // If no negotiated price, should show original price
    expect(finalPrice).toMatch(/₦[\d,]+/);
  }
});

Then('the booking should show the correct total amount', async function() {
  const finalPrice = await bookingPage.finalPrice.textContent();
  const numericPrice = parseInt(finalPrice?.replace(/[₦,]/g, '') || '0');
  
  // Verify price is a reasonable amount (greater than 0)
  expect(numericPrice).toBeGreaterThan(0);
  
  // Store for potential later validation
  world.setTestData('finalBookingPrice', numericPrice);
});

// Contact information steps
Then('the guest contact information should be captured', async function() {
  const nameValue = await bookingPage.nameInput.inputValue();
  const emailValue = await bookingPage.emailInput.inputValue();
  const phoneValue = await bookingPage.phoneInput.inputValue();
  
  expect(nameValue).toBe(world.getTestData('guestName'));
  expect(emailValue).toBe(world.getTestData('guestEmail')); 
  expect(phoneValue).toBe(world.getTestData('guestPhone'));
});

// Special requests steps
When('I add special requests {string}', async function(requests: string) {
  await bookingPage.specialRequests.fill(requests);
  world.setTestData('specialRequests', requests);
});

Then('the special requests should be included', async function() {
  const requestsValue = await bookingPage.specialRequests.inputValue();
  const expectedRequests = world.getTestData('specialRequests');
  expect(requestsValue).toBe(expectedRequests);
});

// Booking details validation steps
Then('the booking details should include:', async function(dataTable: any) {
  const expectedDetails = dataTable.hashes()[0];
  const bookingDetails = await confirmationPage.getBookingDetails();
  
  // Check that booking details contain expected information
  for (const [key, value] of Object.entries(expectedDetails)) {
    if (value) {
      expect(bookingDetails).toContain(value as string);
    }
  }
});

Then('the confirmation should display guest information', async function() {
  const bookingDetails = await confirmationPage.getBookingDetails();
  const guestName = world.getTestData('guestName');
  
  expect(bookingDetails).toContain(guestName);
});

// Support contact steps
Then('I should see support contact options', async function() {
  const whatsappButton = confirmationPage.whatsappButton;
  await expect(whatsappButton).toBeVisible();
});

When('I click the WhatsApp support button', async function() {
  await confirmationPage.contactSupport();
});

Then('it should open WhatsApp with the support number', async function() {
  // Check that WhatsApp link has correct format
  const whatsappButton = confirmationPage.whatsappButton;
  const href = await whatsappButton.getAttribute('href');
  
  expect(href).toMatch(/https:\/\/wa\.me\/\d+/);
});

// Multiple bookings steps
When('I complete multiple bookings', async function() {
  const bookingCount = 3;
  const bookingRefs = [];
  
  for (let i = 0; i < bookingCount; i++) {
    // Simulate booking process
    await bookingPage.fillGuestDetails(
      `Guest ${i + 1}`,
      `guest${i + 1}@example.com`,
      `+23480${1000000 + i}`
    );
    
    await bookingPage.confirmBooking();
    
    const bookingRef = await confirmationPage.getBookingReference();
    bookingRefs.push(bookingRef);
    
    // Navigate back for next booking (in real scenario)
    if (i < bookingCount - 1) {
      await world.page.goto('/');
    }
  }
  
  world.setTestData('multipleBookingRefs', bookingRefs);
});

Then('each booking should have a unique reference number', async function() {
  const bookingRefs = world.getTestData('multipleBookingRefs') || [];
  
  // Check that all references are unique
  const uniqueRefs = new Set(bookingRefs);
  expect(uniqueRefs.size).toBe(bookingRefs.length);
  
  // Check that all follow the correct format
  bookingRefs.forEach((ref: string) => {
    expect(ref).toMatch(/BK\d+/);
  });
});

// Booking persistence steps
Then('the booking should be saved successfully', async function() {
  // Verify confirmation page shows success
  const confirmationMessage = confirmationPage.confirmationMessage;
  const messageText = await confirmationMessage.textContent();
  
  expect(messageText).toMatch(/(confirmed|success|booked)/i);
});

Then('I should be able to reference the booking later', async function() {
  const bookingRef = world.getTestData('bookingReference');
  
  // Verify reference exists and can be used for future lookups
  expect(bookingRef).toBeDefined();
  expect(bookingRef).toMatch(/BK\d+/);
  
  // In a real system, you might verify the booking exists in a database
  // For this test, we verify the reference format is trackable
});
    
    const fieldElement = page.locator(`[data-testid="${fieldName.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(fieldElement).toContainText(value);
  }
});

When('I click {string} within the timer limit', async (buttonText: string) => {
  // Ensure timer is still active
  const timer = page.locator('[data-testid="countdown-timer"]');
  await expect(timer).toBeVisible();
  
  await page.locator(`button:has-text("${buttonText}")`).click();
});

Then('I should see the price calculation:', async (dataTable: any) => {
  const calculations = dataTable.hashes();
  
  for (const calc of calculations) {
    const component = calc['Component'];
    const amount = calc['Amount'];
    
    const componentElement = page.locator(`[data-testid="${component.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(componentElement).toContainText(amount);
  }
});

// Form Validation Steps
Given('I am on the booking page', async () => {
  // Assumes we navigated to booking page from previous steps
  await expect(page).toHaveURL(/\/book/);
});

When('I try to submit without filling required fields', async () => {
  await page.locator('[data-testid="submit-booking"]').click();
});

Then('I should see validation errors for:', async (dataTable: any) => {
  const validations = dataTable.hashes();
  
  for (const validation of validations) {
    const field = validation['Field'];
    const errorMessage = validation['Error Message'];
    
    const errorElement = page.locator(`[data-testid="${field.toLowerCase().replace(/\s+/g, '-')}-error"]`);
    await expect(errorElement).toContainText(errorMessage);
  }
});

When('I fill all required fields correctly', async () => {
  await page.locator('[data-testid="full-name"]').fill('John Smith');
  await page.locator('[data-testid="email"]').fill('john.smith@example.com');
  await page.locator('[data-testid="phone"]').fill('+234 803 123 4567');
});

When('I click {string}', async (buttonText: string) => {
  await page.locator(`button:has-text("${buttonText}")`).click();
});

Then('I should see a booking confirmation', async () => {
  await page.locator('[data-testid="booking-confirmation"]').waitFor();
});

// Confirmation Steps
Given('I have filled all booking details correctly', async () => {
  await page.locator('[data-testid="full-name"]').fill('Jane Doe');
  await page.locator('[data-testid="email"]').fill('jane.doe@example.com');
  await page.locator('[data-testid="phone"]').fill('+234 802 987 6543');
});

When('I submit the booking form', async () => {
  await page.locator('[data-testid="submit-booking"]').click();
});

Then('I should see a booking confirmation page', async () => {
  await expect(page).toHaveURL(/\/confirmation/);
});

Then('I should see a unique booking reference starting with {string}', async (prefix: string) => {
  const referenceElement = page.locator('[data-testid="booking-reference"]');
  const referenceText = await referenceElement.textContent();
  expect(referenceText).toMatch(new RegExp(`^${prefix}\\d+`));
});

Then('I should see all booking details summarized', async () => {
  await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();
});

Then('I should receive a confirmation email', async () => {
  // In a real scenario, this might check an email service or mock
  // For now, we'll check if there's an indication that email was sent
  await expect(page.locator('[data-testid="email-confirmation-notice"]')).toBeVisible();
});

Then('the booking status should be {string}', async (status: string) => {
  const statusElement = page.locator('[data-testid="booking-status"]');
  await expect(statusElement).toContainText(status);
});

// Multiple Rooms Steps
Given('I have selected {string} which requires {string}', async (guestConfig: string, roomsNeeded: string) => {
  // Verify that the system has calculated the correct number of rooms needed
  const roomsDisplay = page.locator('[data-testid="rooms-needed"]');
  await expect(roomsDisplay).toContainText(roomsNeeded);
});

Given('the hotel price is {string}', async (pricePerRoom: string) => {
  const priceElement = page.locator('[data-testid="price-per-room"]');
  await expect(priceElement).toContainText(pricePerRoom);
});

Given('I have {string} selected', async (nights: string) => {
  const nightsElement = page.locator('[data-testid="nights-selected"]');
  await expect(nightsElement).toContainText(nights);
});

When('I proceed to booking', async () => {
  await page.locator('[data-testid="proceed-to-booking"]').click();
});

Then('I should see the calculation:', async (dataTable: any) => {
  const calculations = dataTable.hashes();
  
  for (const calc of calculations) {
    const description = calc['Description'];
    const calculation = calc['Calculation'];
    const amount = calc['Amount'];
    
    const rowElement = page.locator(`[data-testid="calc-${description.toLowerCase().replace(/\s+/g, '-')}"]`);
    await expect(rowElement).toBeVisible();
    
    if (calculation) {
      await expect(rowElement).toContainText(calculation);
    }
    
    await expect(rowElement).toContainText(amount);
  }
});

// Edge Case Steps
Given('I have selected {string} stay', async (duration: string) => {
  const durationElement = page.locator('[data-testid="stay-duration"]');
  await expect(durationElement).toContainText(duration);
});

Then('I should see a note {string}', async (noteText: string) => {
  const noteElement = page.locator('[data-testid="vat-note"]');
  await expect(noteElement).toContainText(noteText);
});

// Timer Expiry Steps
Given('I have a negotiated price that expires in {string}', async (timeRemaining: string) => {
  const timer = page.locator('[data-testid="countdown-timer"]');
  await expect(timer).toContainText(timeRemaining);
});

When('the timer expires while I\'m filling the form', async () => {
  // Wait for timer to expire (in testing, this might be sped up)
  await page.waitForFunction(() => {
    const timerElement = document.querySelector('[data-testid="countdown-timer"]');
    return timerElement?.textContent?.includes('0:00');
  });
});

Then('I should see an {string} notification', async (notificationType: string) => {
  const notification = page.locator(`[data-testid="${notificationType.toLowerCase().replace(/\s+/g, '-')}-notification"]`);
  await expect(notification).toBeVisible();
});

Then('the booking form should be disabled', async () => {
  const form = page.locator('[data-testid="booking-form"]');
  await expect(form).toHaveClass(/disabled/);
});

Then('I should see options to {string} or {string}', async (option1: string, option2: string) => {
  const option1Button = page.locator(`button:has-text("${option1}")`);
  const option2Button = page.locator(`button:has-text("${option2}")`);
  
  await expect(option1Button).toBeVisible();
  await expect(option2Button).toBeVisible();
});

// Price Preservation Steps
Given('I negotiated from {string} to {string}', async (originalPrice: string, negotiatedPrice: string) => {
  // Verify both prices are displayed in the booking context
  await expect(page.locator('[data-testid="original-price"]')).toContainText(originalPrice);
  await expect(page.locator('[data-testid="negotiated-price"]')).toContainText(negotiatedPrice);
});

When('I navigate through: Search → Negotiation → Booking → Confirmation', async () => {
  // This step assumes the navigation has been completed in previous steps
  // We're now verifying the price consistency
});

Then('the price should remain {string} at each step', async (price: string) => {
  // Check that the price is consistently displayed
  const priceElements = page.locator('[data-testid*="price"]');
  const priceTexts = await priceElements.allTextContents();
  
  // At least one element should contain the expected price
  expect(priceTexts.some(text => text.includes(price))).toBeTruthy();
});

Then('all calculations should be based on {string}', async (basePrice: string) => {
  // Verify that calculations use the negotiated price as base
  const calculationBase = page.locator('[data-testid="calculation-base"]');
  await expect(calculationBase).toContainText(basePrice);
});

Then('the booking confirmation should show {string} as the negotiated rate', async (rate: string) => {
  const confirmedRate = page.locator('[data-testid="confirmed-rate"]');
  await expect(confirmedRate).toContainText(rate);
});