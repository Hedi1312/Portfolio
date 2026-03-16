'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiUsers,
  FiEye,
  FiGlobe,
  FiMonitor,
  FiSmartphone,
  FiActivity,
  FiMousePointer,
} from 'react-icons/fi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// ─── Types ────────────────────────────────────────────
interface AnalyticsData {
  active: { visitors: number } | null;
  stats: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  } | null;
  pageviews: {
    pageviews: { x: string; y: number }[];
    sessions: { x: string; y: number }[];
  } | null;
  countries: { x: string; y: number }[] | null;
  pages: { x: string; y: number }[] | null;
  events: { x: string; y: number }[] | null;
  browsers: { x: string; y: number }[] | null;
  os: { x: string; y: number }[] | null;
  devices: { x: string; y: number }[] | null;
  referrers: { x: string; y: number }[] | null;
  period: string;
}

const PERIODS = [
  { label: '24h', value: '24h' },
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: '90 jours', value: '90d' },
];

const COLORS = [
  '#00bba7', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6',
  '#10b981', '#ec4899', '#14b8a6', '#f97316', '#0ea5e9',
];

const EVENT_LABELS: Record<string, string> = {
  'click-github-profile': 'GitHub profil',
  'click-linkedin-profile': 'LinkedIn profil',
  'click-cv-view': 'Voir CV',
  'click-cv-download': 'Télécharger CV',
  'click-contact-open': 'Ouvrir contact',
  'contact-form-submit': 'Envoi formulaire',
  'click-project-github': 'GitHub projet',
  'click-project-live': 'Lien projet',
  'click-project-details': 'Détails projet',
};

// ─── Formatters ─────────────────────────────────────────
function formatDate(dateStr: string, period: string) {
  const d = new Date(dateStr);
  if (period === '24h') {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

// ─── Custom Tooltip ─────────────────────────────────────
function CustomTooltip({ active, payload, label, period }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string; period: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-medium text-neutral-900 dark:text-white mb-1">
        {label ? formatDate(label, period) : ''}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: <span className="font-semibold">{entry.value.toLocaleString('fr-FR')}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Component ──────────────────────────────────────────
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`);
      if (!res.ok) throw new Error('Erreur lors du chargement');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  // Auto-refresh active visitors every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchData(period), 30000);
    return () => clearInterval(interval);
  }, [period, fetchData]);

  const bounceRate = data?.stats
    ? ((data.stats.bounces / data.stats.visits) * 100).toFixed(1)
    : '0';

  const avgTime = data?.stats
    ? formatDuration((data.stats.totaltime / data.stats.visits) * 1000)
    : '0s';

  // Chart data
  const chartData = data?.pageviews?.pageviews?.map((pv, i) => ({
    date: pv.x,
    pageviews: pv.y,
    sessions: data.pageviews?.sessions?.[i]?.y || 0,
  })) || [];

  const kpis = [
    {
      label: 'En ligne',
      value: data?.active?.visitors ?? 0,
      icon: FiActivity,
      color: 'text-success-500',
      bg: 'bg-success-500/10',
      live: true,
    },
    {
      label: 'Visiteurs',
      value: data?.stats?.visitors?.toLocaleString('fr-FR') ?? '0',
      icon: FiUsers,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
    {
      label: 'Pages vues',
      value: data?.stats?.pageviews?.toLocaleString('fr-FR') ?? '0',
      icon: FiEye,
      color: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
    },
    {
      label: 'Visites',
      value: data?.stats?.visits?.toLocaleString('fr-FR') ?? '0',
      icon: FiGlobe,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Taux rebond',
      value: `${bounceRate}%`,
      icon: FiMousePointer,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      label: 'Durée moy.',
      value: avgTime,
      icon: FiMonitor,
      color: 'text-teal-500',
      bg: 'bg-teal-500/10',
    },
  ];

  return (
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 pb-16">
      <div className="mx-auto max-w-7xl w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">
                📊 Statistiques
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Données via Umami Analytics
              </p>
            </div>
          </div>

          {/* Period selector */}
          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  period === p.value
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger-500/10 text-danger-500 rounded-xl p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                        <Icon size={14} className={kpi.color} />
                      </div>
                      {kpi.live && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {kpi.value}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {kpi.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Pageviews Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 mb-8 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Pages vues & Sessions
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00bba7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00bba7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSess" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDate(d, period)}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip period={period} />} />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      name="Pages vues"
                      stroke="#00bba7"
                      fill="url(#colorPv)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      name="Sessions"
                      stroke="#6366f1"
                      fill="url(#colorSess)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Two-column grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Top Pages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Pages les plus visitées
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(data?.pages || []).slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="x"
                        width={120}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip />
                      <Bar dataKey="y" name="Vues" fill="#00bba7" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiMousePointer size={18} /> Événements trackés
                </h2>
                {data?.events && data.events.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {data.events.map((evt, i) => {
                      const maxVal = data.events![0].y;
                      const pct = maxVal > 0 ? (evt.y / maxVal) * 100 : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-neutral-700 dark:text-neutral-300 truncate mr-2">
                              {EVENT_LABELS[evt.x] || evt.x}
                            </span>
                            <span className="font-semibold text-neutral-900 dark:text-white shrink-0">
                              {evt.y}
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2">
                            <div
                              className="bg-brand-500 h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm text-center py-8">Aucun événement</p>
                )}
              </motion.div>
            </div>

            {/* Three-column grid: Countries / Browsers+OS / Devices+Referrers */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Countries Pie */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiGlobe size={18} /> Pays
                </h2>
                {data?.countries && data.countries.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.countries}
                          dataKey="y"
                          nameKey="x"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={40}
                          paddingAngle={2}
                          label={({ x: name }) => name}
                        >
                          {data.countries.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm text-center py-8">Aucune donnée</p>
                )}
              </motion.div>

              {/* Browser & OS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiMonitor size={18} /> Navigateurs & OS
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">Navigateurs</h3>
                    {(data?.browsers || []).map((b, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-neutral-700 dark:text-neutral-300">{b.x}</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{b.y}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">Systèmes</h3>
                    {(data?.os || []).map((o, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-neutral-700 dark:text-neutral-300">{o.x}</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{o.y}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Devices & Referrers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiSmartphone size={18} /> Appareils & Referrers
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">Appareils</h3>
                    {(data?.devices || []).map((d, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-neutral-700 dark:text-neutral-300">{d.x || 'Inconnu'}</span>
                        <span className="font-medium text-neutral-900 dark:text-white">{d.y}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="border-neutral-200 dark:border-neutral-700" />
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">Referrers</h3>
                    {(data?.referrers || []).slice(0, 5).map((r, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-neutral-700 dark:text-neutral-300 truncate mr-2">{r.x || 'Direct'}</span>
                        <span className="font-medium text-neutral-900 dark:text-white shrink-0">{r.y}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
