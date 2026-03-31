'use client';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FiExternalLink, FiGithub, FiInfo, FiPlay } from 'react-icons/fi';
import { findSkillIcon } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { useNeonHover } from '@/hooks/useNeonHover';
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

interface MesProjetsProps {
  projects: Project[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.4 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 2.0, ease: [0.23, 1, 0.32, 1] as const },
  },
};

export default function MesProjets({ projects }: MesProjetsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const isDark = useIsDark();
  const neonHover = useNeonHover(-10);

  if (projects.length === 0) return null;

  return (
    <section
      id="mes-projets"
      className="relative px-6 py-16 md:py-24 bg-neutral-50 dark:bg-[#0a0f1a] text-neutral-900 dark:text-white transition-colors duration-500"
    >
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
        )}
      </AnimatePresence>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,213,190,0.05)_0%,transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto">
        <m.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] as const }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">Mes Projets</h3>
        </m.div>

        <m.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          {projects.map((project: Project, index: number) => (
            <m.div key={project.id} variants={cardVariants}>
              <m.div
                className="glass-card flex flex-col h-full overflow-hidden group cursor-pointer relative"
                whileHover={neonHover.whileHover}
                transition={neonHover.transition}
                style={{ willChange: 'transform' }}
                onClick={() => {
                  setSelectedProject(project);
                  if (typeof window !== 'undefined' && window.umami) {
                    window.umami.track(`Projet Détails: ${project.title}`);
                  }
                }}
              >
                {/* Preview area */}
                <div
                  className={`h-40 relative overflow-hidden ${!project.images || project.images.length === 0 ? `bg-linear-to-br ${project.gradient}` : 'bg-neutral-100 dark:bg-neutral-800'}`}
                >
                  {project.images &&
                    project.images.length > 0 &&
                    (project.images[0].url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                      <>
                        <video
                          src={project.images[0].url}
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
                        src={project.images[0].url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 3}
                      />
                    ))}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.4)_0%,transparent_60%)] dark:bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_60%)] z-10" />
                </div>
                <div className="p-6 flex flex-col grow">
                  <h4 className="text-xl font-bold mb-3 font-(family-name:--font-space-grotesk) group-hover:text-brand-400 transition-colors duration-300 wrap-break-word line-clamp-2">
                    {project.title}
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed mb-6 wrap-break-word line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech stack */}
                  {project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.skills.map((skill: Skill, skillIndex: number) => {
                        const match = findSkillIcon(skill.icon || skill.name);
                        const Icon = match?.icon;

                        // Fallback color if skill.color is missing or mismatches
                        const color = isDark
                          ? match?.color || skill.color || '#00D5BE'
                          : match?.colorLight || match?.color || skill.color || '#00D5BE';

                        return (
                          <span
                            key={`${skill.name}-${skillIndex}`}
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
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-foreground transition-colors"
                        data-umami-event={`Projet Code: ${project.title}`}
                      >
                        <FiGithub size={16} />
                        Code
                      </a>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-100 transition-colors"
                        data-umami-event={`Projet Live: ${project.title}`}
                      >
                        <FiExternalLink size={16} />
                        Voir en ligne
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="ml-auto flex items-center gap-1.5 text-sm font-medium transition-opacity text-brand-500 hover:text-brand-100 cursor-pointer"
                      data-umami-event={`Projet Détails: ${project.title}`}
                    >
                      <FiInfo size={16} />
                      Détails
                    </button>
                  </div>
                </div>
              </m.div>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
}
