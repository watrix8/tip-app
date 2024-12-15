'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import Image from 'next/image';
import { loadStripe, StripeError } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './component/PaymentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Waiter {
  name: string;
  id: string;
  avatarUrl: string;
}

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Main Content Component
const PaymentPageContent = () => {
  const searchParams = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [coverFee, setCoverFee] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');
  const tipAmounts = [10, 20, 30] as const;

  useEffect(() => {
    if (waiterId && name) {
      const waiterData: Waiter = {
        name: decodeURIComponent(name),
        id: waiterId,
        avatarUrl: `https://example.com/avatars/${waiterId}.jpg`,
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

  const isAmountSelected = (): boolean => {
    return selectedAmount !== null || (!!customAmount && Number(customAmount) > 0);
  };

  const getFinalAmount = (): number => {
    const baseAmount = selectedAmount || Number(customAmount) || 0;
    return coverFee ? baseAmount + 1 : baseAmount;
  };

  const handlePayment = async () => {
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount <= 0 || !waiter || !termsAccepted) {
      setPaymentError('Proszę wybrać kwotę napiwku i zaakceptować regulamin');
      return;
    }

    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create-payment-intent',
          amount: finalAmount,
          waiterId: waiter.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas tworzenia płatności');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentError(null);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Wystąpił błąd podczas inicjowania płatności');
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      window.location.href = '/tip/success';
    }, 2000);
  };

  const handlePaymentError = (error: StripeError | Error) => {
    console.error('Payment error:', error);
    setPaymentError('Wystąpił błąd podczas przetwarzania płatności');
  };

  if (!waiter) {
    return <LoadingState />;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
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
        </div>

        {!clientSecret ? (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {tipAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
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

            <div className="mb-6">
              <input
                type="number"
                placeholder="Wpisz własną kwotę"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full p-3 border rounded-lg"
                min="0"
                step="0.01"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={coverFee}
                  onChange={(e) => setCoverFee(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Pokryj koszty transakcji (+1 PLN)</span>
              </label>
            </div>

            <div className="mb-6">
              <label className="flex items-start space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <span>
                  Akceptuję <a href="/regulamin" target="_blank" className="text-blue-600 hover:underline">regulamin serwisu</a> oraz 
                  wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usługi
                </span>
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={!isAmountSelected() || !termsAccepted}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Zapłać {getFinalAmount().toFixed(2)} PLN
            </button>
          </>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              termsAccepted={termsAccepted}
            />
          </Elements>
        )}

        {paymentError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        {paymentSuccess && (
          <Alert className="mt-4">
            <AlertDescription>Płatność zakończona sukcesem! Przekierowywanie...</AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
};

// Main Page Component
export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentPageContent />
    </Suspense>
  );
}