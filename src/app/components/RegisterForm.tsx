import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/config/firebase';
import { createOrUpdateUser } from '@/app/utils/firebaseUtils';

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
      // Najpierw tworzymy użytkownika w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Następnie tworzymy dokument użytkownika w Firestore
      await createOrUpdateUser(userCredential.user.uid, {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
      });
      
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Imię"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          className="w-full p-2 border rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Nazwisko"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          className="w-full p-2 border rounded-lg"
          required
        />
      </div>
      
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