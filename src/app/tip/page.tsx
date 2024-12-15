'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { ExternalLink } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import UserAvatar from '@/components/UserAvatar';

// Loading Component
const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
  </div>
);

// Main Content Component
const TipPageContent = () => {
  const searchParams = useSearchParams();
  const waiterId = searchParams.get('waiterId');
  const name = searchParams.get('name');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchWaiterData = async () => {
      if (waiterId) {
        try {
          const waiterDoc = await getDoc(doc(db, 'Users', waiterId));
          if (waiterDoc.exists()) {
            setAvatarUrl(waiterDoc.data().avatarUrl || null);
          }
        } catch (error) {
          console.error('Error fetching waiter data:', error);
        }
      }
    };

    fetchWaiterData();
  }, [waiterId]);

  const tipPageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tip/payment?waiterId=${waiterId}&name=${encodeURIComponent(name || '')}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        <div className="text-center space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <UserAvatar 
              name={name} 
              avatarUrl={avatarUrl} 
              size="lg"
            />
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
};

// Main Page Component
export default function TipPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TipPageContent />
    </Suspense>
  );
}