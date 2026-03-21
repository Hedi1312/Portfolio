'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';

interface StatItem {
  value: string;
  label: string;
}

interface TechItem {
  name: string;
  icon: string | null;
  color: string;
}

interface AboutData {
  bio: string;
  stats: StatItem[];
  techs: TechItem[];
}

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
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    fetch('/api/admin/about')
      .then((res) => res.json())
      .then((d) => {
        setData({
          bio: d.bio || '',
          stats: Array.isArray(d.stats) ? d.stats : [],
          techs: (d.techs || []).map((t: TechItem) => ({
            name: t.name,
            icon: t.icon,
            color: t.color,
          })),
        });
      })
      .catch((err) => console.error('Erreur chargement à propos:', err));
  }, []);

  if (!data) return null;
  if (!data.bio && data.stats.length === 0 && data.techs.length === 0) return null;

  // Séparer le bio en paragraphes
  const paragraphs = data.bio.split('\n\n').filter((p) => p.trim());

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
          {paragraphs.length > 0 && (
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="glass-card p-8">
                {paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`leading-relaxed ${
                      idx === 0
                        ? 'text-neutral-600 dark:text-neutral-300 text-lg mb-6'
                        : 'text-neutral-500 dark:text-neutral-400'
                    }${idx < paragraphs.length - 1 ? ' mb-6' : ''}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats column */}
          {data.stats.length > 0 && (
            <motion.div
              className="md:col-span-2 flex flex-col gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {data.stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="glass-card p-6 text-center"
                  variants={itemVariants}
                >
                  <p className="text-3xl font-bold gradient-text font-[family-name:var(--font-space-grotesk)]">
                    {stat.value}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Tech stack */}
        {data.techs.length > 0 && (
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
              {data.techs.map((tech) => {
                const match = tech.icon ? SKILL_ICONS[tech.icon] : null;
                const Icon = match?.icon;
                return (
                  <motion.div
                    key={tech.name}
                    className="glass-card flex items-center gap-2.5 px-4 py-2.5 cursor-default"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        style={{
                          color: isDark ? match.color : match.colorLight || match.color,
                        }}
                      />
                    )}
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {tech.name}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
