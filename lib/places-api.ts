/**
 * Google Places API Integration for HotelSaver.ng
 * Fetches real hotel data for Nigerian cities with pricing estimates
 */

export interface PlacesHotel {
  placeId: string;
  name: string;
  address: string;
  city: string;
  rating?: number;
  totalRatings?: number;
  priceLevel?: number; // 0-4 (FREE, INEXPENSIVE, MODERATE, EXPENSIVE, VERY_EXPENSIVE)
  photos: string[];
  amenities: string[];
  phoneNumber?: string;
  website?: string;
  businessStatus: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  coordinates: {
    lat: number;
    lng: number;
  };
  // Our enriched data
  estimatedPriceNGN: number;
  stars: number;
  roomTypes: string[];
  type: 'Hotel' | 'Apartment' | 'Resort' | 'Lodge';
}

export interface PlacesSearchParams {
  city: string;
  radius?: number; // meters, default 50000 (50km)
  minRating?: number;
  maxResults?: number;
}

// Nigerian city coordinates for Places API searches
export const NIGERIAN_CITIES = {
  'Lagos': { lat: 6.5244, lng: 3.3792 },
  'Abuja': { lat: 9.0765, lng: 7.3986 },
  'Port Harcourt': { lat: 4.8156, lng: 7.0498 },
  'Owerri': { lat: 5.4840, lng: 7.0335 },
  'Kano': { lat: 12.0022, lng: 8.5920 },
  'Ibadan': { lat: 7.3775, lng: 3.9470 },
  'Kaduna': { lat: 10.5105, lng: 7.4165 },
  'Calabar': { lat: 4.9517, lng: 8.3222 }
};

// Price estimation based on Google's price level and Nigerian market
export const PRICE_LEVEL_TO_NGN = {
  0: { min: 15000, max: 35000 },   // FREE/INEXPENSIVE - Budget hotels
  1: { min: 25000, max: 55000 },   // INEXPENSIVE - Economy hotels  
  2: { min: 45000, max: 85000 },   // MODERATE - Mid-range hotels
  3: { min: 75000, max: 150000 },  // EXPENSIVE - Upscale hotels
  4: { min: 120000, max: 300000 }  // VERY_EXPENSIVE - Luxury hotels
};

// Rating to star conversion for consistency with existing system
export function ratingToStars(rating?: number): number {
  if (!rating) return 3;
  if (rating >= 4.5) return 5;
  if (rating >= 3.5) return 4;
  if (rating >= 2.5) return 3;
  if (rating >= 1.5) return 2;
  return 1;
}

// Estimate price based on rating, price level, and city
export function estimatePrice(
  rating?: number, 
  priceLevel?: number, 
  city: string = 'Owerri',
  placeId?: string
): number {
  const basePriceRange = PRICE_LEVEL_TO_NGN[priceLevel as keyof typeof PRICE_LEVEL_TO_NGN] || PRICE_LEVEL_TO_NGN[2];
  
  // City multipliers based on market dynamics
  const cityMultipliers: Record<string, number> = {
    'Lagos': 1.4,      // Premium market
    'Abuja': 1.3,      // Government/business hub  
    'Port Harcourt': 1.1, // Oil industry hub
    'Owerri': 0.9,     // Regional center
    'Kano': 0.8,       // Northern commercial hub
    'Ibadan': 0.85,    // Academic/cultural center
    'Kaduna': 0.8,     // Industrial center
    'Calabar': 0.9     // Tourism/border city
  };

  const cityMultiplier = cityMultipliers[city] || 0.9;
  
  // Rating bonus: higher rated hotels can charge premium
  const ratingMultiplier = rating ? (0.8 + (rating / 5) * 0.4) : 1.0;
  
  // Calculate base price (average of range)
  const basePrice = (basePriceRange.min + basePriceRange.max) / 2;
  
  // Create deterministic "randomization" based on place ID to ensure consistent pricing
  // This prevents the same hotel from showing different prices between search and negotiation
  const placeIdHash = placeId ? placeId.split('').reduce((a: number, b: string) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0) : 0;
  const deterministicVariation = 0.85 + (Math.abs(placeIdHash) % 30) / 100; // 0.85 to 1.14
  
  // Apply multipliers with deterministic variation instead of random
  const estimatedPrice = Math.round(
    basePrice * cityMultiplier * ratingMultiplier * deterministicVariation
  );
  
  return Math.max(15000, estimatedPrice); // Minimum price floor
}

// Determine hotel type from place types and name
export function determineHotelType(types: string[], name: string): PlacesHotel['type'] {
  const nameUpper = name.toUpperCase();
  
  if (types.includes('resort') || nameUpper.includes('RESORT')) return 'Resort';
  if (types.includes('campground') || nameUpper.includes('LODGE')) return 'Lodge';
  if (types.includes('apartment') || nameUpper.includes('APARTMENT') || 
      nameUpper.includes('SUITES') || nameUpper.includes('SERVICED')) return 'Apartment';
  
  return 'Hotel'; // Default
}

