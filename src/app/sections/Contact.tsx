'use client';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { FiMail, FiX, FiSend, FiCheckCircle, FiPaperclip } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

export default function Contact() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  useLockBodyScroll(isOpen);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
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
        setFileError(`Maximum ${MAX_FILES} fichiers autorisés.`);
        setFiles([]);
        e.target.value = '';
        return;
      }
      const tooBig = filesArray.filter((f) => f.size > MAX_FILE_SIZE);
      if (tooBig.length > 0) {
        setFileError(
          `Fichier(s) trop volumineux (max 10 Mo) : ${tooBig.map((f) => f.name).join(', ')}`,
        );
        setFiles([]);
        e.target.value = '';
        return;
      }
      setFileError('');
      setFiles(filesArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
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
        setForm({ name: '', email: '', message: '' });
        setHoneypot('');
        setFiles([]);
        if (typeof window !== 'undefined' && window.umami) window.umami.track('contact-form-submit');
        setTimeout(() => setIsOpen(false), 2500);
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'envoi du message.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    'w-full p-3.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/50 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20 focus:outline-none transition-all duration-200';

  return (
    <section
      id="contact"
      className="relative px-6 py-24 md:py-32 bg-neutral-50 dark:bg-[#0a0f1a] text-center text-neutral-900 dark:text-white transition-colors duration-500"
    >
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,213,190,0.06)_0%,transparent_60%)]" />

      <div className="relative max-w-2xl mx-auto">
        {/* Section heading */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl md:text-4xl section-heading">Contact</h3>
        </motion.div>

        <motion.p
          className="text-neutral-500 dark:text-neutral-400 mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Tu veux collaborer ou discuter d&apos;un projet ?
        </motion.p>

        <motion.button
          onClick={() => {
            setSubmitted(false);
            setIsOpen(true);
          }}
          className="btn-glow inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-lg transition-colors cursor-pointer"
          data-umami-event="click-contact-open"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiMail size={20} />
          Me contacter
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-card max-w-lg w-full p-8 relative text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-brand-400/10 text-neutral-500 hover:text-foreground transition-all cursor-pointer"
              >
                <FiX size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-1 font-[family-name:var(--font-space-grotesk)]">
                <span className="gradient-text">Contacte-moi</span>
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Je te réponds en moins de 24h.
              </p>

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
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className={`${inputClasses} resize-none`}
                      placeholder="Mon message..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-2">
                      Pièces jointes
                    </label>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/50 text-neutral-500 dark:text-neutral-400 hover:border-brand-400 hover:text-brand-400 cursor-pointer transition-all text-sm">
                      <FiPaperclip size={16} />
                      Parcourir les fichiers
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {fileError && <p className="text-xs text-danger-500 mt-1.5">{fileError}</p>}
                    <p className="text-xs text-neutral-400 mt-4">Max 3 fichiers, 10 Mo chacun</p>
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
                              className="text-neutral-400 hover:text-danger-500 cursor-pointer"
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
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  >
                    <FiCheckCircle size={56} className="text-success-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-xl font-semibold mb-2">Message envoyé !</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Je te réponds très vite 🚀
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
