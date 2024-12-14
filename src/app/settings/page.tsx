'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { 
  doc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/app/config/firebase';
import { createOrUpdateUser } from '@/app/utils/firebaseUtils';
import SettingsPage from '@/app/components/waitier/SettingsPage';
import type { UserData } from '@/app/types/user';
import { useRouter } from 'next/navigation';

export default function SettingsPageWrapper() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[SettingsPageWrapper] Initial render:', {
      isAuthLoading: loading,
      authUser: user,
      currentUserData: userData,
      isPageLoading: isLoading
    });

    // Jeśli auth jeszcze się ładuje, czekamy
    if (loading) {
      console.log('[SettingsPageWrapper] Auth is still loading...');
      return;
    }

    // Jeśli nie ma użytkownika po załadowaniu auth, przekieruj do logowania
    if (!loading && !user) {
      console.log('[SettingsPageWrapper] No user after auth loaded, redirecting to login...');
      router.push('/login');
      return;
    }

    const fetchUserData = async () => {
      console.log('[SettingsPageWrapper] Starting fetchUserData:', {
        authUserId: user?.uid,
        authUserEmail: user?.email
      });
      
      if (!user?.uid) {
        setError('Brak zalogowanego użytkownika');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Najpierw próbujemy znaleźć użytkownika po email
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);

        console.log('[SettingsPageWrapper] Email query result:', {
          empty: querySnapshot.empty,
          count: querySnapshot.docs.length,
          docs: querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        });

        if (!querySnapshot.empty) {
          // Znaleziono istniejący dokument
          const existingDoc = querySnapshot.docs[0];
          const data = {
            id: existingDoc.id,
            ...existingDoc.data()
          } as UserData;
          
          console.log('[SettingsPageWrapper] Found user by email:', data);
          setUserData(data);
        } else {
          // 2. Jeśli nie znaleziono po email, spróbuj po Auth ID
          console.log('[SettingsPageWrapper] Trying to find user by Auth ID:', user.uid);
          const directRef = doc(db, 'Users', user.uid);
          const directSnap = await getDoc(directRef);

          if (directSnap.exists()) {
            const data = {
              id: directSnap.id,
              ...directSnap.data()
            } as UserData;
            
            console.log('[SettingsPageWrapper] Found user by Auth ID:', data);
            setUserData(data);
          } else {
            console.log('[SettingsPageWrapper] User document not found, creating new one');
            // 3. Jeśli nie znaleziono, utwórz nowy dokument
            await createOrUpdateUser(user.uid, {
              email: user.email || '',
              name: user.displayName || 'Nowy Użytkownik'
            });
            
            const newUserDoc = await getDoc(directRef);
            const data = {
              id: newUserDoc.id,
              ...newUserDoc.data()
            } as UserData;
            
            console.log('[SettingsPageWrapper] Created new user document:', data);
            setUserData(data);
          }
        }
      } catch (error) {
        console.error('[SettingsPageWrapper] Error:', error);
        setError('Wystąpił błąd podczas pobierania danych');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
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