'use client';

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { mockUser } from '@/app/data/mockUser';

interface LoginButtonProps {
  onLogin: () => void;
}

export default function LoginButton({ onLogin }: LoginButtonProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (email === mockUser.email && password === mockUser.password) {
      setError('');
      onLogin();
    } else {
      setError('Nieprawidłowy email lub hasło');
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 text-center mb-4">
        Demo - użyj:<br />
        Email: {mockUser.email}<br />
        Hasło: {mockUser.password}
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded-lg mb-2"
      />

      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded-lg mb-2"
      />

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <button 
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={handleLogin}
      >
        <LogIn className="w-5 h-5 mr-2" />
        Zaloguj się jako kelner
      </button>
    </div>
  );
}