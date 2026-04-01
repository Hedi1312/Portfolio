import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-background transition-colors px-6">
      <div className="max-w-md text-center">
        <p className="text-8xl font-bold gradient-text font-(family-name:--font-space-grotesk) mb-4">
          404
        </p>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-(family-name:--font-space-grotesk) mb-3">
          Page admin introuvable
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          Cette page n&apos;existe pas dans l&apos;espace d&apos;administration.
        </p>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-400 text-white font-semibold hover:bg-brand-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          Retour au tableau de bord
        </Link>
      </div>
    </section>
  );
}
