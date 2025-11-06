// lib/room-based-pricing.ts - Smart room-based pricing for search results
import { getHotelByIdOptimized } from './hotel-data-optimized';
import { getHotelById } from './hotels-source';
import { generateRoomTypesForHotel } from './room-types';

export interface RoomPriceInfo {
  hotelId: string;
  cheapestRoomPrice: number;
  cheapestRoomName: string;
  roomId: string;
  hasAvailableRooms: boolean;
  matchesCapacity: boolean;
  hasRoomInBudget?: boolean; // New field to track if ANY room is in budget
  allRoomPrices?: number[]; // All available room prices for debugging
}

export interface SearchCriteria {
  adults: number;
  children: number;
  rooms: number;
  budgetMin: number;
  budgetMax: number;
}

/**
 * Get the best room price for a hotel based on search criteria
 */
export async function getBestRoomPriceForHotel(
  hotelId: string, 
  criteria: SearchCriteria
): Promise<RoomPriceInfo> {
  try {
    // Get hotel basic data first
    let hotel;
    try {
      hotel = await getHotelById(hotelId);
    } catch (dbError) {
      // Fallback to optimized JSON lookup
      hotel = await getHotelByIdOptimized(hotelId);
    }

    if (!hotel) {
      return {
        hotelId,
        cheapestRoomPrice: 0,
        cheapestRoomName: "Hotel not found",
        roomId: '',
        hasAvailableRooms: false,
        matchesCapacity: false,
        hasRoomInBudget: false
      };
    }

    let roomTypes = [];

    // Check if hotel has room types in the data
    if (hotel.roomTypes && Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0) {
      roomTypes = hotel.roomTypes;
    } else {
      // No room types = no pricing available
      console.warn(`Hotel ${hotelId} has no room types configured`);
      return {
        hotelId,
        cheapestRoomPrice: 0,
        cheapestRoomName: "No rooms configured",
        roomId: '',
        hasAvailableRooms: false,
        matchesCapacity: false,
        hasRoomInBudget: false
      };
    }

    if (roomTypes.length > 0) {
      const totalGuests = criteria.adults + criteria.children;
      
      // Get all available room prices for budget checking
      const allAvailableRoomPrices = roomTypes
        .filter((room: any) => room.available !== false)
        .map((room: any) => room.pricePerNight || room.basePriceNGN || 0)
        .filter((price: number) => price > 0);
      
      // Check if ANY room is within budget
      const hasRoomInBudget = allAvailableRoomPrices.some(
        (price: number) => price >= criteria.budgetMin && price <= criteria.budgetMax
      );
      
      // DEBUG: Log the first 5 hotels to see what's happening
      if (Math.random() < 0.05) { // Log 5% of hotels
        console.log(`  📊 Hotel ${hotelId}: Prices=[${allAvailableRoomPrices.join(', ')}], InBudget=${hasRoomInBudget}, Range=[${criteria.budgetMin}-${criteria.budgetMax}]`)
      }

      
      // Filter rooms by capacity and availability (NOT by budget here)
      // Budget filtering will happen at the hotel level in search results
      const suitableRooms = roomTypes.filter((room: any) => {
        const maxOccupancy = room.maxOccupancy || 2;
        const isAvailable = room.available !== false;
        const fitsGuests = maxOccupancy >= totalGuests;
        const roomPrice = room.pricePerNight || room.basePriceNGN || 0;
        
        return isAvailable && fitsGuests && roomPrice > 0;
      });

      if (suitableRooms.length > 0) {
        // IMPORTANT: Find cheapest room WITHIN THE BUDGET RANGE
        // First, filter rooms that are within budget
        const roomsInBudget = suitableRooms.filter((room: any) => {
          const roomPrice = room.pricePerNight || room.basePriceNGN || 0;
          return roomPrice >= criteria.budgetMin && roomPrice <= criteria.budgetMax;
        });
        
        // If we have rooms in budget, use those. Otherwise, use all suitable rooms
        const roomsToConsider = roomsInBudget.length > 0 ? roomsInBudget : suitableRooms;
        
        // Find cheapest room from the filtered set
        const cheapestRoom = roomsToConsider.reduce((prev: any, current: any) => {
          const prevPrice = prev.pricePerNight || prev.basePriceNGN || 0;
          const currentPrice = current.pricePerNight || current.basePriceNGN || 0;
          return currentPrice < prevPrice ? current : prev;
        });

        const roomPrice = cheapestRoom.pricePerNight || cheapestRoom.basePriceNGN || 0;

        return {
          hotelId,
          cheapestRoomPrice: roomPrice,
          cheapestRoomName: cheapestRoom.name,
          roomId: cheapestRoom.id,
          hasAvailableRooms: true,
          matchesCapacity: true,
          hasRoomInBudget,
          allRoomPrices: allAvailableRoomPrices
        };
      } else {
        // No suitable rooms found for capacity, check if any rooms exist
        const hasAnyRooms = roomTypes.some((room: any) => {
          const roomPrice = room.pricePerNight || room.basePriceNGN || 0;
          return room.available !== false && roomPrice > 0;
        });
        
        if (hasAnyRooms) {
          // Find cheapest available room regardless of capacity for display
          const availableRooms = roomTypes.filter((room: any) => {
            const roomPrice = room.pricePerNight || room.basePriceNGN || 0;
            return room.available !== false && roomPrice > 0;
          });
          
          const cheapestAvailable = availableRooms.reduce((prev: any, current: any) => {
            const prevPrice = prev.pricePerNight || prev.basePriceNGN || 0;
            const currentPrice = current.pricePerNight || current.basePriceNGN || 0;
            return currentPrice < prevPrice ? current : prev;
          });

          const roomPrice = cheapestAvailable.pricePerNight || cheapestAvailable.basePriceNGN || 0;

          return {
            hotelId,
            cheapestRoomPrice: roomPrice,
            cheapestRoomName: cheapestAvailable.name,
            roomId: cheapestAvailable.id,
            hasAvailableRooms: true,
            matchesCapacity: false,
            hasRoomInBudget,
            allRoomPrices: allAvailableRoomPrices
          };
        }
      }
    }

    // No suitable rooms found - return 0 price
    console.warn(`No suitable rooms found for hotel ${hotelId} with criteria:`, criteria);
    return {
      hotelId,
      cheapestRoomPrice: 0,
      cheapestRoomName: "No rooms available",
      roomId: '',
      hasAvailableRooms: false,
      matchesCapacity: false,
      hasRoomInBudget: false
    };

  } catch (error) {
    console.error(`Error getting room price for hotel ${hotelId}:`, error);
    
    // Return null on error instead of fallback
    return {
      hotelId,
      cheapestRoomPrice: 0,
      cheapestRoomName: "Error loading rooms",
      roomId: '',
      hasAvailableRooms: false,
      matchesCapacity: false,
      hasRoomInBudget: false
    };
  }
}

