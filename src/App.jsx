import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StoryView from './components/StoryView';
import OverlandMap from './components/OverlandMap';
import GambitEditor from './components/GambitEditor';
import BattleArena from './components/BattleArena';
import SaveSyncModal from './components/SaveSyncModal';
import HeroSelect from './components/HeroSelect';
import PartyScreen from './components/PartyScreen';
import ChangelogModal from './components/ChangelogModal';
import CodexWikiModal from './components/CodexWikiModal';
import { MAP_NODES } from './data/mapNodes';
import { getInitialGameState, saveToLocalStorage, loadFromLocalStorage, sanitizeGameState, advanceMapTurn, getStoredGlobalCodex, updateStoredGlobalCodex } from './engine/saveManager';
import { INITIAL_STORY } from './data/initialStory';
import { HERO_CLASSES } from './data/heroClasses';
import { ENEMIES, ENCOUNTERS } from './data/enemyDatabase';
import { GAME_VERSION } from './version';
import { Scroll } from 'lucide-react';
import { audioManager } from './engine/audioManager';

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved || getInitialGameState('warrior');
  });

  // Hero Run active tracking (false on fresh landing screen)
  const [hasChosenHero, setHasChosenHero] = useState(false);

  // Hero Class Selection is the primary landing page!
  const [activeTab, setActiveTab] = useState('hero_select');

  const [activeBattle, setActiveBattle] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [codexModalOpen, setCodexModalOpen] = useState(false);

  // Auto-save on state change
  useEffect(() => {
    saveToLocalStorage(gameState);
  }, [gameState]);

  // Choice Handler
  const handleMakeChoice = (nextPassageId, effects) => {
    setGameState(prev => {
      let updatedPlayer = { ...prev.player };
      let updatedFlags = { ...prev.storyFlags };
      let updatedNodes = [...prev.unlockedMapNodes];
      let updatedBag = [...(prev.sharedBag || [])];
      let updatedClaimed = [...(prev.claimedRewards || [])];

      const currentPId = prev.currentPassageId;
      const currentNId = prev.currentMapNodeId;

      const hasResourceEffects = effects && (effects.addGold || effects.addExp || effects.addItem);
      const isAlreadyClaimed = updatedClaimed.includes(currentPId) || updatedClaimed.includes(currentNId);

      if (effects) {
        // Only grant resource effects ONCE per passage/location!
        if (hasResourceEffects && !isAlreadyClaimed) {
          if (effects.addGold) updatedPlayer.gold += effects.addGold;
          if (effects.addExp) {
            updatedPlayer.exp += effects.addExp;
            if (updatedPlayer.exp >= updatedPlayer.level * 100) {
              updatedPlayer.level += 1;
              updatedPlayer.maxHp += 20;
              updatedPlayer.hp = updatedPlayer.maxHp;
              updatedPlayer.maxMp += 10;
              updatedPlayer.mp = updatedPlayer.maxMp;
              updatedPlayer.attack += 5;
            }
          }
          if (effects.addItem && !updatedBag.includes(effects.addItem)) {
            updatedBag.push(effects.addItem);
          }
          if (currentPId) updatedClaimed.push(currentPId);
          if (currentNId) updatedClaimed.push(currentNId);
        }

        if (effects.setFlag) updatedFlags[effects.setFlag] = true;

        if (effects.unlockNode && !updatedNodes.includes(effects.unlockNode)) {
          updatedNodes.push(effects.unlockNode);
        }
        if (effects.unlockNode2 && !updatedNodes.includes(effects.unlockNode2)) {
          updatedNodes.push(effects.unlockNode2);
        }
        if (effects.unlockNode3 && !updatedNodes.includes(effects.unlockNode3)) {
          updatedNodes.push(effects.unlockNode3);
        }
        if (effects.unlockNode4 && !updatedNodes.includes(effects.unlockNode4)) {
          updatedNodes.push(effects.unlockNode4);
        }
      }

      const targetPassageId = nextPassageId || prev.currentPassageId;
      const passageObj = INITIAL_STORY[targetPassageId];
      const targetMapNodeId = (passageObj && passageObj.mapNodeId) ? passageObj.mapNodeId : prev.currentMapNodeId;

      const currentLocs = prev.discoveredCodex?.locations || [];
      const updatedLocations = Array.from(new Set([...currentLocs, ...updatedNodes, targetMapNodeId]));

      return {
        ...prev,
        currentPassageId: targetPassageId,
        currentMapNodeId: targetMapNodeId,
        unlockedMapNodes: updatedNodes,
        claimedRewards: Array.from(new Set(updatedClaimed)),
        storyFlags: updatedFlags,
        player: updatedPlayer,
        sharedBag: updatedBag,
        discoveredCodex: {
          ...(prev.discoveredCodex || { heroes: [prev.player.classId], enemies: [], locations: ['oakhaven'] }),
          locations: updatedLocations
        }
      };
    });
  };

  // Hero Class Selection -> Fresh New Journey with Preserved Codex Archives!
  const handleSelectHero = ({ name, classId }) => {
    const previousCodex = gameState?.discoveredCodex || getStoredGlobalCodex();
    const freshState = getInitialGameState(classId);

    const mergedCodex = {
      heroes: Array.from(new Set([...(previousCodex.heroes || []), ...freshState.discoveredCodex.heroes, classId])),
      enemies: Array.from(new Set([...(previousCodex.enemies || []), ...freshState.discoveredCodex.enemies])),
      locations: Array.from(new Set([...(previousCodex.locations || []), ...freshState.discoveredCodex.locations]))
    };

    updateStoredGlobalCodex(mergedCodex);

    setGameState({
      ...freshState,
      discoveredCodex: mergedCodex,
      player: {
        ...freshState.player,
        name: name || 'Hero Commander'
      }
    });
    setHasChosenHero(true);
    setActiveTab('story');
  };

  // Campaign Reset -> Return to Hero Selection Landing Screen while keeping Codex progress intact!
  const handleResetCampaign = () => {
    const previousCodex = gameState?.discoveredCodex || getStoredGlobalCodex();
    localStorage.removeItem('STORY_GAMBIT_RPG_SAVE_V1');

    const freshState = getInitialGameState('warrior');
    const mergedCodex = {
      heroes: Array.from(new Set([...(previousCodex.heroes || []), ...freshState.discoveredCodex.heroes])),
      enemies: Array.from(new Set([...(previousCodex.enemies || []), ...freshState.discoveredCodex.enemies])),
      locations: Array.from(new Set([...(previousCodex.locations || []), ...freshState.discoveredCodex.locations]))
    };

    updateStoredGlobalCodex(mergedCodex);

    setGameState({
      ...freshState,
      discoveredCodex: mergedCodex
    });
    setHasChosenHero(false);
    setActiveTab('hero_select');
  };

  // Recruit Follower NPC (from Tavern)
  const handleRecruitFollower = (npc) => {
    const classDef = HERO_CLASSES[npc.classId] || HERO_CLASSES.warrior;

    setGameState(prev => {
      if ((prev.followers || []).length >= 3 || prev.player.gold < npc.cost) return prev;
      const curHeroes = prev.discoveredCodex?.heroes || [];
      return {
        ...prev,
        player: { ...prev.player, gold: prev.player.gold - npc.cost },
        followers: [
          ...(prev.followers || []),
          {
            id: npc.id,
            name: npc.name,
            classId: npc.classId,
            level: 1,
            stats: npc.stats,
            color: npc.color,
            paperDoll: npc.defaultPaperDoll || classDef.defaultPaperDoll,
            gambits: classDef.starterGambits
          }
        ],
        discoveredCodex: {
          ...(prev.discoveredCodex || { heroes: [prev.player.classId], enemies: [], locations: ['oakhaven'] }),
          heroes: Array.from(new Set([...curHeroes, npc.classId]))
        }
      };
    });
  };

  // Recruit Wandering Hero Encounter (from Map Node)
  const handleRecruitWanderingHero = (hero) => {
    const classDef = HERO_CLASSES[hero.classId] || HERO_CLASSES.warrior;
    setGameState(prev => {
      const followers = prev.followers || [];
      if (followers.length >= 3 || prev.player.gold < hero.cost) return prev;
      const curHeroes = prev.discoveredCodex?.heroes || [];

      return {
        ...prev,
        player: { ...prev.player, gold: prev.player.gold - hero.cost },
        followers: [
          ...followers,
          {
            id: hero.id,
            name: hero.name,
            classId: hero.classId,
            level: 1,
            stats: hero.stats,
            color: hero.color,
            paperDoll: classDef.defaultPaperDoll,
            gambits: classDef.starterGambits
          }
        ],
        wanderingHeroes: (prev.wanderingHeroes || []).filter(h => h.id !== hero.id),
        discoveredCodex: {
          ...(prev.discoveredCodex || { heroes: [prev.player.classId], enemies: [], locations: ['oakhaven'] }),
          heroes: Array.from(new Set([...curHeroes, hero.classId]))
        }
      };
    });
  };

  // Dismiss Follower NPC
  const handleDismissFollower = (followerId) => {
    setGameState(prev => ({
      ...prev,
      followers: (prev.followers || []).filter(f => f.id !== followerId)
    }));
  };

  // Equip Item from Shared Bag to Character Paper Doll
  const handleEquipItemToChar = (charIndex, itemId) => {
    setGameState(prev => {
      let updatedBag = [...(prev.sharedBag || [])];
      const itemIdx = updatedBag.indexOf(itemId);
      if (itemIdx !== -1) updatedBag.splice(itemIdx, 1);

      if (charIndex === 0) {
        const targetSlot = itemId.includes('ring') ? (prev.player.paperDoll.ring1 ? 'ring2' : 'ring1') : getSlotType(itemId);
        const oldItem = prev.player.paperDoll[targetSlot];
        if (oldItem) updatedBag.push(oldItem);

        return {
          ...prev,
          sharedBag: updatedBag,
          player: {
            ...prev.player,
            paperDoll: { ...prev.player.paperDoll, [targetSlot]: itemId }
          }
        };
      } else {
        const updatedFollowers = [...(prev.followers || [])];
        const follower = updatedFollowers[charIndex - 1];
        if (follower) {
          const targetSlot = itemId.includes('ring') ? (follower.paperDoll.ring1 ? 'ring2' : 'ring1') : getSlotType(itemId);
          const oldItem = follower.paperDoll[targetSlot];
          if (oldItem) updatedBag.push(oldItem);

          follower.paperDoll = { ...follower.paperDoll, [targetSlot]: itemId };
        }
        return { ...prev, sharedBag: updatedBag, followers: updatedFollowers };
      }
    });
  };

  // Unequip Item from Character Paper Doll to Shared Bag
  const handleUnequipSlotFromChar = (charIndex, slotName) => {
    setGameState(prev => {
      let updatedBag = [...(prev.sharedBag || [])];

      if (charIndex === 0) {
        const unequippedItem = prev.player.paperDoll[slotName];
        if (unequippedItem) updatedBag.push(unequippedItem);

        return {
          ...prev,
          sharedBag: updatedBag,
          player: {
            ...prev.player,
            paperDoll: { ...prev.player.paperDoll, [slotName]: null }
          }
        };
      } else {
        const updatedFollowers = [...(prev.followers || [])];
        const follower = updatedFollowers[charIndex - 1];
        if (follower) {
          const unequippedItem = follower.paperDoll[slotName];
          if (unequippedItem) updatedBag.push(unequippedItem);
          follower.paperDoll = { ...follower.paperDoll, [slotName]: null };
        }
        return { ...prev, sharedBag: updatedBag, followers: updatedFollowers };
      }
    });
  };

  const getSlotType = (itemId) => {
    if (itemId.includes('helm') || itemId.includes('cowl') || itemId.includes('hat') || itemId.includes('hood') || itemId.includes('circlet')) return 'head';
    if (itemId.includes('pauldrons')) return 'shoulders';
    if (itemId.includes('pendant') || itemId.includes('rune') || itemId.includes('neck')) return 'neck';
    if (itemId.includes('plate') || itemId.includes('jerkin') || itemId.includes('robes') || itemId.includes('tunic') || itemId.includes('chest')) return 'chest';
    if (itemId.includes('gauntlets') || itemId.includes('gloves') || itemId.includes('wraps') || itemId.includes('bracers')) return 'hands';
    if (itemId.includes('belt') || itemId.includes('sash')) return 'belt';
    if (itemId.includes('greaves') || itemId.includes('pants') || itemId.includes('leggings')) return 'legs';
    if (itemId.includes('sword') || itemId.includes('daggers') || itemId.includes('staff') || itemId.includes('bow') || itemId.includes('mace') || itemId.includes('warhammer')) return 'weapon';
    if (itemId.includes('shield') || itemId.includes('quiver') || itemId.includes('book') || itemId.includes('tome')) return 'offhand';
    return 'ring1';
  };

  // Update Gambits per party member
  const handleUpdateCharGambits = (charIndex, newGambits) => {
    setGameState(prev => {
      if (charIndex === 0) {
        return { ...prev, player: { ...prev.player, gambits: newGambits } };
      } else {
        const updatedFollowers = [...(prev.followers || [])];
        if (updatedFollowers[charIndex - 1]) {
          updatedFollowers[charIndex - 1].gambits = newGambits;
        }
        return { ...prev, followers: updatedFollowers };
      }
    });
  };

  // Trigger Battle
  const handleTriggerBattle = (encounterKey, winPassageId, losePassageId) => {
    const encounter = ENCOUNTERS[encounterKey];
    if (encounter && encounter.enemies) {
      const enemyTypes = encounter.enemies.map(e => e.unitTypeId).filter(Boolean);
      setGameState(prev => {
        const currentEnemies = prev.discoveredCodex?.enemies || [];
        return {
          ...prev,
          discoveredCodex: {
            ...(prev.discoveredCodex || { heroes: [prev.player.classId], enemies: [], locations: ['oakhaven'] }),
            enemies: Array.from(new Set([...currentEnemies, ...enemyTypes]))
          }
        };
      });
    }

    setActiveBattle({ encounterKey, winPassageId, losePassageId });
    setActiveTab('battle');
  };

  // Battle Complete Callback
  const handleBattleComplete = (isVictory, outcome) => {
    if (!activeBattle) return;
    const { winPassageId } = activeBattle;
    setActiveBattle(null);

    if (isVictory === true) {
      // Record this map node as defeated & cleared!
      setGameState(prev => ({
        ...prev,
        completedBattles: Array.from(new Set([...(prev.completedBattles || []), prev.currentMapNodeId]))
      }));
      setActiveTab('story');
      handleMakeChoice(winPassageId);
    } else if (outcome === 'RETREATED' || isVictory === 'RETREATED') {
      setActiveTab('map');
    } else {
      handleResetCampaign();
    }
  };

  // Select Map Node from Overland Map
  const handleSelectMapNode = (node) => {
    if (node.entryPassageId) {
      // Advance turn & wandering hero map movements
      setGameState(prev => {
        const nextState = advanceMapTurn(prev, node.id);
        const updatedFlags = { ...nextState.storyFlags };
        let updatedNodes = [...nextState.unlockedMapNodes];

        if (node.id !== 'oakhaven') {
          updatedFlags.oakhaven_intro_done = true;
          ['whispering_woods', 'river_crossing', 'watchtower_ruins', 'misty_shores'].forEach(n => {
            if (!updatedNodes.includes(n)) updatedNodes.push(n);
          });
        }

        return {
          ...nextState,
          storyFlags: updatedFlags,
          unlockedMapNodes: updatedNodes
        };
      });

      const passageToLoad = (node.id === 'oakhaven' && gameState.storyFlags?.oakhaven_intro_done)
        ? 'p_oakhaven_return'
        : node.entryPassageId;

      handleMakeChoice(passageToLoad);
      setActiveTab('story');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gameState={gameState}
        hasChosenHero={hasChosenHero}
        onOpenSaveModal={() => setSaveModalOpen(true)}
        onOpenHeroSelect={() => setActiveTab('hero_select')}
        onOpenChangelog={() => setChangelogModalOpen(true)}
        onOpenCodex={() => setCodexModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 my-2">
        {activeTab === 'hero_select' && (
          <HeroSelect
            onSelectHero={handleSelectHero}
            onLoadSaveState={(loaded) => { setGameState(sanitizeGameState(loaded)); setHasChosenHero(true); setActiveTab('story'); }}
          />
        )}

        {activeTab === 'story' && (
          <StoryView
            gameState={gameState}
            onMakeChoice={handleMakeChoice}
            onTriggerBattle={handleTriggerBattle}
            onOpenMap={() => setActiveTab('map')}
            onOpenGambits={() => setActiveTab('gambits')}
            onOpenInventory={() => setActiveTab('party')}
            onOpenTavern={() => setActiveTab('party')}
            onOpenParty={() => setActiveTab('party')}
            onOpenSaveModal={() => setSaveModalOpen(true)}
            onResetCampaign={handleResetCampaign}
            onRecruitFollower={handleRecruitFollower}
            onRecruitWanderingHero={handleRecruitWanderingHero}
          />
        )}

        {activeTab === 'map' && (
          <OverlandMap
            gameState={gameState}
            onSelectMapNode={handleSelectMapNode}
          />
        )}

        {activeTab === 'gambits' && (
          <GambitEditor
            playerStats={gameState.player}
            followers={gameState.followers}
            onUpdateCharGambits={handleUpdateCharGambits}
          />
        )}

        {activeTab === 'party' && (
          <PartyScreen
            gameState={gameState}
            currentMapNode={MAP_NODES.find(n => n.id === gameState.currentMapNodeId)}
            onEquipItemToChar={handleEquipItemToChar}
            onUnequipSlotFromChar={handleUnequipSlotFromChar}
            onRecruitFollower={handleRecruitFollower}
            onDismissFollower={handleDismissFollower}
          />
        )}

        {activeTab === 'codex' && (
          <CodexWikiModal
            gameState={gameState}
            onClose={() => setActiveTab('story')}
          />
        )}

        {activeTab === 'battle' && activeBattle && (
          <BattleArena
            encounterKey={activeBattle.encounterKey}
            playerStats={gameState.player}
            playerGambits={gameState.player.gambits}
            followers={gameState.followers}
            onBattleComplete={handleBattleComplete}
          />
        )}
      </main>

      {/* Save State & Profile Sync Modal */}
      {saveModalOpen && (
        <SaveSyncModal
          gameState={gameState}
          onLoadSaveState={(loaded) => { setGameState(sanitizeGameState(loaded)); setHasChosenHero(true); }}
          onClose={() => setSaveModalOpen(false)}
          onResetCampaign={handleResetCampaign}
        />
      )}

      {/* Version History & Patch Notes Modal */}
      {changelogModalOpen && (
        <ChangelogModal onClose={() => setChangelogModalOpen(false)} />
      )}

      {/* Realm Codex & Wiki Modal */}
      {codexModalOpen && (
        <CodexWikiModal
          gameState={gameState}
          onClose={() => setCodexModalOpen(false)}
        />
      )}

      {/* Footer Branding with Clickable Version Badge */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <span>The Branching Gambit • Branching Narrative Auto-Battler</span>
        <span className="text-amber-500/40">•</span>
        <button
          onClick={() => { audioManager.playClick(); setChangelogModalOpen(true); }}
          className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono text-[11px] font-bold shadow-inner transition-all hover:scale-105 flex items-center gap-1 cursor-pointer"
          title="Click to view Release Notes & Version History"
        >
          <Scroll className="w-3 h-3 text-amber-400" />
          <span>{GAME_VERSION}</span>
        </button>
      </footer>
    </div>
  );
}
