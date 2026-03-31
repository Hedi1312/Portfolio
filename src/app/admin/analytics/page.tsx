import { requireAdmin } from '@/lib/auth-guard';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { AnalyticsData } from './AnalyticsClient';

const AnalyticsClient = dynamic(() => import('./AnalyticsClient'), { ssr: false });
import { getUmamiStatsAction } from '@/actions/analytics.action';

export default async function AdminAnalyticsPage() {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) {
    redirect('/admin-login');
  }

  // Pre-fetch '7d' data on the server
  const initialPeriod = '7d';
  const res = await getUmamiStatsAction(initialPeriod);

  // Fallback to null if server fail for Umami API
  const initialData = res.success ? (res.data as AnalyticsData) : null;

  return <AnalyticsClient initialData={initialData} initialPeriod={initialPeriod} />;
}
