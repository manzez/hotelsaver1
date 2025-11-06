// app/api/hotels/[id]/rooms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getHotelByIdOptimized } from '@/lib/hotel-data-optimized';
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

    // Find the hotel using optimized loading
    const hotel = await getHotelByIdOptimized(hotelId);
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      );
    }

    // Get hotel basic info for both cases
    const hotelStars = hotel.stars || 3;
    const basePrice = typeof hotel.basePriceNGN === 'number' 
      ? hotel.basePriceNGN 
      : typeof hotel.price === 'number' 
      ? hotel.price 
      : 100000; // Default fallback

    let roomData;
    
    // Check if hotel already has room types in the data
    if (hotel.roomTypes && Array.isArray(hotel.roomTypes)) {
      console.log(`✅ Using existing room types for hotel ${hotelId}`);
      roomData = {
        hotelId,
        lastUpdated: hotel.lastUpdated || new Date().toISOString(),
        roomTypes: hotel.roomTypes.filter((room: any) => room.available !== false),
        amenities: hotel.amenities || []
      };
    } else {
      console.log(`⚠️ No room types found for ${hotelId}, generating fallback`);

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

      // Generate room types as fallback
      try {
        roomData = generateRoomTypesForHotel(
          hotelId,
          basePrice,
          hotelStars,
          placesAmenities
        );
      } catch (error) {
        console.error('Error in generateRoomTypesForHotel, using minimal fallback:', error);
        // Minimal fallback room data
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
            }
          ],
          amenities: placesAmenities
        };
      }
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