import { requireAdmin } from '@/lib/auth-guard';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // 1. Admin authorization (checks session email against Admin table)
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  // 2. Parallel database queries
  const [unreadCount, projectsCount] = await Promise.all([
    prisma.contactMessage.count({
      where: { isRead: false },
    }),
    prisma.project.count({
      where: { visible: true },
    }),
  ]);

  return <DashboardClient unreadCount={unreadCount} projectsCount={projectsCount} />;
}
