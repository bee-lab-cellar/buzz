import { DialogueLine } from './types';

// 4-Scene Opening Cutscene: "PROLOGUE: THE SHATTERED STAR-WAND"
export const INTRO_CUTSCENE_LINES: DialogueLine[] = [
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Scene 1 — Golden Era of Felis Citadel: For centuries, the Starlight Gem Wand kept peace across the Cat and Dog realms while young wizard-squire Nyx practiced his drills.',
    sound: 'talk',
    sceneCue: 'prologue_1',
  },
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'Scene 2 — The Wolf Invasion: Thunder shatters the stained-glass hall! Fenrir and his Dread Vanguard storm the Citadel in dark iron armor!',
    sound: 'roar',
    sceneCue: 'prologue_2',
  },
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'Scene 3 — Theft of the Wand: Fenrir unleashes shadow chains, knocks King Leo down, snatches the Starlight Gem Wand, and seals the throne in purple crystal!',
    sound: 'roar',
    sceneCue: 'prologue_3',
  },
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'Scene 4 — The Royal Oath: “Nyx! Journey across the Forbidden Biomes to Act 40’s Lotus Sanctum! Only The Great Duck can brew the Astral Quack Potion to break Fenrir’s barrier!”',
    sound: 'talk',
    sceneCue: 'prologue_4',
  },
];

// Act 41 Cutscene: "KING LEO'S COMEBACK & THE WAR OF THE TWO KINGDOMS"
export const VICTORY_CUTSCENE_LINES: DialogueLine[] = [
  {
    speaker: 'Nyx',
    portrait: 'pip_happy',
    text: 'Scene 1 — The Wand Reclaimed: As Fenrir collapses, the Starlight Gem Wand shatters the dark stasis chains and restores King Leo to full royal strength!',
    sound: 'chime',
    sceneCue: 'epilogue_1',
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Scene 2 — Comeback of the Lion King: “Rise, Grand Archmage Nyx! You saved my throne—yet Fenrir was only a general of Emperor Vargos’s Direfang Empire!”',
    sound: 'chime',
    sceneCue: 'epilogue_2',
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'Scene 3 — Alliance of Cat & Duck: “QUACK-TO-ARMS!” Direfang war-galleys, siege trains, and sky-zeppelins are massing across Acts 42 to 81! King Leo’s Royal Guard will march beside you!',
    sound: 'quack',
    sceneCue: 'epilogue_3',
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Scene 4 — The War of the Two Kingdoms (Acts 42–81) is now unlocked! Will you march straight to the Act 42 Borderland Front with me, or feast first?',
    sound: 'chime',
    sceneCue: 'epilogue_4',
    choices: [
      {
        id: 'leo_war_campaign',
        label: '“March into Act 42: War of the Two Kingdoms!”',
        effect: 'leo_war_campaign',
        replyLines: [
          {
            speaker: 'King Leo',
            portrait: 'king_leo',
            text: 'For Felis Citadel! My Royal Vanguard marches at your side, Archmage Nyx! Onward to Act 42: Lionheart Forward Camp!',
            sound: 'chime',
            sceneCue: 'epilogue_4',
          },
        ],
      },
      {
        id: 'leo_feast',
        label: '“Celebrate at the Royal Feast & Hall of Fame first!”',
        effect: 'leo_feast',
        replyLines: [
          {
            speaker: 'King Leo',
            portrait: 'king_leo',
            text: 'Well earned, brave Nyx! Feast well—you can launch Act 42’s War Campaign or open the 81-Act World Map anytime!',
            sound: 'chime',
            sceneCue: 'epilogue_4',
          },
        ],
      },
    ],
  },
];

