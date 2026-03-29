import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  // 1. Vérification session (côté serveur, instantané via JWT/Cookie)
  const session = await auth();
  if (!session) {
    redirect('/admin-login');
  }

  // 2. Requêtes Base de Données ultra rapides (< 10ms) executées en parallèle
  const [unreadCount, projectsCount] = await Promise.all([
    prisma.contactMessage.count({
      where: { isRead: false },
    }),
    prisma.project.count({
      where: { visible: true },
    }),
  ]);

  // 3. Injection dans le Client Component
  return <DashboardClient unreadCount={unreadCount} projectsCount={projectsCount} />;
}
