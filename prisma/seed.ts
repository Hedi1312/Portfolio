import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = 'admin@test.fr';
  const hashedPassword = await bcrypt.hash('Test1010!', 10);

  console.log('🌱 Seeding en cours...');

  await prisma.admin.upsert({
    where: { email: email },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: email,
      passwordHash: hashedPassword,
    },
  });

  console.log(`✅ Admin créé : ${email}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erreur de seeding :', e);
    await prisma.$disconnect();
    process.exit(1);
  });
