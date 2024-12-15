'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/config/firebase';
import LoginButton from '@/app/auth/components/LoginButton';

export default function LoginPage() {
  const [migrationError, setMigrationError] = useState('');

  const migrateUser = async (email: string, password: string) => {
    try {
      console.log('Rozpoczynam migrację użytkownika:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Użytkownik pomyślnie dodany do Firebase Auth:', userCredential.user.uid);
      alert('Konto zostało utworzone w Firebase Auth. Możesz się teraz zalogować.');
    } catch (error) {
      console.error('Błąd podczas migracji:', error);
      setMigrationError('Błąd podczas tworzenia konta w Firebase Auth');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Zaloguj się do swojego konta
          </h2>
        </div>

        {/* Przycisk do migracji */}
        <div className="mt-4">
          <button
            onClick={() => migrateUser('tomasz.watras@gmail.com', 'twoje-haslo')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Utwórz konto w Firebase Auth
          </button>
          {migrationError && (
            <p className="text-red-500 text-sm mt-2">{migrationError}</p>
          )}
        </div>

        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}