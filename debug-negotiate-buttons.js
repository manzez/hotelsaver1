// Debug script to test negotiate functionality systematically
const fs = require('fs');

// Load the same data as the app
const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));

// Replicate the discount function from lib/discounts.ts
function getDiscountFor(propertyId) {
  try {
    if (!propertyId || typeof propertyId !== 'string') {
      return 0;
    }

    if (discounts.overrides && propertyId in discounts.overrides) {
      const override = discounts.overrides[propertyId];
      if (typeof override === 'number' && override >= 0 && override <= 1) {
        return override;
      }
    }
    
    const defaultDiscount = typeof discounts.default === 'number' ? discounts.default : 0;
    return defaultDiscount;
  } catch (error) {
    console.error('Error in getDiscountFor:', error);
    return 0;
  }
}

console.log('=== NEGOTIATE BUTTON DEBUG ===\n');

// Test specific problematic hotels
const testHotels = [
  'transcorp-hilton-abuja-abuja',
  'hotel-presidential-port-harcourt-port-harcourt',
  'eko-hotels-suites-lagos-lagos',
  'protea-hotel-owerri-owerri'
];

testHotels.forEach(hotelId => {
  console.log(`\n🏨 Testing: ${hotelId}`);
  
  // Check if hotel exists
  const hotel = hotels.find(h => h.id === hotelId);
  console.log(`  Hotel exists: ${hotel ? '✅ YES' : '❌ NO'}`);
  
  if (hotel) {
    console.log(`  Hotel name: ${hotel.name}`);
    console.log(`  City: ${hotel.city}`);
    console.log(`  Base price: ₦${hotel.basePriceNGN?.toLocaleString() || 'N/A'}`);
    
    // Check discount
    const discount = getDiscountFor(hotelId);
    console.log(`  Discount configured: ${discount > 0 ? '✅' : '❌'} ${(discount * 100).toFixed(0)}%`);
    
    // Check if should show negotiate button
    const shouldShowButton = discount > 0;
    console.log(`  Should show negotiate button: ${shouldShowButton ? '✅ YES' : '❌ NO'}`);
    
    // Simulate API logic
    const basePrice = hotel.basePriceNGN || hotel.price || 0;
    if (basePrice <= 0) {
      console.log(`  ❌ API would fail: No base price (${basePrice})`);
    } else if (discount <= 0) {
      console.log(`  ❌ API would fail: No discount (${discount})`);
    } else {
      const discountedPrice = Math.round(basePrice * (1 - discount));
      console.log(`  ✅ API would succeed: ₦${basePrice.toLocaleString()} → ₦${discountedPrice.toLocaleString()}`);
    }
  }
});

// Check for common patterns in failing hotels
console.log('\n=== ANALYSIS ===');

const hotelsWithDiscounts = hotels.filter(h => getDiscountFor(h.id) > 0);
const hotelsWithoutPrices = hotelsWithDiscounts.filter(h => (h.basePriceNGN || h.price || 0) <= 0);

console.log(`Hotels with negotiate buttons: ${hotelsWithDiscounts.length}`);
console.log(`Hotels with buttons but no prices: ${hotelsWithoutPrices.length}`);

if (hotelsWithoutPrices.length > 0) {
  console.log('\n❌ PROBLEM HOTELS (will show button but fail API):');
  hotelsWithoutPrices.slice(0, 5).forEach(h => {
    console.log(`  - ${h.name} (${h.id}): Price = ${h.basePriceNGN || h.price || 'undefined'}`);
  });
}

// Check for missing discount entries
const discountIds = new Set(Object.keys(discounts.overrides));
const hotelIds = new Set(hotels.map(h => h.id));

const phantomDiscounts = [...discountIds].filter(id => !hotelIds.has(id));
console.log(`\nPhantom discounts (no matching hotel): ${phantomDiscounts.length}`);

if (phantomDiscounts.length > 0) {
  console.log('Examples:');
  phantomDiscounts.slice(0, 3).forEach(id => console.log(`  - ${id}`));
}