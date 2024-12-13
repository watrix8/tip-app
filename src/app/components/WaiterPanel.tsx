import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { initializeStripeConnect, checkStripeAccountStatus } from '@/app/utils/stripeUtils';

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

  useEffect(() => {
    const checkStripeStatus = async () => {
      if (currentUser?.id) {
        try {
          const status = await checkStripeAccountStatus(currentUser.id);
          setIsStripeEnabled(status);
        } catch (error) {
          console.error('Error checking Stripe status:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkStripeStatus();
  }, [currentUser?.id]);

  const handleStripeSetup = async () => {
    if (currentUser?.id) {
      try {
        await initializeStripeConnect(currentUser.id);
      } catch (error) {
        console.error('Error setting up Stripe:', error);
        alert('Wystąpił błąd podczas konfiguracji płatności');
      }
    }
  };

  // Rest of the WaiterPanel code...

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 py-6 sm:px-4 sm:py-8">
      {/* Existing WaiterPanel content... */}
      
      {/* Stripe Connect Section */}
      {!isLoading && !isStripeEnabled && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
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

      {/* Show QR code only if Stripe is enabled */}
      {isStripeEnabled && (
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