import React from 'react';
import { INITIAL_STORY } from '../data/initialStory';
import { MAP_NODES } from '../data/mapNodes';
import { Swords, MapPin, ChevronRight, Zap, Sparkles, RefreshCw, Trophy, Users, UserPlus, Shield, Clock, CheckCircle, Gift } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function StoryView({ gameState, onMakeChoice, onTriggerBattle, onOpenMap, onOpenGambits, onOpenInventory, onOpenTavern, onOpenSaveModal, onResetCampaign, onRecruitWanderingHero }) {
  const effectivePassageId = (gameState.currentMapNodeId === 'oakhaven' && gameState.storyFlags?.oakhaven_intro_done)
    ? 'p_oakhaven_return'
    : gameState.currentPassageId;

  const currentPassage = INITIAL_STORY[effectivePassageId] || INITIAL_STORY.p_oakhaven_start;
  const currentMapNode = MAP_NODES.find(n => n.id === currentPassage.mapNodeId);

  const followers = gameState.followers || [];
  const needsMoreFollowers = followers.length < 3;
  const completedBattles = gameState.completedBattles || [];
  const claimedRewards = gameState.claimedRewards || [];

  const isBattleCleared = currentMapNode && completedBattles.includes(currentMapNode.id);
  const isRewardClaimed = (currentPassage && claimedRewards.includes(currentPassage.id)) || (currentMapNode && claimedRewards.includes(currentMapNode.id));

  // Check if a wandering hero is currently resting at this map node
  const wanderingHeroAtNode = currentMapNode
    ? (gameState.wanderingHeroes || []).find(h => h.nodeId === currentMapNode.id && !followers.some(f => f.id === h.id))
    : null;

  const handleChoiceClick = (choice) => {
    audioManager.playClick();

    if (choice.action === 'RESET_CAMPAIGN') {
      audioManager.playVictory();
      onResetCampaign();
      return;
    }

    // If battle at this node has already been won, override triggerBattle!
    if (choice.triggerBattle && isBattleCleared) {
      onOpenMap();
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

  const handleHireWanderingHero = (hero) => {
    if (gameState.player.gold < hero.cost || followers.length >= 3) return;
    audioManager.playClick();
    audioManager.playVictory();
    if (onRecruitWanderingHero) {
      onRecruitWanderingHero(hero);
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

          {isBattleCleared ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Area Cleared & Peaceful</span>
            </div>
          ) : isRewardClaimed ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 font-mono">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Reward Claimed</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Turn #{gameState.turnCounter || 0}</span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100 mb-6 tracking-wide flex items-center gap-2">
          {gameState.currentPassageId === 'p_dragon_victory' && <Trophy className="w-7 h-7 text-amber-400 animate-bounce shrink-0" />}
          <span>{currentPassage.title}</span>
        </h2>

        {/* Story Text Body */}
        <div className="prose prose-invert max-w-none text-slate-200 text-base leading-relaxed whitespace-pre-line space-y-4 mb-8 font-sans">
          {isBattleCleared
            ? `${currentPassage.content}\n\n🛡️ [Area Status]: You have already defeated the hostile forces in this region. The area remains quiet and peaceful.`
            : isRewardClaimed
            ? `${currentPassage.content}\n\n🎁 [Reward Status]: You have already collected the treasures and blessings at this location.`
            : currentPassage.content}
        </div>

        {/* Dynamic Wandering Hero Encounter Panel (If hero is resting at this node) */}
        {wanderingHeroAtNode && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 shadow-2xl space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-300">
                <Users className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>👤 Wandering Adventurer Encountered!</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Stays for {wanderingHeroAtNode.turnsRemaining} more turns</span>
                </span>
                <span className="text-emerald-400 font-bold">💰 Cost: {wanderingHeroAtNode.cost}g</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-amber-100 font-serif flex items-center gap-2">
                  <span>{wanderingHeroAtNode.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-amber-500/30 text-amber-400 uppercase font-mono font-semibold">
                    {wanderingHeroAtNode.classId}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 italic max-w-xl font-sans leading-relaxed">
                  "{wanderingHeroAtNode.quote}"
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {wanderingHeroAtNode.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {needsMoreFollowers ? (
                  <button
                    disabled={gameState.player.gold < wanderingHeroAtNode.cost}
                    onClick={() => handleHireWanderingHero(wanderingHeroAtNode)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                      gameState.player.gold >= wanderingHeroAtNode.cost
                        ? 'fantasy-button-gold hover:scale-105'
                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {gameState.player.gold >= wanderingHeroAtNode.cost
                        ? `Recruit ${wanderingHeroAtNode.name} (${wanderingHeroAtNode.cost}g)`
                        : `Need ${wanderingHeroAtNode.cost}g Gold`}
                    </span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-mono italic">Party Full (Max 3 Followers)</span>
                )}
              </div>
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
            {currentPassage.choices.map((choice, idx) => {
              const isBattleChoice = choice.triggerBattle && !isBattleCleared;
              const isClearedBattleChoice = choice.triggerBattle && isBattleCleared;

              const hasGrantingEffects = choice.effects && (choice.effects.addGold || choice.effects.addExp || choice.effects.addItem);
              const isChoiceClaimed = hasGrantingEffects && isRewardClaimed;

              return (
                <button
                  key={idx}
                  onClick={() => handleChoiceClick(choice)}
                  className={`w-full group text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between gap-4 border ${
                    choice.action === 'RESET_CAMPAIGN'
                      ? 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 border-amber-300 text-white font-bold shadow-xl hover:scale-[1.02]'
                      : isClearedBattleChoice
                      ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-semibold'
                      : isBattleChoice
                      ? 'bg-gradient-to-r from-red-950/60 to-slate-900 border-red-500/40 hover:border-red-400 hover:shadow-lg hover:shadow-red-950/40'
                      : 'bg-slate-900/80 border-amber-500/20 hover:border-amber-400/60 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      choice.action === 'RESET_CAMPAIGN'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : isClearedBattleChoice
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isBattleChoice
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {choice.action === 'RESET_CAMPAIGN' ? (
                        <RefreshCw className="w-4 h-4 animate-spin-slow" />
                      ) : isClearedBattleChoice ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : isBattleChoice ? (
                        <Swords className="w-4 h-4 animate-bounce" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-amber-200 transition-colors">
                        {isClearedBattleChoice
                          ? 'Area Cleared (Return to Overland Map)'
                          : isChoiceClaimed
                          ? `${choice.text} (Reward Already Claimed)`
                          : choice.text}
                      </span>

                      {choice.effects && !isClearedBattleChoice && (
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-400 font-mono">
                          {isChoiceClaimed ? (
                            <span className="text-amber-400/80 italic">✓ Collected</span>
                          ) : (
                            <>
                              {choice.effects.addGold && <span>+💰{choice.effects.addGold}g</span>}
                              {choice.effects.addExp && <span>+✨{choice.effects.addExp} XP</span>}
                              {choice.effects.addItem && <span>+🎒 Item</span>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-300 group-hover:translate-x-1 transition-all shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
