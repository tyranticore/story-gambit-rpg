import { HERO_CLASSES } from '../data/heroClasses';
import { getFirestoreDB } from './firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const SAVE_KEY = 'STORY_GAMBIT_RPG_SAVE_V1';

export const HERO_RECRUIT_POOL = [
  {
    id: 'garrick',
    name: 'Garrick the Shadow',
    classId: 'thief',
    cost: 80,
    stats: { hp: 120, maxHp: 120, mp: 30, maxMp: 30, attack: 28, defense: 10, speed: 1.4, range: 1 },
    color: 'from-amber-600 to-amber-800',
    quote: "Looking for someone who moves in the shadows, Commander? My daggers are at your service.",
    description: "Melee Assassin DPS. High speed and critical strike damage."
  },
  {
    id: 'lyra',
    name: 'Lyra Windrunner',
    classId: 'archer',
    cost: 90,
    stats: { hp: 110, maxHp: 110, mp: 35, maxMp: 35, attack: 26, defense: 8, speed: 1.3, range: 4 },
    color: 'from-emerald-600 to-emerald-800',
    quote: "My bow rarely misses its target. Lead the way.",
    description: "Ranged Marksman DPS. Snipes foes from far away."
  },
  {
    id: 'elena',
    name: 'Elena Emberheart',
    classId: 'mage',
    cost: 100,
    stats: { hp: 90, maxHp: 90, mp: 80, maxMp: 80, attack: 34, defense: 6, speed: 1.0, range: 3.5 },
    color: 'from-purple-600 to-purple-800',
    quote: "The arcane flames obey my command. Show me our enemies.",
    description: "Ranged Arcane DPS. High magic damage."
  },
  {
    id: 'thorin',
    name: 'Thorin Stonebreaker',
    classId: 'warrior',
    cost: 85,
    stats: { hp: 170, maxHp: 170, mp: 30, maxMp: 30, attack: 24, defense: 18, speed: 0.9, range: 1 },
    color: 'from-red-600 to-red-800',
    quote: "Steel and honor! I'll hold the front line against any beast.",
    description: "Frontline Tank. High health and heavy armor."
  },
  {
    id: 'brother_cassian',
    name: 'Brother Cassian',
    classId: 'priest',
    cost: 75,
    stats: { hp: 100, maxHp: 100, mp: 70, maxMp: 70, attack: 14, defense: 8, speed: 1.0, range: 3 },
    color: 'from-cyan-600 to-cyan-800',
    quote: "May the light mend your wounds and guide our sword arms.",
    description: "Dedicated Backline Support Healer. Keeps party tanks at full health."
  },
  {
    id: 'sir_galahad',
    name: 'Sir Galahad',
    classId: 'paladin',
    cost: 110,
    stats: { hp: 160, maxHp: 160, mp: 50, maxMp: 50, attack: 22, defense: 16, speed: 1.0, range: 1 },
    color: 'from-yellow-600 to-yellow-800',
    quote: "By my shield, no harm shall come to our healers!",
    description: "Holy Tank / Sub-healer. Taunts enemies and protects weaker allies."
  }
];

const RECRUIT_NODES = [
  'whispering_woods', 'misty_shores', 'watchtower_ruins', 'mining_village',
  'feywild_thicket', 'sunken_ruins', 'highland_pass', 'stormpeak_monastery', 'astral_spire'
];

export function generateInitialWanderingHeroes(playerClassId = 'warrior') {
  const eligible = HERO_RECRUIT_POOL.filter(h => h.classId !== playerClassId);
  const shuffled = [...eligible].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  const availableNodes = [...RECRUIT_NODES].sort(() => 0.5 - Math.random());

  return selected.map((hero, idx) => ({
    ...hero,
    nodeId: availableNodes[idx % availableNodes.length],
    turnsRemaining: Math.floor(Math.random() * 3) + 3 // 3 to 5 turns
  }));
}

const GLOBAL_CODEX_KEY = 'AETHELGARD_GLOBAL_CODEX_V1';

export function getStoredGlobalCodex() {
  try {
    const data = localStorage.getItem(GLOBAL_CODEX_KEY);
    if (!data) return { heroes: [], enemies: [], locations: [] };
    const parsed = JSON.parse(data);
    return {
      heroes: Array.isArray(parsed?.heroes) ? parsed.heroes : [],
      enemies: Array.isArray(parsed?.enemies) ? parsed.enemies : [],
      locations: Array.isArray(parsed?.locations) ? parsed.locations : []
    };
  } catch (e) {
    return { heroes: [], enemies: [], locations: [] };
  }
}

