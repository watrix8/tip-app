'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import { useRouter } from 'next/navigation';

// Definiujemy interfejs dla kontekstu
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
} 

// Tworzymy kontekst
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const setupAuth = async () => {
      await setPersistence(auth, browserLocalPersistence);
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser?.email);
        setUser(firebaseUser);
        setLoading(false);

        if (firebaseUser) {
          // Zapisz dane użytkownika w localStorage
          localStorage.setItem('user', JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          }));

          // Ustaw cookie sesji
          document.cookie = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web=${firebaseUser.uid}; path=/; max-age=7200`;
        }
      });

      return () => unsubscribe();
    };

    setupAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      // Ustaw cookie sesji po zalogowaniu
      document.cookie = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web=${userCredential.user.uid}; path=/; max-age=7200`;
      
      router.push('/dashboard/waiter');
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('user');
      // Usuń cookie sesji
      document.cookie = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      router.push('/login');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook do używania kontekstu auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};