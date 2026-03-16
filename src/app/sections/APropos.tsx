'use client';
import { motion } from 'framer-motion';
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiDocker,
  SiPrisma,
  SiGit,
  SiNodedotjs,
} from 'react-icons/si';
import { useIsDark } from '@/hooks/useIsDark';

const techStack = [
  { icon: SiReact, name: 'React', color: '#61DAFB' },
  { icon: SiNextdotjs, name: 'Next.js', color: '#ffffff', colorLight: '#000000' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3178C6' },
  { icon: SiTailwindcss, name: 'Tailwind', color: '#06B6D4' },
  { icon: SiNodedotjs, name: 'Node.js', color: '#339933' },
  { icon: SiDocker, name: 'Docker', color: '#2496ED' },
  { icon: SiPrisma, name: 'Prisma', color: '#5A67D8', colorLight: '#2D3748' },
  { icon: SiGit, name: 'Git', color: '#F05032' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function APropos() {
  const isDark = useIsDark();

  return (
    <section
      id="a-propos"
      className="relative px-6 py-24 md:py-32 bg-white dark:bg-[#0f172a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">À propos</h3>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-5 gap-12 items-start">
          {/* Text column */}
          <motion.div
            className="md:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass-card p-8">
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-lg mb-6">
                Je suis un développeur front-end, passionné par la création d&apos;interfaces
                élégantes et performantes. J&apos;aime transformer des idées en expériences
                concrètes avec un soin particulier pour le design et la performance.
              </p>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Mon objectif : concevoir des applications web qui allient esthétique soignée, code
                propre et expérience utilisateur fluide. Chaque projet est une occasion
                d&apos;apprendre et de repousser mes limites.
              </p>
            </div>
          </motion.div>

          {/* Stats column */}
          <motion.div
            className="md:col-span-2 flex flex-col gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { value: '3+', label: 'Projets réalisés' },
              { value: '1+', label: "Année d'expérience" },
              { value: '∞', label: 'Motivation' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="glass-card p-6 text-center"
                variants={itemVariants}
              >
                <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-space-grotesk)]">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tech stack */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-sm uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-8 font-medium">
            Technologies
          </p>
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <motion.div
                  key={tech.name}
                  className="glass-card flex items-center gap-2.5 px-4 py-2.5 cursor-default"
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Icon size={18} style={{ color: isDark ? tech.color : (tech.colorLight || tech.color) }} />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {tech.name}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
