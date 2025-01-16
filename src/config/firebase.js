import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyATJ_HbztePFa8JyzU_7HG8qyijPDAh8Lg",
    authDomain: "study-buddy-9a13f.firebaseapp.com",
    projectId: "study-buddy-9a13f",
    storageBucket: "study-buddy-9a13f.firebasestorage.app",
    messagingSenderId: "882486828676",
    appId: "1:882486828676:web:ebc802f2da00d4dc356cd1",
    measurementId: "G-YRJ3S7R97T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test connection
const testConnection = async () => {
  try {
    const testDocRef = doc(db, 'test', 'test');
    await getDoc(testDocRef);
    console.log('Firestore connection successful');
  } catch (error) {
    console.error('Firestore connection error:', error);
  }
};

testConnection();

export { auth, db };