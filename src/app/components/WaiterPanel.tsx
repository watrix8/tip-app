'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut } from 'lucide-react';
import { mockUser } from '@/app/data/mockUser';
import Image from 'next/image';

interface Tip {
  amount: number;
  timestamp: Date;
}

interface WaiterPanelProps {
  onLogout: () => void;
}

{!imageError ? (
  <div className="relative w-12 h-12">
    <Image
      src={mockUser.avatarUrl}
      alt={`Avatar ${mockUser.name}`}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
    />
  </div>
) : (
  <div className="w-full h-12 h-12 flex items-center justify-center bg-blue-100">
    <span className="text-blue-600 text-xl font-bold">
      {getInitials(mockUser.name)}
    </span>
  </div>
)}

export default function WaiterPanel({ onLogout }: WaiterPanelProps) {
  const [tips, setTips] = useState<Tip[]>([]);
  const [totalTips, setTotalTips] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Zaktualizowany URL na właściwą domenę
  const waiterQrData = `https://tip-app-bay.vercel.app/tip?waiterId=${mockUser.id}&name=${encodeURIComponent(mockUser.name)}`;

  useEffect(() => {
    // W prawdziwej aplikacji, pobieralibyśmy dane o napiwkach z serwera
    const mockTips: Tip[] = [
      { amount: 10, timestamp: new Date('2023-05-01') },
      { amount: 15, timestamp: new Date('2023-05-02') },
      { amount: 8, timestamp: new Date('2023-05-03') },
    ];
    setTips(mockTips);
    setTotalTips(mockTips.reduce((acc, tip) => acc + tip.amount, 0));
  }, []);

  // Funkcja tworząca inicjały
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Witaj, {mockUser.name}!</h2>
        <p className="text-sm text-gray-500">ID: {mockUser.id}</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              {!imageError ? (
                <img
                  src={mockUser.avatarUrl}
                  alt={`Avatar ${mockUser.name}`}
                  className="object-cover w-full h-full"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 text-2xl font-bold">
                    {getInitials(mockUser.name)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{mockUser.name}</h3>
              <p className="text-sm text-gray-500">ID: {mockUser.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{totalTips.toFixed(2)} PLN</p>
            <p className="text-sm text-gray-500">Dzisiejsze saldo</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Twoje napiwki</h4>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex justify-between">
                <span className="text-gray-500">{tip.amount.toFixed(2)} PLN</span>
                <span className="text-gray-500">{tip.timestamp.toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-2">Kod QR</h4>
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                value={waiterQrData}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Pokaż ten kod klientom</p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Wyloguj się
      </button>
    </div>
  );
}