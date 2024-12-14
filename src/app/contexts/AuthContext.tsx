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
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const PROTECTED_ROUTES = ['/settings', '/waiter-panel'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[AuthContext] Initializing with path:', pathname);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[AuthContext] Auth state changed:', {
        userId: firebaseUser?.uid,
        email: firebaseUser?.email,
        currentPath: pathname
      });

      // Sprawdź czy jesteśmy na chronionej ścieżce
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));

      if (!firebaseUser && isProtectedRoute) {
        console.log('[AuthContext] No user on protected route, redirecting to login');
        router.push('/login');
        setUser(null);
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        // Sprawdzamy czy użytkownik faktycznie istnieje w Firestore
        const db = getFirestore();
        try {
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            console.log('[AuthContext] User document not found, signing out');
            await signOut(auth);
            setUser(null);
            if (isProtectedRoute) {
              router.push('/login');
            }
          } else {
            console.log('[AuthContext] User document found:', userDoc.data());
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('[AuthContext] Error checking user document:', error);
          setUser(null);
          if (isProtectedRoute) {
            router.push('/login');
          }
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [pathname, router]);

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
      setUser(null);
      router.push('/login');
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