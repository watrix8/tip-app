'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
  </div>
);

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No authenticated user, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  // Pokazujemy loading spinner podczas ładowania stanu autentykacji
  if (loading) {
    return <LoadingSpinner />;
  }

  // Jeśli nie ma użytkownika, nie renderujemy dzieci
  // (przekierowanie zostanie obsłużone przez useEffect)
  if (!user) {
    return null;
  }

  // Użytkownik jest zalogowany, renderujemy chronioną zawartość
  return <>{children}</>;
}