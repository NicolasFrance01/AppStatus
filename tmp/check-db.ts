
import prisma from '../src/lib/db';

async function checkDatabase() {
  console.log('--- Current BSF Releases in DB ---');
  const releases = await prisma.firebaseRelease.findMany({
    where: {
      app: {
        bank: 'Banco Santa Fe'
      }
    },
    include: {
      app: true
    },
    orderBy: {
      displayDate: 'desc'
    },
    take: 10
  });

  releases.forEach(r => {
    console.log(`App: ${r.app.name} (${r.app.platform}) | Ver: ${r.version} (${r.buildNumber}) | Invited: ${r.invitedCount}`);
  });
}

checkDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
