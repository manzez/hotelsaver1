// scripts/add-room-types.js - Script to add room types to all hotels
const fs = require('fs');
const path = require('path');

// Standard room type templates
const STANDARD_ROOM_TYPES = [
  {
    id: 'standard',
    name: 'Standard Room',
    description: 'Comfortable accommodation with essential amenities',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV'],
    maxOccupancy: 2,
    size: '20 sqm',
    discountPercent: 15 // Default 15% discount
  },
  {
    id: 'deluxe', 
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities and city view',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk'],
    maxOccupancy: 2,
    size: '30 sqm',
    discountPercent: 12 // Default 12% discount
  },
  {
    id: 'executive',
    name: 'Executive Room', 
    description: 'Premium accommodation with executive lounge access',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Executive lounge access', 'Complimentary breakfast'],
    maxOccupancy: 2,
    size: '35 sqm',
    discountPercent: 10 // Default 10% discount
  },
  {
    id: 'presidential',
    name: 'Presidential Suite',
    description: 'Luxurious suite with separate living area and premium services',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Separate living area', 'Butler service', 'Premium amenities'],
    maxOccupancy: 4,
    size: '60 sqm',
    discountPercent: 8 // Default 8% discount
  }
];

function generateRoomTypesForHotel(basePrice) {
  return STANDARD_ROOM_TYPES.map(template => ({
    ...template,
    basePriceNGN: Math.round(basePrice * getRoomTypeMultiplier(template.id))
  }));
}

function getRoomTypeMultiplier(roomTypeId) {
  switch(roomTypeId) {
    case 'standard': return 1.0;      // Base price
    case 'deluxe': return 1.3;        // 30% more
    case 'executive': return 1.6;     // 60% more  
    case 'presidential': return 2.5;  // 150% more
    default: return 1.0;
  }
}

function addRoomTypesToHotels() {
  try {
    console.log('Reading hotels data...');
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const hotelsData = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
    
    console.log(`Processing ${hotelsData.length} hotels...`);
    
    let updatedCount = 0;
    
    const updatedHotels = hotelsData.map((hotel, index) => {
      // Only add room types if they don't already exist
      if (!hotel.roomTypes) {
        const basePrice = hotel.basePriceNGN || hotel.price || 50000; // Default to ₦50k if no price
        hotel.roomTypes = generateRoomTypesForHotel(basePrice);
        updatedCount++;
        
        if (index < 5) {
          console.log(`Sample hotel: ${hotel.name} - Base: ₦${basePrice.toLocaleString()}`);
          hotel.roomTypes.forEach(room => {
            console.log(`  ${room.name}: ₦${room.basePriceNGN.toLocaleString()} (${room.discountPercent}% discount)`);
          });
        }
      }
      return hotel;
    });
    
    // Create backup before modifying
    const backupPath = path.join(process.cwd(), `lib.hotels.backup.${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(hotelsData, null, 2));
    console.log(`Backup created: ${backupPath}`);
    
    // Write updated data
    fs.writeFileSync(hotelsPath, JSON.stringify(updatedHotels, null, 2));
    
    console.log(`✅ Successfully updated ${updatedCount} hotels with room types`);
    console.log(`📁 Updated file: ${hotelsPath}`);
    
  } catch (error) {
    console.error('❌ Error updating hotels:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  addRoomTypesToHotels();
}

module.exports = { addRoomTypesToHotels, generateRoomTypesForHotel };