// lib/discounts.ts - Tier-based discount system with testing capabilities
import discountsData from './discounts.json';

// Define the type for your discounts data
interface DiscountsData {
  default: number;
  overrides: Record<string, number>;
}

// Discount tier system
export enum DiscountTier {
  NONE = 'none',
  GOLD = 'gold',      // 1-24% discount
  DIAMOND = 'diamond', // 25-39% discount
  PLATINUM = 'platinum' // 40%+ discount
}

export interface DiscountInfo {
  rate: number;
  tier: DiscountTier;
  savings: number;
  tierLabel: string;
  tierEmoji: string;
  tierColor: string;
}

// Type the imported data
const discounts = discountsData as DiscountsData;

// Fallback if anything goes wrong - 15% default discount
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
    
    // Use the default from config (now 0 instead of 0.15)
    const defaultDiscount = typeof discounts.default === 'number' ? discounts.default : DEFAULT_DISCOUNT;
    return defaultDiscount;
  } catch (error) {
    // If anything goes wrong, return no discount
    console.error('Error in getDiscountFor:', error);
    return 0;
  }
}

export function getDiscountTier(discountRate: number): DiscountTier {
  if (discountRate === 0) return DiscountTier.NONE;
  if (discountRate < 0.25) return DiscountTier.GOLD;     // 1-24%
  if (discountRate < 0.40) return DiscountTier.DIAMOND;  // 25-39%
  return DiscountTier.PLATINUM;                          // 40%+
}

export function getDiscountInfo(propertyId: string, basePrice: number): DiscountInfo {
  const rate = getDiscountFor(propertyId);
  const tier = getDiscountTier(rate);
  const savings = Math.round(basePrice * rate);
  
  const tierInfo = {
    [DiscountTier.NONE]: {
      tierLabel: 'No Discount',
      tierEmoji: '🏷️',
      tierColor: 'gray'
    },
    [DiscountTier.GOLD]: {
      tierLabel: 'Gold Discount',
      tierEmoji: '🥇',
      tierColor: 'yellow'
    },
    [DiscountTier.DIAMOND]: {
      tierLabel: 'Diamond Discount',
      tierEmoji: '💎',
      tierColor: 'blue'
    },
    [DiscountTier.PLATINUM]: {
      tierLabel: 'Platinum Discount',
      tierEmoji: '🏆',
      tierColor: 'purple'
    }
  };

  return {
    rate,
    tier,
    savings,
    ...tierInfo[tier]
  };
}

// Testing and verification utilities
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

export function getPropertiesByTier(): Record<DiscountTier, string[]> {
  const result: Record<DiscountTier, string[]> = {
    [DiscountTier.NONE]: [],
    [DiscountTier.GOLD]: [],
    [DiscountTier.DIAMOND]: [],
    [DiscountTier.PLATINUM]: []
  };

  try {
    if (discounts.overrides) {
      Object.entries(discounts.overrides).forEach(([propertyId, rate]) => {
        const tier = getDiscountTier(rate);
        result[tier].push(propertyId);
      });
    }
  } catch (error) {
    console.error('Error in getPropertiesByTier:', error);
  }

  return result;
}

export function validateDiscountRate(rate: number): boolean {
  return typeof rate === 'number' && rate >= 0 && rate <= 1;
}

export function getDiscountStatistics(): {
  total: number;
  byTier: Record<DiscountTier, number>;
  averageDiscount: number;
  maxDiscount: number;
  minDiscount: number;
} {
  const properties = getPropertiesWithOverrides();
  const rates = properties.map(id => getDiscountFor(id)).filter(rate => rate > 0);
  
  const byTier = getPropertiesByTier();
  const tierCounts: Record<DiscountTier, number> = {
    [DiscountTier.NONE]: byTier[DiscountTier.NONE].length,
    [DiscountTier.GOLD]: byTier[DiscountTier.GOLD].length,
    [DiscountTier.DIAMOND]: byTier[DiscountTier.DIAMOND].length,
    [DiscountTier.PLATINUM]: byTier[DiscountTier.PLATINUM].length
  };

  return {
    total: properties.length,
    byTier: tierCounts,
    averageDiscount: rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0,
    maxDiscount: rates.length > 0 ? Math.max(...rates) : 0,
    minDiscount: rates.length > 0 ? Math.min(...rates) : 0
  };
}