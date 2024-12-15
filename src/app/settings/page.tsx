'use client';

import ClientAuthProvider from '@/components/ClientAuthProvider';
import SettingsPageContent from '@/app/settings/SettingsPageContent';

export default function SettingsPage() {
  return (
    <ClientAuthProvider>
      <SettingsPageContent />
    </ClientAuthProvider>
  );
} 