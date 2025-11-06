// scripts/migrate-hotels-to-database.ts - One-time migration from JSON to database
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
}

interface DiscountData {
  default: number;
  overrides: Record<string, number>;
}

async function migrateHotelsToDatabase() {
  try {
    console.log('🚀 Starting hotel migration from JSON to database...');

    // 1. Load existing JSON data
    const hotelsPath = path.join(process.cwd(), 'lib.hotels.json');
    const discountsPath = path.join(process.cwd(), 'lib', 'discounts.json');
    
    const hotelsData: JsonHotel[] = JSON.parse(await fs.readFile(hotelsPath, 'utf8'));
    const discountsData: DiscountData = JSON.parse(await fs.readFile(discountsPath, 'utf8'));

    console.log(`📊 Found ${hotelsData.length} hotels to migrate`);

    // 2. Clear existing data
    console.log('🗑️  Clearing existing database data...');
    await prisma.hotelImage.deleteMany({});
    await prisma.hotel.deleteMany({});

    // 3. Migrate hotels in batches
    let migratedCount = 0;
    const batchSize = 50;

    for (let i = 0; i < hotelsData.length; i += batchSize) {
      const batch = hotelsData.slice(i, i + batchSize);
      
      for (const hotel of batch) {
        try {
          // Get discount rate for this hotel
          const discountRate = discountsData.overrides[hotel.id] || discountsData.default;
          const discountPct = Math.round(discountRate * 100); // Convert 0.15 to 15

          // Create hotel record
          const createdHotel = await prisma.hotel.create({
            data: {
              slug: hotel.id,
              name: hotel.name,
              city: hotel.city as any, // Enum conversion
              type: hotel.type as any, // Enum conversion  
              stars: hotel.stars || 3,
              shelfPriceNGN: hotel.basePriceNGN,
              discountRatePct: discountPct,
              negotiationEnabled: discountPct > 0,
              negotiationMinPct: 5,
              negotiationMaxPct: Math.min(discountPct + 10, 90),
              active: true,
            }
          });

          // Migrate images if they exist
          if (hotel.images && hotel.images.length > 0) {
            await Promise.all(
              hotel.images.map((url: string, index: number) => 
                prisma.hotelImage.create({
                  data: {
                    hotelId: createdHotel.id,
                    url,
                    sortOrder: index
                  }
                })
              )
            );
          }

          migratedCount++;
          
          if (migratedCount % 25 === 0) {
            console.log(`✅ Migrated ${migratedCount}/${hotelsData.length} hotels`);
          }

        } catch (error) {
          console.error(`❌ Failed to migrate hotel ${hotel.id}:`, error);
        }
      }
    }

    // 4. Validation
    const dbHotelCount = await prisma.hotel.count();
    const activeHotelCount = await prisma.hotel.count({ where: { active: true } });

    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 JSON Hotels: ${hotelsData.length}`);
    console.log(`📊 DB Hotels: ${dbHotelCount}`);
    console.log(`📊 Active Hotels: ${activeHotelCount}`);
    
    if (dbHotelCount === hotelsData.length) {
      console.log(`✅ Perfect migration - all hotels transferred successfully!`);
    } else {
      console.log(`⚠️ ${hotelsData.length - dbHotelCount} hotels may have failed to migrate`);
    }

    return {
      success: true,
      migratedCount: dbHotelCount,
      activeCount: activeHotelCount,
      totalExpected: hotelsData.length
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateHotelsToDatabase()
    .then((result) => {
      console.log('\n📋 Migration Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateHotelsToDatabase };