import { getUmamiStatsAction } from '@/actions/analytics.action';
import { requireAdmin } from '@/lib/auth-guard';

jest.mock('@/lib/auth-guard', () => ({
  requireAdmin: jest.fn(),
}));

// Setup fetch mock
const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest.fn();
});
afterAll(() => {
  global.fetch = originalFetch;
});

describe('getUmamiStatsAction', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
    process.env.UMAMI_API_URL = 'https://api.umami.is/v1';
    process.env.UMAMI_API_KEY = 'test-key';
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'test-id';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('1. Returns { error: "Non autorisé" } if requireAdmin fails', async () => {
    (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: true });

    const result = await getUmamiStatsAction('7d');
    expect(result).toEqual({ error: 'Non autorisé' });
  });

  it('3. Fetches umami endpoints successfully', async () => {
    (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: false });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ mockData: true }),
    });

    const result = await getUmamiStatsAction('24h');

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    // Test the number of fetch calls logic
    // active, stats, pageviews, and 7 metrics = 10 calls
    expect(global.fetch).toHaveBeenCalledTimes(10);
  });

  it('4. Returns error safely on fetch failure', async () => {
    (requireAdmin as jest.Mock).mockResolvedValueOnce({ unauthorized: false });

    (global.fetch as jest.Mock).mockRejectedValue(new Error('Umami offline'));

    const result = await getUmamiStatsAction('7d');

    expect(result).toEqual({ error: 'Erreur lors du chargement des statistiques Umami' });
  });
});
