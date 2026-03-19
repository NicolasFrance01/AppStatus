import { PrismaClient } from '../generated/client';

const prismaClientSingleton = () => {
  console.log("[Prisma] Initializing new PrismaClient instance...");
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

console.log("[Prisma] Models available:", Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')));

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
