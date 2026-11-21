export type GameMode =
  | 'TITLE'
  | 'INTRO_CUTSCENE'
  | 'EPILOGUE_CUTSCENE'
  | 'PLAYING'
  | 'DIALOGUE'
  | 'INVENTORY'
  | 'BLACKSMITH'
  | 'WORLD_MAP'
  | 'CAPITAL_HUB'
  | 'SKILL_TREE'
  | 'GAME_OVER'
  | 'VICTORY';

export type PlayableHeroId = 'nyx' | 'king_leo' | 'fenrir' | 'great_duck';

export type WeaponMutationId = 'none' | 'gargantuan' | 'prism' | 'primordial';

export type ElementalGemId = 'none' | 'ruby_flame' | 'sapphire_frost' | 'emerald_venom' | 'topaz_storm' | 'void_onyx';

export type BiomeId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 'sanctuary'
  | 'throne'
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 'war_sanctuary'
  | 'imperial_throne'
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 'dragon_sanctuary'
  | 'sky_throne'
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 'abyss_sanctuary'
  | 'kraken_trench'
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 'clockwork_sanctuary'
  | 'chrono_citadel'
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 'multiverse_sanctuary'
  | 'eclipse_singularity';

export type Direction = 'down' | 'up' | 'left' | 'right';

export type CatFurId = 'nyx_void' | 'ginger' | 'tuxedo' | 'calico' | 'persian' | 'cyber_noir' | 'starlight';

export type CatEmoteId = 'none' | 'bread_loaf' | 'making_biscuits' | 'purr_love' | 'eepy_croissant' | 'zoomie_blep';

export type GearSlot = 'weapon' | 'armor';

export type GearTier =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30;

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  tier: GearTier;
  atkBonus: number;
  defBonus: number;
  hpBonus: number;
  critBonus: number; // 0..100 percent
  swordBeam?: boolean;
  description: string;
  upgradeLevel: number; // +0 to +25★
  starLevel?: number;
  mutation?: WeaponMutationId;
  socketedGem?: ElementalGemId;
}

export type PortraitId =
  | 'pip'
  | 'pip_happy'
  | 'pip_determined'
  | 'pip_shocked'
  | 'king_leo'
  | 'advisor'
  | 'blacksmith'
  | 'great_duck'
  | 'grommash'
  | 'brambleback'
  | 'viperfang'
  | 'fenrir'
  | 'fenrir_beast'
  | 'bahamut';

export type CutsceneCue =
  | 'prologue_1'
  | 'prologue_2'
  | 'prologue_3'
  | 'prologue_4'
  | 'epilogue_1'
  | 'epilogue_2'
  | 'epilogue_3'
  | 'epilogue_4'
  | 'cataclysm_1'
  | 'cataclysm_2'
  | 'abyss_1'
  | 'clockwork_1'
  | 'multiverse_1';

export interface DialogueChoice {
  id: string;
  label: string;
  effect?: 'duck_pet' | 'duck_catnip' | 'leo_feast' | 'leo_rush' | 'leo_war_campaign' | 'leo_dragon_campaign';
  replyLines: DialogueLine[];
}

export interface DialogueLine {
  speaker: string;
  portrait: PortraitId;
  text: string;
  sound?: 'talk' | 'quack' | 'roar' | 'chime';
  cameraTarget?: { x: number; y: number } | null;
  sceneCue?: CutsceneCue;
  choices?: DialogueChoice[];
}

export type EnemyKind =
  | 'goblin_grunt'
  | 'goblin_archer'
  | 'rabid_boar'
  | 'razor_badger'
  | 'hound_scout'
  | 'shadow_wolf'
  | 'sporeling'
  | 'ice_golem'
  | 'lava_salamander'
  | 'swamp_croc'
  | 'celestial_sentinel'
  | 'grommash'
  | 'brambleback'
  | 'mycora'
  | 'general_vane'
  | 'cryo_fang'
  | 'volcanis'
  | 'viperfang'
  | 'aether_wing'
  | 'fenrir_p1'
  | 'fenrir_p2'
  | 'wyvern_kin'
  | 'drakonid_lancer'
  | 'kobold_thief'
  | 'magma_drake'
  | 'void_sorcerer'
  | 'dragon_boss'
  | 'bahamut_p1'
  | 'bahamut_p2'
  | 'bahamut_p3'
  | 'crab_corsair'
  | 'shark_knight'
  | 'siren_mage'
  | 'abyssal_eel'
  | 'kraken_tentacle'
  | 'charybdis_kraken'
  | 'clockwork_owl'
  | 'cyber_rat'
  | 'steam_golem'
  | 'tesla_drone'
  | 'chronos_omega'
  | 'void_stalker'
  | 'nebula_seraph'
  | 'entropy_knight'
  | 'void_clone_nyx'
  | 'aether_null';

