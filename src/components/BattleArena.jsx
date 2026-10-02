import React, { useEffect, useRef, useState } from 'react';
import { ENCOUNTERS } from '../data/enemyDatabase';
import { evaluateGambits } from '../engine/gambitEngine';
import { audioManager } from '../engine/audioManager';
import { Play, Pause, Swords, Shield, Zap, Trophy, Skull, RefreshCw, Footprints, ShieldAlert, EyeOff, TreePine, Mountain } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BattleArena({ encounterKey, playerStats, playerGambits, followers, onBattleComplete }) {
  const encounter = ENCOUNTERS[encounterKey] || ENCOUNTERS.goblin_patrol;

  const [battleState, setBattleState] = useState('RUNNING'); // RUNNING, VICTORY, DEFEAT, RETREATED, PAUSED
  const [battleStance, setBattleStance] = useState('BALANCED'); // AGGRESSIVE, BALANCED, DEFENSIVE, STEALTH, FLEE
  const [speed, setSpeed] = useState(0.75); // 0.5x, 0.75x, 1.0x, 1.5x
  const [combatLogs, setCombatLogs] = useState([]);

  const canvasRef = useRef(null);
  const fleeTimerRef = useRef(0);
  const cameraRef = useRef({ x: 0, y: 0 });

  // Environmental Obstacles per Map
  const obstaclesRef = useRef(getArenaObstacles(encounterKey));

  // Assemble full 4-unit Hero Party with balanced 1.6x HP scaling for ~20-30s battles!
  const heroesRef = useRef([
    {
      id: 'player_hero',
      name: playerStats.name || 'Hero Commander',
      classId: playerStats.classId || 'warrior',
      maxHp: Math.round((playerStats.maxHp || 160) * 1.6),
      hp: Math.round((playerStats.maxHp || 160) * 1.6),
      maxMp: playerStats.maxMp || 60,
      mp: playerStats.mp || 60,
      attack: playerStats.attack || 28,
      defense: playerStats.defense || 10,
      speed: playerStats.speed || 1.0,
      range: playerStats.range || 55,
      gambits: playerGambits,
      cooldowns: {},
      x: 100,
      y: 190,
      size: 34,
      color: '#d4af37',
      role: 'Leader',
      hitTimer: 0
    },
    ...(followers || []).map((f, idx) => {
      const initialPositions = [
        { x: 70, y: 100 },
        { x: 60, y: 280 },
        { x: 50, y: 190 }
      ];
      const pos = initialPositions[idx] || { x: 70, y: 100 + idx * 80 };
      const scaledHp = Math.round(f.stats.maxHp * 1.6);
      return {
        id: `follower_${f.id}`,
        name: f.name,
        classId: f.classId,
        maxHp: scaledHp,
        hp: scaledHp,
        maxMp: f.stats.maxMp,
        mp: f.stats.maxMp,
        attack: f.stats.attack,
        defense: f.stats.defense,
        speed: f.stats.speed || 1.0,
        range: f.stats.range || (f.classId === 'mage' || f.classId === 'archer' ? 200 : 55),
        gambits: [
          { id: 'f_1', enabled: true, condition: 'ALLY_HP_BELOW_40', target: 'ALLY_MOST_HURT', action: 'HEAL_LIGHT' },
          { id: 'f_2', enabled: true, condition: 'SELF_HP_BELOW_30', target: 'SELF', action: 'HEAL_LIGHT' },
          { id: 'f_3', enabled: true, condition: 'ALWAYS', target: 'ENEMY_NEAREST', action: 'ATTACK' }
        ],
        cooldowns: {},
        x: pos.x,
        y: pos.y,
        size: 30,
        color: f.color || '#3b82f6',
        role: 'Follower',
        hitTimer: 0
      };
    })
  ]);

  // Enemies with balanced 1.5x HP scaling
  const enemiesRef = useRef(
    encounter.enemies.map((e, idx) => {
      const defaultYPositions = [110, 200, 290];
      const scaledHp = Math.round(e.maxHp * 1.5);
      return {
        ...e,
        maxHp: scaledHp,
        hp: scaledHp,
        maxMp: e.maxMp || 50,
        mp: e.maxMp || 50,
        cooldowns: {},
        x: 560 * (e.xRatio || 0.85),
        y: 350 * (e.yRatio || 0.5) || defaultYPositions[idx % 3],
        size: e.size || 32,
        hitTimer: 0
      };
    })
  );

  const projectilesRef = useRef([]);
  const particlesRef = useRef([]);
  const floatingTextsRef = useRef([]);

  const addLog = (text) => {
    setCombatLogs(prev => [text, ...prev.slice(0, 24)]);
  };

  const handleSetStance = (stance) => {
    audioManager.playClick();
    setBattleStance(stance);
    if (stance === 'AGGRESSIVE') addLog('⚔️ STANCE CHANGED: Aggressive! (+25% ATK & Speed)');
    if (stance === 'BALANCED') addLog('⚖️ STANCE CHANGED: Balanced (Standard tactics)');
    if (stance === 'DEFENSIVE') addLog('🛡️ STANCE CHANGED: Defensive! (+40% DEF & 25% Cooldown recovery)');
    if (stance === 'STEALTH') addLog('🥷 STANCE CHANGED: Stay Hidden! (Hold attacks & dodge monster strikes)');
    if (stance === 'FLEE') addLog('🏃 RETREAT ORDERED: Party is falling back to escape!');
  };

  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1) * speed;
      lastTime = currentTime;

      if (battleState === 'RUNNING') {
        updateGame(dt);
      }

      renderCanvas();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [battleState, battleStance, speed]);

  const updateGame = (dt) => {
    const heroes = heroesRef.current;
    const enemies = enemiesRef.current;
    const now = Date.now();

    const aliveHeroes = heroes.filter(h => h.hp > 0);
    const aliveEnemies = enemies.filter(e => e.hp > 0);

    // Decrement hit timers
    [...heroes, ...enemies].forEach(u => {
      if (u.hitTimer > 0) u.hitTimer = Math.max(0, u.hitTimer - dt);
    });

    // Check Victory / Defeat
    if (aliveEnemies.length === 0 && battleState === 'RUNNING') {
      setBattleState('VICTORY');
      audioManager.playVictory();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      addLog('🎉 VICTORY! All enemies defeated by your party!');
      return;
    }

    if (aliveHeroes.length === 0 && battleState === 'RUNNING') {
      setBattleState('DEFEAT');
      addLog('💀 DEFEAT! The entire party was slain.');
      return;
    }

    // 1. Check Flee / Retreat Progress
    if (battleStance === 'FLEE') {
      fleeTimerRef.current += dt;
      aliveHeroes.forEach(hero => {
        moveTowards(hero, { x: 35, y: hero.y }, 70 * (hero.speed || 1.0), dt);
      });

      const allRetreated = aliveHeroes.every(h => h.x <= 55);
      if (allRetreated || fleeTimerRef.current >= 3.0) {
        setBattleState('RETREATED');
        audioManager.playVictory();
        addLog('🏃 RETREAT SUCCESSFUL! Your party safely escaped from battle.');
        return;
      }
    }

    // 2. Update Heroes (Movement + Gambits)
    if (battleStance !== 'FLEE') {
      aliveHeroes.forEach(hero => {
        if (hero.mp < hero.maxMp) hero.mp = Math.min(hero.maxMp, hero.mp + 4 * dt);

        const decision = evaluateGambits(hero, aliveHeroes, aliveEnemies);
        if (decision) {
          const { target, actionDef } = decision;
          const dist = getDistance(hero, target);
          const effectiveRange = actionDef.id === 'ATTACK' ? (hero.range || 55) : 200;

          // If in STEALTH stance, skip offensive attacks
          const isOffensive = ['ATTACK', 'FIREBALL', 'LIGHTNING_BOLT', 'POISON_DART'].includes(actionDef.id);
          if (battleStance === 'STEALTH' && isOffensive) {
            return;
          }

          if (dist > effectiveRange) {
            const moveSpeedMult = battleStance === 'AGGRESSIVE' ? 1.25 : 1.0;
            moveTowards(hero, target, 35 * (hero.speed || 1.0) * moveSpeedMult, dt);
          } else {
            executeAction(hero, target, actionDef, true);
            const cooldownMult = battleStance === 'DEFENSIVE' ? 0.75 : 1.0;
            hero.cooldowns[actionDef.id] = now + (actionDef.cooldown * 1000 * cooldownMult) / speed;
          }
        } else {
          // Fallback: Charge toward nearest enemy if skills are on cooldown
          if (battleStance !== 'STEALTH') {
            const nearestEnemy = [...aliveEnemies].sort((a, b) => getDistance(hero, a) - getDistance(hero, b))[0];
            if (nearestEnemy && getDistance(hero, nearestEnemy) > (hero.range || 55)) {
              moveTowards(hero, nearestEnemy, 35 * (hero.speed || 1.0), dt);
            }
          }
        }
      });
    }

    // 3. Update Enemies (Movement + Gambits)
    aliveEnemies.forEach(enemy => {
      if (enemy.mp < enemy.maxMp) enemy.mp = Math.min(enemy.maxMp, enemy.mp + 5 * dt);

      // In STEALTH stance, 50% chance monster fails to locate hidden hero
      if (battleStance === 'STEALTH' && Math.random() < 0.5) {
        return;
      }

      const decision = evaluateGambits(enemy, aliveEnemies, aliveHeroes);
      if (decision) {
        const { target, actionDef } = decision;
        const dist = getDistance(enemy, target);
        const effectiveRange = actionDef.id === 'ATTACK' ? (enemy.range || 55) : 180;

        if (dist > effectiveRange) {
          moveTowards(enemy, target, 32 * (enemy.speed || 1.0), dt);
        } else {
          executeAction(enemy, target, actionDef, false);
          enemy.cooldowns[actionDef.id] = now + (actionDef.cooldown * 1000) / speed;
        }
      } else {
        const nearestHero = [...aliveHeroes].sort((a, b) => getDistance(enemy, a) - getDistance(enemy, b))[0];
        if (nearestHero && getDistance(enemy, nearestHero) > (enemy.range || 55)) {
          moveTowards(enemy, nearestHero, 32 * (enemy.speed || 1.0), dt);
        }
      }
    });

    // 4. UNIT-OBSTACLE COLLISIONS (Trees, Rocks, Pillars block movement)
    const allUnits = [...aliveHeroes, ...aliveEnemies];
    allUnits.forEach(unit => {
      obstaclesRef.current.forEach(obs => {
        const dx = unit.x - obs.x;
        const dy = unit.y - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (unit.size || 30) * 0.5 + obs.radius;

        if (dist < minDist) {
          const overlap = minDist - (dist || 0.1);
          const nx = dist > 0 ? dx / dist : (Math.random() - 0.5);
          const ny = dist > 0 ? dy / dist : (Math.random() - 0.5);
          unit.x += nx * overlap;
          unit.y += ny * overlap;
        }
      });
    });

    // 5. CIRCLE COLLISION RESOLUTION FORCE (Prevents overlapping)
    for (let i = 0; i < allUnits.length; i++) {
      for (let j = i + 1; j < allUnits.length; j++) {
        const u1 = allUnits[i];
        const u2 = allUnits[j];
        const dx = u2.x - u1.x;
        const dy = u2.y - u1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (u1.size || 30) * 0.5 + (u2.size || 30) * 0.5 + 14;

        if (dist < minDist) {
          const overlap = minDist - (dist || 0.1);
          const nx = dist > 0 ? dx / dist : (Math.random() - 0.5);
          const ny = dist > 0 ? dy / dist : (Math.random() - 0.5);

          const pushStrength = overlap * 0.5;
          u1.x -= nx * pushStrength;
          u1.y -= ny * pushStrength;
          u2.x += nx * pushStrength;
          u2.y += ny * pushStrength;
        }
      }
    }

    // 6. STRICT BOUNDARY CLAMPING (NEVER GO OFF-SCREEN!)
    allUnits.forEach(u => {
      u.x = Math.max(35, Math.min(605, u.x));
      u.y = Math.max(35, Math.min(365, u.y));
    });

    // 7. Update Flying Projectiles & Obstacle Block Collisions
    projectilesRef.current = projectilesRef.current.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Obstacle block collision check
      for (const obs of obstaclesRef.current) {
        const dx = p.x - obs.x;
        const dy = p.y - obs.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < obs.radius + 6) {
          addFloatingText(obs.x, obs.y - 25, `💥 BLOCKED!`, '#f59e0b');
          spawnParticles(p.x, p.y, obs.color || '#94a3b8', 14);
          audioManager.playMonsterHit();
          addLog(`🛡️ ${p.type.toUpperCase()} struck ${obs.name} and was blocked!`);
          return false; // Destroy projectile
        }
      }

      if (getDistance(p, p.target) < 20) {
        onProjectileImpact(p);
        return false;
      }
      return p.life > 0;
    });

    // 8. Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });

    // 9. Update Floating Combat Texts
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => {
      ft.y -= 20 * dt;
      ft.life -= dt;
      return ft.life > 0;
    });
  };

  const moveTowards = (unit, target, speedPx, dt) => {
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 0) {
      unit.x += (dx / len) * speedPx * dt;
      unit.y += (dy / len) * speedPx * dt;

      // Enforce strict bounding clamp immediately
      unit.x = Math.max(35, Math.min(605, unit.x));
      unit.y = Math.max(35, Math.min(365, unit.y));
    }
  };

  const executeAction = (attacker, target, actionDef, isHero) => {
    attacker.mp = Math.max(0, attacker.mp - actionDef.mpCost);

    if (actionDef.id === 'ATTACK') {
      attacker.x += (target.x > attacker.x ? 8 : -8);

      const defStat = (target.defense || 0) + (isHero && battleStance === 'DEFENSIVE' ? 15 : 0);
      const baseDmg = Math.max(2, attacker.attack - defStat * 0.4);

      // Balanced damage multipliers for ideal ~20-30s battle duration!
      const stanceMult = isHero ? (battleStance === 'AGGRESSIVE' ? 0.48 : 0.38) : (battleStance === 'DEFENSIVE' ? 0.18 : 0.28);
      const rawDmg = baseDmg * stanceMult;
      const isCrit = Math.random() < 0.2;
      const dmg = Math.max(1, Math.round(isCrit ? rawDmg * 1.5 : rawDmg));

      target.hp = Math.max(0, target.hp - dmg);
      target.hitTimer = 0.25;

      if (isHero) {
        audioManager.playSlash();
        addFloatingText(target.x, target.y - 20, `-${dmg}${isCrit ? ' CRIT!' : ''}`, isCrit ? '#f59e0b' : '#ef4444');
        addLog(`⚔️ ${attacker.name} hit ${target.name} for ${dmg} DMG! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      } else {
        audioManager.playMonsterHit();
        addFloatingText(target.x, target.y - 20, `🩸 -${dmg}${isCrit ? ' CRIT!' : ''}`, '#f87171');
        addLog(`🩸 MONSTER ATTACK: ${attacker.name} struck ${target.name} for ${dmg} DMG! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      }

      spawnParticles(target.x, target.y, isHero ? '#ef4444' : '#dc2626', 10);
    } else if (actionDef.id === 'FIREBALL') {
      spawnProjectile(attacker, target, 'fireball', '#f97316');
      audioManager.playFireball();
      addLog(`🔥 ${attacker.name} launched Fireball at ${target.name}!`);
    } else if (actionDef.id === 'LIGHTNING_BOLT') {
      spawnProjectile(attacker, target, 'lightning', '#60a5fa');
      audioManager.playFireball();
      addLog(`⚡ ${attacker.name} cast Lightning Bolt at ${target.name}!`);
    } else if (actionDef.id === 'HEAL_LIGHT') {
      const healAmt = 55;
      target.hp = Math.min(target.maxHp, target.hp + healAmt);
      audioManager.playHeal();

      addFloatingText(target.x, target.y - 20, `+${healAmt} HP`, '#10b981');
      addLog(`✨ ${attacker.name} healed ${target.name} for +${healAmt} HP! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      spawnParticles(target.x, target.y, '#34d399', 12);
    } else if (actionDef.id === 'POISON_DART') {
      spawnProjectile(attacker, target, 'poison', '#a855f7');
      addLog(`☣️ ${attacker.name} shot Poison Dart at ${target.name}!`);
    } else if (actionDef.id === 'SHIELD_BLOCK') {
      addFloatingText(attacker.x, attacker.y - 20, `🛡️ SHIELD WALL`, '#fbbf24');
      addLog(`🛡️ ${attacker.name} activated Shield Defense!`);
    }
  };

  const spawnProjectile = (attacker, target, type, color) => {
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const speedPx = 160;

    projectilesRef.current.push({
      x: attacker.x,
      y: attacker.y,
      vx: (dx / len) * speedPx,
      vy: (dy / len) * speedPx,
      target,
      type,
      color,
      attacker,
      life: 2.5
    });
  };

  const onProjectileImpact = (p) => {
    const { attacker, target, type } = p;
    const isHeroAttacker = heroesRef.current.some(h => h.id === attacker.id);
    const prefix = isHeroAttacker ? '⚔️' : '🩸 MONSTER';

    const stanceScale = isHeroAttacker
      ? (battleStance === 'AGGRESSIVE' ? 1.25 : 1.0)
      : (battleStance === 'DEFENSIVE' ? 0.45 : 0.65);

    if (type === 'fireball') {
      const dmg = Math.max(1, Math.round(((75 + (attacker.attack || 0) * 0.4) * 0.42) * stanceScale));
      target.hp = Math.max(0, target.hp - dmg);
      target.hitTimer = 0.3;
      addFloatingText(target.x, target.y - 20, `💥 -${dmg}`, '#f97316');
      addLog(`${prefix} Fireball blasted ${target.name} for ${dmg} DMG! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      spawnParticles(target.x, target.y, '#f97316', 16);
    } else if (type === 'lightning') {
      const dmg = Math.max(1, Math.round(52 * stanceScale));
      target.hp = Math.max(0, target.hp - dmg);
      target.hitTimer = 0.3;
      addFloatingText(target.x, target.y - 20, `⚡ -${dmg}`, '#60a5fa');
      addLog(`${prefix} Lightning struck ${target.name} for ${dmg} DMG! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      spawnParticles(target.x, target.y, '#60a5fa', 18);
    } else if (type === 'poison') {
      const dmg = Math.max(1, Math.round(20 * stanceScale));
      target.hp = Math.max(0, target.hp - dmg);
      target.hitTimer = 0.3;
      addFloatingText(target.x, target.y - 20, `☣️ -${dmg}`, '#c084fc');
      addLog(`${prefix} Poison Dart hit ${target.name} for ${dmg} DMG! (${target.name} HP: ${target.hp}/${target.maxHp})`);
      spawnParticles(target.x, target.y, '#a855f7', 10);
    }
  };

  const addFloatingText = (x, y, text, color) => {
    floatingTextsRef.current.push({ x, y, text, color, life: 1.4 });
  };

  const spawnParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        color,
        life: 0.4 + Math.random() * 0.4,
        size: 3 + Math.random() * 4
      });
    }
  };

  const getDistance = (a, b) => {
    const dx = (a.x || 0) - (b.x || 0);
    const dy = (a.y || 0) - (b.y || 0);
    return Math.sqrt(dx * dx + dy * dy);
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Smooth Dynamic Camera Tracking Focus
    const aliveUnits = [...heroesRef.current, ...enemiesRef.current].filter(u => u.hp > 0);
    if (aliveUnits.length > 0) {
      const avgX = aliveUnits.reduce((acc, u) => acc + u.x, 0) / aliveUnits.length;
      const avgY = aliveUnits.reduce((acc, u) => acc + u.y, 0) / aliveUnits.length;
      const targetCamX = (320 - avgX) * 0.12;
      const targetCamY = (200 - avgY) * 0.12;

      cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.08;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.08;
    }

    ctx.save();
    ctx.translate(cameraRef.current.x, cameraRef.current.y);

    // 1. Rich Arena Background Terrain
    renderArenaTerrain(ctx, w, h, encounterKey);

    // 2. Render Obstacles (Trees, Rocks, Pillars)
    obstaclesRef.current.forEach(obs => {
      // Base Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(obs.x, obs.y + obs.radius * 0.4, obs.radius * 0.9, obs.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main Obstacle Circle / Asset
      ctx.fillStyle = obs.color || '#475569';
      ctx.beginPath();
      ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon overlay
      ctx.font = `${obs.radius * 1.1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obs.icon || '🪨', obs.x, obs.y);
    });

    // 3. Active Stance Badge on Canvas Top Left
    ctx.fillStyle = battleStance === 'AGGRESSIVE' ? '#ef4444' : battleStance === 'DEFENSIVE' ? '#3b82f6' : battleStance === 'STEALTH' ? '#a855f7' : battleStance === 'FLEE' ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`STANCE: ${battleStance}`, 15, 25);

    // If Fleeing, draw retreat progress bar
    if (battleStance === 'FLEE') {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(0, 0, 50, h);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.fillRect(50, 0, 5, h);

      const progress = Math.min(1.0, fleeTimerRef.current / 3.0);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(15, 35, 120 * progress, 8);
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(15, 35, 120, 8);
    }

    // 4. Render Flying Projectiles
    projectilesRef.current.forEach(p => {
      ctx.fillStyle = p.color || '#f97316';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Render Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size || 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // 6. Render Heroes
    heroesRef.current.forEach(hero => {
      if (hero.hp <= 0) return;

      if (hero.hitTimer > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hero.x, hero.y, hero.size * 0.5 + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = hero.color || '#d4af37';
      ctx.beginPath();
      ctx.arc(hero.x, hero.y, hero.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hero.name.split(' ')[0], hero.x, hero.y - hero.size * 0.5 - 12);

      // HP Bar
      const hpPct = Math.max(0, hero.hp / hero.maxHp);
      ctx.fillStyle = '#020617';
      ctx.fillRect(hero.x - 20, hero.y - hero.size * 0.5 - 8, 40, 5);
      ctx.fillStyle = hpPct > 0.4 ? '#10b981' : '#ef4444';
      ctx.fillRect(hero.x - 20, hero.y - hero.size * 0.5 - 8, 40 * hpPct, 5);
    });

    // 7. Render Enemies
    enemiesRef.current.forEach(enemy => {
      if (enemy.hp <= 0) return;

      if (enemy.hitTimer > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size * 0.5 + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = enemy.color || '#ef4444';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(enemy.name, enemy.x, enemy.y - enemy.size * 0.5 - 12);

      // HP Bar
      const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = '#020617';
      ctx.fillRect(enemy.x - 20, enemy.y - enemy.size * 0.5 - 8, 40, 5);
      ctx.fillStyle = hpPct > 0.4 ? '#ef4444' : '#b91c1c';
      ctx.fillRect(enemy.x - 20, enemy.y - enemy.size * 0.5 - 8, 40 * hpPct, 5);
    });

    // 8. Render Floating Texts
    floatingTextsRef.current.forEach(ft => {
      ctx.fillStyle = ft.color || '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Banner & Battle Info */}
      <div className="fantasy-panel p-4 flex flex-wrap items-center justify-between gap-2 border-amber-500/30">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-lg font-bold font-serif text-amber-100">
            {encounter.name || 'Auto-Battle Encounter'}
          </h2>
          <span className="text-xs text-amber-400 font-mono">({heroesRef.current.length} Heroes vs {enemiesRef.current.length} Enemies)</span>
        </div>

        {/* Speed & Pause Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSpeed(0.5)}
              className={`px-2 py-1 rounded-md font-mono text-[11px] ${speed === 0.5 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              0.5x
            </button>
            <button
              onClick={() => setSpeed(0.75)}
              className={`px-2 py-1 rounded-md font-mono text-[11px] ${speed === 0.75 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              0.75x
            </button>
            <button
              onClick={() => setSpeed(1.0)}
              className={`px-2 py-1 rounded-md font-mono text-[11px] ${speed === 1.0 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1.0x
            </button>
          </div>

          <button
            onClick={() => setBattleState(battleState === 'PAUSED' ? 'RUNNING' : 'PAUSED')}
            className="fantasy-button text-xs px-2.5 py-1"
          >
            {battleState === 'PAUSED' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{battleState === 'PAUSED' ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* TACTICAL PARTY BATTLE STANCES BAR */}
      <div className="fantasy-panel p-3 border-amber-500/30 bg-slate-950 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-1.5 text-xs font-bold font-serif text-amber-300">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Tactical Battle Stance:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* 1. AGGRESSIVE STANCE */}
          <button
            onClick={() => handleSetStance('AGGRESSIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              battleStance === 'AGGRESSIVE'
                ? 'bg-red-500 text-white border-red-400 shadow-md shadow-red-500/20 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-red-500/40'
            }`}
            title="Aggressive: +25% Attack Damage & +20% Move Speed"
          >
            <span>⚔️ Aggressive</span>
          </button>

          {/* 2. BALANCED STANCE */}
          <button
            onClick={() => handleSetStance('BALANCED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              battleStance === 'BALANCED'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105 font-bold'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
            }`}
            title="Balanced: Standard Gambit Execution & Combat Stats"
          >
            <span>⚖️ Balanced</span>
          </button>

          {/* 3. DEFENSIVE STANCE */}
          <button
            onClick={() => handleSetStance('DEFENSIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              battleStance === 'DEFENSIVE'
                ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-blue-500/40'
            }`}
            title="Defensive: +40% Defense & 25% Faster Healing Cooldowns"
          >
            <span>🛡️ Defensive</span>
          </button>

          {/* 4. STAY HIDDEN (STEALTH) */}
          <button
            onClick={() => handleSetStance('STEALTH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              battleStance === 'STEALTH'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-500/20 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-purple-500/40'
            }`}
            title="Stay Hidden: Hold Attacks & Dodge Monster Strikes (Reduces Threat)"
          >
            <span>🥷 Stay Hidden</span>
          </button>

          {/* 5. RUN AWAY (FLEE) */}
          <button
            onClick={() => handleSetStance('FLEE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              battleStance === 'FLEE'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20 scale-105 animate-pulse'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-emerald-500/40'
            }`}
            title="Run Away: Retract Left & Escape Combat to Overland Map"
          >
            <span>🏃 Run Away</span>
          </button>
        </div>
      </div>

      {/* 2D Canvas Arena & Live Action Ticker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Canvas Arena (2 Cols) */}
        <div className="lg:col-span-2 fantasy-panel p-2 flex justify-center items-center relative overflow-hidden bg-slate-950">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full h-auto rounded-lg border border-slate-800"
          />

          {/* Victory Overlay */}
          {battleState === 'VICTORY' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <Trophy className="w-16 h-16 text-amber-400 mb-2 animate-bounce" />
              <h3 className="text-3xl font-bold font-serif text-amber-200 mb-2">VICTORY IS YOURS!</h3>
              <p className="text-sm text-slate-300 mb-6">Your party team defeated all enemies!</p>
              <button
                onClick={() => onBattleComplete(true)}
                className="fantasy-button-gold px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl"
              >
                Return to Campaign
              </button>
            </div>
          )}

          {/* Defeat Overlay - Total Party Wipeout */}
          {battleState === 'DEFEAT' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto animate-pulse shadow-xl">
                <Skull className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-red-400 tracking-wide">
                  THE PARTY DIED. EVIL HAS TRIUMPHED.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Your hero and companions were slain in battle. Darkness spreads across Aethelgard. You must start over fresh with a new character.
                </p>
              </div>

              <div className="pt-3 w-full max-w-xs">
                <button
                  onClick={() => onBattleComplete(false)}
                  className="w-full fantasy-button-crimson py-3 px-6 rounded-xl font-bold text-sm shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span>Start Over as a New Hero</span>
                </button>
              </div>
            </div>
          )}

          {/* Retreat / Fled Overlay */}
          {battleState === 'RETREATED' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
                <Footprints className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-300 tracking-wide">
                  PARTY RETREATED SAFELY!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Your hero and companions fell back to safety and escaped from the battlefield to live and fight another day!
                </p>
              </div>

              <div className="pt-3 w-full max-w-xs">
                <button
                  onClick={() => onBattleComplete(false, 'RETREATED')}
                  className="w-full fantasy-button-gold py-3 px-6 rounded-xl font-bold text-sm shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Footprints className="w-4 h-4" />
                  <span>Return to Overland Map</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Combat Ticker Logs */}
        <div className="fantasy-panel p-4 flex flex-col h-[400px] bg-slate-950">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
            <h3 className="text-xs font-bold font-serif text-amber-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Combat Action Ticker</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Updates</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {combatLogs.length === 0 ? (
              <p className="text-slate-500 italic text-center py-10">Combat starting...</p>
            ) : (
              combatLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border text-left leading-relaxed ${
                    log.includes('VICTORY')
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 font-bold'
                      : log.includes('DEFEAT')
                      ? 'bg-red-950/80 border-red-500/40 text-red-200 font-bold'
                      : log.includes('STANCE')
                      ? 'bg-amber-950/90 border-amber-500/40 text-amber-200 font-bold'
                      : log.includes('RETREAT') || log.includes('BLOCKED')
                      ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 font-bold'
                      : log.includes('MONSTER')
                      ? 'bg-red-950/40 border-red-500/30 text-red-300 font-semibold'
                      : log.includes('✨')
                      ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300'
                      : log.includes('🔥') || log.includes('⚡')
                      ? 'bg-amber-950/30 border-amber-500/20 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate map obstacles (Trees, Rocks, Pillars) based on encounter environment
function getArenaObstacles(encounterKey) {
  if (encounterKey === 'harpy_pack' || encounterKey === 'sunken_ruins') {
    return [
      { id: 'p1', type: 'pillar', name: 'Stone Temple Pillar', x: 260, y: 120, radius: 24, icon: '🏛️', color: '#94a3b8' },
      { id: 'p2', type: 'pillar', name: 'Ruined Column', x: 380, y: 270, radius: 24, icon: '🏛️', color: '#64748b' },
      { id: 'r1', type: 'rock', name: 'Sunken Relic', x: 320, y: 195, radius: 22, icon: '🪨', color: '#475569' }
    ];
  }
  if (encounterKey === 'iron_golem_guard' || encounterKey === 'obsidian_forge') {
    return [
      { id: 'm1', type: 'magma_spire', name: 'Obsidian Spire', x: 280, y: 110, radius: 26, icon: '🌋', color: '#dc2626' },
      { id: 'm2', type: 'magma_spire', name: 'Lava Rock', x: 360, y: 280, radius: 24, icon: '🌋', color: '#b91c1c' },
      { id: 'r1', type: 'rock', name: 'Iron Anvil Boulder', x: 320, y: 190, radius: 22, icon: '🪨', color: '#334155' }
    ];
  }
  if (encounterKey === 'nether_dragon_boss') {
    return [
      { id: 'd1', type: 'magma_spire', name: 'Caldera Dragon Peak', x: 270, y: 100, radius: 28, icon: '🌋', color: '#ef4444' },
      { id: 'd2', type: 'magma_spire', name: 'Obsidian Crag', x: 370, y: 300, radius: 28, icon: '🌋', color: '#b91c1c' },
      { id: 'r1', type: 'rock', name: 'Magma Rock', x: 320, y: 200, radius: 24, icon: '🪨', color: '#475569' }
    ];
  }
  // Default Forest / Goblin Patrol
  return [
    { id: 't1', type: 'tree', name: 'Ancient Oak', x: 270, y: 110, radius: 24, icon: '🌳', color: '#15803d' },
    { id: 't2', type: 'tree', name: 'Pine Tree', x: 370, y: 280, radius: 22, icon: '🌲', color: '#166534' },
    { id: 'r1', type: 'rock', name: 'Mossy Boulder', x: 320, y: 195, radius: 20, icon: '🪨', color: '#475569' },
    { id: 'b1', type: 'bush', name: 'Forest Bramble', x: 210, y: 300, radius: 16, icon: '🌿', color: '#16a34a' }
  ];
}

// Render background terrain per encounter
function renderArenaTerrain(ctx, w, h, encounterKey) {
  if (encounterKey === 'iron_golem_guard' || encounterKey === 'nether_dragon_boss') {
    // Volcanic Magma Terrain
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.beginPath();
    ctx.arc(320, 200, 180, 0, Math.PI * 2);
    ctx.fill();

    // Magma Streams
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(100, 0);
    ctx.quadraticCurveTo(250, 200, 640, 320);
    ctx.stroke();
  } else if (encounterKey === 'harpy_pack') {
    // Ruined High Sanctuary
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.fillRect(40, 40, 560, 320);
  } else {
    // Whispering Woods Mossy Grass
    ctx.fillStyle = '#05180f';
    ctx.fillRect(0, 0, w, h);

    // Patchy grass texture
    ctx.fillStyle = 'rgba(21, 128, 61, 0.15)';
    ctx.beginPath();
    ctx.arc(200, 150, 120, 0, Math.PI * 2);
    ctx.arc(440, 250, 140, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grid overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}
