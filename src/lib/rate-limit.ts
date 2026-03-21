/**
 * Rate limiter in-memory (sans dépendance externe).
 * Utilise une Map pour stocker les requêtes par clé (ex: IP).
 * Nettoyage automatique des entrées expirées.
 */

interface RateLimitOptions {
  /** Fenêtre de temps en millisecondes */
  interval: number;
  /** Nombre max de requêtes autorisées dans la fenêtre */
  limit: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export function rateLimit({ interval, limit }: RateLimitOptions) {
  const tokenCache = new Map<string, RateLimitEntry>();

  // Nettoyage périodique des entrées expirées (toutes les 60s)
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokenCache.entries()) {
      if (now > entry.resetTime) {
        tokenCache.delete(key);
      }
    }
  }, 60_000).unref();

  return {
    /**
     * Vérifie si la clé a dépassé la limite.
     * @returns `{ success: true }` si autorisé, `{ success: false, retryAfter }` sinon.
     */
    check(key: string): { success: boolean; retryAfter?: number } {
      const now = Date.now();
      const entry = tokenCache.get(key);

      if (!entry || now > entry.resetTime) {
        // Nouvelle fenêtre
        tokenCache.set(key, { count: 1, resetTime: now + interval });
        return { success: true };
      }

      if (entry.count >= limit) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        return { success: false, retryAfter };
      }

      entry.count++;
      return { success: true };
    },
  };
}
