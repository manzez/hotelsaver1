import { Page } from '@playwright/test';

export class ServicesPage {
  constructor(private page: Page) {}

  // Locators
  get cityFilter() { return this.page.locator('[data-testid="services-city-filter"]'); }
  get categoryFilter() { return this.page.locator('[data-testid="category-filter"]'); }
  get searchInput() { return this.page.locator('[data-testid="services-search"]'); }
  get serviceCards() { return this.page.locator('[data-testid="service-card"]'); }
  get serviceTitle() { return this.page.locator('[data-testid="service-title"]'); }
  get servicePrice() { return this.page.locator('[data-testid="service-price"]'); }
  get serviceRating() { return this.page.locator('[data-testid="service-rating"]'); }
  get bookServiceButton() { return this.page.locator('[data-testid="book-service-button"]'); }

  // Actions
  async filterByCity(city: string) {
    await this.cityFilter.selectOption(city);
    await this.page.waitForResponse('**/api/services/search**');
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.selectOption(category);
    await this.page.waitForResponse('**/api/services/search**');
  }

  async searchServices(query: string) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForResponse('**/api/services/search**');
  }

  async selectService(serviceName: string) {
    await this.page.locator(`[data-testid="service-card"]:has-text("${serviceName}")`).click();
    await this.page.waitForURL('**/services/**');
  }

  async getServiceResults() {
    const cards = await this.serviceCards.all();
    const services = [];
    
    for (const card of cards) {
      const title = await card.locator('[data-testid="service-title"]').textContent();
      const price = await card.locator('[data-testid="service-price"]').textContent();
      const rating = await card.locator('[data-testid="service-rating"]').textContent();
      
      services.push({ title, price, rating });
    }
    
    return services;
  }
}

export class ServiceBookingPage {
  constructor(private page: Page) {}

  // Locators
  get serviceName() { return this.page.locator('[data-testid="service-name"]'); }
  get servicePrice() { return this.page.locator('[data-testid="service-price"]'); }
  get dateInput() { return this.page.locator('[data-testid="service-date"]'); }
  get timeInput() { return this.page.locator('[data-testid="service-time"]'); }
  get durationSelect() { return this.page.locator('[data-testid="service-duration"]'); }
  get peopleCounter() { return this.page.locator('[data-testid="people-count"]'); }
  get locationInput() { return this.page.locator('[data-testid="service-location"]'); }
  get nameInput() { return this.page.locator('[data-testid="customer-name"]'); }
  get phoneInput() { return this.page.locator('[data-testid="customer-phone"]'); }
  get emailInput() { return this.page.locator('[data-testid="customer-email"]'); }
  get notesInput() { return this.page.locator('[data-testid="service-notes"]'); }
  get bookButton() { return this.page.locator('[data-testid="book-service"]'); }
  get totalPrice() { return this.page.locator('[data-testid="total-service-price"]'); }

  // Actions
  async fillServiceDetails(date: string, time: string, duration: string, people: number) {
    await this.dateInput.fill(date);
    await this.timeInput.fill(time);
    await this.durationSelect.selectOption(duration);
    
    // Set people count
    const currentCount = await this.peopleCounter.inputValue();
    const diff = people - parseInt(currentCount);
    
    if (diff !== 0) {
      await this.peopleCounter.fill(people.toString());
    }
  }

  async fillCustomerInfo(name: string, phone: string, email: string, location: string, notes?: string) {
    await this.nameInput.fill(name);
    await this.phoneInput.fill(phone);
    await this.emailInput.fill(email);
    await this.locationInput.fill(location);
    
    if (notes) {
      await this.notesInput.fill(notes);
    }
  }

  async confirmServiceBooking() {
    await this.bookButton.click();
    await this.page.waitForURL('**/confirmation**');
  }

  async getServiceInfo() {
    const name = await this.serviceName.textContent();
    const price = await this.servicePrice.textContent();
    const total = await this.totalPrice.textContent();
    
    return { name, price, total };
  }
}

export class TaxiPage {
  constructor(private page: Page) {}

  // Locators
  get fromInput() { return this.page.locator('[data-testid="pickup-location"]'); }
  get toInput() { return this.page.locator('[data-testid="dropoff-location"]'); }
  get dateInput() { return this.page.locator('[data-testid="taxi-date"]'); }
  get timeInput() { return this.page.locator('[data-testid="taxi-time"]'); }
  get passengersSelect() { return this.page.locator('[data-testid="passenger-count"]'); }
  get vehicleTypeSelect() { return this.page.locator('[data-testid="vehicle-type"]'); }
  get nameInput() { return this.page.locator('[data-testid="passenger-name"]'); }
  get phoneInput() { return this.page.locator('[data-testid="passenger-phone"]'); }
  get emailInput() { return this.page.locator('[data-testid="passenger-email"]'); }
  get bookTaxiButton() { return this.page.locator('[data-testid="book-taxi"]'); }
  get estimatedPrice() { return this.page.locator('[data-testid="estimated-price"]'); }

