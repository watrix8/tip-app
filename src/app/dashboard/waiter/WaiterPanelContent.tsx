'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { LogOut, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';

interface TipHistory {
  id: string;
  amount: number;
  date: Date;
}

export default function WaiterPanelContent() {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const [tipHistory, setTipHistory] = useState<TipHistory[]>([]);

  useEffect(() => {
    const checkStripeAccount = async () => {
      if (!user?.uid) return;

      try {
        const waiterRef = doc(db, 'waiters', user.uid);
        const waiterDoc = await getDoc(waiterRef);
        
        if (waiterDoc.exists() && waiterDoc.data().stripeAccountId) {
          setHasStripeAccount(true);
          fetchTipHistory();
        }
        setLoading(false);
      } catch (err) {
        console.error('Error checking Stripe account:', err);
        setError('Błąd podczas sprawdzania konta Stripe');
        setLoading(false);
      }
    };

    checkStripeAccount();
  }, [user]);

  const fetchTipHistory = () => {
    const mockData = [
      { id: '1', amount: 10, date: new Date('2024-03-14T12:30:00') },
      { id: '2', amount: 15, date: new Date('2024-03-14T15:45:00') },
      { id: '3', amount: 20, date: new Date('2024-03-13T18:20:00') },
    ];
    setTipHistory(mockData);
  };

  const getTipPageUrl = () => {
    if (!user?.uid || !user?.displayName) return '';
    return `${window.location.origin}/tip?waiterId=${user.uid}&name=${encodeURIComponent(user.displayName)}`;
  };

  const handleStripeSetup = async () => {
    if (!user?.uid) return;

    try {
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
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Panel kelnera: {user?.displayName}
        </h1>
      </div>

      {!hasStripeAccount ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Skonfiguruj odbieranie płatności
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                Aby móc otrzymywać napiwki, musisz skonfigurować konto Stripe.
              </p>
              <button
                onClick={handleStripeSetup}
                className="mt-4 bg-yellow-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Skonfiguruj płatności
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-t pt-6">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-4">
                Twoja strona do napiwków
              </h4>
              <button
                onClick={() => window.open(getTipPageUrl(), '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="mr-2">Otwórz stronę napiwków</span>
                <ExternalLink className="w-4 h-4" />
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Kliknij aby otworzyć stronę do napiwków w nowym oknie
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 text-center">
              Historia napiwków
            </h4>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Kwota
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tipHistory.map((tip) => (
                      <tr key={tip.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tip.date.toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })} {tip.date.toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {tip.amount.toFixed(2)} zł
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <Link 
        href="/settings"
        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
      >
        <Settings className="w-5 h-5 mr-2" />
        Ustawienia
      </Link>

      <div className="pt-6">
        <button
          onClick={signOut}
          className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Wyloguj się
        </button>
      </div>
    </div>
  );
}