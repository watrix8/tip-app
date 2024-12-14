'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth } from '@/app/config/firebase';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserDocument = async (user: User) => {
    const userDocRef = doc(db, 'Users', user.uid);

    try {
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Tworzymy dokument użytkownika tylko jeśli jeszcze nie istnieje
        await setDoc(userDocRef, {
          name: user.displayName || 'Nowy użytkownik',
          email: user.email,
          avatarUrl: null,
          createdAt: new Date(),
        });
        console.log('Dokument użytkownika został stworzony w Firestore.');
      } else {
        console.log('Dokument użytkownika już istnieje.');
      }
    } catch (error) {
      console.error('Błąd tworzenia dokumentu użytkownika:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', result.user);

      // Synchronizacja użytkownika z Firestore
      await createUserDocument(result.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful:', result.user);

      // Tworzymy dokument w Firestore dla nowo zarejestrowanego użytkownika
      await createUserDocument(result.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
