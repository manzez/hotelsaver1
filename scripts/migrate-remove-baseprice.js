#!/usr/bin/env node
/**
 * Migration Script: Remove basePriceNGN from Hotels
 * 
 * This script:
 * 1. Removes hotel-level basePriceNGN field (redundant fallback)
 * 2. Renames room-level basePriceNGN → pricePerNight
 * 3. Ensures all hotels have room types configured
 * 4. Creates backup before modification
 */

const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.join(__dirname, '..', 'lib.hotels.json');
const BACKUP_PATH = path.join(__dirname, '..', `lib.hotels.backup.before-baseprice-removal-${new Date().toISOString().replace(/:/g, '-')}.json`);

console.log('🔄 Starting basePriceNGN removal migration...\n');

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

// Migration statistics
const stats = {
  totalHotels: hotelsData.length,
  hotelsWithBasePriceRemoved: 0,
  hotelsWithRoomTypesRenamed: 0,
  hotelsWithoutRoomTypes: 0,
  hotelsMissingRoomTypes: [],
  roomsRenamed: 0
};

// Process each hotel
hotelsData = hotelsData.map((hotel, index) => {
  const hotelId = hotel.id || `hotel-${index}`;
  
  // Track if hotel-level basePriceNGN exists
  if (hotel.basePriceNGN !== undefined) {
    stats.hotelsWithBasePriceRemoved++;
  }
  
  // Store basePriceNGN for potential room generation
  const hotelBasePrice = hotel.basePriceNGN || hotel.price || 100000;
  
  // Check if hotel has room types
  if (!hotel.roomTypes || !Array.isArray(hotel.roomTypes) || hotel.roomTypes.length === 0) {
    stats.hotelsWithoutRoomTypes++;
    stats.hotelsMissingRoomTypes.push({
      id: hotelId,
      name: hotel.name,
      city: hotel.city
    });
    
    // Generate room types based on hotel's basePriceNGN
    console.log(`⚠️  Generating room types for: ${hotel.name} (${hotelId})`);
    hotel.roomTypes = [
      {
        id: 'standard',
        name: 'Standard Room',
        pricePerNight: 60000,
        discountPercent: 15,
        description: 'Comfortable accommodation with essential amenities',
        amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV'],
        maxOccupancy: 2,
        size: '20 sqm'
      },
      {
        id: 'deluxe',
        name: 'Deluxe Room',
        pricePerNight: 90000,
        discountPercent: 12,
        description: 'Spacious room with premium amenities and city view',
        amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk'],
        maxOccupancy: 2,
        size: '30 sqm'
      },
      {
        id: 'executive',
        name: 'Executive Room',
        pricePerNight: 150000,
        discountPercent: 10,
        description: 'Premium accommodation with executive lounge access',
        amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Executive lounge access', 'Complimentary breakfast'],
        maxOccupancy: 2,
        size: '35 sqm'
      },
      {
        id: 'presidential',
        name: 'Presidential Suite',
        pricePerNight: 210000,
        discountPercent: 8,
        description: 'Luxurious suite with separate living area and premium services',
        amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Separate living area', 'Butler service', 'Premium amenities'],
        maxOccupancy: 4,
        size: '60 sqm'
      }
    ];
  } else {
    // Hotel has room types - rename basePriceNGN to pricePerNight
    stats.hotelsWithRoomTypesRenamed++;
    
    hotel.roomTypes = hotel.roomTypes.map(room => {
      if (room.basePriceNGN !== undefined) {
        stats.roomsRenamed++;
        const { basePriceNGN, ...roomWithoutBasePrice } = room;
        return {
          ...roomWithoutBasePrice,
          pricePerNight: basePriceNGN
        };
      }
      
      // Already has pricePerNight or neither field
      if (!room.pricePerNight && !room.basePriceNGN) {
        // Room has no price - use hotel base price
        return {
          ...room,
          pricePerNight: hotelBasePrice
        };
      }
      
      return room;
    });
  }
  
  // Remove hotel-level basePriceNGN and legacy price field
  const { basePriceNGN, price, ...hotelWithoutBasePrice } = hotel;
  
  return hotelWithoutBasePrice;
});

// Write migrated data
try {
  fs.writeFileSync(HOTELS_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
  console.log(`\n✅ Successfully migrated hotels data`);
} catch (error) {
  console.error('❌ Failed to write migrated data:', error.message);
  console.log('💡 Restore from backup:', BACKUP_PATH);
  process.exit(1);
}

// Print migration report
console.log('\n📊 Migration Report:');
console.log('═══════════════════════════════════════');
console.log(`Total hotels processed: ${stats.totalHotels}`);
console.log(`Hotels with basePriceNGN removed: ${stats.hotelsWithBasePriceRemoved}`);
console.log(`Hotels with room types renamed: ${stats.hotelsWithRoomTypesRenamed}`);
console.log(`Total rooms renamed: ${stats.roomsRenamed}`);
console.log(`Hotels without room types (generated): ${stats.hotelsWithoutRoomTypes}`);

if (stats.hotelsMissingRoomTypes.length > 0) {
  console.log('\n⚠️  Hotels that needed room types generation:');
  stats.hotelsMissingRoomTypes.slice(0, 10).forEach(h => {
    console.log(`   - ${h.name} (${h.city}) [${h.id}]`);
  });
  if (stats.hotelsMissingRoomTypes.length > 10) {
    console.log(`   ... and ${stats.hotelsMissingRoomTypes.length - 10} more`);
  }
}

console.log('\n✅ Migration completed successfully!');
console.log(`📁 Backup saved to: ${path.basename(BACKUP_PATH)}`);
console.log('\n💡 Next steps:');
console.log('   1. Restart your dev server: npm run dev');
console.log('   2. Test search with different price ranges');
console.log('   3. Verify all hotels display correctly');
console.log('   4. Check admin portal room type editing\n');