/**
 * Get budget range from budget key
 */
export function getBudgetRange(budgetKey: string): [number, number] {
  switch (budgetKey) {
    case 'u40': return [0, 40000];
    case 'u80': return [0, 80000];
    case '80_130': return [80000, 130000];
    case '130_200': return [130000, 200000];
    case '200p': return [200000, 999999999];
    default: return [0, 999999999];
  }
}

/**
 * Process multiple hotels with room-based pricing
 */
export async function getHotelsWithRoomPricing(
  hotelIds: string[],
  criteria: SearchCriteria
): Promise<Map<string, RoomPriceInfo>> {
  console.log(`💰 [PRICING] Processing ${hotelIds.length} hotels with budget [₦${criteria.budgetMin.toLocaleString()} - ₦${criteria.budgetMax.toLocaleString()}]`)
  
  const roomPriceMap = new Map<string, RoomPriceInfo>();
  
  // Process hotels in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < hotelIds.length; i += batchSize) {
    const batch = hotelIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(hotelId => 
      getBestRoomPriceForHotel(hotelId, criteria)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(roomInfo => {
      roomPriceMap.set(roomInfo.hotelId, roomInfo);
    });
  }
  
  // Log summary
  const inBudget = Array.from(roomPriceMap.values()).filter(r => r.hasRoomInBudget).length
  console.log(`💰 [PRICING] Result: ${inBudget} hotels have rooms in budget out of ${roomPriceMap.size}`)
  
  return roomPriceMap;
}