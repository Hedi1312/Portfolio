'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RouteScrollReset({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Force scroll to top on ANY route change
    // Small delay ensures it happens after Next.js finishes its own navigation handling
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
