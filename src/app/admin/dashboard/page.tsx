'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LogOut,
  Mail,
  FolderKanban,
  BarChart3,
  Users,
  Eye,
  FileText,
  ArrowRight,
  UserCircle,
} from 'lucide-react';
import { GrDocumentPdf } from 'react-icons/gr';

interface KpiData {
  visitors: number | null;
  pageviews: number | null;
  unread: number;
  projects: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [kpi, setKpi] = useState<KpiData>({
    visitors: null,
    pageviews: null,
    unread: 0,
    projects: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [messagesRes, projectsRes, analyticsRes] = await Promise.allSettled([
        fetch('/api/admin/messages/unread-count'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/analytics?period=7d'),
      ]);

      const unread =
        messagesRes.status === 'fulfilled' && messagesRes.value.ok
          ? (await messagesRes.value.json()).count || 0
          : 0;

      let projectCount = 0;
      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        const projectsData = await projectsRes.value.json();
        const list = projectsData.projects || projectsData;
        projectCount = Array.isArray(list)
          ? list.filter((p: { visible?: boolean }) => p.visible !== false).length
          : 0;
      }

      let visitors: number | null = null;
      let pageviews: number | null = null;
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        const analytics = await analyticsRes.value.json();
        visitors = analytics.stats?.visitors ?? null;
        pageviews = analytics.stats?.pageviews ?? null;
      }

      setKpi({ visitors, pageviews, unread, projects: projectCount });
    } catch {
      // Silently handle, KPIs will show "—"
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin-login' });
  };

  // ─── KPI Cards ─────────────────────────────────────
  const kpis = [
    {
      label: 'Visiteurs',
      value: kpi.visitors,
      subtitle: '7 derniers jours',
      icon: Users,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Pages vues',
      value: kpi.pageviews,
      subtitle: '7 derniers jours',
      icon: Eye,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Messages',
      value: kpi.unread,
      subtitle: 'non lus',
      icon: Mail,
      color: kpi.unread > 0 ? 'text-danger-500' : 'text-emerald-500',
      bg: kpi.unread > 0 ? 'bg-danger-500/10' : 'bg-emerald-500/10',
    },
    {
      label: 'Projets',
      value: kpi.projects,
      subtitle: 'publiés',
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  // ─── Quick Actions ─────────────────────────────────
  const actions = [
    {
      title: 'Messages reçus',
      description:
        kpi.unread > 0
          ? `${kpi.unread} message${kpi.unread > 1 ? 's' : ''} non lu${kpi.unread > 1 ? 's' : ''}`
          : 'Aucun nouveau message',
      icon: <Mail className="h-6 w-6" />,
      href: '/admin/messages',
      accent: 'group-hover:text-indigo-500',
      badge: kpi.unread,
    },
    {
      title: 'Statistiques',
      description: 'Consulte les visites et événements trackés.',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/admin/analytics',
      accent: 'group-hover:text-emerald-500',
    },
    {
      title: 'Modifier mon CV',
      description: 'Upload ou remplace ton CV PDF public.',
      icon: <GrDocumentPdf className="h-6 w-6" />,
      href: '/admin/cv',
      accent: 'group-hover:text-brand-500',
    },
    {
      title: 'Gérer mes projets',
      description: `${kpi.projects} projet${kpi.projects > 1 ? 's' : ''} publié${kpi.projects > 1 ? 's' : ''}`,
      icon: <FolderKanban className="h-6 w-6" />,
      href: '/admin/projects',
      accent: 'group-hover:text-amber-500',
    },
    {
      title: 'Section À propos',
      description: 'Modifie ta présentation et tes technologies.',
      icon: <UserCircle className="h-6 w-6" />,
      href: '/admin/about',
      accent: 'group-hover:text-purple-500',
    },
  ];

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
      <div className="mx-auto max-w-7xl w-full">
        {/* ─── Header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">
              👋 Bienvenue, Hedi
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Voici un résumé de ton espace admin
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-danger-500/30 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm font-medium text-danger-500 transition-all hover:bg-danger-500 hover:text-white hover:border-danger-500 hover:shadow-lg hover:shadow-danger-500/20 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </motion.div>

        {/* ─── KPI Grid ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {kpis.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${item.bg}`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tabular-nums">
                  {loading ? (
                    <span className="inline-block w-12 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                  ) : item.value !== null ? (
                    item.value.toLocaleString('fr-FR')
                  ) : (
                    '—'
                  )}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {item.label} · {item.subtitle}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Quick Actions ───────────────────────── */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg font-bold text-neutral-900 dark:text-white mb-4"
        >
          Accès rapide
        </motion.h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              onClick={() => router.push(action.href)}
              className="group cursor-pointer rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm transition-all hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + index * 0.08, duration: 0.4 }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors ${action.accent} relative`}
                >
                  {action.icon}
                  {'badge' in action && action.badge !== undefined && action.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-danger-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                      {action.badge > 99 ? '99+' : action.badge}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base font-semibold text-neutral-900 dark:text-white transition-colors ${action.accent}`}
                  >
                    {action.title}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 group-hover:translate-x-1 transition-all mt-1 shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
