import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import AboutForm from './AboutForm';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { UserCircle } from 'lucide-react';

export default async function AdminAboutPage() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  // Next.js cache bypass if necessary or let standard caching operate
  const aboutMe = await prisma.aboutMe.findFirst({
    include: { techs: { orderBy: { order: 'asc' } } },
  });

  const initialData = {
    bio: aboutMe?.bio || '',
    stats: (aboutMe?.stats as { value: string; label: string }[]) || [],
    techs: aboutMe?.techs || [],
  };

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
      <div className="mx-auto max-w-7xl w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
              aria-label="Retour au tableau de bord"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                <UserCircle className="text-brand-500" />
                Section À propos
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Modifiez le contenu de votre section de présentation
              </p>
            </div>
          </div>
        </div>

        <AboutForm initialData={initialData} />
      </div>
    </section>
  );
}
