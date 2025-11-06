// lib/hotel-data-service.ts - Hybrid hotel data service (Database + JSON fallback)
import { PrismaClient } from '@prisma/client';
import { getHotelsOptimized, getHotelByIdOptimized } from './hotel-data-optimized';

const prisma = new PrismaClient();

// Configuration flag to enable/disable database reads
const USE_DATABASE = process.env.USE_DATABASE_FOR_HOTELS === 'true';

export interface Hotel {
  id: string;
  name: string;
  city: string;
  type: string;
  basePriceNGN: number;
  stars: number;
  images: string[];
  discountPercent?: number;
  negotiationEnabled?: boolean;
  active?: boolean;
  roomTypes?: Array<{
    id: string;
    name: string;
    basePriceNGN: number;
    discountPercent: number;
  }>;
}

/**
 * Get all hotels with hybrid fallback strategy
 * 1. Try database first (if enabled)
 * 2. Fall back to JSON if database fails
 */
export async function getHotels(): Promise<Hotel[]> {
  if (USE_DATABASE) {
    try {
      console.log('📊 Fetching hotels from database...');
      
      const dbHotels = await prisma.hotel.findMany({
        where: { active: true },
        include: { images: true },
        orderBy: [
          { city: 'asc' },
          { name: 'asc' }
        ]
      });

      const hotels = dbHotels.map(dbHotel => ({
        id: dbHotel.slug,
        name: dbHotel.name,
        city: dbHotel.city,
        type: dbHotel.type,
        basePriceNGN: dbHotel.shelfPriceNGN,
        stars: dbHotel.stars,
        images: dbHotel.images.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url),
        discountPercent: dbHotel.discountRatePct ? dbHotel.discountRatePct / 100 : undefined,
        negotiationEnabled: dbHotel.negotiationEnabled,
        active: dbHotel.active
      }));

      console.log(`✅ Loaded ${hotels.length} hotels from database`);
      return hotels;

    } catch (error) {
      console.error('❌ Database read failed, falling back to JSON:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  // Fallback to JSON
  console.log('📁 Falling back to JSON hotel data...');
  return await getHotelsOptimized();
}

/**
 * Get single hotel by ID with hybrid fallback
 */
export async function getHotelById(hotelId: string): Promise<Hotel | null> {
  if (USE_DATABASE) {
    try {
      const dbHotel = await prisma.hotel.findUnique({
        where: { slug: hotelId, active: true },
        include: { images: true }
      });

      if (dbHotel) {
        return {
          id: dbHotel.slug,
          name: dbHotel.name,
          city: dbHotel.city,
          type: dbHotel.type,
          basePriceNGN: dbHotel.shelfPriceNGN,
          stars: dbHotel.stars,
          images: dbHotel.images.sort((a, b) => a.sortOrder - b.sortOrder).map(img => img.url),
          discountPercent: dbHotel.discountRatePct ? dbHotel.discountRatePct / 100 : undefined,
          negotiationEnabled: dbHotel.negotiationEnabled,
          active: dbHotel.active
        };
      }
    } catch (error) {
      console.error('Database read failed for hotel', hotelId, error);
    } finally {
      await prisma.$disconnect();
    }
  }

  // Fallback to JSON
  return await getHotelByIdOptimized(hotelId);
}

/**
 * Get hotels by city with price filtering
 */
export async function searchHotels(params: {
  city?: string;
  budget?: string;
  limit?: number;
}): Promise<Hotel[]> {
  const hotels = await getHotels();
  let filtered = hotels;

  // Apply city filter
  if (params.city) {
    filtered = filtered.filter(hotel => 
      hotel.city.toLowerCase() === params.city!.toLowerCase()
    );
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
    filtered = filtered.filter(hotel => {
      const price = hotel.basePriceNGN || 0;
      return price >= min && price <= max;
    });
  }

  // Limit results
  return filtered.slice(0, params.limit || 50);
}

/**
 * Get discount for hotel (hybrid approach)
 */
export async function getHotelDiscount(hotelId: string): Promise<number> {
  if (USE_DATABASE) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { slug: hotelId },
        select: { discountRatePct: true }
      });

      if (hotel && hotel.discountRatePct) {
        return hotel.discountRatePct / 100; // Convert percentage to decimal
      }
    } catch (error) {
      console.error('Failed to get discount from database:', error);
    } finally {
      await prisma.$disconnect();
    }
  }

  // Fallback to JSON-based discount system
  const { getDiscountForAsync } = await import('./discounts-server');
  return await getDiscountForAsync(hotelId);
}

/**
 * Admin function: Sync JSON data to database
 */
export async function syncJsonToDatabase(): Promise<{ success: boolean; migrated: number; errors: number }> {
  try {
    console.log('🔄 Starting JSON to database sync...');
    
    const jsonHotels = await getHotelsOptimized();
    const { getDiscountForAsync } = await import('./discounts-server');
    
    let migrated = 0;
    let errors = 0;

    for (const jsonHotel of jsonHotels) {
      try {
        const discount = await getDiscountForAsync(jsonHotel.id);
        const discountPct = Math.round(discount * 100);

        await prisma.hotel.upsert({
          where: { slug: jsonHotel.id },
          update: {
            name: jsonHotel.name,
            city: jsonHotel.city as any,
            type: jsonHotel.type as any,
            stars: jsonHotel.stars,
            shelfPriceNGN: jsonHotel.basePriceNGN,
            discountRatePct: discountPct,
            negotiationEnabled: discount > 0,
            active: true
          },
          create: {
            slug: jsonHotel.id,
            name: jsonHotel.name,
            city: jsonHotel.city as any,
            type: jsonHotel.type as any,
            stars: jsonHotel.stars,
            shelfPriceNGN: jsonHotel.basePriceNGN,
            discountRatePct: discountPct,
            negotiationEnabled: discount > 0,
            negotiationMinPct: 5,
            negotiationMaxPct: Math.min(discountPct + 10, 90),
            active: true
          }
        });

        // Sync images
        if (jsonHotel.images && jsonHotel.images.length > 0) {
          const hotelRecord = await prisma.hotel.findUnique({
            where: { slug: jsonHotel.id },
            select: { id: true }
          });

          if (hotelRecord) {
            // Clear existing images
            await prisma.hotelImage.deleteMany({
              where: { hotelId: hotelRecord.id }
            });

            // Add new images
            await Promise.all(jsonHotel.images.map((url: string, index: number) =>
              prisma.hotelImage.create({
                data: {
                  hotelId: hotelRecord.id,
                  url,
                  sortOrder: index
                }
              })
            ));
          }
        }

        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`✅ Synced ${migrated}/${jsonHotels.length} hotels`);
        }

      } catch (error) {
        console.error(`Failed to sync hotel ${jsonHotel.id}:`, error);
        errors++;
      }
    }

    console.log(`🎉 Sync complete: ${migrated} migrated, ${errors} errors`);
    return { success: true, migrated, errors };

  } catch (error) {
    console.error('❌ Sync failed:', error);
    return { success: false, migrated: 0, errors: 1 };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check if database has hotel data
 */
export async function checkDatabaseStatus(): Promise<{
  hasData: boolean;
  hotelCount: number;
  lastUpdated?: string;
}> {
  try {
    const hotelCount = await prisma.hotel.count();
    const lastUpdated = await prisma.hotel.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    });

    return {
      hasData: hotelCount > 0,
      hotelCount,
      lastUpdated: lastUpdated?.updatedAt.toISOString()
    };

  } catch (error) {
    console.error('Failed to check database status:', error);
    return { hasData: false, hotelCount: 0 };
  } finally {
    await prisma.$disconnect();
  }
}