'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiExternalLink, FiGithub, FiInfo, FiPlay } from 'react-icons/fi';
import { findSkillIcon } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { ProjectModal } from '@/components/ProjectModal';

export interface ProjectImage {
  id: string;
  url: string;
  order: number;
}

export interface Skill {
  id: string;
  name: string;
  icon?: string | null;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  gradient: string;
  link?: string | null;
  github?: string | null;
  skills: Skill[];
  images?: ProjectImage[];
}

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
  const [projets, setProjets] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isDark = useIsDark();

  useEffect(() => {
    fetch('/api/admin/projects')
      .then((res) => res.json())
      .then((data: Project[] | { error: string }) => {
        if (Array.isArray(data)) {
          // Ne garder que les projets visibles (le backend les envoie tous)
          setProjets(data.filter((p: Project & { visible?: boolean }) => p.visible !== false));
        } else {
          console.error('Erreur API:', data.error);
        }
      })
      .catch((err) => console.error('Erreur chargement projets:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (projets.length === 0) return null;

  return (
    <section
      id="mes-projets"
      className="relative px-6 py-24 md:py-32 bg-neutral-50 dark:bg-[#0a0f1a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

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
          {projets.map((projet, index) => (
            <motion.div
              key={projet.id}
              className="glass-card flex flex-col h-full overflow-hidden group cursor-pointer hover:shadow-brand-500/10 transition-shadow"
              variants={cardVariants}
              onClick={() => {
                setSelectedProject(projet);
                if (typeof window !== 'undefined' && window.umami) {
                  window.umami.track(`Projet Détails: ${projet.title}`);
                }
              }}
            >
              {/* Preview area */}
              <div
                className={`h-40 relative overflow-hidden ${!projet.images || projet.images.length === 0 ? `bg-gradient-to-br ${projet.gradient}` : 'bg-neutral-100 dark:bg-neutral-800'}`}
              >
                {projet.images &&
                  projet.images.length > 0 &&
                  (projet.images[0].url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                    <>
                      <video
                        src={projet.images[0].url}
                        className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700 pointer-events-none"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                        <div className="bg-black/50 p-3 rounded-full text-white backdrop-blur-sm shadow-lg border border-white/20">
                          <FiPlay fill="currentColor" size={20} className="ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={projet.images[0].url}
                      alt={projet.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-all duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  ))}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)] z-10" />
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full border border-black/10 dark:border-white/20 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-4 left-4 w-8 h-8 rounded-lg border border-black/10 dark:border-white/15 rotate-45 group-hover:rotate-90 transition-transform duration-700" />
              </div>

              {/* Card content */}
              <div className="p-6 flex flex-col grow">
                <h4 className="text-xl font-bold mb-3 font-(family-name:--font-space-grotesk) group-hover:text-brand-400 transition-colors duration-300 break-words line-clamp-2">
                  {projet.title}
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6 break-words line-clamp-3">
                  {projet.description}
                </p>

                {/* Skills with icons */}
                {projet.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {projet.skills.map((skill, index) => {
                      const match = findSkillIcon(skill.icon || skill.name);
                      const Icon = match?.icon;

                      // Fallback pour la couleur si skill.color n'existe pas ou match.color est différent
                      const color = isDark
                        ? match?.color || skill.color || '#00D5BE'
                        : match?.colorLight || match?.color || skill.color || '#00D5BE';

                      return (
                        <span
                          key={`${skill.name}-${index}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[0.8125rem] font-medium rounded-full bg-brand-400/10 text-brand-600 dark:text-brand-400 border border-brand-400/20 shadow-sm"
                        >
                          {Icon && <Icon size={12} style={{ color }} />}
                          {skill.name}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Links */}
                <div className="flex items-center gap-3 mt-auto pt-4">
                  {projet.github && (
                    <a
                      href={projet.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
                      data-umami-event={`Projet Code: ${projet.title}`}
                    >
                      <FiGithub size={16} />
                      Code
                    </a>
                  )}
                  {projet.link && (
                    <a
                      href={projet.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-100 transition-colors"
                      data-umami-event={`Projet Live: ${projet.title}`}
                    >
                      <FiExternalLink size={16} />
                      Voir en ligne
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProject(projet);
                    }}
                    className="ml-auto flex items-center gap-1.5 text-sm font-medium transition-opacity text-brand-500 hover:text-brand-100 cursor-pointer"
                    data-umami-event={`Projet Détails: ${projet.title}`}
                  >
                    <FiInfo size={16} />
                    Détails
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
