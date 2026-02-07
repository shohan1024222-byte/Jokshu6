// FirebaseStorage - AsyncStorage এর মতো interface কিন্তু data Firebase Firestore এ save হয়
// App uninstall করলেও data থাকবে! PC বন্ধ করলেও data থাকবে!

import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'appData';

/**
 * FirebaseStorage - AsyncStorage এর drop-in replacement
 * একই getItem/setItem/removeItem API, কিন্তু data cloud-এ save হয়
 */
export const FirebaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const docRef = doc(db, COLLECTION, key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().value;
      }
      return null;
    } catch (error) {
      console.error(`FirebaseStorage getItem error [${key}]:`, error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION, key);
      await setDoc(docRef, { 
        value, 
        updatedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error(`FirebaseStorage setItem error [${key}]:`, error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION, key);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`FirebaseStorage removeItem error [${key}]:`, error);
    }
  }
};
