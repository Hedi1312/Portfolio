'use client';

import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Shield, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiAlertTriangle, FiLock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { useFocusTrap } from '@/hooks/useFocusTrap';

export default function SecuritySettingsClient({
  initialIs2FAEnabled,
}: {
  initialIs2FAEnabled: boolean;
}) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(initialIs2FAEnabled);
  const [setupStep, setSetupStep] = useState<'idle' | 'scanning' | 'verifying'>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secretStr, setSecretStr] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Disable modal state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState('');
  const disableModalRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(showDisableModal);
  useFocusTrap(disableModalRef, showDisableModal);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/2fa/generate', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erreur lors de la génération');

      const qrUrl = await QRCode.toDataURL(data.otpauthUrl, {
        width: 250,
        margin: 2,
        color: { dark: '#000000ff', light: '#ffffffff' },
      });

      setQrCodeDataUrl(qrUrl);
      setSecretStr(data.secret);
      setSetupStep('scanning');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6 || !secretStr) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpCode, secret: secretStr }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Code invalide');

      setIs2FAEnabled(true);
      setSetupStep('idle');
      setQrCodeDataUrl(null);
      setSecretStr(null);
      setOtpCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const openDisableModal = () => {
    setDisableCode('');
    setDisableError('');
    setShowDisableModal(true);
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      setDisableError('Entre un code à 6 chiffres.');
      return;
    }

    setDisableLoading(true);
    setDisableError('');
    try {
      const res = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: disableCode }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Impossible de désactiver le 2FA');

      setIs2FAEnabled(false);
      setShowDisableModal(false);
      setDisableCode('');
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-background transition-colors duration-300 px-4 md:px-6 pt-28 md:pt-36 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl w-full"
        >
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
                  <Shield className="text-brand-500" />
                  Sécurité (A2F)
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Gère les paramètres de sécurité de ton compte.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="space-y-6">
                {/* Current State */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl shrink-0 ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}
                    >
                      {is2FAEnabled ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <Shield className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        Authentification à double facteur (A2F)
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        {is2FAEnabled
                          ? 'Ton compte est sécurisé. Un code sera demandé à chaque connexion.'
                          : 'Ajoute une couche de sécurité supplémentaire lors de la connexion.'}
                      </p>
                    </div>
                  </div>

                  {is2FAEnabled && (
                    <Button
                      onClick={openDisableModal}
                      disabled={loading}
                      variant="danger"
                      className="shrink-0"
                    >
                      Désactiver
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20">
                    {error}
                  </div>
                )}

                {/* Setup Flow */}
                {!is2FAEnabled && setupStep === 'idle' && (
                  <div>
                    <Button
                      onClick={handleStartSetup}
                      disabled={loading}
                      className="shadow-[0_0_15px_rgba(0,187,167,0.25)] hover:shadow-[0_0_20px_rgba(0,187,167,0.4)]"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <FiLock className="w-4 h-4 mr-2" />
                      )}
                      Activer l&apos;A2F
                    </Button>
                  </div>
                )}

                {setupStep === 'scanning' && qrCodeDataUrl && (
                  <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">
                          1
                        </span>
                        Scanner le QR Code
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Ouvre ton application d&apos;authentification (Google Authenticator, Authy,
                        etc.) et scanne ce code.
                      </p>
                      <div className="p-4 bg-white rounded-xl inline-block shadow-sm">
                        <Image
                          src={qrCodeDataUrl}
                          alt="QR Code 2FA"
                          width={192}
                          height={192}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">
                          2
                        </span>
                        Vérifier le code
                      </h4>
                      <p className="text-sm text-neutral-500">
                        Entre le code à 6 chiffres généré par ton application pour confirmer
                        l&apos;activation.
                      </p>
                      <form onSubmit={handleVerify} className="space-y-4">
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                            value={otpCode}
                            onChange={(e) =>
                              setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                            }
                            placeholder="000000"
                            className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 pl-10 pr-4 py-3 text-lg tracking-[0.5em] font-mono text-center text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                            required
                            maxLength={6}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setSetupStep('idle')}
                            className="flex-1"
                          >
                            Annuler
                          </Button>
                          <Button
                            type="submit"
                            disabled={otpCode.length !== 6 || loading}
                            className="flex-1"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              'Vérifier'
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Disable A2F Confirmation Modal */}
      <AnimatePresence>
        {showDisableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
            onClick={() => setShowDisableModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={disableModalRef}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDisable();
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-danger-100 dark:bg-danger-500/15 text-danger-500">
                    <FiAlertTriangle size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Désactiver l&apos;A2F
                  </h3>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                  Pour confirmer la désactivation, entre le code actuel de ton application
                  d&apos;authentification.
                </p>

                {disableError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20 mb-4">
                    {disableError}
                  </div>
                )}

                <div className="relative mb-5">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 pl-10 pr-4 py-3 text-lg tracking-[0.5em] font-mono text-center text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDisableModal(false)}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={disableCode.length !== 6 || disableLoading}
                    className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer bg-danger-500 hover:bg-danger-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {disableLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Désactiver'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
