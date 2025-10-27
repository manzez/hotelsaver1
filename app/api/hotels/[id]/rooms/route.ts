// app/api/hotels/[id]/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HOTELS } from '@/lib/data';
import { generateRoomTypesForHotel, getPlacesAPIAmenities } from '@/lib/room-types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const hotelId = params.id;
    
    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    // Find the hotel
    const hotel = HOTELS.find((h: any) => h.id === hotelId);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Get base price
    const basePrice = typeof hotel.basePriceNGN === 'number' 
      ? hotel.basePriceNGN 
      : typeof hotel.price === 'number' 
      ? hotel.price 
      : 100000; // Default fallback

    const hotelStars = hotel.stars || 3;

    // Try to get Places API amenities (optional enhancement)
    let placesAmenities: string[] = [];
    const placeId = hotel.placeId; // If you have place IDs in your data
    
    if (placeId) {
      try {
        placesAmenities = await getPlacesAPIAmenities(placeId);
      } catch (error) {
        console.warn(`Could not fetch Places API data for ${hotelId}:`, error);
      }
    }

    // Generate room types with fallback
    let roomData;
    try {
      roomData = generateRoomTypesForHotel(
        hotelId,
        basePrice,
        hotelStars,
        placesAmenities
      );
    } catch (error) {
      console.error('Error in generateRoomTypesForHotel, using fallback:', error);
      // Fallback room data
      roomData = {
        hotelId,
        lastUpdated: new Date().toISOString(),
        roomTypes: [
          {
            id: `${hotelId}-standard`,
            name: "Standard Room",
            description: "Comfortable room with essential amenities",
            basePriceNGN: basePrice,
            maxOccupancy: 2,
            amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV"],
            bedType: "double" as const,
            images: [],
            available: true
          },
          {
            id: `${hotelId}-deluxe`,
            name: "Deluxe Room",
            description: "Spacious room with premium amenities and city view",
            basePriceNGN: Math.round(basePrice * 1.4),
            maxOccupancy: 3,
            amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV", "Mini Bar", "Room Service"],
            size: "30 sqm",
            bedType: "king" as const,
            images: [],
            available: hotelStars >= 3
          },
          {
            id: `${hotelId}-executive`,
            name: "Executive Suite",
            description: "Luxury suite with separate living area and premium services",
            basePriceNGN: Math.round(basePrice * 2.0),
            maxOccupancy: 4,
            amenities: ["Air Conditioning", "Private Bathroom", "WiFi", "TV", "Mini Bar", "Room Service", "Living Area", "Work Desk"],
            size: "45 sqm",
            bedType: "suite" as const,
            images: [],
            available: hotelStars >= 4
          }
        ].filter(room => room.available),
        amenities: placesAmenities
      };
    }
    
    const response = {
      success: true,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        stars: hotelStars
      },
      ...roomData
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching room types:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}