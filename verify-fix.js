// Quick verification script
const fs = require('fs');
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));
const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));

console.log('=== VERIFICATION OF PERMANENT FIX ===\n');

// Check if the hotel exists and has discount
const testHotelId = 'hotel-presidential-port-harcourt-port-harcourt';
const hotel = hotels.find(h => h.id === testHotelId);
const discount = discounts.overrides[testHotelId];

console.log(`Test Hotel ID: ${testHotelId}`);
console.log(`Hotel exists: ${hotel ? 'YES' : 'NO'}`);
console.log(`Discount configured: ${discount ? `${(discount*100).toFixed(0)}%` : 'NO'}`);

if (hotel && discount) {
  console.log(`✅ SUCCESS: ${hotel.name} now has ${(discount*100).toFixed(0)}% discount`);
  console.log(`   Base price: ₦${hotel.basePriceNGN?.toLocaleString() || 'N/A'}`);
} else {
  console.log(`❌ ISSUE: Hotel or discount not found`);
}

// Quick summary of all cities
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
console.log('\n=== SUMMARY BY CITY ===');
cities.forEach(city => {
  const cityHotels = hotels.filter(h => h.city === city);
  const cityWithDiscounts = cityHotels.filter(h => discounts.overrides[h.id]);
  console.log(`${city}: ${cityWithDiscounts.length}/${cityHotels.length} hotels have negotiate buttons`);
  
  if (cityWithDiscounts.length > 0) {
    console.log(`  Examples: ${cityWithDiscounts.slice(0, 2).map(h => h.name).join(', ')}`);
  }
});