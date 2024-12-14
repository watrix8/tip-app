'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Current auth user:', user);
      
      if (!user?.email) {
        setError('Brak zalogowanego użytkownika');
        setIsLoading(false);
        return;
      }

      try {
        // Próbujemy znaleźć użytkownika po emailu w kolekcji Users
        const usersSnapshot = await getDocs(query(
          collection(db, 'Users'),
          where('email', '==', user.email)
        ));

        if (usersSnapshot.empty) {
          setError('Nie znaleziono danych użytkownika');
          setIsLoading(false);
          return;
        }

        const userDoc = usersSnapshot.docs[0];
        const data = {
          id: userDoc.id,
          ...userDoc.data()
        } as UserData;
        
        console.log('Loaded user data:', data);
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Wystąpił błąd podczas pobierania danych');
      } finally {
        setIsLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return <SettingsPage currentUser={userData} />;
}