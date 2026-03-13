'use client';
import { motion } from 'framer-motion';

const name = 'Hëdi OKBA';

const letterVariants = {
  hidden: { opacity: 0, y: 20, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.6 + i * 0.11,
      duration: 0.55,
      ease: 'easeOut' as const,
    },
  }),
};

export default function Accueil() {
  return (
    <section
      id="home"
      className="flex flex-col items-center justify-center text-center min-h-screen px-6 bg-linear-to-b from-white to-brand-50 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-white transition-colors duration-300"
    >
      <motion.h2
        className="text-5xl font-extrabold mb-4"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        Salut, moi c&apos;est{' '}
        <span className="text-brand-400 inline-flex">
          {name.split('').map((char, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={letterVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 1 }}
              className={char === ' ' ? 'w-3' : 'inline-block'}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </span>
      </motion.h2>

      <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-xl mb-8">
        D&eacute;veloppeur passionn&eacute; par la cr&eacute;ation d&apos;exp&eacute;riences web
        modernes, performantes et &eacute;l&eacute;gantes.
      </p>

      <a
        href="#mes-projets"
        className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-lg font-semibold transition-colors"
      >
        Voir mes projets
      </a>
    </section>
  );
}
