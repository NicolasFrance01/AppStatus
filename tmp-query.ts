import { PrismaClient } from './src/generated/client/index.js';
const prisma = new PrismaClient();

async function main() {
  const apps = await prisma.app.findMany();
  console.log("All Apps in DB:");
  apps.forEach(a => {
    console.log(`- ID: ${a.id}`);
    console.log(`  Name: ${a.name}`);
    console.log(`  Entity: ${a.entity}`);
    console.log(`  Bundle: ${a.bundleId}`);
    console.log(`  Platform: ${a.platform}`);
    console.log(`  Version: ${a.currentVersion}`);
  });
}
main().finally(() => prisma.$disconnect());
