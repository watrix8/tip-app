'use client';

import { QRCodeSVG } from 'qrcode.react';
import { LogOut } from 'lucide-react';
import { mockUser } from '@/app/data/mockUser';

interface WaiterPanelProps {
  onLogout: () => void;
}

export default function WaiterPanel({ onLogout }: WaiterPanelProps) {
  const waiterQrData = `http://192.168.1.49:3000/tip?waiterId=${mockUser.id}&name=${encodeURIComponent(mockUser.name)}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Panel Kelnera</h2>
        <p className="text-sm text-gray-500">{mockUser.name} (ID: {mockUser.id})</p>
      </div>

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