'use client';

import { useAuth } from '@/lib/contexts/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && !PUBLIC_PATHS.includes(pathname)) {
        router.push('/login');
      } else if (user && PUBLIC_PATHS.includes(pathname)) {
        router.push('/dashboard/waiter');
      }
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
}