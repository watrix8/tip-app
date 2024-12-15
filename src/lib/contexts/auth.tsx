'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
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
}

// Tworzymy kontekst
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ustawiamy persystencję na początku
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
        
        console.log('Auth state changed:', firebaseUser?.email);
        
        if (firebaseUser) {
          // Sprawdzamy aktualną ścieżkę
          const currentPath = window.location.pathname;
          if (currentPath === '/login') {
            console.log('Redirecting from login to waiter panel');
            window.location.href = '/dashboard/waiter';
          }
        }
      });

      return () => unsubscribe();
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      // Zapisujemy dodatkowe informacje w localStorage
      localStorage.setItem('userEmail', userCredential.user.email || '');
      
      window.location.href = '/dashboard/waiter';
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      console.log('Logout successful, redirecting to login');
      window.location.href = '/login'; // Używamy bezpośredniego przekierowania przy wylogowaniu
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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