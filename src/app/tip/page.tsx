import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';  // Używamy useRouter z Next.js
import { CreditCard } from 'lucide-react';
import Image from 'next/image';

interface Waiter {
  name: string;
  id: string;
  avatarUrl: string;
}

export default function TipPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [waiter, setWaiter] = useState<Waiter | null>(null);
  const router = useRouter();  // Używamy useRouter w komponencie

  // Przykładowe kwoty napiwków
  const tipAmounts = [5, 10, 20];

  useEffect(() => {
    if (router.query.waiterId) {
      // W prawdziwej aplikacji dane kelnera powinny pochodzić z API lub URL
      const waiterData: Waiter = {
        name: "Jan Kowalski", // Zmienimy to, by pochodziło z dynamicznych danych
        id: router.query.waiterId as string, // Korzystamy z query parametru
        avatarUrl: "https://nieistniejacy.url/zdjecie.jpg", // Zmienimy to na dynamiczny URL
      };
      setWaiter(waiterData);
    }
  }, [router.query]);  // Oczekujemy, że query się zmieni

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handlePayment = () => {
    const finalAmount = selectedAmount || Number(customAmount);
    if (!finalAmount || finalAmount <= 0) {
      alert('Proszę wybrać lub wpisać kwotę napiwku');
      return;
    }
    alert(`Przekierowanie do płatności: ${finalAmount} PLN`);
  };

  if (!waiter) {
    return <div>Ładowanie...</div>; // Pokazujemy komunikat, dopóki dane kelnera się ładują
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {/* Sekcja kelnera */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              {!imageError ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={waiter.avatarUrl}
                    alt={`Avatar ${waiter.name}`}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 text-2xl font-bold">
                    {getInitials(waiter.name)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Napiwek dla: {waiter.name}</h1>
          <p className="text-gray-500 mt-2">ID: {waiter.id}</p>
        </div>

        {/* Preset kwot */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {tipAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => {
                setSelectedAmount(amount);
                setCustomAmount('');
              }}
              className={`p-4 rounded-lg text-center ${
                selectedAmount === amount 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <div className="font-bold">{amount} PLN</div>
            </button>
          ))}
        </div>

        {/* Własna kwota */}
        <div className="mb-6">
          <input
            type="number"
            placeholder="Wpisz własną kwotę"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(null);
            }}
            className="w-full p-3 border rounded-lg"
            min="0"
            step="0.01"
          />
        </div>

        {/* Przycisk zapłaty */}
        <button
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <CreditCard className="w-5 h-5 mr-2" />
          Zapłać {(selectedAmount || Number(customAmount) || 0).toFixed(2)} PLN
        </button>
      </div>
    </main>
  );
}
