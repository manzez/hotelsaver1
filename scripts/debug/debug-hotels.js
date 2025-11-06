const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking hotel records in database...');
    
    const hotels = await prisma.hotel.findMany({
      take: 5
    });
    
    console.log('\nFirst 5 hotel records:');
    hotels.forEach(hotel => {
      console.log(`DB ID: ${hotel.id}`);
      console.log(`Name: ${hotel.name}`);
      console.log(`Original ID: ${hotel.originalId || 'NOT SET'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();