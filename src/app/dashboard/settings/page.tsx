'use client';

import ClientAuthProvider from '@/app/components/ClientAuthProvider';
import SettingsPageContent from './SettingsPageContent';

export default function SettingsPage() {
  return (
    <ClientAuthProvider>
      <SettingsPageContent />
    </ClientAuthProvider>
  );
}