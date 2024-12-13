'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import { STRIPE_ONBOARDING_STATUS } from '@/app/utils/stripeUtils';

export default function OnboardingComplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Weryfikacja konfiguracji konta...');

  useEffect(() => {
    const verifySetup = async () => {
      try {
        const userId = searchParams.get('userId') || localStorage.getItem('onboarding_user_id');
        
        if (!userId) {
          throw new Error('Brak identyfikatora użytkownika');
        }

        // Sprawdź status w Stripe
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            action: 'check-account-status',
            accountId: userId 
          }),
        });

        if (!response.ok) {
          throw new Error('Błąd podczas sprawdzania statusu konta');
        }

        const accountStatus = await response.json();
        
        if (!accountStatus.details_submitted || 
            !accountStatus.payouts_enabled || 
            !accountStatus.charges_enabled) {
          // Jeśli konto nie jest w pełni skonfigurowane, przekieruj na refresh
          window.location.href = `/onboarding/refresh?userId=${userId}`;
          return;
        }

        // Aktualizuj status w bazie danych
        const db = getFirestore();
        const userDoc = doc(db, 'Users', userId);
        
        await updateDoc(userDoc, {
          stripeOnboardingStatus: STRIPE_ONBOARDING_STATUS.COMPLETED,
          stripeOnboardingTimestamp: new Date().toISOString()
        });

        // Wyczyść localStorage
        localStorage.removeItem('onboarding_user_id');

        setStatus('success');
        setMessage('Konto zostało pomyślnie skonfigurowane! Możesz teraz przyjmować płatności.');
        
        // Przekieruj po 3 sekundach
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);

      } catch (error) {
        console.error('Błąd podczas weryfikacji:', error);
        setStatus('error');
        setMessage('Wystąpił błąd podczas weryfikacji konta. Spróbuj ponownie później.');
      }
    };

    verifySetup();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-green-700">Sukces!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <p className="mt-2 text-sm text-gray-500">Za chwilę nastąpi przekierowanie do panelu kelnera...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="mt-4 text-xl font-semibold text-red-700">Błąd</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <button
              onClick={() => {
                window.location.href = '/';
              }}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Wróć do panelu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}