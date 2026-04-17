// Seed script for all bank apps
// Run with: node --env-file=.env seed-all.mjs

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const apps = [
  // BER
  { name: 'APP Banco Entre Ríos', entity: 'Banco Entre Ríos', bundleId: 'com.bancoentrerios.mobile', platform: 'IOS', status: 'PENDING_REVIEW' },
  { name: 'BER Empresas', entity: 'Banco Entre Ríos', bundleId: 'com.empresasber.mobile', platform: 'IOS', status: 'PENDING_REVIEW' },
  { name: 'APP Banco Entre Ríos', entity: 'Banco Entre Ríos', bundleId: 'com.bancoentrerios.mobile', platform: 'ANDROID', status: 'PENDING_REVIEW' },
  { name: 'BER Empresas', entity: 'Banco Entre Ríos', bundleId: 'com.empresasber.mobile', platform: 'ANDROID', status: 'PENDING_REVIEW' },
  // BSC
  { name: 'APP Banco Santa Cruz', entity: 'Banco Santa Cruz', bundleId: 'com.bancosantacruz.mobile', platform: 'IOS', status: 'PENDING_REVIEW' },
  { name: 'BSC Empresas', entity: 'Banco Santa Cruz', bundleId: 'com.empresasbsc.mobile', platform: 'IOS', status: 'PENDING_REVIEW' },
  { name: 'APP Banco Santa Cruz', entity: 'Banco Santa Cruz', bundleId: 'com.bancosantacruz.mobile', platform: 'ANDROID', status: 'PENDING_REVIEW' },
  { name: 'BSC Empresas', entity: 'Banco Santa Cruz', bundleId: 'com.empresasbsc.mobile', platform: 'ANDROID', status: 'PENDING_REVIEW' },
];

console.log('Seeding BER and BSC apps...');

for (const app of apps) {
  await prisma.app.upsert({
    where: { 
      bundleId_platform: { 
        bundleId: app.bundleId, 
        platform: app.platform 
      } 
    },
    update: { entity: app.entity, name: app.name },
    create: app
  });
  console.log(`  - ${app.name} (${app.platform}) [${app.bundleId}]`);
}

await prisma.$disconnect();
console.log('\n✅ Seeding complete');
