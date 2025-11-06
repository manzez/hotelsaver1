const fs = require('fs');
const path = require('path');

// New standardized prices based on user request
const NEW_STANDARD_PRICES = {
  'standard': 60000,      // Under ₦80k
  'deluxe': 90000,        // ₦80k-₦130k
  'executive': 140000,    // ₦130k-₦200k
  'suite': 180000,        // ₦130k-₦200k (higher tier)
  'presidential': 300000  // ₦200k+
};

function getRoomPrice(roomName, roomId) {
  const nameLower = (roomName || '').toLowerCase();
  const idLower = (roomId || '').toLowerCase();
  
  // Presidential Suite
  if (nameLower.includes('presidential') || idLower.includes('presidential')) {
    return NEW_STANDARD_PRICES.presidential;
  }
  
  // Suite (but not presidential)
  if ((nameLower.includes('suite') || idLower.includes('suite')) && 
      !nameLower.includes('presidential')) {
    return NEW_STANDARD_PRICES.suite;
  }
  
  // Executive Room
  if (nameLower.includes('executive') || idLower.includes('executive')) {
    return NEW_STANDARD_PRICES.executive;
  }
  
  // Deluxe Room
  if (nameLower.includes('deluxe') || idLower.includes('deluxe')) {
    return NEW_STANDARD_PRICES.deluxe;
  }
  
  // Standard Room (default)
  if (nameLower.includes('standard') || idLower.includes('standard')) {
    return NEW_STANDARD_PRICES.standard;
  }
  
  // Default fallback: Standard price
  return NEW_STANDARD_PRICES.standard;
}

function updateRoomPrices() {
  const hotelsPath = path.join(__dirname, '..', 'lib.hotels.json');
  
  // Create backup
  const backupPath = path.join(
    __dirname, 
    '..',
    `lib.hotels.backup.price-update-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  console.log('📦 Creating backup...');
  const hotelsData = fs.readFileSync(hotelsPath, 'utf-8');
  fs.writeFileSync(backupPath, hotelsData, 'utf-8');
  console.log(`✅ Backup created: ${path.basename(backupPath)}`);
  
  // Parse hotels
  const hotels = JSON.parse(hotelsData);
  console.log(`\n🏨 Processing ${hotels.length} hotels...`);
  
  let hotelsUpdated = 0;
  let roomsUpdated = 0;
  
  hotels.forEach(hotel => {
    let hotelModified = false;
    
    // Remove any remaining basePriceNGN at hotel level
    if (hotel.basePriceNGN !== undefined) {
      delete hotel.basePriceNGN;
      hotelModified = true;
    }
    
    // Update room prices
    if (hotel.roomTypes && Array.isArray(hotel.roomTypes)) {
      hotel.roomTypes.forEach(room => {
        // Remove basePriceNGN if it exists
        if (room.basePriceNGN !== undefined) {
          delete room.basePriceNGN;
        }
        
        // Calculate new price based on room type
        const newPrice = getRoomPrice(room.name, room.id);
        
        // Only update if price changed
        if (room.pricePerNight !== newPrice) {
          room.pricePerNight = newPrice;
          roomsUpdated++;
          hotelModified = true;
        }
      });
    }
    
    if (hotelModified) {
      hotelsUpdated++;
    }
  });
  
  // Write updated data
  fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2), 'utf-8');
  
  console.log(`\n✅ Update complete!`);
  console.log(`   Hotels updated: ${hotelsUpdated}`);
  console.log(`   Rooms updated: ${roomsUpdated}`);
  console.log(`\n💰 New Price Structure:`);
  console.log(`   Standard: ₦${NEW_STANDARD_PRICES.standard.toLocaleString()}`);
  console.log(`   Deluxe: ₦${NEW_STANDARD_PRICES.deluxe.toLocaleString()}`);
  console.log(`   Executive: ₦${NEW_STANDARD_PRICES.executive.toLocaleString()}`);
  console.log(`   Suite: ₦${NEW_STANDARD_PRICES.suite.toLocaleString()}`);
  console.log(`   Presidential: ₦${NEW_STANDARD_PRICES.presidential.toLocaleString()}`);
  console.log(`\n📊 Budget Range Mapping:`);
  console.log(`   Under ₦80k → Standard (₦60k)`);
  console.log(`   ₦80k-₦130k → Deluxe (₦90k)`);
  console.log(`   ₦130k-₦200k → Executive (₦140k) & Suite (₦180k)`);
  console.log(`   ₦200k+ → Presidential (₦300k)`);
}

// Run the update
updateRoomPrices();
