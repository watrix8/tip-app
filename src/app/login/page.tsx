'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth';
import LoginButton from './components/LoginButton';
import RegisterForm from './components/RegisterForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HandCoins } from 'lucide-react';

// Komponent do obsługi parametrów URL
function LoginContentWithParams() {
  const [showRegister, setShowRegister] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';

  useEffect(() => {
    console.log('LoginContent mount - auth state:', { user, loading });
    
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && !loading && user) {
      console.log('Redirecting authenticated user to dashboard');
      router.push('/dashboard/waiter');
    }
  }, [isInitialized, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {justRegistered && (
          <Alert className="mb-6">
            <AlertDescription>
              Rejestracja zakończona pomyślnie. Możesz się teraz zalogować.
            </AlertDescription>
          </Alert>
        )}
        
        {showRegister ? (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <HandCoins className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">tippin&apos;</h1>
            </div>
            <div className="space-y-6">
              <LoginButton />
              <button
                onClick={() => setShowRegister(true)}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                Zarejestruj się
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}

// Komponent do wyświetlania stanu ładowania
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  );
}

// Główny komponent strony logowania
export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginContentWithParams />
      </Suspense>
    </main>
  );
}