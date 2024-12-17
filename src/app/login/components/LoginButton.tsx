'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth';
import { FirebaseError } from 'firebase/app';

export default function LoginButton() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Próba logowania dla:', email);
      await login(email, password);
      console.log('Logowanie udane - przekierowuję...');
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Hasło
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      
      <button 
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Logowanie...</span>
          </div>
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Zaloguj się
          </>
        )}
      </button>
    </form>
  );
}