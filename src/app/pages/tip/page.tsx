'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';

export default function TipPage() {
  const searchParams = useSearchParams();
  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');
  
  const getInitials = (name: string | null): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const tipPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tip/payment?waiterId=${waiterId}&name=${encodeURIComponent(name || '')}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Avatar z inicjałami */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-3xl font-bold">
                {getInitials(name)}
              </span>
            </div>
          </div>

          {/* Nazwa kelnera */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {name}
            </h1>
            <p className="text-gray-500 mt-1">
              Zeskanuj kod QR aby zostawić napiwek
            </p>
          </div>

          {/* Kod QR */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            <QRCodeSVG 
              value={tipPageUrl}
              size={200}
              level="H"
              includeMargin={true}
              className="shadow-lg rounded-lg"
            />
          </div>

          {/* Link alternatywny */}
          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-2">
              lub skorzystaj z bezpośredniego linku:
            </p>
            <a
              href={tipPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-700"
            >
              <span>Otwórz stronę płatności</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}