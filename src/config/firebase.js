import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyATJ_HbztePFa8JyzU_7HG8qyijPDAh8Lg",
    authDomain: "study-buddy-9a13f.firebaseapp.com",
    projectId: "study-buddy-9a13f",
    storageBucket: "study-buddy-9a13f.firebasestorage.app",
    messagingSenderId: "882486828676",
    appId: "1:882486828676:web:ebc802f2da00d4dc356cd1",
    measurementId: "G-YRJ3S7R97T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 