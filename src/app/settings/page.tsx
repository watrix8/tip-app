'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Camera, Save, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/SimpleAlert';
import { useRouter } from 'next/navigation';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.warn('Brak zalogowanego użytkownika');
        setIsLoading(false);
        return;
      }

      console.log('Pobieranie danych użytkownika dla UID:', user.uid);
      try {
        const db = getFirestore();
        const userDocRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userDocRef);

        console.log('Czy dokument istnieje?', userDoc.exists());

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('Dane użytkownika z Firestore:', data);

          setName(data.name || user.displayName || '');
          if (data.avatarUrl) {
            setPreviewAvatar(data.avatarUrl);
          }
        } else {
          console.warn('Dokument użytkownika nie istnieje w Firestore');
        }
      } catch (err) {
        console.error('Błąd podczas pobierania danych użytkownika:', err);
        setError('Nie udało się załadować danych użytkownika');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        setError('Dozwolone są tylko pliki JPG, PNG i GIF');
        return;
      }

      if (file.size > maxSize) {
        setError('Plik nie może być większy niż 5MB');
        return;
      }

      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setPreviewAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Imię jest wymagane');
      return;
    }

    try {
      if (!user) throw new Error('Użytkownik nie jest zalogowany');

      const db = getFirestore();
      const userDocRef = doc(db, 'Users', user.uid);

      console.log('Rozpoczynam aktualizację danych profilu...');

      let avatarUrl = previewAvatar;
      if (avatar) {
        const storage = getStorage();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        console.log('Przesyłanie pliku do ścieżki:', avatarRef.fullPath);

        const snapshot = await uploadBytes(avatarRef, avatar);
        avatarUrl = await getDownloadURL(snapshot.ref);
        console.log('Avatar został przesłany. URL:', avatarUrl);
      }

      await updateDoc(userDocRef, {
        name: name,
        ...(avatarUrl && { avatarUrl })
      });
      console.log('Dane w Firestore zostały zaktualizowane');

      await updateProfile(user, {
        displayName: name,
        ...(avatarUrl && { photoURL: avatarUrl })
      });
      console.log('Profil w Firebase Auth został zaktualizowany');

      setSuccess('Profil został zaktualizowany');
      setIsEditing(false);
      if (avatarUrl) setPreviewAvatar(avatarUrl);
    } catch (err) {
      console.error('Błąd podczas aktualizacji profilu:', err);
      setError('Nie udało się zaktualizować profilu');
    }
  };

  const handleGoBack = () => router.push('/');

  const getInitials = () => (name ? name[0].toUpperCase() : '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button onClick={handleGoBack} className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ustawienia profilu</h1>
      </div>

      {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert className="mb-6"><AlertDescription>{success}</AlertDescription></Alert>}

      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {previewAvatar ? (
              <img src={previewAvatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{getInitials()}</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/gif"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          {(previewAvatar || avatar) && (
            <button onClick={handleRemoveAvatar} className="text-red-600 hover:text-red-700 flex items-center">
              <X className="w-4 h-4 mr-2" /> Usuń zdjęcie
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Imię</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${isEditing ? 'bg-white' : 'bg-gray-100 text-gray-600'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-3 bg-gray-100 text-gray-600 border rounded-lg"
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                <User className="w-5 h-5 mr-2" /> Edytuj profil
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300">
                  Anuluj
                </button>
                <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  <Save className="w-5 h-5 mr-2" /> Zapisz
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
