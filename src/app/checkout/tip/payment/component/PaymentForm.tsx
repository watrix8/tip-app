// app/checkout/tip/payment/components/PaymentForm.tsx
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { StripeError } from '@stripe/stripe-js';

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: StripeError | Error) => void;
  termsAccepted: boolean;
}

export const PaymentForm = ({ onSuccess, onError, termsAccepted }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements || !termsAccepted) return;

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
        disabled={!stripe || processing || !termsAccepted}
        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        {processing ? 'Przetwarzanie...' : 'Zapłać'}
      </button>
    </form>
  );
};