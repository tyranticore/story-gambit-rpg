import React from 'react';
import { BookOpen, Map, Zap, Backpack, Save, Volume2, VolumeX, Shield, Sparkles, Users, UserCheck, Lock, Scroll } from 'lucide-react';
import { MAP_NODES } from '../data/mapNodes';
import { audioManager } from '../engine/audioManager';
import { GAME_VERSION } from '../version';

export default function Navbar({ activeTab, setActiveTab, gameState, onOpenSaveModal, onOpenHeroSelect, onOpenChangelog, hasChosenHero }) {
  const [muted, setMuted] = React.useState(false);

  const toggleSound = () => {
    audioManager.muted = !muted;
    setMuted(!muted);
    if (!muted) audioManager.playClick();
  };

  const player = gameState?.player || { name: 'Hero', hp: 160, maxHp: 160, mp: 40, maxMp: 40, gold: 120 };
  const currentMapNodeId = gameState?.currentMapNodeId || 'oakhaven';
  const currentMapNode = MAP_NODES.find(n => n.id === currentMapNodeId);

  // Show stats bar only when a hero run is active or player has moved past initial hero select!
  const showStatsBar = hasChosenHero || activeTab !== 'hero_select';

  const navItems = [
    { id: 'hero_select', label: 'Landing', fullLabel: 'Hero Selection Landing Page', icon: Sparkles, action: () => setActiveTab('hero_select') },
    { id: 'story', label: 'Story', fullLabel: 'Story Passage & Choices', icon: BookOpen, action: () => setActiveTab('story') },
    { id: 'map', label: 'Map', fullLabel: 'Overland Realm Map', icon: Map, action: () => setActiveTab('map') },
    { id: 'party', label: 'Party', fullLabel: 'Party & Inventory Management', icon: Backpack, action: () => setActiveTab('party') },
    { id: 'gambits', label: 'Gambits', fullLabel: 'AI Gambit Tactics Editor', icon: Zap, action: () => setActiveTab('gambits') }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/30 shadow-xl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 space-y-1.5">
        
        {/* ROW 1: Branding Banner & Top Right Action Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Title */}
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('hero_select'); }}
            className="flex items-center gap-2 group text-left hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-md border border-amber-400/50 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-serif text-amber-100 tracking-wider flex items-center gap-1.5 leading-tight">
                <span>THE BRANCHING GAMBIT</span>
                <span className="text-[10px] font-mono font-normal text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Branching Narrative
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-sans tracking-wide">
                Gambit Auto-Battler • {currentMapNode ? currentMapNode.name : 'Oakhaven'}
              </p>
            </div>
          </button>

          {/* Right Action Controls (Patch Notes, Sound & Save Sync) */}
          <div className="flex items-center gap-1.5">
            {onOpenChangelog && (
              <button
                onClick={() => { audioManager.playClick(); onOpenChangelog(); }}
                className="px-2 py-1.5 text-amber-300 hover:text-amber-200 bg-slate-900 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1 text-xs font-mono font-bold"
                title={`View Patch Notes & Release History (${GAME_VERSION})`}
              >
                <Scroll className="w-3.5 h-3.5 text-amber-400" />
                <span>{GAME_VERSION}</span>
              </button>
            )}

            <button
              onClick={toggleSound}
              className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
              title={muted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => { audioManager.playClick(); onOpenSaveModal(); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-bold shadow-md border border-amber-400/30 transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* ROW 2: Front & Center Quick Stats Bar (HP, MP, Gold, Hero Name) - Hidden until Hero Chosen or Save Loaded */}
        {showStatsBar && (
          <div className="w-full bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between gap-1 text-xs font-mono shadow-inner animate-fade-in">
            <button
              onClick={() => { audioManager.playClick(); onOpenHeroSelect(); }}
              className="flex items-center gap-1 text-amber-300 font-bold hover:underline truncate max-w-[110px] sm:max-w-none"
              title="Click to open Hero Class Selection"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{player?.name || 'Hero'}</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* HP Status */}
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>HP {player?.hp ?? 160}/{player?.maxHp ?? 160}</span>
              </div>

              <div className="w-px h-3 bg-slate-700" />

              {/* MP Status */}
              <div className="flex items-center gap-1 text-blue-400 font-bold">
                <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>MP {player?.mp ?? 40}/{player?.maxMp ?? 40}</span>
              </div>

              <div className="w-px h-3 bg-slate-700" />

              {/* Gold Status */}
              <div className="text-amber-300 font-bold whitespace-nowrap">
                💰 {player?.gold ?? 120}g
              </div>
            </div>
          </div>
        )}

        {/* ROW 3: Responsive Navigation Grid */}
        <nav className="grid grid-cols-5 gap-1 bg-slate-900/90 border border-amber-500/20 p-1 rounded-xl shadow-inner w-full">
          {navItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    audioManager.playClick();
                    item.action();
                  }
                }}
                className={`py-1.5 px-1 sm:px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 text-center ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-bold'
                    : isDisabled
                    ? 'bg-slate-950/60 text-slate-600 opacity-50 cursor-not-allowed border border-slate-900'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                title={item.fullLabel}
              >
                <IconComp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
