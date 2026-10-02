import React, { useState } from 'react';
import { RECRUITABLE_NPCS } from '../data/heroClasses';
import { Users, UserPlus, MessageSquare, Check, Shield, Coins, Sparkles, X, ChevronRight, Heart, Flame } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function TavernRecruit({ playerGold, followers, onRecruitFollower, onDismissFollower, onClose }) {
  const [selectedNpcId, setSelectedNpcId] = useState(RECRUITABLE_NPCS[0].id);
  const [dialogueStage, setDialogueStage] = useState('intro'); // 'intro', 'backstory', 'offer'

  const selectedNpc = RECRUITABLE_NPCS.find(n => n.id === selectedNpcId) || RECRUITABLE_NPCS[0];
  const isAlreadyRecruited = (followers || []).some(f => f.id === selectedNpc.id);
  const maxFollowersReached = (followers || []).length >= 3;
  const canAfford = playerGold >= selectedNpc.cost;

  const handleSelectNpc = (npcId) => {
    audioManager.playClick();
    setSelectedNpcId(npcId);
    setDialogueStage('intro');
  };

  const handleRecruit = () => {
    if (isAlreadyRecruited || maxFollowersReached || !canAfford) return;
    audioManager.playClick();
    audioManager.playVictory();
    onRecruitFollower(selectedNpc);
    setDialogueStage('joined');
  };

  const handleDismiss = (followerId) => {
    audioManager.playClick();
    onDismissFollower(followerId);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="fantasy-panel p-6 border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold font-serif text-amber-100">The Oakhaven Hearthside Guild</h2>
          </div>
          <p className="text-xs text-slate-300">
            Converse with seasoned travelers by the tavern fire. Learn their backstories and persuade up to <span className="text-amber-400 font-bold">3 Followers</span> to join your party!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/20">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{playerGold} Gold</span>
          <span className="text-xs text-slate-400">| Party ({followers ? followers.length : 0}/3)</span>
        </div>
      </div>

      {/* Current Active Party Roster */}
      <div className="fantasy-panel p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Active Party Company
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Leader */}
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Leader</span>
              <span className="text-xs font-bold text-slate-100">Hero Commander</span>
            </div>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>

          {/* Followers Slots */}
          {[0, 1, 2].map((slotIdx) => {
            const follower = (followers || [])[slotIdx];

            return (
              <div
                key={slotIdx}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  follower
                    ? 'bg-slate-900 border-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800 text-slate-600 border-dashed'
                }`}
              >
                {follower ? (
                  <>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 block font-bold">Follower #{slotIdx + 1}</span>
                      <span className="text-xs font-bold text-slate-200">{follower.name}</span>
                    </div>
                    <button
                      onClick={() => handleDismiss(follower.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Dismiss Follower"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-600 font-semibold">Empty Companion Slot #{slotIdx + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tavern NPC Dialogue & Story Recruitment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tavern Patron Roster (1 Col) */}
        <div className="fantasy-panel p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tavern Hearthside Patrons
          </h4>

          {RECRUITABLE_NPCS.map(npc => {
            const isRecruited = (followers || []).some(f => f.id === npc.id);
            const isSelected = npc.id === selectedNpcId;

            return (
              <button
                key={npc.id}
                onClick={() => handleSelectNpc(npc.id)}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: npc.color }}
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

        {/* Narrative Dialogue Passage & Conversation Options (2 Cols) */}
        <div className="md:col-span-2 fantasy-panel p-6 flex flex-col justify-between border-amber-500/40 min-h-[380px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-2xl font-bold font-serif text-amber-100">{selectedNpc.name}</h3>
                <span className="text-xs text-amber-400 font-semibold uppercase">{selectedNpc.classId} • Oakhaven Patron</span>
              </div>
              <span className="text-sm font-bold text-amber-300 font-mono">Bounty Stipend: {selectedNpc.cost} Gold</span>
            </div>

            {/* Story Dialogue Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    {selectedNpc.dialogue}
                  </p>
                  {dialogueStage === 'backstory' && (
                    <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2 font-serif">
                      "I served in the High Ridge Watch before dragonfire wiped out our garrison. My blade has been idle since... but I know the weaknesses of the monsters roaming the Whispering Woods."
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Story Conversation Choices */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Conversation Response:</span>

              <div className="space-y-2">
                <button
                  onClick={() => { audioManager.playClick(); setDialogueStage('backstory'); }}
                  className="w-full text-left p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-400 text-xs text-slate-200 transition-colors flex items-center justify-between"
                >
                  <span>"Tell me about your former battles and why you seek the Nether Dragon."</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </button>

                {!isAlreadyRecruited && (
                  <button
                    disabled={maxFollowersReached || !canAfford}
                    onClick={handleRecruit}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                      maxFollowersReached || !canAfford
                        ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500/20 to-slate-900 border-amber-400 text-amber-200 hover:border-amber-300 shadow-md'
                    }`}
                  >
                    <span>
                      {!canAfford
                        ? `Offer ${selectedNpc.cost} Gold stipend (Not enough Gold)`
                        : maxFollowersReached
                        ? 'Invite to join party (Party Full - Max 3 Followers)'
                        : `"I offer ${selectedNpc.cost} Gold stipend. Join my party company!"`}
                    </span>
                    <UserPlus className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Joined Status Badge */}
          {isAlreadyRecruited && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{selectedNpc.name} has pledged allegiance and joined your party!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
