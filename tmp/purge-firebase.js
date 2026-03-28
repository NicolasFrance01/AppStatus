
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function purgeFirebase() {
  console.log('Purging all Firebase data...');
  const rCount = await prisma.firebaseRelease.deleteMany({});
  const aCount = await prisma.firebaseApp.deleteMany({});
  console.log(`Deleted ${rCount.count} releases and ${aCount.count} apps.`);
  console.log('Database is now clean of Firebase data.');
}

purgeFirebase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
