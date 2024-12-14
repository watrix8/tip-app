'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/AuthContext';
import { getUserData } from '@/app/utils/firebaseUtils';
import SettingsPage from '@/app/components/SettingsPage';

interface UserData {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  restaurantId?: string;
  stripeAccountId?: string;
  stripeOnboardingStatus?: string;
  stripeOnboardingTimestamp?: string;
}

export default function SettingsPageWrapper() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data as UserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <SettingsPage currentUser={userData} />;
}