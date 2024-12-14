'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import { createOrUpdateUser } from '@/app/utils/firebaseUtils';
import SettingsPage from '@/app/components/SettingsPage';
import type { UserData } from '@/app/types/user';

export default function SettingsPageWrapper() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Current auth user:', user);
      
      if (!user?.uid) {
        setError('Brak zalogowanego użytkownika');
        setIsLoading(false);
        return;
      }

      try {
        // Najpierw próbujemy znaleźć dokument bezpośrednio po ID użytkownika
        const userDocRef = doc(db, 'Users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = {
            id: userDocSnap.id,
            ...userDocSnap.data()
          } as UserData;
          
          console.log('Loaded user data:', data);
          setUserData(data);
        } else {
          // Tworzymy nowy dokument użytkownika
          console.log('Creating new user document');
          await createOrUpdateUser(user.uid, {
            email: user.email || '',
            name: user.displayName || 'Nowy Użytkownik'
          });
          
          // Pobieramy świeżo utworzony dokument
          const newUserDoc = await getDoc(userDocRef);
          const data = {
            id: newUserDoc.id,
            ...newUserDoc.data()
          } as UserData;
          
          console.log('Created new user document:', data);
          setUserData(data);
        }
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
          <pre className="mt-2 text-xs">Debug info: User ID = {user?.uid}</pre>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          Tworzenie profilu użytkownika...
        </div>
      </div>
    );
  }

  return <SettingsPage currentUser={userData} />;
}