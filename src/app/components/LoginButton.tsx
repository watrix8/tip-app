'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseError } from 'firebase/app';

interface LoginButtonProps {
  onLogin: () => void;
}

export default function LoginButton({ onLogin }: LoginButtonProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Próba logowania z:", email);
      await login(email, password);
      console.log("Logowanie udane");
      onLogin();
    } catch (error: FirebaseError | unknown) {
      console.error("Szczegóły błędu:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found') {
          setError('Nie znaleziono użytkownika o podanym adresie email');
        } else if (error.code === 'auth/wrong-password') {
          setError('Nieprawidłowe hasło');
        } else {
          setError('Błąd logowania: ' + error.message);
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