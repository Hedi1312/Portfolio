import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const ProjectsClient = dynamic(() => import('./ProjectsClient'), { ssr: false });

export default async function AdminProjectsPage() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  // Fetch all projects, their nested skills, and sorted images
  const projects = await prisma.project.findMany({
    include: {
      skills: true,
      images: { orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  });

  // Serialize to handle Next.js Server->Client boundaries gracefully (especially Dates)
  const serializedProjects = JSON.parse(JSON.stringify(projects));

  return <ProjectsClient initialProjects={serializedProjects} />;
}
