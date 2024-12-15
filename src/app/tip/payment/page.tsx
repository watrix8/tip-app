'use client'

import React, { Suspense, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { useSearchParams, useRouter } from 'next/navigation';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { loadStripe, StripeError } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './component/PaymentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/contexts/auth';
import UserAvatar from '@/components/UserAvatar';

const stripePromise = loadStripe('pk_test_51QVeM9I7OiRMQyLiFAN2PaVRQYZZRt5mYcGvABCW9flDoFRdClm96PXK9EjJDpphNxKSmHZGLVyyIJoOdKiviMvN00VCb0Mvwq');

interface Waiter {
  name: string;
  id: string;
  avatarUrl: string | null;
}

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const PaymentPageContent = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [coverFee, setCoverFee] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');
  const tipAmounts = [10, 20, 30] as const;

  useEffect(() => {
    const initializePaymentPage = async () => {
      if (authLoading) return;
      if (!waiterId) {
        console.log('Missing waiterId parameter');
        setLoading(false);
        return;
      }

      try {
        let waiterName = name;
        let avatarUrl = null;
        
        const docRef = doc(db, 'Users', waiterId);
        const waiterDoc = await getDoc(docRef);
        
        if (waiterDoc.exists()) {
          if (!waiterName) {
            waiterName = waiterDoc.data().name;
          }
          avatarUrl = waiterDoc.data().avatarUrl || null;
        } else {
          throw new Error('Nie znaleziono danych kelnera');
        }

        const waiterData: Waiter = {
          name: decodeURIComponent(waiterName || ''),
          id: waiterId,
          avatarUrl: avatarUrl
        };
        setWaiter(waiterData);
      } catch (error) {
        console.error('Error initializing waiter data:', error);
        setPaymentError('Nie udało się załadować danych kelnera');
      } finally {
        setLoading(false);
      }
    };

    initializePaymentPage();
  }, [authLoading, user, waiterId, name]);

  const isAmountSelected = (): boolean => {
    return selectedAmount !== null || (!!customAmount && Number(customAmount) > 0);
  };

  const getFinalAmount = (): number => {
    const baseAmount = selectedAmount || Number(customAmount) || 0;
    return coverFee ? baseAmount + 1 : baseAmount;
  };

  const handlePayment = async () => {
    console.log('HandlePayment called');
    console.log('Final amount:', getFinalAmount());
    
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount <= 0 || !waiter || !termsAccepted) {
      console.log('Validation failed:', { finalAmount, waiter, termsAccepted });
      setPaymentError('Proszę wybrać kwotę napiwku i zaakceptować regulamin');
      return;
    }

    try {
      console.log('Sending request to /api/stripe');
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

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error('Błąd podczas tworzenia płatności');
      }

      const data = await response.json();
      console.log('Response data:', data);
      setClientSecret(data.clientSecret);
      setPaymentError(null);
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Wystąpił błąd podczas inicjowania płatności');
      router.push('/tip/error');
    }
  };

  const handleBack = () => {
    setClientSecret(null);
    setPaymentError(null);
  };

  const handlePaymentSuccess = () => {
    router.push('/tip/payment/success');
  };

  const handlePaymentError = (error: StripeError | Error) => {
    console.error('Payment error:', error);
    router.push('/tip/payment/error');
  };

  if (loading || authLoading) {
    return <LoadingState />;
  }

  if (!waiter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">
            Błąd ładowania danych
          </h1>
          <p className="text-gray-600 mb-4">
            {!waiterId || !name 
              ? "Brak wymaganych parametrów w URL."
              : "Nie udało się załadować danych kelnera."}
          </p>
          <p className="text-sm text-gray-500">
            Sprawdź poprawność linku lub spróbuj ponownie później.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <UserAvatar 
              name={waiter.name} 
              avatarUrl={waiter.avatarUrl}
              size="lg"
              className="shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Napiwek dla: {waiter.name}</h1>
        </div>

        {clientSecret ? (
          <div>
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wróć do wyboru kwoty
            </button>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                termsAccepted={termsAccepted}
              />
            </Elements>
          </div>
        ) : (
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
        )}

        {paymentError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}
      </div>
    </main>
  );
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentPageContent />
    </Suspense>
  );
}