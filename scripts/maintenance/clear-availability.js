const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Clearing existing availability data...');
    const deleted = await prisma.availability.deleteMany({});
    console.log(`Deleted availability records`);
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

main();