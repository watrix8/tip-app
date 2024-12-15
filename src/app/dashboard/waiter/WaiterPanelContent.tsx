'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { LogOut, AlertCircle, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import UserAvatar from '@/components/UserAvatar';

interface UserData {
  name: string;
  avatarUrl: string | null;
  stripeAccountId?: string;
}

export default function WaiterPanelContent() {
  const { user, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            name: data.name,
            avatarUrl: data.avatarUrl,
            stripeAccountId: data.stripeAccountId
          });
          
          if (data.stripeAccountId) {
            setHasStripeAccount(true);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Błąd podczas ładowania danych');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      setError('Błąd podczas wylogowywania');
    }
  };

  const handleStripeLoginClick = async () => {
    try {
      const response = await fetch('/api/stripe/login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stripeAccountId: userData?.stripeAccountId
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Error getting Stripe login link:', err);
      setError('Nie udało się otworzyć panelu Stripe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center space-y-4">
              <UserAvatar
                name={userData?.name || user?.displayName || ''}
                avatarUrl={userData?.avatarUrl}
                size="lg"
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Witaj {userData?.name || user?.displayName}!
              </h1>
            </div>
          </div>

          {!hasStripeAccount ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
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
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/stripe', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            action: 'create-connect-account',
                            waiterId: user?.uid,
                          }),
                        });

                        const data = await response.json();
                        if (data.accountLink) {
                          window.location.href = data.accountLink;
                        }
                      } catch (err) {
                        console.error('Error:', err);
                        setError('Błąd podczas konfiguracji Stripe');
                      }
                    }}
                    className="mt-4 bg-yellow-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Skonfiguruj płatności
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Twoja strona do napiwków
                    </h4>
                    <button
                      onClick={() => {
                        const tipUrl = `${window.location.origin}/tip?waiterId=${user?.uid}&name=${encodeURIComponent(userData?.name || '')}`;
                        window.open(tipUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <span className="mr-2">Otwórz stronę napiwków</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Panel Stripe
                    </h4>
                    <button
                      onClick={handleStripeLoginClick}
                      className="inline-flex items-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span className="mr-2">Otwórz panel Stripe</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 space-y-4">
            <Link 
              href="/settings"
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <Settings className="w-5 h-5 mr-2" />
              Ustawienia
            </Link>

            <button
              onClick={handleSignOut}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Wyloguj się
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}