import React from 'react';
import { BookOpen, Map, Zap, Backpack, Save, Volume2, VolumeX, Shield, Sparkles, Users, UserCheck, Lock } from 'lucide-react';
import { MAP_NODES } from '../data/mapNodes';
import { audioManager } from '../engine/audioManager';

export default function Navbar({ activeTab, setActiveTab, gameState, onOpenSaveModal, onOpenHeroSelect }) {
  const [muted, setMuted] = React.useState(false);

  const toggleSound = () => {
    audioManager.muted = !muted;
    setMuted(!muted);
    if (!muted) audioManager.playClick();
  };

  const { player, followers, currentMapNodeId } = gameState;
  const currentMapNode = MAP_NODES.find(n => n.id === currentMapNodeId);
  const isTavernAvailable = currentMapNode ? currentMapNode.hasTavern : true;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 px-3 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Character Quick-Bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { audioManager.playClick(); onOpenHeroSelect(); }}
            className="flex items-center gap-2 group text-left focus:outline-none"
            title="Click to open Hero Class Selection screen"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-amber-200 tracking-wide font-serif leading-none group-hover:text-amber-400 transition-colors">
                AETHELGARD
              </h1>
              <p className="text-[10px] text-amber-400/70 uppercase tracking-widest font-semibold">
                Party Gambit RPG
              </p>
            </div>
          </button>

          {/* Quick Stats Pill - Responsive for Mobile & Desktop */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-900/90 border border-amber-500/30 rounded-full px-2.5 py-1 text-[11px] sm:text-xs shadow-inner">
            <button
              onClick={() => { audioManager.playClick(); onOpenHeroSelect(); }}
              className="hidden sm:flex items-center gap-1 text-amber-300 font-bold hover:underline shrink-0"
              title="Click to open Hero Class Selection"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{player.name} ({player.classId || 'Hero'})</span>
            </button>
            <div className="hidden sm:block w-px h-3 bg-slate-700" />
            
            {/* HP Status */}
            <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>HP {player.hp}/{player.maxHp}</span>
            </div>

            <div className="w-px h-3 bg-slate-700/80" />

            {/* MP Status */}
            <div className="flex items-center gap-1 text-blue-400 font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>MP {player.mp}/{player.maxMp}</span>
            </div>

            <div className="w-px h-3 bg-slate-700/80" />

            {/* Gold Status */}
            <div className="text-amber-300 font-bold font-mono whitespace-nowrap">
              💰 {player.gold}g
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 bg-slate-900/90 border border-amber-500/20 p-1 rounded-xl shadow-inner">
          <button
            onClick={() => { audioManager.playClick(); onOpenHeroSelect(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'hero_select'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Hero Classes</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); setActiveTab('story'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'story'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Story</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); setActiveTab('map'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Overland Map</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); setActiveTab('gambits'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'gambits'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Gambits</span>
          </button>

          {/* TAVERN TAB - Only enabled if current node has a tavern */}
          <button
            disabled={!isTavernAvailable}
            onClick={() => {
              if (isTavernAvailable) {
                audioManager.playClick();
                setActiveTab('tavern');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tavern'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : isTavernAvailable
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                : 'text-slate-600 opacity-50 cursor-not-allowed'
            }`}
            title={isTavernAvailable ? 'Visit Town Tavern' : 'Tavern only available in Town locations'}
          >
            {isTavernAvailable ? <Users className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-slate-600" />}
            <span>Tavern ({followers ? followers.length : 0}/3)</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); setActiveTab('paperdoll'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paperdoll'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Backpack className="w-4 h-4" />
            <span>Paper Doll Gear</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { audioManager.playClick(); onOpenSaveModal(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-semibold shadow-md border border-amber-400/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Profile Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
