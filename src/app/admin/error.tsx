'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally report to an error tracking service
  }, [error]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-background transition-colors px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-danger-50 dark:bg-danger-100/10 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-danger-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-(family-name:--font-space-grotesk) mb-3">
          Erreur administration
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          Une erreur est survenue dans l&apos;espace admin. Réessaye ou retourne au tableau de bord.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl bg-brand-400 text-white font-semibold hover:bg-brand-500 transition-colors cursor-pointer"
          >
            Réessayer
          </button>
          <Link
            href="/admin/dashboard"
            className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            Tableau de bord
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            Ref: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
