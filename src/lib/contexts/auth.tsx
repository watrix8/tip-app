'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;  // Zmiana typu
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuth = async () => {
      await setPersistence(auth, browserLocalPersistence);
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser?.email);
        setUser(firebaseUser);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    setupAuth();
  }, []);

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ustawiamy ciasteczko z prawidłową ścieżką i odpowiednim czasem życia
      const sessionCookie = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web`;
      document.cookie = `${sessionCookie}=${JSON.stringify(userCredential.user)}; path=/; max-age=7200; SameSite=Strict`;
      
      return userCredential;
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Najpierw czyścimy wszystkie dane w localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:') || key.startsWith('tip-app:')) {
          localStorage.removeItem(key);
        }
      });
      
      // Czyścimy wszystkie ciasteczka związane z aplikacją
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.split('=');
        const trimmedName = name.trim();
        if (trimmedName.startsWith('firebase:') || trimmedName.startsWith('tip-app:')) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}`;
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      });

      // Wylogowanie z Firebase
      await firebaseSignOut(auth);

      // Czekamy na potwierdzenie wylogowania
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            unsubscribe();
            resolve();
          }
        });
      });

      // Przekierowanie na stronę logowania
      window.location.href = '/login';
      
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
};

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};