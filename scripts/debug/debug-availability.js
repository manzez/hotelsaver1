const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking availability data...');
    
    const total = await prisma.availability.count();
    console.log(`Total availability records: ${total}`);
    
    // Check what hotel IDs we actually have
    const hotelIds = await prisma.availability.findMany({
      distinct: ['hotelId'],
      select: { hotelId: true },
      take: 10
    });
    
    console.log('\nFirst 10 hotel IDs in availability data:');
    hotelIds.forEach(h => console.log(h.hotelId));
    
    // Use the first available hotel ID
    const firstHotelId = hotelIds[0]?.hotelId;
    if (!firstHotelId) {
      console.log('No hotel data found!');
      return;
    }
    
    console.log(`\nUsing hotel ID: ${firstHotelId}`);
    
    const sample = await prisma.availability.findMany({
      where: { hotelId: firstHotelId },
      orderBy: { date: 'asc' },
      take: 5
    });
    
    console.log(`\nSample availability records for ${firstHotelId}:`);
    sample.forEach(record => {
      console.log(`${record.date.toISOString().split('T')[0]}: ${record.roomsAvailable} rooms`);
    });
    
    // Check what date range our data actually covers
    const dateRange = await prisma.availability.aggregate({
      where: { hotelId: firstHotelId },
      _min: { date: true },
      _max: { date: true }
    });
    
    console.log(`\nDate range coverage for ${firstHotelId}:`);
    console.log(`From: ${dateRange._min.date?.toISOString().split('T')[0]}`);
    console.log(`To: ${dateRange._max.date?.toISOString().split('T')[0]}`);
    
    // Check the specific date range being searched (Nov 5-7, 2025)
    const specificRange = await prisma.availability.findMany({
      where: {
        hotelId: firstHotelId,
        date: {
          gte: new Date('2025-11-05'),
          lt: new Date('2025-11-07')
        }
      },
      orderBy: { date: 'asc' }
    });
    
    console.log('\nAvailability for Nov 5-7, 2025:');
    if (specificRange.length === 0) {
      console.log('NO DATA FOUND for this date range!');
      console.log('This explains the "Limited availability data" message.');
    } else {
      specificRange.forEach(record => {
        console.log(`${record.date.toISOString().split('T')[0]}: ${record.roomsAvailable} rooms`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();