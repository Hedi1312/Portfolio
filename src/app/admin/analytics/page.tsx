'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  FiActivity,
  FiArrowLeft,
  FiEye,
  FiGlobe,
  FiMonitor,
  FiMousePointer,
  FiSmartphone,
  FiUsers,
  FiLink,
} from 'react-icons/fi';
import {
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaOpera,
  FaApple,
  FaAndroid,
  FaWindows,
  FaLinux,
} from 'react-icons/fa';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Monitor, Laptop, Smartphone, Tablet, BarChart3 } from 'lucide-react';
import Image from 'next/image';

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

// Unused COLORS removed for lint

const EVENT_LABELS: Record<string, string> = {
  'click-github-profile': 'GitHub profil',
  'click-linkedin-profile': 'LinkedIn profil',
  'click-cv-view': 'Voir CV',
  'click-cv-download': 'Télécharger CV',
  'click-contact-open': 'Ouvrir contact',
  'contact-form-submit': 'Envoi formulaire',
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

// ─── Helpers ──────────────────────────────────────────
function getCountryFlagUrl(countryCode: string) {
  if (!countryCode) return null;
  return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
}

function getCountryName(code: string) {
  try {
    const displayNames = new Intl.DisplayNames(['fr'], { type: 'region' });
    return displayNames.of(code.toUpperCase()) || code;
  } catch (_e) {
    return code;
  }
}

type IconComponent = React.ComponentType<{
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}>;

const BROWSER_MAP: Record<
  string,
  { label: string; icon: IconComponent; color: string; logoUrl?: string }
> = {
  chrome: {
    label: 'Chrome',
    icon: FaChrome,
    color: '#4285F4',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome.svg',
  },
  firefox: {
    label: 'Firefox',
    icon: FaFirefox,
    color: '#FF7139',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox.svg',
  },
  safari: {
    label: 'Safari',
    icon: FaSafari,
    color: '#00AEFF',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari.svg',
  },
  edge: {
    label: 'Edge',
    icon: FaEdge,
    color: '#0078D7',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge.svg',
  },
  opera: {
    label: 'Opera',
    icon: FaOpera,
    color: '#FF1B2D',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera.svg',
  },
  ie: {
    label: 'Internet Explorer',
    icon: FaEdge,
    color: '#0078D7',
    logoUrl:
      'https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11.svg',
  },
};

const DEVICE_MAP: Record<string, { label: string; icon: IconComponent; color: string }> = {
  desktop: { label: 'Ordinateur', icon: Monitor, color: '#6366F1' },
  laptop: { label: 'PC Portable', icon: Laptop, color: '#8B5CF6' },
  mobile: { label: 'Mobile', icon: Smartphone, color: '#10B981' },
  tablet: { label: 'Tablette', icon: Tablet, color: '#F59E0B' },
};

const OS_MAP: Record<
  string,
  { label: string; icon: IconComponent; color: string; logoUrl?: string }
> = {
  ios: {
    label: 'iOS',
    icon: FaApple,
    color: '#555555',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/apple/apple.svg',
  },
  android: {
    label: 'Android',
    icon: FaAndroid,
    color: '#3DDC84',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/android/android.svg',
  },
  windows: {
    label: 'Windows',
    icon: FaWindows,
    color: '#0078D7',
    logoUrl:
      'https://raw.githubusercontent.com/alrra/browser-logos/refs/heads/master/src/windows/windows.svg',
  },
  macos: {
    label: 'macOS',
    icon: FaApple,
    color: '#555555',
    logoUrl: 'https://raw.githubusercontent.com/alrra/browser-logos/master/src/apple/apple.svg',
  },
  linux: {
    label: 'Linux',
    icon: FaLinux,
    color: '#EAB308',
  },
};

function formatLabel(
  label: string,
  map: Record<string, { label: string; icon: IconComponent; color: string; logoUrl?: string }>,
) {
  if (!label) return { label: 'Inconnu', icon: AlertCircle, color: '#9CA3AF' };
  const lower = label.toLowerCase().trim();

  // OS specific checks only if map has these keys
  if (lower.includes('windows') && map['windows']) return map['windows'];
  if (lower.includes('ios') && map['ios']) return map['ios'];
  if ((lower.includes('mac') || lower.includes('apple')) && map['macos']) return map['macos'];
  if (lower.includes('android') && map['android']) return map['android'];
  if (lower.includes('linux') && map['linux']) return map['linux'];

  // Browser checks for specific mobile
  if (lower.includes('crios') && map['chrome']) return map['chrome'];

  const matchedKey = Object.keys(map).find((key) => lower.includes(key) || key.includes(lower));

  return (
    (matchedKey ? map[matchedKey] : null) || {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      icon: Monitor,
      color: '#6B7280',
    }
  );
}

// ─── Logo Component with Fallback ────────────────────────
function BrandLogo({
  logoUrl,
  label: _label,
  icon: Icon,
  color,
}: {
  logoUrl?: string;
  label: string;
  icon: IconComponent;
  color: string;
}) {
  const [error, setError] = useState(false);

  if (logoUrl && !error) {
    return (
      <Image
        src={logoUrl}
        alt=""
        width={16}
        height={16}
        className="object-contain"
        onError={() => setError(true)}
      />
    );
  }

  return <Icon className="w-4 h-4" style={{ color }} />;
}

// ─── Custom Tooltip ─────────────────────────────────────
interface PayloadEntry {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  period,
  isDate = false,
}: {
  active?: boolean;
  payload?: PayloadEntry[];
  label?: string;
  period?: string;
  isDate?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 shadow-2xl text-sm min-w-[140px]">
      <p className="font-bold text-neutral-900 dark:text-white mb-1.5 border-b border-neutral-100 dark:border-neutral-700 pb-1.5">
        {isDate && period ? formatDate(label || '', period) : label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="text-neutral-500 dark:text-neutral-400 text-xs italic">
              {entry.name}
            </span>
          </div>
          <span className="font-bold text-neutral-900 dark:text-white">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('fr-FR')
              : entry.value || 0}
          </span>
        </div>
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
  const chartData =
    data?.pageviews?.pageviews?.map((pv, i) => ({
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
    <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
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
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                <BarChart3 className="text-brand-500" />
                Statistiques
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
                {chartData.length > 0 ? (
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
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-neutral-400 dark:text-neutral-500"
                        opacity={0.6}
                      />
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
                      <Tooltip
                        content={<ChartTooltip period={period} isDate={true} />}
                        cursor={{ stroke: '#00d5be', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />
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
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                    Aucune donnée pour le moment
                  </div>
                )}
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
                  {(data?.pages || []).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(data?.pages || []).slice(0, 8)} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          className="text-neutral-400 dark:text-neutral-500"
                          opacity={0.6}
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="x"
                          width={120}
                          tick={{ fontSize: 11, fill: '#9ca3af' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={<ChartTooltip />}
                          cursor={{ fill: 'rgba(0, 213, 190, 0.05)' }}
                        />
                        <Bar dataKey="y" name="Vues" fill="#00bba7" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                      Aucune donnée pour le moment
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-0 overflow-hidden shadow-sm flex flex-col"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white px-6 pt-6 mb-4 flex items-center gap-2">
                  <FiMousePointer size={18} /> Événements trackés
                </h2>
                {data?.events && data.events.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto px-6 pb-6">
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
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-neutral-400 text-sm">Aucune donnée pour le moment</p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Three-column grid: Countries / Browsers+OS / Devices+Referrers */}
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Countries List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-0 overflow-hidden shadow-sm flex flex-col"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white px-6 pt-6 mb-4 flex items-center gap-2">
                  <FiGlobe size={18} /> Pays
                </h2>
                {data?.countries && data.countries.length > 0 ? (
                  <div className="space-y-3 max-h-72 overflow-y-auto px-6 pb-6">
                    {data.countries
                      .sort((a, b) => b.y - a.y)
                      .map((c, i) => {
                        const total = data.countries!.reduce((acc, curr) => acc + curr.y, 0);
                        const pct = total > 0 ? ((c.y / total) * 100).toFixed(1) : 0;
                        return (
                          <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-3.5 relative overflow-hidden rounded-sm border border-neutral-100 dark:border-neutral-700/50 shrink-0 shadow-xs">
                                {getCountryFlagUrl(c.x) ? (
                                  <Image
                                    src={getCountryFlagUrl(c.x)!}
                                    alt={c.x}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <FiGlobe className="w-full h-full text-neutral-400" />
                                )}
                              </div>
                              <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
                                {getCountryName(c.x)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-neutral-900 dark:text-white block">
                                {c.y.toLocaleString('fr-FR')}
                              </span>
                              <span className="text-xs text-neutral-400 font-medium">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-neutral-400 text-sm">Aucune donnée pour le moment</p>
                  </div>
                )}
              </motion.div>

              {/* Browser & OS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-0 overflow-hidden shadow-sm flex flex-col"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white px-6 pt-6 mb-4 flex items-center gap-2">
                  <FiMonitor size={18} /> Navigateurs & OS
                </h2>
                {(data?.browsers?.length || 0) > 0 || (data?.os?.length || 0) > 0 ? (
                  <div className="space-y-4 px-6 pb-6 overflow-y-auto max-h-88">
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                        Navigateurs
                      </h3>
                      <div className="space-y-1">
                        {(data?.browsers || []).map((b, i) => {
                          const itemData = formatLabel(b.x, BROWSER_MAP);
                          const logoUrl = 'logoUrl' in itemData ? itemData.logoUrl : undefined;
                          const { label, icon: Icon, color } = itemData;
                          return (
                            <div key={i} className="flex justify-between text-sm py-1">
                              <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                <BrandLogo
                                  logoUrl={logoUrl}
                                  label={label}
                                  icon={Icon}
                                  color={color}
                                />
                                <span>{label}</span>
                              </span>
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {b.y}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <hr className="border-neutral-200 dark:border-neutral-700" />
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                        Systèmes
                      </h3>
                      <div className="space-y-1">
                        {(data?.os || []).map((o, i) => {
                          const itemData = formatLabel(o.x, OS_MAP);
                          const logoUrl = 'logoUrl' in itemData ? itemData.logoUrl : undefined;
                          const { label, icon: Icon, color } = itemData;
                          return (
                            <div key={i} className="flex justify-between text-sm py-1">
                              <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                                <BrandLogo
                                  logoUrl={logoUrl}
                                  label={label}
                                  icon={Icon}
                                  color={color}
                                />
                                <span>{label}</span>
                              </span>
                              <span className="font-medium text-neutral-900 dark:text-white">
                                {o.y}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-neutral-400 text-sm">Aucune donnée pour le moment</p>
                  </div>
                )}
              </motion.div>

              {/* Devices & Referrers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-0 overflow-hidden shadow-sm flex flex-col"
              >
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white px-6 pt-6 mb-4 flex items-center gap-2">
                  <FiSmartphone size={18} /> Appareils & Sources
                </h2>
                {(data?.devices?.length || 0) > 0 || (data?.referrers?.length || 0) > 0 ? (
                  <div className="space-y-4 px-6 pb-6 overflow-y-auto max-h-88">
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                        Appareils
                      </h3>
                      <div className="space-y-2">
                        {(data?.devices || []).map((d, i) => {
                          const { label, icon: Icon, color } = formatLabel(d.x, DEVICE_MAP);
                          return (
                            <div
                              key={i}
                              className="flex justify-between items-center text-sm p-2 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                            >
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-2">
                                <Icon className="w-4 h-4" style={{ color }} />
                                <span>{label}</span>
                              </span>
                              <span className="font-bold text-neutral-900 dark:text-white">
                                {d.y.toLocaleString('fr-FR')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <hr className="border-neutral-200 dark:border-neutral-700" />
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase mb-2">
                        Sources
                      </h3>
                      <div className="space-y-2">
                        {(data?.referrers || [])
                          .filter((r) => r.x)
                          .map((r, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-sm p-2 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg"
                            >
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate flex-1 min-w-0 mr-4 flex items-center gap-2">
                                <FiLink className="w-4 h-4 text-brand-500 shrink-0" />
                                <span className="truncate">{r.x}</span>
                              </span>
                              <span className="font-bold text-neutral-900 dark:text-white">
                                {r.y.toLocaleString('fr-FR')}
                              </span>
                            </div>
                          ))}
                        {!data?.referrers?.length && (
                          <div className="text-neutral-400 text-sm py-2 text-center">
                            Aucune source trouvée
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <p className="text-neutral-400 text-sm">Aucune donnée pour le moment</p>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
