'use client';

import React, { useState, FormEvent } from 'react';
import AvatarUpload from '@/components/AvatarUpload';
import type { UserData } from '@/types/user';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';

interface SettingsPageProps {
  currentUser: UserData | null;
}

export default function SettingsPage({ currentUser }: SettingsPageProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    setNameError(null);

    if (!formData.name.trim()) {
      setNameError('To pole jest wymagane');
      setIsSaving(false);
      return;
    }

    if (!currentUser?.id) {
      setSaveError('Błąd: brak ID użytkownika');
      setIsSaving(false);
      return;
    }

    try {
      const userRef = doc(db, 'Users', currentUser.id);
      await updateDoc(userRef, {
        name: formData.name.trim(),
        updatedAt: new Date().toISOString()
      });
      
      setSaveSuccess(true);
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
      setSaveError('Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie później.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
    setSaveSuccess(true);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/waiter" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Powrót do panelu
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">Ustawienia profilu</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center mb-8">
              <AvatarUpload
                userId={currentUser.id}
                currentAvatarUrl={avatarUrl}
                userName={currentUser.name || ''}
                onAvatarUpdate={handleAvatarUpdate}
              />
              <p className="mt-4 text-sm text-gray-600">
                Kliknij w avatar aby zmienić zdjęcie profilowe
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Imię i nazwisko
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (nameError) setNameError(null);
                  }}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-500">{nameError}</p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  aria-disabled="true"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Adres email nie może zostać zmieniony
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </form>

            {saveSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  Zmiany zostały zapisane pomyślnie
                </p>
              </div>
            )}

            {saveError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">
                  {saveError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}