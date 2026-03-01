'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('admin_logged_in');
    
    if (!loggedIn) {
      router.replace('/admin-login');
    } else {
      Promise.resolve().then(() => {
        setLoading(false);
      });
    }
  }, [router]);

  if (loading) return <p className="text-center mt-20">Vérification admin...</p>;

  return <>{children}</>;
}