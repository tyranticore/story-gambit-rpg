import { GAMBIT_ACTIONS } from '../data/defaultGambits.js';

export function evaluateGambits(actor, allies, enemies) {
  if (!actor || actor.hp <= 0 || !actor.gambits || actor.gambits.length === 0) {
    return null;
  }

  // Check cooldowned actions
  const now = Date.now();

  for (const gambit of actor.gambits) {
    if (gambit.enabled === false) continue;

    const actionDef = GAMBIT_ACTIONS.find(a => a.id === gambit.action);
    if (!actionDef) continue;

    // MP Check
    if (actor.mp < actionDef.mpCost) continue;

    // Cooldown check
    if (actor.cooldowns && actor.cooldowns[gambit.action] && actor.cooldowns[gambit.action] > now) {
      continue;
    }

    // Evaluate Condition & Find Target
    const target = evaluateTarget(actor, gambit.condition, gambit.target, allies, enemies);
    if (target) {
      return {
        gambit,
        target,
        actionDef
      };
    }
  }

  return null;
}

function evaluateTarget(actor, conditionId, targetId, allies, enemies) {
  const aliveEnemies = enemies.filter(e => e.hp > 0);
  const aliveAllies = allies.filter(a => a.hp > 0);

  if (aliveEnemies.length === 0 && targetId.startsWith('ENEMY')) {
    return null;
  }

  // 1. Evaluate Condition
  let conditionPassed = false;
  switch (conditionId) {
    case 'ALWAYS':
      conditionPassed = true;
      break;
    case 'SELF_HP_BELOW_50':
      conditionPassed = (actor.hp / actor.maxHp) < 0.5;
      break;
    case 'SELF_HP_BELOW_30':
      conditionPassed = (actor.hp / actor.maxHp) < 0.3;
      break;
    case 'SELF_MP_BELOW_20':
      conditionPassed = (actor.mp / actor.maxMp) < 0.2;
      break;
    case 'ALLY_HP_BELOW_40':
      conditionPassed = aliveAllies.some(a => (a.hp / a.maxHp) < 0.4);
      break;
    case 'ENEMY_ANY':
      conditionPassed = aliveEnemies.length > 0;
      break;
    case 'ENEMY_FLYING':
      conditionPassed = aliveEnemies.some(e => e.flying);
      break;
    case 'ENEMY_BOSS':
      conditionPassed = aliveEnemies.some(e => e.boss);
      break;
    case 'ENEMY_CLOSE':
      conditionPassed = aliveEnemies.some(e => getDistance(actor, e) <= 100);
      break;
    case 'ENEMY_FAR':
      conditionPassed = aliveEnemies.some(e => getDistance(actor, e) > 150);
      break;
    default:
      conditionPassed = true;
  }

  if (!conditionPassed) return null;

  // 2. Select Target based on targetId
  switch (targetId) {
    case 'SELF':
      return actor;
    case 'ALLY_MOST_HURT':
      return [...aliveAllies].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0] || actor;
    case 'ENEMY_NEAREST':
      return [...aliveEnemies].sort((a, b) => getDistance(actor, a) - getDistance(actor, b))[0];
    case 'ENEMY_LOWEST_HP':
      return [...aliveEnemies].sort((a, b) => a.hp - b.hp)[0];
    case 'ENEMY_HIGHEST_HP':
      return [...aliveEnemies].sort((a, b) => b.hp - a.hp)[0];
    case 'ENEMY_FLYING':
      return aliveEnemies.find(e => e.flying) || aliveEnemies[0];
    case 'ENEMY_ALL':
      return aliveEnemies[0]; // Primary focus target for area spell
    default:
      return aliveEnemies[0] || actor;
  }
}

function getDistance(a, b) {
  const dx = (a.x || 0) - (b.x || 0);
  const dy = (a.y || 0) - (b.y || 0);
  return Math.sqrt(dx * dx + dy * dy);
}
