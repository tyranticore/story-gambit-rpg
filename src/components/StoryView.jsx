import React from 'react';
import { INITIAL_STORY } from '../data/initialStory';
import { MAP_NODES } from '../data/mapNodes';
import { WANDERING_HEROES } from '../data/heroClasses';
import { Swords, MapPin, ChevronRight, Zap, Sparkles, RefreshCw, Trophy, Users, UserPlus, Coins, Shield, Dices } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function StoryView({ gameState, onMakeChoice, onTriggerBattle, onOpenMap, onOpenGambits, onOpenInventory, onOpenTavern, onOpenSaveModal, onResetCampaign, onRecruitFollower }) {
  const currentPassage = INITIAL_STORY[gameState.currentPassageId] || INITIAL_STORY.p_oakhaven_start;
  const currentMapNode = MAP_NODES.find(n => n.id === currentPassage.mapNodeId);

  const followers = gameState.followers || [];
  const needsMoreFollowers = followers.length < 3;
  const isTownNode = currentMapNode ? currentMapNode.hasTavern : false;

  // Random Encounter Logic: ~50% chance per non-town passage when party < 3 followers
  let wanderingNpc = null;
  if (needsMoreFollowers && !isTownNode) {
    const passageHash = (gameState.currentPassageId || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const encounterTriggered = (passageHash % 100) < 50;

    if (encounterTriggered) {
      const unrecruitedWanderers = WANDERING_HEROES.filter(hero => !followers.some(f => f.id === hero.id));
      if (unrecruitedWanderers.length > 0) {
        wanderingNpc = unrecruitedWanderers[passageHash % unrecruitedWanderers.length];
      }
    }
  }

  const handleChoiceClick = (choice) => {
    audioManager.playClick();

    if (choice.action === 'RESET_CAMPAIGN') {
      audioManager.playVictory();
      onResetCampaign();
      return;
    }

    if (choice.triggerBattle) {
      onTriggerBattle(choice.triggerBattle, choice.winPassageId, choice.losePassageId);
      return;
    }

    if (choice.action === 'OPEN_TAVERN') {
      if (choice.effects) onMakeChoice(null, choice.effects);
      onOpenTavern();
      return;
    }

    if (choice.action === 'OPEN_MAP') {
      if (choice.effects) onMakeChoice(null, choice.effects);
      onOpenMap();
      return;
    }

    if (choice.action === 'OPEN_GAMBIT_EDITOR') {
      if (choice.effects) onMakeChoice(null, choice.effects);
      onOpenGambits();
      return;
    }

    if (choice.action === 'OPEN_INVENTORY') {
      if (choice.effects) onMakeChoice(null, choice.effects);
      onOpenInventory();
      return;
    }

    if (choice.action === 'OPEN_SAVE_MODAL') {
      if (choice.effects) onMakeChoice(null, choice.effects);
      onOpenSaveModal();
      return;
    }

    if (choice.nextPassageId) {
      onMakeChoice(choice.nextPassageId, choice.effects);
    }
  };

  const handleHireWanderingHero = (npc) => {
    if (gameState.player.gold < npc.cost) return;
    audioManager.playClick();
    audioManager.playVictory();
    if (onRecruitFollower) {
      onRecruitFollower(npc);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Passage Container */}
      <div className="fantasy-panel p-6 sm:p-8 relative overflow-hidden">
        {/* Background Decorative Crest */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Location Badge & Title */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentMapNode ? currentMapNode.name : 'Unknown Location'}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Chapter Passage #{gameState.currentPassageId}</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100 mb-6 tracking-wide flex items-center gap-2">
          {gameState.currentPassageId === 'p_dragon_victory' && <Trophy className="w-7 h-7 text-amber-400 animate-bounce shrink-0" />}
          <span>{currentPassage.title}</span>
        </h2>

        {/* Story Text Body */}
        <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed whitespace-pre-line space-y-4 mb-8 font-sans">
          {currentPassage.content}
        </div>

        {/* Wandering Heroes Random Encounter (If Party < 3 Followers & Non-Town Node) */}
        {needsMoreFollowers && wanderingNpc && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 border border-amber-500/50 shadow-xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
                <Dices className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span>🎲 Random Encounter: Wandering Road Mercenary (Party: {followers.length}/3 Followers)</span>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400">💰 Stipend: {wanderingNpc.cost}g</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-serif">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: wanderingNpc.color }} />
                  <span>{wanderingNpc.name}</span>
                  <span className="text-xs text-amber-400 font-semibold uppercase">({wanderingNpc.classId})</span>
                </h4>
                <p className="text-xs text-slate-300 italic mt-1 max-w-xl font-sans leading-relaxed">
                  {wanderingNpc.dialogue}
                </p>
              </div>

              <button
                disabled={gameState.player.gold < wanderingNpc.cost}
                onClick={() => handleHireWanderingHero(wanderingNpc)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  gameState.player.gold >= wanderingNpc.cost
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md hover:scale-105'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {gameState.player.gold >= wanderingNpc.cost
                    ? `Offer Stipend & Hire (${wanderingNpc.cost}g)`
                    : `Need ${wanderingNpc.cost}g Stipend`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Choices Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4" />
            <span>Choose Your Action</span>
          </h3>

          <div className="grid gap-3">
            {currentPassage.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceClick(choice)}
                className={`w-full group text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between gap-4 border ${
                  choice.action === 'RESET_CAMPAIGN'
                    ? 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 border-amber-300 text-white font-bold shadow-xl hover:scale-[1.02]'
                    : choice.triggerBattle
                    ? 'bg-gradient-to-r from-red-950/60 to-slate-900 border-red-500/40 hover:border-red-400 hover:shadow-lg hover:shadow-red-950/40'
                    : 'bg-slate-900/80 border-amber-500/20 hover:border-amber-400/60 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    choice.action === 'RESET_CAMPAIGN'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : choice.triggerBattle
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {choice.action === 'RESET_CAMPAIGN' ? <RefreshCw className="w-4 h-4 animate-spin-slow" /> : choice.triggerBattle ? <Swords className="w-4 h-4 animate-bounce" /> : idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-amber-200 transition-colors">
                      {choice.text}
                    </span>
                    {choice.effects && (
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400 font-mono">
                        {choice.effects.addGold && <span>+💰{choice.effects.addGold}g</span>}
                        {choice.effects.addExp && <span>+✨{choice.effects.addExp} XP</span>}
                        {choice.effects.addItem && <span>+🎒 Item</span>}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-300 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

