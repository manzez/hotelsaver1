// lib/discounts.ts - Tier-based discount system with testing capabilities

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

// Fallback if anything goes wrong - 15% default discount
const DEFAULT_DISCOUNT = 0.15;

// Note: Async server-side functions moved to discounts-server.ts to avoid client-side fs imports

// Async version moved to discounts-server.ts

// Synchronous version for backward compatibility (falls back to static import if needed)
export function getDiscountForSync(propertyId: string): number {
  try {
    // For compatibility with components that need synchronous access
    // Fall back to reading static discounts.json for immediate usage
    const discountsData = require('./discounts.json') as DiscountsData;
    
    if (!propertyId || typeof propertyId !== 'string') {
      return 0;
    }

    // Check if this property has a specific override
    if (discountsData.overrides && propertyId in discountsData.overrides) {
      const override = discountsData.overrides[propertyId];
      if (typeof override === 'number' && override >= 0 && override <= 1) {
        return override;
      }
    }
    
    // Use the default from config
    const defaultDiscount = typeof discountsData.default === 'number' ? discountsData.default : DEFAULT_DISCOUNT;
    return defaultDiscount;
  } catch (error) {
    console.error('Error in getDiscountForSync:', error);
    return DEFAULT_DISCOUNT;
  }
}

// Export the sync version as the main function for backward compatibility
// The async version is available as getDiscountForAsync
export { getDiscountForSync as getDiscountFor }

export function getDiscountTier(discountRate: number): DiscountTier {
  if (discountRate === 0) return DiscountTier.NONE;
  if (discountRate < 0.25) return DiscountTier.GOLD;     // 1-24%
  if (discountRate < 0.40) return DiscountTier.DIAMOND;  // 25-39%
  return DiscountTier.PLATINUM;                          // 40%+
}

export function getDiscountInfo(propertyId: string, basePrice: number): DiscountInfo {
  const rate = getDiscountForSync(propertyId);
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
    const discountsData = require('./discounts.json') as DiscountsData;
    if (discountsData.overrides && typeof discountsData.overrides === 'object') {
      return Object.keys(discountsData.overrides);
    }
    return [];
  } catch (error) {
    return [];
  }
}

export function hasDiscountOverride(propertyId: string): boolean {
  try {
    const discountsData = require('./discounts.json') as DiscountsData;
    return !!(discountsData.overrides && propertyId in discountsData.overrides);
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
    const discountsData = require('./discounts.json') as DiscountsData;
    if (discountsData.overrides) {
      Object.entries(discountsData.overrides).forEach(([propertyId, rate]) => {
        const tier = getDiscountTier(rate as number);
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
  const rates = properties.map(id => getDiscountForSync(id)).filter(rate => rate > 0);
  
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