'use client';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 transition-colors duration-500 overflow-hidden">
      {/* Gradient separator */}
      <div className="h-px bg-linear-to-r from-transparent via-brand-400/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="group flex items-center w-fit mb-4" onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
              <h3 className="text-2xl font-bold font-(family-name:--font-space-grotesk) tracking-tight flex items-center">
                <span className="relative inline-flex">
                  <span className="gradient-text-animated">Hëdi</span>
                  <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Hëdi</span>
                </span>
                <span className="relative inline-flex ml-2">
                  <span className="text-foreground">OKBA</span>
                  <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">OKBA</span>
                </span>
              </h3>
            </Link>
            Création d&apos;expériences web modernes, performantes et centrées sur
            l&apos;utilisateur. Je transforme vos idées en solutions digitales concrètes et
            optimisées.
            <div className="flex items-center gap-2.5 px-3 py-1.5 mt-4 rounded-full bg-green-500/10 dark:bg-green-500/10 border border-green-500/20 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">
                À l&apos;écoute d&apos;opportunités — Monde & Remote
              </span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-6 uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: 'Accueil', href: '#accueil' },
                { label: 'À propos', href: '#a-propos' },
                { label: 'Projets', href: '#projets' },
                { label: 'Contact', href: '#contact' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-brand-400 transition-colors duration-200 block w-fit"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials Column */}
          <div className="md:col-span-4">
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
                  <motion.a
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
                  </motion.a>
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
            <span className="font-semibold text-neutral-900 dark:text-neutral-200">Next.js</span>,{' '}
            <span className="font-semibold text-brand-400">Tailwind CSS</span> &{' '}
            <span className="font-semibold text-pink-500">Framer Motion.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
