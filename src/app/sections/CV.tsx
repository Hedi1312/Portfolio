'use client';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useEffect, useState } from 'react';
import { FiEye, FiX } from 'react-icons/fi';
import { GrDocumentPdf } from 'react-icons/gr';

export default function CV() {
  const [cvUrl, setCvUrl] = useState('/cv/CV_OKBA_Hedi.pdf');
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <section id="cv" className="px-6 py-20 bg-neutral-900 text-center text-white">
      <h3 className="text-3xl font-bold mb-6">Mon CV</h3>
      <p className="text-neutral-300 mb-8">Consulte mon CV ou télécharge-le directement.</p>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          <FiEye className="text-white text-lg" />
          Voir mon CV
        </button>

        <a
          href={cvUrl}
          download
          className="flex items-center gap-2 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg font-semibold transition-colors"
        >
          <GrDocumentPdf className="w-5 h-5 text-danger-400" />
          Télécharger
        </a>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-neutral-900 rounded-xl shadow-lg max-w-5xl w-full p-4 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-3 text-neutral-400 hover:text-white text-3xl cursor-pointer"
              aria-label="Fermer la modale"
            >
              <FiX />
            </button>

            <iframe
              src={cvUrl}
              title="CV Hedi OKBA"
              className="w-full h-[80vh] rounded-lg border border-neutral-700"
            ></iframe>
            <p className="text-center text-neutral-400 text-sm mt-4">
              📱 Si l’affichage n’est pas optimal,{' '}
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
          </div>
        </div>
      )}
    </section>
  );
}
