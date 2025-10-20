// lib/discount-testing.ts - Testing and management utilities for discount system
import { getDiscountFor, getDiscountInfo, getDiscountStatistics, getPropertiesByTier, DiscountTier } from './discounts';
import { HOTELS } from './data';

// Test individual property discount
export function testPropertyDiscount(propertyId: string, basePrice?: number) {
  const actualBasePrice = basePrice || HOTELS.find(h => h.id === propertyId)?.basePriceNGN || 100000;
  const discountInfo = getDiscountInfo(propertyId, actualBasePrice);
  
  return {
    propertyId,
    basePrice: actualBasePrice,
    discountRate: discountInfo.rate,
    discountedPrice: Math.round(actualBasePrice * (1 - discountInfo.rate)),
    savings: discountInfo.savings,
    tier: discountInfo.tier,
    tierLabel: discountInfo.tierLabel,
    tierEmoji: discountInfo.tierEmoji,
    hasNegotiation: discountInfo.rate > 0
  };
}

// Test multiple properties at once
export function testMultipleProperties(propertyIds: string[]) {
  return propertyIds.map(id => testPropertyDiscount(id));
}

// Get sample properties for each tier
export function getSamplePropertiesByTier() {
  const propertiesByTier = getPropertiesByTier();
  
  return {
    [DiscountTier.NONE]: propertiesByTier[DiscountTier.NONE].slice(0, 3),
    [DiscountTier.GOLD]: propertiesByTier[DiscountTier.GOLD].slice(0, 3),
    [DiscountTier.DIAMOND]: propertiesByTier[DiscountTier.DIAMOND].slice(0, 3),
    [DiscountTier.PLATINUM]: propertiesByTier[DiscountTier.PLATINUM].slice(0, 3)
  };
}

// Generate discount report
export function generateDiscountReport() {
  const stats = getDiscountStatistics();
  const samplesByTier = getSamplePropertiesByTier();
  
  console.log('🏨 DISCOUNT SYSTEM REPORT');
  console.log('=========================');
  console.log(`Total Properties with Discounts: ${stats.total}`);
  console.log(`Average Discount Rate: ${(stats.averageDiscount * 100).toFixed(1)}%`);
  console.log(`Max Discount Rate: ${(stats.maxDiscount * 100).toFixed(1)}%`);
  console.log(`Min Discount Rate: ${(stats.minDiscount * 100).toFixed(1)}%`);
  console.log('');
  
  console.log('📊 TIER DISTRIBUTION:');
  console.log(`🏷️  No Discount: ${stats.byTier[DiscountTier.NONE]} properties`);
  console.log(`🥇 Gold (1-24%): ${stats.byTier[DiscountTier.GOLD]} properties`);
  console.log(`💎 Diamond (25-39%): ${stats.byTier[DiscountTier.DIAMOND]} properties`);
  console.log(`🏆 Platinum (40%+): ${stats.byTier[DiscountTier.PLATINUM]} properties`);
  console.log('');
  
  console.log('🔍 SAMPLE PROPERTIES BY TIER:');
  Object.entries(samplesByTier).forEach(([tier, properties]) => {
    if (properties.length > 0) {
      console.log(`\n${tier.toUpperCase()}:`);
      properties.forEach(propertyId => {
        const test = testPropertyDiscount(propertyId);
        console.log(`  • ${propertyId}: ${(test.discountRate * 100).toFixed(1)}% off (${test.tierEmoji} ${test.tierLabel})`);
      });
    }
  });
  
  return {
    statistics: stats,
    samplesByTier
  };
}

// Validate all discounts in the system
export function validateAllDiscounts() {
  const issues: string[] = [];
  const propertiesWithDiscounts = getPropertiesByTier();
  
  // Check each tier
  Object.entries(propertiesWithDiscounts).forEach(([tier, properties]) => {
    properties.forEach(propertyId => {
      const discount = getDiscountFor(propertyId);
      
      // Validate discount range
      if (discount < 0 || discount > 1) {
        issues.push(`❌ ${propertyId}: Invalid discount rate ${discount} (must be 0-1)`);
      }
      
      // Validate tier assignment
      const expectedTier = tier as DiscountTier;
      const actualTier = getDiscountInfo(propertyId, 100000).tier;
      if (expectedTier !== actualTier) {
        issues.push(`⚠️  ${propertyId}: Tier mismatch. Expected ${expectedTier}, got ${actualTier}`);
      }
      
      // Check if property exists in hotels data
      const hotelExists = HOTELS.find(h => h.id === propertyId);
      if (!hotelExists) {
        issues.push(`🏨 ${propertyId}: Property not found in hotels data`);
      }
    });
  });
  
  if (issues.length === 0) {
    console.log('✅ All discounts validated successfully!');
  } else {
    console.log('❌ Validation Issues Found:');
    issues.forEach(issue => console.log(issue));
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// Quick test specific scenarios
export function quickTests() {
  console.log('🧪 QUICK DISCOUNT TESTS');
  console.log('=======================');
  
  // Test properties that should have no discount (default = 0)
  const noDiscountTests = [
    'non-existent-hotel',
    'random-hotel-id'
  ];
  
  noDiscountTests.forEach(id => {
    const test = testPropertyDiscount(id);
    console.log(`No Discount Test - ${id}: ${test.discountRate * 100}% (${test.hasNegotiation ? 'CAN negotiate' : 'CANNOT negotiate'})`);
  });
  
  // Test known properties with discounts
  const knownDiscountTests = [
    'eko-hotels-and-suites-lagos',
    'radisson-blu-anchorage-lagos', 
    'city-global-hotels-owerri'
  ];
  
  knownDiscountTests.forEach(id => {
    const test = testPropertyDiscount(id);
    console.log(`Known Discount Test - ${id}: ${(test.discountRate * 100).toFixed(1)}% ${test.tierEmoji} ${test.tierLabel}`);
  });
}

// Export utility for CLI usage
export const DiscountTester = {
  test: testPropertyDiscount,
  testMultiple: testMultipleProperties,
  report: generateDiscountReport,
  validate: validateAllDiscounts,
  quickTest: quickTests,
  samples: getSamplePropertiesByTier
};