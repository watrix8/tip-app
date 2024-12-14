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
      await onLogin(email, password);
    } catch (err) {
      console.error('Błąd logowania:', err);
      setError('Nieprawidłowy email lub hasło');
    }
  };

  const inputClasses = `
    w-full p-2 
    border border-[var(--neutral)] 
    rounded-lg 
    bg-[var(--background)]
    text-[var(--deep)]
    focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
    placeholder-[var(--neutral)]
    transition-colors
  `;

  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4 bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
          required
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClasses}
          required
        />
        {error && (
          <p className="text-[var(--error)] text-sm text-center">{error}</p>
        )}
        <button 
          type="submit"
          className="w-full bg-[var(--primary)] text-[var(--primary-dark)] py-3 px-4 rounded-lg 
                   flex items-center justify-center hover:bg-[var(--primary-hover)] 
                   transition-colors font-medium"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Zaloguj się
        </button>
      </form>
    </div>
  );
}