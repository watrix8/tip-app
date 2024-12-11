'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

interface Tip {
  amount: number;
  timestamp: Date;
  status: 'rozpoczęta' | 'otrzymany' | 'rozliczony' | 'anulowany';
}

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
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalTips, setTotalTips] = useState(0);
  const [imageError, setImageError] = useState(false);

  const waiterQrData = `https://tip-app-bay.vercel.app/tip?waiterId=${currentUser?.id}&name=${encodeURIComponent(currentUser?.name || '')}`;

  useEffect(() => {
    // Przykładowe dane napiwków z różnymi statusami
    const mockTips: Tip[] = [
      { amount: 10, timestamp: new Date('2023-12-01T14:30:00'), status: 'rozpoczęta' },
      { amount: 15, timestamp: new Date('2023-12-02T16:45:00'), status: 'otrzymany' },
      { amount: 8, timestamp: new Date('2023-12-03T12:00:00'), status: 'rozliczony' },
    ];
    setTips(mockTips);
    setTotalTips(mockTips.reduce((acc, tip) => acc + tip.amount, 0));
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
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

      {/* Sekcja powitalna */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Witaj, {currentUser?.name}!</h2>
      </div>

      {/* Sekcja z avatar i saldem */}
      <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
            {!imageError ? (
              <Image
                src={currentUser?.avatarUrl || ''}
                alt={`Avatar ${currentUser?.name}`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100">
                <span className="text-blue-600 text-xl font-bold">
                  {getInitials(currentUser?.name || '')}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{currentUser?.name}</h3>
          </div>
        </div>

        {/* Kwota do wypłaty w zielonym kółku */}
        <div className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full">
          <p className="font-bold text-lg">{totalTips.toFixed(2)}</p>
        </div>
      </div>

      {/* Historia napiwków */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Historia napiwków</h4>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className="text-gray-500">{tip.amount.toFixed(2)} PLN</span>
              <span className="text-gray-500">{tip.timestamp.toLocaleString()}</span>
              <span className={`text-sm font-semibold ${tip.status === 'otrzymany' ? 'text-green-500' : tip.status === 'rozliczony' ? 'text-blue-500' : 'text-gray-500'}`}>
                {tip.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Kod QR */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Kod QR</h4>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg">
            <a href={waiterQrData} target="_blank" rel="noopener noreferrer">
              <QRCodeSVG value={waiterQrData} size={200} level="H" includeMargin />
            </a>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">Pokaż ten kod klientom</p>
      </div>
    </div>
  );
}
