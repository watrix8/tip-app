'use client';

import { LogOut, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { initializeStripeConnect, checkStripeAccountStatus } from '@/app/utils/stripeUtils';
import { auth } from '@/app/config/firebase';

interface WaiterPanelProps {
  onLogout: () => void;
  currentUser: {
    id: string;
    name: string;
    email: string;
    restaurantId: string;
    avatarUrl: string;
  } | null;
}

export default function WaiterPanel({ onLogout, currentUser }: WaiterPanelProps) {
  const [isStripeEnabled, setIsStripeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Hook sprawdzający status Stripe
  useEffect(() => {
    async function checkStripeEnabled() {
      if (currentUser?.id) {
        try {
          setIsLoading(true); // Ustawiamy loading przy każdym sprawdzeniu
          const status = await checkStripeAccountStatus(currentUser.id);
          setIsStripeEnabled(status);
        } catch (error) {
          console.error('Błąd podczas sprawdzania statusu Stripe:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    // Sprawdzamy status przy pierwszym renderowaniu
    checkStripeEnabled();

    // Dodajemy nasłuchiwanie na zmiany stanu autoryzacji
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && currentUser?.id) {
        checkStripeEnabled();
      }
    });

    // Czyszczenie subskrypcji
    return () => unsubscribe();
  }, [currentUser?.id]);

  // Handler do konfiguracji Stripe
  const handleStripeSetup = async () => {
    if (currentUser?.id) {
      try {
        await initializeStripeConnect(currentUser.id);
      } catch (error) {
        console.error('Błąd podczas konfiguracji Stripe:', error);
        alert('Wystąpił błąd podczas konfiguracji płatności');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 py-6 sm:px-4 sm:py-8">
      {/* Przycisk wylogowania */}
      <div className="flex justify-end">
        <button
          onClick={onLogout}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg flex items-center hover:bg-gray-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Wyloguj się
        </button>
      </div>

      {/* Sekcja główna */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Panel kelnera: {currentUser?.name}
        </h1>
        {currentUser?.avatarUrl && !imageError && (
          <div className="mt-4 relative w-24 h-24 mx-auto rounded-full overflow-hidden">
            <Image
              src={currentUser.avatarUrl}
              alt={`Avatar ${currentUser.name}`}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        )}
      </div>

      {/* Stripe Connect Section */}
      {!isLoading && !isStripeEnabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
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
                className="mt-4 bg-yellow-800 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
              >
                Skonfiguruj płatności
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Section */}
      {isStripeEnabled && !isLoading && (
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Twój kod QR do napiwków</h4>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG 
                value={`${process.env.NEXT_PUBLIC_BASE_URL}/tip?waiterId=${currentUser?.id}&name=${encodeURIComponent(currentUser?.name || '')}`}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Pokaż ten kod klientom, aby mogli zostawić napiwek
          </p>
        </div>
      )}
    </div>
  );
}