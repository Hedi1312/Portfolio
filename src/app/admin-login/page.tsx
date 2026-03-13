'use client';

import { loginSchema } from '@/lib/schemas/auth';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const res = await signIn('credentials', {
        email,
        password,
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
    <section className="min-h-screen flex flex-col items-center justify-start pt-16 px-6 bg-background transition-colors duration-300">
      <div className="w-full max-w-xl mx-auto rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 shadow-xl dark:shadow-2xl mb-12 mt-20 transition-colors duration-300">
        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 dark:text-white text-center">
          👨🏻‍💻 Connexion Admin
        </h1>

        {error && (
          <p className="mb-4 mt-6 rounded-lg bg-danger-50 dark:bg-danger-100/10 border border-danger-200 dark:border-danger-500/50 p-3 text-center text-danger-600 dark:text-danger-400 font-medium">
            {error}
          </p>
        )}

        <form
          onSubmit={handleLogin}
          className="space-y-5 text-neutral-700 dark:text-neutral-200 mt-10 max-w-sm mx-auto"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-neutral-700 dark:text-neutral-300">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-500 px-4 py-3 mt-6 font-bold text-white transition-all hover:bg-brand-400 hover:shadow-[0_0_15px_rgba(0,187,167,0.4)] disabled:opacity-50 disabled:hover:shadow-none cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </section>
  );
}
