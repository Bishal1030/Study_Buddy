import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, name) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: name
      });

      const userData = {
        uid: userCredential.user.uid,
        name,
        email,
        createdAt: new Date().toISOString(),
        expert: '',
        good: '',
        intermediate: '',
        beginner: '',
        interested: '',
        bio: `Hi, I'm ${name}!`
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      setCurrentUser({ ...userCredential.user, ...userData });
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...userCredential.user, ...userData });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUser({ ...user, ...userDoc.data() });
          } else {
            const userData = {
              uid: user.uid,
              name: user.displayName || 'User',
              email: user.email,
              createdAt: new Date().toISOString(),
              expert: '',
              good: '',
              intermediate: '',
              beginner: '',
              interested: '',
              bio: `Hi, I'm ${user.displayName || 'User'}!`
            };
            await setDoc(doc(db, 'users', user.uid), userData);
            setCurrentUser({ ...user, ...userData });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 