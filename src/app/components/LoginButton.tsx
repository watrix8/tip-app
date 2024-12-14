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
    setError('');
    try {
      console.log('Próba logowania z:', email);
      await onLogin(email, password);
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
        className="w-full border border-[var(--neutral)] rounded-lg p-2 
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                   bg-white dark:bg-[var(--primary-dark)]
                   text-[var(--deep)] dark:text-white"
        required
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-[var(--neutral)] rounded-lg p-2 
                   focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                   bg-white dark:bg-[var(--primary-dark)]
                   text-[var(--deep)] dark:text-white"
        required
      />
      {error && (
        <p className="text-[var(--error)] text-sm text-center">{error}</p>
      )}
      <button 
        type="submit"
        className="w-full bg-[var(--primary)] text-[var(--primary-dark)] 
                   hover:bg-[var(--primary-hover)] py-3 px-4 rounded-lg 
                   flex items-center justify-center transition-colors
                   font-medium"
      >
        <LogIn className="w-5 h-5 mr-2" />
        Zaloguj się
      </button>
    </form>
  );
}