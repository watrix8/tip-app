'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';

export default function WaiterPanelContent() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripeConnect = async () => {
      try {
        const response = await fetch('/api/stripe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-connect-account',
            waiterId: user?.uid,
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
      }
    };

    if (user) {
      initializeStripeConnect();
    }
  }, [user]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h1>Panel Kelnera</h1>
      <p>Konfiguracja konta Stripe w toku...</p>
    </div>
  );
}