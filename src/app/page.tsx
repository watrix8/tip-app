'use client';

import { useState, useEffect } from 'react';
import LoginButton from '@/app/components/LoginButton';
import RegisterForm from '@/app/components/RegisterForm';
import { useRouter } from 'next/navigation';
import { mockUser } from '@/app/data/mockUser';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs
} from 'firebase/firestore';
import dynamic from 'next/dynamic';

const WaiterPanel = dynamic(() => import('@/app/components/WaiterPanel'), {
  ssr: false
});

interface User {
  id: string;
  name: string;
  email: string;
  restaurantId: string;
  avatarUrl: string;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Sprawdzamy stan logowania użytkownika
    if (mockUser.id) {
      setIsLoggedIn(true);
      setCurrentUser(mockUser);
    } else {
      const userId = localStorage.getItem('userId');
      if (userId) {
        getDoc(doc(getFirestore(), 'Users', userId)).then((doc) => {
          if (doc.exists()) {
            const { id, ...userData } = doc.data() as User; // Wykluczenie id z danych
            setCurrentUser({
              ...userData,
              id: doc.id // Ręczne przypisanie id
            });
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        });
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const q = query(collection(getFirestore(), 'Users'), where('email', '==', email), where('password', '==', password));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data() as User
      };
      setCurrentUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('userId', userData.id);
      router.push('/');
    } else {
      alert('Nieprawidłowy email lub hasło');
    }
  };
 
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('userId');
    router.push('/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {isLoggedIn ? (
          <WaiterPanel onLogout={handleLogout} currentUser={currentUser} />
        ) : showRegister ? (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">TipApp</h1>
              <p className="text-gray-500 mt-2">System napiwków dla kelnerów</p>
            </div>
            <div className="space-y-4">
              <LoginButton onLogin={handleLogin} />
              <button
                onClick={() => setShowRegister(true)}
                className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
              >
                Zarejestruj się
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
