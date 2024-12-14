import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import type { UserData } from '@/app/types/user';

const db = getFirestore(getApp());

// Funkcja do tworzenia lub aktualizacji dokumentu użytkownika
export const createOrUpdateUser = async (uid: string, userData: {
  email: string;
  name?: string;
  avatarUrl?: string;
}) => {
  try {
    const userRef = doc(db, 'Users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Tworzymy nowy dokument z ID takim samym jak uid z Firebase Auth
      await setDoc(userRef, {
        ...userData,
        id: uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Aktualizujemy istniejący dokument
      await updateDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
    }

    return uid;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Funkcja do pobierania danych użytkownika
export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

// Funkcja do aktualizacji konta Stripe
export const updateUserStripeAccount = async (userId: string, stripeAccountId: string) => {
  if (!stripeAccountId) {
    throw new Error('Stripe Account ID is required');
  }
  
  const userRef = doc(db, 'Users', userId);
  await updateDoc(userRef, {
    stripeAccountId: stripeAccountId,
    updatedAt: new Date().toISOString()
  });
};