// app/settings/layout.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth';
import { useEffect } from 'react';
import DashboardLayout from '../dashboard/layout';

export default function SettingsLayout({
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

  // Używamy tego samego layoutu co w dashboardzie
  return <DashboardLayout>{children}</DashboardLayout>;
}