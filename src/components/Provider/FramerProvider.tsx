'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * LazyMotion provider with domAnimation features.
 *
 * Uses domAnimation instead of domMax to reduce the framer-motion bundle
 * by ~15 KB gzipped. domAnimation covers: animate, whileInView, variants,
 * AnimatePresence, exit animations. Only layout animations and drag
 * gestures are excluded.
 */
export default function FramerProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
