// src/app/onboarding/refresh/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function OnboardingRefresh() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('userId') || localStorage.getItem('onboarding_user_id');
    
    if (!userId) {
      setShowError(true);
      return;
    }

    // Opóźniamy przekierowanie o 3 sekundy, żeby użytkownik mógł przeczytać komunikat
    setTimeout(() => {
      window.location.href = '/'; // Używamy window.location.href zamiast router.push
    }, 3000);
  }, [router, searchParams]);

  if (showError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-red-700">Proces przerwany</h2>
          <p className="mt-2 text-gray-600">
            Proces konfiguracji konta Stripe został przerwany. Możesz spróbować ponownie z panelu kelnera.
          </p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Wróć do panelu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Proces został przerwany. Przekierowywanie do panelu kelnera...</p>
      </div>
    </div>
  );
}