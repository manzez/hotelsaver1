// Debug script to identify negotiate button vs API mismatches
const fs = require('fs');

// Load data
const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));

console.log('=== NEGOTIATE DEBUG ANALYSIS ===\n');

// Get discount function (same logic as frontend)
function getDiscountFor(propertyId) {
  if (!propertyId || typeof propertyId !== 'string') {
    return 0;
  }
  
  if (discounts.overrides && propertyId in discounts.overrides) {
    const override = discounts.overrides[propertyId];
    if (typeof override === 'number' && override >= 0 && override <= 1) {
      return override;
    }
  }
  
  return discounts.default || 0;
}

// Analyze hotels
const hotelAnalysis = hotels.map(hotel => ({
  id: hotel.id,
  name: hotel.name,
  city: hotel.city,
  basePrice: hotel.basePriceNGN || hotel.price || 0,
  discount: getDiscountFor(hotel.id),
  canNegotiate: getDiscountFor(hotel.id) > 0,
  hasValidPrice: (hotel.basePriceNGN || hotel.price || 0) > 0
}));

// Summary stats
const totalHotels = hotelAnalysis.length;
const hotelsWithNegotiate = hotelAnalysis.filter(h => h.canNegotiate).length;
const hotelsWithoutPrice = hotelAnalysis.filter(h => !h.hasValidPrice).length;
const problemHotels = hotelAnalysis.filter(h => h.canNegotiate && !h.hasValidPrice);

console.log(`Total hotels: ${totalHotels}`);
console.log(`Hotels with negotiate buttons: ${hotelsWithNegotiate}`);
console.log(`Hotels without valid prices: ${hotelsWithoutPrice}`);
console.log(`PROBLEM: Hotels with negotiate but no price: ${problemHotels.length}\n`);

if (problemHotels.length > 0) {
  console.log('🚨 PROBLEM HOTELS (show negotiate button but will fail):');
  problemHotels.slice(0, 10).forEach(hotel => {
    console.log(`- ${hotel.name} (${hotel.id}) - Discount: ${(hotel.discount*100).toFixed(0)}%, Price: ${hotel.basePrice}`);
  });
  console.log('');
}

// Show sample working hotels
const workingHotels = hotelAnalysis.filter(h => h.canNegotiate && h.hasValidPrice).slice(0, 5);
console.log('✅ WORKING HOTELS (should negotiate successfully):');
workingHotels.forEach(hotel => {
  console.log(`- ${hotel.name} (${hotel.id}) - ${(hotel.discount*100).toFixed(0)}% off ₦${hotel.basePrice.toLocaleString()}`);
});

console.log('\n=== CITY BREAKDOWN ===');
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
cities.forEach(city => {
  const cityHotels = hotelAnalysis.filter(h => h.city === city);
  const cityNegotiate = cityHotels.filter(h => h.canNegotiate);
  const cityProblems = cityHotels.filter(h => h.canNegotiate && !h.hasValidPrice);
  
  console.log(`${city}: ${cityHotels.length} hotels, ${cityNegotiate.length} with negotiate, ${cityProblems.length} problems`);
});