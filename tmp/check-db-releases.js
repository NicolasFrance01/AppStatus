
const prisma = require('../src/lib/db');

async function checkDb() {
    const releases = await prisma.firebaseRelease.findMany({
        include: { app: true },
        orderBy: { displayDate: 'desc' },
        take: 10
    });
    
    console.log('Last 10 Firebase Releases in DB:');
    releases.forEach(r => {
        console.log(`- ${r.app.name} (${r.app.platform}): ${r.version} (${r.buildNumber})`);
        console.log(`  Inv: ${r.invitedCount}, Acc: ${r.acceptedCount}, Down: ${r.downloadedCount}`);
    });
}

checkDb().catch(console.error);
