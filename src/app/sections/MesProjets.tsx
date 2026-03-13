'use client';
import { motion } from 'framer-motion';
import { FiExternalLink, FiGithub } from 'react-icons/fi';

const projets = [
  {
    title: 'Portfolio Personnel',
    description:
      'Site web personnel moderne et responsive construit avec Next.js, Tailwind CSS et Framer Motion. Design premium avec glassmorphism et animations fluides.',
    tags: ['Next.js', 'Tailwind', 'Framer Motion'],
    gradient: 'from-brand-400/20 to-brand-600/20',
    link: '#',
    github: '#',
  },
  {
    title: 'Projet 2',
    description:
      'Description rapide du projet, technologies utilisées ou lien vers le code source.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    gradient: 'from-purple-400/20 to-pink-600/20',
    link: '#',
    github: '#',
  },
  {
    title: 'Projet 3',
    description:
      'Description rapide du projet, technologies utilisées ou lien vers le code source.',
    tags: ['TypeScript', 'Docker', 'Prisma'],
    gradient: 'from-blue-400/20 to-cyan-600/20',
    link: '#',
    github: '#',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function MesProjets() {
  return (
    <section
      id="mes-projets"
      className="relative px-6 py-24 md:py-32 bg-neutral-50 dark:bg-[#0a0f1a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,213,190,0.05)_0%,transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">Mes Projets</h3>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projets.map((projet, i) => (
            <motion.div
              key={i}
              className="glass-card overflow-hidden group"
              variants={cardVariants}
            >
              {/* Gradient preview area */}
              <div className={`h-40 bg-gradient-to-br ${projet.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)]" />
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full border border-white/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-lg border border-white/15 rotate-45 group-hover:rotate-90 transition-transform duration-700" />
              </div>

              {/* Card content */}
              <div className="p-6">
                <h4 className="text-xl font-bold mb-3 font-[family-name:var(--font-space-grotesk)] group-hover:text-brand-400 transition-colors duration-300">
                  {projet.title}
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-4">
                  {projet.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {projet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-brand-400/10 text-brand-400 border border-brand-400/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center gap-3">
                  <a
                    href={projet.github}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
                  >
                    <FiGithub size={16} />
                    Code
                  </a>
                  <a
                    href={projet.link}
                    className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <FiExternalLink size={16} />
                    Voir le projet
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
