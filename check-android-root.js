const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const app = await prisma.app.findUnique({
      where: { id: 'b900696e-e274-4932-9ca3-8d93b190756d' }
    });
    console.log(JSON.stringify(app, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
