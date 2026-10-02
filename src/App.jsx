import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StoryView from './components/StoryView';
import OverlandMap from './components/OverlandMap';
import GambitEditor from './components/GambitEditor';
import BattleArena from './components/BattleArena';
import SaveSyncModal from './components/SaveSyncModal';
import HeroSelect from './components/HeroSelect';
import PartyScreen from './components/PartyScreen';
import { MAP_NODES } from './data/mapNodes';
import { getInitialGameState, saveToLocalStorage, loadFromLocalStorage, sanitizeGameState } from './engine/saveManager';
import { INITIAL_STORY } from './data/initialStory';
import { HERO_CLASSES } from './data/heroClasses';

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = loadFromLocalStorage();
    return saved || getInitialGameState('warrior');
  });

  // Hero Class Selection is the primary landing page!
  const [activeTab, setActiveTab] = useState('hero_select');

  const [activeBattle, setActiveBattle] = useState(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

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

      if (effects) {
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

      return {
        ...prev,
        currentPassageId: targetPassageId,
        currentMapNodeId: targetMapNodeId,
        unlockedMapNodes: updatedNodes,
        storyFlags: updatedFlags,
        player: updatedPlayer,
        sharedBag: updatedBag
      };
    });
  };

  // Hero Class Selection -> Fresh New Journey!
  const handleSelectHero = ({ name, classId }) => {
    const freshState = getInitialGameState(classId);
    setGameState({
      ...freshState,
      player: {
        ...freshState.player,
        name: name || 'Hero Commander'
      }
    });
    setActiveTab('story');
  };

  // Campaign Reset -> Return to Hero Selection Landing Screen!
  const handleResetCampaign = () => {
    localStorage.removeItem('STORY_GAMBIT_RPG_SAVE_V1');
    const freshState = getInitialGameState('warrior');
    setGameState(freshState);
    setActiveTab('hero_select');
  };

  // Recruit Follower NPC
  const handleRecruitFollower = (npc) => {
    const classDef = HERO_CLASSES[npc.classId] || HERO_CLASSES.warrior;

    setGameState(prev => {
      if ((prev.followers || []).length >= 3 || prev.player.gold < npc.cost) return prev;
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
        ]
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
    setActiveBattle({ encounterKey, winPassageId, losePassageId });
    setActiveTab('battle');
  };

  // Battle Complete Callback
  const handleBattleComplete = (isVictory, outcome) => {
    if (!activeBattle) return;
    const { winPassageId } = activeBattle;
    setActiveBattle(null);

    if (isVictory === true) {
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
      handleMakeChoice(node.entryPassageId);
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
        onOpenSaveModal={() => setSaveModalOpen(true)}
        onOpenHeroSelect={() => setActiveTab('hero_select')}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 my-2">
        {activeTab === 'hero_select' && (
          <HeroSelect
            onSelectHero={handleSelectHero}
            onLoadSaveState={(loaded) => { setGameState(sanitizeGameState(loaded)); setActiveTab('story'); }}
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
          onLoadSaveState={(loaded) => setGameState(sanitizeGameState(loaded))}
          onClose={() => setSaveModalOpen(false)}
          onResetCampaign={handleResetCampaign}
        />
      )}

      {/* Footer Branding */}
      <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>Aethelgard CYOA Gambit Auto-Battler • Party System & Shared Bag Inventory</p>
      </footer>
    </div>
  );
}
