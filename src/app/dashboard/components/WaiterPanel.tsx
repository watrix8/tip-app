import { LogOut, AlertCircle, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initializeStripeConnect, checkStripeAccountStatus } from '@/lib/utils/stripe';
import { auth } from '@/lib/config/firebase';
import Link from 'next/link';
import { Settings } from 'lucide-react';
import type { UserData } from '@/types/user';

//import StripeExpressDashboard from './dashboard/StripeExpressDashboard';

interface WaiterPanelProps {
  onLogout: () => void;
  currentUser: UserData | null;  // Zmieniamy typ na UserData
}

// Przykładowy interfejs dla historii napiwków
interface TipHistory {
  id: string;
  amount: number;
  date: Date;
}

export default function WaiterPanel({ currentUser, onLogout }: WaiterPanelProps) {
  const [isStripeEnabled, setIsStripeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tipHistory, setTipHistory] = useState<TipHistory[]>([]);

  // Hook do pobierania historii napiwków
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

  // Funkcja generująca URL strony do napiwków
  const getTipPageUrl = () => {
    if (!currentUser?.id || !currentUser?.name) return '';
    return `${process.env.NEXT_PUBLIC_BASE_URL}/tip?waiterId=${currentUser.id}&name=${encodeURIComponent(currentUser.name)}`;
  };

  // Hook sprawdzający status Stripe
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

  // Handler otwierający stronę napiwków w nowym oknie
  const handleTipPageOpen = () => {
    const url = getTipPageUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Sekcja główna z nazwą kelnera */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Panel kelnera: {currentUser?.name}
        </h1>
      </div>

      {/* Stripe Connect Section */}
      {!isLoading && !isStripeEnabled && (
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
      )}

      {/* Link do strony napiwków */}
      {isStripeEnabled && !isLoading && (
        <div className="border-t pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-4">
              Twoja strona do napiwków
            </h4>
            <button
              onClick={handleTipPageOpen}
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
      )}

      {/* Historia napiwków */}
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

      <Link 
  href="/settings"
  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
>
  <Settings className="w-5 h-5 mr-2" />
  Ustawienia
</Link>

      {/* Przycisk wylogowania */}
      <div className="pt-6">
        <button
          onClick={onLogout}
          className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Wyloguj się11111111
        </button>
      </div>
    </div>
  );
}