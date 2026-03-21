const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const history = await prisma.syncHistory.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5
    });
    console.log(JSON.stringify(history, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
