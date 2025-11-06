// lib/hotel-database-service.ts - Database-only hotel service (No JSON fallback)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Hotel {
  id: string;
  name: string;
  city: string;
  type: string;
  basePriceNGN: number;
  stars: number;
  images: string[];
  discountPercent: number;
  negotiationEnabled: boolean;
  negotiationMinPct: number;
  negotiationMaxPct: number;
  active: boolean;
  roomTypes?: Array<{
    id: string;
    name: string;
    basePriceNGN: number;
    discountPercent: number;
  }>;
}

// In-memory cache for performance (5-minute TTL)
let hotelCache: { data: Hotel[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get all active hotels from database (with caching)
 */
export async function getHotels(): Promise<Hotel[]> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (hotelCache && (now - hotelCache.timestamp) < CACHE_TTL) {
    return hotelCache.data;
  }

  try {
    console.log('📊 Fetching hotels from database...');
    
    const dbHotels = await prisma.hotel.findMany({
      where: { active: true },
      include: { 
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ]
    });

    const hotels: Hotel[] = dbHotels.map(dbHotel => ({
      id: dbHotel.slug,
      name: dbHotel.name,
      city: dbHotel.city,
      type: dbHotel.type,
      basePriceNGN: dbHotel.shelfPriceNGN,
      stars: dbHotel.stars,
      images: dbHotel.images.map(img => img.url),
      discountPercent: (dbHotel.discountRatePct || 0) / 100, // Convert to decimal
      negotiationEnabled: dbHotel.negotiationEnabled,
      negotiationMinPct: dbHotel.negotiationMinPct || 5,
      negotiationMaxPct: dbHotel.negotiationMaxPct || 50,
      active: dbHotel.active
    }));

    // Update cache
    hotelCache = { data: hotels, timestamp: now };
    
    console.log(`✅ Loaded ${hotels.length} hotels from database`);
    return hotels;

  } catch (error) {
    console.error('❌ Failed to load hotels from database:', error);
    
    // If database is down, return empty array rather than crashing
    // This allows the app to continue running (with no hotels shown)
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get single hotel by ID from database
 */
export async function getHotelById(hotelId: string): Promise<Hotel | null> {
  try {
    const dbHotel = await prisma.hotel.findUnique({
      where: { 
        slug: hotelId,
        active: true 
      },
      include: { 
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!dbHotel) {
      return null;
    }

    return {
      id: dbHotel.slug,
      name: dbHotel.name,
      city: dbHotel.city,
      type: dbHotel.type,
      basePriceNGN: dbHotel.shelfPriceNGN,
      stars: dbHotel.stars,
      images: dbHotel.images.map(img => img.url),
      discountPercent: (dbHotel.discountRatePct || 0) / 100,
      negotiationEnabled: dbHotel.negotiationEnabled,
      negotiationMinPct: dbHotel.negotiationMinPct || 5,
      negotiationMaxPct: dbHotel.negotiationMaxPct || 50,
      active: dbHotel.active
    };

  } catch (error) {
    console.error(`❌ Failed to load hotel ${hotelId}:`, error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Search hotels with filters (database-only)
 */
export async function searchHotels(params: {
  city?: string;
  budget?: string;
  limit?: number;
}): Promise<Hotel[]> {
  try {
    // Build where clause
    const where: any = { active: true };
    
    if (params.city) {
      where.city = params.city;
    }

    // Apply budget filter
    if (params.budget) {
      const ranges: Record<string, [number, number]> = {
        'u40': [0, 40000],
        'u80': [0, 80000],
        '80_130': [80000, 130000], 
        '130_200': [130000, 200000],
        '200p': [200000, 9999999]
      }
      
      const [min, max] = ranges[params.budget] || [0, 9999999];
      where.shelfPriceNGN = {
        gte: min,
        lte: max
      };
    }

    const dbHotels = await prisma.hotel.findMany({
      where,
      include: { 
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { city: 'asc' },
        { name: 'asc' }
      ],
      take: params.limit || 50
    });

    const hotels: Hotel[] = dbHotels.map(dbHotel => ({
      id: dbHotel.slug,
      name: dbHotel.name,
      city: dbHotel.city,
      type: dbHotel.type,
      basePriceNGN: dbHotel.shelfPriceNGN,
      stars: dbHotel.stars,
      images: dbHotel.images.map(img => img.url),
      discountPercent: (dbHotel.discountRatePct || 0) / 100,
      negotiationEnabled: dbHotel.negotiationEnabled,
      negotiationMinPct: dbHotel.negotiationMinPct || 5,
      negotiationMaxPct: dbHotel.negotiationMaxPct || 50,
      active: dbHotel.active
    }));

    return hotels;

  } catch (error) {
    console.error('❌ Failed to search hotels:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get discount for hotel (directly from database)
 */
export async function getHotelDiscount(hotelId: string): Promise<number> {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelId },
      select: { 
        discountRatePct: true,
        negotiationEnabled: true 
      }
    });

    if (!hotel || !hotel.negotiationEnabled) {
      return 0; // No discount available
    }

    return (hotel.discountRatePct || 0) / 100; // Convert to decimal

  } catch (error) {
    console.error('❌ Failed to get discount from database:', error);
    return 0; // Default to no discount if error
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clear hotel cache (call after admin updates)
 */
export function clearHotelCache(): void {
  hotelCache = null;
  console.log('🔄 Hotel cache cleared');
}

/**
 * Admin function: Get all hotels (including inactive) for management
 */
export async function getAllHotelsForAdmin(): Promise<Hotel[]> {
  try {
    const dbHotels = await prisma.hotel.findMany({
      include: { 
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: [
        { active: 'desc' }, // Active hotels first
        { city: 'asc' },
        { name: 'asc' }
      ]
    });

    return dbHotels.map(dbHotel => ({
      id: dbHotel.slug,
      name: dbHotel.name,
      city: dbHotel.city,
      type: dbHotel.type,
      basePriceNGN: dbHotel.shelfPriceNGN,
      stars: dbHotel.stars,
      images: dbHotel.images.map(img => img.url),
      discountPercent: (dbHotel.discountRatePct || 0) / 100,
      negotiationEnabled: dbHotel.negotiationEnabled,
      negotiationMinPct: dbHotel.negotiationMinPct || 5,
      negotiationMaxPct: dbHotel.negotiationMaxPct || 50,
      active: dbHotel.active
    }));

  } catch (error) {
    console.error('❌ Failed to load hotels for admin:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check database connection and data status
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  hotelCount: number;
  activeHotelCount: number;
  lastUpdated?: string;
}> {
  try {
    const totalCount = await prisma.hotel.count();
    const activeCount = await prisma.hotel.count({
      where: { active: true }
    });
    
    const lastUpdated = await prisma.hotel.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    return {
      connected: true,
      hotelCount: totalCount,
      activeHotelCount: activeCount,
      lastUpdated: lastUpdated?.updatedAt.toISOString()
    };

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return {
      connected: false,
      hotelCount: 0,
      activeHotelCount: 0
    };
  } finally {
    await prisma.$disconnect();
  }
}