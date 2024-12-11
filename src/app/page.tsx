'use client';

import { useState, useEffect } from 'react';
import LoginButton from '@/app/components/LoginButton';
import RegisterForm from '@/app/components/RegisterForm';
import { useRouter } from 'next/navigation';
import { mockUser } from '@/app/data/mockUser';
import dynamic from 'next/dynamic';
const WaiterPanel = dynamic(() => import('@/app/components/WaiterPanel'), {
  ssr: false
});

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Sprawdzamy czy użytkownik jest zalogowany
    // W prawdziwej aplikacji, byśmy to sprawdzali na podstawie tokena lub sesji
    setIsLoggedIn(!!mockUser.id);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // Przekierowujemy użytkownika na stronę główną, na której znajduje się panel kelnera
    router.push('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // Przekierowujemy użytkownika na stronę główną
    router.push('/');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {isLoggedIn ? (
          <WaiterPanel onLogout={handleLogout} />
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