// lib/discounts.ts - FIXED WITH PROPER TYPING
import discountsData from './discounts.json';

// Define the type for your discounts data
interface DiscountsData {
  default: number;
  overrides: Record<string, number>;
}

// Type the imported data
const discounts = discountsData as DiscountsData;

// Fallback if anything goes wrong
const DEFAULT_DISCOUNT = 0.15;

export function getDiscountFor(propertyId: string): number {
  try {
    // Check if propertyId is valid
    if (!propertyId || typeof propertyId !== 'string') {
      return 0;
    }

    // Check if this property has a specific override
    if (discounts.overrides && propertyId in discounts.overrides) {
      const override = discounts.overrides[propertyId];
      if (typeof override === 'number' && override >= 0 && override <= 1) {
        return override;
      }
    }
    
    // Use the default from config for properties without specific overrides
    const defaultDiscount = typeof discounts.default === 'number' ? discounts.default : DEFAULT_DISCOUNT;
    return defaultDiscount;
  } catch (error) {
    // If anything goes wrong, return no discount
    console.error('Error in getDiscountFor:', error);
    return 0;
  }
}

export function getPropertiesWithOverrides(): string[] {
  try {
    if (discounts.overrides && typeof discounts.overrides === 'object') {
      return Object.keys(discounts.overrides);
    }
    return [];
  } catch (error) {
    return [];
  }
}

export function hasDiscountOverride(propertyId: string): boolean {
  try {
    return !!(discounts.overrides && propertyId in discounts.overrides);
  } catch (error) {
    return false;
  }
}