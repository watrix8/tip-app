'use client';

import { CheckCircle, X } from 'lucide-react';

export default function PaymentSuccessPage() {
  const handleClose = () => {
    window.close();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dziękujemy za napiwek!
        </h1>
        <p className="text-gray-600 mb-6">
          Twoja płatność została zrealizowana pomyślnie.
        </p>
        <button
          onClick={handleClose}
          className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Zamknij okno
        </button>
      </div>
    </main>
  );
}