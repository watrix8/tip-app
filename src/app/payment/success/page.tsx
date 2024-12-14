'use client';

import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  useEffect(() => {
    // Po 3 sekundach przekieruj do strony głównej
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dziękujemy za napiwek!
        </h1>
        <p className="text-gray-600 mb-4">
          Twoja płatność została zrealizowana pomyślnie.
        </p>
        <div className="text-sm text-gray-500">
          Za chwilę nastąpi przekierowanie...
        </div>
      </div>
    </main>
  );
}