import React, { useState } from 'react';
import { HERO_CLASSES } from '../data/heroClasses';
import { Shield, Zap, Crosshair, Sparkles, Heart, Sun, CheckCircle, ChevronRight, User, Cloud, Upload, RotateCcw, KeyRound } from 'lucide-react';
import { saveCloudProfile, loadCloudProfile, getRecentProfiles, importSaveCode } from '../engine/saveManager';
import { audioManager } from '../engine/audioManager';

const ICON_MAP = {
  Shield,
  Zap,
  Crosshair,
  Sparkles,
  Heart,
  Sun
};

const getPortraitPath = (id) => {
  const normalized = (id || 'warrior').toLowerCase();
  if (normalized === 'priest') return '/assets/portraits/healer_portrait.png';
  if (normalized === 'paladin') return '/assets/portraits/cleric_portrait.png';
  return `/assets/portraits/${normalized}_portrait.png`;
};

export default function HeroSelect({ onSelectHero, onLoadSaveState }) {
  const [mode, setMode] = useState('new'); // 'new' or 'load'
  const [selectedClassId, setSelectedClassId] = useState('warrior');
  const [heroName, setHeroName] = useState('Valerius');

  // Load Profile state
  const [profileNameInput, setProfileNameInput] = useState('');
  const [loadStatus, setLoadStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [passcodeText, setPasscodeText] = useState('');

  const selectedClass = HERO_CLASSES[selectedClassId] || HERO_CLASSES.warrior;
  const recentProfiles = getRecentProfiles();

  const handleStartNewJourney = () => {
    audioManager.playClick();
    audioManager.playVictory();
    onSelectHero({
      name: heroName.trim() || 'Hero Commander',
      classId: selectedClassId,
      baseClass: selectedClass
    });
  };

  const handleLoadCloudProfile = async (targetName) => {
    const nameToLoad = targetName || profileNameInput;
    audioManager.playClick();
    if (!nameToLoad.trim()) {
      setLoadStatus('❌ Please enter a profile name.');
      return;
    }
    setLoading(true);
    setLoadStatus(`Loading profile "${nameToLoad.trim()}"...`);

    try {
      const loaded = await loadCloudProfile(nameToLoad);
      onLoadSaveState(loaded);
      setLoadStatus(`✅ Profile "${nameToLoad}" loaded successfully!`);
    } catch (err) {
      setLoadStatus(`❌ Load notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPasscode = () => {
    audioManager.playClick();
    if (!passcodeText.trim()) return;
    const loaded = importSaveCode(passcodeText);
    if (loaded) {
      onLoadSaveState(loaded);
    } else {
      setLoadStatus('❌ Invalid save passcode.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 my-4">
      {/* Landing Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Aethelgard CYOA Gambit RPG</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold font-serif text-amber-100 tracking-wide">
          WHERE YOUR JOURNEY BEGINS
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Embark on a new campaign by creating your starting hero class, or continue a saved adventure.
        </p>
      </div>

      {/* Featured Single Hero Showcase Banner Artwork */}
      <div className="fantasy-panel p-2 overflow-hidden border-amber-500/40 relative shadow-2xl rounded-2xl max-w-4xl mx-auto group">
        <img
          src="/assets/showcase/hero_showcase_banner.webp"
          alt="Aethelgard Heroes Showcase"
          className="w-full h-48 sm:h-72 md:h-96 lg:h-[420px] object-cover object-[center_top] rounded-xl shadow-lg border border-slate-800/80 group-hover:scale-[1.01] transition-transform duration-300"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute bottom-4 left-6 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-amber-500/30 text-amber-300 text-xs font-bold font-serif">
          ⚔️ Champions of Aethelgard
        </div>
      </div>

      {/* Landing Mode Selector Buttons (START NEW vs LOAD SAVE) */}
      <div className="flex justify-center gap-3 max-w-md mx-auto bg-slate-950 p-1.5 rounded-2xl border border-amber-500/30 shadow-xl">
        <button
          onClick={() => { audioManager.playClick(); setMode('new'); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'new'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Hero</span>
        </button>

        <button
          onClick={() => { audioManager.playClick(); setMode('load'); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            mode === 'load'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Load Saved Game</span>
        </button>
      </div>

      {/* MODE 1: CREATE NEW HERO CLASS */}
      {mode === 'new' && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Name Customization Input */}
          <div className="fantasy-panel p-4 max-w-md mx-auto border-amber-500/30 flex items-center gap-3 shadow-lg">
            <User className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Hero Name</label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Enter Hero Name..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-semibold text-amber-200 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 6 Hero Classes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.values(HERO_CLASSES).map(hero => {
              const IconComp = ICON_MAP[hero.badgeIcon] || Shield;
              const isSelected = hero.id === selectedClassId;

              return (
                <button
                  key={hero.id}
                  onClick={() => { audioManager.playClick(); setSelectedClassId(hero.id); }}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-48 relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400 shadow-xl shadow-amber-500/10 scale-105'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/40 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <img
                      src={getPortraitPath(hero.id)}
                      alt={hero.name}
                      className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shadow-md"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {isSelected && <CheckCircle className="w-5 h-5 text-amber-400 animate-pulse" />}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold font-serif text-amber-100 group-hover:text-amber-300">
                      {hero.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 mt-0.5">
                      {hero.role}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-emerald-400 font-semibold border-t border-slate-800/60 pt-1 flex justify-between">
                    <span>HP {hero.baseStats.maxHp}</span>
                    <span>ATK {hero.baseStats.attack}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Class Inspector & Start Adventure Action Card */}
          <div className="fantasy-panel p-6 border-amber-500/40 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={getPortraitPath(selectedClass.id)}
                  alt={selectedClass.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h3 className="text-2xl font-bold font-serif text-amber-100">{selectedClass.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold">{selectedClass.role}</p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedClass.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Health</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedClass.baseStats.maxHp} HP</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Mana</span>
                  <span className="text-sm font-bold text-blue-400">{selectedClass.baseStats.maxMp} MP</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Attack</span>
                  <span className="text-sm font-bold text-amber-400">{selectedClass.baseStats.attack} DMG</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Defense</span>
                  <span className="text-sm font-bold text-slate-300">{selectedClass.baseStats.defense} DEF</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                  Next Destination: Oakhaven Tavern
                </span>
                <p className="text-xs text-slate-400 mb-4">
                  After creating your hero, you will step into Oakhaven Tavern to converse with mercenary companions and build your 4-person party.
                </p>
              </div>

              <button
                onClick={handleStartNewJourney}
                className="w-full fantasy-button-gold py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
              >
                <span>Begin Journey as {heroName}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: LOAD SAVED GAME */}
      {mode === 'load' && (
        <div className="fantasy-panel max-w-2xl mx-auto p-6 space-y-6 border-amber-500/40 animate-fade-in shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-400" />
              <span>Load Saved Profile</span>
            </h3>

            <p className="text-xs text-slate-300">
              Enter your saved Cloud Profile Name (e.g. <span className="text-amber-300 font-bold">cycos</span>) to instantly load your exact story node, party followers, and gambits!
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Profile Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. cycos"
                  value={profileNameInput}
                  onChange={(e) => setProfileNameInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-semibold text-amber-200 focus:border-amber-400 focus:outline-none"
                />
                <button
                  disabled={loading}
                  onClick={() => handleLoadCloudProfile()}
                  className="fantasy-button-gold text-xs px-5 py-2 rounded-lg font-bold shrink-0 flex items-center gap-1 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Load Profile</span>
                </button>
              </div>
            </div>

            {/* Quick Recent Profiles */}
            {recentProfiles.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block font-semibold">Recent Saved Profiles:</span>
                <div className="flex flex-wrap gap-2">
                  {recentProfiles.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setProfileNameInput(p); handleLoadCloudProfile(p); }}
                      className="px-3 py-1.5 bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-amber-300 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Passcode Backup */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-300">Or Paste Save Text Passcode:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste passcode string..."
                  value={passcodeText}
                  onChange={(e) => setPasscodeText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={handleLoadPasscode}
                  className="fantasy-button text-xs px-3 py-1.5 rounded-lg font-bold shrink-0"
                >
                  Load Passcode
                </button>
              </div>
            </div>

            {loadStatus && <p className="text-xs text-center font-mono font-semibold text-amber-400 pt-2">{loadStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
