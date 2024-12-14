'use client';

import { XCircle, RotateCcw } from 'lucide-react';

export default function PaymentErrorPage() {
  const handleRetry = () => {
    // Cofnij do poprzedniej strony
    window.history.back();
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Wystąpił błąd płatności
        </h1>
        <p className="text-gray-600 mb-6">
          Przepraszamy, ale nie udało się zrealizować płatności. Możesz spróbować ponownie lub zamknąć okno.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Spróbuj ponownie
          </button>
          <button
            onClick={handleClose}
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Zamknij okno
          </button>
        </div>
      </div>
    </main>
  );
}