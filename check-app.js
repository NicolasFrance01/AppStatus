const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const apps = await prisma.app.findMany({
      where: { bundleId: 'com.empresasbsf.mobile' }
    });
    console.log(JSON.stringify(apps, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
