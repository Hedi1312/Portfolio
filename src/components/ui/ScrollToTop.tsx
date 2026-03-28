'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import { useNeonHover } from '@/hooks/useNeonHover';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const neonHover = useNeonHover(-4);

  useEffect(() => {
    const onScroll = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setVisible(window.scrollY > 400);
      }, 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    const duration = 2500;
    const start = window.scrollY;
    const startTime = performance.now();

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeOutExpo(progress)));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, []);

  return (
    <motion.button
      onClick={scrollToTop}
      className={`fixed bottom-10 right-10 z-50 p-3 rounded-xl glass text-brand-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ transition: 'opacity 0.3s ease, color 0.3s ease' }}
      whileHover={neonHover.whileHover}
      transition={neonHover.transition}
      aria-label="Remonter en haut"
    >
      <FiArrowUp size={20} strokeWidth={2.5} />
    </motion.button>
  );
}
