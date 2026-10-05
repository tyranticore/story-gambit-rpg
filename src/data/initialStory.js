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
        action: 'OPEN_TAVERN',
        effects: { setFlag: 'oakhaven_intro_done', unlockNode: 'whispering_woods', unlockNode2: 'river_crossing', unlockNode3: 'watchtower_ruins', unlockNode4: 'misty_shores' }
      },
      {
        text: 'Open Overland Map to choose your adventure route',
        action: 'OPEN_MAP',
        effects: { setFlag: 'oakhaven_intro_done', unlockNode: 'whispering_woods', unlockNode2: 'river_crossing', unlockNode3: 'watchtower_ruins', unlockNode4: 'misty_shores' }
      }
    ]
  },
  p_oakhaven_return: {
    id: 'p_oakhaven_return',
    mapNodeId: 'oakhaven',
    title: 'The Tavern of the Gilded Raven',
    content: `The hearth fire crackles warmly inside the Gilded Raven Tavern. Townsfolk chat over tankards of ale, and the Elder of Oakhaven nods respectfully as your party returns.

Oakhaven remains a safe haven for weary travelers. Your party rests by the fire, catching their breath before venturing back onto the dangerous roads of Aethelgard.`,
    choices: [
      {
        text: 'Depart Oakhaven & Return to Overland Map',
        action: 'OPEN_MAP'
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
        effects: { addGold: 45, addItem: 'quiver', unlockNode: 'whispering_woods', unlockNode2: 'river_crossing' }
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
        action: 'OPEN_MAP',
        effects: { addGold: -30, unlockNode: 'goblin_market', unlockNode2: 'whispering_woods', clearBattle: 'river_crossing' }
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
    content: `The river scouts retreat into the reeds! In the muddy wheel ruts of a merchant cart, you spot an abandoned leather courier pouch next to a chest of 50 Gold.`,
    choices: [
      {
        text: '🔍 Search the Courier Pouch for Secret Smuggler Notes',
        nextPassageId: 'p_river_smuggler_note',
        effects: { addGold: 50, unlockNode: 'whispering_woods' }
      },
      {
        text: 'Leave the Pouch & Proceed onto Whispering Woods',
        action: 'OPEN_MAP',
        effects: { addGold: 50, unlockNode: 'whispering_woods' }
      }
    ]
  },
  p_river_smuggler_note: {
    id: 'p_river_smuggler_note',
    mapNodeId: 'river_crossing',
    title: 'Smuggler\'s Secret Map Discovered!',
    content: `Unrolling the charcoal-stained parchment, you decipher a coded trail leading into the deep southern brambles.
    
✨ **The Goblin Black Market** has been revealed on your world map!`,
    choices: [
      {
        text: 'Mark the Secret Trail on Map & Continue',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'goblin_market', unlockNode2: 'whispering_woods' }
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
        effects: { addExp: 50, unlockNode: 'timberwall_village' }
      }
    ]
  },

  // TIMBERWALL PLAINS VILLAGE
  p_timberwall_enter: {
    id: 'p_timberwall_enter',
    mapNodeId: 'timberwall_village',
    title: 'Timberwall Plains Village',
    content: `Sturdy timber palisades rise above the grassy plains. Frontier traders, lumberjacks, and scouts gather around hearthfires to share rumors of the highland mountain passes and ancient crypts.`,
    choices: [
      {
        text: 'Rest at the Plains Hearth Tavern (Restore HP & Mana)',
        nextPassageId: 'p_timberwall_rest',
        effects: { restoreHpFull: true, restoreManaFull: true, unlockNode: 'highland_pass', unlockNode2: 'mining_village' }
      },
      {
        text: '🕯️ Buy an Old Plains Hunter Ale & Inquire about Local Legends (15 Gold)',
        nextPassageId: 'p_timberwall_fey_rumor',
        effects: { addGold: -15 }
      },
      {
        text: 'Review the Overland Map',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'highland_pass', unlockNode2: 'mining_village' }
      }
    ]
  },
  p_timberwall_fey_rumor: {
    id: 'p_timberwall_fey_rumor',
    mapNodeId: 'timberwall_village',
    title: 'The Moon Fey Whispers',
    content: `Warming his hands over the mug, the grizzled hunter leans in close: 
    
"Out on the eastern meadows between here and the mining village, when the moon rises full, ancient glowing stones hum with fey chants. Few have ever found the way through the mist..."
    
He scratches a crude landmark sketch into your journal.
    
✨ **The Shrine of the Moon Fey** has been revealed on your world map!`,
    choices: [
      {
        text: 'Mark the Sacred Shrine on Map & Continue',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'fey_shrine', unlockNode2: 'highland_pass', unlockNode3: 'mining_village' }
      }
    ]
  },
  p_timberwall_rest: {
    id: 'p_timberwall_rest',
    mapNodeId: 'timberwall_village',
    title: 'Warm Hearth & Rested Spirits',
    content: `A hot bowl of plains stew and a night by the crackling fire restore your party to full fighting strength!`,
    choices: [
      {
        text: 'Return to the Overland Map',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'highland_pass', unlockNode2: 'mining_village' }
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
    content: `The void sentinels shatter into inert obsidian shards, dropping 120 Gold! Near the abyss edge, dark purple mist seeps from an ominous fissure etched with ancient void cultist sigils.`,
    choices: [
      {
        text: '👁️ Inspect the Whispering Void Fissure (High Risk / High Reward)',
        nextPassageId: 'p_abyssal_sepulcher_reveal',
        effects: { addExp: 150, addGold: 120, unlockNode: 'obsidian_forge' }
      },
      {
        text: 'Seal the Fissure & Ascend to the Obsidian Forge',
        action: 'OPEN_MAP',
        effects: { addExp: 150, addGold: 120, unlockNode: 'obsidian_forge' }
      }
    ]
  },
  p_abyssal_sepulcher_reveal: {
    id: 'p_abyssal_sepulcher_reveal',
    mapNodeId: 'abyssal_chasm',
    title: 'The Shadow Sepulcher Unveiled!',
    content: `Deciphering the dark sigils, you utter the counter-curse. A hidden subterranean stairway descends into the deep abyss tomb!
    
✨ **The Shadow Sepulcher** (Danger Rank 4) has been revealed on your world map!`,
    choices: [
      {
        text: 'Mark the Secret Sepulcher on Map',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'cursed_catacombs', unlockNode2: 'obsidian_forge' }
      }
    ]
  },

  // OBSIDIAN FORGE
  p_forge_enter: {
    id: 'p_forge_enter',
    mapNodeId: 'obsidian_forge',
    title: 'The Magma Forge',
    content: `Master dwarf smiths hammer glowing molten steel, granting your party the **Dragonslayer Sigil** (+30 Attack, +80 HP) to pierce dragon scales!`,
    choices: [
      {
        text: '🔥 Ask the Master Smith to Quench your Weapons in Sacred Dragonfire (40 Gold)',
        nextPassageId: 'p_forge_altar_reveal',
        effects: { addGold: -40, addItem: 'dragonslayer_sigil', unlockNode: 'ironclad_keep' }
      },
      {
        text: 'Claim Dragonslayer Sigil & Continue to Ironclad Keep',
        action: 'OPEN_MAP',
        effects: { addItem: 'dragonslayer_sigil', unlockNode: 'ironclad_keep' }
      }
    ]
  },
  p_forge_altar_reveal: {
    id: 'p_forge_altar_reveal',
    mapNodeId: 'obsidian_forge',
    title: 'Sacred Flame & Dragon Altar Revealed',
    content: `As your steel enters the dragonfire basin, ancient flames lick the metal with golden radiance. The Master Smith nods reverently:
    
"Few walk the high path of the ancient drake worshippers. Seek the hidden obsidian ridge high above the molten flows..."
    
✨ **The Altar of the Drake** has been revealed on your world map!`,
    choices: [
      {
        text: 'Mark the Dragon Altar on Map',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'dragon_altar', unlockNode2: 'ironclad_keep' }
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
    content: `The last skeletal sentry collapses! You claim 65 XP and 40 Gold. Trails lead onward to the **Misty Shores** and **Timberwall Plains Village**.`,
    choices: [
      {
        text: 'Claim Spoils & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 65, addGold: 40, addItem: 'sunken_key', unlockNode: 'misty_shores', unlockNode2: 'timberwall_village' }
      }
    ]
  },

  // MISTY SHORES
  p_shores_enter: {
    id: 'p_shores_enter',
    mapNodeId: 'misty_shores',
    title: 'The Fog-Bound Coast',
    content: `Waves crash violently against jagged black cliffs. A dying wanderer presents an **Arcane Barrier Rune** (+15 Defense, +20 MP) and points the way to **Feywild Thicket**.`,
    choices: [
      {
        text: 'Accept Arcane Barrier Rune & Open Map',
        action: 'OPEN_MAP',
        effects: { addItem: 'barrier_rune', unlockNode: 'feywild_thicket' }
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
    content: `The harpies are defeated! You recover 100 Gold and an **Obsidian Citadel Passcard**. In the dark pool below the altar dais, water ripples around an ancient submerged stone archway marked with a glowing trident glyph.`,
    choices: [
      {
        text: '🗝️ Channel Arcane Mana into the Submerged Rune-Door',
        nextPassageId: 'p_sunken_vault_reveal',
        effects: { addExp: 150, addGold: 100, addItem: 'citadel_pass' }
      },
      {
        text: 'Claim Spoils & Ascend Back to Land',
        action: 'OPEN_MAP',
        effects: { addExp: 150, addGold: 100, addItem: 'citadel_pass' }
      }
    ]
  },
  p_sunken_vault_reveal: {
    id: 'p_sunken_vault_reveal',
    mapNodeId: 'sunken_ruins',
    title: 'Submerged Vault Unsealed!',
    content: `Your mana resonates with the ancient drowned masonry. Deep below the flooded arches, a heavy stone vault gate slides open with a shudder!
    
✨ **The Sunken Vault of Treasures** has been revealed in the coastal waters on your world map!`,
    choices: [
      {
        text: 'Mark the Submerged Vault on Map & Prepare Dive',
        action: 'OPEN_MAP',
        effects: { unlockNode: 'sunken_vault' }
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
  },

  // SECRET MAP NODES PASSAGES
  p_goblin_market_enter: {
    id: 'p_goblin_market_enter',
    mapNodeId: 'goblin_market',
    title: 'The Goblin Black Market',
    content: `Shrewd goblin traders chatter behind tables covered in contraband weapons, magical accessories, and stolen elixirs.
    
    A veiled goblin merchant slides an **Elixir of Mana Flux** (+50 MP, +10 Attack) forward!`,
    choices: [
      {
        text: 'Purchase Mana Elixir (60 Gold)',
        action: 'OPEN_MAP',
        effects: { addGold: -60, addItem: 'mana_ring' }
      },
      {
        text: 'Return to Overland Map',
        action: 'OPEN_MAP'
      }
    ]
  },

  p_fey_shrine_enter: {
    id: 'p_fey_shrine_enter',
    mapNodeId: 'fey_shrine',
    title: 'Shrine of the Moon Fey',
    content: `Luminescent fey spirits circle a ancient moonstone shrine, singing celestial melodies.
    
    The fey guardian touches your party leader's forehead, bestowing **Ancient Fey Knowledge** (+100 XP & 50 Gold)!`,
    choices: [
      {
        text: 'Receive Fey Blessing & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 100, addGold: 50 }
      }
    ]
  },

  p_sunken_vault_enter: {
    id: 'p_sunken_vault_enter',
    mapNodeId: 'sunken_vault',
    title: 'Sunken Relic Vault',
    content: `Massive iron-bound chests gleam beneath crystal-clear water! Harpy Sky-Hunters dive from above to defend the vault!`,
    choices: [
      {
        text: 'Defeat Relic Guardians in Auto-Battle!',
        triggerBattle: 'sunken_vault_guard',
        winPassageId: 'p_sunken_vault_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_sunken_vault_win: {
    id: 'p_sunken_vault_win',
    mapNodeId: 'sunken_vault',
    title: 'Vault Cleared',
    content: `You unseal the ancient chest and uncover an **Arcane Barrier Rune** (+15 Defense, +20 MP) and 180 Gold!`,
    choices: [
      {
        text: 'Claim Vault Relics & Open Map',
        action: 'OPEN_MAP',
        effects: { addGold: 180, addItem: 'barrier_rune' }
      }
    ]
  },

  p_cursed_catacombs_enter: {
    id: 'p_cursed_catacombs_enter',
    mapNodeId: 'cursed_catacombs',
    title: 'The Shadow Sepulcher',
    content: `Eerie purple flames ignite along ancient sarcophagi as dark void cultists and skeletal archmages assemble!`,
    choices: [
      {
        text: 'Vanquish Void Wraiths in Auto-Battle!',
        triggerBattle: 'catacombs_boss',
        winPassageId: 'p_cursed_catacombs_win',
        losePassageId: 'p_defeat_retry'
      }
    ]
  },
  p_cursed_catacombs_win: {
    id: 'p_cursed_catacombs_win',
    mapNodeId: 'cursed_catacombs',
    title: 'Sepulcher Cleansed',
    content: `The void cultists shatter into dust! You uncover the legendary **Dragonslayer Sigil** (+30 Attack, +80 HP) and 220 Gold!`,
    choices: [
      {
        text: 'Claim Sepulcher Treasure & Open Map',
        action: 'OPEN_MAP',
        effects: { addGold: 220, addItem: 'dragonslayer_sigil' }
      }
    ]
  },

  p_dragon_altar_enter: {
    id: 'p_dragon_altar_enter',
    mapNodeId: 'dragon_altar',
    title: 'Altar of the Drake',
    content: `Sacred volcanic dragonfire ignites your weapons! The spirits of ancient drakes bless your party (+120 XP & +100 Gold) before your final ascent!`,
    choices: [
      {
        text: 'Receive Drake Blessing & Open Map',
        action: 'OPEN_MAP',
        effects: { addExp: 120, addGold: 100 }
      }
    ]
  }
};
