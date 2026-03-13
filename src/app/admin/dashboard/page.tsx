'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Trophy,
  Ticket,
  LogOut,
  CirclePlus,
  BellRing,
  LoaderPinwheel,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin-login' });
  };

  const actions = [
    {
      title: 'Modifier mon CV',
      description: 'Consultez la liste des tickets déjà achetés',
      icon: <Ticket className="h-8 w-8 text-danger-500" />,
      onClick: () => router.push('/admin/cv'),
    },
    {
      title: 'Créer des tickets',
      description: "Créer des tickets à partir des infos de l'acheteur",
      icon: <CirclePlus className="h-8 w-8 text-success-600" />,
      onClick: () => router.push('/admin/creer-ticket'),
    },
    {
      title: 'Déterminer les gagnants',
      description:
        'Choisir le nombre de gagnants, les ajouter aléatoirement et leur envoyer un email',
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      onClick: () => router.push('/admin/choix-gagnant'),
    },
    {
      title: 'Roue de la chance',
      description: 'Modifier le taux de victoire de la roue et afficher la liste des participants',
      icon: <LoaderPinwheel className="h-8 w-8 text-success-600" />,
      onClick: () => router.push('/admin/roue-probabilite'),
    },
    {
      title: 'Choisir la date du tirage',
      description: 'Modifiez la date prévue pour le prochain tirage',
      icon: <CalendarDays className="h-8 w-8 text-indigo-600" />,
      onClick: () => router.push('/admin/choix-date'),
    },
    {
      title: 'Prévenir les participants',
      description: 'Envoyer un email aux participants inscrits que le tirage a eu lieu',
      icon: <BellRing className="h-8 w-8 text-yellow-500" />,
      onClick: () => router.push('/admin/envoyer-notifications'),
    },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-background transition-colors duration-300">
      <div className="mx-auto max-w-5xl w-full mb-12 mt-20">
        {/* Titre + bouton logout */}
        <div className="flex flex-col items-center lg:flex-row lg:justify-center lg:gap-4 mb-10 w-full relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white text-center">
            👨🏻‍💻 Espace Admin
          </h1>
          <button
            onClick={handleLogout}
            className="mt-4 lg:absolute lg:right-0 flex items-center gap-2 rounded-lg border border-danger-500 bg-white dark:bg-neutral-800 px-4 py-2 font-medium text-danger-500 transition-colors hover:bg-danger-600 hover:text-white cursor-pointer shadow-sm"
          >
            <LogOut className="h-5 w-5" /> Déconnexion
          </button>
        </div>

        {/* Actions grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <div
              key={index}
              onClick={action.onClick}
              className="cursor-pointer rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md dark:shadow-xl transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_0_15px_rgba(0,187,167,0.15)] group"
            >
              <div className="flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700/50 p-4 transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700">
                {action.icon}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                {action.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
