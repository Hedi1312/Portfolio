'use client';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEye, FiDownload, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

export default function CV() {
  const [cvUrl, setCvUrl] = useState('/cv/CV_OKBA_Hedi.pdf');
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/cv')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setCvUrl(`${data.url}?t=${Date.now()}`);
        }
      })
      .catch((err) => console.error('Erreur chargement CV :', err));
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
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section
      id="cv"
      className="relative px-6 py-24 md:py-32 bg-white dark:bg-[#0f172a] text-center text-neutral-900 dark:text-white transition-colors duration-500"
    >
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">Mon CV</h3>
        </motion.div>

        {/* Glass card */}
        <motion.div
          className="glass-card p-10 mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Decorative icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-400/10 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FiEye size={32} className="text-brand-400" />
            </motion.div>
          </div>

          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            Consulte mon CV ou télécharge-le directement.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => setIsOpen(true)} variant="primary">
              <FiEye size={18} />
              Voir mon CV
            </Button>

            <Button
              onClick={handleDownload}
              variant="glass"
              isLoading={isDownloading}
              loadingText="Téléchargement en cours..."
            >
              <FiDownload size={18} className="text-brand-400" />
              Télécharger
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card max-w-5xl w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-brand-400/10 text-neutral-500 hover:text-foreground transition-all cursor-pointer"
                aria-label="Fermer la modale"
              >
                <FiX size={22} />
              </button>

              <iframe
                src={cvUrl}
                title="CV Hedi OKBA"
                className="w-full h-[80vh] rounded-xl border border-neutral-200/20 dark:border-neutral-700/30"
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
    </section>
  );
}
