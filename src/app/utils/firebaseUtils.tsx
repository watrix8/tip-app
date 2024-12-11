import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

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