export function updateStoredGlobalCodex(codex) {
  if (!codex) return;
  try {
    const existing = getStoredGlobalCodex();
    const merged = {
      heroes: Array.from(new Set([...existing.heroes, ...(codex.heroes || [])])),
      enemies: Array.from(new Set([...existing.enemies, ...(codex.enemies || [])])),
      locations: Array.from(new Set([...existing.locations, ...(codex.locations || [])]))
    };
    localStorage.setItem(GLOBAL_CODEX_KEY, JSON.stringify(merged));
  } catch (e) {}
}

export function getInitialGameState(selectedClassId = 'warrior') {
  const classDef = HERO_CLASSES[selectedClassId] || HERO_CLASSES.warrior;
  const globalCodex = getStoredGlobalCodex();

  return {
    version: 5,
    timestamp: Date.now(),
    currentPassageId: 'p_oakhaven_start',
    currentMapNodeId: 'oakhaven',
    unlockedMapNodes: ['oakhaven'],
    completedBattles: [], // Nodes where battles have been defeated
    claimedRewards: [], // Passage / Node IDs where one-time rewards have been claimed
    wanderingHeroes: generateInitialWanderingHeroes(selectedClassId),
    turnCounter: 0,
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
    discoveredCodex: {
      heroes: Array.from(new Set([...globalCodex.heroes, selectedClassId])),
      enemies: Array.from(new Set([...globalCodex.enemies])),
      locations: Array.from(new Set([...globalCodex.locations, 'oakhaven']))
    },
    sharedBag: ['health_potion', 'ruby_pendant', 'quiver', 'mana_ring'],
    journalLog: ['Chosen hero arrived at Oakhaven Tavern.']
  };
}

export function sanitizeGameState(state, selectedClassId = 'warrior') {
  if (!state || typeof state !== 'object') {
    return getInitialGameState(selectedClassId);
  }

  const classId = state.player?.classId || selectedClassId;
  const defaultState = getInitialGameState(classId);

  const globalCodex = getStoredGlobalCodex();
  const rawCodex = state.discoveredCodex || {};

  const mergedCodex = {
    heroes: Array.from(new Set([...globalCodex.heroes, ...(rawCodex.heroes || []), classId])),
    enemies: Array.from(new Set([...globalCodex.enemies, ...(rawCodex.enemies || [])])),
    locations: Array.from(new Set([...globalCodex.locations, ...(rawCodex.locations || []), 'oakhaven']))
  };

  updateStoredGlobalCodex(mergedCodex);

  return {
    ...defaultState,
    ...state,
    version: state.version || defaultState.version,
    currentPassageId: state.currentPassageId || defaultState.currentPassageId,
    currentMapNodeId: state.currentMapNodeId || defaultState.currentMapNodeId,
    unlockedMapNodes: Array.isArray(state.unlockedMapNodes) && state.unlockedMapNodes.length > 0
      ? state.unlockedMapNodes
      : defaultState.unlockedMapNodes,
    completedBattles: Array.isArray(state.completedBattles) ? state.completedBattles : [],
    claimedRewards: Array.isArray(state.claimedRewards) ? state.claimedRewards : [],
    wanderingHeroes: Array.isArray(state.wanderingHeroes) && state.wanderingHeroes.length > 0
      ? state.wanderingHeroes
      : generateInitialWanderingHeroes(classId),
    turnCounter: typeof state.turnCounter === 'number' ? state.turnCounter : 0,
    storyFlags: state.storyFlags || {},
    player: {
      ...defaultState.player,
      ...(state.player || {}),
      name: state.player?.name || defaultState.player.name,
      gold: typeof state.player?.gold === 'number' ? state.player.gold : defaultState.player.gold,
      hp: typeof state.player?.hp === 'number' ? state.player.hp : defaultState.player.hp,
      maxHp: typeof state.player?.maxHp === 'number' ? state.player.maxHp : defaultState.player.maxHp,
      mp: typeof state.player?.mp === 'number' ? state.player.mp : defaultState.player.mp,
      maxMp: typeof state.player?.maxMp === 'number' ? state.player.maxMp : defaultState.player.maxMp,
      paperDoll: {
        ...defaultState.player.paperDoll,
        ...(state.player?.paperDoll || {})
      },
      gambits: Array.isArray(state.player?.gambits) && state.player.gambits.length > 0
        ? state.player.gambits
        : defaultState.player.gambits
    },
    followers: Array.isArray(state.followers) ? state.followers : [],
    discoveredCodex: mergedCodex,
    sharedBag: Array.isArray(state.sharedBag) ? state.sharedBag : defaultState.sharedBag,
    journalLog: Array.isArray(state.journalLog) ? state.journalLog : defaultState.journalLog
  };
}

