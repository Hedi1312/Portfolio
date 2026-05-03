'use client';
import { m } from 'framer-motion';
import Link from 'next/link';
import { FaEnvelope, FaFolderOpen, FaGithub, FaHome, FaLinkedin, FaUser } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-colors duration-500 overflow-hidden">
      {/* Gradient separator */}
      <div className="h-px bg-linear-to-r from-transparent via-brand-400/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-12 md:gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/"
              className="group flex items-center justify-center md:justify-start w-fit mb-4 mx-auto md:mx-0"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <h3 className="text-2xl font-bold font-(family-name:--font-space-grotesk) tracking-tight flex items-center">
                <span className="relative inline-flex">
                  <span className="gradient-text-animated opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                    Hëdi
                  </span>
                  <span className="absolute inset-0 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                    Hëdi
                  </span>
                </span>
                <span className="relative inline-flex ml-2">
                  <span className="text-foreground opacity-100 group-hover:opacity-0 transition-opacity duration-150">
                    OKBA
                  </span>
                  <span className="absolute inset-0 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                    OKBA
                  </span>
                </span>
              </h3>
            </Link>
            <div className="flex items-center justify-center md:justify-start gap-2.5 px-3 py-1.5 mb-4 rounded-full bg-green-500/10 dark:bg-green-500/10 border border-green-500/20 w-fit mx-auto md:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                À l&apos;écoute d&apos;opportunités
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              Création d&apos;expériences web modernes, performantes et centrées sur
              l&apos;utilisateur. Je transforme vos idées en solutions digitales concrètes et
              optimisées.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="col-span-1 md:col-span-3 justify-self-center md:justify-self-auto">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-6 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Accueil', href: '#home', section: 'home', icon: FaHome },
                { label: 'À propos', href: '#a-propos', section: 'a-propos', icon: FaUser },
                {
                  label: 'Projets',
                  href: '#mes-projets',
                  section: 'mes-projets',
                  icon: FaFolderOpen,
                },
                {
                  label: 'Contact & CV',
                  href: '#next-steps',
                  section: 'next-steps',
                  icon: FaEnvelope,
                },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(link.section);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-sm hover:text-brand-400 hover:translate-x-2 transition-all duration-300 flex items-center gap-2.5 w-fit"
                    >
                      <Icon size={15} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="col-span-1 md:col-span-4 justify-self-center md:justify-self-auto">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-6 uppercase tracking-wider">
              Réseaux Sociaux
            </h4>
            <div className="flex flex-col gap-3">
              {[
                {
                  href: 'https://github.com/Hedi1312',
                  icon: FaGithub,
                  label: 'GitHub',
                  username: '@Hedi1312',
                  umamiEvent: 'click-github-profile',
                },
                {
                  href: 'https://linkedin.com/in/hedi-okba',
                  icon: FaLinkedin,
                  label: 'LinkedIn',
                  username: 'Hëdi Okba',
                  umamiEvent: 'click-linkedin-profile',
                },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <m.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 w-fit"
                    aria-label={social.label}
                    data-umami-event={social.umamiEvent}
                    whileHover={{ x: 5 }}
                  >
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-brand-400/10 group-hover:text-brand-400 transition-all duration-300">
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-medium group-hover:text-brand-400 transition-colors">
                      {social.username}
                    </span>
                  </m.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">© {currentYear} - Hëdi OKBA - Tous droits réservés.</p>
          <p className="text-xs flex items-center gap-1.5 flex-wrap justify-center">
            Construit avec{' '}
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">Next.js,</span>
            <span className="font-semibold text-brand-400">Tailwind CSS &</span>
            <span className="font-semibold text-pink-500">Framer Motion.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
