// World object for sharing state between steps
export class TestWorld {
  public page: any;
  public context: any;
  public browser: any;
  public testData: Map<string, any> = new Map();
  
  constructor() {
    // Initialize empty world
  }
  
  // Helper methods
  setTestData(key: string, value: any) {
    this.testData.set(key, value);
  }
  
  getTestData(key: string) {
    return this.testData.get(key);
  }
  
  // Price calculation helpers
  calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  calculateRoomsNeeded(adults: number, children: number): number {
    const totalPeople = adults + children;
    // Assuming max 3 people per room (2 adults + 1 child, or 3 adults)
    return Math.ceil(totalPeople / 3);
  }
  
  calculateVAT(amount: number, nights: number): number {
    // VAT only applies to multi-night stays
    if (nights <= 1) return 0;
    return Math.round(amount * 0.075); // 7.5% VAT
  }
  
  calculateDiscount(basePrice: number, discountRate: number = 0.15): number {
    return Math.round(basePrice * discountRate);
  }
  
  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString()}`;
  }
  
  // Test data generators
  generateBookingReference(): string {
    return `BK${Date.now()}`;
  }
  
  generateServiceReference(): string {
    return `SV${Date.now()}`;
  }
  
  generateTaxiReference(): string {
    return `TX${Date.now()}`;
  }
  
  generateFoodReference(): string {
    return `FD${Date.now()}`;
  }
}