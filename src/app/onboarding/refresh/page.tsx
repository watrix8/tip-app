// src/app/onboarding/refresh/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Przekieruj z powrotem do panelu kelnera
    router.push('/waiter-panel');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Przekierowywanie...</p>
      </div>
    </div>
  );
}