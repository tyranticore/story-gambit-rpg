import { HERO_CLASSES } from '../data/heroClasses';
import { getFirestoreDB } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SAVE_KEY = 'STORY_GAMBIT_RPG_SAVE_V1';
const PROFILE_LIST_KEY = 'AETHELGARD_RECENT_PROFILES';

export function getInitialGameState(selectedClassId = 'warrior') {
  const classDef = HERO_CLASSES[selectedClassId] || HERO_CLASSES.warrior;
  return {
    version: 4,
    timestamp: Date.now(),
    currentPassageId: 'p_oakhaven_start',
    currentMapNodeId: 'oakhaven',
    unlockedMapNodes: ['oakhaven'],
    storyFlags: {},
    player: {
      name: 'Valerius',
      classId: selectedClassId,
      level: 1,
      exp: 0,
      gold: 120,
      hp: classDef.baseStats.maxHp,
      maxHp: classDef.baseStats.maxHp,
      mp: classDef.baseStats.maxMp,
      maxMp: classDef.baseStats.maxMp,
      attack: classDef.baseStats.attack,
      defense: classDef.baseStats.defense,
      speed: classDef.baseStats.speed,
      range: classDef.baseStats.range,
      paperDoll: { ...classDef.defaultPaperDoll },
      gambits: [...classDef.starterGambits]
    },
    followers: [],
    sharedBag: ['health_potion', 'ruby_pendant', 'quiver', 'mana_ring'],
    journalLog: ['Chosen hero arrived at Oakhaven Tavern.']
  };
}

export function saveToLocalStorage(state) {
  try {
    const serialized = JSON.stringify({ ...state, timestamp: Date.now() });
    localStorage.setItem(SAVE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('Failed to auto-save to localStorage:', err);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load save from localStorage:', err);
    return null;
  }
}

// -------------------------------------------------------------
// FIREBASE CLOUD FIRESTORE PROFILE SAVE & LOAD
// -------------------------------------------------------------
export async function saveCloudProfile(profileName, state) {
  const cleanName = profileName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleanName) throw new Error('Please enter a valid profile name.');

  const payload = { ...state, profileName: cleanName, savedAt: Date.now() };
  const jsonString = JSON.stringify(payload);

  let savedSuccess = false;

  // 1. Primary Cloud Backend: Firebase Cloud Firestore
  try {
    const db = getFirestoreDB();
    if (db) {
      const docRef = doc(db, 'user_saves', cleanName);
      await setDoc(docRef, payload);
      savedSuccess = true;
    }
  } catch (err) {
    console.warn('Firebase Firestore save notice:', err);
  }

  // 2. Secondary: Local Dev Sync Server (/api/save-profile)
  if (!savedSuccess) {
    try {
      const res = await fetch('./api/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString
      });
      if (res.ok) savedSuccess = true;
    } catch (e) {}
  }

  // 3. Save to local device localStorage cache
  try {
    localStorage.setItem(`AETHELGARD_PROFILE_${cleanName}`, jsonString);
  } catch (e) {}

  addRecentProfile(cleanName);
  return cleanName;
}

export async function loadCloudProfile(profileName) {
  const cleanName = profileName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleanName) throw new Error('Please enter a valid profile name.');

  // 1. Primary Cloud Backend: Firebase Cloud Firestore
  try {
    const db = getFirestoreDB();
    if (db) {
      const docRef = doc(db, 'user_saves', cleanName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.player) {
          addRecentProfile(cleanName);
          try { localStorage.setItem(`AETHELGARD_PROFILE_${cleanName}`, JSON.stringify(data)); } catch (e) {}
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Firebase Firestore load notice:', err);
  }

  // 2. Secondary: Local Dev Sync Server (/api/load-profile)
  try {
    const res = await fetch(`./api/load-profile?name=${cleanName}`);
    if (res.ok) {
      const state = await res.json();
      if (state && state.currentPassageId && state.player) {
        addRecentProfile(cleanName);
        try { localStorage.setItem(`AETHELGARD_PROFILE_${cleanName}`, JSON.stringify(state)); } catch (e) {}
        return state;
      }
    }
  } catch (e) {}

  // 3. Fallback: Local Device Profile Cache
  try {
    const cached = localStorage.getItem(`AETHELGARD_PROFILE_${cleanName}`);
    if (cached) {
      const state = JSON.parse(cached);
      if (state && state.currentPassageId && state.player) {
        addRecentProfile(cleanName);
        return state;
      }
    }
  } catch (e) {}

  throw new Error(`Profile "${cleanName}" not found on Firebase Cloud. Click "Save to Cloud" on desktop first!`);
}

export function getRecentProfiles() {
  try {
    const list = localStorage.getItem(PROFILE_LIST_KEY);
    return list ? JSON.parse(list) : [];
  } catch {
    return [];
  }
}

function addRecentProfile(name) {
  try {
    const list = getRecentProfiles();
    const updated = [name, ...list.filter(n => n !== name)].slice(0, 5);
    localStorage.setItem(PROFILE_LIST_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export function exportSaveCode(state) {
  try {
    const jsonStr = JSON.stringify(state);
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    return null;
  }
}

export function importSaveCode(codeStr) {
  try {
    const jsonStr = decodeURIComponent(atob(codeStr.trim()));
    const state = JSON.parse(jsonStr);
    if (state && state.currentPassageId && state.player) {
      return state;
    }
    return null;
  } catch (err) {
    return null;
  }
}

export function generateQrSaveUrl(state) {
  const code = exportSaveCode(state);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?save=${encodeURIComponent(code)}`;
}

export function checkUrlForSaveState() {
  try {
    const params = new URLSearchParams(window.location.search);
    const saveCode = params.get('save');
    if (saveCode) {
      const state = importSaveCode(saveCode);
      if (state) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return state;
      }
    }
  } catch (err) {}
  return null;
}

export function downloadSaveJson(state) {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gambit_rpg_save_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
