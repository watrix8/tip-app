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
  login: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_COOKIE_NAME = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web`;

// Pomocnicza funkcja do sprawdzania cookie
const getAuthCookie = () => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(SESSION_COOKIE_NAME));
  
  if (!cookie) return null;
  
  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  useEffect(() => {
    let unsubscribed = false;

    const setupAuth = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
        
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (unsubscribed || isProcessingAuth) return;

          console.log('Zmiana stanu autoryzacji Firebase:', {
            email: firebaseUser?.email,
            timestamp: new Date().toISOString()
          });

          const sessionCookie = getAuthCookie();
          console.log('Stan cookie:', {
            hasCookie: !!sessionCookie,
            hasFirebaseUser: !!firebaseUser
          });

          if (!sessionCookie && firebaseUser && !isProcessingAuth) {
            console.log('Brak cookie sesji - wylogowuję');
            signOut();
          }
          
          setUser(firebaseUser);
          setLoading(false);
        });

        return () => {
          unsubscribed = true;
          unsubscribe();
        };
      } catch (error) {
        console.error('Błąd inicjalizacji auth:', error);
        if (!unsubscribed) {
          setLoading(false);
        }
      }
    };

    setupAuth();

    const timeoutId = setTimeout(() => {
      if (!unsubscribed && loading) {
        console.warn('Timeout inicjalizacji auth');
        setLoading(false);
      }
    }, 5000);

    return () => {
      unsubscribed = true;
      clearTimeout(timeoutId);
    };
  }, [isProcessingAuth]);
  
  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      setIsProcessingAuth(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Ustawiamy cookie na 1 godzinę
      const cookieValue = JSON.stringify(userCredential.user);
      document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; path=/; max-age=3600; SameSite=Strict`;
      
      return userCredential;
    } catch (error) {
      console.error('Błąd logowania:', error);
      throw error;
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const signOut = async () => {
    try {
      setIsProcessingAuth(true);
      
      // Czyścimy cookie
      document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      // Czyścimy localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('firebase:') || key.startsWith('tip-app:')) {
          localStorage.removeItem(key);
        }
      });

      // Wylogowujemy z Firebase
      await firebaseSignOut(auth);
      
      // Czekamy na potwierdzenie wylogowania
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            unsubscribe();
            resolve();
          }
        });
        setTimeout(resolve, 1000);
      });

      window.location.href = '/login';
    } catch (error) {
      console.error('Błąd wylogowania:', error);
      throw error;
    } finally {
      setIsProcessingAuth(false);
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
    throw new Error('useAuth musi być używany wewnątrz AuthProvider');
  }
  return context;
};