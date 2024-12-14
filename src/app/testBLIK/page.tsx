'use client';

import { useState } from 'react';
import { ClipboardCopy } from 'lucide-react';

export default function TestBLIK() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('Napiwek');
  const [copied, setCopied] = useState(false);

  // Generowanie linku BLIK
  const generateBlikLink = () => {
    if (!phoneNumber || !amount) return '';
    return `blik://transfer?phone=${phoneNumber}&amount=${amount}&title=${encodeURIComponent(title)}`;
  };

  // Generowanie URL dla QR kodu
  const getQRCodeUrl = () => {
    const blikUrl = generateBlikLink();
    if (!blikUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(blikUrl)}&size=200x200`;
  };

  // Kopiowanie do schowka
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const blikUrl = generateBlikLink();
  const qrCodeUrl = getQRCodeUrl();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Test BLIK Deep Link</h1>
        
        {/* Formularz */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Numer telefonu
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="np. 889967769"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kwota (PLN)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="np. 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tytuł przelewu
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="np. Napiwek"
            />
          </div>
        </div>

        {/* Wynik */}
        {blikUrl && (
          <div className="mt-8 space-y-6">
            {/* Link tekstowy */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Link BLIK
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={blikUrl}
                  className="block w-full rounded-md border-gray-300 bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(blikUrl)}
                  className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ClipboardCopy className="w-5 h-5" />
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600">Skopiowano do schowka!</p>
              )}
            </div>

            {/* Link jako przycisk */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Przycisk BLIK
              </label>
              <a
                href={blikUrl}
                className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Otwórz w aplikacji bankowej
              </a>
            </div>

            {/* Kod QR */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Kod QR
              </label>
              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="BLIK QR Code"
                  className="border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}