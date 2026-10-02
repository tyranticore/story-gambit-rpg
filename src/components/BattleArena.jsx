import React, { useEffect, useRef, useState } from 'react';
import { ENCOUNTERS } from '../data/enemyDatabase';
import { evaluateGambits } from '../engine/gambitEngine';
import { audioManager } from '../engine/audioManager';
import { Play, Pause, FastForward, Swords, Shield, Zap, Trophy, Skull, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BattleArena({ encounterKey, playerStats, playerGambits, followers, onBattleComplete }) {
  const encounter = ENCOUNTERS[encounterKey] || ENCOUNTERS.goblin_patrol;

  const [battleState, setBattleState] = useState('RUNNING'); // RUNNING, VICTORY, DEFEAT, PAUSED
  const [speed, setSpeed] = useState(1);
  const [combatLogs, setCombatLogs] = useState([]);

  const canvasRef = useRef(null);

  // Assemble full 4-unit Hero Party (Player Leader + Followers)
  const heroesRef = useRef([
    {
      id: 'player_hero',
      name: playerStats.name || 'Hero Commander',
      classId: playerStats.classId || 'warrior',
      maxHp: playerStats.maxHp || 140,
      hp: playerStats.hp || 140,
      maxMp: playerStats.maxMp || 60,
      mp: playerStats.mp || 60,
      attack: playerStats.attack || 26,
      defense: playerStats.defense || 10,
      speed: playerStats.speed || 1.1,
      range: playerStats.range || 55,
      gambits: playerGambits,
      cooldowns: {},
      x: 100,
      y: 190,
      vx: 0,
      vy: 0,
      size: 34,
      color: '#d4af37',
      role: 'Leader'
    },
    ...(followers || []).map((f, idx) => ({
      id: `follower_${f.id}`,
      name: f.name,
      classId: f.classId,
      maxHp: f.stats.maxHp,
      hp: f.stats.maxHp,
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
      x: 80,
      y: 100 + idx * 80,
      vx: 0,
      vy: 0,
      size: 30,
      color: f.color || '#3b82f6',
      role: 'Follower'
    }))
  ]);

  // Enemies
  const enemiesRef = useRef(
    encounter.enemies.map(e => ({
      ...e,
      maxHp: e.maxHp,
      hp: e.maxHp,
      maxMp: e.maxMp || 20,
      mp: e.maxMp || 20,
      cooldowns: {},
      x: 580 * (e.xRatio || 0.8),
      y: 350 * (e.yRatio || 0.5),
      vx: 0,
      vy: 0
    }))
  );

  const projectilesRef = useRef([]);
  const particlesRef = useRef([]);
  const floatingTextsRef = useRef([]);

  const addLog = (text) => {
    setCombatLogs(prev => [text, ...prev.slice(0, 18)]);
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
  }, [battleState, speed]);

  const updateGame = (dt) => {
    const heroes = heroesRef.current;
    const enemies = enemiesRef.current;
    const now = Date.now();

    const aliveHeroes = heroes.filter(h => h.hp > 0);
    const aliveEnemies = enemies.filter(e => e.hp > 0);

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

    // 1. Update Heroes (Movement + Gambits)
    aliveHeroes.forEach(hero => {
      // Passive MP Regen
      if (hero.mp < hero.maxMp) hero.mp = Math.min(hero.maxMp, hero.mp + 5 * dt);

      // Evaluate Gambits
      const decision = evaluateGambits(hero, aliveHeroes, aliveEnemies);
      if (decision) {
        const { target, actionDef } = decision;
        const dist = getDistance(hero, target);
        const effectiveRange = actionDef.id === 'ATTACK' ? (hero.range || 55) : 220;

        // Position / Movement logic
        if (dist > effectiveRange) {
          moveTowards(hero, target, 90 * (hero.speed || 1.0), dt);
        } else {
          executeAction(hero, target, actionDef, true);
          hero.cooldowns[actionDef.id] = now + (actionDef.cooldown * 1000) / speed;
        }
      }
    });

    // 2. Update Enemies (Movement + Gambits) - FIXED ENEMY AI ATTACKING!
    aliveEnemies.forEach(enemy => {
      // Passive MP Regen
      if (enemy.mp < enemy.maxMp) enemy.mp = Math.min(enemy.maxMp, enemy.mp + 4 * dt);

      const decision = evaluateGambits(enemy, aliveEnemies, aliveHeroes);
      if (decision) {
        const { target, actionDef } = decision;
        const dist = getDistance(enemy, target);
        const effectiveRange = actionDef.id === 'ATTACK' ? (enemy.range || 55) : 200;

        if (dist > effectiveRange) {
          moveTowards(enemy, target, 80 * (enemy.speed || 1.0), dt);
        } else {
          executeAction(enemy, target, actionDef, false);
          enemy.cooldowns[actionDef.id] = now + (actionDef.cooldown * 1000) / speed;
        }
      }
    });

    // 3. Update Flying Projectiles (Fireballs, Arrows, Lightning, Heal Beams)
    projectilesRef.current = projectilesRef.current.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Check hit target
      if (getDistance(p, p.target) < 20) {
        onProjectileImpact(p);
        return false;
      }
      return p.life > 0;
    });

    // 4. Update Particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      return p.life > 0;
    });

    // 5. Update Floating Combat Texts
    floatingTextsRef.current = floatingTextsRef.current.filter(ft => {
      ft.y -= 25 * dt;
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
    }
  };

  const executeAction = (attacker, target, actionDef, isHero) => {
    attacker.mp = Math.max(0, attacker.mp - actionDef.mpCost);

    if (actionDef.id === 'ATTACK') {
      // Melee Lunge animation impulse
      attacker.x += (target.x > attacker.x ? 8 : -8);

      const rawDmg = Math.max(6, attacker.attack - (target.defense || 0) * 0.4);
      const isCrit = Math.random() < 0.25;
      const dmg = Math.round(isCrit ? rawDmg * 1.6 : rawDmg);

      target.hp = Math.max(0, target.hp - dmg);
      if (isHero) audioManager.playSlash();

      addFloatingText(target.x, target.y - 20, `-${dmg}${isCrit ? ' CRIT!' : ''}`, isCrit ? '#f59e0b' : (isHero ? '#ef4444' : '#f87171'));
      addLog(`⚔️ ${attacker.name} hit ${target.name} for ${dmg} DMG!`);
      spawnParticles(target.x, target.y, '#ef4444', 8);
    } else if (actionDef.id === 'FIREBALL') {
      spawnProjectile(attacker, target, 'fireball', '#f97316');
      audioManager.playFireball();
      addLog(`🔥 ${attacker.name} launched Fireball at ${target.name}!`);
    } else if (actionDef.id === 'LIGHTNING_BOLT') {
      spawnProjectile(attacker, target, 'lightning', '#60a5fa');
      audioManager.playFireball();
      addLog(`⚡ ${attacker.name} cast Lightning Bolt at ${target.name}!`);
    } else if (actionDef.id === 'HEAL_LIGHT') {
      const healAmt = 45;
      target.hp = Math.min(target.maxHp, target.hp + healAmt);
      audioManager.playHeal();

      addFloatingText(target.x, target.y - 20, `+${healAmt} HP`, '#10b981');
      addLog(`✨ ${attacker.name} healed ${target.name} for +${healAmt} HP!`);
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
    const speedPx = 300;

    projectilesRef.current.push({
      x: attacker.x,
      y: attacker.y,
      vx: (dx / len) * speedPx,
      vy: (dy / len) * speedPx,
      target,
      type,
      color,
      attacker,
      life: 2.0
    });
  };

  const onProjectileImpact = (p) => {
    const { attacker, target, type } = p;
    if (type === 'fireball') {
      const dmg = Math.round(75 + (attacker.attack || 0) * 0.4);
      target.hp = Math.max(0, target.hp - dmg);
      addFloatingText(target.x, target.y - 20, `💥 -${dmg}`, '#f97316');
      spawnParticles(target.x, target.y, '#f97316', 16);
    } else if (type === 'lightning') {
      const dmg = 110;
      target.hp = Math.max(0, target.hp - dmg);
      addFloatingText(target.x, target.y - 20, `⚡ -${dmg}`, '#60a5fa');
      spawnParticles(target.x, target.y, '#60a5fa', 18);
    } else if (type === 'poison') {
      const dmg = 35;
      target.hp = Math.max(0, target.hp - dmg);
      addFloatingText(target.x, target.y - 20, `☣️ -${dmg}`, '#c084fc');
      spawnParticles(target.x, target.y, '#a855f7', 10);
    }
  };

  const addFloatingText = (x, y, text, color) => {
    floatingTextsRef.current.push({ x, y, text, color, life: 1.2 });
  };

  const spawnParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 120,
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

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    // Floor Grid
    ctx.strokeStyle = '#1e293b';
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

    // Render Heroes
    heroesRef.current.forEach(hero => {
      if (hero.hp > 0) drawUnit(ctx, hero, true);
    });

    // Render Enemies
    enemiesRef.current.forEach(enemy => {
      if (enemy.hp > 0) drawUnit(ctx, enemy, false);
    });

    // Render Flying Projectiles
    projectilesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      // Tail glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Render Particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Floating Text
    floatingTextsRef.current.forEach(ft => {
      ctx.font = 'bold 13px system-ui';
      ctx.fillStyle = ft.color;
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x - 15, ft.y);
      ctx.shadowBlur = 0;
    });
  };

  const drawUnit = (ctx, unit, isHero) => {
    const { x, y, size, color, hp, maxHp, name } = unit;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.45, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Sprite Circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHero ? '#fcd34d' : '#f87171';
    ctx.lineWidth = isHero ? 2.5 : 1.5;
    ctx.stroke();

    // Unit Name Label
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - size * 0.7);

    // Health Bar
    const barW = 46;
    const barH = 5;
    const barX = x - barW / 2;
    const barY = y + size * 0.6;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(barX, barY, barW, barH);

    const hpPct = Math.max(0, hp / maxHp);
    ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : hpPct > 0.2 ? '#f59e0b' : '#ef4444';
    ctx.fillRect(barX, barY, barW * hpPct, barH);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="fantasy-panel p-4 flex flex-wrap items-center justify-between gap-3 border-red-500/30 bg-slate-950/90">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-400 animate-pulse" />
          <h2 className="text-lg font-bold font-serif text-amber-100">{encounter.name}</h2>
          <span className="text-xs text-amber-400 font-mono">({heroesRef.current.length} Heroes vs {enemiesRef.current.length} Enemies)</span>
        </div>

        {/* Speed & Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSpeed(speed === 1 ? 2 : 1)}
            className="fantasy-button text-xs px-2.5 py-1 font-mono"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{speed}x Speed</span>
          </button>

          <button
            onClick={() => setBattleState(battleState === 'PAUSED' ? 'RUNNING' : 'PAUSED')}
            className="fantasy-button text-xs px-2.5 py-1"
          >
            {battleState === 'PAUSED' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{battleState === 'PAUSED' ? 'Resume' : 'Pause'}</span>
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

          {/* Defeat Overlay */}
          {battleState === 'DEFEAT' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <Skull className="w-16 h-16 text-red-500 mb-2" />
              <h3 className="text-3xl font-bold font-serif text-red-300 mb-2">PARTY FELL IN BATTLE</h3>
              <p className="text-sm text-slate-300 mb-6">Revive at camp and adjust your Party Gambits.</p>
              <button
                onClick={() => onBattleComplete(false)}
                className="fantasy-button-crimson px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl"
              >
                Revive Party & Retry
              </button>
            </div>
          )}
        </div>

        {/* Combat Ticker Logs */}
        <div className="fantasy-panel p-4 flex flex-col h-[400px] bg-slate-950">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            <span>Party Combat Ticker</span>
          </h4>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs font-mono text-slate-300">
            {combatLogs.map((log, idx) => (
              <div key={idx} className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 leading-tight">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
