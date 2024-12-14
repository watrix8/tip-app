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
        setIsLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userDocRef = doc(db, 'Users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || user.displayName || '');
          
          // Jeśli jest zdjęcie profilowe, ustaw je jako domyślne
          if (data.avatarUrl) {
            setPreviewAvatar(data.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching user data', err);
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
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!name.trim()) {
      setError('Imię jest wymagane');
      return;
    }

    try {
      if (!user) throw new Error('Użytkownik nie jest zalogowany');

      const db = getFirestore();
      const userDocRef = doc(db, 'Users', user.uid);

      // Upload avatar if exists
      let avatarUrl = previewAvatar;
      if (avatar) {
        const storage = getStorage();
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        const snapshot = await uploadBytes(avatarRef, avatar);
        avatarUrl = await getDownloadURL(snapshot.ref);
      }

      // Update Firestore document
      await updateDoc(userDocRef, {
        name: name,
        ...(avatarUrl && { avatarUrl })
      });

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: name,
        ...(avatarUrl && { photoURL: avatarUrl })
      });

      setSuccess('Profil został zaktualizowany');
      setIsEditing(false);
      
      // Update preview if new avatar was uploaded
      if (avatarUrl) {
        setPreviewAvatar(avatarUrl);
      }
    } catch (err) {
      console.error('Error saving profile', err);
      setError('Nie udało się zaktualizować profilu');
    }
  };

  const handleGoBack = () => {
    router.push('/');
  };

  const getInitials = () => {
    return name ? name[0].toUpperCase() : '';
  };

  // Ekran ładowania
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
        <button
          onClick={handleGoBack}
          className="mr-4 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Ustawienia profilu</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white shadow-lg rounded-xl p-8">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative">
            {previewAvatar ? (
              <img 
                src={previewAvatar} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {getInitials()}
                </span>
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
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {(previewAvatar || avatar) && (
            <button 
              onClick={handleRemoveAvatar}
              className="text-red-600 hover:text-red-700 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Usuń zdjęcie
            </button>
          )}
        </div>

        {/* Profile Information */}
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Imię
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border rounded-lg ${
                isEditing 
                  ? 'bg-white border-gray-300' 
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full p-3 bg-gray-100 text-gray-600 border rounded-lg cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">
              Adres email nie może być zmieniony
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <User className="w-5 h-5 mr-2" />
                Edytuj profil
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to original values
                    const userDoc = doc(getFirestore(), 'Users', user?.uid || '');
                    getDoc(userDoc).then(doc => {
                      if (doc.exists()) {
                        const data = doc.data();
                        setName(data.name || '');
                        setPreviewAvatar(data.avatarUrl || null);
                      }
                    });
                  }}
                  className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Zapisz zmiany
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}