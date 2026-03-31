import Accueil from './sections/Accueil';
import APropos, { AboutData } from './sections/APropos';
import MesProjets from './sections/MesProjets';
import NextSteps from './sections/NextSteps';
import { prisma } from '@/lib/prisma';

/**
 * Server Component — fetches all public data at the page level,
 * eliminating client-side fetch waterfalls and ensuring content is
 * present in the initial HTML for SEO.
 */
export default async function Home() {
  // Parallel data fetching — no waterfall
  const [projects, aboutData, cvData] = await Promise.all([
    prisma.project
      .findMany({
        where: { visible: true },
        include: {
          skills: true,
          images: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      })
      .catch(() => []),

    prisma.aboutMe
      .findFirst({
        include: { techs: { orderBy: { order: 'asc' } } },
      })
      .catch(() => null),

    prisma.cv.findFirst({ orderBy: { createdAt: 'desc' } }).catch(() => null),
  ]);

  const cvUrl = cvData?.url || null;

  return (
    <>
      <Accueil />
      <APropos data={aboutData as unknown as AboutData} />
      <MesProjets projects={projects} />
      <NextSteps cvUrl={cvUrl} />
    </>
  );
}
