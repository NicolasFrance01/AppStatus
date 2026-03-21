const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("--- APP STATUSES ---");
    const apps = await prisma.app.findMany({
      select: {
          id: true,
          name: true,
          platform: true,
          status: true,
          currentVersion: true,
          lastUpdate: true
      }
    });
    console.table(apps);

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
