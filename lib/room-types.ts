// lib/room-types.ts - Room types data structure and Places API integration

export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxOccupancy: number;
  amenities: string[];
  size?: string; // e.g., "25 sqm"
  bedType: 'single' | 'double' | 'twin' | 'king' | 'queen' | 'suite';
  images: string[];
  available: boolean;
}

export interface HotelRoomData {
  hotelId: string;
  lastUpdated: string;
  roomTypes: RoomType[];
  amenities: string[]; // Hotel-wide amenities from Places API
}

// Standard Nigerian hotel room types based on local market
export const DEFAULT_ROOM_TYPES: Omit<RoomType, 'id' | 'pricePerNight'>[] = [
  {
    name: "Standard Room",
    description: "Comfortable room with essential amenities",
    maxOccupancy: 2,
    amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV"],
    bedType: "double",
    images: [],
    available: true
  },
  {
    name: "Deluxe Room", 
    description: "Spacious room with premium amenities and city view",
    maxOccupancy: 3,
    amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV", "Mini Bar", "Room Service"],
    size: "30 sqm",
    bedType: "king",
    images: [],
    available: true
  },
  {
    name: "Executive Suite",
    description: "Luxury suite with separate living area and premium services",
    maxOccupancy: 4,
    amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV", "Mini Bar", "Room Service", "Living Area", "Work Desk"],
    size: "45 sqm", 
    bedType: "suite",
    images: [],
    available: true
  },
  {
    name: "Presidential Suite",
    description: "Top-tier luxury accommodation with exclusive amenities",
    maxOccupancy: 4,
    amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV", "Mini Bar", "Room Service", "Living Area", "Work Desk", "Kitchenette", "Balcony"],
    size: "60+ sqm",
    bedType: "suite", 
    images: [],
    available: true
  }
];

// Price multipliers for different room types
export const ROOM_TYPE_MULTIPLIERS = {
  standard: 1.0,
  deluxe: 1.4,
  executive: 2.0,
  presidential: 3.5
};

export async function getPlacesAPIAmenities(placeId: string): Promise<string[]> {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) {
    console.warn('Google Places API key not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=amenities,types&key=${API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.result?.amenities) {
      return data.result.amenities;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Places API amenities:', error);
    return [];
  }
}

export function generateRoomTypesForHotel(
  hotelId: string, 
  basePrice: number, 
  hotelStars: number = 3,
  placesAmenities: string[] = []
): HotelRoomData {
  
  const roomTypes: RoomType[] = DEFAULT_ROOM_TYPES.map((template, index) => {
    const multiplier = Object.values(ROOM_TYPE_MULTIPLIERS)[index] || 1.0;
    
    // Adjust availability based on hotel stars
    const available = hotelStars >= (index + 2); // 2+ stars for standard, 5 stars for presidential
    
    // Merge template amenities with Places API amenities
    const combinedAmenities = Array.from(new Set([
      ...template.amenities,
      ...placesAmenities.filter(amenity => 
        !template.amenities.some(existing => 
          existing.toLowerCase().includes(amenity.toLowerCase())
        )
      )
    ]));

    return {
      id: `${hotelId}-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
      ...template,
      pricePerNight: Math.round(basePrice * multiplier),
      amenities: combinedAmenities,
      available
    };
  });

  return {
    hotelId,
    lastUpdated: new Date().toISOString(),
    roomTypes: roomTypes.filter(room => room.available),
    amenities: placesAmenities
  };
}