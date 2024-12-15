'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

export default function WaiterPanelContent() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);

  useEffect(() => {
    const checkStripeAccount = async () => {
      if (!user?.uid) return;

      try {
        // Sprawdź czy kelner ma już konto w Firestore
        const waiterRef = doc(db, 'waiters', user.uid);
        const waiterDoc = await getDoc(waiterRef);
        
        if (waiterDoc.exists() && waiterDoc.data().stripeAccountId) {
          setHasStripeAccount(true);
          setLoading(false);
          return;
        }

        // Jeśli nie ma konta, utwórz je
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-connect-account',
            waiterId: user.uid,
            refreshUrl: `${window.location.origin}/dashboard/waiter`,
            returnUrl: `${window.location.origin}/dashboard/waiter`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to initialize Stripe Connect');
        }

        const data = await response.json();
        if (data.accountLink) {
          window.location.href = data.accountLink;
        }
      } catch (err) {
        console.error('Error initializing Stripe Connect:', err);
        setError('Błąd podczas konfiguracji Stripe');
      } finally {
        setLoading(false);
      }
    };

    checkStripeAccount();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (hasStripeAccount) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Panel Kelnera</h1>
        <p className="text-green-600">Twoje konto Stripe jest skonfigurowane!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Kelnera</h1>
      <p>Konfiguracja konta Stripe w toku...</p>
    </div>
  );
}