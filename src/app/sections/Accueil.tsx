'use client';

import { useEffect, useState } from 'react';
import { m } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import { smoothScrollTo } from '@/lib/utils/scroll';

const name = 'Hëdi OKBA';

const letterVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.8 + i * 0.08,
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  }),
};

export default function Accueil() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 overflow-hidden bg-neutral-50 dark:bg-[#0a0f1a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      {/* Animated grid background */}
      <div className="hero-grid opacity-50 dark:opacity-30" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,213,190,0.15)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,213,190,0.12)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        {/* Badge */}
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-12 text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />À l&apos;écoute
          d&apos;opportunités
        </m.div>

        {/* Title */}
        <m.h1
          className="text-5xl md:text-7xl font-extrabold mb-12 font-(family-name:--font-space-grotesk) tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.23, 1, 0.32, 1] as const }}
        >
          Salut, moi c&apos;est{' '}
          <span className="inline-flex">
            {name.split('').map((char, i) => (
              <m.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                className={`${char === ' ' ? 'w-3 md:w-4' : 'inline-block gradient-text-animated'}`}
              >
                {char === ' ' ? '\u00A0' : char}
              </m.span>
            ))}
          </span>
        </m.h1>

        {/* Subtitle */}
        <m.p
          className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 2.0, delay: 1.2, ease: [0.23, 1, 0.32, 1] as const }}
        >
          Développeur passionné par la création d&apos;expériences web modernes, performantes et
          élégantes.
        </m.p>

        {/* CTA Button */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 2.0, delay: 1.4, ease: [0.23, 1, 0.32, 1] as const }}
          className="flex flex-col items-center gap-6"
        >
          <button
            onClick={() => {
              smoothScrollTo('a-propos', 2500);
            }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 hover:border-brand-400 dark:hover:border-brand-400 shadow-sm transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-brand-400">
              Découvrir
            </span>
            <div className="relative z-10 p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-colors duration-300 group-hover:bg-brand-400/10">
              <FiChevronDown
                size={14}
                className="transition-transform duration-300 group-hover:translate-y-0.5 text-neutral-500 dark:text-neutral-400 group-hover:text-brand-400"
              />
            </div>
          </button>
        </m.div>
      </div>

      {/* Mouse Scroll Indicator (Independent) */}
      {mounted && (
        <m.div
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
          onClick={() => {
            smoothScrollTo('a-propos', 2500);
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2.2, duration: 2.0, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <div className="w-5 h-9 border-2 border-neutral-500 dark:border-neutral-400 rounded-full flex justify-center p-1">
            <m.div
              className="w-1 h-2 bg-brand-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 dark:text-neutral-400">
            Scroll
          </span>
        </m.div>
      )}

      {/* Scroll indicator (Mobile only) */}
      {mounted && (
        <m.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 dark:text-neutral-500 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 2.0, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <m.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FiChevronDown size={28} />
          </m.div>
        </m.div>
      )}
    </section>
  );
}
