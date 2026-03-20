'use client';

import { useEffect, RefObject } from 'react';

export function useFocusTrap(ref: RefObject<HTMLElement | null>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const modalElement = ref.current;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = Array.from(
      modalElement.querySelectorAll<HTMLElement>(focusableSelectors),
    ).filter((el) => {
      // S'assurer que l'élément n'est pas caché
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Mettre le focus sur le premier élément à l'ouverture
    // On met un petit setTimeout pour s'assurer que l'animation Framer Motion a démarré
    const focusTimer = setTimeout(() => {
      firstElement.focus();
    }, 50);

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab classique
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    modalElement.addEventListener('keydown', handleTabKey);

    return () => {
      clearTimeout(focusTimer);
      modalElement.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, ref]);
}
