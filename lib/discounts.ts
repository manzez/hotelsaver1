// lib/discounts.ts
// Default 15% for every property, with optional per-property overrides.
// Put overrides in lib/discounts.json as { "<id>": 0.20, ... }

import overridesRaw from './discounts.json';

type DiscountOverrides = Record<string, number>;
const OVERRIDES = (overridesRaw ?? {}) as DiscountOverrides;

// 15% site-wide default
export const DEFAULT_DISCOUNT = 0.15;

/**
 * Returns a discount rate between 0 and 1 (0% to 100%).
 * @param propertyId - The unique identifier for the property
 * @returns Discount rate where 0 = no discount, 0.15 = 15% discount
 */
export function getDiscountFor(propertyId: string): number {
  // Check if propertyId is valid
  if (!propertyId || typeof propertyId !== 'string') {
    return DEFAULT_DISCOUNT;
  }

  if (propertyId in OVERRIDES) {
    const override = OVERRIDES[propertyId];
    // Ensure the override is a valid number between 0 and 1
    return typeof override === 'number' && override >= 0 && override <= 1 
      ? override 
      : DEFAULT_DISCOUNT;
  }
  
  return DEFAULT_DISCOUNT;
}

/**
 * Get all property IDs that have discount overrides
 */
export function getPropertiesWithOverrides(): string[] {
  return Object.keys(OVERRIDES);
}

/**
 * Check if a property has a custom discount override
 */
export function hasDiscountOverride(propertyId: string): boolean {
  return propertyId in OVERRIDES;
}