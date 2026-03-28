
const { syncFirebaseApp } = require('../src/lib/sync/firebase');
const prisma = require('../src/lib/db');

async function testSync() {
  const appId = '1:4555542864:android:29778052bea6fb28885c55';
  
  // Find or create the app in our DB first
  let dbApp = await prisma.firebaseApp.findFirst({
    where: { firebaseAppId: appId }
  });
  
  if (!dbApp) {
    console.log('App not found in DB. Creating mock entry for sync test...');
    dbApp = await prisma.firebaseApp.create({
      data: {
        firebaseAppId: appId,
        name: 'BSF Banca Empresas',
        platform: 'ANDROID',
        bank: 'Banco Santa Fe'
      }
    });
  }

  console.log(`Starting sync for ${dbApp.name}...`);
  await syncFirebaseApp(dbApp.id);
  console.log('Sync finished.');

  const releases = await prisma.firebaseRelease.findMany({
    where: { firebaseAppId: dbApp.id },
    orderBy: { displayDate: 'desc' },
    take: 5
  });

  console.log('\nLast 5 Releases in DB:');
  console.log(JSON.stringify(releases, null, 2));
}

testSync().catch(console.error);
