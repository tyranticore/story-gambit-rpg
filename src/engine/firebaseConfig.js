import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Default public Firebase Project Config for Aethelgard RPG GitHub Pages deployment
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyB-AethelgardRPG_DefaultKey_2026",
  authDomain: "aethelgard-rpg.firebaseapp.com",
  projectId: "aethelgard-rpg",
  storageBucket: "aethelgard-rpg.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:a1b2c3d4e5f6g7h8"
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
