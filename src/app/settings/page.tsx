import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { db } from '@/app/config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SettingsPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const loadUserData = async () => {
        const userDocRef = doc(db, 'Users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name);
          setEmail(userData.email);
        } else {
          console.error('Dokument użytkownika nie istnieje');
          
          // Jeśli dokument nie istnieje, tworzymy nowy
          try {
            await setDoc(userDocRef, {
              name: '',
              email: user.email || '',
            });
            console.log('Dokument użytkownika został utworzony');
            // Ustawienie wartości domyślnych po stworzeniu dokumentu
            setName('');
            setEmail(user.email || '');
          } catch (error) {
            console.error('Błąd podczas tworzenia dokumentu użytkownika:', error);
            setError('Nie udało się utworzyć dokumentu użytkownika');
          }
        }
      };

      loadUserData();
    }
  }, [user]);

  const handleSave = async () => {
    if (!name || !email) {
      setError('Imię i email są wymagane');
      return;
    }

    if (user) {
      const updatedData = { name, email };
      try {
        await updateDoc(doc(db, 'Users', user.uid), updatedData);
        console.log('Dane zostały zaktualizowane');
      } catch (error) {
        console.error('Błąd aktualizacji dokumentu użytkownika:', error);
        setError('Wystąpił błąd podczas zapisywania danych');
      }
    }
  };

  return (
    <div>
      <h1>Ustawienia użytkownika</h1>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Imię"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Zapisz zmiany
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
