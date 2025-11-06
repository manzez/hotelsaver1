// types/room-types.ts - Room types interface definitions

export interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  discountPercent: number; // 0-100 (e.g., 15 = 15% discount)
  description?: string;
  amenities?: string[];
  maxOccupancy?: number;
  size?: string; // e.g., "25 sqm"
}

export interface HotelWithRooms {
  id: string;
  name: string;
  city: string;
  type: string;
  stars: number;
  images: string[];
  roomTypes: RoomType[];
  facilities?: any;
  [key: string]: any;
}

// Standard room type templates
export const STANDARD_ROOM_TYPES = [
  {
    id: 'standard',
    name: 'Standard Room',
    description: 'Comfortable accommodation with essential amenities',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV'],
    maxOccupancy: 2,
    size: '20 sqm'
  },
  {
    id: 'deluxe', 
    name: 'Deluxe Room',
    description: 'Spacious room with premium amenities and city view',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk'],
    maxOccupancy: 2,
    size: '30 sqm'
  },
  {
    id: 'executive',
    name: 'Executive Room', 
    description: 'Premium accommodation with executive lounge access',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Executive lounge access', 'Complimentary breakfast'],
    maxOccupancy: 2,
    size: '35 sqm'
  },
  {
    id: 'presidential',
    name: 'Presidential Suite',
    description: 'Luxurious suite with separate living area and premium services',
    amenities: ['Free WiFi', 'Air conditioning', 'Private bathroom', 'TV', 'Mini-fridge', 'Work desk', 'Separate living area', 'Butler service', 'Premium amenities'],
    maxOccupancy: 4,
    size: '60 sqm'
  }
];