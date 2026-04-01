/**
 * Postgres-backed rate limiter for serverless environments.
 * Shared database ensures global limits across all Lambda instances.
 */

import { prisma } from '@/lib/prisma';

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

interface RateLimitConfig {
  limit: number;
  window: Duration;
  prefix?: string;
}

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

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

function createLimiter(config: RateLimitConfig, failClosed: boolean): RateLimiter {
  const windowMs = parseDurationMs(config.window);
  const prefix = config.prefix || 'rl';

  return {
    async check(identifier: string): Promise<RateLimitResult> {
      const key = `${prefix}:${identifier}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + windowMs);

      try {
        // Atomic SQL to prevent race conditions during concurrent hits
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
          // Block access if DB is down to prevent bypass during outages
          return { success: false, retryAfter: 60 };
        }
        // Fail-open for non-critical paths
        return { success: true };
      }
    },
  };
}

/**
 * Standard limiter - fails open on DB error.
 */
export function rateLimit(config: RateLimitConfig): RateLimiter {
  return createLimiter(config, false);
}

/**
 * Critical limiter - fails closed on DB error to ensure protection.
 */
export function authRateLimit(config: RateLimitConfig): RateLimiter {
  return createLimiter(config, true);
}
