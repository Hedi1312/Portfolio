'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  // Lire le thème depuis localStorage après hydration
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const initial = stored === 'light' ? 'light' : 'dark';
    setTheme(initial);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);

      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return newTheme;
    });
  }, []);

  // Ne rien afficher tant que le thème n'est pas connu (évite le mismatch d'hydration)
  if (theme === null) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 w-10 h-10 flex items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors shadow-sm cursor-pointer"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0, scale: theme === 'dark' ? 0.8 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <FiSun size={20} className={theme === 'dark' ? 'opacity-0' : 'opacity-100'} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : -180, scale: theme === 'dark' ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <FiMoon size={20} className={theme === 'dark' ? 'opacity-100' : 'opacity-0'} />
      </motion.div>
    </button>
  );
}
