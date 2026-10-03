import React, { useState } from 'react';
import { RECRUITABLE_NPCS } from '../data/heroClasses';
import { ITEM_CATALOG } from './PaperDollInventory';
import { GAMBIT_ACTIONS } from '../data/defaultGambits';
const getPortraitPath = (id) => {
  const normalized = (id || 'warrior').toLowerCase();
  if (normalized === 'priest') return '/assets/portraits/healer_portrait.png';
  if (normalized === 'paladin') return '/assets/portraits/cleric_portrait.png';
  return `/assets/portraits/${normalized}_portrait.png`;
};

export default function PartyScreen({
  gameState,
  currentMapNode,
  onEquipItemToChar,
  onUnequipSlotFromChar,
  onRecruitFollower,
  onDismissFollower
}) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0); // 0 = Leader, 1-3 = Followers
  const [selectedNpcId, setSelectedNpcId] = useState(RECRUITABLE_NPCS[0].id);

  const player = gameState?.player || { name: 'Hero', hp: 160, maxHp: 160, mp: 40, maxMp: 40, attack: 28, defense: 10 };
  const followers = gameState?.followers || [];
  const sharedBag = gameState?.sharedBag || [];

  // Check if recruitment is available at current location
  const isTavernOrHeroNode = currentMapNode
    ? (currentMapNode.hasTavern || currentMapNode.type === 'town' || currentMapNode.type === 'mystery' || currentMapNode.type === 'safe_sanctuary')
    : true; // default true if unknown

  const partyMembers = [
    { ...player, isLeader: true, color: '#d4af37' },
    ...(followers || []).map(f => ({ ...f, isLeader: false, color: f.color || '#3b82f6' }))
  ];

  const currentChar = partyMembers[selectedCharIndex] || partyMembers[0];
  const paperDoll = currentChar.paperDoll || {};

  const maxFollowersReached = followers.length >= 3;
  const isRecruitmentAvailable = isTavernOrHeroNode && !maxFollowersReached;

  const selectedNpc = RECRUITABLE_NPCS.find(n => n.id === selectedNpcId) || RECRUITABLE_NPCS[0];
  const isAlreadyRecruited = followers.some(f => f.id === selectedNpc.id);
  const canAfford = player.gold >= selectedNpc.cost;

  // Derive available abilities/spells for the selected hero
  const classId = (currentChar.classId || 'warrior').toLowerCase();
  const classActionMap = {
    warrior: ['ATTACK', 'SHIELD_BLOCK', 'HEAL_LIGHT'],
    paladin: ['ATTACK', 'SHIELD_BLOCK', 'HEAL_LIGHT', 'LIGHTNING_BOLT'],
    mage: ['ATTACK', 'FIREBALL', 'LIGHTNING_BOLT', 'HEAL_LIGHT'],
    priest: ['ATTACK', 'HEAL_LIGHT', 'SHIELD_BLOCK', 'LIGHTNING_BOLT'],
    thief: ['ATTACK', 'POISON_DART', 'HEAL_LIGHT'],
    rogue: ['ATTACK', 'POISON_DART', 'HEAL_LIGHT'],
    archer: ['ATTACK', 'POISON_DART', 'HEAL_LIGHT']
  };

  const allowedActionIds = classActionMap[classId] || ['ATTACK', 'HEAL_LIGHT', 'FIREBALL', 'LIGHTNING_BOLT', 'SHIELD_BLOCK', 'POISON_DART'];
  const currentCharGambitActions = (currentChar.gambits || []).map(g => g.action);

  const heroAbilities = GAMBIT_ACTIONS.filter(action =>
    allowedActionIds.includes(action.id) || currentCharGambitActions.includes(action.id)
  );

  const handleSelectChar = (idx) => {
    audioManager.playClick();
    setSelectedCharIndex(idx);
  };

  const handleEquip = (itemId) => {
    audioManager.playClick();
    onEquipItemToChar(selectedCharIndex, itemId);
  };

  const handleUnequip = (slotName) => {
    audioManager.playClick();
    onUnequipSlotFromChar(selectedCharIndex, slotName);
  };

  const handleRecruit = (npc) => {
    if (isAlreadyRecruited || maxFollowersReached || player.gold < npc.cost) return;
    audioManager.playClick();
    audioManager.playVictory();
    onRecruitFollower(npc);
  };

  const handleDismiss = (followerId, e) => {
    e.stopPropagation();
    audioManager.playClick();
    onDismissFollower(followerId);
    if (selectedCharIndex >= partyMembers.length - 1) {
      setSelectedCharIndex(0);
    }
  };

  // Helper renderer for the Mercenaries for Hire card
  const renderMercenariesBox = () => (
    <div className="fantasy-panel p-6 border-amber-500/30 space-y-4 animate-fade-in shadow-xl">
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          <h3 className="text-lg font-bold font-serif text-amber-100">
            Mercenaries for Hire (Tavern Guild)
          </h3>
        </div>
        <span className="text-xs text-amber-400/90 font-mono font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
          📍 {currentMapNode ? currentMapNode.name : 'Tavern'} Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NPC List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Hearthside Patrons for Hire
          </h4>
          {RECRUITABLE_NPCS.map(npc => {
            const isRecruited = followers.some(f => f.id === npc.id);
            const isSelected = npc.id === selectedNpcId;

            return (
              <button
                key={npc.id}
                onClick={() => { audioManager.playClick(); setSelectedNpcId(npc.id); }}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={getPortraitPath(npc.classId)}
                    alt={npc.name}
                    className="w-7 h-7 rounded-lg object-cover border border-amber-500/40 shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div>
                    <h5 className="text-xs font-bold">{npc.name}</h5>
                    <span className="text-[10px] text-slate-400 uppercase">{npc.classId}</span>
                  </div>
                </div>

                {isRecruited ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    In Party
                  </span>
                ) : (
                  <span className="text-xs font-bold font-mono text-amber-400">💰 {npc.cost}g</span>
                )}
              </button>
            );
          })}
        </div>

        {/* NPC Detail & Dialogue Card */}
        <div className="md:col-span-2 bg-slate-950 p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  {selectedNpc.classId} Companion
                </span>
                <h4 className="text-lg font-bold text-amber-200">{selectedNpc.name}</h4>
              </div>
              <span className="text-sm font-bold font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
                💰 {selectedNpc.cost} Gold Hire Fee
              </span>
            </div>

            <p className="text-xs text-slate-300 italic mb-4 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{selectedNpc.dialogue?.intro || selectedNpc.backstory}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mb-4">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">HP</span>
                <span className="font-bold text-emerald-400">{selectedNpc.stats.maxHp}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MP</span>
                <span className="font-bold text-blue-400">{selectedNpc.stats.maxMp}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ATK</span>
                <span className="font-bold text-amber-400">{selectedNpc.stats.attack}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">DEF</span>
                <span className="font-bold text-purple-400">{selectedNpc.stats.defense}</span>
              </div>
            </div>
          </div>

          <div>
            {isAlreadyRecruited ? (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs text-center font-bold">
                ✅ {selectedNpc.name} is currently fighting in your active party.
              </div>
            ) : (
              <button
                onClick={() => handleRecruit(selectedNpc)}
                disabled={!canAfford}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                  canAfford
                    ? 'fantasy-button-gold text-slate-950 hover:scale-105'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {canAfford
                    ? `Persuade ${selectedNpc.name} to Join Party (💰 ${selectedNpc.cost}g)`
                    : `Need ${selectedNpc.cost - player.gold} More Gold to Hire`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="fantasy-panel p-5 sm:p-6 border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
              Party Company & Hero Inventory
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Inspect your hero & companions, manage hero inventory gear, view combat abilities, and recruit new companions at Taverns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-amber-500/20 text-xs font-mono">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-amber-300">{player.gold} Gold</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentMapNode ? currentMapNode.name : 'Oakhaven'}</span>
          </div>
        </div>
      </div>

      {/* 2. MERCENARIES FOR HIRE (PLACED AT THE TOP WHEN IN A TAVERN & RECRUITMENT IS AVAILABLE) */}
      {isRecruitmentAvailable && renderMercenariesBox()}

      {/* 3. Active Party Roster Selector Bar */}
      <div className="fantasy-panel p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Active Party Roster ({partyMembers.length}/4 Members)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Click a party member to view hero inventory & spells</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Leader Card */}
          <button
            onClick={() => handleSelectChar(0)}
            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
              selectedCharIndex === 0
                ? 'bg-amber-500/20 border-amber-400 shadow-lg scale-[1.02]'
                : 'bg-slate-950 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={getPortraitPath(player.classId)}
                alt="Leader Portrait"
                className="w-9 h-9 rounded-lg object-cover border border-amber-400 shadow-md shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="truncate">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">Leader</span>
                <h4 className="text-xs font-bold text-slate-100 truncate">{player.name || 'Hero'}</h4>
                <p className="text-[10px] text-emerald-400 font-mono">HP {player.hp}/{player.maxHp}</p>
              </div>
            </div>
            {selectedCharIndex === 0 && (
              <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded border border-amber-400/40">
                Viewing
              </span>
            )}
          </button>

          {/* Follower Cards */}
          {[0, 1, 2].map((slotIdx) => {
            const follower = (followers || [])[slotIdx];
            const charIdx = slotIdx + 1;
            const isSelected = selectedCharIndex === charIdx;

            if (follower) {
              return (
                <button
                  key={slotIdx}
                  onClick={() => handleSelectChar(charIdx)}
                  className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg scale-[1.02]'
                      : 'bg-slate-900 border-amber-500/30 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={getPortraitPath(follower.classId)}
                      alt={follower.name}
                      className="w-9 h-9 rounded-lg object-cover border border-amber-500/40 shadow-md shrink-0"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="truncate">
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">Follower #{slotIdx + 1}</span>
                      <h4 className="text-xs font-bold text-slate-100 truncate">{follower.name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">{follower.classId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded border border-amber-400/40">
                        Viewing
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDismiss(follower.id, e)}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Dismiss Companion"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </button>
              );
            }

            return (
              <div
                key={slotIdx}
                className="p-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-slate-600 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="text-[10px] font-mono text-slate-600 block">Empty Slot #{slotIdx + 1}</span>
                  <span className="font-semibold text-slate-500">Unrecruited</span>
                </div>
                <UserPlus className="w-4 h-4 text-slate-700" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Hero Inventory Matrix for Selected Character */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Humanoid Paper Doll Equipment Matrix (2 Cols) */}
        <div className="lg:col-span-2 fantasy-panel p-6 border-amber-500/30 flex flex-col items-center justify-between min-h-[480px] relative">
          <div className="flex items-center justify-between w-full border-b border-slate-800 pb-2 mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Hero Inventory: <span className="text-slate-100">{currentChar.name}</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentChar.isLeader ? 'Hero Commander' : `Follower (${currentChar.classId})`}
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Click equipped slot to unequip to bag</span>
          </div>

          {/* Central Silhouette Canvas & Gear Slots */}
          <div className="relative w-80 h-[360px] bg-slate-950/90 rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl overflow-hidden my-2">
            {/* Human Silhouette Asset */}
            <img
              src="/paper_doll_silhouette.jpg"
              alt="Human Paper Doll Silhouette"
              className="w-48 h-full object-contain opacity-40 mix-blend-screen pointer-events-none select-none"
            />

            {/* HEAD */}
            <DollSlot slot="head" label="Head" item={ITEM_CATALOG[paperDoll.head]} onUnequip={() => handleUnequip('head')} className="absolute top-2 left-1/2 -translate-x-1/2" />

            {/* SHOULDERS */}
            <DollSlot slot="shoulders" label="Shoulders" item={ITEM_CATALOG[paperDoll.shoulders]} onUnequip={() => handleUnequip('shoulders')} className="absolute top-12 left-6" />

            {/* NECK */}
            <DollSlot slot="neck" label="Neck" item={ITEM_CATALOG[paperDoll.neck]} onUnequip={() => handleUnequip('neck')} className="absolute top-12 right-6" />

            {/* CHEST */}
            <DollSlot slot="chest" label="Chest" item={ITEM_CATALOG[paperDoll.chest]} onUnequip={() => handleUnequip('chest')} className="absolute top-24 left-1/2 -translate-x-1/2" />

            {/* MAIN HAND WEAPON */}
            <DollSlot slot="weapon" label="Weapon" item={ITEM_CATALOG[paperDoll.weapon]} onUnequip={() => handleUnequip('weapon')} className="absolute top-28 left-2" />

            {/* OFFHAND */}
            <DollSlot slot="offhand" label="Offhand" item={ITEM_CATALOG[paperDoll.offhand]} onUnequip={() => handleUnequip('offhand')} className="absolute top-28 right-2" />

            {/* HANDS */}
            <DollSlot slot="hands" label="Hands" item={ITEM_CATALOG[paperDoll.hands]} onUnequip={() => handleUnequip('hands')} className="absolute top-48 left-6" />

            {/* BELT */}
            <DollSlot slot="belt" label="Belt" item={ITEM_CATALOG[paperDoll.belt]} onUnequip={() => handleUnequip('belt')} className="absolute top-48 right-6" />

            {/* LEGS */}
            <DollSlot slot="legs" label="Legs" item={ITEM_CATALOG[paperDoll.legs]} onUnequip={() => handleUnequip('legs')} className="absolute bottom-10 left-1/2 -translate-x-1/2" />

            {/* RING 1 */}
            <DollSlot slot="ring1" label="Ring 1" item={ITEM_CATALOG[paperDoll.ring1]} onUnequip={() => handleUnequip('ring1')} className="absolute bottom-2 left-16" />

            {/* RING 2 */}
            <DollSlot slot="ring2" label="Ring 2" item={ITEM_CATALOG[paperDoll.ring2]} onUnequip={() => handleUnequip('ring2')} className="absolute bottom-2 right-16" />
          </div>
        </div>

        {/* Shared Bag Pouch & Equipped Summary (1 Col) */}
        <div className="fantasy-panel p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2 mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Backpack className="w-4 h-4 text-amber-400" />
                <span>Shared Bag ({sharedBag.length} Items)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Click to equip</span>
            </div>

            {/* Shared Bag Items Grid */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sharedBag.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic text-xs bg-slate-950 rounded-xl border border-slate-800">
                  Shared Bag Pouch is empty. Discover loot on Overland Map or from story choices!
                </div>
              ) : (
                sharedBag.map((itemId, idx) => {
                  const item = ITEM_CATALOG[itemId] || { name: itemId, slot: 'trinket' };

                  return (
                    <button
                      key={idx}
                      onClick={() => handleEquip(itemId)}
                      className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-amber-500/50 hover:bg-slate-900 transition-all text-left flex items-center justify-between group"
                    >
                      <div>
                        <h5 className="text-xs font-bold text-amber-200 group-hover:text-amber-300">
                          {item.name}
                        </h5>
                        <span className="text-[10px] text-slate-400 capitalize font-mono">
                          Slot: {item.slot} {item.attack ? `• +${item.attack} ATK` : ''} {item.defense ? `• +${item.defense} DEF` : ''} {item.hp ? `• +${item.hp} HP` : ''} {item.mp ? `• +${item.mp} MP` : ''}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        Equip
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-400 italic text-center">
              Items equipped to {currentChar.name} grant permanent stat boosts during 2D Party Auto-Battles.
            </p>
          </div>
        </div>
      </div>

      {/* 5. AVAILABLE SPELLS & ABILITIES FOR SELECTED HERO */}
      <div className="fantasy-panel p-5 space-y-4 border-amber-500/30">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Spells & Combat Abilities Available for {currentChar.name} ({currentChar.classId ? currentChar.classId.toUpperCase() : 'HERO'})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Use these action IDs in the Gambit Editor
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {heroAbilities.map((action, idx) => (
            <div
              key={idx}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-2 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getActionEmoji(action.id)}</span>
                  <h4 className="text-xs font-bold text-amber-200">{action.label}</h4>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                  {action.mpCost > 0 ? (
                    <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/30">
                      ⚡ {action.mpCost} MP
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      0 MP
                    </span>
                  )}
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    ⏱️ {action.cooldown}s CD
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 italic leading-snug">
                {action.description}
              </p>

              <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">Gambit Action: <code className="text-amber-300 font-bold">{action.id}</code></span>
                <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  Ready
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. RECRUITMENT STATUS / NOTICE (WHEN NOT IN A TAVERN OR WHEN PARTY IS FULL) */}
      {!isRecruitmentAvailable && (
        <div className="fantasy-panel p-6 border-amber-500/30">
          {!isTavernOrHeroNode ? (
            /* NOT AT A TAVERN OR HERO NODE */
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-amber-200">
                Mercenary Recruitment Unavailable in the Wilderness
              </h4>
              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                New mercenary companions can be recruited when visiting <span className="text-amber-300 font-semibold">Taverns</span> (e.g. Tavern of the Gilded Raven in Oakhaven, Gilded Mining Village) or when encountering wandering heroes on the road.
              </p>
            </div>
          ) : (
            /* PARTY IS FULL */
            <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-300">
                Full Party Company (4/4 Members)
              </h4>
              <p className="text-xs text-slate-400 max-w-lg mx-auto">
                Your party is at maximum capacity with 3 Followers. Dismiss a follower in the active roster above if you wish to hire a new companion.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Single Equipment Slot Widget
function DollSlot({ slot, label, item, onUnequip, className }) {
  return (
    <div className={`${className} flex flex-col items-center group`}>
      <button
        onClick={item ? onUnequip : undefined}
        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all relative ${
          item
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md hover:scale-110 hover:border-red-400'
            : 'bg-slate-950/80 border-slate-800 text-slate-700 hover:border-amber-500/30'
        }`}
        title={item ? `${item.name} (Click to unequip)` : `Empty ${label} Slot`}
      >
        <span className="text-[10px] font-bold text-center leading-tight">
          {item ? getSlotEmoji(slot) : label}
        </span>
      </button>

      {item && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-950 border border-amber-400 text-amber-200 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl font-semibold">
          {item.name}
        </div>
      )}
    </div>
  );
}

function getSlotEmoji(slot) {
  switch (slot) {
    case 'head': return '🪖';
    case 'shoulders': return '🛡️';
    case 'neck': return '📿';
    case 'chest': return '🦺';
    case 'weapon': return '⚔️';
    case 'offhand': return '🛡️';
    case 'hands': return '🧤';
    case 'belt': return '🥋';
    case 'legs': return '👖';
    case 'ring1':
    case 'ring2': return '💍';
    default: return '📦';
  }
}

function getActionEmoji(actionId) {
  switch (actionId) {
    case 'ATTACK': return '⚔️';
    case 'FIREBALL': return '🔥';
    case 'LIGHTNING_BOLT': return '⚡';
    case 'HEAL_LIGHT': return '✨';
    case 'SHIELD_BLOCK': return '🛡️';
    case 'POISON_DART': return '☣️';
    default: return '🔮';
  }
}
