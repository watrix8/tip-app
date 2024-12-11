'use client';

import { useState } from 'react';
import { QrCode, LogOut, DollarSign, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { mockUser } from '@/app/data/mockUser';

interface WaiterPanelProps {
  onLogout: () => void;
}

// Mockowe dane dla transakcji
const mockTransactions = [
  { id: 1, amount: 10, date: '2024-12-11 10:30', status: 'completed' },
  { id: 2, amount: 5, date: '2024-12-11 11:45', status: 'completed' },
  { id: 3, amount: 15, date: '2024-12-11 13:20', status: 'completed' },
];

export default function WaiterPanel({ onLogout }: WaiterPanelProps) {
  // Generujemy stały kod QR dla kelnera
  const waiterQrData = `http://192.168.1.49:3000/tip?waiterId=${mockUser.id}&name=${encodeURIComponent(mockUser.name)}`;


  // Obliczamy sumę napiwków z dzisiaj
  const todayTips = mockTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="space-y-6">
      {/* Sekcja powitalna */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Witaj {mockUser.name}!</h2>
        <p className="text-sm text-gray-500">ID: {mockUser.id}</p>
      </div>

      {/* Suma napiwków */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-blue-600 mr-2" />
          <div>
            <p className="text-sm text-gray-600">Napiwki dzisiaj:</p>
            <p className="text-2xl font-bold text-blue-600">{todayTips} PLN</p>
          </div>
        </div>
      </div>

      {/* Kod QR kelnera */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-900">Twój kod QR</h3>
          <p className="text-sm text-gray-500">Pokaż ten kod klientom</p>
        </div>
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
      </div>

      {/* Historia transakcji */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Historia napiwków
          </h3>
        </div>
        <div className="divide-y">
          {mockTransactions.map(transaction => (
            <div key={transaction.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{transaction.amount} PLN</p>
                <p className="text-xs text-gray-500">{transaction.date}</p>
              </div>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {transaction.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Przycisk wylogowania */}
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