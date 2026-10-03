export const GAMBIT_CONDITIONS = [
  { id: 'ALWAYS', label: 'Always (Unconditional)', category: 'General' },
  { id: 'SELF_HP_BELOW_50', label: 'Self: HP < 50%', category: 'Self Health' },
  { id: 'SELF_HP_BELOW_30', label: 'Self: HP < 30%', category: 'Self Health' },
  { id: 'SELF_MP_BELOW_20', label: 'Self: MP < 20%', category: 'Self Mana' },
  { id: 'ALLY_HP_BELOW_40', label: 'Ally: HP < 40%', category: 'Ally Health' },
  { id: 'HEALER_ATTACKED', label: 'Healer/DPS is Under Attack!', category: 'Threat & Aggro' },
  { id: 'ENEMY_ANY', label: 'Enemy: Any Targetable', category: 'Enemy' },
  { id: 'ENEMY_FLYING', label: 'Enemy: Target is Flying', category: 'Enemy Type' },
  { id: 'ENEMY_BOSS', label: 'Enemy: Is Boss/Champion', category: 'Enemy Type' },
  { id: 'ENEMY_CLOSE', label: 'Enemy: Range < 80px (Melee)', category: 'Distance' },
  { id: 'ENEMY_FAR', label: 'Enemy: Range > 150px (Ranged)', category: 'Distance' }
];

export const GAMBIT_TARGETS = [
  { id: 'ENEMY_NEAREST', label: 'Nearest Enemy' },
  { id: 'ENEMY_LOWEST_HP', label: 'Enemy with Lowest HP' },
  { id: 'ENEMY_HIGHEST_HP', label: 'Enemy with Highest HP' },
  { id: 'ENEMY_ATTACKING_HEALER', label: 'Enemy Attacking Healer/DPS' },
  { id: 'ENEMY_FLYING', label: 'Flying Enemy' },
  { id: 'SELF', label: 'Self' },
  { id: 'ALLY_MOST_HURT', label: 'Ally with Lowest HP %' },
  { id: 'ALLY_TANK', label: 'Frontline Tank Ally' },
  { id: 'ENEMY_ALL', label: 'All Enemies (Area target)' }
];

export const GAMBIT_ACTIONS = [
  { id: 'ATTACK', label: 'Basic Attack / Melee Strike', mpCost: 0, cooldown: 1.2, description: 'Standard physical strike (generates threat)' },
  { id: 'TAUNT', label: 'Taunt Shout (Tank Aggro)', mpCost: 15, cooldown: 4.5, description: 'Forces all nearby enemies to attack Tank (+300 Threat)' },
  { id: 'HOLY_SMITE', label: 'Holy Smite (Mace/Hammer)', mpCost: 15, cooldown: 3.5, description: 'Cleric mace strike dealing 42 DMG (+160 Threat)' },
  { id: 'HEAL_LIGHT', label: 'Light Heal / Divine Touch', mpCost: 15, cooldown: 3.5, description: 'Restores 50 HP to target (Priority for Tanks)' },
  { id: 'FIREBALL', label: 'Fireball Spell', mpCost: 25, cooldown: 3.5, description: 'Deals 75 area magic damage from backline' },
  { id: 'LIGHTNING_BOLT', label: 'Lightning Bolt', mpCost: 30, cooldown: 4.5, description: 'High single-target zap (110 DMG)' },
  { id: 'SHIELD_BLOCK', label: 'Shield Wall Stance', mpCost: 10, cooldown: 5.5, description: 'Reduces damage taken by 50% for 4s (+100 Threat)' },
  { id: 'POISON_DART', label: 'Poison Dart', mpCost: 12, cooldown: 3.0, description: 'Deals 30 damage + 12 DoT per sec' }
];

export const DEFAULT_HERO_GAMBITS = [
  { id: 'g_1', enabled: true, condition: 'HEALER_ATTACKED', target: 'ENEMY_ATTACKING_HEALER', action: 'TAUNT' },
  { id: 'g_2', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'SHIELD_BLOCK' },
  { id: 'g_3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'TAUNT' },
  { id: 'g_4', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
];
