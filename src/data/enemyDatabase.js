export const ENEMIES = {
  goblin_scout: {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    maxHp: 90,
    hp: 90,
    maxMp: 30,
    mp: 30,
    attack: 16,
    defense: 4,
    speed: 1.8,
    range: 160, // Ranged spear throw!
    flying: false,
    color: '#4ade80',
    icon: 'Skull',
    size: 28,
    expReward: 40,
    goldReward: 25,
    gambits: [
      { condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'HEAL_LIGHT' },
      { condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' },
      { condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  skeleton_warrior: {
    id: 'skeleton_warrior',
    name: 'Skeletal Sentry',
    maxHp: 150,
    hp: 150,
    maxMp: 40,
    mp: 40,
    attack: 22,
    defense: 8,
    speed: 1.5,
    range: 180, // Shadow bolt spell!
    flying: false,
    color: '#cbd5e1',
    icon: 'Bone',
    size: 32,
    expReward: 65,
    goldReward: 40,
    gambits: [
      { condition: 'ENEMY_ANY', target: 'ENEMY_NEAREST', action: 'LIGHTNING_BOLT' },
      { condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  harpy_hunter: {
    id: 'harpy_hunter',
    name: 'Harpy Sky-Hunter',
    maxHp: 130,
    hp: 130,
    maxMp: 50,
    mp: 50,
    attack: 26,
    defense: 6,
    speed: 2.2,
    range: 200,
    flying: true,
    color: '#c084fc',
    icon: 'Feather',
    size: 30,
    expReward: 85,
    goldReward: 55,
    gambits: [
      { condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' }
    ]
  },
  iron_golem: {
    id: 'iron_golem',
    name: 'Obsidian Iron Golem',
    maxHp: 350,
    hp: 350,
    maxMp: 40,
    mp: 40,
    attack: 38,
    defense: 22,
    speed: 1.2,
    range: 80,
    flying: false,
    color: '#64748b',
    icon: 'Shield',
    size: 44,
    expReward: 160,
    goldReward: 120,
    gambits: [
      { condition: 'SELF_HP_BELOW_50', target: 'SELF', action: 'SHIELD_BLOCK' },
      { condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  nether_dragon: {
    id: 'nether_dragon',
    name: 'Nether Dragon Lord',
    maxHp: 800,
    hp: 800,
    maxMp: 150,
    mp: 150,
    attack: 55,
    defense: 20,
    speed: 1.6,
    range: 220,
    flying: true,
    color: '#ef4444',
    icon: 'Flame',
    size: 58,
    boss: true,
    expReward: 500,
    goldReward: 400,
    gambits: [
      { condition: 'ALWAYS', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'LIGHTNING_BOLT' },
      { condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
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
