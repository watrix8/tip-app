'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bankAccount: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Podstawowa walidacja
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.bankAccount) {
      setError('Wszystkie pola są wymagane');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Hasła się nie zgadzają');
      return;
    }

    if (formData.bankAccount.length < 26) {
      setError('Nieprawidłowy numer konta bankowego');
      return;
    }

    // Tutaj w prawdziwej aplikacji wysłalibyśmy dane do API
    console.log('Dane rejestracji:', formData);
    alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
    onBackToLogin();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rejestracja</h2>
        <p className="text-sm text-gray-500">Utwórz konto kelnera</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="Imię"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Nazwisko"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="text"
          name="bankAccount"
          placeholder="Numer konta bankowego"
          value={formData.bankAccount}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Potwierdź hasło"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
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
    </div>
  );
}