// Act 82 True Ending Epilogue: "THE ETERNAL PEACE TREATY OF CATS AND DOGS" (Completely distinct from Act 41!)
export const WAR_FINALE_VICTORY_LINES: DialogueLine[] = [
  {
    speaker: 'Nyx',
    portrait: 'pip_happy',
    text: 'Scene 1 — The World-Hound Purified: As Nyx, King Leo, and The Great Duck’s Triple Kingdom Slash shatters the Ragnarok Core, the cosmic storm clears and Fenrir is purified back to his noble wolf form!',
    sound: 'chime',
    sceneCue: 'epilogue_1',
  },
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'Scene 2 — The Kneeling Wolf Sovereign: Fenrir kneels in the Colosseum and returns the final War-Banner: “Forgive my pride, King Leo... Archmage Nyx. You saved my hounds from the Ragnarok curse.”',
    sound: 'talk',
    sceneCue: 'epilogue_2',
  },
  {
    speaker: 'King Leo & The Great Duck',
    portrait: 'king_leo',
    text: 'Scene 3 — The Royal Peace Scroll: King Leo, Nyx, Fenrir, and The Great Duck sign the Eternal Peace Treaty of Cats and Dogs as Cat Knights and Dog Soldiers cheer together and toss their helmets into the sky!',
    sound: 'quack',
    sceneCue: 'epilogue_3',
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Scene 4 — Supreme Hall of Fame: All 82 Acts of the Two Kingdoms are united in eternal peace! How will you celebrate, Grand Archmage-General Nyx?',
    sound: 'chime',
    sceneCue: 'epilogue_4',
    choices: [
      {
        id: 'leo_feast',
        label: '“Sign the Eternal Peace Scroll & Enter the 82-Act Hall of Fame!”',
        effect: 'leo_feast',
        replyLines: [
          {
            speaker: 'King Leo',
            portrait: 'king_leo',
            text: 'All hail Grand Archmage-General Nyx, Peacemaker of the Cat and Dog Kingdoms!',
            sound: 'chime',
            sceneCue: 'epilogue_4',
          },
        ],
      },
      {
        id: 'leo_rush',
        label: '“Challenge the Ultimate Boss Rush Gauntlet!”',
        effect: 'leo_rush',
        replyLines: [
          {
            speaker: 'King Leo',
            portrait: 'king_leo',
            text: 'Show the Boss Rush arena the full might of the Two Kingdoms!',
            sound: 'chime',
            sceneCue: 'epilogue_4',
          },
        ],
      },
    ],
  },
];

// Act 81 Exclusive Cutscene: "THE GREAT DUCK'S SUPREME WAR COUNCIL" (ONLY for Act 81 — never reuses Act 40!)
export const WAR_COUNCIL_ACT81_LINES: DialogueLine[] = [
  {
    speaker: 'King Leo (The Lion King)',
    portrait: 'king_leo',
    text: 'Commander Nyx! We have pushed the Dog Kingdom Legions all the way back to the Gates of the Obsidian Colosseum! One final battle remains to end this war forever!',
    sound: 'chime',
    cameraTarget: { x: 256, y: 110 },
  },
  {
    speaker: 'The Great Duck (Supreme Archmage)',
    portrait: 'great_duck',
    text: 'Quack of Destiny! Act 40’s potion merely broke Fenrir’s barrier—now, King Leo and I shall fuse the Starlight Gem Wand with my Supreme Golden Quack Elixir!',
    sound: 'quack',
    cameraTarget: { x: 304, y: 108 },
  },
  {
    speaker: 'King Leo & The Great Duck',
    portrait: 'great_duck',
    text: 'Rise, Grand Archmage-General Nyx! Receive the Tier 20 Primordial Lionheart-Archmage Blade & Armor, and evolved Supreme Quack Elixir [Q]! We will march into Act 82 and fight directly at your side!',
    sound: 'chime',
    cameraTarget: { x: 304, y: 110 },
  },
];

// Act 81 Exclusive Tactician Whiskers Dialogue (distinct from Act 40 & Act 42)
export const WAR_COUNCIL_ACT81_ADVISOR_LINES: DialogueLine[] = [
  {
    speaker: 'War Tactician Whiskers',
    portrait: 'advisor',
    text: 'Commander Nyx! Welcome to the Crimson-Gold Supreme War Council Pavilion! Beyond the East Crimson War-Gate lies Act 82: The Obsidian Colosseum and Emperor Fenrir’s 3-Phase Ragnarok clash!',
    sound: 'talk',
  },
  {
    speaker: 'War Tactician Whiskers',
    portrait: 'advisor',
    text: 'Speak with King Leo and The Great Duck here to claim your Tier 20 Primordial Relics before stepping through the Crimson War-Gate to Act 82!',
    sound: 'chime',
  },
];

// Act 82 Exclusive Phase 1, Phase 2 & Phase 3 Colosseum Cutscenes (Completely separate from Act 41!)
export const ACT82_CHARIOT_INTRO_LINES: DialogueLine[] = [
  {
    speaker: 'War-Emperor Fenrir',
    portrait: 'fenrir',
    text: 'Welcome to the Obsidian Colosseum of Kings! Behold my Dread-Chariot Cerberus—pulled by three ironclad cyber-hounds and armed with Imperial Siege Ballistas!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 116 },
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'The Great Duck, my Royal Cat Guard, and I fight right beside you on the arena floor, Nyx! Watch for his Special Skills and use [Q] wisely to pierce his Imperial Aegis!',
    sound: 'chime',
  },
];

