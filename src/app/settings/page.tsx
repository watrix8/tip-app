import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext'; // Ścieżka do kontekstu autoryzacji
import { db } from '@/app/config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const SettingsForm = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      // Załaduj dane użytkownika z Firestore
      const loadUserData = async () => {
        const userDocRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name);
          setEmail(userData.email);
        }
      };

      loadUserData();
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      const updatedData = { name, email };
      await updateDoc(doc(db, 'Users', user.uid), updatedData);
      console.log('Dane zostały zaktualizowane');
    }
  };

  return (
    <div>
      <h1>Ustawienia użytkownika</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Imię"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-lg"
        />
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
        >
          Zapisz zmiany
        </button>
      </form>
    </div>
  );
};

export default SettingsForm;
