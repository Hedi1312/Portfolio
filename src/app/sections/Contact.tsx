'use client';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { contactSchema } from '@/lib/schemas/contact';
import { AnimatePresence, m } from 'framer-motion';
import { useState } from 'react';
import { FiMail, FiX, FiSend, FiCheckCircle, FiPaperclip } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { useNeonHover } from '@/hooks/useNeonHover';

export default function Contact() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const neonHover = useNeonHover(-8);

  useLockBodyScroll(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setForm({ name: '', email: '', subject: '', message: '' });
      setHoneypot('');
      setFiles([]);
      setSubmitted(false);
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
  const MAX_FILES = 3;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const filesArray = Array.from(selectedFiles);
      if (filesArray.length > MAX_FILES) {
        setError('Veuillez sélectionner uniquement des fichiers .pdf, .doc ou .docx');
        setFiles([]);
        e.target.value = '';
        return;
      }
      const tooBig = filesArray.filter((f) => f.size > MAX_FILE_SIZE);
      if (tooBig.length > 0) {
        setError(
          `Fichier(s) trop volumineux (max 10 Mo) : ${tooBig.map((f) => f.name).join(', ')}`,
        );
        setFiles([]);
        e.target.value = '';
        return;
      }
      setError('');
      setFiles(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validation = contactSchema.safeParse(form);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('subject', form.subject);
    formData.append('message', form.message);
    formData.append('company', honeypot);

    files.forEach((f) => formData.append('files', f));

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        setHoneypot('');
        setFiles([]);
        if (typeof window !== 'undefined' && window.umami)
          window.umami.track('contact-form-submit');
        setTimeout(() => setIsOpen(false), 2500);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi du message.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/50 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none transition-all duration-200';

  return (
    <>
      <m.div
        className="glass-card p-8 md:p-12 text-center h-full flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
        whileHover={neonHover.whileHover}
        transition={neonHover.transition}
        style={{ willChange: 'transform' }}
        onClick={() => {
          setSubmitted(false);
          setIsOpen(true);
        }}
      >
        <div className="w-16 h-16 mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white transition-colors mx-auto">
          <FiMail size={28} />
        </div>

        <h4 className="text-3xl font-bold mb-3 font-(family-name:--font-space-grotesk) text-neutral-900 dark:text-white text-center">
          Discutons de ton projet
        </h4>

        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-md grow leading-relaxed mx-auto text-center">
          Tu as une idée en tête, un besoin technique spécifique ou tu cherches un développeur pour
          rejoindre ton équipe ? Je lis tous mes messages et réponds très rapidement.
        </p>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSubmitted(false);
            setIsOpen(true);
          }}
          variant="primary"
          className="w-fit hover:-translate-y-1 hover:shadow-xl mx-auto"
          data-umami-event="click-contact-open"
        >
          <FiMail size={18} />
          M&apos;envoyer un message
        </Button>
      </m.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={handleClose}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="glass-card max-w-lg w-full p-8 relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-brand-400/10 text-neutral-500 hover:text-foreground transition-all cursor-pointer"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1 font-(family-name:--font-space-grotesk)">
                <span className="gradient-text">Contacte-moi</span>
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Je te réponds en moins de 24h.
              </p>

              {error && (
                <div className="mb-4 rounded-xl bg-danger-50 dark:bg-danger-100/10 border border-danger-200 dark:border-danger-500/30 p-3 text-center text-danger-600 dark:text-danger-400 text-sm font-medium">
                  {error}
                </div>
              )}

              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="company"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Prénom NOM
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      placeholder="Prénom NOM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      placeholder="exemple@exemple.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Sujet
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                      placeholder="Ex : Proposition de collaboration"
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className={inputClasses}
                      placeholder="Ton message..."
                    ></textarea>
                  </div>

                  {/* Upload Fichiers Multiples UI */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Pièces jointes (optionnel - max 10 Mo)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        title="Ajouter des fichiers"
                      />
                      <div className="w-full flex items-center justify-between p-3.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600 bg-neutral-50/30 dark:bg-neutral-800/20 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <FiPaperclip size={16} />
                          {files.length > 0 ? (
                            <span className="text-foreground font-medium">
                              {files.length} fichier(s) sélectionné(s)
                            </span>
                          ) : (
                            <span>Clique ou glisse tes fichiers ici</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Liste des fichiers sélectionnés */}
                    {files.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {files.map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-md"
                          >
                            <FiPaperclip size={10} />
                            {f.name}
                            <button
                              type="button"
                              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                              className="text-neutral-400 hover:text-danger-500 cursor-pointer ml-1"
                            >
                              <FiX size={12} />
                            </button>
                          </span>
                        ))}
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFiles([])}
                            className="text-xs text-neutral-400 hover:text-danger-500 cursor-pointer ml-1"
                          >
                            Tout retirer
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText="Envoi en cours..."
                    fullWidth
                    className="mt-6"
                  >
                    <FiSend size={16} />
                    Envoyer
                  </Button>
                </form>
              ) : (
                <m.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  >
                    <FiCheckCircle size={56} className="text-success-400 mx-auto mb-4" />
                  </m.div>
                  <p className="text-xl font-semibold mb-2">Message envoyé !</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Je te réponds très vite
                  </p>
                </m.div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
