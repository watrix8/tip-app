// app/dashboard/layout.tsx

'use client';

import Link from 'next/link';
import { HandCoins } from 'lucide-react';
import { useEffect } from 'react';
import { useAuth } from '@/lib/contexts/auth';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/dashboard/waiter" 
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
          >
            <HandCoins className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">tippin&apos;</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <div>
            &copy; {new Date().getFullYear()} tippin&apos;. Wszelkie prawa zastrzeżone.
          </div>
          <div className="mt-2">
            <Link 
              href="/regulamin" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 hover:underline"
            >
              Regulamin usługi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}