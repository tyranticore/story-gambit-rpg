import React, { useState, useEffect } from 'react';
import { HERO_CLASSES } from '../data/heroClasses';
import { Shield, Zap, Crosshair, Sparkles, Heart, Sun, CheckCircle, ChevronRight, ChevronDown, ChevronUp, User, Cloud, Upload, Lock } from 'lucide-react';
import { loadGoogleCloudProfile } from '../engine/saveManager';
import { signInWithGoogle, onAuthChange } from '../engine/firebaseConfig';
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
  const [mode, setMode] = useState(null); // null (hidden), 'new', or 'load'
  const [selectedClassId, setSelectedClassId] = useState('warrior');
  const [heroName, setHeroName] = useState('Valerius');

  // Auth & Load state
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loadStatus, setLoadStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedClass = HERO_CLASSES[selectedClassId] || HERO_CLASSES.warrior;

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartNewJourney = () => {
    audioManager.playClick();
    audioManager.playVictory();
    onSelectHero({
      name: heroName.trim() || 'Hero Commander',
      classId: selectedClassId,
      baseClass: selectedClass
    });
  };

  const handleSignInGoogle = async () => {
    audioManager.playClick();
    setLoading(true);
    setLoadStatus('Signing in with Google...');
    try {
      const signedIn = await signInWithGoogle();
      setUser(signedIn);
      setLoadStatus(`✅ Signed in as ${signedIn.displayName || signedIn.email}`);
    } catch (err) {
      setLoadStatus(`❌ Sign-in notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadCloudSave = async () => {
    audioManager.playClick();
    if (!user) {
      setLoadStatus('❌ Please sign in with Google first.');
      return;
    }
    setLoading(true);
    setLoadStatus(`Loading saved game for ${user.displayName || user.email}...`);

    try {
      const loaded = await loadGoogleCloudProfile(user);
      onLoadSaveState(loaded);
      setLoadStatus(`✅ Cloud save loaded successfully!`);
    } catch (err) {
      setLoadStatus(`❌ Load notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 my-4">
      {/* Landing Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>The Branching Gambit • Branching Narrative RPG</span>
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
          onClick={() => {
            audioManager.playClick();
            setMode(prev => prev === 'new' ? null : 'new');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 group ${
            mode === 'new'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
            <span>Create New Hero</span>
          </div>
          {mode === 'new' ? (
            <ChevronUp className="w-4 h-4 transition-transform duration-200 text-slate-950 font-bold" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform duration-200 text-amber-400/80 group-hover:text-amber-300" />
          )}
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            setMode(prev => prev === 'load' ? null : 'load');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-2 group ${
            mode === 'load'
              ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
            <span>Load Saved Game</span>
          </div>
          {mode === 'load' ? (
            <ChevronUp className="w-4 h-4 transition-transform duration-200 text-slate-950 font-bold" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform duration-200 text-amber-400/80 group-hover:text-amber-300" />
          )}
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

      {/* MODE 2: LOAD SAVED GAME (SECURE GOOGLE CLOUD) */}
      {mode === 'load' && (
        <div className="fantasy-panel max-w-2xl mx-auto p-6 space-y-6 border-amber-500/40 animate-fade-in shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-amber-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-400" />
              <span>Load Saved Game from Google Cloud</span>
            </h3>

            <p className="text-xs text-slate-300">
              Sign in with your Google account to fetch your private, encrypted Cloud save state!
            </p>

            {authChecking ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs text-amber-300 font-mono">
                Checking Google sign-in status...
              </div>
            ) : !user ? (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center space-y-4">
                <p className="text-xs text-slate-400">
                  You are not currently signed in. Authenticate with your Google account to load your save file.
                </p>
                <button
                  disabled={loading}
                  onClick={handleSignInGoogle}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-2 transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-200 font-semibold">Account:</span>
                    <span className="text-amber-300 font-bold">{user.displayName || user.email}</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px] font-bold">Authenticated</span>
                </div>

                <button
                  disabled={loading}
                  onClick={handleLoadCloudSave}
                  className="w-full fantasy-button-gold py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                >
                  <Upload className="w-4 h-4" />
                  <span>Load Cloud Save Game for {user.displayName || user.email}</span>
                </button>
              </div>
            )}

            {loadStatus && <p className="text-xs text-center font-mono font-semibold text-amber-400 pt-2">{loadStatus}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
