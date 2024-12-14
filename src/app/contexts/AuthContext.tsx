// AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '@/app/config/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Najpierw czyścimy localStorage z potencjalnych pozostałości
    localStorage.removeItem('firebase:authUser');
    localStorage.removeItem('firebase:previousAuthUser');

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', {
        userId: firebaseUser?.uid,
        email: firebaseUser?.email
      });

      if (firebaseUser) {
        // Sprawdzamy czy użytkownik faktycznie istnieje w Firestore
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Jeśli nie ma dokumentu użytkownika, wylogowujemy
          console.log('[AuthContext] User document not found, signing out');
          await signOut(auth);
          setUser(null);
        } else {
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AuthContext] Login successful:', result.user);
      setUser(result.user);
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Czyścimy wszystkie dane użytkownika
      setUser(null);
      localStorage.clear(); // Czyścimy cały localStorage
      console.log('[AuthContext] Logout successful');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);