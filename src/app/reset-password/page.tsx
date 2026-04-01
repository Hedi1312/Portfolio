'use client';

import { newPasswordSchema, passwordRegex } from '@/lib/schemas/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Check,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { AnimatePresence, m } from 'framer-motion';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // A2F Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const otpModalRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(showOtpModal);

  const criteria = [
    { label: '8 caractères minimum', test: passwordRegex.min },
    { label: 'Une majuscule', test: passwordRegex.upper },
    { label: 'Une minuscule', test: passwordRegex.lower },
    { label: 'Un chiffre', test: passwordRegex.number },
    { label: 'Un caractère spécial', test: passwordRegex.special },
  ];

  // Close modal on outside click
  useEffect(() => {
    if (!showOtpModal) return;
    const handleClick = (e: MouseEvent) => {
      if (otpModalRef.current && !otpModalRef.current.contains(e.target as Node)) {
        setShowOtpModal(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOtpModal]);

  // Step 1: Validate form and show OTP modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validation = newPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    // Show A2F modal
    setOtpCode('');
    setOtpError('');
    setShowOtpModal(true);
  };

  // Step 2: Submit with OTP code
  const handleConfirmWithOtp = async () => {
    if (otpCode.length !== 6) return;
    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword, otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes('OTP')) {
          setOtpError(data.error);
        } else {
          setShowOtpModal(false);
          setError(data.error || 'Une erreur est survenue.');
        }
      } else {
        router.push('/admin-login');
      }
    } catch {
      setOtpError('Erreur de connexion au serveur.');
    } finally {
      setOtpLoading(false);
    }
  };

  if (!token) {
    return (
      <section className="min-h-screen flex items-center justify-center px-6 bg-background transition-colors duration-300 relative overflow-hidden">
        <div className="hero-grid pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-danger-500/10 dark:bg-danger-500/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-danger-400 to-danger-600 flex items-center justify-center shadow-lg shadow-danger-500/25">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="glass-card p-8 hover:transform-none">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center">
              Lien <span className="text-danger-500">invalide</span>
            </h1>
            <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-2">
              Ce lien de réinitialisation est invalide ou a expiré.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Button href="/forgot-password" fullWidth variant="primary" className="btn-glow">
                Refaire une demande
              </Button>
              <p className="text-center">
                <Link
                  href="/admin-login"
                  className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <ArrowLeft size={14} />
                  Retour à la connexion
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-6 bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="hero-grid pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-500/10 dark:bg-brand-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 hover:transform-none">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center">
            Nouveau <span className="gradient-text">mot de passe</span>
          </h1>
          <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-2">
            Définis ton nouveau mot de passe admin
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-danger-50 dark:bg-danger-100/10 border border-danger-200 dark:border-danger-500/30 p-3 text-center text-danger-600 dark:text-danger-400 text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-xl bg-brand-50 dark:bg-brand-100/10 border border-brand-200 dark:border-brand-500/30 p-3 text-center text-brand-600 dark:text-brand-400 text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-600 dark:text-neutral-400">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 pl-10 pr-11 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password criteria indicators */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {criteria.map((c) => {
                  const passed = c.test(password);
                  return (
                    <div key={c.label} className="flex items-center gap-1.5 text-xs">
                      <div
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 ${
                          passed
                            ? 'bg-brand-500 scale-100'
                            : 'bg-neutral-200 dark:bg-neutral-700 scale-90'
                        }`}
                      >
                        {passed && <Check size={9} className="text-white" strokeWidth={3} />}
                      </div>
                      <span
                        className={`transition-colors ${
                          passed
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {c.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-600 dark:text-neutral-400">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 pl-10 pr-11 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-danger-500 font-medium">
                Les mots de passe ne correspondent pas
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              className="mt-2 btn-glow shadow-[0_0_20px_rgba(0,187,167,0.3)] disabled:hover:shadow-none"
            >
              Mettre à jour le mot de passe
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700/50">
            <p className="text-center">
              <Link
                href="/admin-login"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                <ArrowLeft size={14} />
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* A2F Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4"
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              ref={otpModalRef}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmWithOtp();
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-brand-100 dark:bg-brand-500/15 text-brand-500">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Vérification A2F
                  </h3>
                </div>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                  Entre le code de ton application d&apos;authentification pour confirmer le
                  changement de mot de passe.
                </p>

                {otpError && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-500/20 mb-4">
                    {otpError}
                  </div>
                )}

                <div className="relative mb-5">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 pl-10 pr-4 py-3 text-lg tracking-[0.5em] font-mono text-center text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={otpCode.length !== 6 || otpLoading}
                    className="px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? 'Confirmation...' : 'Confirmer'}
                  </button>
                </div>
              </form>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-neutral-500 dark:text-neutral-400">Chargement...</p>
        </section>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
