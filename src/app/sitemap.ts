import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Revalidate every hour instead of force-dynamic on every request
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Last modified date based on newest content
  const [lastProject, lastAbout] = await Promise.all([
    prisma.project
      .findFirst({
        where: { visible: true },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      })
      .catch(() => null),
    prisma.aboutMe
      .findFirst({
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true },
      })
      .catch(() => null),
  ]);

  const lastModified = new Date(
    Math.max(
      lastProject?.updatedAt?.getTime() || 0,
      lastAbout?.updatedAt?.getTime() || 0,
      Date.now() - 7 * 86_400_000, // fallback: 7 days ago
    ),
  );

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
