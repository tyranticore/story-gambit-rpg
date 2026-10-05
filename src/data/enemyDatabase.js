export const ENEMIES = {
  goblin_scout: {
    id: 'goblin_scout',
    unitTypeId: 'goblin_scout',
    name: 'Goblin Scout',
    maxHp: 160,
    hp: 160,
    maxMp: 60,
    mp: 60,
    attack: 16,
    defense: 6,
    speed: 1.2,
    range: 55,
    flying: false,
    color: '#4ade80',
    icon: 'Skull',
    size: 28,
    expReward: 50,
    goldReward: 30,
    gambits: [
      { id: 'eg_g1', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'HEAL_LIGHT' },
      { id: 'eg_g2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' },
      { id: 'eg_g3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  goblin_archer: {
    id: 'goblin_archer',
    unitTypeId: 'goblin_archer',
    name: 'Goblin Sniper',
    maxHp: 140,
    hp: 140,
    maxMp: 50,
    mp: 50,
    attack: 19,
    defense: 4,
    speed: 1.3,
    range: 200,
    flying: false,
    color: '#84cc16',
    icon: 'Crosshair',
    size: 26,
    expReward: 60,
    goldReward: 35,
    gambits: [
      { id: 'eg_ga1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' },
      { id: 'eg_ga2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_FURTHEST', action: 'ATTACK' }
    ]
  },
  dire_wolf: {
    id: 'dire_wolf',
    unitTypeId: 'dire_wolf',
    name: 'Dire Shadow-Wolf',
    maxHp: 190,
    hp: 190,
    maxMp: 30,
    mp: 30,
    attack: 23,
    defense: 7,
    speed: 1.5,
    range: 50,
    flying: false,
    color: '#fb923c',
    icon: 'Dog',
    size: 32,
    expReward: 70,
    goldReward: 40,
    gambits: [
      { id: 'eg_dw1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'ATTACK' }
    ]
  },
  skeleton_warrior: {
    id: 'skeleton_warrior',
    unitTypeId: 'skeleton_warrior',
    name: 'Skeletal Sentry',
    maxHp: 220,
    hp: 220,
    maxMp: 80,
    mp: 80,
    attack: 20,
    defense: 10,
    speed: 1.1,
    range: 55,
    flying: false,
    color: '#cbd5e1',
    icon: 'Bone',
    size: 32,
    expReward: 80,
    goldReward: 50,
    gambits: [
      { id: 'eg_s1', enabled: true, condition: 'ENEMY_ANY', target: 'ENEMY_NEAREST', action: 'LIGHTNING_BOLT' },
      { id: 'eg_s2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  skeleton_mage: {
    id: 'skeleton_mage',
    unitTypeId: 'skeleton_mage',
    name: 'Skeletal Archmage',
    maxHp: 160,
    hp: 160,
    maxMp: 140,
    mp: 140,
    attack: 27,
    defense: 5,
    speed: 1.0,
    range: 220,
    flying: false,
    color: '#38bdf8',
    icon: 'Wand',
    size: 30,
    expReward: 100,
    goldReward: 65,
    gambits: [
      { id: 'eg_sm1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_sm2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_HIGHEST_HP', action: 'LIGHTNING_BOLT' }
    ]
  },
  harpy_hunter: {
    id: 'harpy_hunter',
    unitTypeId: 'harpy_hunter',
    name: 'Harpy Sky-Hunter',
    maxHp: 200,
    hp: 200,
    maxMp: 90,
    mp: 90,
    attack: 22,
    defense: 8,
    speed: 1.4,
    range: 180,
    flying: true,
    color: '#c084fc',
    icon: 'Feather',
    size: 30,
    expReward: 110,
    goldReward: 75,
    gambits: [
      { id: 'eg_h1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_h2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' },
      { id: 'eg_h3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  harpy_matriarch: {
    id: 'harpy_matriarch',
    unitTypeId: 'harpy_matriarch',
    name: 'Harpy Matriarch',
    maxHp: 290,
    hp: 290,
    maxMp: 130,
    mp: 130,
    attack: 26,
    defense: 12,
    speed: 1.3,
    range: 190,
    flying: true,
    color: '#e879f9',
    icon: 'Crown',
    size: 38,
    expReward: 160,
    goldReward: 110,
    gambits: [
      { id: 'eg_hm1', enabled: true, condition: 'ALLY_HP_BELOW_50', target: 'ALLY_LOWEST_HP', action: 'HEAL_MEDIUM' },
      { id: 'eg_hm2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_hm3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  iron_golem: {
    id: 'iron_golem',
    unitTypeId: 'iron_golem',
    name: 'Obsidian Iron Golem',
    maxHp: 500,
    hp: 500,
    maxMp: 80,
    mp: 80,
    attack: 32,
    defense: 20,
    speed: 0.9,
    range: 65,
    flying: false,
    color: '#64748b',
    icon: 'Shield',
    size: 44,
    expReward: 250,
    goldReward: 180,
    gambits: [
      { id: 'eg_i1', enabled: true, condition: 'SELF_HP_BELOW_50', target: 'SELF', action: 'SHIELD_BLOCK' },
      { id: 'eg_i2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_HIGHEST_HP', action: 'ATTACK' }
    ]
  },
  void_cultist: {
    id: 'void_cultist',
    unitTypeId: 'void_cultist',
    name: 'Shadow Void Cultist',
    maxHp: 240,
    hp: 240,
    maxMp: 160,
    mp: 160,
    attack: 29,
    defense: 10,
    speed: 1.1,
    range: 200,
    flying: false,
    color: '#a855f7',
    icon: 'Flame',
    size: 34,
    expReward: 180,
    goldReward: 130,
    gambits: [
      { id: 'eg_vc1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_vc2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'LIGHTNING_BOLT' }
    ]
  },
  lava_drake: {
    id: 'lava_drake',
    unitTypeId: 'lava_drake',
    name: 'Volcanic Lava Drake',
    maxHp: 440,
    hp: 440,
    maxMp: 180,
    mp: 180,
    attack: 36,
    defense: 18,
    speed: 1.1,
    range: 180,
    flying: true,
    color: '#f97316',
    icon: 'Flame',
    size: 46,
    expReward: 320,
    goldReward: 220,
    gambits: [
      { id: 'eg_ld1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_ld2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_HIGHEST_HP', action: 'ATTACK' }
    ]
  },
  nether_dragon: {
    id: 'nether_dragon',
    unitTypeId: 'nether_dragon',
    name: 'Nether Dragon Lord',
    maxHp: 1100,
    hp: 1100,
    maxMp: 250,
    mp: 250,
    attack: 45,
    defense: 24,
    speed: 1.2,
    range: 220,
    flying: true,
    color: '#ef4444',
    icon: 'Flame',
    size: 58,
    boss: true,
    expReward: 800,
    goldReward: 600,
    gambits: [
      { id: 'eg_d1', enabled: true, condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'eg_d2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'LIGHTNING_BOLT' },
      { id: 'eg_d3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  }
};

export const REGION_ENEMY_POOLS = {
  'The Oakwood Lowlands': ['goblin_scout', 'goblin_archer', 'dire_wolf', 'skeleton_warrior'],
  'The Arcane Coast': ['harpy_hunter', 'harpy_matriarch', 'skeleton_mage', 'goblin_archer'],
  'The Central Catacombs': ['skeleton_warrior', 'skeleton_mage', 'void_cultist', 'iron_golem'],
  'Nether Volcanic Summit': ['iron_golem', 'void_cultist', 'lava_drake', 'harpy_matriarch'],
  'The Gilded Mountains': ['iron_golem', 'harpy_hunter', 'harpy_matriarch', 'skeleton_warrior']
};

export const ENCOUNTERS = {
  goblin_patrol: {
    name: 'Whispering Woods Ambush',
    description: 'A pack of wild goblin scouts and skeletal sentries spring from the dark thicket!',
    enemies: [
      { ...ENEMIES.goblin_scout, id: 'goblin_1', name: 'Goblin Scout A', xRatio: 0.65, yRatio: 0.35 },
      { ...ENEMIES.goblin_scout, id: 'goblin_2', name: 'Goblin Scout B', xRatio: 0.70, yRatio: 0.65 },
      { ...ENEMIES.skeleton_warrior, id: 'skel_1', name: 'Skeletal Guard', xRatio: 0.60, yRatio: 0.5 }
    ]
  },
  harpy_pack: {
    name: 'Screaming Harpy Flock',
    description: 'Vicious winged harpies dive from ruined pillars above!',
    enemies: [
      { ...ENEMIES.harpy_hunter, id: 'harpy_1', name: 'Harpy Alpha', xRatio: 0.65, yRatio: 0.35 },
      { ...ENEMIES.harpy_hunter, id: 'harpy_2', name: 'Harpy Skirmisher', xRatio: 0.68, yRatio: 0.65 }
    ]
  },
  iron_golem_guard: {
    name: 'Keep Gatekeeper Battle',
    description: 'An obsidian golem awakens alongside an elite skeletal sentry!',
    enemies: [
      { ...ENEMIES.iron_golem, id: 'golem_1', name: 'Obsidian Golem', xRatio: 0.60, yRatio: 0.5 },
      { ...ENEMIES.skeleton_warrior, id: 'skel_boss', name: 'Skeleton Champion', xRatio: 0.70, yRatio: 0.3 }
    ]
  },
  sunken_vault_guard: {
    name: 'Sunken Relic Guardians',
    description: 'Enchanted harpy matriarchs and siren spellcasters defend the sunken chest!',
    enemies: [
      { ...ENEMIES.harpy_matriarch, id: 'vault_m1', name: 'Harpy Matriarch', xRatio: 0.62, yRatio: 0.38 },
      { ...ENEMIES.skeleton_mage, id: 'vault_m2', name: 'Siren Specter', xRatio: 0.68, yRatio: 0.65 }
    ]
  },
  catacombs_boss: {
    name: 'Void Sepulcher Wraiths',
    description: 'Ancient shadow cultists and skeletal archmages rise from stone sarcophagi!',
    enemies: [
      { ...ENEMIES.void_cultist, id: 'cata_1', name: 'Void Cultist Leader', xRatio: 0.60, yRatio: 0.45 },
      { ...ENEMIES.skeleton_mage, id: 'cata_2', name: 'Bone Lich', xRatio: 0.72, yRatio: 0.30 },
      { ...ENEMIES.skeleton_warrior, id: 'cata_3', name: 'Undead Sentry', xRatio: 0.68, yRatio: 0.70 }
    ]
  },
  nether_dragon_boss: {
    name: 'Clash of the Nether Dragon',
    description: 'The volcanic abyss trembles as the terrifying Nether Dragon unleashes dragonfire!',
    enemies: [
      { ...ENEMIES.nether_dragon, id: 'boss_dragon', name: 'Nether Dragon Lord', xRatio: 0.65, yRatio: 0.48 }
    ]
  }
};

/**
 * Generate a dynamic encounter squad with random enemy variations based on zone and danger
 */
export function getEncounter(encounterKey, region = 'The Oakwood Lowlands', dangerRating = 2, nodeAffix = null) {
  const baseEncounter = ENCOUNTERS[encounterKey] || ENCOUNTERS.goblin_patrol;

  // Boss encounter or special fixed toll bridge encounter stays recognizable
  if (encounterKey === 'nether_dragon_boss' || encounterKey === 'goblin_patrol_river') {
    return baseEncounter;
  }

  // Zone dynamic enemy pool
  const pool = REGION_ENEMY_POOLS[region] || REGION_ENEMY_POOLS['The Oakwood Lowlands'];
  const enemyCount = Math.min(4, Math.max(2, Math.floor(dangerRating / 1.5) + (Math.random() < 0.5 ? 1 : 2)));

  // Generate dynamic squad array
  const dynamicSquad = [];
  const positions = [
    { xRatio: 0.62, yRatio: 0.35 },
    { xRatio: 0.68, yRatio: 0.65 },
    { xRatio: 0.58, yRatio: 0.50 },
    { xRatio: 0.74, yRatio: 0.45 }
  ];

  for (let i = 0; i < enemyCount; i++) {
    const enemyTypeId = pool[Math.floor(Math.random() * pool.length)] || pool[0];
    const baseEnemyDef = ENEMIES[enemyTypeId] || ENEMIES.goblin_scout;

    let hpMult = 1.0;
    let atkMult = 1.0;
    let defBonus = 0;
    let goldMult = 1.0;

    // Apply Node Event Affixes
    if (nodeAffix === 'elite_ambush') {
      hpMult *= 1.2;
      atkMult *= 1.2;
    } else if (nodeAffix === 'fortified_post') {
      defBonus += 12;
    } else if (nodeAffix === 'gold_hoard') {
      goldMult *= 1.75;
    }

    dynamicSquad.push({
      ...baseEnemyDef,
      id: `${enemyTypeId}_${i + 1}`,
      name: `${baseEnemyDef.name} ${String.fromCharCode(65 + i)}`,
      maxHp: Math.round(baseEnemyDef.maxHp * hpMult),
      hp: Math.round(baseEnemyDef.maxHp * hpMult),
      attack: Math.round(baseEnemyDef.attack * atkMult),
      defense: baseEnemyDef.defense + defBonus,
      goldReward: Math.round(baseEnemyDef.goldReward * goldMult),
      xRatio: positions[i % positions.length].xRatio,
      yRatio: positions[i % positions.length].yRatio
    });
  }

  return {
    ...baseEncounter,
    enemies: dynamicSquad
  };
}