export type CatCoatId =
  | 'ginger_tabby'
  | 'tuxedo'
  | 'calico_tri'
  | 'siamese_royal'
  | 'russian_blue'
  | 'golden_lion';

export type DogBreedId =
  | 'bulldog_phalanx'
  | 'doberman_shock'
  | 'husky_raider'
  | 'bloodhound_gunner';

export interface UnitVisualVariant {
  coatId: CatCoatId;
  breedId?: DogBreedId;
  helmetId: number; // 0..4
  weaponId: number; // 0..3
  shieldEmblemColor: string;
  eyeColor: string;
  scarOrStripe: number; // 0..3
  animPhaseOffset: number; // 0..2*PI
}

export type DragonPartKey = 'wings' | 'tail' | 'core' | 'head';

export type DragonAltitude = 'ground' | 'sky' | 'exhausted';

export interface DragonBossState {
  wingsHp: number;
  wingsMaxHp: number;
  wingsBroken: boolean;
  tailHp: number;
  tailMaxHp: number;
  tailSevered: boolean;
  coreCracked: boolean;
  headExposedTimer: number;
  altitude: DragonAltitude;
  skyHeight: number; // 0 (ground) .. 1 (high sky)
  flightTimer: number;
  flightCooldown: number;
  harpoonChainsHit: number;
  windGaleTimer: number;
  windGaleWindup: number;
  tailWhipTimer: number;
  tailWhipWindup: number;
  breathWindup: number;
  breathAngle: number;
  carpetBombTimer: number;
  hoardTheftTimer: number;
  hoardTheftWindup: number;
  supernovaWindup: number;
  supernovaPhase3Triggered?: boolean;
  skyAmbushTriggered?: boolean;
  lastHitPart?: DragonPartKey;
}

export interface DragonBallista {
  id: string;
  x: number;
  y: number;
  cornerLabel: string;
  cooldown: number;
  maxCooldown: number;
  aimAngle: number;
  lockedOn: boolean;
  autoCrewTimer: number;
}

export interface HoardTreasurePile {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  stolenGold: number;
  stolenPotions: number;
  stoleElixir: boolean;
  stolenGearAtkDebuff: number;
  stolenGearLabel: string | null;
  life: number;
}

