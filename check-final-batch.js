const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const apps = await prisma.app.findMany({
      where: { name: { in: ['SF Empresas', 'BSC Empresas'] }, platform: 'ANDROID' }
    });
    console.log(JSON.stringify(apps, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
