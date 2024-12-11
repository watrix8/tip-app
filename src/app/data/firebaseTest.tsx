import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

// Funkcja do dodawania użytkownika
const db = getFirestore(getApp());

// Określenie typów dla parametrów
export const addUser = async (
  name: string,
  email: string,
  password: string,
  restaurantId: string,
  avatarUrl: string
): Promise<void> => {
  try {
    const docRef = await addDoc(collection(db, 'Users'), {
      name,
      email,
      password,  // Hasło w bazie danych nie powinno być przechowywane w czystej postaci, w prawdziwej aplikacji powinno być zaszyfrowane
      restaurantId,
      avatarUrl
    });
    console.log('Nowy użytkownik dodany z ID: ', docRef.id);
  } catch (e) {
    console.error('Błąd przy dodawaniu użytkownika: ', e);
  }
};
