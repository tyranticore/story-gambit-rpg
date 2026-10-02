export const INITIAL_STORY = {
  p_oakhaven_start: {
    id: 'p_oakhaven_start',
    mapNodeId: 'oakhaven',
    title: 'The Tavern of the Gilded Raven',
    content: `The crackle of the hearth fire illuminates the smoky tavern room. Outside, rain lashes against the timber beams of Oakhaven. 

You sit at a weathered oak table, adjusting your sword belt. The Elder of Oakhaven slides a faded leather scroll toward you across the scarred wood.

"The Nether Dragon has awakened in the Eastern Caldera," the Elder rasps, his knuckles white against his iron cane. "Its shadow grows longer each night. Goblins gather in the Whispering Woods, bandits control the River Crossing, and the Sunken Ruins flood with arcane corruption. Before stepping outside, recruit up to 3 Mercenary Followers in the Tavern!"`,
    choices: [
      {
        text: 'Visit Tavern & Party Screen (Recruit Followers & Hero Inventory)',
        action: 'OPEN_TAVERN'
      },
      {
        text: 'Open Overland Map to choose your adventure route',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'whispering_woods', unlockNode2: 'river_crossing', unlockNode3: 'watchtower_ruins', unlockNode4: 'misty_shores' }
      }
    ]
  },

  // WATCHTOWER RUINS
  p_watchtower_enter: {
    id: 'p_watchtower_enter',
    mapNodeId: 'watchtower_ruins',
    title: 'The Old Sentry Tower',
    content: `Crumbling granite walls rise above the treeline. In an old wooden chest left by local rangers, you find a **Quiver of Swiftness** (+5 Attack, +0.2 Speed) and 45 Gold!`,
    choices: [
      {
        text: 'Claim Ranger Gear & Open Map',
        action: 'OPEN_MAP',
        effects: { addGold: 45, addItem: 'quiver', unlockNode: 'whispering_woods', unlockNode2: 'mining_village' }
      }
    ]
  },

  // RIVER CROSSING
  p_river_enter: {
    id: 'p_river_enter',
    mapNodeId: 'river_crossing',
    title: 'Serpent River Toll Bridge',
    content: `The rushing river thunders under the timber bridge. Armed river scouts demand a 30 Gold toll!`,
    choices: [
      {
        text: 'Pay 30 Gold Toll & Cross Safely',
        nextPassageId: 'p_mining_enter',
        effects: { addGold: -30, unlockNode: 'mining_village' }
      },
      {
        text: 'Fight the River Scouts in Auto-Battle!',
        triggerBattle: 'goblin_patrol',
        winPassageId: 'p_river_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_river_win: {
    id: 'p_river_win',
    mapNodeId: 'river_crossing',
    title: 'Bridge Cleared',
    content: `The river scouts retreat into the reeds! You claim 50 Gold and cross into the **Gilded Mining Village**.`,
    choices: [
      {
        text: 'Cross Bridge to Mining Village',
        action: 'OPEN_MAP',
        effects: { addGold: 50, unlockNode: 'mining_village' }
      }
    ]
  },

  // FEYWILD THICKET
  p_feywild_enter: {
    id: 'p_feywild_enter',
    mapNodeId: 'feywild_thicket',
    title: 'The Fey Glade',
    content: `Shimmering blue spirits swirl amidst ancient white roses. A fey guardian offers a divine blessing (+30 Max HP & +20 Max MP to your party!).`,
    choices: [
      {
        text: 'Receive Fey Blessing & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 50, unlockNode: 'forgotten_crypt' }
      }
    ]
  },

  // FORGOTTEN CRYPT
  p_crypt_enter: {
    id: 'p_crypt_enter',
    mapNodeId: 'forgotten_crypt',
    title: 'Crypt of King Aethelred',
    content: `Cobwebs drape over ancient stone sarcophagi. Skeletal guardians rise from the dust to defend royal treasures!`,
    choices: [
      {
        text: 'Engage Undead Sentries in Auto-Battle!',
        triggerBattle: 'goblin_patrol',
        winPassageId: 'p_crypt_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_crypt_win: {
    id: 'p_crypt_win',
    mapNodeId: 'forgotten_crypt',
    title: 'Royal Tomb Cleared',
    content: `You unearth King Aethelred\'s **Ruby Amulet of Might** (+8 Attack, +25 HP) and 90 Gold!`,
    choices: [
      {
        text: 'Equip Amulet & Open Map',
        action: 'OPEN_MAP',
        effects: { addGold: 90, addItem: 'ruby_pendant', unlockNode: 'abyssal_chasm', unlockNode2: 'sunken_ruins' }
      }
    ]
  },

  // GILDED MINING VILLAGE
  p_mining_enter: {
    id: 'p_mining_enter',
    mapNodeId: 'mining_village',
    title: 'Gilded Mining Village',
    content: `Blacksmith hammers ring out from mountain workshops. Master armorers offer **Iron Pauldrons** and **Heavy Greaves** for 75 Gold.`,
    choices: [
      {
        text: 'Purchase Iron Heavy Greaves (+6 Defense, +25 HP)',
        nextPassageId: 'p_mining_shop',
        effects: { addGold: -75, addItem: 'plate_greaves', unlockNode: 'highland_pass' }
      },
      {
        text: 'Continue along the Highland Pass',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'highland_pass' }
      }
    ]
  },
  p_mining_shop: {
    id: 'p_mining_shop',
    mapNodeId: 'mining_village',
    title: 'Outfitted for Mountain Warfare',
    content: `The dwarven armorer fits heavy steel greaves onto your armor. The **Highland Pass** and **Stormpeak Monastery** await!`,
    choices: [
      {
        text: 'Open Map to Ascend Mountain Pass',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'highland_pass', unlockNode2: 'stormpeak_monastery' }
      }
    ]
  },

  // HIGHLAND PASS
  p_highland_enter: {
    id: 'p_highland_enter',
    mapNodeId: 'highland_pass',
    title: 'Gorgon Ridge',
    content: `Icy gales howl across the narrow precipice. Screaming harpies circle above!`,
    choices: [
      {
        text: 'Battle Harpy Flock in Highland Battle!',
        triggerBattle: 'harpy_pack',
        winPassageId: 'p_highland_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_highland_win: {
    id: 'p_highland_win',
    mapNodeId: 'highland_pass',
    title: 'Pass Cleared',
    content: `The harpies are defeated! The path opens to the **Obsidian Forge** and **Stormpeak Monastery**.`,
    choices: [
      {
        text: 'Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 80, addGold: 60, unlockNode: 'obsidian_forge', unlockNode2: 'stormpeak_monastery' }
      }
    ]
  },

  // STORMPEAK MONASTERY
  p_monastery_enter: {
    id: 'p_monastery_enter',
    mapNodeId: 'stormpeak_monastery',
    title: 'Sanctuary of High Priests',
    content: `Chants echo through golden mountain halls. High monks bestow the **Tome of Divine Light** (+30 MP, +25 HP) to aid your holy quest against the Nether Dragon!`,
    choices: [
      {
        text: 'Accept Holy Tome & Open Map',
        action: 'OPEN_MAP',
        effects: { addItem: 'tome_of_light', unlockNode: 'astral_spire' }
      }
    ]
  },

  // ASTRAL SPIRE
  p_astral_enter: {
    id: 'p_astral_enter',
    mapNodeId: 'astral_spire',
    title: 'The Crystalline Tower',
    content: `Archmages present you with a **Ring of Mana Flux** (+35 MP, +4 Attack) and ancient spell knowledge.`,
    choices: [
      {
        text: 'Claim Mana Ring & Open Map',
        action: 'OPEN_MAP',
        effects: { addItem: 'mana_ring', unlockNode: 'obsidian_forge', unlockNode2: 'ironclad_keep' }
      }
    ]
  },

  // ABYSSAL CHASM
  p_abyssal_enter: {
    id: 'p_abyssal_enter',
    mapNodeId: 'abyssal_chasm',
    title: 'The Void Depths',
    content: `Shadow void golems guard the underground citadel drawbridge!`,
    choices: [
      {
        text: 'Battle Void Golems in Auto-Battle!',
        triggerBattle: 'iron_golem_guard',
        winPassageId: 'p_abyssal_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_abyssal_win: {
    id: 'p_abyssal_win',
    mapNodeId: 'abyssal_chasm',
    title: 'Void Golems Destroyed',
    content: `You breach the southern entrance to **Ironclad Keep**!`,
    choices: [
      {
        text: 'Enter Ironclad Keep Gates',
        action: 'OPEN_MAP',
        effects: { addExp: 150, addGold: 120, unlockNode: 'ironclad_keep' }
      }
    ]
  },

  // OBSIDIAN FORGE
  p_forge_enter: {
    id: 'p_forge_enter',
    mapNodeId: 'obsidian_forge',
    title: 'The Magma Forge',
    content: `Master dwarf smiths forge the legendary **Dragonslayer Sigil** (+30 Attack, +80 HP) in volcanic magma!`,
    choices: [
      {
        text: 'Claim Dragonslayer Sigil & Open Map',
        action: 'OPEN_MAP',
        effects: { addItem: 'dragonslayer_sigil', unlockNode: 'volcanic_slopes', unlockNode2: 'ironclad_keep' }
      }
    ]
  },

  // VOLCANIC SLOPES
  p_slopes_enter: {
    id: 'p_slopes_enter',
    mapNodeId: 'volcanic_slopes',
    title: 'Ash Slopes of the Dragon Peak',
    content: `Scorched earth and volcanic lava streams block the path. Obsidian Golem guardians attack!`,
    choices: [
      {
        text: 'Fight Golem Guard Post!',
        triggerBattle: 'iron_golem_guard',
        winPassageId: 'p_slopes_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_slopes_win: {
    id: 'p_slopes_win',
    mapNodeId: 'volcanic_slopes',
    title: 'Summit Path Unlocked',
    content: `The lava gates crumble! The final ascent to **Dragon\'s Caldera** is open!`,
    choices: [
      {
        text: 'Ascend to Dragon Caldera Peak',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'dragon_peak' }
      }
    ]
  },

  // WHISPERING WOODS
  p_woods_enter: {
    id: 'p_woods_enter',
    mapNodeId: 'whispering_woods',
    title: 'Under the Canopy of Shadows',
    content: `Moss-draped ancient oaks loom overhead, blocking out all sunlight.

Guttural shrieks echo through the trees! Goblin scouts draw rusty scimitars, while a skeletal sentry steps out!`,
    choices: [
      {
        text: 'Engage Ambushers in 2D Party Auto-Battle!',
        triggerBattle: 'goblin_patrol',
        winPassageId: 'p_woods_victory',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_woods_victory: {
    id: 'p_woods_victory',
    mapNodeId: 'whispering_woods',
    title: 'Victory in the Forest',
    content: `The last skeletal sentry collapses! You discover a **Sunken Key** etched with sea-runes, 65 XP and 40 Gold!`,
    choices: [
      {
        text: 'Pick up Sunken Key & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 65, addGold: 40, addItem: 'sunken_key', unlockNode: 'sunken_ruins', unlockNode2: 'forgotten_crypt' }
      }
    ]
  },

  // MISTY SHORES
  p_shores_enter: {
    id: 'p_shores_enter',
    mapNodeId: 'misty_shores',
    title: 'The Fog-Bound Coast',
    content: `Waves crash violently against jagged black cliffs. A dying wanderer presents an **Arcane Barrier Rune** (+15 Defense, +20 MP).`,
    choices: [
      {
        text: 'Accept Arcane Barrier Rune & Open Map',
        action: 'OPEN_MAP',
        effects: { addItem: 'barrier_rune', unlockNode: 'sunken_ruins', unlockNode2: 'stormpeak_monastery' }
      }
    ]
  },

  // SUNKEN RUINS
  p_ruins_enter: {
    id: 'p_ruins_enter',
    mapNodeId: 'sunken_ruins',
    title: 'The Flooded Temple of Aethelgard',
    content: `Shimmering blue mana crystals cast eerie reflections across flooded staircases.

Ferocious **Harpy Sky-Hunters** screech and dive from ruined pillars!`,
    choices: [
      {
        text: 'Commence Auto-Battle Against Harpy Flock!',
        triggerBattle: 'harpy_pack',
        winPassageId: 'p_ruins_victory',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_ruins_victory: {
    id: 'p_ruins_victory',
    mapNodeId: 'sunken_ruins',
    title: 'The Temple Cleansed',
    content: `You uncover an **Obsidian Citadel Passcard** and 100 Gold! The paths to **Ironclad Keep** and **Astral Spire** are open!`,
    choices: [
      {
        text: 'Claim Rewards & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 150, addGold: 100, addItem: 'citadel_pass', unlockNode: 'ironclad_keep', unlockNode2: 'astral_spire' }
      }
    ]
  },

  // IRONCLAD KEEP
  p_keep_enter: {
    id: 'p_keep_enter',
    mapNodeId: 'ironclad_keep',
    title: 'Gates of Obsidian Steel',
    content: `An **Obsidian Iron Golem** awakens with a grinding crunch of stone and iron!`,
    choices: [
      {
        text: 'Battle the Obsidian Iron Golem!',
        triggerBattle: 'iron_golem_guard',
        winPassageId: 'p_keep_victory',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_keep_victory: {
    id: 'p_keep_victory',
    mapNodeId: 'ironclad_keep',
    title: 'Citadel Conqueror',
    content: `The massive Iron Golem shatters! Nothing stands between you and the final summit of the **Dragon\'s Caldera**!`,
    choices: [
      {
        text: 'Ascend to Dragon\'s Caldera on the Map',
        action: 'OPEN_MAP',
        effects: { addExp: 250, addGold: 200, unlockNode: 'dragon_peak' }
      }
    ]
  },

  // DRAGON PEAK
  p_dragon_peak_enter: {
    id: 'p_dragon_peak_enter',
    mapNodeId: 'dragon_peak',
    title: 'The Nether Caldera',
    content: `Rivers of orange magma flow across the jagged peak. 

The colossal **Nether Dragon Lord** roars, unleashing a torrent of dragonfire! Prepare your 4-hero party for the final battle!`,
    choices: [
      {
        text: 'FACE THE NETHER DRAGON LORD IN FINAL AUTO-BATTLE!',
        triggerBattle: 'nether_dragon_boss',
        winPassageId: 'p_dragon_victory',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_dragon_victory: {
    id: 'p_dragon_victory',
    mapNodeId: 'dragon_peak',
    title: '🎉 CAMPAIGN COMPLETED: VICTORY OF AETHELGARD!',
    content: `With a thunderous roar, the Nether Dragon Lord plummets into the volcanic depths! Golden rays of sunrise break through the ash clouds, illuminating the land of Aethelgard.

From Oakhaven to the High Monastery, church bells toll in celebration of your legendary party! You have vanquished the ancient evil and brought peace to the realm.

Click below to complete your campaign, reset your story state, and return to the Hero Class Selection Screen for a new adventure!`,
    choices: [
      {
        text: '🏆 Complete Campaign & Begin New Journey (Reset to Class Selection)',
        action: 'RESET_CAMPAIGN'
      },
      {
        text: '☁️ Save Profile Record to Cloud First',
        action: 'OPEN_SAVE_MODAL'
      }
    ]
  },

  p_defeat_retry: {
    id: 'p_defeat_retry',
    title: 'THE PARTY DIED. EVIL HAS TRIUMPHED.',
    content: `Your hero and companions were slain in combat. Darkness spreads across Aethelgard. Evil has won. You must start over fresh with a new character.`,
    choices: [
      {
        text: '💀 Start Over Fresh as a New Character',
        action: 'RESET_CAMPAIGN'
      }
    ]
  }
};
