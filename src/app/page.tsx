'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard/waiter');
      } else {
        //router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Pokazujemy loading state podczas sprawdzania autentykacji
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return null; // Strona będzie pusta, ponieważ i tak nastąpi przekierowanie
}