export interface UpdraftGeyser {
  id: string;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface AegisDomeState {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
}

export interface DragonMountState {
  active: boolean;
  dragonEnemyId: string;
  dragonName: string;
  timer: number;
  maxTimer: number;
  playerLaneX: number; // -1 .. 1 across spine width
  playerSpineY: number; // 0 (tail end) .. 1 (neck gem)
  scrollOffset: number;
  neckGemHits: number;
  slashCooldown: number;
  slashAnimTimer: number;
  dodgeTimer: number;
  dodgeCooldown: number;
  lightningSpikes: Array<{ laneX: number; spineY: number; warn: number; active: number }>;
  spikeSpawnTimer: number;
}

export interface Enemy {
  id: string;
  kind: EnemyKind;
  bossVisualId?: string;
  variant?: UnitVisualVariant;
  name: string;
  isBoss: boolean;
  isMiniBoss: boolean;
  archetype:
    | 'grunt'
    | 'ranged'
    | 'charger'
    | 'warlord'
    | 'bear'
    | 'hydra'
    | 'mage'
    | 'fenrir_p1'
    | 'fenrir_p2'
    | 'dragon'
    | 'bahamut';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  facing: Direction;
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'recover' | 'charge' | 'teleport';
  stateTimer: number;
  windupDuration: number;
  attackCooldown: number;
  hitFlash: number;
  animFrame: number;
  animTimer: number;
  homeX: number;
  homeY: number;
  xpReward: number;
  goldReward: number;
  shielded?: boolean; // 99% Damage Reduction barrier for Fenrir P1 before Duck Potion
  bossPhase?: 1 | 2 | 3;
  attackPatternIndex: number;
  chargeDirX: number;
  chargeDirY: number;
  dropGearId?: string;
  stagger?: number;
  maxStagger?: number;
  stunTimer?: number;
  overdrive?: boolean;
  isWolfCaptain?: boolean;
  consecutiveHits?: number;
  counterStanceTimer?: number;
  counterCooldown?: number;
  specialSkillCooldown?: number;
  specialSkillIndex?: number;
  dragonState?: DragonBossState;
  phaseGatesTriggered?: number[];
  isInvulnerablePhaseGate?: boolean;
  phaseGateTimer?: number;
  phaseGateTick?: number;
  phaseGateMeteorTick?: number;
  siphonSpawnCooldown?: number;
  dashComboRemaining?: number;
}

export interface PhaseLockPillar {
  id: string;
  bossId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
}

export interface SiphonObelisk {
  id: string;
  bossId: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  hitFlash: number;
}

export interface GoldenFeatherPickup {
  id: string;
  x: number;
  y: number;
  vy: number;
  life: number;
}

export type AlliedCatUnitKind =
  | 'cat_knight'
  | 'lion_halberdier'
  | 'calico_archer'
  | 'arcane_cat_mage'
  | 'bulldog_paladin'
  | 'doberman_blade'
  | 'husky_berserker'
  | 'wolf_captain';

export interface AlliedCatSoldier {
  id: string;
  kind: AlliedCatUnitKind;
  variant?: UnitVisualVariant;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  atk: number;
  speed: number;
  facing: Direction;
  attackCooldown: number;
  hitFlash: number;
  rallyTimer: number;
  animFrame: number;
  animTimer: number;
}

export interface WarBanner {
  id: string;
  x: number;
  y: number;
  radius: number;
  captureProgress: number; // 0..100
  captured: boolean;
  label: string;
}

export interface PrisonCage {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  broken: boolean;
  unitKind: AlliedCatUnitKind;
}

export interface SiegeEngine {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  fireTimer: number;
  destroyed: boolean;
}

export interface Projectile {
  id: string;
  fromPlayer: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  life: number;
  maxLife: number;
  color: string;
  coreColor: string;
  kind:
    | 'arrow'
    | 'poison'
    | 'gem_shard'
    | 'gem_laser'
    | 'sword_beam'
    | 'thorn'
    | 'lightning_orb'
    | 'shockwave'
    | 'water_bubble'
    | 'ice_shard'
    | 'fireball';
  homing?: boolean;
  pierce?: boolean;
  reflectable?: boolean;
  applyMortalWound?: boolean;
}

export interface HazardPool {
  id: string;
  x: number;
  y: number;
  radius: number;
  life: number;
  kind: 'mud' | 'poison' | 'meteor_warn' | 'lightning_line' | 'lava' | 'ice_spike';
  damagePerSec: number;
  x2?: number;
  y2?: number;
  triggered?: boolean;
  applyMortalWound?: boolean;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  gold: number;
  potions: number;
  gearId?: string;
  label: string;
  requiresActClear?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  spriteId: 'advisor' | 'blacksmith' | 'great_duck' | 'king_leo' | 'fenrir';
  x: number;
  y: number;
  width: number;
  height: number;
  promptText: string;
}

export interface Portal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'next' | 'prev' | 'sanctuary_warp' | 'boss_rush';
  targetAct: number;
  label: string;
  isGolden?: boolean;
}

export type TrapKind =
  | 'spike_trap'
  | 'flame_geyser'
  | 'spore_vent'
  | 'frost_crystal'
  | 'arrow_turret'
  | 'void_pillar';

export interface Trap {
  id: string;
  kind: TrapKind;
  x: number;
  y: number;
  radius: number;
  cycleTime: number;
  timer: number;
  activeDuration: number;
  warnDuration: number;
  damage: number;
  dirX?: number;
  dirY?: number;
  firedThisCycle?: boolean;
}

export type BiomeFeatureKind =
  | 'tripwire_log'
  | 'leaf_pitfall'
  | 'bear_trap'
  | 'rolling_boulder'
  | 'bouncy_mushroom'
  | 'puffball_spore'
  | 'wind_gust'
  | 'buzzsaw'
  | 'cracking_ice'
  | 'minecart'
  | 'whirlpool'
  | 'warp_mirror'
  | 'landmine'
  | 'ferry_barge'
  | 'rockslide_lever'
  | 'wind_turbine'
  | 'campfire_brazier'
  | 'conveyor_belt'
  | 'crusher_piston'
  | 'battering_ram'
  | 'chandelier_drop'
  | 'electric_tile'
  | 'water_barrel'
  | 'greed_chest'
  | 'gold_laser'
  | 'lightning_rod'
  | 'tornado'
  | 'acid_tide_zone'
  | 'chrono_dome'
  | 'firebar'
  | 'updraft_pad';

