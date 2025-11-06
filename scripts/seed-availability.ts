// scripts/seed-availability.ts - Populate availability data for testing
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAvailability() {
  try {
    console.log('🌱 Seeding availability data...')

    // Get all hotels (use slug as hotelId for availability)
    const hotels = await prisma.hotel.findMany({
      select: { id: true, slug: true, name: true, city: true }
    })

    if (hotels.length === 0) {
      console.log('❌ No hotels found. Please seed hotels first.')
      return
    }

    console.log(`📍 Found ${hotels.length} hotels to seed availability for`)

    // Generate availability for next 90 days
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(startDate.getDate() + 90)

    const availabilityRecords = []

    for (const hotel of hotels) {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        // Generate realistic availability patterns
        const isWeekend = d.getDay() === 0 || d.getDay() === 6
        const isHoliday = isHolidayPeriod(d)
        
        // Base availability varies by hotel location and type
        let baseRooms = getBaseRoomsForCity(hotel.city)
        
        // Reduce availability on weekends and holidays
        if (isWeekend) baseRooms = Math.floor(baseRooms * 0.7)
        if (isHoliday) baseRooms = Math.floor(baseRooms * 0.4)
        
        // Add some randomization (±20%)
        const randomFactor = 0.8 + Math.random() * 0.4
        const roomsAvailable = Math.max(0, Math.floor(baseRooms * randomFactor))

        availabilityRecords.push({
          hotelId: hotel.id, // Use database ID for foreign key constraint
          date: new Date(d),
          roomsAvailable
        })
      }
    }

    console.log(`📅 Generated ${availabilityRecords.length} availability records`)

    // Batch insert availability records
    const batchSize = 1000
    let inserted = 0

    for (let i = 0; i < availabilityRecords.length; i += batchSize) {
      const batch = availabilityRecords.slice(i, i + batchSize)
      
      await prisma.availability.createMany({
        data: batch,
        skipDuplicates: true
      })
      
      inserted += batch.length
      console.log(`📊 Inserted ${inserted}/${availabilityRecords.length} records`)
    }

    console.log('✅ Availability seeding completed successfully')

    // Show summary by city
    const summary = await prisma.availability.groupBy({
      by: ['hotelId'],
      _avg: {
        roomsAvailable: true
      },
      _count: {
        id: true
      }
    })

    console.log(`📈 Summary: ${summary.length} hotels with availability data`)

  } catch (error) {
    console.error('❌ Error seeding availability:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getBaseRoomsForCity(city: string): number {
  // Base room counts by city (simulating different hotel sizes)
  const cityBases = {
    'Lagos': 45,      // Larger hotels in commercial hub
    'Abuja': 35,      // Government/business hotels
    'PortHarcourt': 30, // Mid-size hotels
    'Owerri': 25      // Smaller regional hotels
  }
  
  return cityBases[city as keyof typeof cityBases] || 30
}

function isHolidayPeriod(date: Date): boolean {
  // Nigerian holiday periods (simplified)
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // New Year period
  if (month === 1 && day <= 2) return true
  
  // Independence Day
  if (month === 10 && day === 1) return true
  
  // Christmas/New Year period
  if (month === 12 && day >= 20) return true
  
  // Eid periods (approximate - would need proper Islamic calendar)
  if (month === 4 && day >= 20 && day <= 25) return true
  if (month === 6 && day >= 25 && day <= 30) return true
  
  return false
}

// Run seeder if called directly
if (require.main === module) {
  seedAvailability()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export { seedAvailability }