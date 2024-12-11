'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła się nie zgadzają');
      return;
    }
  
    try {
      console.log("Próba rejestracji:", formData.email);
      await register(formData.email, formData.password);
      console.log("Rejestracja udana");
      alert('Rejestracja udana! Możesz się teraz zalogować.');
      onBackToLogin();
    } catch (error: any) {
      console.error("Szczegóły błędu rejestracji:", error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        setError('Ten adres email jest już zajęty');
      } else if (error.code === 'auth/weak-password') {
        setError('Hasło jest za słabe - minimum 6 znaków');
      } else {
        setError('Błąd rejestracji: ' + error.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        className="w-full p-2 border rounded-lg"
        required
      />
      <input
        type="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        className="w-full p-2 border rounded-lg"
        required
      />
      <input
        type="password"
        placeholder="Potwierdź hasło"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
        <UserPlus className="w-5 h-5 mr-2" />
        Zarejestruj się
      </button>
      <button
        type="button"
        onClick={onBackToLogin}
        className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
      >
        Wróć do logowania
      </button>
    </form>
  );
}