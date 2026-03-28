'use client';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEye, FiDownload, FiX, FiFileText } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useNeonHover } from '@/hooks/useNeonHover';

export default function CV() {
  const [cvUrl, setCvUrl] = useState('/cv/CV_OKBA_Hedi.pdf');
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const neonHover = useNeonHover(-8);

  useEffect(() => {
    fetch('/api/admin/cv')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setCvUrl(`${data.url}?t=${Date.now()}`);
        }
      })
      .catch((_err) => {});
  }, []);

  useLockBodyScroll(isOpen);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(cvUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV_OKBA_Hedi.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_error) {
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <motion.div
        className="glass-card p-8 md:p-10 flex flex-col items-center justify-center text-center h-full group relative overflow-hidden"
        whileHover={neonHover.whileHover}
        transition={neonHover.transition}
        style={{ willChange: 'transform' }}
      >

        <div className="w-16 h-16 mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-brand-400 transition-colors">
          <FiFileText size={28} />
        </div>

        <h4 className="text-3xl font-bold mb-3 font-(family-name:--font-space-grotesk) text-neutral-900 dark:text-white">
          Consulter mon profil
        </h4>

        <p className="text-neutral-500 dark:text-neutral-400 mb-8 grow">
          Découvre mon parcours détaillé, mes compétences et mes expériences, ou télécharge mon CV
          complet au format PDF.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
          <Button
            onClick={() => setIsOpen(true)}
            variant="primary"
            className="flex-1 hover:-translate-y-1 hover:shadow-xl"
            data-umami-event="click-cv-view"
          >
            <FiEye size={18} />
            Voir mon CV
          </Button>

          <Button
            onClick={handleDownload}
            variant="secondary"
            className="flex-1 hover:-translate-y-1 hover:shadow-xl"
            isLoading={isDownloading}
            loadingText="Téléchargement..."
            data-umami-event="click-cv-download"
          >
            <FiDownload size={18} className="text-brand-400" />
            Télécharger
          </Button>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="glass-card max-w-5xl w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 z-10 p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-full transition-colors cursor-pointer shadow-sm"
                aria-label="Fermer la modale"
              >
                <FiX size={18} />
              </button>

              <iframe
                src={cvUrl}
                title="CV Hedi OKBA"
                className="w-full h-[80vh] rounded-xl border border-neutral-200/20 dark:border-neutral-700/30 bg-white"
              />
              <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-4">
                📱 Si l&apos;affichage n&apos;est pas optimal,{' '}
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:underline"
                >
                  ouvrez le CV en plein écran
                </a>
                .
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
