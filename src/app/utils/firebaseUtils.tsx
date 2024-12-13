import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { doc, updateDoc } from 'firebase/firestore';

// Funkcja do dodawania użytkownika
const db = getFirestore(getApp());

export const addUser = async (name: string, email: string, password: string, restaurantId: string, avatarUrl: string) => {
  try {
    const docRef = await addDoc(collection(db, 'Users'), {
      name,
      email,
      password,  // W prawdziwej aplikacji hasło nie powinno być przechowywane w czystej postaci!
      restaurantId,
      avatarUrl
    });
    console.log('Nowy użytkownik dodany z ID: ', docRef.id);
  } catch (e) {
    console.error('Błąd przy dodawaniu użytkownika: ', e);
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