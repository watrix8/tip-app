// components/AvatarUpload.tsx
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import UserAvatar from './UserAvatar';
import { Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  userId, 
  currentAvatarUrl, 
  userName,
  onAvatarUpdate 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('AvatarUpload zamontowany:', {
      userId,
      currentAvatarUrl,
      userName
    });
  }, [userId, currentAvatarUrl, userName]);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.3, // Maksymalny rozmiar pliku w MB
      maxWidthOrHeight: 400, // Maksymalna szerokość lub wysokość
      useWebWorker: true,
      fileType: file.type // Zachowujemy oryginalny typ pliku
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log('Kompresja zakończona:', {
        beforeSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
        afterSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB'
      });
      return compressedFile;
    } catch (error) {
      console.error('Błąd podczas kompresji:', error);
      throw new Error('Nie udało się skompresować obrazu');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('handleFileChange wywołany:', { file });
    
    if (!file) {
      console.log('Brak pliku');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Sprawdzenie typu pliku
      if (!file.type.startsWith('image/')) {
        throw new Error('Dozwolone są tylko pliki graficzne');
      }

      console.log('1. Start kompresji:', {
        fileName: file.name,
        originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB'
      });

      // Kompresja obrazu
      const compressedFile = await compressImage(file);

      const storage = getStorage();
      console.log('2. Storage config:', {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      });

      const fileExtension = file.name.split('.').pop();
      const fileName = `avatars/${userId}-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      console.log('3. Utworzono referencję:', fileName);

      try {
        const uploadResult = await uploadBytes(storageRef, compressedFile);
        console.log('4. Upload zakończony:', uploadResult);
      } catch (uploadError) {
        console.error('Błąd podczas uploadu:', uploadError);
        throw new Error('Błąd podczas przesyłania pliku');
      }

      let downloadUrl;
      try {
        downloadUrl = await getDownloadURL(storageRef);
        console.log('5. URL pobrany:', downloadUrl);
      } catch (urlError) {
        console.error('Błąd podczas pobierania URL:', urlError);
        throw new Error('Nie udało się pobrać URL zdjęcia');
      }

      try {
        const userRef = doc(db, 'Users', userId);
        await updateDoc(userRef, {
          avatarUrl: downloadUrl,
          updatedAt: new Date().toISOString()
        });
        console.log('6. Zaktualizowano dokument użytkownika');
      } catch (dbError) {
        console.error('Błąd podczas aktualizacji dokumentu:', dbError);
        throw new Error('Nie udało się zaktualizować profilu');
      }

      onAvatarUpdate(downloadUrl);
      console.log('7. Zakończono cały proces');
    } catch (err) {
      console.error('Błąd główny:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas uploadu zdjęcia');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group" onClick={() => console.log('Avatar clicked')}>
      <UserAvatar
        name={userName}
        avatarUrl={currentAvatarUrl}
        size="lg"
        className="group-hover:opacity-75 transition-opacity"
      />
      
      <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </label>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}

      {error && (
        <div className="absolute -bottom-8 left-0 right-0 text-center text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;