export const ACT82_DUAL_SOVEREIGN_PHASE2_LINES: DialogueLine[] = [
  {
    speaker: 'War-Emperor Fenrir',
    portrait: 'fenrir',
    text: 'GRAAAH! My Dread-Chariot Cerberus is shattered?! Then face the Dual-Sovereign Clash! Shadow-Shogun Lupus—wield the Dual Eclipse Great-Axes with me!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 128 },
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK ALERT! Phase 2 (100,000 HP): Fenrir and Phantom Shogun Lupus are chaining Eclipse Lightning! Stand inside my Golden Sanctuary Bubbles when they cast Supernova!',
    sound: 'quack',
  },
];

export const ACT82_RAGNAROK_PHASE3_LINES: DialogueLine[] = [
  {
    speaker: 'Emperor Fenrir',
    portrait: 'fenrir_beast',
    text: 'AWAKEN, ANCIENT WORLD-SPIRIT OF DIREFANG! Merge with my soul—unleash the Three-Headed Cosmic Wolf-Dragon: RAGNAROK, THE PRIMORDIAL WORLD-HOUND!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 128 },
  },
  {
    speaker: 'King Leo & The Great Duck',
    portrait: 'king_leo',
    text: 'Phase 3 (100,000 HP)! Break Ragnarok’s Stagger Gauge so the three of us can unleash our 25,000 DMG TRIPLE KINGDOM ULTIMATE SLASH together!',
    sound: 'chime',
  },
];

export const ADVISOR_QUEST_LINES: DialogueLine[] = [
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'Clear each Act’s foes to unlock the East Portal! Use [MAP] anytime to fast-travel across unlocked Acts and upgrade gear at Forgepaw’s anvil.',
    sound: 'talk',
  },
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'Watch for red enemy telegraphs or glowing traps—dodging [SHIFT] right before impact triggers a ⚡ PERFECT DODGE (+1 Stamina & 2.5x Arcane Crit)!',
    sound: 'chime',
  },
];

export const ADVISOR_ELIXIR_LINES: DialogueLine[] = [
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'The Great Duck’s Elixir gleams on your belt! Enter Act 41 to free King Leo, then lead our armies into the War of the Two Kingdoms (Acts 42–82)!',
    sound: 'chime',
  },
];

export const WAR_ADVISOR_LINES: DialogueLine[] = [
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'Welcome to the War of the Two Kingdoms (Acts 42–82)! King Leo’s Royal Vanguard fights beside you in every warfront zone!',
    sound: 'talk',
  },
  {
    speaker: 'Advisor Whiskers',
    portrait: 'advisor',
    text: 'Push through the 8 Direfang War Biomes to reach Act 81’s Supreme War Council Pavilion and storm the Obsidian Colosseum in Act 82!',
    sound: 'chime',
  },
];

export const KING_LEO_WAR_CAMP_LINES: DialogueLine[] = [
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Well met on the frontlines, Grand Archmage Nyx! Now that my strength has returned, my Royal Lion-Guard marches with you across Acts 42 to 82!',
    sound: 'chime',
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Whenever you need to recover on the battlefield, press [B] for Cat Bread Loaf Form (+5 HP/s & 40% Crust Guard) or [R] to blow the War-Horn!',
    sound: 'talk',
  },
];

