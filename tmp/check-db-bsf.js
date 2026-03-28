
const { PrismaClient } = require('../src/generated/client/index.js');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching BSF Banca Empresas releases from DB...');
  const releases = await prisma.firebaseRelease.findMany({
    where: {
      app: {
        name: 'BSF Banca Empresas',
        platform: 'ANDROID'
      }
    },
    orderBy: {
      displayDate: 'desc'
    }
  });

  releases.forEach(r => {
    console.log(`Version: ${r.version} (${r.buildNumber}), Invited: ${r.invitedCount}, Accepted: ${r.acceptedCount}, Downloaded: ${r.downloadedCount}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
