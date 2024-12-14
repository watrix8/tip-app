import { getFirestore, collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';

const db = getFirestore(getApp());

export const addUser = async (name: string, email: string, password: string, restaurantId: string, avatarUrl: string) => {
  try {
    // Dodajemy użytkownika i od razu pobieramy referencję dokumentu
    const docRef = await addDoc(collection(db, 'Users'), {
      name,
      email,
      password,  // W prawdziwej aplikacji hasło nie powinno być przechowywane w czystej postaci!
      restaurantId,
      avatarUrl,
      createdAt: new Date().toISOString()
    });

    // Aktualizujemy dokument dodając pole id równe ID dokumentu
    await updateDoc(docRef, {
      id: docRef.id
    });

    console.log('Nowy użytkownik dodany z ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Błąd przy dodawaniu użytkownika: ', e);
    throw e;
  }
};

// Funkcja do pobierania danych użytkownika
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'Users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Dodajemy id do danych użytkownika
      return {
        ...userData,
        id: userDoc.id
      };
    }
    return null;
  } catch (e) {
    console.error('Błąd przy pobieraniu danych użytkownika: ', e);
    throw e;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<{
  name: string;
  avatarUrl: string;
  restaurantId: string;
}>) => {
  try {
    const userRef = doc(db, 'Users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error('Błąd przy aktualizacji profilu: ', e);
    throw e;
  }
};

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