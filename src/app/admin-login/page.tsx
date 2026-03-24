'use client';

import { loginSchema } from '@/lib/schemas/auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, LogIn, Mail, Lock, Key } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validation = loginSchema.safeParse({ email, password, otpCode });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
        otpCode,
        redirect: false,
      });

      if (res?.error) {
        setError('Email ou mot de passe incorrect');
        setLoading(false);
      } else if (res?.ok) {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Erreur de connexion');
      setLoading(false);
    }
  };

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
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Glass Card */}
        <div className="glass-card p-8 hover:transform-none">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white text-center">
            Connexion <span className="gradient-text">Admin</span>
          </h1>
          <p className="text-center text-neutral-500 dark:text-neutral-400 text-sm mt-2">
            Accède à ton espace d&apos;administration
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-danger-50 dark:bg-danger-100/10 border border-danger-200 dark:border-danger-500/30 p-3 text-center text-danger-600 dark:text-danger-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-600 dark:text-neutral-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-neutral-600 dark:text-neutral-400">
                Mot de passe
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Code OTP (A2F)
                </label>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full rounded-xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              loadingText="Connexion en cours..."
              fullWidth
              className="mt-2 btn-glow shadow-[0_0_20px_rgba(0,187,167,0.3)] disabled:hover:shadow-none"
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-700/50">
            <p className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
