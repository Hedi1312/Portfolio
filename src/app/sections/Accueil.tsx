'use client';
import { motion } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

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
  return (
    <section
      id="home"
      className="relative flex flex-col items-center justify-center text-center min-h-screen px-6 overflow-hidden bg-neutral-50 dark:bg-[#0a0f1a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      {/* Animated grid background */}
      <div className="hero-grid opacity-30 dark:opacity-20" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,213,190,0.08)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-12 text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse" />À l&apos;écoute
          d&apos;opportunités
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-5xl md:text-7xl font-extrabold mb-12 font-[family-name:var(--font-space-grotesk)] tracking-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          Salut, moi c&apos;est{' '}
          <span className="inline-flex">
            {name.split('').map((char, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                initial="hidden"
                animate="visible"
                className={`${char === ' ' ? 'w-3 md:w-4' : 'inline-block gradient-text-animated'}`}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
        >
          Développeur passionné par la création d&apos;expériences web modernes, performantes et
          élégantes.
        </motion.p>

        {/* CTA Button */}
        <motion.a
          href="#mes-projets"
          className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-lg transition-colors"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Voir mes projets
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            →
          </motion.span>
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-400 dark:text-neutral-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FiChevronDown size={28} />
        </motion.div>
      </motion.div>
    </section>
  );
}
