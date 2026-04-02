'use server';

import { requireAdmin } from '@/lib/auth-guard';
import { z } from 'zod';

export type ActionResult = {
  success?: boolean;
  error?: string;
  data?: unknown;
};

const periodSchema = z.enum(['24h', '7d', '30d', '90d']).catch('7d');

async function umamiGet(
  urlBase: string,
  key: string,
  path: string,
  params?: Record<string, string>,
) {
  const url = new URL(`${urlBase}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      'x-umami-api-key': key,
      Accept: 'application/json',
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

function getPeriodRange(period: string) {
  const now = Date.now();
  const msMap: Record<string, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
  };
  const ms = msMap[period] || msMap['7d'];
  return { startAt: String(now - ms), endAt: String(now) };
}

function getUnit(period: string) {
  const map: Record<string, string> = {
    '24h': 'hour',
    '7d': 'day',
    '30d': 'day',
    '90d': 'day',
  };
  return map[period] || 'day';
}

export async function getUmamiStatsAction(rawPeriod: string): Promise<ActionResult> {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return { error: 'Non autorisé' };

  const UMAMI_API_URL = process.env.UMAMI_API_URL;
  const UMAMI_API_KEY = process.env.UMAMI_API_KEY;
  const WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!UMAMI_API_URL || !UMAMI_API_KEY || !WEBSITE_ID) {
    return { error: 'Variables Umami non configurées' };
  }

  try {
    const period = periodSchema.parse(rawPeriod);
    const { startAt, endAt } = getPeriodRange(period);
    const unit = getUnit(period);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const metricsConfig = [
      { type: 'country', limit: '10' },
      { type: 'path', limit: '10' },
      { type: 'event', limit: '20' },
      { type: 'browser', limit: '5' },
      { type: 'os', limit: '5' },
      { type: 'device', limit: '5' },
      { type: 'referrer', limit: '10' },
    ];

    const basePath = `/websites/${WEBSITE_ID}`;

    const [active, stats, pageviews, ...metricsData] = await Promise.all([
      umamiGet(UMAMI_API_URL, UMAMI_API_KEY, `${basePath}/active`),
      umamiGet(UMAMI_API_URL, UMAMI_API_KEY, `${basePath}/stats`, { startAt, endAt }),
      umamiGet(UMAMI_API_URL, UMAMI_API_KEY, `${basePath}/pageviews`, {
        startAt,
        endAt,
        unit,
        timezone: tz,
      }),
      ...metricsConfig.map(({ type, limit }) =>
        umamiGet(UMAMI_API_URL, UMAMI_API_KEY, `${basePath}/metrics`, {
          startAt,
          endAt,
          type,
          limit,
        }),
      ),
    ]);

    const [countries, pages, events, browsers, os, devices, referrers] = metricsData;

    return {
      success: true,
      data: {
        active,
        stats,
        pageviews,
        countries,
        pages,
        events,
        browsers,
        os,
        devices,
        referrers,
        period,
      },
    };
  } catch (error) {
    console.error('[actions/analytics:getUmamiStatsAction]', error);
    return { error: 'Erreur lors du chargement des statistiques Umami' };
  }
}
