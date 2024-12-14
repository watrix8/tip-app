'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';

interface LoginButtonProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function LoginButton({ onLogin }: LoginButtonProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Resetujemy wcześniejszy błąd
    try {
      console.log('Próba logowania z:', email);
      await onLogin(email, password); // Wywołujemy funkcję z propsów
      console.log('Logowanie udane');
    } catch (err) {
      console.error('Błąd logowania:', err);
      setError('Nieprawidłowy email lub hasło');
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
