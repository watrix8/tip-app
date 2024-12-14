'use client';

import { LogOut, AlertCircle } from 'lucide-react';
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
  } | null;
}

interface TipHistory {
  id: string;
  amount: number;
  date: Date;
}

export default function WaiterPanel({ onLogout, currentUser }: WaiterPanelProps) {
  const [isStripeEnabled, setIsStripeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tipHistory, setTipHistory] = useState<TipHistory[]>([]);

  useEffect(() => {
    const fetchTipHistory = () => {
      const mockData = [
        { id: '1', amount: 10, date: new Date('2024-03-14T12:30:00') },
        { id: '2', amount: 15, date: new Date('2024-03-14T15:45:00') },
        { id: '3', amount: 20, date: new Date('2024-03-13T18:20:00') },
      ];
      setTipHistory(mockData);
    };

    if (currentUser?.id) {
      fetchTipHistory();
    }
  }, [currentUser?.id]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    async function checkStripeEnabled() {
      if (currentUser?.id) {
        try {
          setIsLoading(true);
          const status = await checkStripeAccountStatus(currentUser.id);
          setIsStripeEnabled(status);
        } catch (error) {
          console.error('Błąd podczas sprawdzania statusu Stripe:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    checkStripeEnabled();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && currentUser?.id) {
        checkStripeEnabled();
      }
    });

    return () => unsubscribe();
  }, [currentUser?.id]);

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
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Sekcja główna z inicjałami */}
        <div className="text-center bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg">
          <div className="w-24 h-24 rounded-full bg-[var(--primary)] bg-opacity-20 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-[var(--primary-dark)]">
              {currentUser?.name ? getInitials(currentUser.name) : ''}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--primary-dark)] mt-4">
            Panel kelnera: {currentUser?.name}
          </h1>
        </div>

        {/* Stripe Connect Section */}
        {!isLoading && !isStripeEnabled && (
          <div className="bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg border-l-4 border-[var(--accent)]">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-[var(--accent)]" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-[var(--deep)]">
                  Skonfiguruj odbieranie płatności
                </h3>
                <p className="mt-2 text-sm text-[var(--neutral)]">
                  Aby móc otrzymywać napiwki, musisz skonfigurować konto Stripe.
                </p>
                <button
                  onClick={handleStripeSetup}
                  className="mt-4 bg-[var(--primary)] text-[var(--primary-dark)] px-4 py-2 rounded-lg 
                           hover:bg-[var(--primary-hover)] transition-colors font-medium"
                >
                  Skonfiguruj płatności
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {isStripeEnabled && !isLoading && (
          <div className="bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg">
            <h4 className="font-semibold text-[var(--primary-dark)] mb-4 text-center">
              Twój kod QR do napiwków
            </h4>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCodeSVG 
                  value={`${process.env.NEXT_PUBLIC_BASE_URL}/tip?waiterId=${currentUser?.id}&name=${encodeURIComponent(currentUser?.name || '')}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
            </div>
            <p className="text-sm text-[var(--neutral)] mt-2 text-center">
              Pokaż ten kod klientom, aby mogli zostawić napiwek
            </p>
          </div>
        )}

        {/* Historia napiwków */}
        <div className="bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg">
          <h4 className="font-semibold text-[var(--primary-dark)] mb-4 text-center">
            Historia napiwków
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--neutral)]">
              <thead className="bg-[var(--neutral)] bg-opacity-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--deep)] uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[var(--deep)] uppercase">
                    Kwota
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neutral)]">
                {tipHistory.map((tip) => (
                  <tr key={tip.id} className="hover:bg-[var(--neutral)] hover:bg-opacity-5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--deep)]">
                      {tip.date.toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} {tip.date.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--deep)] text-right">
                      {tip.amount.toFixed(2)} zł
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Przycisk wylogowania */}
        <button
          onClick={onLogout}
          className="w-full bg-[var(--secondary)] text-white py-3 px-4 rounded-lg 
                   flex items-center justify-center hover:bg-[var(--secondary-hover)] 
                   transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Wyloguj się
        </button>
      </div>
    </div>
  );
}