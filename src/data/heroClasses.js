export const HERO_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Ironclad Warrior',
    role: 'Frontline Tank & Melee Bruiser',
    description: 'Heavy armor master who charges into melee, taunting foes and absorbing damage for the party.',
    avatarColor: '#b45309',
    badgeIcon: 'Shield',
    baseStats: { maxHp: 160, hp: 160, maxMp: 40, mp: 40, attack: 28, defense: 14, speed: 0.9, range: 55 },
    defaultPaperDoll: {
      head: 'iron_helm',
      shoulders: 'iron_pauldrons',
      chest: 'chainmail_plate',
      hands: 'iron_gauntlets',
      belt: 'warrior_belt',
      legs: 'plate_greaves',
      ring1: null,
      ring2: null,
      weapon: 'sun_steel_sword',
      offhand: 'tower_shield'
    },
    starterGambits: [
      { id: 'g_w1', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'SHIELD_BLOCK' },
      { id: 'g_w2', enabled: true, condition: 'ENEMY_CLOSE', target: 'ENEMY_NEAREST', action: 'ATTACK' },
      { id: 'g_w3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  thief: {
    id: 'thief',
    name: 'Shadow Thief',
    role: 'Flanking Assassin & Crit Dealer',
    description: 'Agile skirmisher who maneuvers behind enemy lines to land lethal critical strikes and poison darts.',
    avatarColor: '#a855f7',
    badgeIcon: 'Zap',
    baseStats: { maxHp: 110, hp: 110, maxMp: 50, mp: 50, attack: 34, defense: 6, speed: 1.6, range: 55 },
    defaultPaperDoll: {
      head: 'shadow_cowl',
      shoulders: null,
      chest: 'leather_jerkin',
      hands: 'leather_gloves',
      belt: 'leather_belt',
      legs: 'leather_pants',
      ring1: 'poison_ring',
      ring2: null,
      weapon: 'twin_daggers',
      offhand: null
    },
    starterGambits: [
      { id: 'g_t1', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'HEAL_LIGHT' },
      { id: 'g_t2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_LOWEST_HP', action: 'POISON_DART' },
      { id: 'g_t3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  archer: {
    id: 'archer',
    name: 'Sylvan Archer',
    role: 'Long-Range Sniper & Air Counter',
    description: 'Expert marksman positioning in the backline, raining arrows on flying and high-priority targets.',
    avatarColor: '#16a34a',
    badgeIcon: 'Crosshair',
    baseStats: { maxHp: 105, hp: 105, maxMp: 60, mp: 60, attack: 30, defense: 7, speed: 1.4, range: 220 },
    defaultPaperDoll: {
      head: 'ranger_hood',
      shoulders: null,
      chest: 'padded_tunic',
      hands: 'archer_gloves',
      belt: 'ranger_belt',
      legs: 'padded_pants',
      ring1: null,
      ring2: null,
      weapon: 'longbow',
      offhand: 'quiver'
    },
    starterGambits: [
      { id: 'g_a1', enabled: true, condition: 'ENEMY_FLYING', target: 'ENEMY_FLYING', action: 'ATTACK' },
      { id: 'g_a2', enabled: true, condition: 'ALWAYS', target: 'ENEMY_HIGHEST_HP', action: 'POISON_DART' },
      { id: 'g_a3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  mage: {
    id: 'mage',
    name: 'Arcane Mage',
    role: 'Area Burst Spellcaster',
    description: 'Wielder of destruction who stands back to blast enemy clusters with Fireballs and Lightning Bolts.',
    avatarColor: '#3b82f6',
    badgeIcon: 'Sparkles',
    baseStats: { maxHp: 95, hp: 95, maxMp: 120, mp: 120, attack: 38, defense: 4, speed: 1.1, range: 200 },
    defaultPaperDoll: {
      head: 'wizard_hat',
      shoulders: null,
      chest: 'silk_robes',
      hands: 'silk_wraps',
      belt: 'arcane_sash',
      legs: 'silk_pants',
      ring1: 'mana_ring',
      ring2: null,
      weapon: 'crystal_staff',
      offhand: 'spellbook'
    },
    starterGambits: [
      { id: 'g_m1', enabled: true, condition: 'ENEMY_ANY', target: 'ENEMY_ALL', action: 'FIREBALL' },
      { id: 'g_m2', enabled: true, condition: 'ENEMY_FLYING', target: 'ENEMY_FLYING', action: 'LIGHTNING_BOLT' },
      { id: 'g_m3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  healer: {
    id: 'healer',
    name: 'Sanctuary Healer',
    role: 'Party Medic & Life Sustain',
    description: 'Devoted healer who stays protected in the rear guard, restoring ally HP and granting defensive shields.',
    avatarColor: '#10b981',
    badgeIcon: 'Heart',
    baseStats: { maxHp: 115, hp: 115, maxMp: 110, mp: 110, attack: 18, defense: 8, speed: 1.0, range: 160 },
    defaultPaperDoll: {
      head: 'circlet_of_life',
      shoulders: null,
      chest: 'blessed_robes',
      hands: 'blessed_gloves',
      belt: 'holy_sash',
      legs: 'linen_pants',
      ring1: null,
      ring2: null,
      weapon: 'healing_mace',
      offhand: 'tome_of_light'
    },
    starterGambits: [
      { id: 'g_h1', enabled: true, condition: 'ALLY_HP_BELOW_40', target: 'ALLY_MOST_HURT', action: 'HEAL_LIGHT' },
      { id: 'g_h2', enabled: true, condition: 'SELF_HP_BELOW_50', target: 'SELF', action: 'HEAL_LIGHT' },
      { id: 'g_h3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  },
  cleric: {
    id: 'cleric',
    name: 'Holy Cleric',
    role: 'Hybrid Support & Frontline Paladin',
    description: 'Sturdy holy knight capable of holding the front line while healing wounded party allies.',
    avatarColor: '#f59e0b',
    badgeIcon: 'Sun',
    baseStats: { maxHp: 140, hp: 140, maxMp: 80, mp: 80, attack: 25, defense: 12, speed: 1.0, range: 60 },
    defaultPaperDoll: {
      head: 'blessed_sallet',
      shoulders: 'cleric_pauldrons',
      chest: 'radiant_mail',
      hands: 'plate_gauntlets',
      belt: 'holy_belt',
      legs: 'plate_greaves',
      ring1: null,
      ring2: null,
      weapon: 'warhammer',
      offhand: 'holy_shield'
    },
    starterGambits: [
      { id: 'g_c1', enabled: true, condition: 'ALLY_HP_BELOW_40', target: 'ALLY_MOST_HURT', action: 'HEAL_LIGHT' },
      { id: 'g_c2', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'SHIELD_BLOCK' },
      { id: 'g_c3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
    ]
  }
};

export const RECRUITABLE_NPCS = [
  {
    id: 'boran',
    name: 'Boran Ironwall',
    classId: 'warrior',
    dialogue: '"My shield stands ready. Pay me 50 gold or promise me glory against the Nether Dragon, and I will defend your flank to my last breath!"',
    cost: 50,
    stats: HERO_CLASSES.warrior.baseStats,
    defaultPaperDoll: HERO_CLASSES.warrior.defaultPaperDoll,
    color: '#b45309'
  },
  {
    id: 'lyra',
    name: 'Lyra Shadowstep',
    classId: 'thief',
    dialogue: '"Need someone to slip behind their lines and gut their mages before they cast? Name\'s Lyra. Let\'s make a deal."',
    cost: 60,
    stats: HERO_CLASSES.thief.baseStats,
    defaultPaperDoll: HERO_CLASSES.thief.defaultPaperDoll,
    color: '#a855f7'
  },
  {
    id: 'elion',
    name: 'Elion Windstrider',
    classId: 'archer',
    dialogue: '"The beasts of the Whispering Woods fear my bow. Include me in your company and no flying harpy shall reach you."',
    cost: 65,
    stats: HERO_CLASSES.archer.baseStats,
    defaultPaperDoll: HERO_CLASSES.archer.defaultPaperDoll,
    color: '#16a34a'
  },
  {
    id: 'seraphina',
    name: 'Sister Seraphina',
    classId: 'healer',
    dialogue: '"The Elder sent me to tend your wounds. Allow me to walk beside you, and light shall keep your companions alive."',
    cost: 40,
    stats: HERO_CLASSES.healer.baseStats,
    defaultPaperDoll: HERO_CLASSES.healer.defaultPaperDoll,
    color: '#10b981'
  },
  {
    id: 'ignis',
    name: 'Ignis Emberweaver',
    classId: 'mage',
    dialogue: '"I crave the scent of dragonfire and burning sulfur. Hire me, and I shall turn enemy formations into cinders!"',
    cost: 75,
    stats: HERO_CLASSES.mage.baseStats,
    defaultPaperDoll: HERO_CLASSES.mage.defaultPaperDoll,
    color: '#3b82f6'
  }
];

export const WANDERING_HEROES = [
  {
    id: 'tristan',
    name: 'Sir Tristan the Wandering Knight',
    classId: 'warrior',
    dialogue: '"I have roamed these high roads since the fall of High Keep. Pay me 55 gold stipend, and my blade shall serve your guild."',
    cost: 55,
    stats: HERO_CLASSES.warrior.baseStats,
    defaultPaperDoll: HERO_CLASSES.warrior.defaultPaperDoll,
    color: '#d97706'
  },
  {
    id: 'kaelen',
    name: 'Kaelen Forest-Strider',
    classId: 'archer',
    dialogue: '"I track dark beasts in the mountain shadows. Pay me 60 gold stipend and no harpy or goblin will escape my sight."',
    cost: 60,
    stats: HERO_CLASSES.archer.baseStats,
    defaultPaperDoll: HERO_CLASSES.archer.defaultPaperDoll,
    color: '#15803d'
  },
  {
    id: 'vespera',
    name: 'Vespera Nightshade',
    classId: 'thief',
    dialogue: '"A lone assassin seeking bounty on dragon cultists. 70 gold stipend and I slip behind enemy lines unnoticed."',
    cost: 70,
    stats: HERO_CLASSES.thief.baseStats,
    defaultPaperDoll: HERO_CLASSES.thief.defaultPaperDoll,
    color: '#9333ea'
  },
  {
    id: 'maelis',
    name: 'Maelis Sunweaver',
    classId: 'cleric',
    dialogue: '"I am a pilgrim of the High Sun. For 45 gold stipend, I shall walk with you and mend your party\'s wounds."',
    cost: 45,
    stats: HERO_CLASSES.cleric.baseStats,
    defaultPaperDoll: HERO_CLASSES.cleric.defaultPaperDoll,
    color: '#eab308'
  },
  {
    id: 'zephyr',
    name: 'Zephyr Pyremage',
    classId: 'mage',
    dialogue: '"A wandering elementalist looking to test fire magic against dragonkin. 80 gold stipend buys my elemental flame!"',
    cost: 80,
    stats: HERO_CLASSES.mage.baseStats,
    defaultPaperDoll: HERO_CLASSES.mage.defaultPaperDoll,
    color: '#2563eb'
  },
  {
    id: 'teresa',
    name: 'Sister Teresa of the Dawn',
    classId: 'healer',
    dialogue: '"Blessings, traveler! I tend to weary wanderers along these dangerous roads. 50 gold stipend for divine sanctuary and light."',
    cost: 50,
    stats: HERO_CLASSES.healer.baseStats,
    defaultPaperDoll: HERO_CLASSES.healer.defaultPaperDoll,
    color: '#059669'
  }
];

