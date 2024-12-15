'use client';

import ClientAuthProvider from '@/app/components/ClientAuthProvider';
import WaiterPanelContent from './WaiterPanelContent';

export default function WaiterPage() {
  return (
    <ClientAuthProvider>
      <WaiterPanelContent />
    </ClientAuthProvider>
  );
}