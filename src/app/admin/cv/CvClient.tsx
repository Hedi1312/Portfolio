'use client';
import { useState, useRef, useEffect } from 'react';
import { directUploadToCloudinary } from '@/lib/cloudinary-client';
import { GrDocumentPdf } from 'react-icons/gr';
import { FiEye, FiDownload, FiX, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function CvClient({
  initialCv,
}: {
  initialCv: { url: string; size: string; name: string } | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast, showToast, hideToast } = useToast();

  // Load existing CV from props
  useEffect(() => {
    if (initialCv?.url) {
      setPreviewUrl(initialCv.url);
      setFileSize(initialCv.size || null);
      setFileName(initialCv.name || null);
    }
  }, [initialCv]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      showToast('error', 'Le CV ne doit pas dépasser 10 Mo.');
      e.target.value = '';
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];

      if (droppedFile.size > 10 * 1024 * 1024) {
        showToast('error', 'Le CV ne doit pas dépasser 10 Mo.');
        return;
      }

      if (
        droppedFile.type === 'application/pdf' ||
        droppedFile.name.toLowerCase().endsWith('.pdf')
      ) {
        setFile(droppedFile);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(droppedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      } else {
        showToast('error', 'Veuillez déposer un fichier au format PDF.');
      }
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsDeleting(true);
    try {
      const { deleteCvAction } = await import('@/actions/cv.action');
      const res = await deleteCvAction();
      if (res.success) {
        showToast('success', 'CV supprimé avec succès !');
        setPreviewUrl('');
        setFileSize(null);
        setFileName(null);
        setShowPreview(false);
      } else {
        showToast('error', `Erreur : ${res.error}`);
      }
    } catch (_err) {
      showToast('error', 'Erreur réseau lors de la suppression.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      // 1. Modify PDF metadata on client side
      const bytes = await file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(bytes);
      pdfDoc.setTitle('CV_OKBA_Hedi');
      pdfDoc.setAuthor('Hedi OKBA');
      pdfDoc.setSubject('Curriculum Vitae');
      pdfDoc.setProducer('Portfolio Hedi OKBA');
      pdfDoc.setCreator('Portfolio Hedi OKBA');

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedBlob = new Blob([modifiedPdfBytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const modifiedFile = new File([modifiedBlob], 'CV_OKBA_Hedi.pdf', {
        type: 'application/pdf',
      });
      const sizeStr = (modifiedPdfBytes.length / 1024).toFixed(1) + ' Ko';

      // 2. Direct Upload vers Cloudinary
      const uploaded = await directUploadToCloudinary(modifiedFile, {
        subfolder: 'cv',
        resource_type: 'image',
        public_id: 'CV_OKBA_Hedi',
      });

      // 3. Send metadata to backend via Server Action
      const { uploadCvAction } = await import('@/actions/cv.action');
      const res = await uploadCvAction({
        url: uploaded.url,
        public_id: uploaded.public_id,
        resource_type: uploaded.resource_type,
        size: sizeStr,
      });

      if (res.success) {
        showToast('success', 'CV mis à jour avec succès !');
        const data = res.data as { url: string; name: string };
        setPreviewUrl(data.url);
        setFileSize(sizeStr);
        setFileName(data.name);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        showToast('error', `Erreur : ${res.error}`);
      }
    } catch (_err) {
      showToast('error', "Erreur lors de l'upload du CV.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'CV.pdf';
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
      <ToastContainer toast={toast} onClose={hideToast} />
      <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
        <div className="mx-auto max-w-7xl w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                aria-label="Retour au tableau de bord"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                  <GrDocumentPdf className="text-brand-500" />
                  Gestion du CV
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Gérez votre document PDF public
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full relative z-10">
            {/* Colonne de gauche : Upload */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
                  Uploader un nouveau CV
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col items-center">
                  <label
                    htmlFor="file"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 shadow-inner'
                        : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10'
                    }`}
                  >
                    <GrDocumentPdf className="text-neutral-400 dark:text-neutral-500 text-4xl mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400 text-center text-sm">
                      {file ? (
                        <>
                          <span className="font-semibold text-neutral-900 dark:text-white block mb-1">
                            {file.name}
                          </span>
                          prêt à être uploadé
                        </>
                      ) : (
                        <>
                          Glissez votre fichier ici ou{' '}
                          <span className="text-brand-500 dark:text-brand-400 font-medium">
                            parcourez
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

                  <Button
                    type="submit"
                    disabled={!file || loading}
                    isLoading={loading}
                    loadingText="Envoi en cours..."
                    className="w-full"
                  >
                    Mettre à jour le CV
                  </Button>
                </form>
              </div>
            </div>

            {/* Colonne de droite : Aperçu actuel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">
                  Fichier actuel en ligne
                </h2>

                {previewUrl ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between flex-wrap lg:flex-nowrap gap-4 mb-6 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                          <GrDocumentPdf className="text-brand-500 text-xl" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 dark:text-white truncate">
                            {fileName || 'CV_OKBA_Hedi.pdf'}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {fileSize || 'Taille inconnue'}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button
                          onClick={handleDeleteClick}
                          variant="danger"
                          isLoading={isDeleting}
                          className="py-2 px-3 h-auto text-sm"
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowPreview(!showPreview)}
                          className="py-2 px-3 h-auto text-sm"
                        >
                          {showPreview ? (
                            <>
                              <FiX className="text-brand-500 dark:text-brand-400" />
                              Masquer
                            </>
                          ) : (
                            <>
                              <FiEye className="text-brand-500 dark:text-brand-400" />
                              Aperçu
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleDownload}
                          variant="primary"
                          isLoading={isDownloading}
                          className="py-2 px-3 h-auto text-sm"
                        >
                          <FiDownload />
                        </Button>
                      </div>
                    </div>

                    {showPreview ? (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex-1"
                      >
                        <iframe
                          src={previewUrl}
                          className="w-full h-[60vh] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-inner bg-neutral-100 dark:bg-neutral-950"
                          allow="fullscreen"
                        />
                      </m.div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 p-12">
                        <FiEye className="text-neutral-300 dark:text-neutral-600 text-5xl mb-4" />
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                          Cliquez sur &quot;Aperçu&quot; pour visualiser le document
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50/50 dark:bg-neutral-800/30 p-12">
                    <GrDocumentPdf className="text-neutral-300 dark:text-neutral-600 text-5xl mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                      Aucun CV actuellement en ligne.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Supprimer le CV"
        message="Êtes-vous sûr de vouloir supprimer définitivement votre CV ? Le web ne pardonne pas."
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
