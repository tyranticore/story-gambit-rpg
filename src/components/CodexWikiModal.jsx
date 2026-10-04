import React, { useState } from 'react';
import { HERO_CLASSES } from '../data/heroClasses';
import { ENEMIES } from '../data/enemyDatabase';
import { MAP_NODES } from '../data/mapNodes';
import { BookOpen, Shield, Skull, MapPin, Search, Lock, CheckCircle2, ChevronRight, Zap, Sparkles, Heart, Crosshair, Sun, X, Award, Eye, Footprints } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

const getPortraitPath = (id) => {
  const normalized = (id || 'warrior').toLowerCase();
  if (normalized === 'priest') return '/assets/portraits/healer_portrait.png';
  if (normalized === 'paladin') return '/assets/portraits/cleric_portrait.png';
  return `/assets/portraits/${normalized}_portrait.png`;
};

export default function CodexWikiModal({ gameState, onClose }) {
  const [activeCategory, setActiveCategory] = useState('heroes'); // 'heroes', 'enemies', 'locations'
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'unlocked', 'locked'

  const discoveredCodex = gameState?.discoveredCodex || {
    heroes: [gameState?.player?.classId || 'warrior'],
    enemies: [],
    locations: gameState?.unlockedMapNodes || ['oakhaven']
  };

  // Compile lists for each category
  const heroList = Object.values(HERO_CLASSES).map(h => ({
    id: h.id,
    name: h.name,
    type: 'hero',
    role: h.role,
    description: h.description,
    data: h,
    isUnlocked: (discoveredCodex.heroes || []).includes(h.id)
  }));

  const enemyList = Object.values(ENEMIES).map(e => ({
    id: e.id,
    name: e.name,
    type: 'enemy',
    role: e.boss ? 'Boss Lord' : e.flying ? 'Flying Beast' : 'Hostile Unit',
    description: `A ${e.boss ? 'formidable boss dragon' : e.flying ? 'swift winged airborne beast' : 'ground enemy unit'} haunting the regions of Aethelgard.`,
    data: e,
    isUnlocked: (discoveredCodex.enemies || []).includes(e.id)
  }));

  const locationList = MAP_NODES.map(loc => ({
    id: loc.id,
    name: loc.name,
    type: 'location',
    role: loc.region || 'Aethelgard Realm',
    description: loc.description,
    data: loc,
    isUnlocked: (discoveredCodex.locations || []).includes(loc.id) || (gameState?.unlockedMapNodes || []).includes(loc.id)
  }));

  const totalEntries = heroList.length + enemyList.length + locationList.length;
  const totalUnlocked = heroList.filter(h => h.isUnlocked).length +
                        enemyList.filter(e => e.isUnlocked).length +
                        locationList.filter(l => l.isUnlocked).length;
  const discoveryPercent = Math.round((totalUnlocked / totalEntries) * 100);

  let currentCategoryList = activeCategory === 'heroes' ? heroList : activeCategory === 'enemies' ? enemyList : locationList;

  // Filter by search & unlock status
  const filteredList = currentCategoryList.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.role.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterMode === 'unlocked') return matchesSearch && entry.isUnlocked;
    if (filterMode === 'locked') return matchesSearch && !entry.isUnlocked;
    return matchesSearch;
  });

  const activeEntry = currentCategoryList.find(e => e.id === selectedEntryId) || filteredList[0] || currentCategoryList[0];

  const handleTabChange = (category) => {
    audioManager.playClick();
    setActiveCategory(category);
    setSelectedEntryId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="fantasy-panel max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden relative shadow-2xl border-amber-500/40">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-amber-500/30 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md border border-amber-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
                <span>Codex of Aethelgard</span>
                <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Realm Wiki & Lore
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Discover heroes, encounter beasts, and explore map locations to unlock realm archives.
              </p>
            </div>
          </div>

          <button
            onClick={() => { audioManager.playClick(); onClose(); }}
            className="p-2 text-slate-400 hover:text-white bg-slate-950/80 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 rounded-xl transition-all"
            title="Close Codex"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Realm Discovery Progress Meter */}
        <div className="bg-slate-950/90 px-4 sm:px-6 py-2 border-b border-slate-800 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Realm Discovery Progress:</span>
            <span className="text-amber-300 font-bold">{totalUnlocked} / {totalEntries} Entries ({discoveryPercent}%)</span>
          </div>

          <div className="w-32 sm:w-48 h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
              style={{ width: `${discoveryPercent}%` }}
            />
          </div>
        </div>

        {/* Category Navigation & Search Bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleTabChange('heroes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'heroes'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Heroes ({heroList.filter(h => h.isUnlocked).length}/{heroList.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('enemies')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'enemies'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Enemies ({enemyList.filter(e => e.isUnlocked).length}/{enemyList.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('locations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeCategory === 'locations'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Locations ({locationList.filter(l => l.isUnlocked).length}/{locationList.length})</span>
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search codex..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-36 sm:w-48"
              />
            </div>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="py-1 px-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Status</option>
              <option value="unlocked">Unlocked Only</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>
        </div>

        {/* Content Body: Split Screen (Left: Cards List, Right: Detailed Inspector) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          
          {/* LEFT LIST PANEL */}
          <div className="lg:col-span-1 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[300px] lg:max-h-none">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No entries match your search criteria.
              </div>
            ) : (
              filteredList.map(item => {
                const isSelected = activeEntry && activeEntry.id === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => { audioManager.playClick(); setSelectedEntryId(item.id); }}
                    className={`w-full group text-left p-3 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md'
                        : item.isUnlocked
                        ? 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 text-slate-200'
                        : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        item.isUnlocked
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-slate-950 text-slate-600 border-slate-900'
                      }`}>
                        {item.isUnlocked ? (
                          activeCategory === 'heroes' ? <Shield className="w-4 h-4" /> :
                          activeCategory === 'enemies' ? <Skull className="w-4 h-4" /> :
                          <MapPin className="w-4 h-4" />
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>

                      <div className="truncate">
                        <h4 className="text-sm font-bold font-serif text-slate-100 group-hover:text-amber-200 truncate">
                          {item.isUnlocked ? item.name : '??? Undiscovered'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate font-mono">
                          {item.isUnlocked ? item.role : 'Travel realm to unlock'}
                        </p>
                      </div>
                    </div>

                    {item.isUnlocked ? (
                      <span className="text-[10px] text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        Locked
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* RIGHT DETAIL INSPECTOR PANEL */}
          <div className="lg:col-span-2 overflow-y-auto p-4 sm:p-6 bg-slate-950/60">
            {activeEntry ? (
              activeEntry.isUnlocked ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Header Badge & Title */}
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-amber-500/20">
                    <div className="flex items-center gap-4">
                      {activeCategory === 'heroes' && (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-xl border-2 border-amber-300 shrink-0">
                          <img
                            src={getPortraitPath(activeEntry.data.id)}
                            alt={activeEntry.name}
                            className="w-full h-full rounded-2xl object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      {activeCategory === 'enemies' && (
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-red-500/40 flex items-center justify-center text-red-400 shadow-xl shrink-0">
                          <Skull className="w-8 h-8 animate-pulse" />
                        </div>
                      )}

                      {activeCategory === 'locations' && (
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shrink-0">
                          <MapPin className="w-8 h-8" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            {activeEntry.role}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked Entry
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100 mt-1">
                          {activeEntry.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Lore Description */}
                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-amber-400 font-mono tracking-wider">
                      📖 Archives & Lore Record
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">
                      {activeEntry.description}
                    </p>
                  </div>

                  {/* HERO STATS BREAKDOWN */}
                  {activeCategory === 'heroes' && activeEntry.data.baseStats && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        <span>Base Combat Attributes</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Health (HP)</span>
                          <span className="text-emerald-400 text-base font-bold">{activeEntry.data.baseStats.maxHp}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Mana (MP)</span>
                          <span className="text-blue-400 text-base font-bold">{activeEntry.data.baseStats.maxMp}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Attack Damage</span>
                          <span className="text-red-400 text-base font-bold">{activeEntry.data.baseStats.attack}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Defense Armor</span>
                          <span className="text-amber-400 text-base font-bold">{activeEntry.data.baseStats.defense}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Move Speed</span>
                          <span className="text-purple-400 text-base font-bold">{activeEntry.data.baseStats.speed}x</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Strike Range</span>
                          <span className="text-cyan-400 text-base font-bold">{activeEntry.data.baseStats.range}px</span>
                        </div>
                      </div>

                      {/* Default Gambits */}
                      {activeEntry.data.starterGambits && (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-bold text-amber-300 font-mono uppercase">
                            ⚙️ Class AI Tactical Gambits
                          </h5>
                          <div className="space-y-1.5">
                            {activeEntry.data.starterGambits.map((g, i) => (
                              <div key={i} className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 flex items-center justify-between">
                                <span>If {g.condition} → Target {g.target}</span>
                                <span className="text-amber-400 font-bold">{g.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ENEMY STATS BREAKDOWN */}
                  {activeCategory === 'enemies' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                        <Skull className="w-4 h-4" />
                        <span>Beast Combat Profile</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Max HP</span>
                          <span className="text-emerald-400 text-base font-bold">{activeEntry.data.maxHp}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Attack Power</span>
                          <span className="text-red-400 text-base font-bold">{activeEntry.data.attack}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Defense</span>
                          <span className="text-amber-400 text-base font-bold">{activeEntry.data.defense}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Rewards</span>
                          <span className="text-amber-300 text-xs font-bold">✨{activeEntry.data.expReward} XP | 💰{activeEntry.data.goldReward}g</span>
                        </div>
                      </div>

                      {/* Enemy AI Gambits */}
                      {activeEntry.data.gambits && (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-bold text-amber-300 font-mono uppercase">
                            🔥 Hostile AI Attack Patterns
                          </h5>
                          <div className="space-y-1.5">
                            {activeEntry.data.gambits.map((g, i) => (
                              <div key={i} className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 flex items-center justify-between">
                                <span>{g.condition} → {g.target}</span>
                                <span className="text-red-400 font-bold">{g.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LOCATION BREAKDOWN */}
                  {activeCategory === 'locations' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-400 font-mono tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>Location Geography & Details</span>
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Region</span>
                          <span className="text-amber-300 font-bold">{activeEntry.data.region || 'Aethelgard'}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Danger Level</span>
                          <span className="text-red-400 font-bold">Rank {activeEntry.data.danger} / 5</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block">Settlement Type</span>
                          <span className="text-emerald-400 font-bold capitalize">{activeEntry.data.type}</span>
                        </div>
                      </div>

                      {/* Connected Paths */}
                      {activeEntry.data.connectedTo && (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                          <h5 className="text-xs font-bold text-amber-300 font-mono uppercase">
                            🗺️ Connected Travel Routes
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {activeEntry.data.connectedTo.map(nodeId => (
                              <span key={nodeId} className="text-xs font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800 text-slate-300 capitalize">
                                {nodeId.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              ) : (
                /* LOCKED ENTRY SILHOUETTE INSPECTOR */
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-fade-in my-12">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-slate-600 shadow-2xl">
                    <Lock className="w-10 h-10 text-slate-600" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-slate-400">
                    ??? Undiscovered Entry
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed font-sans">
                    {activeCategory === 'heroes'
                      ? 'Recruit or encounter this hero class during your journey across Aethelgard to unlock full class attributes, gambits, and lore.'
                      : activeCategory === 'enemies'
                      ? 'Encounter or engage this hostile beast in battle to reveal combat stats, danger attributes, and loot drops.'
                      : 'Explore and unlock this region on the Overland Map to archive location geography and travel routes.'}
                  </p>
                </div>
              )
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Select an entry from the list to view lore and attributes.
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>The Branching Gambit • Realm Compendium</span>
          <button
            onClick={() => { audioManager.playClick(); onClose(); }}
            className="fantasy-button px-4 py-1.5 text-xs font-bold rounded-lg"
          >
            Close Codex
          </button>
        </div>

      </div>
    </div>
  );
}
