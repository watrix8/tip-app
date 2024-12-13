// src/app/components/WaiterPanel.tsx
'use client';

// Używane komponenty oznaczamy jako potrzebne
import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
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
  const [imageError, setImageError] = useState(false);

  // ... reszta kodu komponentu

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

      {/* Avatar użytkownika */}
      {currentUser?.avatarUrl && !imageError && (
        <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
          <Image
            src={currentUser.avatarUrl}
            alt={`Avatar ${currentUser.name}`}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* ... reszta kodu komponentu */}
    </div>
  );
}