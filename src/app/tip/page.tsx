'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard } from 'lucide-react';

interface Waiter {
  name: string;
  id: string;
}

export default function TipPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [coverFee, setCoverFee] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');

  const tipAmounts = [5, 10, 20] as const;

  useEffect(() => {
    if (waiterId && name) {
      const waiterData: Waiter = {
        name: decodeURIComponent(name),
        id: waiterId,
      };
      setWaiter(waiterData);
    }
  }, [waiterId, name]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const isAmountValid = (): boolean => {
    const amount = selectedAmount || Number(customAmount);
    return amount > 0;
  };

  const getFinalAmount = (): number => {
    const baseAmount = selectedAmount || Number(customAmount) || 0;
    return coverFee ? baseAmount + 1 : baseAmount;
  };

  const handlePayment = async () => {
    if (!isAmountValid()) {
      setErrorMessage('Proszę wybrać lub wpisać kwotę napiwku');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-checkout-session',
          amount: getFinalAmount(),
          waiterId: waiter?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas inicjowania płatności');
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error('Brak URL do strony płatności');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie później.');
      setIsProcessing(false);
    }
  };

  if (!waiter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-blue-100">
              <span className="text-blue-600 text-2xl font-bold">
                {getInitials(waiter.name)}
              </span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Napiwek dla: {waiter.name}</h1>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {tipAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                  setErrorMessage(null);
                }}
                className={`p-4 rounded-lg text-center ${
                  selectedAmount === amount 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold">{amount} PLN</div>
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder="Wpisz własną kwotę"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
              setErrorMessage(null);
            }}
            className="w-full p-3 border rounded-lg"
            min="0"
            step="0.01"
          />

          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={coverFee}
              onChange={(e) => setCoverFee(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Pokryj koszty transakcji (+1 PLN)</span>
          </label>

          <div className="space-y-2">
            <label className="flex items-start space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                }}
                className="mt-1 rounded border-gray-300"
              />
              <span>
                Akceptuję <a href="/regulamin" target="_blank" className="text-blue-600 hover:underline">regulamin serwisu</a> oraz 
                wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usługi przekazania napiwku
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="text-red-600 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={!isAmountValid() || !termsAccepted || isProcessing}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {isProcessing ? (
              'Przetwarzanie...'
            ) : (
              `Zapłać ${getFinalAmount().toFixed(2)} PLN`
            )}
          </button>
        </div>
      </div>
    </main>
  );
}