export const GREAT_DUCK_FIRST_LINES: DialogueLine[] = [
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK! At last you have arrived in Act 40, little wizard Nyx! Across 39 perilous trials, your starry hat never wavered! *gentle wing pat*',
    sound: 'quack',
    cameraTarget: { x: 296, y: 108 },
  },
  {
    speaker: 'Nyx',
    portrait: 'pip_happy',
    text: 'Meow~! Great Duck! I battled goblins, bears, hydras, and griffins to reach your Lotus Sanctum. Please—help me save King Leo!',
    sound: 'talk',
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'Drink this Astral Quack Elixir (The Great Duck’s Potion [Q]) when facing Fenrir! It grants an 8-second window to shatter his Dark Barrier, and refills when you gather 5 Golden Feathers!',
    sound: 'quack',
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'Before you enter the Golden Warp to Act 41, open the Tier 10 Relic chests below! How do you answer, Nyx?',
    sound: 'chime',
    choices: [
      {
        id: 'duck_blessing',
        label: '“I swear to shatter Fenrir’s barrier!” (+100 Gold)',
        effect: 'duck_catnip',
        replyLines: [
          {
            speaker: 'The Great Duck',
            portrait: 'great_duck',
            text: 'Heroic wizard-knight! Take 100 Sanctuary Gold and step into the Golden Warp to Act 41!',
            sound: 'chime',
          },
        ],
      },
      {
        id: 'duck_pet',
        label: '“Can I pat your lucky wizard feathers first? (^ω^)”',
        effect: 'duck_pet',
        replyLines: [
          {
            speaker: 'The Great Duck',
            portrait: 'great_duck',
            text: 'QUACK-HAHA! *happy wing ruffle* Take these Lucky Fish Treats and soar into Act 41!',
            sound: 'quack',
          },
        ],
      },
    ],
  },
];

export const GREAT_DUCK_REPEAT_LINES: DialogueLine[] = [
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK! Open the Relic Vaults below, then take the Golden Warp to the Throne Room (or test your mettle at the Boss Rush Shrine)!',
    sound: 'quack',
  },
];

export const FENRIR_INTRO_LINES: DialogueLine[] = [
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'So the little black wizard-cat survived 40 Acts just to kneel before the Starlight Gem Wand?',
    sound: 'roar',
    cameraTarget: { x: 304, y: 112 },
  },
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'My Dark Starlight Barrier absorbs 90% of all damage! And my Eclipse Supernova & Phantom Omni-Slash will turn you to stardust!',
    sound: 'talk',
    cameraTarget: { x: 304, y: 112 },
  },
  {
    speaker: 'Nyx',
    portrait: 'pip_determined',
    text: 'Oh yeah?! Time to uncork The Great Duck’s Potion [Q] to shatter his barrier and dodge his Special Skills!',
    sound: 'chime',
  },
];

export const FENRIR_SHIELD_SHATTER_LINES: DialogueLine[] = [
  {
    speaker: 'Nyx',
    portrait: 'pip_happy',
    text: 'Astral Quack Alchemy—AWAKEN! (^ω^) -> (>ω<)',
    sound: 'chime',
  },
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'IMPOSSIBLE! Golden Duck feathers shattered my Starlight Barrier?! Come face the Usurper King!',
    sound: 'roar',
  },
];

export const FENRIR_PHASE2_LINES: DialogueLine[] = [
  {
    speaker: 'Usurper King Fenrir',
    portrait: 'fenrir',
    text: 'NRGH! How does a tiny cat in a crooked hat match my might?! Starlight Gem—OVERLOAD MY SOUL!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 128 },
  },
  {
    speaker: 'Nyx',
    portrait: 'pip_shocked',
    text: 'Meow!! He devoured the Gem’s raw core! Watch out for his Eclipse Supernova and Phantom Omni-Slash!',
    sound: 'talk',
  },
  {
    speaker: 'Calamity Overlord Fenrir',
    portrait: 'fenrir_beast',
    text: 'ROOOOAR! Witness the 48-cubit Calamity Beast! Let starfall and shadow consume Felis Citadel!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 128 },
  },
];

export const EMPEROR_VARGOS_INTRO_LINES = ACT82_CHARIOT_INTRO_LINES;

// ============================================================================
// ARC III (ACTS 83–122): THE DRAGON CATACLYSM AFTER THE PEACE
// ============================================================================
export const ACT82_TO_83_CATACLYSM_LINES: DialogueLine[] = [
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'The Eternal Peace Treaty is signed! Cats and Dogs raise their banners together at last!',
    sound: 'chime',
    sceneCue: 'cataclysm_1',
  },
  {
    speaker: 'Wolf-King Fenrir',
    portrait: 'fenrir',
    text: 'My packs swear honor to Felis Citadel. Never again shall—WAIT! Look at the sky!!',
    sound: 'roar',
    sceneCue: 'cataclysm_1',
  },
  {
    speaker: 'Ignis-Bahamut',
    portrait: 'bahamut',
    text: 'KRAOOOOH!! Puny furballs celebrating peace?! Your Starlight Gem Wand and Sacred Golden Cauldron belong to the DRAGON SOVEREIGN!',
    sound: 'roar',
    sceneCue: 'cataclysm_2',
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUAAACK!! Ignis-Bahamut shattered the Peace Monument and scattered 8 Dragon-Scale Shards across the world!',
    sound: 'quack',
    sceneCue: 'cataclysm_2',
  },
  {
    speaker: 'Nyx',
    portrait: 'pip_determined',
    text: 'Cats AND Dogs unite! We will march through all 40 Dragon Acts (Acts 83–122) and take back our relics!',
    sound: 'chime',
    sceneCue: 'cataclysm_2',
  },
];

