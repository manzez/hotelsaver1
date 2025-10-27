import { PlacesHotel, searchHotelsInCity, getHotelByPlaceId } from './places-api';
import HOTELS_DATA from '../lib.hotels.json';

/**
 * Hybrid hotel data service that combines static data with live Places API data
 */

export interface HybridHotel {
  id: string;
  name: string;
  city: string;
  basePriceNGN: number;
  stars: number;
  type: 'Hotel' | 'Apartment' | 'Resort' | 'Lodge';
  images: string[];
  rating?: number;
  totalRatings?: number;
  address?: string;
  amenities?: string[];
  phoneNumber?: string;
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: 'static' | 'places_api';
  placeId?: string;
  lastUpdated?: string;
}

// Cache for Places API data to avoid excessive calls
const placesCache = new Map<string, { data: PlacesHotel[], timestamp: number }>();
// Individual hotel cache for consistent pricing between search and negotiate
const hotelCache = new Map<string, { hotel: HybridHotel, timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Convert Places API hotel to our hybrid format
 */
function placesToHybrid(placesHotel: PlacesHotel): HybridHotel {
  const hotelId = `places_${placesHotel.placeId}`;
  
  // Check if we already have this hotel cached with consistent pricing
  const cached = hotelCache.get(hotelId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.hotel;
  }
  
  const hybridHotel: HybridHotel = {
    id: hotelId,
    name: placesHotel.name,
    city: placesHotel.city,
    basePriceNGN: placesHotel.estimatedPriceNGN,
    stars: placesHotel.stars,
    type: placesHotel.type,
    images: placesHotel.photos,
    rating: placesHotel.rating,
    totalRatings: placesHotel.totalRatings,
    address: placesHotel.address,
    amenities: placesHotel.amenities,
    phoneNumber: placesHotel.phoneNumber,
    website: placesHotel.website,
    coordinates: placesHotel.coordinates,
    source: 'places_api',
    placeId: placesHotel.placeId,
    lastUpdated: new Date().toISOString()
  };
  
  // Cache the hotel with its consistent pricing
  hotelCache.set(hotelId, {
    hotel: hybridHotel,
    timestamp: Date.now()
  });
  
  return hybridHotel;
}

/**
 * Convert static hotel to hybrid format
 */
function staticToHybrid(staticHotel: any): HybridHotel {
  return {
    id: staticHotel.id,
    name: staticHotel.name,
    city: staticHotel.city,
    basePriceNGN: staticHotel.basePriceNGN || staticHotel.price,
    stars: staticHotel.stars,
    type: staticHotel.type || 'Hotel',
    images: staticHotel.images || [],
    source: 'static'
  };
}

/**
 * Get hotels for a city using hybrid approach
 * Preference: Places API > Static data fallback
 */
export async function getHotelsForCity(
  city: string, 
  options: {
    useLiveData?: boolean;
    limit?: number;
    minRating?: number;
  } = {}
): Promise<HybridHotel[]> {
  const { useLiveData = true, limit = 20, minRating = 3.0 } = options;
  
  let hotels: HybridHotel[] = [];

  // Try Places API first if live data is requested
  if (useLiveData && process.env.GOOGLE_PLACES_API_KEY) {
    try {
      // Check cache first
      const cacheKey = `${city}_${limit}_${minRating}`;
      const cached = placesCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Using cached Places data for ${city}`);
        hotels = cached.data.map(placesToHybrid);
      } else {
        console.log(`Fetching live Places data for ${city}`);
        const placesHotels = await searchHotelsInCity({
          city,
          maxResults: limit,
          minRating
        });
        
        // Cache the results
        placesCache.set(cacheKey, {
          data: placesHotels,
          timestamp: Date.now()
        });
        
        hotels = placesHotels.map(placesToHybrid);
        console.log(`Fetched ${hotels.length} hotels from Places API for ${city}`);
      }
    } catch (error) {
      console.error(`Places API failed for ${city}, falling back to static data:`, error);
    }
  }

  // Fallback to static data if Places API failed or not requested
  if (hotels.length === 0) {
    console.log(`Using static hotel data for ${city}`);
    const staticHotels = HOTELS_DATA.filter(h => 
      h.city.toLowerCase() === city.toLowerCase()
    );
    hotels = staticHotels.map(staticToHybrid).slice(0, limit);
  }

  return hotels;
}

/**
 * Get a specific hotel by ID (handles both static and Places API IDs)
 * Uses cached data to ensure consistent pricing between search and negotiate
 */
export async function getHotelById(
  id: string, 
  city?: string
): Promise<HybridHotel | null> {
  // Check if it's a Places API ID
  if (id.startsWith('places_')) {
    // First check our hotel cache for consistent pricing
    const cached = hotelCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached hotel data for ${id} to ensure price consistency`);
      return cached.hotel;
    }
    
    // If not cached, fetch from Places API
    const placeId = id.replace('places_', '');
    if (city && process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const placesHotel = await getHotelByPlaceId(placeId, city);
        return placesHotel ? placesToHybrid(placesHotel) : null;
      } catch (error) {
        console.error(`Error fetching Places hotel ${id}:`, error);
      }
    }
  }

  // Check static data
  const staticHotel = HOTELS_DATA.find(h => h.id === id);
  return staticHotel ? staticToHybrid(staticHotel) : null;
}

