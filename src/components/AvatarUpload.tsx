// components/AvatarUpload.tsx

import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase';
import UserAvatar from './UserAvatar';
import { Camera } from 'lucide-react';

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

  // Log przy montowaniu komponentu
  useEffect(() => {
    console.log('AvatarUpload zamontowany:', {
      userId,
      currentAvatarUrl,
      userName
    });
  }, [userId, currentAvatarUrl, userName]);

  console.log('AvatarUpload render:', { isUploading, error });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('handleFileChange wywołany:', { file });
    
    if (!file) {
      console.log('Brak pliku');
      return;
    }

    console.log('1. Start uploadu:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId
    });

    setIsUploading(true);
    setError(null);

    try {
      const storage = getStorage();
      console.log('2. Storage config:', {
        bucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      });

      const fileExtension = file.name.split('.').pop();
      const fileName = `avatars/${userId}-${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      console.log('3. Utworzono referencję:', fileName);

      let uploadResult;
      try {
        uploadResult = await uploadBytes(storageRef, file).catch(err => {
          console.error('Błąd uploadu:', {
            code: err.code,
            message: err.message,
            name: err.name,
            details: err.details,
            serverResponse: err.serverResponse
          });
          throw err;
        });
        console.log('4. Upload zakończony:', uploadResult);
      } catch (uploadError) {
        console.error('Błąd podczas uploadu:', uploadError);
        // Sprawdź dokładny typ błędu
        if (uploadError instanceof Error) {
          setError(`Błąd: ${uploadError.message}`);
        } else {
          setError('Wystąpił nieznany błąd podczas uploadu');
        }
        throw uploadError;
      }

      let downloadUrl;
      try {
        downloadUrl = await getDownloadURL(storageRef);
        console.log('5. URL pobrany:', downloadUrl);
      } catch (urlError) {
        console.error('Błąd podczas pobierania URL:', urlError);
        throw urlError;
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
        throw dbError;
      }

      onAvatarUpdate(downloadUrl);
      console.log('7. Zakończono cały proces');
    } catch (err) {
      console.error('Błąd główny:', err);
      setError('Wystąpił błąd podczas uploadu zdjęcia');
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
          onChange={(e) => {
            console.log('Input change event:', e.target.files);
            handleFileChange(e);
          }}
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