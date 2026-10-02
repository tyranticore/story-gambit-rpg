import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

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

let dbInstance = null;

export function getFirestoreDB() {
  if (dbInstance) return dbInstance;
  try {
    const config = getFirebaseConfig();
    const app = !getApps().length ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
    return null;
  }
}

export function setCustomFirebaseConfig(configObj) {
  try {
    localStorage.setItem('AETHELGARD_FIREBASE_CUSTOM_CONFIG', JSON.stringify(configObj));
    dbInstance = null;
    return true;
  } catch {
    return false;
  }
}

export function resetCustomFirebaseConfig() {
  try {
    localStorage.removeItem('AETHELGARD_FIREBASE_CUSTOM_CONFIG');
    dbInstance = null;
    return true;
  } catch {
    return false;
  }
}