  // Actions
  async fillTripDetails(from: string, to: string, date: string, time: string, passengers: number) {
    await this.fromInput.fill(from);
    await this.toInput.fill(to);
    await this.dateInput.fill(date);
    await this.timeInput.fill(time);
    await this.passengersSelect.selectOption(passengers.toString());
  }

  async selectVehicleType(type: string) {
    await this.vehicleTypeSelect.selectOption(type);
  }

  async fillPassengerDetails(name: string, phone: string, email: string) {
    await this.nameInput.fill(name);
    await this.phoneInput.fill(phone);
    await this.emailInput.fill(email);
  }

  async bookTaxi() {
    await this.bookTaxiButton.click();
    await this.page.waitForURL('**/confirmation**');
  }

  async getEstimatedPrice() {
    return await this.estimatedPrice.textContent();
  }
}

export class FoodPage {
  constructor(private page: Page) {}

  // Locators
  get dishCards() { return this.page.locator('[data-testid="dish-card"]'); }
  get dishName() { return this.page.locator('[data-testid="dish-name"]'); }
  get dishPrice() { return this.page.locator('[data-testid="dish-price"]'); }
  get addToCartButton() { return this.page.locator('[data-testid="add-to-cart"]'); }
  get cartIcon() { return this.page.locator('[data-testid="cart-icon"]'); }
  get cartCount() { return this.page.locator('[data-testid="cart-count"]'); }
  get viewCartButton() { return this.page.locator('[data-testid="view-cart"]'); }

  // Cart page locators
  get cartItems() { return this.page.locator('[data-testid="cart-item"]'); }
  get quantityInput() { return this.page.locator('[data-testid="item-quantity"]'); }
  get removeItemButton() { return this.page.locator('[data-testid="remove-item"]'); }
  get subtotalPrice() { return this.page.locator('[data-testid="subtotal"]'); }
  get deliveryFee() { return this.page.locator('[data-testid="delivery-fee"]'); }
  get totalPrice() { return this.page.locator('[data-testid="total-price"]'); }
  get checkoutButton() { return this.page.locator('[data-testid="checkout"]'); }

  // Checkout page locators
  get deliveryNameInput() { return this.page.locator('[data-testid="delivery-name"]'); }
  get deliveryPhoneInput() { return this.page.locator('[data-testid="delivery-phone"]'); }
  get deliveryAddressInput() { return this.page.locator('[data-testid="delivery-address"]'); }
  get deliveryNotesInput() { return this.page.locator('[data-testid="delivery-notes"]'); }
  get placeOrderButton() { return this.page.locator('[data-testid="place-order"]'); }

  // Actions
  async addDishToCart(dishName: string, quantity: number = 1) {
    const dishCard = this.page.locator(`[data-testid="dish-card"]:has-text("${dishName}")`);
    
    for (let i = 0; i < quantity; i++) {
      await dishCard.locator('[data-testid="add-to-cart"]').click();
    }
  }

  async viewCart() {
    await this.viewCartButton.click();
    await this.page.waitForURL('**/cart**');
  }

  async updateQuantity(itemName: string, newQuantity: number) {
    const item = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}")`);
    await item.locator('[data-testid="item-quantity"]').fill(newQuantity.toString());
  }

  async removeItem(itemName: string) {
    const item = this.page.locator(`[data-testid="cart-item"]:has-text("${itemName}")`);
    await item.locator('[data-testid="remove-item"]').click();
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForURL('**/checkout**');
  }

  async fillDeliveryDetails(name: string, phone: string, address: string, notes?: string) {
    await this.deliveryNameInput.fill(name);
    await this.deliveryPhoneInput.fill(phone);
    await this.deliveryAddressInput.fill(address);
    
    if (notes) {
      await this.deliveryNotesInput.fill(notes);
    }
  }

  async placeOrder() {
    await this.placeOrderButton.click();
    await this.page.waitForURL('**/confirmation**');
  }

  async getCartSummary() {
    const subtotal = await this.subtotalPrice.textContent();
    const delivery = await this.deliveryFee.textContent();
    const total = await this.totalPrice.textContent();
    const itemCount = await this.cartCount.textContent();
    
    return { subtotal, delivery, total, itemCount };
  }
}