export interface BiomeFeature {
  id: string;
  kind: BiomeFeatureKind;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  radius: number;
  timer: number;
  cooldown: number;
  active: boolean;
  triggered: boolean;
  dirX: number;
  dirY: number;
  angle: number;
  pairX?: number;
  pairY?: number;
  damage: number;
  hp?: number;
  progress?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale?: number;
}

export interface ToastItem {
  id: string;
  text: string;
  accent: 'gold' | 'cyan' | 'emerald' | 'amber';
  life: number;
}

export type CapitalBuildingId =
  | 'alchemy_brewery'
  | 'star_anvil_forge'
  | 'united_barracks'
  | 'sacred_lotus_pond'
  | 'royal_guild_hall'
  | 'mystic_wardrobe'
  | 'minecart_quarry'
  | 'lumber_mill'
  | 'chiptune_tavern'
  | 'sky_airship_dock'
  | 'abyssal_pearl_harbor'
  | 'astral_observatory';

export interface KingdomResources {
  wood: number;
  iron: number;
  dragonScales: number;
  abyssalPearls: number;
  chronoGears: number;
  voidCrystals: number;
}

export interface BrewedPotionItem {
  id: string;
  name: string;
  effectKind:
    | 'napalm_fire'
    | 'electro_stun'
    | 'cryo_shatter'
    | 'healing_lotus'
    | 'void_singularity'
    | 'berserk_frenzy'
    | 'duck_feather_burst'
    | 'chrono_haste'
    | 'acid_corrosion'
    | 'prism_nova';
  count: number;
  power: number;
  color: string;
  description: string;
}

export interface PartyCompanion {
  heroId: PlayableHeroId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  atk: number;
  facing: Direction;
  attackCooldown: number;
  skillCooldown: number;
  hitFlash: number;
  animFrame: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: Direction;
  activeHeroId: PlayableHeroId;
  unlockedHeroes: PlayableHeroId[];
  partyCompanions: PartyCompanion[];
  hp: number;
  maxHp: number;
  baseMaxHp: number;
  baseAtk: number;
  baseDef: number;
  stamina: number;
  maxStamina: number;
  staminaRegenTimer: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  fishTreats: number;
  materials: number;
  healthPotions: number;
  hasDuckElixir: boolean;
  duckElixirActive: boolean;
  duckElixirTimer: number;
  duckElixirMaxTimer: number;
  duckElixirCooldown: number;
  elixirFeathers: number;
  duckElixirBurstTimer: number;
  duckSummonCooldown: number;
  dragonSlayerFuryTimer: number;
  happyJumpTimer: number;
  perfectDodgeEmpowered: boolean;
  stunTimer: number;
  mortalWoundTimer: number;
  potionCooldown: number;
  potionMaxCooldown: number;
  furId: CatFurId;
  activeEmote: CatEmoteId;
  emoteTimer: number;
  alchemyRelics: {
    primalGuardian: boolean;
    nekoThrusters: boolean;
    seaCompass: boolean;
  };
  equippedWeaponId: string;
  equippedArmorId: string;
  inventory: GearItem[];
  // Omniverse Expansion State
  starPoints: number;
  unlockedSkills: string[];
  capitalBuildings: Record<CapitalBuildingId, number>;
  kingdomResources: KingdomResources;
  brewedPotions: BrewedPotionItem[];
  equippedBrewId: string;
  brewTossCooldown: number;
  steamMechaActive: boolean;
  steamMechaTimer: number;
  steamMechaCooldown: number;
  oxygenPct: number;
  autoReviveAvailable: boolean;
  // Combat timers
  attackTimer: number;
  attackCooldown: number;
  comboStep: 0 | 1 | 2 | 3;
  comboResetTimer: number;
  attackAngle: number;
  dodgeTimer: number;
  dodgeCooldown: number;
  dodgeDirX: number;
  dodgeDirY: number;
  invulnTimer: number;
  hitFlash: number;
  animFrame: number;
  animTimer: number;
  afterimages: Array<{ x: number; y: number; alpha: number; facing: Direction }>;
}

