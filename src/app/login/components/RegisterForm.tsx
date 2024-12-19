'use client';

import { useState } from 'react';
import { UserPlus, HandCoins } from 'lucide-react';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/config/firebase';
import { createOrUpdateUser } from '@/lib/utils/firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

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
 const [isLoading, setIsLoading] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (formData.password !== formData.confirmPassword) {
    setError('Hasła się nie zgadzają');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    console.log('Rozpoczynam rejestrację:', formData.email);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    console.log('Użytkownik utworzony w Auth:', userCredential.user.uid);

    await createOrUpdateUser(userCredential.user.uid, {
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
    });
    
    console.log('Dokument użytkownika utworzony w Firestore');

    const sessionCookie = `firebase:authUser:${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}:web`;
    document.cookie = `${sessionCookie}=${JSON.stringify(userCredential.user)}; path=/; max-age=7200; SameSite=Strict`;
    
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          unsubscribe();
          resolve();
        }
      });
      setTimeout(resolve, 2000);
    });

    setTimeout(() => {
      window.location.href = '/dashboard/waiter';
    }, 500);
    
  } catch (error) {
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
  } finally {
    setIsLoading(false);
  }
};

 return (
   <>
     <div className="flex flex-col items-center justify-center gap-2 mb-6">
       <div className="flex items-center justify-center gap-2">
         <HandCoins className="w-8 h-8 text-blue-600" />
         <h1 className="text-3xl font-bold text-gray-900">tippin&apos;</h1>
       </div>
       <h2 className="text-xl text-gray-700">Rejestracja</h2>
     </div>

     <form onSubmit={handleSubmit} className="space-y-4">
       <div className="grid grid-cols-2 gap-4">
         <div>
           <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
             Imię
           </label>
           <input
             id="firstName"
             type="text"
             value={formData.firstName}
             onChange={(e) => setFormData({...formData, firstName: e.target.value})}
             className="w-full p-3 border rounded-lg"
             required
             disabled={isLoading}
           />
         </div>
         <div>
           <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
             Nazwisko
           </label>
           <input
             id="lastName"
             type="text"
             value={formData.lastName}
             onChange={(e) => setFormData({...formData, lastName: e.target.value})}
             className="w-full p-3 border rounded-lg"
             required
             disabled={isLoading}
           />
         </div>
       </div>
       
       <div>
         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
           Email
         </label>
         <input
           id="email"
           type="email"
           value={formData.email}
           onChange={(e) => setFormData({...formData, email: e.target.value})}
           className="w-full p-3 border rounded-lg"
           required
           disabled={isLoading}
         />
       </div>
       
       <div>
         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
           Hasło
         </label>
         <input
           id="password"
           type="password"
           value={formData.password}
           onChange={(e) => setFormData({...formData, password: e.target.value})}
           className="w-full p-3 border rounded-lg"
           required
           disabled={isLoading}
         />
       </div>
       
       <div>
         <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
           Potwierdź hasło
         </label>
         <input
           id="confirmPassword"
           type="password"
           value={formData.confirmPassword}
           onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
           className="w-full p-3 border rounded-lg"
           required
           disabled={isLoading}
         />
       </div>

       {error && (
         <p className="text-red-500 text-sm text-center">{error}</p>
       )}
       
       <button 
         type="submit"
         disabled={isLoading}
         className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
       >
         {isLoading ? (
           <div className="flex items-center space-x-2">
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
             <span>Rejestracja...</span>
           </div>
         ) : (
           <>
             <UserPlus className="w-5 h-5 mr-2" />
             Zarejestruj się
           </>
         )}
       </button>
       
       <button
         type="button"
         onClick={onBackToLogin}
         disabled={isLoading}
         className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors disabled:bg-gray-100"
       >
         Wróć do logowania
       </button>
     </form>
   </>
 );
}