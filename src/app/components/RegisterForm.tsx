'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseError } from 'firebase/app';
import { addUser } from '@/app/data/firebaseTest'; // Zaimportuj funkcję addUser

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    restaurantId: '',
    avatarUrl: ''
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
      
      // Dodajemy użytkownika do bazy danych
      await addUser(
        formData.name,
        formData.email,
        formData.password,  // Pamiętaj, że w prawdziwej aplikacji hasło nie powinno być przechowywane w bazie w czystej postaci!
        formData.restaurantId,
        formData.avatarUrl
      );
      
      alert('Rejestracja udana! Możesz się teraz zalogować.');
      onBackToLogin();
    } catch (error: FirebaseError | unknown) {
      console.error("Szczegóły błędu rejestracji:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          setError('Ten adres email jest już zajęty');
        } else if (error.code === 'auth/weak-password') {
          setError('Hasło jest za słabe - minimum 6 znaków');
        } else {
          setError('Błąd rejestracji: ' + error.message);
        }
      } else {
        setError('Wystąpił nieoczekiwany błąd');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Imię"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        className="w-full p-2 border rounded-lg"
        required
      />
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
      <input
        type="text"
        placeholder="Id restauracji"
        value={formData.restaurantId}
        onChange={(e) => setFormData({...formData, restaurantId: e.target.value})}
        className="w-full p-2 border rounded-lg"
      />
      <input
        type="text"
        placeholder="URL awatara"
        value={formData.avatarUrl}
        onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
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
  );
}
