
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function checkCounts() {
  const aCount = await prisma.firebaseApp.count();
  const rCount = await prisma.firebaseRelease.count();
  console.log(`Current DB State: ${aCount} apps, ${rCount} releases.`);
}

checkCounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
