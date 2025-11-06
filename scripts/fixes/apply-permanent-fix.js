// COMPREHENSIVE PERMANENT FIX: Manual ID mapping for all hotels
const fs = require('fs');

const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));

// Create a lookup map of existing hotels by normalized name
const hotelsByName = new Map();
hotels.forEach(hotel => {
  const normalizedName = hotel.name.toLowerCase()
    .replace(/hotel|suites|resort|&|and/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  hotelsByName.set(normalizedName, hotel);
});

// Manual mapping for complex cases
const manualMappings = {
  // Lagos hotels
  'eko-hotels-and-suites-lagos': 'eko-hotels-suites-lagos-lagos',
  'radisson-blu-anchorage-lagos': 'radisson-blu-anchorage-hotel-lagos',
  'four-points-by-sheraton-vi-lagos': 'four-points-by-sheraton-lagos-lagos',
  'lagos-continental-hotel-lagos': 'lagos-continental-hotel-lagos-lagos',
  'federal-palace-hotel-lagos': 'federal-palace-hotel-logos-lagos',
  'the-george-ikoyi-lagos': 'the-george-hotel-lagos-lagos',
  'the-moorhouse-ikoyi-lagos': 'the-moorhouse-hotel-lagos-lagos',
  'radisson-hotel-ikeja-lagos': 'radisson-hotel-lagos-lagos',
  'eko-signature-lagos': 'eko-signature-hotel-lagos-lagos',
  'the-blowfish-hotel-lagos': 'the-blowfish-hotel-lagos-lagos',
  'victoria-crown-plaza-lagos': 'victoria-crown-plaza-hotel-lagos-lagos',
  'four-seasons-lekki-lagos': 'four-seasons-hotel-lagos-lagos',
  'park-inn-by-radisson-ikeja-lagos': 'park-inn-by-radisson-lagos-lagos',
  'renaissance-gra-ikeja-lagos': 'renaissance-lagos-ikeja-hotel-lagos',
  'de-rembrandt-hotel-lagos': 'de-rembrandt-hotel-lagos-lagos',
  'amber-residence-ikeja-lagos': 'amber-residence-lagos-lagos',
  'bwc-hotel-victoria-island-lagos': 'bwc-hotel-lagos-lagos',
  'maison-fahrenheit-lagos': 'maison-fahrenheit-hotel-lagos-lagos',
  'epe-resort-and-spa-lagos': 'epe-resort-spa-lagos-lagos',
  'lekkside-hotel-lagos': 'lekkside-hotel-lagos-lagos',
  'citilodge-lekki-lagos': 'citilodge-hotel-lagos-lagos',
  'hotel-bon-voyage-lagos': 'bon-voyage-hotel-lagos-lagos',
  'oriental-hotel-lagos-lagos': 'oriental-hotel-lagos-lagos',
  'topaz-hotel-lekki-lagos': 'topaz-hotel-lagos-lagos',
  
  // Abuja hotels
  'summerset-continental-abuja': 'summerset-continental-hotel-abuja-abuja',
  'bolton-white-hotels-abuja': 'bolton-white-hotel-abuja-abuja',
  'hawthorn-suites-abuja': 'hawthorn-suites-by-wyndham-abuja-abuja',
  'the-wells-carlton-abuja': 'wells-carlton-hotel-abuja-abuja',
  'the-envoy-hotel-abuja': 'envoy-hotel-abuja-abuja',
  '3j-s-hotel-abuja': '3js-hotel-abuja-abuja',
  'bon-hotel-abuja-abuja': 'bon-hotel-abuja-abuja',
  'grand-pela-hotel-and-suites-abuja': 'grand-pela-hotel-suites-abuja-abuja',
  'nicon-luxury-abuja-abuja': 'nicon-luxury-hotel-abuja-abuja',
  'reiz-continental-hotel-abuja': 'reiz-continental-hotel-abuja-abuja',
  'pearl-continental-abuja-abuja': 'pearl-continental-hotel-abuja-abuja',
  'statement-hotel-abuja': 'statement-hotel-abuja-abuja',
  'the-purpose-place-abuja': 'purpose-place-hotel-abuja-abuja',
  'sandralia-hotel-abuja': 'sandralia-hotel-abuja-abuja',
  'capital-hub-hotel-abuja': 'capital-hub-hotel-abuja-abuja',
  'ms-marriott-apartments-abuja': 'marriott-executive-apartments-abuja-abuja',
  'valencia-hotels-abuja': 'valencia-hotel-abuja-abuja',
  'venture-royale-hotel-abuja': 'venture-royale-hotel-abuja-abuja',
  'prosperia-hotel-abuja': 'prosperia-hotel-abuja-abuja',
  'residency-hotel-abuja': 'residency-hotel-abuja-abuja',
  'ritman-hotel-abuja-abuja': 'ritman-hotel-abuja-abuja',
  'oxford-hotel-abuja-abuja': 'oxford-hotel-abuja-abuja',
  'maple-hotel-abuja-abuja': 'maple-hotel-abuja-abuja',
  
  // Port Harcourt hotels
  'hotel-presidential-ph-portharcourt': 'hotel-presidential-port-harcourt-port-harcourt',
  'golden-tulip-port-harcourt-portharcourt': 'golden-tulip-port-harcourt-hotel-port-harcourt',
  'novotel-port-harcourt-portharcourt': 'novotel-port-harcourt-hotel-port-harcourt',
  'genesis-hotels-gra-portharcourt': 'genesis-hotel-port-harcourt-port-harcourt',
  'claridon-hotels-portharcourt': 'claridon-hotel-port-harcourt-port-harcourt',
  'de-edge-hotel-ph-portharcourt': 'edge-hotel-port-harcourt-port-harcourt',
  'elkan-terrace-portharcourt': 'elkan-terrace-hotel-port-harcourt-port-harcourt',
  'landmark-hotels-ph-portharcourt': 'landmark-hotel-port-harcourt-port-harcourt',
  'juhel-grand-hotel-portharcourt': 'juhel-grand-hotel-port-harcourt-port-harcourt',
  'emerald-hotels-ph-portharcourt': 'emerald-hotel-port-harcourt-port-harcourt',
  'sparklyn-hotels-portharcourt': 'sparklyn-hotel-port-harcourt-port-harcourt',
  'dannydoo-suites-portharcourt': 'dannydoo-suites-port-harcourt-port-harcourt',
  'oak-heaven-hotels-portharcourt': 'oak-heaven-hotel-port-harcourt-port-harcourt',
  'royale-hotel-ph-portharcourt': 'royale-hotel-port-harcourt-port-harcourt',
  'charrie-s-place-portharcourt': 'charries-place-hotel-port-harcourt-port-harcourt',
  'swiss-spirit-hotel-ph-portharcourt': 'swiss-spirit-hotel-port-harcourt-port-harcourt',
  'ugboma-suites-portharcourt': 'ugboma-suites-hotel-port-harcourt-port-harcourt',
  'silverbird-hotels-ph-portharcourt': 'silverbird-hotel-port-harcourt-port-harcourt',
  'atlantis-suites-gra-portharcourt': 'atlantis-suites-hotel-port-harcourt-port-harcourt',
  'de-confidence-hotel-portharcourt': 'confidence-hotel-port-harcourt-port-harcourt',
  'viontel-hotel-portharcourt': 'viontel-hotel-port-harcourt-port-harcourt',
  'gra-residency-portharcourt': 'gra-residency-hotel-port-harcourt-port-harcourt',
  'golden-tulip-oniru-ph-portharcourt': 'golden-tulip-oniru-hotel-port-harcourt-port-harcourt',
  'golden-nugget-ph-portharcourt': 'golden-nugget-hotel-port-harcourt-port-harcourt',
  'gardenia-hotel-ph-portharcourt': 'gardenia-hotel-port-harcourt-port-harcourt',
  
  // Owerri hotels (additional)
  'protea-select-owerri-owerri': 'protea-select-hotel-owerri-owerri',
  'swiss-international-owerri-owerri': 'swiss-international-hotel-owerri-owerri',
  'protea-plus-owerri-owerri': 'protea-plus-hotel-owerri-owerri',
  'akata-hotel-owerri': 'akata-hotel-owerri-owerri'
};

console.log('=== COMPREHENSIVE PERMANENT FIX ===\n');

// Get all hotel IDs for easy lookup
const hotelIds = new Set(hotels.map(h => h.id));
const newOverrides = {};
let fixedCount = 0;
let removedCount = 0;

// Process all discount entries
Object.entries(discounts.overrides).forEach(([discountId, discountValue]) => {
  if (hotelIds.has(discountId)) {
    // ID already matches - keep as is
    newOverrides[discountId] = discountValue;
  } else if (manualMappings[discountId]) {
    // Use manual mapping
    const correctId = manualMappings[discountId];
    if (hotelIds.has(correctId)) {
      newOverrides[correctId] = discountValue;
      console.log(`✅ FIXED: ${discountId} → ${correctId} (${(discountValue*100).toFixed(0)}%)`);
      fixedCount++;
    } else {
      console.log(`❌ MANUAL MAPPING FAILED: ${correctId} not found in hotels`);
      removedCount++;
    }
  } else {
    console.log(`❌ REMOVED: ${discountId} (no hotel match found)`);
    removedCount++;
  }
});

// Create the new discounts structure
const fixedDiscounts = {
  default: discounts.default,
  overrides: newOverrides
};

// Write the fixed file
fs.writeFileSync('lib/discounts.json', JSON.stringify(fixedDiscounts, null, 2));

console.log(`\n💾 APPLIED PERMANENT FIX to lib/discounts.json`);
console.log(`\n📊 SUMMARY:`);
console.log(`- Fixed mappings: ${fixedCount}`);
console.log(`- Removed unmatchable: ${removedCount}`);
console.log(`- Total working discounts: ${Object.keys(newOverrides).length}`);

// Verify by city
const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
cities.forEach(city => {
  const cityHotels = hotels.filter(h => h.city === city);
  const cityWithDiscounts = cityHotels.filter(h => newOverrides[h.id]);
  console.log(`- ${city}: ${cityWithDiscounts.length}/${cityHotels.length} hotels now have negotiate buttons`);
});