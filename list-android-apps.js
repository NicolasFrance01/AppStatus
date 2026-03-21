const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const apps = await prisma.app.findMany({
      where: { platform: 'ANDROID' },
      select: { name: true, bundleId: true, status: true, currentVersion: true, updateStatus: true }
    });
    console.log(JSON.stringify(apps, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