export interface StoryFlags {
  spokeToAdvisor: boolean;
  spokeToGreatDuck: boolean;
  fenrirIntroSeen: boolean;
  fenrirShieldBroken: boolean;
  fenrirPhase2Triggered: boolean;
  fenrirDefeated: boolean;
  dragonCataclysmSeen?: boolean;
  bahamutDefeated?: boolean;
  charybdisDefeated?: boolean;
  chronosDefeated?: boolean;
  voidCloneDefeated?: boolean;
  aetherNullDefeated?: boolean;
}

export interface RunStats {
  elapsedSeconds: number;
  enemiesSlain: number;
  damageDealt: number;
  goldCollected: number;
  fishTreatsCollected: number;
  potionsUsed: number;
  perfectDodges: number;
  deaths: number;
}

export interface ActSummary {
  act: number;
  title: string;
  biomeId: BiomeId;
  biomeName: string;
  role: 'normal' | 'miniboss' | 'boss' | 'sanctuary' | 'final_boss';
  terrainTag: string;
}

export interface HUDState {
  mode: GameMode;
  currentAct: number;
  maxUnlockedAct: number;
  clearedActs: number[];
  actTitle: string;
  biomeName: string;
  terrainTag: string;
  nightmareMode: boolean;
  nightmareUnlocked: boolean;
  hasSavedGame: boolean;
  activeHeroId: PlayableHeroId;
  unlockedHeroes: PlayableHeroId[];
  partyCompanions: Array<{ heroId: PlayableHeroId; name: string; hp: number; maxHp: number }>;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  mortalWoundTimer: number;
  potionCooldown: number;
  potionMaxCooldown: number;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  fishTreats: number;
  materials: number;
  healthPotions: number;
  hasDuckElixir: boolean;
  duckElixirActive: boolean;
  duckElixirTimer: number;
  duckElixirMaxTimer: number;
  duckElixirCooldown: number;
  elixirFeathers: number;
  duckSummonCooldown: number;
  warHornActive: boolean;
  dragonSlayerFuryTimer: number;
  warMorale: number;
  alliedUnitCount: number;
  capturedBanners: number;
  totalBanners: number;
  perfectDodgeEmpowered: boolean;
  furId: CatFurId;
  activeEmote: CatEmoteId;
  alchemyRelics: {
    primalGuardian: boolean;
    nekoThrusters: boolean;
    seaCompass: boolean;
  };
  starPoints: number;
  unlockedSkills: string[];
  capitalBuildings: Record<CapitalBuildingId, number>;
  kingdomResources: KingdomResources;
  brewedPotions: BrewedPotionItem[];
  equippedBrewId: string;
  brewTossCooldown: number;
  steamMechaActive: boolean;
  steamMechaTimer: number;
  steamMechaCooldown: number;
  oxygenPct: number;
  bossRushStage: number | null;
  equippedWeapon: GearItem;
  equippedArmor: GearItem;
  inventory: GearItem[];
  totalAtk: number;
  totalDef: number;
  totalCrit: number;
  questText: string;
  interactPrompt: string | null;
  dragonMount: {
    active: boolean;
    dragonName: string;
    timer: number;
    maxTimer: number;
    neckGemHits: number;
  } | null;
  activeBoss: {
    name: string;
    hp: number;
    maxHp: number;
    totalCampaignHp?: number;
    totalCampaignMaxHp?: number;
    phaseText: string;
    shielded: boolean;
    stagger: number;
    maxStagger: number;
    stunned: boolean;
    overdrive: boolean;
    counterStance: boolean;
    phaseGateActive?: boolean;
    phaseGateTimer?: number;
    siphonCount?: number;
    cataclysmBorderPct?: number;
    krakenTentaclesAlive?: number;
    chronoGearsAlive?: number;
    singularityPullActive?: boolean;
    dragonRaid?: {
      altitude: DragonAltitude;
      wingsHp: number;
      wingsMaxHp: number;
      wingsBroken: boolean;
      tailHp: number;
      tailMaxHp: number;
      tailSevered: boolean;
      coreCracked: boolean;
      headExposedTimer: number;
      harpoonChainsHit: number;
      hoardActive: boolean;
      supernovaWarning: boolean;
      lastHitPart?: DragonPartKey;
    };
  } | null;
  dialogue: {
    lines: DialogueLine[];
    index: number;
    displayedChars: number;
    isCutscene: boolean;
  } | null;
  toasts: ToastItem[];
  story: StoryFlags;
  stats: RunStats;
  muted: boolean;
  screenShakeEnabled: boolean;
  currentTrackTitle: string;
  nearBlacksmith: boolean;
  actsSummary: ActSummary[];
}
