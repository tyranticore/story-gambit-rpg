import React, { useState } from 'react';
import { Backpack, Shield, Zap, Sparkles, Coins, Plus, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export const ITEM_CATALOG = {
  // Head
  iron_helm: { id: 'iron_helm', name: 'Iron Sallet Helm', slot: 'head', defense: 6, hp: 20 },
  shadow_cowl: { id: 'shadow_cowl', name: 'Shadow Cowl', slot: 'head', defense: 3, speed: 0.2 },
  wizard_hat: { id: 'wizard_hat', name: 'Pointed Arcane Hat', slot: 'head', mp: 30, attack: 5 },
  circlet_of_life: { id: 'circlet_of_life', name: 'Circlet of Life', slot: 'head', hp: 35, mp: 20 },
  ranger_hood: { id: 'ranger_hood', name: 'Sylvan Hood', slot: 'head', defense: 4, speed: 0.1 },

  // Shoulders
  iron_pauldrons: { id: 'iron_pauldrons', name: 'Iron Pauldrons', slot: 'shoulders', defense: 4, hp: 15 },
  cleric_pauldrons: { id: 'cleric_pauldrons', name: 'Radiant Pauldrons', slot: 'shoulders', defense: 5, mp: 10 },

  // Neck
  ruby_pendant: { id: 'ruby_pendant', name: 'Ruby Amulet of Might', slot: 'neck', attack: 8, hp: 25 },
  barrier_rune: { id: 'barrier_rune', name: 'Arcane Barrier Rune', slot: 'neck', defense: 15, mp: 20 },

  // Chest
  chainmail_plate: { id: 'chainmail_plate', name: 'Heavy Chainmail Plate', slot: 'chest', defense: 12, hp: 50 },
  leather_jerkin: { id: 'leather_jerkin', name: 'Hardened Leather Jerkin', slot: 'chest', defense: 6, speed: 0.3 },
  silk_robes: { id: 'silk_robes', name: 'Enchanted Silk Robes', slot: 'chest', mp: 60, defense: 4 },
  blessed_robes: { id: 'blessed_robes', name: 'Blessed Vestments', slot: 'chest', hp: 40, mp: 35 },
  padded_tunic: { id: 'padded_tunic', name: 'Sylvan Padded Tunic', slot: 'chest', defense: 7, speed: 0.2 },

  // Hands
  iron_gauntlets: { id: 'iron_gauntlets', name: 'Iron Gauntlets', slot: 'hands', defense: 3, attack: 3 },
  leather_gloves: { id: 'leather_gloves', name: 'Leather Dagger Gloves', slot: 'hands', speed: 0.2, attack: 4 },
  silk_wraps: { id: 'silk_wraps', name: 'Silk Spell Wraps', slot: 'hands', mp: 20, attack: 5 },
  blessed_gloves: { id: 'blessed_gloves', name: 'Blessed Gloves', slot: 'hands', hp: 20, mp: 15 },
  archer_gloves: { id: 'archer_gloves', name: 'Archer Bracers', slot: 'hands', attack: 5, speed: 0.1 },

  // Belt
  warrior_belt: { id: 'warrior_belt', name: 'Gilded Plate Belt', slot: 'belt', defense: 3, hp: 20 },
  leather_belt: { id: 'leather_belt', name: 'Thief Utility Sash', slot: 'belt', speed: 0.2 },
  arcane_sash: { id: 'arcane_sash', name: 'Arcane Runed Sash', slot: 'belt', mp: 25 },
  holy_sash: { id: 'holy_sash', name: 'Blessed White Sash', slot: 'belt', hp: 25, mp: 15 },
  ranger_belt: { id: 'ranger_belt', name: 'Ranger Leather Belt', slot: 'belt', defense: 2, speed: 0.1 },

  // Legs
  plate_greaves: { id: 'plate_greaves', name: 'Heavy Steel Greaves', slot: 'legs', defense: 6, hp: 25 },
  leather_pants: { id: 'leather_pants', name: 'Agile Leather Leggings', slot: 'legs', defense: 3, speed: 0.2 },
  silk_pants: { id: 'silk_pants', name: 'Silk Spell Pants', slot: 'legs', mp: 30, defense: 2 },
  padded_pants: { id: 'padded_pants', name: 'Ranger Padded Leggings', slot: 'legs', defense: 4, speed: 0.1 },
  linen_pants: { id: 'linen_pants', name: 'Linen Priest Robes', slot: 'legs', hp: 20, mp: 20 },

  // Rings
  mana_ring: { id: 'mana_ring', name: 'Ring of Mana Flux', slot: 'ring1' },
  poison_pouch: { id: 'poison_pouch', name: 'Viper Poison Pouch', slot: 'ring1' },
  dragonslayer_sigil: { id: 'dragonslayer_sigil', name: 'Dragonslayer Sigil', slot: 'ring2' },

  // Weapons & Offhands
  sun_steel_sword: { id: 'sun_steel_sword', name: 'Sun-Steel Longsword', slot: 'weapon', attack: 14, hp: 20 },
  twin_daggers: { id: 'twin_daggers', name: 'Venom Twin Daggers', slot: 'weapon', attack: 16, speed: 0.4 },
  crystal_staff: { id: 'crystal_staff', name: 'Arcane Crystal Staff', slot: 'weapon', attack: 20, mp: 50 },
  longbow: { id: 'longbow', name: 'Shadowwood Longbow', slot: 'weapon', attack: 18, range: 40 },
  healing_mace: { id: 'healing_mace', name: 'Blessed Healing Mace', slot: 'weapon', attack: 10, mp: 35, hp: 30 },
  warhammer: { id: 'warhammer', name: 'Holy Warhammer', slot: 'weapon', attack: 18, defense: 5 },

  tower_shield: { id: 'tower_shield', name: 'Obsidian Tower Shield', slot: 'offhand', defense: 10, hp: 40 },
  quiver: { id: 'quiver', name: 'Quiver of Swiftness', slot: 'offhand', attack: 5, speed: 0.2 },
  spellbook: { id: 'spellbook', name: 'Grimoire of Fire', slot: 'offhand', attack: 10, mp: 25 },
  tome_of_light: { id: 'tome_of_light', name: 'Tome of Divine Light', slot: 'offhand', mp: 30, hp: 25 },
  sunken_key: { id: 'sunken_key', name: 'Sunken Key of Aethelgard', slot: 'consumable' },
  citadel_pass: { id: 'citadel_pass', name: 'Obsidian Citadel Passcard', slot: 'consumable' }
};

export default function PaperDollInventory({ playerStats, followers, sharedBag, onEquipItemToChar, onUnequipSlotFromChar }) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0); // 0 = Leader, 1-3 = Followers

  const partyMembers = [
    { ...playerStats, isLeader: true },
    ...(followers || []).map(f => ({ ...f, isLeader: false }))
  ];

  const currentChar = partyMembers[selectedCharIndex] || partyMembers[0];
  const paperDoll = currentChar.paperDoll || {};

  const handleEquip = (itemId) => {
    audioManager.playClick();
    onEquipItemToChar(selectedCharIndex, itemId);
  };

  const handleUnequip = (slotName) => {
    audioManager.playClick();
    onUnequipSlotFromChar(selectedCharIndex, slotName);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Party Member Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-500/20">
        {partyMembers.map((member, idx) => (
          <button
            key={idx}
            onClick={() => { audioManager.playClick(); setSelectedCharIndex(idx); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap border ${
              selectedCharIndex === idx
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: member.color || '#d4af37' }}
            />
            <span>{member.name} {member.isLeader ? '(Leader)' : `(${member.classId || 'Follower'})`}</span>
          </button>
        ))}
      </div>

      {/* PAPER DOLL & STATS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Humanoid Paper Doll Image & 9 Gear Slots Matrix (2 Cols) */}
        <div className="lg:col-span-2 fantasy-panel p-6 border-amber-500/30 flex flex-col items-center justify-between min-h-[480px] relative">
          <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Paper Doll Equipment Matrix: {currentChar.name}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Click gear slot to unequip to bag</span>
          </div>

          {/* Central Silhouette Canvas & Gear Slots */}
          <div className="relative w-80 h-[360px] bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl overflow-hidden my-2">
            
            {/* Generated Human Silhouette Background Asset */}
            <img
              src="/paper_doll_silhouette.jpg"
              alt="Human Paper Doll Silhouette"
              className="w-48 h-full object-contain opacity-40 mix-blend-screen pointer-events-none select-none"
            />

            {/* 1. HEAD (Top Center) */}
            <DollSlot slot="head" label="Head" item={ITEM_CATALOG[paperDoll.head]} onUnequip={() => handleUnequip('head')} className="absolute top-2 left-1/2 -translate-x-1/2" />

            {/* 2. SHOULDERS (Top Left) */}
            <DollSlot slot="shoulders" label="Shoulders" item={ITEM_CATALOG[paperDoll.shoulders]} onUnequip={() => handleUnequip('shoulders')} className="absolute top-12 left-6" />

            {/* 3. NECK (Top Right) */}
            <DollSlot slot="neck" label="Neck" item={ITEM_CATALOG[paperDoll.neck]} onUnequip={() => handleUnequip('neck')} className="absolute top-12 right-6" />

            {/* 4. CHEST (Upper Center) */}
            <DollSlot slot="chest" label="Chest" item={ITEM_CATALOG[paperDoll.chest]} onUnequip={() => handleUnequip('chest')} className="absolute top-24 left-1/2 -translate-x-1/2" />

            {/* 5. MAIN HAND WEAPON (Far Left) */}
            <DollSlot slot="weapon" label="Weapon" item={ITEM_CATALOG[paperDoll.weapon]} onUnequip={() => handleUnequip('weapon')} className="absolute top-28 left-2" />

            {/* 6. OFFHAND / SHIELD (Far Right) */}
            <DollSlot slot="offhand" label="Offhand" item={ITEM_CATALOG[paperDoll.offhand]} onUnequip={() => handleUnequip('offhand')} className="absolute top-28 right-2" />

            {/* 7. HANDS (Mid Left) */}
            <DollSlot slot="hands" label="Hands" item={ITEM_CATALOG[paperDoll.hands]} onUnequip={() => handleUnequip('hands')} className="absolute top-44 left-6" />

            {/* 8. BELT (Waist Center) */}
            <DollSlot slot="belt" label="Belt" item={ITEM_CATALOG[paperDoll.belt]} onUnequip={() => handleUnequip('belt')} className="absolute top-44 left-1/2 -translate-x-1/2" />

            {/* 9. LEGS (Lower Center) */}
            <DollSlot slot="legs" label="Legs" item={ITEM_CATALOG[paperDoll.legs]} onUnequip={() => handleUnequip('legs')} className="absolute top-64 left-1/2 -translate-x-1/2" />

            {/* 10. RING #1 (Bottom Left) */}
            <DollSlot slot="ring1" label="Ring #1" item={ITEM_CATALOG[paperDoll.ring1]} onUnequip={() => handleUnequip('ring1')} className="absolute bottom-2 left-6" />

            {/* 11. RING #2 (Bottom Right) */}
            <DollSlot slot="ring2" label="Ring #2" item={ITEM_CATALOG[paperDoll.ring2]} onUnequip={() => handleUnequip('ring2')} className="absolute bottom-2 right-6" />
          </div>
        </div>

        {/* Character Sheet Stats Sidebar (1 Col) */}
        <div className="fantasy-panel p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xl font-bold font-serif text-amber-100">{currentChar.name}</h3>
            <p className="text-xs text-amber-400 font-semibold">{currentChar.classId || 'Hero'} • Level {currentChar.level || 1}</p>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-bold">Max Health</span>
              <span className="font-bold text-emerald-400">{currentChar.hp} HP</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-bold">Max Mana</span>
              <span className="font-bold text-blue-400">{currentChar.mp} MP</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-bold">Attack Power</span>
              <span className="font-bold text-amber-400">{currentChar.attack} DMG</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-bold">Defense Guard</span>
              <span className="font-bold text-slate-200">{currentChar.defense} DEF</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHARED GROUP BAG INVENTORY (ONLY SHOWS UNEQUIPPED ITEMS IN BAG) */}
      <div className="fantasy-panel p-6 space-y-4 border-amber-500/30">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Backpack className="w-4 h-4" />
            <span>Shared Party Bag Inventory (Unequipped Pool)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {sharedBag ? sharedBag.length : 0} items in group bag
          </span>
        </div>

        {sharedBag && sharedBag.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {sharedBag.map((itemId, idx) => {
              const item = ITEM_CATALOG[itemId] || { id: itemId, name: itemId, slot: 'accessory' };

              return (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">{item.name}</h4>
                      <span className="text-[10px] text-amber-400/80 uppercase font-mono">{item.slot}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEquip(item.id)}
                    className="fantasy-button-gold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Equip to {currentChar.name.split(' ')[0]}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6 font-mono">
            Your group bag is empty! All items are currently equipped on party members, or explore the map to find more loot!
          </p>
        )}
      </div>
    </div>
  );
}

function DollSlot({ slot, label, item, onUnequip, className }) {
  return (
    <div className={`group relative z-20 ${className}`}>
      <button
        onClick={item ? onUnequip : undefined}
        className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border-2 transition-all shadow-lg ${
          item
            ? 'bg-amber-500/20 border-amber-400 text-amber-300 hover:border-red-400 hover:bg-red-500/20'
            : 'bg-slate-900/90 border-slate-700 text-slate-500 hover:border-amber-500/40'
        }`}
      >
        {item ? (
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
        ) : (
          <span className="text-[9px] font-bold uppercase text-slate-400">{label}</span>
        )}
      </button>

      {item && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block bg-slate-950 text-amber-200 text-[10px] font-mono px-2.5 py-1 rounded border border-amber-400 whitespace-nowrap z-30 shadow-2xl">
          {item.name} (Click to unequip to bag)
        </div>
      )}
    </div>
  );
}
