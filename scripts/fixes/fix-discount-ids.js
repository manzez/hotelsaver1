// PERMANENT FIX: Synchronize hotel and discount IDs
const fs = require('fs');

const hotels = JSON.parse(fs.readFileSync('lib.hotels.json', 'utf8'));
const discounts = JSON.parse(fs.readFileSync('lib/discounts.json', 'utf8'));

console.log('=== GENERATING PERMANENT FIX ===\n');

// Create mapping of discount IDs to hotel IDs by fuzzy matching
const hotelIds = new Set(hotels.map(h => h.id));
const discountIds = Object.keys(discounts.overrides);

const fixes = [];
let fixedCount = 0;

discountIds.forEach(discountId => {
  if (!hotelIds.has(discountId)) {
    // Try to find matching hotel by name similarity
    const matchingHotel = hotels.find(hotel => {
      // Remove common suffixes and normalize
      const normalizeId = (id) => id
        .replace(/-port-harcourt$/, '')
        .replace(/-portharcourt$/, '')
        .replace(/-lagos$/, '')
        .replace(/-abuja$/, '')
        .replace(/-owerri$/, '')
        .replace(/-ph$/, '');
      
      const normalizedDiscount = normalizeId(discountId);
      const normalizedHotel = normalizeId(hotel.id);
      
      return normalizedDiscount === normalizedHotel;
    });
    
    if (matchingHotel) {
      fixes.push({
        oldId: discountId,
        newId: matchingHotel.id,
        hotelName: matchingHotel.name,
        discount: discounts.overrides[discountId]
      });
      fixedCount++;
    } else {
      console.log(`❌ No match found for discount ID: ${discountId}`);
    }
  }
});

console.log(`✅ Found fixes for ${fixedCount} mismatched IDs\n`);

// Generate new discounts.json with fixed IDs
const newOverrides = { ...discounts.overrides };

fixes.forEach(fix => {
  delete newOverrides[fix.oldId];
  newOverrides[fix.newId] = fix.discount;
  console.log(`🔄 ${fix.oldId} → ${fix.newId} (${(fix.discount*100).toFixed(0)}% off ${fix.hotelName})`);
});

const fixedDiscounts = {
  default: discounts.default,
  overrides: newOverrides
};

// Write the fixed discounts file
fs.writeFileSync('lib/discounts-fixed.json', JSON.stringify(fixedDiscounts, null, 2));
console.log(`\n💾 Generated fixed discounts file: lib/discounts-fixed.json`);

// Verify the fix
const verifyHotels = hotels.filter(h => h.city === 'Port Harcourt');
const verifyDiscounts = verifyHotels.filter(h => fixedDiscounts.overrides[h.id]);
console.log(`\n✅ VERIFICATION: Port Harcourt now has ${verifyDiscounts.length} hotels with negotiate buttons`);

// Show statistics
const totalFixed = Object.keys(fixedDiscounts.overrides).length;
const totalPhantoms = discountIds.length - fixedCount;
console.log(`\n📊 FINAL STATS:`);
console.log(`- Total working discounts: ${totalFixed}`);
console.log(`- Fixed mismatches: ${fixedCount}`);
console.log(`- Remaining phantoms: ${totalPhantoms}`);