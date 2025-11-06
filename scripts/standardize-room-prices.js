#!/usr/bin/env node
/**
 * Standardize Room Prices Script
 * 
 * Updates ALL hotels to use standard pricing:
 * - Standard Room: ₦60,000
 * - Deluxe Room: ₦90,000
 * - Executive Room: ₦150,000
 * - Presidential Suite: ₦210,000
 */

const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.join(__dirname, '..', 'lib.hotels.json');
const BACKUP_PATH = path.join(__dirname, '..', `lib.hotels.backup.price-standardization-${new Date().toISOString().replace(/:/g, '-')}.json`);

// Standard prices for all hotels
const STANDARD_PRICES = {
  'standard': 60000,
  'deluxe': 90000,
  'executive': 150000,
  'presidential': 210000
};

console.log('🔄 Starting room price standardization...\n');

// Read hotels data
let hotelsData;
try {
  const rawData = fs.readFileSync(HOTELS_PATH, 'utf8');
  hotelsData = JSON.parse(rawData);
  console.log(`✅ Loaded ${hotelsData.length} hotels from lib.hotels.json`);
} catch (error) {
  console.error('❌ Failed to read hotels file:', error.message);
  process.exit(1);
}

// Create backup
try {
  fs.writeFileSync(BACKUP_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
  console.log(`✅ Created backup at: ${path.basename(BACKUP_PATH)}\n`);
} catch (error) {
  console.error('❌ Failed to create backup:', error.message);
  process.exit(1);
}

// Statistics
const stats = {
  totalHotels: hotelsData.length,
  hotelsUpdated: 0,
  roomsUpdated: 0,
  hotelsWithBasePriceRemoved: 0
};

// Process each hotel
hotelsData = hotelsData.map((hotel, index) => {
  const hotelId = hotel.id || `hotel-${index}`;
  let hotelModified = false;
  
  // Remove basePriceNGN if it exists
  if (hotel.basePriceNGN !== undefined) {
    stats.hotelsWithBasePriceRemoved++;
    delete hotel.basePriceNGN;
    hotelModified = true;
  }
  
  // Update room types to standard prices
  if (hotel.roomTypes && Array.isArray(hotel.roomTypes)) {
    hotel.roomTypes = hotel.roomTypes.map(room => {
      const roomId = room.id?.toLowerCase();
      let standardPrice = null;
      
      // Match room type to standard price
      if (roomId === 'standard' || room.name?.toLowerCase().includes('standard')) {
        standardPrice = STANDARD_PRICES.standard;
      } else if (roomId === 'deluxe' || room.name?.toLowerCase().includes('deluxe')) {
        standardPrice = STANDARD_PRICES.deluxe;
      } else if (roomId === 'executive' || room.name?.toLowerCase().includes('executive')) {
        standardPrice = STANDARD_PRICES.executive;
      } else if (roomId === 'presidential' || room.name?.toLowerCase().includes('presidential')) {
        standardPrice = STANDARD_PRICES.presidential;
      }
      
      if (standardPrice) {
        const oldPrice = room.pricePerNight || room.basePriceNGN;
        if (oldPrice !== standardPrice) {
          stats.roomsUpdated++;
          hotelModified = true;
        }
        
        // Remove basePriceNGN and set pricePerNight
        const { basePriceNGN, ...roomWithoutBasePrice } = room;
        return {
          ...roomWithoutBasePrice,
          pricePerNight: standardPrice
        };
      }
      
      // Room type not recognized, keep existing price
      const { basePriceNGN, ...roomWithoutBasePrice } = room;
      return {
        ...roomWithoutBasePrice,
        pricePerNight: room.pricePerNight || room.basePriceNGN || 60000
      };
    });
  }
  
  if (hotelModified) {
    stats.hotelsUpdated++;
  }
  
  return hotel;
});

// Write updated data
try {
  fs.writeFileSync(HOTELS_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
  console.log(`✅ Successfully updated hotels data`);
} catch (error) {
  console.error('❌ Failed to write updated data:', error.message);
  console.log('💡 Restore from backup:', BACKUP_PATH);
  process.exit(1);
}

// Print report
console.log('\n📊 Standardization Report:');
console.log('═══════════════════════════════════════');
console.log(`Total hotels processed: ${stats.totalHotels}`);
console.log(`Hotels updated: ${stats.hotelsUpdated}`);
console.log(`Rooms updated: ${stats.roomsUpdated}`);
console.log(`Hotels with basePriceNGN removed: ${stats.hotelsWithBasePriceRemoved}`);
console.log('\n💰 Standard Prices Applied:');
console.log(`   Standard Room: ₦${STANDARD_PRICES.standard.toLocaleString()}`);
console.log(`   Deluxe Room: ₦${STANDARD_PRICES.deluxe.toLocaleString()}`);
console.log(`   Executive Room: ₦${STANDARD_PRICES.executive.toLocaleString()}`);
console.log(`   Presidential Suite: ₦${STANDARD_PRICES.presidential.toLocaleString()}`);
console.log('\n✅ Price standardization completed!');
console.log(`📁 Backup saved to: ${path.basename(BACKUP_PATH)}\n`);
