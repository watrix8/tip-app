import React, { Suspense, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { useSearchParams } from 'next/navigation';
import { CreditCard, ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import { loadStripe, StripeError } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PaymentForm } from './component/PaymentForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/lib/contexts/auth';

const stripePromise = loadStripe('pk_test_51QVeM9I7OiRMQyLiFAN2PaVRQYZZRt5mYcGvABCW9flDoFRdClm96PXK9EjJDpphNxKSmHZGLVyyIJoOdKiviMvN00VCb0Mvwq');

interface Waiter {
  name: string;
  id: string;
  avatarUrl: string;
}

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

type PaymentStatus = 'input' | 'processing' | 'success' | 'error';

const PaymentPageContent = () => {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [coverFee, setCoverFee] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('input');
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
        
        if (!waiterName) {
          const docRef = doc(db, 'Users', waiterId);
          const waiterDoc = await getDoc(docRef);
          
          if (waiterDoc.exists()) {
            waiterName = waiterDoc.data().name;
          } else {
            throw new Error('Nie znaleziono danych kelnera');
          }
        }

        const waiterData: Waiter = {
          name: decodeURIComponent(waiterName || ''),
          id: waiterId || '',
          avatarUrl: `https://example.com/avatars/${waiterId || ''}.jpg`,
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
    setPaymentStatus('processing');
    console.log('HandlePayment called');
    console.log('Final amount:', getFinalAmount());
    
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount <= 0 || !waiter || !termsAccepted) {
      console.log('Validation failed:', { finalAmount, waiter, termsAccepted });
      setPaymentError('Proszę wybrać kwotę napiwku i zaakceptować regulamin');
      setPaymentStatus('error');
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
      setPaymentStatus('input');
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Wystąpił błąd podczas inicjowania płatności');
      setPaymentStatus('error');
    }
  };

  const handleBack = () => {
    setClientSecret(null);
    setPaymentError(null);
    setPaymentStatus('input');
  };

  const handleRetry = () => {
    setPaymentStatus('input');
    setPaymentError(null);
    setClientSecret(null);
  };

  const handlePaymentSuccess = () => {
    setPaymentStatus('success');
  };

  const handlePaymentError = (error: StripeError | Error) => {
    console.error('Payment error:', error);
    setPaymentError('Wystąpił błąd podczas przetwarzania płatności');
    setPaymentStatus('error');
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

  // Success view
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dziękujemy za napiwek!</h1>
          <p className="text-gray-600 mb-6">
            Twoja płatność została zrealizowana pomyślnie. Kelner {waiter.name} otrzyma Twój napiwek.
          </p>
          <button
            onClick={() => window.close()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zamknij okno
          </button>
        </div>
      </div>
    );
  }

  // Error view
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wystąpił błąd</h1>
          <p className="text-gray-600 mb-6">
            {paymentError || 'Nie udało się przetworzyć płatności. Spróbuj ponownie później.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Zamknij okno
            </button>
          </div>
        </div>
      </div>
    );
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