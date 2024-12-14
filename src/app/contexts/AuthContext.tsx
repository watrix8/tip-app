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

const PUBLIC_ROUTES = ['/login', '/register', '/'];
const HOME_ROUTE = '/waiter-panel';

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

      if (firebaseUser) {
        // Sprawdzamy czy użytkownik faktycznie istnieje w Firestore
        const db = getFirestore();
        try {
          const userDoc = await getDoc(doc(db, 'Users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            console.log('[AuthContext] User document not found, signing out');
            await signOut(auth);
            setUser(null);
            if (!PUBLIC_ROUTES.includes(pathname || '')) {
              router.push('/login');
            }
          } else {
            console.log('[AuthContext] User document found:', userDoc.data());
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error('[AuthContext] Error checking user document:', error);
          setUser(null);
          if (!PUBLIC_ROUTES.includes(pathname || '')) {
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

  useEffect(() => {
    if (loading) return;

    console.log('[AuthContext] Route check:', {
      pathname,
      isPublicRoute: PUBLIC_ROUTES.includes(pathname || ''),
      user: !!user
    });

    // Jeśli użytkownik jest zalogowany i próbuje dostać się do strony logowania
    // przekieruj go na stronę główną
    if (user && PUBLIC_ROUTES.includes(pathname || '') && pathname !== '/') {
      console.log('[AuthContext] Logged in user trying to access public route, redirecting to home');
      router.push(HOME_ROUTE);
      return;
    }

    // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
    if (!user && !PUBLIC_ROUTES.includes(pathname || '') && pathname !== '/') {
      console.log('[AuthContext] Unauthorized access attempt, redirecting to login');
      router.push('/login');
      return;
    }
  }, [user, pathname, router, loading]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AuthContext] Login successful:', result.user);
      setUser(result.user);
      
      // Sprawdź czy użytkownik istnieje w Firestore
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'Users', result.user.uid));
      
      if (!userDoc.exists()) {
        console.error('[AuthContext] User document not found after login');
        await signOut(auth);
        setUser(null);
        throw new Error('Użytkownik nie istnieje w systemie');
      }

      // Po zalogowaniu przekieruj na stronę główną
      router.push(HOME_ROUTE);
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
      // Po wylogowaniu przekieruj na stronę logowania
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