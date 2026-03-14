'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Ticket, Mail } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/admin/messages/unread-count')
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.count || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin-login' });
  };

  const actions = [
    {
      title: 'Modifier mon CV',
      description: 'Mets à jour ton CV en uploadant un nouveau fichier PDF.',
      icon: <Ticket className="h-8 w-8 text-brand-500" />,
      onClick: () => router.push('/admin/cv'),
    },
    {
      title: 'Messages reçus',
      description: 'Consulte et réponds aux messages reçus depuis le formulaire de contact.',
      icon: <Mail className="h-8 w-8 text-brand-500" />,
      onClick: () => router.push('/admin/messages'),
      badge: unreadCount,
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
        <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              onClick={action.onClick}
              className="cursor-pointer rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-6 shadow-md dark:shadow-xl transition-all hover:-translate-y-1 hover:border-brand-500 hover:shadow-[0_0_15px_rgba(0,187,167,0.15)] group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <div className="flex items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700/50 p-4 transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 relative">
                {action.icon}
                {'badge' in action && action.badge !== undefined && action.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                    {action.badge > 99 ? '99+' : action.badge}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                {action.title}
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {action.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
