'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';

export default function LoginButton() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Próba logowania dla:', email);
      await login(email, password);
      console.log('Logowanie udane - przekierowuję...');
      setTimeout(() => {
        router.push('/dashboard/waiter');
      }, 100);
    } catch (err) {
      console.error('Szczegóły błędu logowania:', err);
      if (err instanceof FirebaseError) {
        console.log('Firebase Error Code:', err.code);
        switch (err.code) {
          case 'auth/invalid-credential':
            setError('Nieprawidłowy email lub hasło.');
            break;
          case 'auth/user-not-found':
            setError('Użytkownik nie istnieje.');
            break;
          case 'auth/wrong-password':
            setError('Nieprawidłowe hasło');
            break;
          default:
            setError(`Błąd logowania: ${err.message}`);
        }
      } else {
        setError('Wystąpił nieoczekiwany błąd');
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded-lg"
        required
      />
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      <button 
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <LogIn className="w-5 h-5 mr-2" />
        Zaloguj się
      </button>
    </form>
  );
}