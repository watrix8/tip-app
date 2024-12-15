'use client';

import ClientAuthProvider from '@/components/ClientAuthProvider';
import WaiterPanelContent from '@/app/dashboard/waiter/WaiterPanelContent';

export default function WaiterPage() {
  return (
    <ClientAuthProvider>
      <WaiterPanelContent />
    </ClientAuthProvider>
  );
} 