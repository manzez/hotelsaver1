import { Page } from '@playwright/test';

export class SearchPage {
  constructor(private page: Page) {}

  // Locators
  get cityInput() { return this.page.locator('[data-testid="city-input"]'); }
  get checkInDate() { return this.page.locator('[data-testid="checkin-date"]'); }
  get checkOutDate() { return this.page.locator('[data-testid="checkout-date"]'); }
  get adultsCounter() { return this.page.locator('[data-testid="adults-counter"]'); }
  get childrenCounter() { return this.page.locator('[data-testid="children-counter"]'); }
  get roomsCounter() { return this.page.locator('[data-testid="rooms-counter"]'); }
  get budgetSelector() { return this.page.locator('[data-testid="budget-selector"]'); }
  get searchButton() { return this.page.locator('[data-testid="search-button"]'); }
  get guestPickerTrigger() { return this.page.locator('[data-testid="guest-picker-trigger"]'); }
  get incrementAdults() { return this.page.locator('[data-testid="increment-adults"]'); }
  get decrementAdults() { return this.page.locator('[data-testid="decrement-adults"]'); }
  get incrementChildren() { return this.page.locator('[data-testid="increment-children"]'); }
  get decrementChildren() { return this.page.locator('[data-testid="decrement-children"]'); }
  get incrementRooms() { return this.page.locator('[data-testid="increment-rooms"]'); }
  get decrementRooms() { return this.page.locator('[data-testid="decrement-rooms"]'); }

  // Actions
  async selectCity(city: string) {
    await this.cityInput.click();
    await this.cityInput.fill(city);
  }

  async selectDates(checkIn: string, checkOut: string) {
    await this.checkInDate.click();
    await this.page.locator(`[data-date="${checkIn}"]`).click();
    
    await this.checkOutDate.click();
    await this.page.locator(`[data-date="${checkOut}"]`).click();
  }

  async setGuestCounts(adults: number, children: number, rooms: number) {
    await this.guestPickerTrigger.click();
    
    // Set adults
    const currentAdults = await this.adultsCounter.textContent();
    const adultsDiff = adults - parseInt(currentAdults || '2');
    
    if (adultsDiff > 0) {
      for (let i = 0; i < adultsDiff; i++) {
        await this.incrementAdults.click();
      }
    } else if (adultsDiff < 0) {
      for (let i = 0; i < Math.abs(adultsDiff); i++) {
        await this.decrementAdults.click();
      }
    }

    // Set children
    const currentChildren = await this.childrenCounter.textContent();
    const childrenDiff = children - parseInt(currentChildren || '0');
    
    if (childrenDiff > 0) {
      for (let i = 0; i < childrenDiff; i++) {
        await this.incrementChildren.click();
      }
    } else if (childrenDiff < 0) {
      for (let i = 0; i < Math.abs(childrenDiff); i++) {
        await this.decrementChildren.click();
      }
    }

    // Set rooms
    const currentRooms = await this.roomsCounter.textContent();
    const roomsDiff = rooms - parseInt(currentRooms || '1');
    
    if (roomsDiff > 0) {
      for (let i = 0; i < roomsDiff; i++) {
        await this.incrementRooms.click();
      }
    } else if (roomsDiff < 0) {
      for (let i = 0; i < Math.abs(roomsDiff); i++) {
        await this.decrementRooms.click();
      }
    }
  }

  async selectBudget(budget: string) {
    const budgetMap: Record<string, string> = {
      'Under ₦80k': 'u80',
      '₦80k–₦130k': '80_130', 
      '₦130k–₦200k': '130_200',
      '₦200k+': '200p'
    };
    
    const budgetValue = budgetMap[budget] || 'u80';
    await this.page.locator(`[data-value="${budgetValue}"]`).click();
  }

  async performSearch() {
    await this.searchButton.click();
    await this.page.waitForURL('**/search**');
  }

  async waitForResults() {
    await this.page.waitForSelector('[data-testid="hotel-card"]');
  }
}