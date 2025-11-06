// Debug ID mismatches between hotels and discounts
const fs = require('fs');

const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));

const discountIds = new Set(Object.keys(discounts.overrides));
const hotelIds = new Set(hotels.map(h => h.id));

console.log('=== ID MISMATCH ANALYSIS ===\n');

// Find discounts for non-existent hotels
const phantomDiscounts = [...discountIds].filter(id => !hotelIds.has(id));
console.log(`🚨 PHANTOM DISCOUNTS (${phantomDiscounts.length}): Discounts for hotels that don't exist:`);
phantomDiscounts.slice(0, 10).forEach(id => console.log(`- ${id}`));

// Find hotels that should have discounts but don't
const portHarcourtHotels = hotels.filter(h => h.city === 'Port Harcourt');
const portHarcourtWithDiscounts = portHarcourtHotels.filter(h => discountIds.has(h.id));

console.log(`\n📍 PORT HARCOURT ANALYSIS:`);
console.log(`- Total PH hotels: ${portHarcourtHotels.length}`);
console.log(`- PH hotels with discounts: ${portHarcourtWithDiscounts.length}`);

if (portHarcourtWithDiscounts.length === 0) {
  console.log('\n🔍 Port Harcourt hotel IDs in hotels.json:');
  portHarcourtHotels.slice(0, 10).forEach(h => console.log(`- ${h.id} (${h.name})`));
  
  console.log('\n🔍 Port Harcourt discount IDs in discounts.json:');
  [...discountIds].filter(id => id.includes('portharcourt')).slice(0, 10).forEach(id => console.log(`- ${id}`));
}

// Check for similar ID patterns
console.log('\n=== ID PATTERN ANALYSIS ===');
const phHotelsPattern = portHarcourtHotels.map(h => h.id).slice(0, 5);
const phDiscountsPattern = [...discountIds].filter(id => id.includes('portharcourt')).slice(0, 5);

console.log('Hotel IDs pattern:', phHotelsPattern);
console.log('Discount IDs pattern:', phDiscountsPattern);