import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { auth } from '@/app/config/firebase';

// Funkcja do dodawania użytkownika
const db = getFirestore(getApp());

export const addUser = async (name: string, email: string, password: string, restaurantId: string, avatarUrl: string) => {
  try {
    // Przy rejestracji używamy konkretnego ID z Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Tworzymy dokument o ID równym UID z Firebase Auth
    await setDoc(doc(db, 'Users', user.uid), {
      name,
      email,
      restaurantId,
      avatarUrl,
      createdAt: new Date().toISOString()
    });

    console.log('Nowy użytkownik dodany z ID: ', user.uid);
    return user.uid;
  } catch (e) {
    console.error('Błąd przy dodawaniu użytkownika: ', e);
    throw e;
  }
};

export const updateUserStripeAccount = async (userId: string, stripeAccountId: string) => {
  if (!stripeAccountId) {
    throw new Error('Stripe Account ID is required');
  }
  
  const userRef = doc(db, 'Users', userId);
  await updateDoc(userRef, {
    stripeAccountId: stripeAccountId
  });
};

// Funkcja do pobierania danych użytkownika
export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, 'Users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return {
        ...userDoc.data(),
        id: userDoc.id
      };
    }

    return null;
  } catch (error) {
    console.error('Błąd przy pobieraniu danych użytkownika:', error);
    throw error;
  }
};