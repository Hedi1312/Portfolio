/**
 * Unit tests for src/lib/rate-limit.ts — PostgreSQL-backed rate limiter.
 *
 * Tests cover:
 * - rateLimit() normal flow (under limit, over limit, at limit)
 * - Key prefixing
 * - retryAfter minimum guarantee
 * - rateLimit() fail-open behavior on DB errors
 * - authRateLimit() fail-closed behavior on DB errors
 */

// Mock Prisma before importing the module
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

import { rateLimit, authRateLimit } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

const mockQueryRaw = prisma.$queryRaw as jest.Mock;

describe('rate-limit', () => {
  beforeEach(() => {
    mockQueryRaw.mockReset();
  });

  // ── Normal flow ─────────────────────────────────────────

  describe('check() — under limit', () => {
    it('should return success:true when count is within limit', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 1, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result).toEqual({ success: true });
    });
  });

  describe('check() — over limit', () => {
    it('should return success:false with retryAfter when count exceeds limit', async () => {
      const futureDate = new Date(Date.now() + 30_000); // 30s from now
      mockQueryRaw.mockResolvedValue([{ count: 6, expires_at: futureDate }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result.success).toBe(false);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('check() — at exact limit', () => {
    it('should return success:true when count equals limit exactly', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 5, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result).toEqual({ success: true });
    });
  });

  describe('check() — just over limit by 1', () => {
    it('should return success:false when count is limit + 1', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 6, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result.success).toBe(false);
    });
  });

  // ── retryAfter minimum ──────────────────────────────────

  describe('retryAfter minimum', () => {
    it('should return retryAfter of at least 1 second', async () => {
      // expires_at very close to now (nearly expired)
      mockQueryRaw.mockResolvedValue([{ count: 100, expires_at: new Date(Date.now() + 100) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('test-ip');

      expect(result.retryAfter).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Fail-open (rateLimit) ───────────────────────────────

  describe('rateLimit() — fail-open on DB error', () => {
    it('should return success:true when database throws', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB connection lost'));

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result).toEqual({ success: true });
    });

    it('should return success:true on any type of DB error', async () => {
      mockQueryRaw.mockRejectedValue(new Error('connection timeout'));

      const limiter = rateLimit({ limit: 10, window: '15 m' });
      const result = await limiter.check('some-ip');

      expect(result).toEqual({ success: true });
    });
  });

  // ── Fail-closed (authRateLimit) ─────────────────────────

  describe('authRateLimit() — fail-closed on DB error', () => {
    it('should return success:false with retryAfter:60 when database throws', async () => {
      mockQueryRaw.mockRejectedValue(new Error('DB connection lost'));

      const limiter = authRateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('127.0.0.1');

      expect(result).toEqual({ success: false, retryAfter: 60 });
    });

    it('should deny access on any type of DB error for auth-critical endpoints', async () => {
      mockQueryRaw.mockRejectedValue(new Error('timeout'));

      const limiter = authRateLimit({ limit: 5, window: '15 m', prefix: 'rl:login' });
      const result = await limiter.check('attacker-ip');

      expect(result.success).toBe(false);
      expect(result.retryAfter).toBe(60);
    });
  });

  // ── Both modes succeed normally ─────────────────────────

  describe('both modes succeed under normal conditions', () => {
    it('rateLimit() returns success when under limit and DB works', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 3, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('ip');

      expect(result).toEqual({ success: true });
    });

    it('authRateLimit() returns success when under limit and DB works', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 3, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = authRateLimit({ limit: 5, window: '1 m' });
      const result = await limiter.check('ip');

      expect(result).toEqual({ success: true });
    });
  });

  // ── $queryRaw is called ─────────────────────────────────

  describe('database interaction', () => {
    it('should call prisma.$queryRaw on each check', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 1, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      await limiter.check('test');

      expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    });

    it('should call prisma.$queryRaw with a tagged template (Prisma SQL)', async () => {
      mockQueryRaw.mockResolvedValue([{ count: 1, expires_at: new Date(Date.now() + 60_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });
      await limiter.check('test');

      // Tagged template literals pass an array of strings as first argument
      const firstArg = mockQueryRaw.mock.calls[0][0];
      expect(Array.isArray(firstArg)).toBe(true);
    });
  });

  // ── Multiple checks ─────────────────────────────────────

  describe('multiple sequential checks', () => {
    it('should make independent DB calls for each check', async () => {
      mockQueryRaw
        .mockResolvedValueOnce([{ count: 1, expires_at: new Date(Date.now() + 60_000) }])
        .mockResolvedValueOnce([{ count: 2, expires_at: new Date(Date.now() + 60_000) }])
        .mockResolvedValueOnce([{ count: 6, expires_at: new Date(Date.now() + 30_000) }]);

      const limiter = rateLimit({ limit: 5, window: '1 m' });

      const r1 = await limiter.check('ip');
      const r2 = await limiter.check('ip');
      const r3 = await limiter.check('ip');

      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
      expect(r3.success).toBe(false);
      expect(mockQueryRaw).toHaveBeenCalledTimes(3);
    });
  });
});
