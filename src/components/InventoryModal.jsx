import React from 'react';
import { Backpack, Shield, Zap, Sword, Award, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

const ITEM_DATABASE = {
  sun_steel_sword: { name: 'Sun-Steel Longsword', type: 'Weapon', bonus: '+5 Attack, +20 Max HP', icon: 'Sword' },
  arcane_grimoire: { name: 'Arcane Grimoire', type: 'Relic', bonus: '+40 Max MP, Fireball Spell', icon: 'Sparkles' },
  shadow_bow: { name: 'Shadow Bow', type: 'Ranged', bonus: '+1.5 Speed, Poison Dart', icon: 'Award' },
  health_potion: { name: 'Minor Health Potion x3', type: 'Consumable', bonus: 'Restores +40 HP', icon: 'Shield' },
  sunken_key: { name: 'Sunken Key of Aethelgard', type: 'Quest Item', bonus: 'Unlocks Sunken Temple', icon: 'Coins' },
  barrier_rune: { name: 'Arcane Barrier Rune', type: 'Relic', bonus: '+15 Defense', icon: 'Shield' },
  citadel_pass: { name: 'Obsidian Passcard', type: 'Quest Item', bonus: 'Access to Ironclad Keep', icon: 'Award' },
  dragonslayer_sigil: { name: 'Dragonslayer Sigil', type: 'Legendary', bonus: '+30 Attack, +100 Max HP', icon: 'Sparkles' }
};

export default function InventoryModal({ playerStats }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Character Profile Card */}
      <div className="fantasy-panel p-6 border-amber-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-500/20">
          <div>
            <h2 className="text-2xl font-bold font-serif text-amber-100">{playerStats.name}</h2>
            <p className="text-xs text-amber-400 font-semibold">{playerStats.class} • Level {playerStats.level}</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-amber-500/20">
            <Coins className="w-5 h-5 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Treasury Gold</span>
              <span className="text-sm font-bold text-amber-300">{playerStats.gold} Gold Coins</span>
            </div>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Max Health</span>
            <span className="text-lg font-bold text-emerald-400">{playerStats.hp} / {playerStats.maxHp} HP</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Max Mana</span>
            <span className="text-lg font-bold text-blue-400">{playerStats.mp} / {playerStats.maxMp} MP</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Attack Power</span>
            <span className="text-lg font-bold text-amber-400">{playerStats.attack} DMG</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Defense Guard</span>
            <span className="text-lg font-bold text-slate-300">{playerStats.defense} DEF</span>
          </div>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="fantasy-panel p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Backpack className="w-4 h-4" />
          <span>Equipped Artifacts & Quest Inventory</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {playerStats.inventory.map((itemId, idx) => {
            const item = ITEM_DATABASE[itemId] || { name: itemId, type: 'Item', bonus: 'Equipped', icon: 'Award' };

            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{item.name}</h4>
                  <p className="text-xs text-amber-400/80 font-mono">{item.bonus}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
