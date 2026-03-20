'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  FiX,
  FiGithub,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
} from 'react-icons/fi';
import { SKILL_ICONS } from '@/lib/skill-icons';
import { useIsDark } from '@/hooks/useIsDark';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const slideVariants = {
  enter: { opacity: 0, scale: 0.98 },
  center: { opacity: 1, scale: 1, zIndex: 1 },
  exit: { opacity: 0, scale: 1.02, zIndex: 0 },
};
import { Project } from '@/app/sections/MesProjets';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const isDark = useIsDark();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Prevent background scrolling while modal is open
  useLockBodyScroll(true);

  const images = project.images || [];
  const [direction, setDirection] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isFullScreen) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [images.length, currentImageIndex, isFullScreen]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };



  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 20, scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative flex flex-col md:flex-row w-[95vw] max-w-7xl md:h-[750px] max-h-[95vh] lg:max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full transition-colors cursor-pointer shadow-sm"
          >
            <FiX size={18} />
          </button>

          {/* Left Side: Images Carousel */}
          <div
            className={`w-full md:w-[65%] h-[40vh] md:h-full shrink-0 relative bg-gradient-to-br ${project.gradient} overflow-hidden group`}
          >
            {images.length > 0 ? (
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                {images.map(
                  (img, idx) =>
                    idx === currentImageIndex && (
                      <motion.div
                        key={img.id}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          opacity: { duration: 0.4 },
                          scale: { duration: 0.4, ease: 'easeOut' },
                        }}
                        className="absolute inset-0"
                      >
                        {img.url.match(/\.(mp4|webm|mov|avi)$/i) ? (
                          <>
                            <video
                              src={img.url}
                              className="object-contain w-full h-full cursor-zoom-in bg-black/30 backdrop-blur-md"
                              autoPlay
                              muted
                              loop
                              playsInline
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFullScreen(true);
                              }}
                            />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white/90 text-xs font-medium flex items-center gap-1.5 pointer-events-none z-10">
                              <FiPlay size={12} fill="currentColor" /> Vidéo
                            </div>
                          </>
                        ) : (
                          <Image
                            src={img.url}
                            alt={`${project.title} - screen ${idx + 1}`}
                            fill
                            className="object-contain cursor-zoom-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFullScreen(true);
                            }}
                            sizes="(max-width: 768px) 100vw, 65vw"
                          />
                        )}
                      </motion.div>
                    ),
                )}
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white/60 dark:bg-black/40 text-neutral-800 dark:text-white/90 px-6 py-3 rounded-2xl backdrop-blur-md font-medium shadow-sm">
                  Aucune image pour ce projet
                </span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto cursor-pointer z-10"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto cursor-pointer z-10"
                >
                  <FiChevronRight size={24} />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Side: Details */}
          <div className="w-full md:w-[35%] p-6 md:p-10 flex flex-col h-full overflow-y-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 font-(family-name:--font-space-grotesk) text-neutral-900 dark:text-white break-words">
              {project.title}
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.skills.map((skill) => {
                const match = SKILL_ICONS[skill.name.toLowerCase()];
                const Icon = match?.icon;
                return (
                  <span
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-brand-400/10 text-brand-600 dark:text-brand-400 border border-brand-400/20"
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        style={{ color: isDark ? match.color : match.colorLight || match.color }}
                      />
                    )}
                    {skill.name}
                  </span>
                );
              })}
            </div>

            <div className="prose prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 grow break-words">
              {project.description.split('\\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex items-center gap-2 sm:gap-4 mt-auto pt-6 border-t border-neutral-100 dark:border-neutral-800">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium transition-colors cursor-pointer min-w-0"
                  data-umami-event={`Projet Code: ${project.title}`}
                >
                  <FiGithub size={16} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm truncate">Code source</span>
                </a>
              )}
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-lg hover:shadow-brand-500/25 transition-all cursor-pointer min-w-0"
                  data-umami-event={`Projet Live: ${project.title}`}
                >
                  <FiExternalLink size={16} className="shrink-0 sm:w-[18px] sm:h-[18px]" />
                  <span className="text-xs sm:text-sm truncate">Voir en ligne</span>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Full Screen Image Viewer */}
      <AnimatePresence>
        {isFullScreen && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-lg"
            onClick={() => setIsFullScreen(false)}
          >
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 z-10 p-1.5 bg-neutral-100/10 hover:bg-neutral-100/20 text-white rounded-full transition-colors cursor-pointer backdrop-blur-md"
            >
              <FiX size={18} />
            </button>

            {images[currentImageIndex].url.match(/\.(mp4|webm|mov|avi)$/i) ? (
              <video
                src={images[currentImageIndex].url}
                className="object-contain w-full h-full"
                autoPlay
                controls
                playsInline
              />
            ) : (
              <Image
                src={images[currentImageIndex].url}
                alt={`${project.title} - fullscreen`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                >
                  <FiChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev + 1) % images.length);
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
