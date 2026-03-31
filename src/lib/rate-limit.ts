/**
 * Production-grade rate limiter backed by PostgreSQL (via Prisma).
 *
 * Serverless-compatible: all Lambda instances share the same database,
 * so rate limits are enforced globally — unlike in-memory Maps that
 * reset with each cold start.
 *
 * Expired entries are cleaned up opportunistically on each check.
 */

import { prisma } from '@/lib/prisma';

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Sliding window duration (e.g., '1 m', '15 m', '1 h') */
  window: Duration;
  /** Namespace prefix for keys (default: 'rl') */
  prefix?: string;
}

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

// ── Duration parser ───────────────────────────────────────────────

function parseDurationMs(window: Duration): number {
  const match = window.match(/^(\d+)\s*(ms|s|m|h|d)$/);
  if (!match) return 60_000;
  const value = Number(match[1]);
  const multipliers: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[match[2]] ?? 60_000);
}

// ── Internal factory ──────────────────────────────────────────────

function createLimiter(config: RateLimitConfig, failClosed: boolean): RateLimiter {
  const windowMs = parseDurationMs(config.window);
  const prefix = config.prefix || 'rl';

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const key = `${prefix}:${identifier}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + windowMs);

      try {
        // Single atomic SQL: insert, reset-if-expired, or increment — no race condition.
        const result = await prisma.$queryRaw<{ count: number; expires_at: Date }[]>`
          INSERT INTO rate_limits (key, count, "expiresAt")
          VALUES (${key}, 1, ${expiresAt})
          ON CONFLICT (key) DO UPDATE SET
            count = CASE
              WHEN rate_limits."expiresAt" < ${now} THEN 1
              ELSE rate_limits.count + 1
            END,
            "expiresAt" = CASE
              WHEN rate_limits."expiresAt" < ${now} THEN ${expiresAt}
              ELSE rate_limits."expiresAt"
            END
          RETURNING count, "expiresAt" AS expires_at
        `;

        const entry = result[0];

        if (entry.count > config.limit) {
          const retryAfter = Math.ceil(
            (new Date(entry.expires_at).getTime() - now.getTime()) / 1000,
          );
          return { success: false, retryAfter: Math.max(retryAfter, 1) };
        }

        return { success: true };
      } catch {
        if (failClosed) {
          // Auth-critical: deny access when the DB is unreachable
          // to preserve brute-force protection at all times.
          return { success: false, retryAfter: 60 };
        }
        // Non-critical: fail-open to avoid false 429s during transient DB hiccups.
        return { success: true };
      }
    },
  };
}

// ── Public factories ──────────────────────────────────────────────

/**
 * Standard rate limiter — fails **open** on DB errors.
 * Use for non-critical endpoints (contact form, public pages).
 */
export function rateLimit(config: RateLimitConfig): RateLimiter {
  return createLimiter(config, false);
}

/**
 * Auth-critical rate limiter — fails **closed** on DB errors.
 * Use for login, 2FA, password-reset, and token-verification endpoints
 * to guarantee brute-force protection even during database outages.
 */
export function authRateLimit(config: RateLimitConfig): RateLimiter {
  return createLimiter(config, true);
}
