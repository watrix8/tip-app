'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientAuthProvider from '@/components/ClientAuthProvider';
import WaiterPanelContent from '@/app/dashboard/waiter/WaiterPanelContent';
import { useAuth } from '@/lib/contexts/auth';

function WaiterPageContent() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <WaiterPanelContent />;
}

export default function WaiterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthProvider>
        <WaiterPageContent />
      </ClientAuthProvider>
    </div>
  );
}