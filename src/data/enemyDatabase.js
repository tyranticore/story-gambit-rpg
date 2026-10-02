export const ENEMIES = {
  goblin_scout: {
    id: 'goblin_scout',
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
  skeleton_warrior: {
    id: 'skeleton_warrior',
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
  harpy_hunter: {
    id: 'harpy_hunter',
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
  iron_golem: {
    id: 'iron_golem',
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
  nether_dragon: {
    id: 'nether_dragon',
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
    description: 'An obsidian golem awakens alongside a elite skeletal sentry!',
    enemies: [
      { ...ENEMIES.iron_golem, id: 'golem_1', name: 'Obsidian Golem', xRatio: 0.60, yRatio: 0.5 },
      { ...ENEMIES.skeleton_warrior, id: 'skel_boss', name: 'Skeleton Champion', xRatio: 0.70, yRatio: 0.3 }
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
