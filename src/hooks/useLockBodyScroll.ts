'use client';
import { useEffect } from 'react';

// Global counter for nested modals
let lockCount = 0;
// Store initial style
let originalStyle: {
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
  overflow: string;
} | null = null;

export function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // Increment lock count
    lockCount++;

    if (lockCount === 1) {
      // First lock: save original state and lock
      originalStyle = {
        position: document.body.style.position,
        top: document.body.style.top,
        left: document.body.style.left,
        right: document.body.style.right,
        width: document.body.style.width,
        overflow: document.body.style.overflow,
      };

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount--;
      if (lockCount === 0 && originalStyle) {
        // Last unlock: restore original state
        const scrollY = document.body.style.top;
        document.body.style.position = originalStyle.position;
        document.body.style.top = originalStyle.top;
        document.body.style.left = originalStyle.left;
        document.body.style.right = originalStyle.right;
        document.body.style.width = originalStyle.width;
        document.body.style.overflow = originalStyle.overflow;

        if (scrollY) window.scrollTo(0, parseInt(scrollY || '0') * -1);
        originalStyle = null;
      }
    };
  }, [isLocked]);
}
