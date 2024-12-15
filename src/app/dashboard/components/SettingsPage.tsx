'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import { useAuth } from '@/lib/contexts/auth';
import type { SettingsPageProps } from '@/types/user';
import Image from 'next/image';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '@/lib/config/firebase';

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sprawdzamy czy currentUser.id zgadza się z zalogowanym użytkownikiem
  useEffect(() => {
    if (currentUser?.id !== user?.uid) {
      console.error('Unauthorized access attempt');
      router.push('/');
    }
  }, [currentUser?.id, user?.uid, router]);

  useEffect(() => {
    if (currentUser?.id !== user?.uid) {
      router.push('/');
    }
  }, [currentUser, user, router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;

    // Sprawdź czy użytkownik jest zalogowany
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) {
      setError('Musisz być zalogowany aby zmienić avatar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const storage = getStorage();
      const fileExtension = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExtension}`;
      const avatarRef = ref(storage, `avatars/${currentUser.id}/${fileName}`);
      
      // Upload pliku z metadanymi
      const metadata = {
        customMetadata: {
          userId: currentUser.id
        }
      };
      
      await uploadBytes(avatarRef, file, metadata);
      
      // Pobierz URL
      const downloadURL = await getDownloadURL(avatarRef);
      console.log('New avatar URL:', downloadURL);
      
      // Aktualizuj w bazie danych
      const userRef = doc(db, 'Users', currentUser.id);
      await updateDoc(userRef, {
        avatarUrl: downloadURL
      });
      
      setAvatarUrl(downloadURL);
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Wystąpił błąd podczas zapisywania avatara. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'Users', currentUser.id);
      await updateDoc(userRef, {
        name,
        avatarUrl
      });

      // Pokazujemy komunikat o sukcesie i wracamy do panelu
      alert('Zapisano zmiany!');
      router.back();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Wystąpił błąd podczas zapisywania zmian');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Nagłówek z przyciskiem powrotu */}
        <div className="mb-8 flex items-center">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-gray-100 rounded-lg mr-4 text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia profilu</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar section */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                onClick={handleAvatarClick}
                className="relative cursor-pointer group"
              >
                {avatarUrl ? (
                  <div className="relative w-32 h-32">
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      fill
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-500">
                Kliknij aby zmienić avatar
              </p>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  disabled
                />
                <p className="mt-1 text-sm text-gray-500">
                  Email nie może być zmieniony
                </p>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                'Zapisz zmiany'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;