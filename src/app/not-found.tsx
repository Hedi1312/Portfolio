import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-900 transition-colors px-6">
      <div className="max-w-md text-center">
        <p className="text-8xl font-bold gradient-text font-(family-name:--font-space-grotesk) mb-4">
          404
        </p>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-(family-name:--font-space-grotesk) mb-3">
          Page introuvable
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
          Cette page n&apos;existe pas ou a été déplacée. Vérifie l&apos;URL ou retourne à
          l&apos;accueil.
        </p>

        <Link
          href="/"
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
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
