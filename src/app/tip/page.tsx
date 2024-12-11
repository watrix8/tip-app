'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function TipPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Przykładowe kwoty napiwków
  const tipAmounts = [5, 10, 20];

  // Mockowe dane kelnera (w prawdziwej aplikacji byłyby pobierane z URL lub API)
  const waiter = {
    name: "Jan Kowalski",
    id: "W123",
    avatarUrl: "https://nieistniejacy.url/zdjecie.jpg"
  };

  // Funkcja tworząca inicjały
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handlePayment = () => {
    const finalAmount = selectedAmount || Number(customAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert('Proszę wybrać lub wpisać kwotę napiwku');
      return;
    }
    alert(`Przekierowanie do płatności: ${finalAmount} PLN`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {/* Sekcja kelnera */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              {!imageError ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={waiter.avatarUrl}
                    alt={`Avatar ${waiter.name}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 text-2xl font-bold">
                    {getInitials(waiter.name)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Napiwek dla: {waiter.name}</h1>
          <p className="text-gray-500 mt-2">ID: {waiter.id}</p>
        </div>

        {/* reszta kodu pozostaje bez zmian */}
      </div>
    </main>
  );
}