// lib/hotel-data-optimized.ts - Optimized hotel data loading with caching
import { promises as fs } from 'fs';
import path from 'path';

// In-memory cache to avoid re-reading the large JSON file
let hotelDataCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getHotelsOptimized(): Promise<any[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (hotelDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return hotelDataCache;
  }

  try {
    const filePath = path.join(process.cwd(), 'lib.hotels.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const parsedData = JSON.parse(fileContent);
    hotelDataCache = parsedData;
    cacheTimestamp = now;
    
    console.log(`🚀 Hotel data loaded and cached: ${parsedData.length} hotels`);
    return parsedData;
  } catch (error) {
    console.error('❌ Failed to load hotel data:', error);
    // Fallback to static import if file read fails
    const { HOTELS } = await import('./data');
    hotelDataCache = HOTELS;
    cacheTimestamp = now;
    return HOTELS;
  }
}

export async function getHotelByIdOptimized(id: string): Promise<any | null> {
  const hotels = await getHotelsOptimized();
  return hotels.find(hotel => hotel.id === id) || null;
}

export async function getHotelsByCity(city: string, limit: number = 50): Promise<any[]> {
  const hotels = await getHotelsOptimized();
  return hotels
    .filter(hotel => hotel.city.toLowerCase() === city.toLowerCase())
    .slice(0, limit);
}

export async function searchHotelsOptimized(filters: {
  city?: string;
  budget?: string;
  limit?: number;
}): Promise<any[]> {
  const hotels = await getHotelsOptimized();
  let filtered = hotels;

  // Apply city filter
  if (filters.city) {
    filtered = filtered.filter(hotel => 
      hotel.city.toLowerCase() === filters.city!.toLowerCase()
    );
  }

  // Apply budget filter
  if (filters.budget) {
    const ranges: Record<string, [number, number]> = {
      'u40': [0, 40000],
      'u80': [0, 80000],
      '80_130': [80000, 130000], 
      '130_200': [130000, 200000],
      '200p': [200000, 9999999]
    }
    
    const [min, max] = ranges[filters.budget] || [0, 9999999];
    filtered = filtered.filter(hotel => {
      const price = hotel.basePriceNGN || hotel.price || 0;
      return price >= min && price <= max;
    });
  }

  // Limit results to prevent large payloads
  return filtered.slice(0, filters.limit || 50);
}

// Clear cache function for admin updates
export function clearHotelCache(): void {
  hotelDataCache = null;
  cacheTimestamp = 0;
  console.log('🔄 Hotel data cache cleared');
}