/**
 * Search hotels across all cities with hybrid data
 */
export async function searchHotels(query: {
  city?: string;
  budget?: string;
  stayType?: string;
  useLiveData?: boolean;
}): Promise<HybridHotel[]> {
  const { city, budget, stayType, useLiveData = true } = query;
  
  let hotels: HybridHotel[] = [];

  if (city) {
    // Get hotels for specific city
    hotels = await getHotelsForCity(city, { useLiveData });
  } else {
    // Get hotels from multiple cities (limit Places API calls)
    const cities = ['Lagos', 'Abuja', 'Port Harcourt', 'Owerri'];
    for (const cityName of cities) {
      const cityHotels = await getHotelsForCity(cityName, { 
        useLiveData: useLiveData && cities.indexOf(cityName) < 2, // Only use Places API for first 2 cities
        limit: 10 
      });
      hotels.push(...cityHotels);
    }
  }

  // Apply filters
  let filtered = hotels;

  // Budget filter
  if (budget) {
    const ranges = {
      'u80': [0, 80000],
      '80_130': [80000, 130000],
      '130_200': [130000, 200000],
      '200p': [200000, 99999999]
    };
    
    const range = ranges[budget as keyof typeof ranges];
    if (range) {
      filtered = filtered.filter(h => 
        h.basePriceNGN >= range[0] && h.basePriceNGN <= range[1]
      );
    }
  }

  // Stay type filter
  if (stayType && stayType !== 'any') {
    filtered = filtered.filter(h => 
      h.type.toLowerCase() === stayType.toLowerCase()
    );
  }

  return filtered;
}

/**
 * Get pricing statistics for a city
 */
export async function getCityPricingStats(city: string): Promise<{
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  hotelCount: number;
  source: 'places_api' | 'static' | 'mixed';
}> {
  const hotels = await getHotelsForCity(city);
  
  if (hotels.length === 0) {
    return {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      hotelCount: 0,
      source: 'static'
    };
  }

  const prices = hotels.map(h => h.basePriceNGN);
  const hasPlacesData = hotels.some(h => h.source === 'places_api');
  const hasStaticData = hotels.some(h => h.source === 'static');
  
  return {
    averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    hotelCount: hotels.length,
    source: hasPlacesData && hasStaticData ? 'mixed' : 
             hasPlacesData ? 'places_api' : 'static'
  };
}

/**
 * Clear Places API cache (useful for development/testing)
 */
export function clearPlacesCache(): void {
  placesCache.clear();
  hotelCache.clear();
  console.log('Places API and hotel caches cleared');
}

/**
 * Get hotel by ID with fallback - optimized for external API use
 * Ensures consistent pricing by checking cache first
 */
export async function getHotelByIdWithFallback(
  id: string,
  city: string = 'Owerri'
): Promise<HybridHotel | null> {
  return await getHotelById(id, city);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { 
  entries: number; 
  cities: string[]; 
  oldestEntry?: string;
  newestEntry?: string;
} {
  const entries = Array.from(placesCache.entries());
  
  if (entries.length === 0) {
    return { entries: 0, cities: [] };
  }

  const timestamps = entries.map(([_, data]) => data.timestamp);
  const cities = entries.map(([key]) => key.split('_')[0]);
  
  return {
    entries: entries.length,
    cities: [...new Set(cities)],
    oldestEntry: new Date(Math.min(...timestamps)).toISOString(),
    newestEntry: new Date(Math.max(...timestamps)).toISOString()
  };
}