export const ACT121_UNITED_SANCTUM_LINES: DialogueLine[] = [
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Welcome to the United Sanctum, Nyx! Cats, Dogs, and Ducks have forged our pinnacle relics from the 8 Dragon-Scale Shards!',
    sound: 'chime',
    cameraTarget: { x: 224, y: 112 },
  },
  {
    speaker: 'Wolf-King Fenrir',
    portrait: 'fenrir',
    text: 'My Dog Kingdom Vanguard stands beside you! Claim the Tier 30 Eternal Dragon-Slayer Omni-Blade and Omni-Crown Mantle in the vaults below!',
    sound: 'roar',
    cameraTarget: { x: 296, y: 112 },
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK! Your Elixir [Q] is now upgraded to the 20s Dragon-God Quack Elixir for Act 122! Step into the Sky-Warp to confront Ignis-Bahamut!',
    sound: 'quack',
    cameraTarget: { x: 368, y: 112 },
  },
];

export const ACT122_BAHAMUT_P1_LINES: DialogueLine[] = [
  {
    speaker: 'Ignis-Bahamut',
    portrait: 'bahamut',
    text: 'Fools of fur and feather! Witness 500,000 HP of primordial dragonfire! My Starlight-Dragon Barrier deflects your blades!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 112 },
  },
  {
    speaker: 'Wolf-King Fenrir',
    portrait: 'fenrir',
    text: 'Cats and Dogs—CHARGE! Nyx, uncork your Dragon-God Quack Elixir [Q] to shatter Bahamut’s scale barrier!',
    sound: 'roar',
  },
];

export const ACT122_BAHAMUT_P2_LINES: DialogueLine[] = [
  {
    speaker: 'Ignis-Bahamut',
    portrait: 'bahamut',
    text: 'GAH!! You pierced my scales?! Then burn from the heavens in CATACLYSM SKY-FLIGHT!!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 140 },
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Nyx! Capture & fire the West/East Dragon-Harpoon Ballista Beacons to shoot Bahamut out of the sky for 50,000 DMG!',
    sound: 'chime',
  },
];

export const ACT122_BAHAMUT_P3_LINES: DialogueLine[] = [
  {
    speaker: 'Ignis-Bahamut',
    portrait: 'bahamut',
    text: 'UNTHINKABLE! I unveil my Six-Winged SUPERNOVA WORLD-BREAKER FORM! ALL ASHES! ALL STARFIRE!',
    sound: 'roar',
    cameraTarget: { x: 304, y: 130 },
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK!! Nyx, King Leo, Wolf-King Fenrir, and I will strike together with the Four-Hero United Kingdom Finisher! FINISH HIM!',
    sound: 'quack',
  },
];

export const ACT122_GOLDEN_AGE_EPILOGUE_LINES: DialogueLine[] = [
  {
    speaker: 'Nyx',
    portrait: 'pip_happy',
    text: 'Meow-victory!! Ignis-Bahamut is vanquished! The Starlight Gem Wand and Golden Cauldron shine bright once more!',
    sound: 'chime',
    sceneCue: 'epilogue_1',
  },
  {
    speaker: 'King Leo',
    portrait: 'king_leo',
    text: 'Across 122 Acts, Nyx the Wizard Cat saved Felis Citadel, united the Cat & Dog Kingdoms, and conquered the Dragon Cataclysm!',
    sound: 'chime',
    sceneCue: 'epilogue_2',
  },
  {
    speaker: 'Wolf-King Fenrir',
    portrait: 'fenrir',
    text: 'Claws and Fangs forever stand as one! Long live Champion Nyx of the Eternal Omni-Crown!',
    sound: 'roar',
    sceneCue: 'epilogue_3',
  },
  {
    speaker: 'The Great Duck',
    portrait: 'great_duck',
    text: 'QUACK-SOLUTE PERFECTION! Welcome to the Golden Age of Cats, Dogs & The Great Duck! Celebrate in peace—or test Nightmare NG+!',
    sound: 'quack',
    sceneCue: 'epilogue_4',
  },
];
