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

  // ─── Section « À propos » ────────────────────────────
  const existingAbout = await prisma.aboutMe.findFirst();

  if (!existingAbout) {
    const _aboutMe = await prisma.aboutMe.create({
      data: {
        bio: "Je suis un développeur front-end, passionné par la création d'interfaces élégantes et performantes. J'aime transformer des idées en expériences concrètes avec un soin particulier pour le design et la performance.\n\nMon objectif : concevoir des applications web qui allient esthétique soignée, code propre et expérience utilisateur fluide. Chaque projet est une occasion d'apprendre et de repousser mes limites.",
        stats: [
          { value: '3+', label: 'Projets réalisés' },
          { value: '1+', label: "Année d'expérience" },
          { value: '∞', label: 'Motivation' },
        ],
        techs: {
          create: [
            { name: 'React', icon: 'react', color: '#61DAFB', order: 0 },
            { name: 'Next.js', icon: 'nextjs', color: '#ffffff', order: 1 },
            { name: 'TypeScript', icon: 'typescript', color: '#3178C6', order: 2 },
            { name: 'Tailwind CSS', icon: 'tailwindcss', color: '#06B6D4', order: 3 },
            { name: 'Node.js', icon: 'nodejs', color: '#339933', order: 4 },
            { name: 'Docker', icon: 'docker', color: '#2496ED', order: 5 },
            { name: 'Prisma', icon: 'prisma', color: '#5A67D8', order: 6 },
            { name: 'Git', icon: 'git', color: '#F05032', order: 7 },
          ],
        },
      },
    });
  } else {
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (_e) => {
    await prisma.$disconnect();
    process.exit(1);
  });
