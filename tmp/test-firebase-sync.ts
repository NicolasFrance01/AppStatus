import { syncFirebaseApp, syncAllFirebaseApps } from '../src/lib/sync/firebase';
import prisma from '../src/lib/db';
import dotenv from 'dotenv';

dotenv.config();

async function testSync() {
  console.log('Testing Full Firebase Sync...');
  
  await syncAllFirebaseApps();
  
  const totalReleases = await prisma.firebaseRelease.count();
  console.log(`Full sync finished. Total releases in DB: ${totalReleases}`);
}

testSync()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
