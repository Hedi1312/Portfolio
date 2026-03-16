'use client';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-[#0f172a] text-neutral-500 dark:text-neutral-400 transition-colors duration-500">
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()}{' '}
            <span className="gradient-text font-semibold">Hëdi OKBA</span> — Tous droits réservés.
          </p>

          <div className="flex items-center gap-4">
            {[
              { href: 'https://github.com/Hedi1312', icon: FaGithub, label: 'GitHub', umamiEvent: 'click-github-profile' },
              { href: 'https://linkedin.com/in/hedi-okba', icon: FaLinkedin, label: 'LinkedIn', umamiEvent: 'click-linkedin-profile' },
            ].map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl hover:bg-brand-400/10 hover:text-brand-400 transition-all duration-200"
                  aria-label={social.label}
                  data-umami-event={social.umamiEvent}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={20} />
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
