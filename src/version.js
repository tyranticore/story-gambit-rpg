export const GAME_VERSION = 'v0.9.6';

export const CHANGELOG_HISTORY = [
  {
    version: 'v0.9.6',
    date: 'October 3, 2026',
    title: 'Map Viewport Auto-Centering on Party Position',
    highlights: [
      '🎯 Auto-Centered Map Viewport: When opening or returning to the Overland Map, the scrollable canvas automatically centers on the party\'s current map location instead of defaulting to the far left.'
    ]
  },
  {
    version: 'v0.9.5',
    date: 'October 3, 2026',
    title: 'Subtle Walking Movement & Dynamic Oakhaven Return Passage',
    highlights: [
      '🚶 Natural Walking Bounce: Softened party marker vertical bob (3px) and side sway (1.5°) for a realistic marching motion.',
      '🏰 Dynamic Oakhaven Return Node: Departing Oakhaven marks the initial intro complete. Returning to Oakhaven removes the tutorial tavern choice and shows standard departure actions.'
    ]
  },
  {
    version: 'v0.9.4',
    date: 'October 3, 2026',
    title: '60 FPS Walking Animation & Rhythmic Footstep Bobbing',
    highlights: [
      '🚶 Real-Time 60 FPS Walking Engine: Replaced jump steps with linear frame-by-frame path traversal (2.8s per road segment).',
      '🥾 Rhythmic Footstep Bounce & Sway: Party marker bobs up/down (9px) and sways (6°) as characters walk.',
      '📷 Continuous Camera Pan: Camera follows the walking party smoothly across the 1800px map canvas with zero delays.'
    ]
  },
  {
    version: 'v0.9.3',
    date: 'October 3, 2026',
    title: 'Slower Map Marching Animation',
    highlights: [
      '🚶 Slower Journey Movement: Adjusted party token marching animation speed to 1.6 seconds per map node segment with matching 1.5s smooth path gliding.'
    ]
  },
  {
    version: 'v0.9.2',
    date: 'October 3, 2026',
    title: 'Game Rebranding to "The Branching Gambit"',
    highlights: [
      '🛡️ Game Title Rebranding: Updated application branding to "The Branching Gambit" across header, landing page, footer, and page title.',
      '📖 Terminology Update: Replaced "CYOA" badge with "Branching Narrative" across all components.'
    ]
  },
  {
    version: 'v0.9.1',
    date: 'October 3, 2026',
    title: 'Landing Page Stats Bar Visibility Update',
    highlights: [
      '🙈 Hidden Intro Stats Bar: Hides the top stats bar (Valerius / HP / MP / Gold) on the landing page until a hero is chosen or a saved game is loaded.',
      '⚔️ Hero Run Session Tracking: Revealing stats bar dynamically once a campaign starts or a cloud save is active.'
    ]
  },
  {
    version: 'v0.9.0',
    date: 'October 3, 2026',
    title: 'Google Cloud Auth, Animated Map Marching & Persistent Encounters',
    highlights: [
      '🚩 Animated Party Marker & Path Marching: Party token smoothly marches along map paths with footstep audio and auto-camera panning.',
      '🔐 Google Cloud Firestore Sync: Save & Load progress securely with 1-Click Google Authentication.',
      '⚔️ Persistent Battle Memory: Defeated battle nodes remain cleared and free of enemies on return trips.',
      '🎁 One-Time Reward Memory: Prevents duplicate resource farming when backtracking across nodes.',
      '👤 Dynamic Wandering Mercenary System: Recruitable heroes roam map nodes with turn timers before relocating.',
      '📜 Integrated Version History & Patch Notes Modal.'
    ]
  },
  {
    version: 'v0.8.5',
    date: 'October 3, 2026',
    title: 'Combat Aggro System & Class Roles',
    highlights: [
      '🛡️ Class Aggro System: Warrior and Cleric generate threat to draw enemy attacks away from squishy allies.',
      '🏹 Distance & Range Mechanics: Mage/Archer strike from afar; Thief strikes up close with high speed.',
      '💖 Support Healing Priority: Healers prioritize low-health tanks and allies.',
      '📜 Hero Select Dropdown: Hero creation options tucked under expandable dropdown.'
    ]
  },
  {
    version: 'v0.8.0',
    date: 'October 2, 2026',
    title: 'Paper Doll Equipment & Desktop Battle Ticker',
    highlights: [
      '⚔️ 10-Slot Paper Doll Inventory: Helmets, Armor, Weapons, Offhands, Rings, and Accessories.',
      '📜 Tall Desktop Battle Ticker: Expanded battle log aligned with character party cards.'
    ]
  }
];
