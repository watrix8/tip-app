'use client';

import ClientAuthProvider from '@/components/ClientAuthProvider';
import WaiterPanelContent from '@/app/dashboard/waiter/WaiterPanelContent';

export default function WaiterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ClientAuthProvider>
        <WaiterPanelContent />
      </ClientAuthProvider>
    </div>
  );
}