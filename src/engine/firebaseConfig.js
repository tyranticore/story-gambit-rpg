import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

// Default public Firebase Project Config for Aethelgard RPG GitHub Pages deployment
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAlWdXjFAcVUFXCH8l0KWfmK5NkhLZpibU",
  authDomain: "branching-gambit.firebaseapp.com",
  projectId: "branching-gambit",
  storageBucket: "branching-gambit.firebasestorage.app",
  messagingSenderId: "438892842520",
  appId: "1:438892842520:web:76b3abf887dd5aeb9c3d6d"
};

export function getFirebaseConfig() {
  try {
    const savedCustom = localStorage.getItem('AETHELGARD_FIREBASE_CUSTOM_CONFIG');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (parsed && parsed.projectId) return parsed;
    }
  } catch (e) {}

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId
  };
}

let appInstance = null;
let dbInstance = null;
let authInstance = null;

export function getFirebaseApp() {
  if (appInstance) return appInstance;
  try {
    const config = getFirebaseConfig();
    appInstance = !getApps().length ? initializeApp(config) : getApp();
    return appInstance;
  } catch (err) {
    console.warn('Firebase app initialization notice:', err);
    return null;
  }
}

export function getFirestoreDB() {
  if (dbInstance) return dbInstance;
  try {
    const app = getFirebaseApp();
    if (app) dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase Firestore initialization notice:', err);
    return null;
  }
}

export function getFirebaseAuth() {
  if (authInstance) return authInstance;
  try {
    const app = getFirebaseApp();
    if (app) authInstance = getAuth(app);
    return authInstance;
  } catch (err) {
    console.warn('Firebase Auth initialization notice:', err);
    return null;
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth is not initialized.');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup closed before completion.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error('Domain not authorized in Firebase Console -> Authentication -> Settings -> Authorized domains.');
    }
    throw new Error(err.message || 'Google Sign-In failed.');
  }
}

export async function logOutFirebase() {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}

export function onAuthChange(callback) {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}
