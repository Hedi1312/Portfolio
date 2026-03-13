'use client';
import { useState, useRef, useEffect } from 'react';
import { GrDocumentPdf } from 'react-icons/gr';
import { FiEye, FiDownload, FiX, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminCVPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Charger le CV existant
  useEffect(() => {
    fetch('/api/admin/cv')
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setPreviewUrl(data.url);
          setFileSize(data.size || null);
          setFileName(data.name || null);
        }
      })
      .catch(() => console.warn('Aucun CV trouvé au chargement'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/cv', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('✅ CV mis à jour avec succès !');
      setTimeout(() => setMessage(''), 5000);
      setPreviewUrl(data.url);
      setFileSize((file.size / 1024).toFixed(1) + ' Ko');
      setFileName(data.name || file.name);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setMessage(`❌ Erreur : ${data.error}`);
    }
  };

  return (
    <section className="min-h-screen bg-linear-to-b from-neutral-50 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-white p-6 pt-40 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-10 px-3 sm:px-10 w-full max-w-2xl mx-auto backdrop-blur-sm"
      >
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors mb-8 font-medium"
        >
          <FiArrowLeft className="text-lg" />
          Retour au tableau de bord
        </Link>

        <h1 className="text-3xl font-bold mb-8 text-center text-brand-500 dark:text-brand-400">
          Gestion du CV
        </h1>

        {/* === FORMULAIRE UPLOAD === */}
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50/50 dark:bg-transparent rounded-xl p-10 cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 transition-colors"
          >
            <GrDocumentPdf className="text-brand-500 dark:text-brand-400 text-5xl mb-4" />
            <p className="text-neutral-600 dark:text-neutral-300 text-center">
              {file ? (
                <>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {file.name}
                  </span>{' '}
                  prêt à être uploadé
                </>
              ) : (
                <>
                  Glisse ton fichier ici ou{' '}
                  <span className="text-brand-500 dark:text-brand-400 underline">
                    choisis-en un
                  </span>
                </>
              )}
            </p>
            <input
              id="file"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={!file}
            className="bg-brand-500 hover:bg-brand-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Mettre à jour le CV
          </button>
        </form>

        {/* === MESSAGE === */}
        {message && (
          <p
            className={`my-6 rounded-lg text-center text-base p-3 ${
              message.startsWith('✅')
                ? 'bg-success-100 text-success-700'
                : 'bg-danger-100 text-danger-700'
            }`}
          >
            {message}
          </p>
        )}

        {/* === APERÇU DU CV === */}
        {previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-10 mt-10 border-t border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold mb-6 text-center text-neutral-800 dark:text-neutral-200">
              CV actuel :
            </h2>

            <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 shadow-md dark:shadow-lg hover:shadow-[0_0_15px_rgba(0,187,167,0.1)] transition-all">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <GrDocumentPdf className="text-danger-500 text-3xl" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[250px] sm:max-w-[300px]">
                      {fileName || 'Fichier inconnu'}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {fileSize || 'Taille inconnue'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {showPreview ? (
                      <>
                        <FiX className="text-danger-400" />
                        Fermer
                      </>
                    ) : (
                      <>
                        <FiEye className="text-brand-500 dark:text-brand-400" />
                        Voir
                      </>
                    )}
                  </button>
                  <a
                    href={previewUrl}
                    download
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <FiDownload />
                    Télécharger
                  </a>
                </div>
              </div>

              {showPreview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-6"
                >
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] sm:h-[80vh] border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-inner overflow-auto"
                    allow="fullscreen"
                  />
                  <p className="text-center mt-3 text-neutral-500 dark:text-neutral-400 text-sm">
                    📱 Si la lecture est difficile,{' '}
                    <a
                      href={previewUrl}
                      target="_blank"
                      className="text-brand-500 dark:text-brand-400 underline"
                    >
                      ouvre le PDF en plein écran
                    </a>
                    .
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
