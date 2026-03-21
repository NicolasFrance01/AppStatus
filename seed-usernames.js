const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { username: null } });
  for (const user of users) {
    const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    let username = `@${baseUsername}`;
    let counter = 1;
    while (true) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (!existing) {
        break;
      }
      username = `@${baseUsername}${counter}`;
      counter++;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { username }
    });
    console.log(`Updated user ${user.email} with username ${username}`);
  }
  console.log("Finished seeding usernames.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
