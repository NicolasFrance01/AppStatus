
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function checkAllSegments() {
  const apps = await prisma.firebaseApp.findMany({
    select: { segment: true, name: true, bank: true, platform: true }
  });
  
  console.log('FirebaseApp Segments (All):');
  apps.forEach(a => {
    console.log(`- App: ${a.name} | Bank: ${a.bank} | Platform: ${a.platform} | Segment: '${a.segment}'`);
  });
}

checkAllSegments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
