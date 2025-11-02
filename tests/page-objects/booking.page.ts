import { Page } from '@playwright/test';

export class HotelDetailsPage {
  constructor(private page: Page) {}

  // Locators
  get hotelName() { return this.page.locator('[data-testid="hotel-name"]'); }
  get basePrice() { return this.page.locator('[data-testid="base-price"]'); }
  get starRating() { return this.page.locator('[data-testid="star-rating"]'); }
  get hotelType() { return this.page.locator('[data-testid="hotel-type"]'); }
  get city() { return this.page.locator('[data-testid="hotel-city"]'); }
  get negotiateButton() { return this.page.locator('[data-testid="negotiate-button"]'); }
  get bookNowButton() { return this.page.locator('[data-testid="book-now-button"]'); }
  get priceBreakdown() { return this.page.locator('[data-testid="price-breakdown"]'); }
  get totalPrice() { return this.page.locator('[data-testid="total-price"]'); }
  get vatAmount() { return this.page.locator('[data-testid="vat-amount"]'); }
  get nightsCount() { return this.page.locator('[data-testid="nights-count"]'); }

  // Actions
  async clickNegotiate() {
    await this.negotiateButton.click();
    await this.page.waitForURL('**/negotiate**');
  }

  async clickBookNow() {
    await this.bookNowButton.click();
    await this.page.waitForURL('**/book**');
  }

  async getHotelInfo() {
    const name = await this.hotelName.textContent();
    const price = await this.basePrice.textContent();
    const stars = await this.starRating.textContent();
    const type = await this.hotelType.textContent();
    const location = await this.city.textContent();
    
    return { name, price, stars, type, location };
  }

  async getPriceBreakdown() {
    const total = await this.totalPrice.textContent();
    const vat = await this.vatAmount.textContent();
    const nights = await this.nightsCount.textContent();
    
    return { total, vat, nights };
  }
}

export class NegotiationPage {
  constructor(private page: Page) {}

  // Locators
  get originalPrice() { return this.page.locator('[data-testid="original-price"]'); }
  get discountedPrice() { return this.page.locator('[data-testid="discounted-price"]'); }
  get savings() { return this.page.locator('[data-testid="savings-amount"]'); }
  get timer() { return this.page.locator('[data-testid="countdown-timer"]'); }
  get acceptButton() { return this.page.locator('[data-testid="accept-offer"]'); }
  get declineButton() { return this.page.locator('[data-testid="decline-offer"]'); }
  get noOfferMessage() { return this.page.locator('[data-testid="no-offer-message"]'); }
  get expiredMessage() { return this.page.locator('[data-testid="expired-message"]'); }

  // Actions
  async waitForNegotiationResult() {
    // Wait for either offer or no-offer state
    await Promise.race([
      this.discountedPrice.waitFor({ state: 'visible' }),
      this.noOfferMessage.waitFor({ state: 'visible' })
    ]);
  }

  async acceptOffer() {
    await this.acceptButton.click();
    await this.page.waitForURL('**/book**');
  }

  async declineOffer() {
    await this.declineButton.click();
  }

  async waitForExpiry() {
    await this.expiredMessage.waitFor({ state: 'visible', timeout: 310000 }); // 5min 10sec
  }

  async getNegotiationResult() {
    const hasOffer = await this.discountedPrice.isVisible();
    
    if (hasOffer) {
      const original = await this.originalPrice.textContent();
      const discounted = await this.discountedPrice.textContent();
      const savings = await this.savings.textContent();
      const timeLeft = await this.timer.textContent();
      
      return { hasOffer: true, original, discounted, savings, timeLeft };
    } else {
      const message = await this.noOfferMessage.textContent();
      return { hasOffer: false, message };
    }
  }
}

export class BookingPage {
  constructor(private page: Page) {}

  // Locators
  get nameInput() { return this.page.locator('[data-testid="guest-name"]'); }
  get emailInput() { return this.page.locator('[data-testid="guest-email"]'); }
  get phoneInput() { return this.page.locator('[data-testid="guest-phone"]'); }
  get specialRequests() { return this.page.locator('[data-testid="special-requests"]'); }
  get confirmBookingButton() { return this.page.locator('[data-testid="confirm-booking"]'); }
  get bookingSummary() { return this.page.locator('[data-testid="booking-summary"]'); }
  get finalPrice() { return this.page.locator('[data-testid="final-price"]'); }
  get bookingReference() { return this.page.locator('[data-testid="booking-reference"]'); }

  // Actions
  async fillGuestDetails(name: string, email: string, phone: string, requests?: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    
    if (requests) {
      await this.specialRequests.fill(requests);
    }
  }

  async confirmBooking() {
    await this.confirmBookingButton.click();
    await this.page.waitForURL('**/confirmation**');
  }

  async getBookingSummary() {
    const summary = await this.bookingSummary.textContent();
    const price = await this.finalPrice.textContent();
    
    return { summary, price };
  }
}

export class ConfirmationPage {
  constructor(private page: Page) {}

  // Locators
  get confirmationMessage() { return this.page.locator('[data-testid="confirmation-message"]'); }
  get bookingReference() { return this.page.locator('[data-testid="booking-reference"]'); }
  get bookingDetails() { return this.page.locator('[data-testid="booking-details"]'); }
  get whatsappButton() { return this.page.locator('[data-testid="whatsapp-support"]'); }

  // Actions
  async getBookingReference() {
    return await this.bookingReference.textContent();
  }

  async getBookingDetails() {
    return await this.bookingDetails.textContent();
  }

  async contactSupport() {
    await this.whatsappButton.click();
  }
}