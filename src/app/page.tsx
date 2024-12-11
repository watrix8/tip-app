'use client';

import { useState } from 'react';
import LoginButton from './components/LoginButton';
import WaiterPanel from './components/WaiterPanel';
import RegisterForm from './components/RegisterForm';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-md">
        {isLoggedIn ? (
          <WaiterPanel onLogout={() => setIsLoggedIn(false)} />
        ) : showRegister ? (
          <RegisterForm onBackToLogin={() => setShowRegister(false)} />
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">TipApp</h1>
              <p className="text-gray-500 mt-2">System napiwków dla kelnerów</p>
            </div>
            <div className="space-y-4">
              <LoginButton onLogin={() => setIsLoggedIn(true)} />
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