'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import LoginButton from '@/app/components/LoginButton';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      router.push('/waiter-panel'); // lub inna strona domowa po zalogowaniu
    } catch (error) {
      console.error('Login error:', error);
      setError('Nieprawidłowy email lub hasło');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zaloguj się do swojego konta
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <LoginButton onLogin={handleLogin} />
      </div>
    </div>
  );
}