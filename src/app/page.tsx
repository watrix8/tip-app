'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginButton from '@/app/components/auth/LoginButton';
import RegisterForm from '@/app/components/auth/RegisterForm';
import dynamic from 'next/dynamic';

const WaiterPanel = dynamic(() => import('@/app/waiter-panel/WaiterPanel'), {
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
  const router = useRouter();
  const { user, loading, logout } = useAuth(); // Wyciągamy logout z useAuth na poziomie komponentu
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (!loading && user) {
      setCurrentUser({
        id: user.uid,
        name: user.displayName || '',
        email: user.email || '',
        restaurantId: '',
        avatarUrl: user.photoURL || ''
      });
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await logout(); // Używamy logout z kontekstu
      setCurrentUser(null);
      router.push('/');
    } catch (error) {
      console.error('Błąd wylogowania:', error);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {currentUser ? (
          <WaiterPanel onLogout={handleLogout} currentUser={currentUser} />
        ) : showRegister ? (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">TipApp</h1>
              <p className="text-gray-500 mt-2">System napiwków dla kelnerów</p>
            </div>
            <div className="space-y-6">
              <LoginButton />
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