// Extract amenities from Google Places types and details
export function extractAmenities(types: string[], details?: any): string[] {
  const amenities: string[] = [];
  
  // Map Google Places types to amenities
  const typeToAmenity: Record<string, string> = {
    'gym': 'Fitness Center',
    'spa': 'Spa',
    'restaurant': 'Restaurant',
    'bar': 'Bar/Lounge',
    'parking': 'Parking',
    'swimming_pool': 'Swimming Pool',
    'wifi': 'Free WiFi',
    'air_conditioning': 'Air Conditioning',
    'room_service': 'Room Service',
    'laundromat': 'Laundry Service'
  };

  types.forEach(type => {
    if (typeToAmenity[type]) {
      amenities.push(typeToAmenity[type]);
    }
  });

  // Default amenities for hotels in Nigeria
  const defaultAmenities = ['Free WiFi', 'Air Conditioning', 'Room Service', 'Security'];
  defaultAmenities.forEach(amenity => {
    if (!amenities.includes(amenity)) {
      amenities.push(amenity);
    }
  });

  return amenities.slice(0, 8); // Limit to 8 amenities
}

// Get photo URLs from Places API photos
export function getPhotoUrls(photos: any[]): string[] {
  if (!photos || !photos.length) {
    // Fallback to hotel placeholder images
    return [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
    ];
  }

  return photos.slice(0, 5).map(photo => {
    // Google Places photo reference URL
    const photoReference = photo.photo_reference || photo.name;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  });
}

/**
 * Search for hotels in a Nigerian city using Google Places API
 */
export async function searchHotelsInCity({
  city,
  radius = 50000,
  minRating = 3.0,
  maxResults = 20
}: PlacesSearchParams): Promise<PlacesHotel[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.error('Google Places API key not configured');
    return [];
  }

  const cityCoords = NIGERIAN_CITIES[city as keyof typeof NIGERIAN_CITIES];
  if (!cityCoords) {
    console.error(`City ${city} not found in Nigerian cities list`);
    return [];
  }

  try {
    // Step 1: Search for lodging establishments
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${cityCoords.lat},${cityCoords.lng}&` +
      `radius=${radius}&` +
      `type=lodging&` +
      `keyword=hotel&` +
      `key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (searchData.status !== 'OK') {
      console.error('Places API search failed:', searchData.status, searchData.error_message);
      return [];
    }

    const places = searchData.results || [];
    const hotels: PlacesHotel[] = [];

    // Step 2: Get detailed information for each place
    for (const place of places.slice(0, maxResults)) {
      if (place.rating && place.rating < minRating) continue;
      if (place.business_status !== 'OPERATIONAL') continue;

      // Get place details
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${place.place_id}&` +
        `fields=name,formatted_address,rating,user_ratings_total,price_level,photos,types,formatted_phone_number,website,business_status,geometry&` +
        `key=${apiKey}`;

      try {
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result) {
          const details = detailsData.result;
          
          const hotel: PlacesHotel = {
            placeId: place.place_id,
            name: details.name,
            address: details.formatted_address,
            city: city,
            rating: details.rating,
            totalRatings: details.user_ratings_total,
            priceLevel: details.price_level,
            photos: getPhotoUrls(details.photos),
            amenities: extractAmenities(details.types, details),
            phoneNumber: details.formatted_phone_number,
            website: details.website,
            businessStatus: details.business_status,
            coordinates: {
              lat: details.geometry.location.lat,
              lng: details.geometry.location.lng
            },
            // Our enriched data
            estimatedPriceNGN: estimatePrice(details.rating, details.price_level, city, details.place_id),
            stars: ratingToStars(details.rating),
            roomTypes: ['Standard Room', 'Deluxe Room'], // Default room types
            type: determineHotelType(details.types, details.name)
          };

          hotels.push(hotel);
        }
      } catch (error) {
        console.error(`Error fetching details for place ${place.place_id}:`, error);
      }

      // Rate limiting - small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return hotels;

  } catch (error) {
    console.error('Error searching hotels:', error);
    return [];
  }
}

/**
 * Get a single hotel by Place ID with full details
 */
export async function getHotelByPlaceId(placeId: string, city: string): Promise<PlacesHotel | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.error('Google Places API key not configured');
    return null;
  }

  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?` +
      `place_id=${placeId}&` +
      `fields=name,formatted_address,rating,user_ratings_total,price_level,photos,types,formatted_phone_number,website,business_status,geometry,reviews&` +
      `key=${apiKey}`;

    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const details = data.result;
      
      return {
        placeId: placeId,
        name: details.name,
        address: details.formatted_address,
        city: city,
        rating: details.rating,
        totalRatings: details.user_ratings_total,
        priceLevel: details.price_level,
        photos: getPhotoUrls(details.photos),
        amenities: extractAmenities(details.types, details),
        phoneNumber: details.formatted_phone_number,
        website: details.website,
        businessStatus: details.business_status,
        coordinates: {
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng
        },
        estimatedPriceNGN: estimatePrice(details.rating, details.price_level, city, details.place_id),
        stars: ratingToStars(details.rating),
        roomTypes: ['Standard Room', 'Deluxe Room', 'Executive Suite'],
        type: determineHotelType(details.types, details.name)
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    return null;
  }
}

/**
 * Refresh pricing for existing hotels (for periodic updates)
 */
export function refreshHotelPricing(hotel: PlacesHotel): PlacesHotel {
  return {
    ...hotel,
    estimatedPriceNGN: estimatePrice(hotel.rating, hotel.priceLevel, hotel.city, hotel.placeId)
  };
}