export function advanceMapTurn(state, destinationNodeId) {
  const followerIds = (state.followers || []).map(f => f.id);
  const playerClassId = state.player?.classId;

  const currentTurn = (state.turnCounter || 0) + 1;
  let updatedHeroes = [...(state.wanderingHeroes || [])];

  // 1. Decrement turns remaining for existing wandering heroes
  updatedHeroes = updatedHeroes.map(hero => {
    if (followerIds.includes(hero.id)) return null;

    const remaining = hero.turnsRemaining - 1;
    if (remaining <= 0) {
      const otherNodes = RECRUIT_NODES.filter(n => n !== hero.nodeId && n !== destinationNodeId);
      const randomNode = otherNodes[Math.floor(Math.random() * otherNodes.length)] || RECRUIT_NODES[0];
      return {
        ...hero,
        nodeId: randomNode,
        turnsRemaining: Math.floor(Math.random() * 3) + 3 // 3-5 turns
      };
    }
    return {
      ...hero,
      turnsRemaining: remaining
    };
  }).filter(Boolean);

  // 2. Chance to spawn a new hero if total active wandering heroes < 3
  if (updatedHeroes.length < 3 && Math.random() < 0.4) {
    const activeHeroIds = updatedHeroes.map(h => h.id);
    const unspawnedPool = HERO_RECRUIT_POOL.filter(
      h => !followerIds.includes(h.id) && !activeHeroIds.includes(h.id) && h.classId !== playerClassId
    );

    if (unspawnedPool.length > 0) {
      const newHeroDef = unspawnedPool[Math.floor(Math.random() * unspawnedPool.length)];
      const activeNodeIds = updatedHeroes.map(h => h.nodeId);
      const freeNodes = RECRUIT_NODES.filter(n => !activeNodeIds.includes(n));
      const targetNode = freeNodes[Math.floor(Math.random() * freeNodes.length)] || RECRUIT_NODES[0];

      updatedHeroes.push({
        ...newHeroDef,
        nodeId: targetNode,
        turnsRemaining: Math.floor(Math.random() * 3) + 3
      });
    }
  }

  return {
    ...state,
    turnCounter: currentTurn,
    wanderingHeroes: updatedHeroes
  };
}

export function saveToLocalStorage(state) {
  try {
    if (state && state.discoveredCodex) {
      updateStoredGlobalCodex(state.discoveredCodex);
    }
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
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') return null;
    return sanitizeGameState(parsed);
  } catch (err) {
    console.error('Failed to load save from localStorage:', err);
    return null;
  }
}

// -------------------------------------------------------------
// SECURE AUTHENTICATED GOOGLE PROFILE CLOUD SAVE & LOAD
// -------------------------------------------------------------
export async function saveGoogleCloudProfile(user, state) {
  if (!user || !user.uid) {
    throw new Error('You must be signed in with your Google account to save to Cloud Firestore.');
  }

  const db = getFirestoreDB();
  if (!db) {
    throw new Error('Firebase Firestore database connection is not available.');
  }

  const payload = {
    ...state,
    userId: user.uid,
    userDisplayName: user.displayName || user.email || 'Adventurer',
    savedAt: Date.now()
  };

  const docRef = doc(db, 'users', user.uid);
  await setDoc(docRef, payload);

  try {
    localStorage.setItem(`AETHELGARD_GOOGLE_SAVE_${user.uid}`, JSON.stringify(payload));
  } catch (e) {}

  return payload.savedAt;
}

export async function loadGoogleCloudProfile(user) {
  if (!user || !user.uid) {
    throw new Error('You must be signed in with your Google account to load your cloud save.');
  }

  const db = getFirestoreDB();
  if (!db) {
    throw new Error('Firebase Firestore database connection is not available.');
  }

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.player) {
        try { localStorage.setItem(`AETHELGARD_GOOGLE_SAVE_${user.uid}`, JSON.stringify(data)); } catch (e) {}
        return sanitizeGameState(data);
      }
    }
  } catch (err) {
    console.warn('Firestore load notice:', err);
  }

  try {
    const cached = localStorage.getItem(`AETHELGARD_GOOGLE_SAVE_${user.uid}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.player) {
        return sanitizeGameState(parsed);
      }
    }
  } catch (e) {}

  throw new Error('No saved cloud game was found for your Google account. Click "Save Progress" to create one!');
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
