import { promises as fs } from 'fs'
import path from 'path'

export type HotelShape = {
  id: string
  slug?: string
  name: string
  city: string
  type?: string
  stars?: number
  basePriceNGN?: number
  price?: number
  images?: string[]
  source?: 'static' | 'places_api'
  rating?: number
  totalRatings?: number
  address?: string
  amenities?: string[]
  phoneNumber?: string
  website?: string
  coordinates?: {
    lat: number
    lng: number
  }
  placeId?: string
  lastUpdated?: string
  [k: string]: unknown
}

function isDbEnabled() {
  const src = (process.env.DATA_SOURCE || 'json').toLowerCase()
  return src === 'db'
}

function isLiveDataEnabled() {
  return process.env.ENABLE_LIVE_HOTEL_DATA === 'true'
}

// Import optimized data loading (temporary - until database is set up)
import { getHotelsOptimized } from './hotel-data-optimized'

// Function to get fresh hotel data using optimized loading
async function getHotelData() {
  return await getHotelsOptimized()
}

function normalizeFromJson(h: any): HotelShape | null {
  if (!h) return null
  const base = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : undefined)
  return {
    id: String(h.id || h.slug || ''),
    slug: String(h.slug || h.id || ''),
    name: String(h.name || ''),
    city: String(h.city || ''),
    type: String(h.type || 'Hotel'),
    stars: typeof h.stars === 'number' ? h.stars : undefined,
    basePriceNGN: base,
    price: base,
    images: Array.isArray(h.images) ? h.images : [],
    roomTypes: h.roomTypes || [] // CRITICAL: Preserve roomTypes for room-based pricing
  }
}

function normalizeFromDb(h: any, images?: any[]): HotelShape | null {
  if (!h) return null
  const city = h.city || ''
  const imgUrls = Array.isArray(images) ? images.map((x: any) => x.url) : []
  return {
    id: String(h.slug || h.id), // slug is seeded as JSON id for compatibility
    slug: String(h.slug || ''),
    name: String(h.name || ''),
    city: String(city),
    type: String(h.type || 'Hotel'),
    stars: typeof h.stars === 'number' ? h.stars : undefined,
    basePriceNGN: typeof h.shelfPriceNGN === 'number' ? h.shelfPriceNGN : undefined,
    price: typeof h.shelfPriceNGN === 'number' ? h.shelfPriceNGN : undefined,
    images: imgUrls
  }
}

export async function getHotelById(id: string): Promise<HotelShape | null> {
  if (!id) return null

  // Try hybrid system first if live data is enabled
  if (isLiveDataEnabled()) {
    try {
      const { getHotelById: getHybridHotelById } = await import('@/lib/hybrid-hotels');
      const hybridHotel = await getHybridHotelById(id);
      if (hybridHotel) {
        return hybridToHotelShape(hybridHotel);
      }
    } catch (error) {
      console.error('Hybrid hotel fetch failed for ID:', id, error);
    }
  }

  if (isDbEnabled()) {
    try {
      const { prisma } = await import('@/lib/prisma')
      const hotel = await prisma.hotel.findUnique({
        where: { slug: id },
        include: { images: { orderBy: { sortOrder: 'asc' } } }
      })
      if (hotel) return normalizeFromDb(hotel, hotel.images)
    } catch (e) {
      // fall through to JSON
    }
  }

  // Get fresh hotel data from file system
  const HOTELS = await getHotelData()
  const j = HOTELS.find((h: any) => h.id === id)
  return normalizeFromJson(j)
}

export type ListOptions = {
  city?: string
  limit?: number
  budgetKey?: string
  stayType?: 'any' | 'hotel' | 'apartment' | 'high-security'
}

function priceInBudget(base: number, key?: string) {
  if (!base) return false
  if (!key) return true
  if (key === 'u40') return base >= 0 && base < 40000
  if (key === 'u80') return base >= 0 && base < 80000
  if (key === '80_130') return base >= 80000 && base <= 130000
  if (key === '130_200') return base >= 130000 && base <= 200000
  return base >= 200000
}

