'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { addUser } from '@/app/utils/firebaseUtils';

interface RegisterFormProps {
  onBackToLogin: () => void;
}

export default function RegisterForm({ onBackToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła się nie zgadzają');
      return;
    }
  
    try {
      await addUser(
        `${formData.firstName} ${formData.lastName}`,
        formData.email,
        formData.password,
        '',
        ''
      );
      
      alert('Rejestracja udana! Możesz się teraz zalogować.');
      onBackToLogin();
    } catch (error: FirebaseError | unknown) {
      console.error("Błąd rejestracji:", error);
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
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 bg-[var(--neutral)] bg-opacity-5 p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Imię"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className={inputClasses}
            required
          />
          <input
            type="text"
            placeholder="Nazwisko"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className={inputClasses}
            required
          />
        </div>
        
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className={inputClasses}
          required
        />
        
        <input
          type="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          className={inputClasses}
          required
        />
        
        <input
          type="password"
          placeholder="Potwierdź hasło"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
          <UserPlus className="w-5 h-5 mr-2" />
          Zarejestruj się
        </button>
        
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full bg-[var(--secondary)] text-white py-3 px-4 rounded-lg 
                   flex items-center justify-center hover:bg-[var(--secondary-hover)] 
                   transition-colors"
        >
          Wróć do logowania
        </button>
      </form>
    </div>
  );
}