import { LogOut, AlertCircle, ExternalLink } from 'lucide-react';
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

  // Funkcja do inicjałów
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

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

  const getTipPageUrl = () => {
    if (!currentUser?.id || !currentUser?.name) return '';
    return `${process.env.NEXT_PUBLIC_BASE_URL}/tip?waiterId=${currentUser.id}&name=${encodeURIComponent(currentUser.name)}`;
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

  const handleTipPageOpen = () => {
    const url = getTipPageUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Sekcja główna z awatarem */}
      <div className="text-center">
        <div className="waiter-avatar">
          <span className="waiter-initials">
            {currentUser?.name ? getInitials(currentUser.name) : ''}
          </span>
        </div>
        <h1 className="waiter-name">
          Panel kelnera: {currentUser?.name}
        </h1>
      </div>

      {/* Stripe Connect Section */}
      {!isLoading && !isStripeEnabled && (
        <div className="stripe-warning">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-[var(--deep)]">
                Skonfiguruj odbieranie płatności
              </h3>
              <p className="mt-2 text-sm text-[var(--deep)]">
                Aby móc otrzymywać napiwki, musisz skonfigurować konto Stripe.
              </p>
              <button
                onClick={handleStripeSetup}
                className="stripe-setup-button"
              >
                Skonfiguruj płatności
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link do strony napiwków */}
      {isStripeEnabled && !isLoading && (
        <div className="border-t border-[var(--neutral)] pt-6">
          <div className="text-center">
            <h4 className="font-semibold text-[var(--foreground)] mb-4">
              Twoja strona do napiwków
            </h4>
            <button
              onClick={handleTipPageOpen}
              className="tip-link-button"
            >
              <span className="mr-2">Otwórz stronę napiwków</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <p className="text-sm text-[var(--neutral)] mt-2">
              Kliknij aby otworzyć stronę do napiwków w nowym oknie
            </p>
          </div>
        </div>
      )}

      {/* Historia napiwków */}
      <div className="border-t border-[var(--neutral)] pt-6">
        <h4 className="font-semibold text-[var(--foreground)] mb-4 text-center">
          Historia napiwków
        </h4>
        <div className="card">
          <div className="overflow-x-auto">
            <table className="tip-history-table">
              <thead className="tip-history-header">
                <tr>
                  <th className="tip-history-cell text-left">
                    Data
                  </th>
                  <th className="tip-history-cell text-right">
                    Kwota
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neutral)]">
                {tipHistory.map((tip) => (
                  <tr key={tip.id}>
                    <td className="tip-history-cell">
                      {tip.date.toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })} {tip.date.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="tip-history-cell text-right">
                      {tip.amount.toFixed(2)} zł
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Przycisk wylogowania */}
      <div className="pt-6">
        <button
          onClick={onLogout}
          className="logout-button"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Wyloguj się
        </button>
      </div>
    </div>
  );
}