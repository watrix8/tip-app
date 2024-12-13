'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import Image from 'next/image';
import { loadStripe, StripeError } from '@stripe/stripe-js';
import { 
  Elements, 
  useStripe, 
  useElements, 
  PaymentElement 
} from '@stripe/react-stripe-js';
import { Alert, AlertDescription } from '../../components/SimpleAlert';

// Initialize Stripe
console.log('Stripe Key:', process.env.NEXT_PUBLIC_STRIPE_KEY);
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || (() => {
  console.error('Missing Stripe publishable key!');
  return '';
})());

interface Waiter {
  name: string;
  id: string;
  avatarUrl: string;
}

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: StripeError | Error) => void;
}

// Payment Form Component
const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message || 'Wystąpił błąd podczas płatności');
        onError(result.error);
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd';
      setError(errorMessage);
      onError(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <PaymentElement options={{
          layout: { type: 'tabs' }
        }} />
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {processing ? 'Przetwarzanie...' : 'Zapłać'}
      </button>
    </form>
  );
};

export default function TipPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchParams = useSearchParams();
  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');

  const tipAmounts = [5, 10, 20] as const;

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

  const handlePayment = async () => {
    const finalAmount = selectedAmount || Number(customAmount);
    if (!finalAmount || finalAmount <= 0 || !waiter) {
      setPaymentError('Proszę wybrać lub wpisać kwotę napiwku');
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
      window.location.href = '/payment/success';
    }, 2000);
  };

  const handlePaymentError = (error: StripeError | Error) => {
    console.error('Payment error:', error);
    setPaymentError('Wystąpił błąd podczas przetwarzania płatności');
  };

  if (!waiter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

            <button
              onClick={handlePayment}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Zapłać {(selectedAmount || Number(customAmount) || 0).toFixed(2)} PLN
            </button>
          </>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
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
}