function hybridToHotelShape(hybrid: any): HotelShape {
  return {
    id: hybrid.id,
    name: hybrid.name,
    city: hybrid.city,
    type: hybrid.type,
    stars: hybrid.stars,
    basePriceNGN: hybrid.basePriceNGN,
    price: hybrid.basePriceNGN,
    images: hybrid.images,
    source: hybrid.source,
    rating: hybrid.rating,
    totalRatings: hybrid.totalRatings,
    address: hybrid.address,
    amenities: hybrid.amenities,
    phoneNumber: hybrid.phoneNumber,
    website: hybrid.website,
    coordinates: hybrid.coordinates,
    placeId: hybrid.placeId,
    lastUpdated: hybrid.lastUpdated
  }
}

export async function listHotels(opts: ListOptions = {}): Promise<HotelShape[]> {
  const { city, limit = 60, budgetKey, stayType = 'any' } = opts

  // Try hybrid system first if live data is enabled
  if (isLiveDataEnabled()) {
    try {
      console.log(`Fetching hybrid hotel data for city: ${city || 'all'}`);
      const { searchHotels: searchHybridHotels } = await import('@/lib/hybrid-hotels');
      const hybridHotels = await searchHybridHotels({
        city,
        budget: budgetKey,
        stayType,
        useLiveData: true
      });
      
      const converted = hybridHotels
        .map(hybridToHotelShape)
        .slice(0, limit);
      
      console.log(`Hybrid system returned ${converted.length} hotels`);
      return converted;
    } catch (error) {
      console.error('Hybrid hotel system failed, falling back to static data:', error);
    }
  }

  // Fallback to existing logic
  if (isDbEnabled()) {
    try {
      const { prisma } = await import('@/lib/prisma')
      const where: any = {}
      if (city) {
        const c = city.toLowerCase().replace(/\s+/g, '')
        const enumCity = c === 'lagos' ? 'Lagos' : c === 'abuja' ? 'Abuja' : c === 'portharcourt' || c === 'port-harcourt' ? 'PortHarcourt' : c === 'owerri' ? 'Owerri' : undefined
        if (enumCity) where.city = enumCity
      }
      if (stayType && stayType !== 'any' && stayType !== 'high-security') {
        // For high-security, we'll filter by price after fetching
        where.type = stayType === 'apartment' ? 'Apartment' : 'Hotel'
      }
      const rows = await prisma.hotel.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: Math.min(limit, 100),
        include: { images: { orderBy: { sortOrder: 'asc' } } }
      })
      const normalized: HotelShape[] = rows
        .map((r: any) => normalizeFromDb(r, (r as any).images))
        .filter(Boolean) as HotelShape[]
      
      // Apply high-security filter if needed
      let filtered = normalized
      if (stayType === 'high-security') {
        filtered = filtered.filter(h => (h.basePriceNGN || 0) > 78000)
      }
      
      // IMPORTANT: Do NOT apply budget filter here - room-based pricing handles that now
      return filtered.slice(0, limit)
    } catch (e) {
      // fall through to JSON
    }
  }

  // Get fresh hotel data from file system
  const HOTELS = await getHotelData()
  
  const filteredJson = (HOTELS as any[])
    .filter(h => !city || String(h.city).toLowerCase() === String(city).toLowerCase())
    .filter(h => {
      if (!stayType || stayType === 'any') return true
      const t = String(h.type || 'Hotel').toLowerCase()
      if (stayType === 'apartment') return t === 'apartment'
      if (stayType === 'hotel') return t === 'hotel'
      if (stayType === 'high-security') {
        // High security properties are those with base price > ₦78,000
        const basePrice = typeof h.basePriceNGN === 'number' ? h.basePriceNGN : (typeof h.price === 'number' ? h.price : 0)
        return basePrice > 78000
      }
      return true
    })
    .map(normalizeFromJson)
    .filter(Boolean) as HotelShape[]

  // IMPORTANT: Do NOT filter by budget here - room-based pricing handles that now
  // Budget filtering happens in room-based-pricing.ts based on individual room prices
  return filteredJson.slice(0, limit)
}
