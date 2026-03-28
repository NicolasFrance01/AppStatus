
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function inspectBSF() {
  const apps = await prisma.firebaseApp.findMany({
    where: { bank: 'Banco Santa Fe' },
    include: { releases: { orderBy: { displayDate: 'desc' }, take: 5 } }
  });
  
  console.log('BSF FirebaseApps:');
  apps.forEach(a => {
    console.log(`\nApp: ${a.name} (ID: ${a.id})`);
    console.log(`- FirebaseAppId: ${a.firebaseAppId}`);
    console.log(`- Segment: ${a.segment}`);
    console.log(`- BundleId: ${a.bundleId}`);
    console.log(`- Platform: ${a.platform}`);
    console.log(`- Releases:`);
    a.releases.forEach(r => {
      console.log(`  * v${r.version} (${r.buildNumber}) - Date: ${r.displayDate.toISOString()}`);
    });
  });
}

inspectBSF()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
