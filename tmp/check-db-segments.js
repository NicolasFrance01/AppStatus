
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function checkSegments() {
  const apps = await prisma.firebaseApp.findMany({
    select: { segment: true, name: true, bank: true }
  });
  
  console.log('FirebaseApp Segments:');
  apps.forEach(a => {
    console.log(`- App: ${a.name} | Bank: ${a.bank} | Segment: '${a.segment}'`);
  });
}

checkSegments()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
