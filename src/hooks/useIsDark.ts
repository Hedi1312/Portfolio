'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const html = document.documentElement;
  const observer = new MutationObserver(callback);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
  return true; // SSR par défaut en mode sombre
}

/**
 * Hook qui détecte si le mode sombre est actif en observant la classe `dark`
 * sur l'élément `<html>`.
 */
export function useIsDark(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
