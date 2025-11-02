import { Page } from '@playwright/test';

export class ApartmentPage {
  constructor(private page: Page) {}

  // Locators
  get apartmentCards() { return this.page.locator('[data-testid="apartment-card"]'); }
  get apartmentTitle() { return this.page.locator('[data-testid="apartment-title"]'); }
  get apartmentPrice() { return this.page.locator('[data-testid="apartment-price"]'); }
  get apartmentLocation() { return this.page.locator('[data-testid="apartment-location"]'); }
  get apartmentBedrooms() { return this.page.locator('[data-testid="apartment-bedrooms"]'); }
  get apartmentBathrooms() { return this.page.locator('[data-testid="apartment-bathrooms"]'); }
  get apartmentSize() { return this.page.locator('[data-testid="apartment-size"]'); }
  get viewDetailsButton() { return this.page.locator('[data-testid="view-apartment-details"]'); }
  get contactOwnerButton() { return this.page.locator('[data-testid="contact-owner"]'); }
  
  // Filter locators
  get cityFilter() { return this.page.locator('[data-testid="apartment-city-filter"]'); }
  get priceFilter() { return this.page.locator('[data-testid="apartment-price-filter"]'); }
  get bedroomsFilter() { return this.page.locator('[data-testid="bedrooms-filter"]'); }
  get typeFilter() { return this.page.locator('[data-testid="apartment-type-filter"]'); }

  // Actions
  async filterByCity(city: string) {
    await this.cityFilter.selectOption(city);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByPriceRange(priceRange: string) {
    await this.priceFilter.selectOption(priceRange);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByBedrooms(bedrooms: string) {
    await this.bedroomsFilter.selectOption(bedrooms);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByType(type: string) {
    await this.typeFilter.selectOption(type);
    await this.page.waitForLoadState('networkidle');
  }

  async selectApartment(apartmentTitle: string) {
    const apartmentCard = this.page.locator(`[data-testid="apartment-card"]:has-text("${apartmentTitle}")`);
    await apartmentCard.locator('[data-testid="view-apartment-details"]').click();
    await this.page.waitForURL('**/apartments/**');
  }

  async contactOwner(apartmentTitle: string) {
    const apartmentCard = this.page.locator(`[data-testid="apartment-card"]:has-text("${apartmentTitle}")`);
    await apartmentCard.locator('[data-testid="contact-owner"]').click();
  }

  async getApartmentResults() {
    const cards = await this.apartmentCards.all();
    const apartments = [];
    
    for (const card of cards) {
      const title = await card.locator('[data-testid="apartment-title"]').textContent();
      const price = await card.locator('[data-testid="apartment-price"]').textContent();
      const location = await card.locator('[data-testid="apartment-location"]').textContent();
      const bedrooms = await card.locator('[data-testid="apartment-bedrooms"]').textContent();
      const bathrooms = await card.locator('[data-testid="apartment-bathrooms"]').textContent();
      
      apartments.push({ title, price, location, bedrooms, bathrooms });
    }
    
    return apartments;
  }
}

export class ApartmentDetailsPage {
  constructor(private page: Page) {}

  // Locators
  get apartmentTitle() { return this.page.locator('[data-testid="apartment-detail-title"]'); }
  get apartmentPrice() { return this.page.locator('[data-testid="apartment-detail-price"]'); }
  get apartmentDescription() { return this.page.locator('[data-testid="apartment-description"]'); }
  get apartmentAmenities() { return this.page.locator('[data-testid="apartment-amenities"]'); }
  get apartmentImages() { return this.page.locator('[data-testid="apartment-images"]'); }
  get ownerContact() { return this.page.locator('[data-testid="owner-contact"]'); }
  get inquiryForm() { return this.page.locator('[data-testid="inquiry-form"]'); }
  get nameInput() { return this.page.locator('[data-testid="inquirer-name"]'); }
  get emailInput() { return this.page.locator('[data-testid="inquirer-email"]'); }
  get phoneInput() { return this.page.locator('[data-testid="inquirer-phone"]'); }
  get messageInput() { return this.page.locator('[data-testid="inquiry-message"]'); }
  get sendInquiryButton() { return this.page.locator('[data-testid="send-inquiry"]'); }
  get whatsappButton() { return this.page.locator('[data-testid="whatsapp-owner"]'); }

  // Actions
  async fillInquiryForm(name: string, email: string, phone: string, message: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.messageInput.fill(message);
  }

  async sendInquiry() {
    await this.sendInquiryButton.click();
    await this.page.waitForSelector('[data-testid="inquiry-success"]');
  }

  async contactViaWhatsApp() {
    await this.whatsappButton.click();
  }

  async getApartmentDetails() {
    const title = await this.apartmentTitle.textContent();
    const price = await this.apartmentPrice.textContent();
    const description = await this.apartmentDescription.textContent();
    
    const amenitiesElements = await this.apartmentAmenities.locator('li').all();
    const amenities = [];
    
    for (const amenity of amenitiesElements) {
      const text = await amenity.textContent();
      amenities.push(text);
    }
    
    return { title, price, description, amenities };
  }
}

export class ErrorPage {
  constructor(private page: Page) {}

  // Locators
  get errorMessage() { return this.page.locator('[data-testid="error-message"]'); }
  get errorCode() { return this.page.locator('[data-testid="error-code"]'); }
  get homeButton() { return this.page.locator('[data-testid="back-to-home"]'); }
  get retryButton() { return this.page.locator('[data-testid="retry-button"]'); }

  // Actions
  async getErrorDetails() {
    const message = await this.errorMessage.textContent();
    const code = await this.errorCode.textContent();
    return { message, code };
  }

  async goHome() {
    await this.homeButton.click();
    await this.page.waitForURL('/');
  }

  async retry() {
    await this.retryButton.click();
  }
}

export class NavigationHelper {
  constructor(private page: Page) {}

  // Common navigation actions
  async goToHomepage() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async goToServices() {
    await this.page.goto('/services');
    await this.page.waitForLoadState('networkidle');
  }

  async goToFood() {
    await this.page.goto('/food');
    await this.page.waitForLoadState('networkidle');
  }

  async goToAirportTaxi() {
    await this.page.goto('/airport-taxi');
    await this.page.waitForLoadState('networkidle');
  }

  async goToApartments() {
    await this.page.goto('/apartments');
    await this.page.waitForLoadState('networkidle');
  }

  async goToPartnerSignup() {
    await this.page.goto('/partner');
    await this.page.waitForLoadState('networkidle');
  }

  // Tab navigation
  async switchToTab(tabName: string) {
    const tabMap: Record<string, string> = {
      'Hotels': '/',
      'Services': '/services',
      'Food': '/food'
    };
    
    const url = tabMap[tabName];
    if (url) {
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');
    }
  }

  // Wait for page elements
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('body');
  }

  // Get current URL
  async getCurrentUrl() {
    return this.page.url();
  }

  // Check if element exists
  async elementExists(selector: string) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}