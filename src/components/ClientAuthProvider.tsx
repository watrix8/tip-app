'use client';

import { useAuth } from '@/lib/contexts/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PUBLIC_PATHS = ['/', '/login'];

export default function ClientAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      console.log('Auth state in ClientAuthProvider:', {
        isAuthenticated: !!user,
        currentPath: pathname,
        isPublicPath: PUBLIC_PATHS.includes(pathname)
      });
      
      if (!user && !PUBLIC_PATHS.includes(pathname)) {
        router.push('/login');
      } else if (user && PUBLIC_PATHS.includes(pathname)) {
        router.push('/dashboard/waiter');
      }
      setIsReady(true);
    }
  }, [loading, user, router, pathname]);

  if (loading || !isReady) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
    );
  }

  return <>{children}</>;
}