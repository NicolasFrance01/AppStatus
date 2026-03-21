const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    console.log("--- SYSTEM CONFIG ---");
    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    console.log(JSON.stringify(config, null, 2));

    console.log("\n--- LAST 10 SYNC HISTORY ---");
    const history = await prisma.syncHistory.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10
    });
    console.log(JSON.stringify(history, null, 2));

    console.log("\n--- RECENT ALERTS (Last 24h) ---");
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const alerts = await prisma.alert.findMany({
      where: { createdAt: { gte: yesterday } },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log(JSON.stringify(alerts, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
