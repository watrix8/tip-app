'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Sprawdzamy czy mamy wszystkie wymagane zmienne środowiskowe
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing Firebase configuration:', {
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId
  });
  throw new Error('Missing Firebase configuration');
}

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja Firestore
export const db = getFirestore(app);

// Inicjalizacja Auth
export const auth = getAuth(app);

// Dodajemy log do sprawdzenia czy auth jest poprawnie zainicjalizowany
console.log('Firebase Auth initialized:', !!auth);