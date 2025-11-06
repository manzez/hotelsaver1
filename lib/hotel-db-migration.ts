// lib/hotel-db-migration.ts - Database migration strategy for hotel pricing
import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface JsonHotel {
  id: string;
  name: string;
  city: string;
  type: string;
  basePriceNGN: number;
  stars: number;
  images?: string[];
  roomTypes?: Array<{
    id: string;
    name: string;
    basePriceNGN: number;
    discountPercent: number;
  }>;
}

interface DiscountData {
  default: number;
  overrides: Record<string, number>;
}

export async function migrateHotelsToDatabase() {
  try {
    console.log('🚀 Starting hotel data migration to database...');

    // 1. Load existing JSON data
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    
    const hotelsData: JsonHotel[] = JSON.parse(await fs.readFile(hotelsPath, 'utf8'));
    const discountsData: DiscountData = JSON.parse(await fs.readFile(discountsPath, 'utf8'));

    console.log(`📊 Found ${hotelsData.length} hotels to migrate`);

    // 2. Batch insert hotels with pricing data
    let migratedCount = 0;
    const batchSize = 50;

    for (let i = 0; i < hotelsData.length; i += batchSize) {
      const batch = hotelsData.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (hotel) => {
        // Get discount rate for this hotel
        const discountRate = discountsData.overrides[hotel.id] || discountsData.default;
        const discountPct = Math.round(discountRate * 100); // Convert 0.15 to 15

        try {
          await prisma.hotel.upsert({
            where: { slug: hotel.id },
            update: {
              name: hotel.name,
              city: hotel.city as any, // Enum conversion
              type: hotel.type as any, // Enum conversion
              stars: hotel.stars,
              shelfPriceNGN: hotel.basePriceNGN,
              discountRatePct: discountPct,
              negotiationEnabled: true,
              negotiationMinPct: 5,  // 5% minimum discount
              negotiationMaxPct: Math.min(discountPct + 10, 90), // Up to discount + 10%
              active: true,
            },
            create: {
              slug: hotel.id,
              name: hotel.name,
              city: hotel.city as any,
              type: hotel.type as any,
              stars: hotel.stars,
              shelfPriceNGN: hotel.basePriceNGN,
              discountRatePct: discountPct,
              negotiationEnabled: true,
              negotiationMinPct: 5,
              negotiationMaxPct: Math.min(discountPct + 10, 90),
              active: true,
            }
          });

          // Migrate hotel images
          if (hotel.images && hotel.images.length > 0) {
            // Delete existing images first
            await prisma.hotelImage.deleteMany({
              where: { hotel: { slug: hotel.id } }
            });

            // Create new images
            const hotelRecord = await prisma.hotel.findUnique({
              where: { slug: hotel.id },
              select: { id: true }
            });

            if (hotelRecord) {
              await Promise.all(hotel.images.map((url, index) => 
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

          migratedCount++;
          if (migratedCount % 10 === 0) {
            console.log(`✅ Migrated ${migratedCount}/${hotelsData.length} hotels`);
          }

        } catch (error) {
          console.error(`❌ Failed to migrate hotel ${hotel.id}:`, error);
        }
      }));
    }

    console.log(`🎉 Migration complete! ${migratedCount} hotels migrated successfully`);
    return { success: true, migratedCount };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// Rollback function in case of issues
export async function rollbackMigration() {
  try {
    console.log('🔄 Rolling back database migration...');
    
    await prisma.hotelImage.deleteMany({});
    await prisma.hotel.deleteMany({});
    
    console.log('✅ Rollback complete');
    return { success: true };
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}

// Data integrity check
export async function validateMigration() {
  try {
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const hotelsData: JsonHotel[] = JSON.parse(await fs.readFile(hotelsPath, 'utf8'));
    
    const dbHotels = await prisma.hotel.findMany({
      include: { images: true }
    });

    console.log(`📊 JSON Hotels: ${hotelsData.length}`);
    console.log(`📊 DB Hotels: ${dbHotels.length}`);
    
    const missing = hotelsData.filter(jsonHotel => 
      !dbHotels.find(dbHotel => dbHotel.slug === jsonHotel.id)
    );

    if (missing.length > 0) {
      console.log(`⚠️ Missing hotels in DB: ${missing.length}`);
      console.log(missing.map(h => h.id));
    } else {
      console.log('✅ All hotels successfully migrated');
    }

    return { 
      success: true, 
      jsonCount: hotelsData.length, 
      dbCount: dbHotels.length, 
      missing: missing.length 
    };

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  } finally {
    await prisma.$disconnect();
  }
}