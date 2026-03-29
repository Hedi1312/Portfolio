'use client';
import { useIsDark } from '@/hooks/useIsDark';
import { useNeonHover, buildNeonHover } from '@/hooks/useNeonHover';
import type { NeonHoverConfig } from '@/hooks/useNeonHover';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FiGrid, FiZap } from 'react-icons/fi';

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
    transition: { staggerChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: [0.23, 1, 0.32, 1] as const },
  },
};

const renderTechTag = (tech: TechItem, index: number, isDark: boolean, neon: NeonHoverConfig) => {
  const match = tech.icon ? SKILL_ICONS[tech.icon] : null;
  const Icon = match?.icon;
  return (
    <motion.div
      key={`${tech.name}-${index}`}
      className="glass-card flex items-center justify-center gap-2.5 px-5 py-3 cursor-default"
      whileHover={neon.whileHover}
      transition={neon.transition}
    >
      {Icon && (
        <Icon
          size={20}
          style={{
            color: isDark ? match.color : match.colorLight || match.color,
          }}
        />
      )}
      <span className="text-[15px] font-medium text-neutral-700 dark:text-neutral-200 whitespace-nowrap">
        {tech.name}
      </span>
    </motion.div>
  );
};

const TechMarquee = ({
  items,
  reverse = false,
  isDark,
}: {
  items: TechItem[];
  reverse?: boolean;
  isDark: boolean;
}) => {
  const neonTag = buildNeonHover(-4, isDark);
  // Optimized marquee: translating the parent avoids multiple GPU layer repaints.
  // L'animation devient instantanément parfaitement fluide à 60 FPS.
  const multipliedItems = [...items, ...items, ...items, ...items];

  const halfBlock = (
    <div className="flex gap-6 pr-6 items-center shrink-0">
      {multipliedItems.map((tech, i) => renderTechTag(tech, i, isDark, neonTag))}
    </div>
  );

  return (
    <div className="flex overflow-hidden group relative w-full py-4 -my-4 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-right' : 'animate-marquee-left'} group-hover:[animation-play-state:paused]`}
      >
        {halfBlock}
        {halfBlock}
      </div>
    </div>
  );
};

export default function APropos() {
  const isDark = useIsDark();
  const neonBio = useNeonHover(-8);
  const neonStat = useNeonHover(-6);
  const neonTag = buildNeonHover(-4, isDark);
  const [data, setData] = useState<AboutData | null>(null);
  const [isAnimated, setIsAnimated] = useState(true);

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
      .catch((_err) => {});
  }, []);

  if (!data) return null;
  if (!data.bio && data.stats.length === 0 && data.techs.length === 0) return null;

  // Split bio into paragraphs
  const paragraphs = data.bio.split('\n\n').filter((p) => p.trim());

  // Split technos into two rows for marquee
  const halfLength = Math.ceil(data.techs.length / 2);
  const row1 = data.techs.slice(0, halfLength);
  const row2 = data.techs.slice(halfLength);

  return (
    <section
      id="a-propos"
      className="relative px-6 py-16 md:py-24 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white transition-colors duration-500 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">À propos</h3>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-5 gap-12 items-start mb-24 max-w-5xl mx-auto">
          {/* Text column */}
          {paragraphs.length > 0 && (
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 2.0, ease: [0.23, 1, 0.32, 1] as const }}
            >
              <motion.div
                className="glass-card p-8"
                whileHover={neonBio.whileHover}
                transition={neonBio.transition}
              >
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
              </motion.div>
            </motion.div>
          )}

          {/* Stats column */}
          {data.stats.length > 0 && (
            <motion.div
              className="md:col-span-2 flex flex-col gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
            >
              {data.stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  className="glass-card p-6 text-center"
                  variants={itemVariants}
                  whileHover={neonStat.whileHover}
                  transition={neonStat.transition}
                >
                  <p className="text-3xl font-bold gradient-text font-(family-name:--font-space-grotesk)">
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

        {/* Infinite Tech stack Marquee */}
        {data.techs.length > 0 && (
          <motion.div
            className="w-full relative py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 2.0, ease: [0.23, 1, 0.32, 1] as const }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-10">
              <p className="text-center text-md md:text-lg uppercase tracking-widest text-neutral-900 dark:text-white font-medium m-0">
                Technologies & Outils
              </p>
              <button
                onClick={() => setIsAnimated(!isAnimated)}
                className="px-4 py-2 cursor-pointer text-xs sm:text-sm font-bold text-neutral-900 dark:text-white bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 border border-brand-400 rounded-full shadow-sm transition-colors"
                title={isAnimated ? 'Passer en vue statique' : 'Activer le défilement'}
              >
                {isAnimated ? (
                  <span className="flex items-center gap-2">
                    <FiGrid className="w-4 h-4" />
                    Mode grille
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FiZap className="w-4 h-4" />
                    Mode défilement
                  </span>
                )}
              </button>
            </div>

            {isAnimated ? (
              <div className="relative w-screen left-1/2 -translate-x-1/2 flex flex-col gap-4 sm:gap-6">
                <TechMarquee items={row1} isDark={isDark} />
                <TechMarquee items={row2} reverse={true} isDark={isDark} />
              </div>
            ) : (
              <motion.div
                className="flex flex-wrap justify-center gap-3"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
              >
                {data.techs.map((tech, i) => renderTechTag(tech, i, isDark, neonTag))}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
