const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const app = await prisma.app.findUnique({
      where: { id: '07e3853e-f7c5-4edd-997b-278ca8909eba' }
    });
    console.log(JSON.stringify(app, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
