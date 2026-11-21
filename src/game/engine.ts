import {
  ACTS_SUMMARY,
  BIOME_PALETTES,
  findNearestDryTile,
  GeneratedActWorld,
  generateActWorld,
  getActConfig,
  getArcConfig,
  isTileIce,
  isTileLavaHazard,
  isTileMud,
  isTileSolid,
  isWalkableTile,
  renderActBackground,
  snapEntityToDryLand,
  spawnAlliedSoldier,
  spawnEnemy,
  TILE_SIZE,
} from './acts';
import { audio } from './audio';
import { BiomeMechanicsCallbacks, BiomeMechanicsController } from './biomeMechanics';
import { getAlliedCatVariantSprite, getBossSprite, getEnemyVariantSprite } from './bossSprites';
import {
  DragonBossController,
  DragonCombatCallbacks,
  ensureDragonState,
  isDragonBossEnemy,
  resolveDragonHitPart,
} from './dragonController';
import {
  createGearInstance,
  GEAR_CATALOG,
  getBlacksmithForgeCost,
  getTier30CraftRequirements,
  getUpgradeCost,
} from './gear';
import { getSpriteBank, SpriteBank } from './sprites';
import { TitleArenaSimulator } from './titleArenaSim';
import { canUnlockExitPortal } from '../engine/kingdomWarAndCounterWaves';
import {
  attachIpadLifecycleAutosave,
  createScaledActRestorePayload,
  saveToVault,
} from '../ui/ipadSaveVaultEngine';
import type { COTCSavePayloadV6 } from '../types/saveAndProgression';
import {
  ACT82_CHARIOT_INTRO_LINES,
  ACT82_DUAL_SOVEREIGN_PHASE2_LINES,
  ACT82_RAGNAROK_PHASE3_LINES,
  ACT82_TO_83_CATACLYSM_LINES,
  ACT121_UNITED_SANCTUM_LINES,
  ACT122_BAHAMUT_P1_LINES,
  ACT122_BAHAMUT_P2_LINES,
  ACT122_BAHAMUT_P3_LINES,
  ACT122_GOLDEN_AGE_EPILOGUE_LINES,
  ADVISOR_ELIXIR_LINES,
  ADVISOR_QUEST_LINES,
  FENRIR_INTRO_LINES,
  FENRIR_PHASE2_LINES,
  FENRIR_SHIELD_SHATTER_LINES,
  GREAT_DUCK_FIRST_LINES,
  GREAT_DUCK_REPEAT_LINES,
  INTRO_CUTSCENE_LINES,
  KING_LEO_WAR_CAMP_LINES,
  VICTORY_CUTSCENE_LINES,
  WAR_ADVISOR_LINES,
  WAR_COUNCIL_ACT81_ADVISOR_LINES,
  WAR_COUNCIL_ACT81_LINES,
  WAR_FINALE_VICTORY_LINES,
} from './story';
import {
  AlliedCatSoldier,
  CatEmoteId,
  CatFurId,
  Chest,
  DialogueLine,
  Direction,
  Enemy,
  FloatingText,
  GameMode,
  GearItem,
  GoldenFeatherPickup,
  HazardPool,
  HUDState,
  PhaseLockPillar,
  PlayerState,
  Portal,
  PrisonCage,
  Projectile,
  RunStats,
  SiegeEngine,
  SiphonObelisk,
  StoryFlags,
  ToastItem,
  Trap,
  WarBanner,
  PlayableHeroId,
  CapitalBuildingId,
  KingdomResources,
  BrewedPotionItem,
  ElementalGemId,
} from './types';
import { PixelVfxEngine } from './vfx';
import {
  BREWABLE_POTION_CATALOG,
  computeGearEffectiveStats,
  ELEMENTAL_GEMS,
  resolveCauldronRecipe,
  rollWeaponMutation,
  WEAPON_MUTATIONS,
} from './alchemyForgeEngine';
import {
  BossRaidRuntimeState,
  createInitialBossRaidState,
  HERO_METADATA,
  syncPartyCompanions,
  updateOmniverseBossMechanics,
  updatePartyCompanionsAI,
} from './bossRaidEngine';
import {
  ACT180_CHARYBDIS_INTRO_LINES,
  ACT240_CHRONOS_INTRO_LINES,
  ACT280_VOID_CLONE_LINES,
  ACT300_AETHER_NULL_INTRO_LINES,
  ACT300_OMNIVERSE_VICTORY_LINES,
  ARC4_INTRO_LINES,
  ARC5_INTRO_LINES,
} from './cutsceneDirector';
import {
  CAPITAL_BUILDINGS,
  computeCapitalBonuses,
  createInitialCapitalBuildings,
  createInitialKingdomResources,
  getBuildingStageLabel,
  getBuildingUpgradeCost,
} from './kingdomBuilderEngine';
import { computeSkillTreeBonuses, SKILL_TREE_NODES } from './skillTreeData';
import {
  exportSaveToCode,
  getTrackForAct,
  importSaveFromCode,
  mirrorSaveToIndexedDB,
} from './soundtrackSequencer';
import {
  drawLivingHeroDetails,
  getOmniverseSprites,
  OmniverseSpritePack,
} from './spritesEngine';
import { getActBlueprint } from '../engine/dungeonRoomCompiler';
import {
  ActiveDestructibleProp,
  computeHighGroundCombatMultiplier,
  createInitialSurfacePhysicsState,
  damageDestructiblePropsInRadius,
  getTileElevation,
  renderDynamicTopographyOverlays,
  spawnActDestructibleProps,
  SurfacePhysicsState,
  updateSurfacePhysics,
} from '../engine/terrainTopographyEngine';
import { renderRiverHydrologyEffects } from '../engine/riverHydrologyEngine';
import {
  initActTrapSystem,
  renderBespokeTrapEffects,
  TrapSystemState,
  updateAndCheckTrapHazards,
} from '../engine/trapPhysicsEngine';
import { renderActLandmarkPlace } from '../engine/landmarkRenderer';

export const LOGICAL_W = 480;
export const LOGICAL_H = 270;
const SAVE_KEY = 'claws_crown_nyx_41_v1';

interface SavedCampaignData {
  version: number;
  currentAct: number;
  maxUnlockedAct: number;
  clearedActs: number[];
  nightmareMode: boolean;
  nightmareUnlocked: boolean;
  openedChestIds: string[];
  player: {
    level: number;
    xp: number;
    xpToNext: number;
    baseMaxHp: number;
    baseAtk: number;
    baseDef: number;
    gold: number;
    fishTreats: number;
    materials: number;
    healthPotions: number;
    hasDuckElixir: boolean;
    furId: CatFurId;
    alchemyRelics: {
      primalGuardian: boolean;
      nekoThrusters: boolean;
      seaCompass: boolean;
    };
    equippedWeaponId: string;
    equippedArmorId: string;
    inventory: GearItem[];
    activeHeroId?: PlayableHeroId;
    unlockedHeroes?: PlayableHeroId[];
    starPoints?: number;
    unlockedSkills?: string[];
    capitalBuildings?: Record<CapitalBuildingId, number>;
    kingdomResources?: KingdomResources;
    brewedPotions?: BrewedPotionItem[];
    equippedBrewId?: string | null;
  };
  story: StoryFlags;
  stats: RunStats;
}

export class RpgEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sprites: SpriteBank;
  private omniverseSprites: OmniverseSpritePack;
  private onHudUpdate: (hud: HUDState) => void;

  private mode: GameMode = 'TITLE';
  private returnModeFromMap: 'PLAYING' | 'VICTORY' | 'TITLE' = 'PLAYING';
  private currentAct = 1;
  private maxUnlockedAct = 1;
  private clearedActs: Set<number> = new Set();
  private openedChestIds: Set<string> = new Set();
  private nightmareMode = false;
  private nightmareUnlocked = false;
  private currentWorld!: GeneratedActWorld;
  private actBgCache: Record<string, HTMLCanvasElement> = {};

  private player!: PlayerState;
  private enemies: Enemy[] = [];
  private alliedSoldiers: AlliedCatSoldier[] = [];
  private warBanners: WarBanner[] = [];
  private prisonCages: PrisonCage[] = [];
  private siegeEngines: SiegeEngine[] = [];
  private warMorale = 52;
  private warHornWaveTimer = 0;
  private warHornActiveTimer = 0;
  private projectiles: Projectile[] = [];
  private hazards: HazardPool[] = [];
  private traps: Trap[] = [];
  private phaseLockPillars: PhaseLockPillar[] = [];
  private siphonObelisks: SiphonObelisk[] = [];
  private cataclysmBurnTimer = 0;
  private lavaTickTimer = 0;
  private vfx = new PixelVfxEngine();
  private dragonController = new DragonBossController();
  private biomeMechanics = new BiomeMechanicsController();
  private bossRaidState: BossRaidRuntimeState = createInitialBossRaidState();
  private bossRaidTelemetry = {
    krakenTentaclesAlive: 0,
    chronoGearsAlive: 0,
    singularityPullActive: false,
  };
  private surfacePhysics: SurfacePhysicsState = createInitialSurfacePhysicsState();
  private destructibleProps: ActiveDestructibleProp[] = [];
  private bespokeTrapState: TrapSystemState | null = null;
  private passiveResourceTimer = 0;
  private hitStopTimer = 0;
  private floatingTexts: FloatingText[] = [];
  private toasts: ToastItem[] = [];
  private story!: StoryFlags;
  private stats!: RunStats;

  private dialogueQueue: DialogueLine[] = [];
  private dialogueIndex = 0;
  private dialogueChars = 0;
  private dialogueCharTimer = 0;
  private onDialogueComplete: (() => void) | null = null;

  private camX = 0;
  private camY = 0;
  private camZoom = 1.0;
  private letterboxRatio = 0;
  private irisWipeTimer = 0;
  private actBannerTimer = 0;
  private bossSplashTimer = 0;
  private bossSplashName = '';
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private shakeCooldown = 0;
  private screenShakeEnabled = true;
  private titleArenaSim = new TitleArenaSimulator();
  private portalCooldown = 0;
  private globalTime = 0;
  private hudSyncTimer = 0;
  private lockToastCooldown = 0;

  private keys: Set<string> = new Set();
  private analogInput = { x: 0, y: 0 };
  private iceSlideVel = { x: 0, y: 0 };
  private pawPrints: Array<{ x: number; y: number; life: number }> = [];
  private pawPrintTimer = 0;
  private idleTimer = 0;
  private blinkTimer = 3.2;
  private duckling = { x: 140, y: 192, fireTimer: 1.5 };
  private leoCompanion = { x: 140, y: 192, fireTimer: 1.7 };
  private fenrirCompanion = { x: 160, y: 192, fireTimer: 1.9 };
  private duckFlyover: { active: boolean; x: number; y: number; eggsDropped: number } = {
    active: false,
    x: 0,
    y: 0,
    eggsDropped: 0,
  };
  private goldenEggs: Array<{ x: number; y: number; targetY: number; vy: number; damage: number }> = [];
  private featherPickups: GoldenFeatherPickup[] = [];
  private featherDropTimer = 10.0;
  private dogCounterWaveTriggered = false;
  private guardianFireTimer = 1.0;
  private bossRushStage: number | null = null;
  private pendingBossRushFromChoice = false;
  private pendingWarCampaignFromChoice = false;
  private vargosIntroSeen = false;
  private bahamutIntroSeen = false;
  private mouseLogical = { x: LOGICAL_W / 2, y: LOGICAL_H / 2 };
  private rafId: number | null = null;
  private lastTimestamp = 0;
  private detachIpadAutosave: (() => void) | null = null;
  private readonly renderScale = 3;

  constructor(canvas: HTMLCanvasElement, onHudUpdate: (hud: HUDState) => void) {
    this.canvas = canvas;
    this.canvas.width = LOGICAL_W * this.renderScale;
    this.canvas.height = LOGICAL_H * this.renderScale;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    try {
      this.screenShakeEnabled = localStorage.getItem('claws_screen_shake_v1') !== 'false';
    } catch {
      this.screenShakeEnabled = true;
    }
    this.sprites = getSpriteBank();
    this.omniverseSprites = getOmniverseSprites(this.sprites.pip[1].idle, this.sprites.pip[1].walk, this.sprites.greatDuck);
    this.onHudUpdate = onHudUpdate;
    this.detachIpadAutosave = attachIpadLifecycleAutosave(() => this.buildVaultV6Snapshot());

    // Restore unlock meta only if Act 41 was completed in saved campaign
    const saved = this.readSavedData();
    if (
      saved &&
      (saved.clearedActs?.includes(41) || saved.story?.fenrirDefeated || saved.nightmareMode)
    ) {
      this.nightmareUnlocked = true;
    }

    this.resetCampaignState(false, false);
  }

  public startLoop() {
    if (this.rafId !== null) return;
    this.lastTimestamp = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTimestamp) / 1000));
      this.lastTimestamp = now;
      this.update(dt);
      this.render();
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public destroy() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.detachIpadAutosave) {
      this.detachIpadAutosave();
      this.detachIpadAutosave = null;
    }
    audio.stopBgm();
  }

  private buildVaultV6Snapshot(forceReset = false): COTCSavePayloadV6 {
    const heroId =
      this.player.activeHeroId === 'king_leo'
        ? 'king_leo'
        : this.player.activeHeroId === 'fenrir'
          ? 'fenrir'
          : this.player.activeHeroId === 'great_duck'
            ? 'great_duck'
            : 'nyx';
    const base = createScaledActRestorePayload(Math.max(1, this.currentAct));
    return {
      ...base,
      currentAct: this.currentAct,
      maxUnlockedAct: this.maxUnlockedAct,
      clearedActs: Array.from(this.clearedActs),
      activeHeroId: heroId,
      level: this.player.level,
      xp: this.player.xp,
      gold: this.player.gold,
      starPoints: this.player.starPoints,
      healthPotions: this.player.healthPotions,
      hasDuckElixir: this.player.hasDuckElixir,
      nightmareMode: this.nightmareMode,
      nightmareUnlocked: this.nightmareUnlocked,
      screenShakeEnabled: this.screenShakeEnabled,
      muted: audio.isMuted(),
      equippedWeaponId: this.player.equippedWeaponId,
      equippedArmorId: this.player.equippedArmorId,
      forceReset: forceReset ? true : undefined,
    };
  }

  private readSavedData(): SavedCampaignData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SavedCampaignData;
      if (!parsed || parsed.version !== 1 || !parsed.player) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  private saveProgress(forceOverwrite = false) {
    if (this.bossRushStage !== null) return;
    try {
      // Strict Anti-Overwrite Guard: never silently downgrade higher saved progress
      const existing = this.readSavedData();
      if (existing && existing.maxUnlockedAct > this.maxUnlockedAct && !forceOverwrite) {
        return;
      }
      const payload: SavedCampaignData = {
        version: 1,
        currentAct: this.currentAct,
        maxUnlockedAct: this.maxUnlockedAct,
        clearedActs: Array.from(this.clearedActs),
        nightmareMode: this.nightmareMode,
        nightmareUnlocked: this.nightmareUnlocked,
        openedChestIds: Array.from(this.openedChestIds),
        player: {
          level: this.player.level,
          xp: this.player.xp,
          xpToNext: this.player.xpToNext,
          baseMaxHp: this.player.baseMaxHp,
          baseAtk: this.player.baseAtk,
          baseDef: this.player.baseDef,
          gold: this.player.gold,
          fishTreats: this.player.fishTreats,
          materials: this.player.materials,
          healthPotions: this.player.healthPotions,
          hasDuckElixir: this.player.hasDuckElixir,
          furId: this.player.furId,
          alchemyRelics: { ...this.player.alchemyRelics },
          equippedWeaponId: this.player.equippedWeaponId,
          equippedArmorId: this.player.equippedArmorId,
          inventory: this.player.inventory.map((g) => ({ ...g })),
          activeHeroId: this.player.activeHeroId,
          unlockedHeroes: [...this.player.unlockedHeroes],
          starPoints: this.player.starPoints,
          unlockedSkills: [...this.player.unlockedSkills],
          capitalBuildings: { ...this.player.capitalBuildings },
          kingdomResources: { ...this.player.kingdomResources },
          brewedPotions: this.player.brewedPotions.map((b) => ({ ...b })),
          equippedBrewId: this.player.equippedBrewId,
        },
        story: { ...this.story },
        stats: { ...this.stats },
      };
      const serialized = JSON.stringify(payload);
      localStorage.setItem(SAVE_KEY, serialized);
      mirrorSaveToIndexedDB(SAVE_KEY, serialized);
      saveToVault(this.buildVaultV6Snapshot(forceOverwrite));
    } catch {
      // Ignore storage quota errors
    }
  }

  public hasSavedGame(): boolean {
    return this.readSavedData() !== null;
  }

  public continueSavedGame() {
    const saved = this.readSavedData();
    if (!saved) {
      this.startNewGame(false);
      return;
    }
    audio.unlock();
    this.resetCampaignState(false, saved.nightmareMode);
    this.currentAct = Math.max(1, Math.min(300, saved.currentAct));
    this.maxUnlockedAct = Math.max(1, Math.min(300, saved.maxUnlockedAct));
    this.clearedActs = new Set(saved.clearedActs ?? []);
    if (this.clearedActs.has(82) || saved.story?.dragonCataclysmSeen) {
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 83);
    }
    if (this.clearedActs.has(122) || saved.story?.bahamutDefeated) {
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 123);
    }
    this.openedChestIds = new Set(saved.openedChestIds ?? []);
    this.nightmareMode = Boolean(saved.nightmareMode);
    const hasClearedAct41 = Boolean(
      saved.clearedActs?.includes(41) ||
        saved.story?.fenrirDefeated ||
        saved.nightmareMode ||
        (saved.maxUnlockedAct && saved.maxUnlockedAct >= 42)
    );
    this.nightmareUnlocked = hasClearedAct41;

    const sp = saved.player;
    this.player.level = sp.level ?? 1;
    this.player.xp = sp.xp ?? 0;
    this.player.xpToNext = sp.xpToNext ?? 60;
    this.player.baseMaxHp = sp.baseMaxHp ?? 100;
    this.player.baseAtk = sp.baseAtk ?? 10;
    this.player.baseDef = sp.baseDef ?? 1;
    this.player.gold = sp.gold ?? 25;
    this.player.fishTreats = sp.fishTreats ?? 0;
    this.player.materials = sp.materials ?? 0;
    this.player.healthPotions = sp.healthPotions ?? 2;
    this.player.hasDuckElixir = Boolean(sp.hasDuckElixir);
    this.player.furId = sp.furId ?? 'nyx_void';
    this.player.alchemyRelics = sp.alchemyRelics ?? {
      primalGuardian: false,
      nekoThrusters: false,
      seaCompass: false,
    };
    if (Array.isArray(sp.inventory) && sp.inventory.length > 0) {
      this.player.inventory = sp.inventory.map((g) => ({
        ...createGearInstance(g.id, g.upgradeLevel),
        starLevel: g.starLevel ?? g.upgradeLevel ?? 0,
        mutation: g.mutation ?? 'none',
        socketedGem: g.socketedGem ?? 'none',
      }));
      this.player.equippedWeaponId = sp.equippedWeaponId ?? this.player.inventory[0].id;
      this.player.equippedArmorId = sp.equippedArmorId ?? this.player.inventory[1]?.id ?? 'iron_armor';
    }
    this.player.activeHeroId = sp.activeHeroId ?? 'nyx';
    this.player.unlockedHeroes = sp.unlockedHeroes ?? ['nyx'];
    this.player.starPoints = sp.starPoints ?? Math.max(2, this.player.level);
    this.player.unlockedSkills = sp.unlockedSkills ?? [];
    this.player.capitalBuildings = {
      ...createInitialCapitalBuildings(),
      ...(sp.capitalBuildings ?? {}),
    };
    this.player.kingdomResources = {
      ...createInitialKingdomResources(),
      ...(sp.kingdomResources ?? {}),
    };
    if (Array.isArray(sp.brewedPotions) && sp.brewedPotions.length > 0) {
      this.player.brewedPotions = sp.brewedPotions.map((b) => ({ ...b }));
    }
    this.player.equippedBrewId = sp.equippedBrewId ?? this.player.brewedPotions[0]?.id ?? null;

    this.story = { ...this.story, ...saved.story };
    this.stats = { ...this.stats, ...saved.stats };
    this.syncUnlockedHeroesWithProgress();
    if (hasClearedAct41) {
      this.claimUltimateDuckAndGear(true, true);
    }
    this.recalculateStats(true);

    this.mode = 'PLAYING';
    this.loadAct(this.currentAct, 'west');
    const equippedWep = this.getEquippedWeapon();
    this.pushToast(
      equippedWep.tier >= 30
        ? `🐉⚔️ Resumed Act ${this.currentAct} with Tier 30 ${equippedWep.name}!`
        : hasClearedAct41
        ? `🦆⚔️ Resumed Act ${this.currentAct} with The Great Duck + ${equippedWep.name}!`
        : `Resumed Act ${this.currentAct}: ${this.currentWorld.act.title}`,
      'gold'
    );
    this.emitHud();
  }

  public resetCampaignState(startPlaying = true, nightmare = false) {
    this.nightmareMode = nightmare;
    if (nightmare) {
      this.nightmareUnlocked = true;
    }
    const starterSword = createGearInstance('iron_sword');
    const starterArmor = createGearInstance('iron_armor');
    const mythicSword = createGearInstance('quack_god_excalibur', 3);
    const mythicArmor = createGearInstance('sovereign_duck_aegis', 3);

    this.player = {
      x: 58,
      y: 192,
      vx: 0,
      vy: 0,
      width: 13,
      height: 13,
      facing: 'right',
      hp: 115,
      maxHp: 115,
      baseMaxHp: 100,
      baseAtk: 10,
      baseDef: 1,
      stamina: 3,
      maxStamina: 3,
      staminaRegenTimer: 0,
      level: 1,
      xp: 0,
      xpToNext: 60,
      gold: 25,
      fishTreats: 0,
      materials: 0,
      healthPotions: nightmare ? 4 : 2,
      hasDuckElixir: nightmare,
      duckElixirActive: false,
      duckElixirTimer: 0,
      duckElixirMaxTimer: 20,
      duckElixirCooldown: 0,
      elixirFeathers: 0,
      duckElixirBurstTimer: 0,
      duckSummonCooldown: 0,
      dragonSlayerFuryTimer: 0,
      happyJumpTimer: 0,
      perfectDodgeEmpowered: false,
      stunTimer: 0,
      mortalWoundTimer: 0,
      potionCooldown: 0,
      potionMaxCooldown: 0,
      furId: this.player?.furId ?? 'nyx_void',
      activeEmote: 'none',
      emoteTimer: 0,
      alchemyRelics: {
        primalGuardian: false,
        nekoThrusters: false,
        seaCompass: false,
      },
      equippedWeaponId: nightmare ? mythicSword.id : starterSword.id,
      equippedArmorId: nightmare ? mythicArmor.id : starterArmor.id,
      inventory: nightmare
        ? [starterSword, starterArmor, mythicSword, mythicArmor]
        : [starterSword, starterArmor],
      attackTimer: 0,
      attackCooldown: 0,
      comboStep: 0,
      comboResetTimer: 0,
      attackAngle: 0,
      dodgeTimer: 0,
      dodgeCooldown: 0,
      dodgeDirX: 1,
      dodgeDirY: 0,
      invulnTimer: 0,
      hitFlash: 0,
      animFrame: 0,
      animTimer: 0,
      afterimages: [],
      activeHeroId: 'nyx',
      unlockedHeroes: nightmare ? ['nyx', 'king_leo', 'fenrir', 'great_duck'] : ['nyx'],
      partyCompanions: [],
      starPoints: nightmare ? 12 : 2,
      unlockedSkills: [],
      capitalBuildings: createInitialCapitalBuildings(),
      kingdomResources: createInitialKingdomResources(),
      brewedPotions: [
        { ...BREWABLE_POTION_CATALOG.napalm_flask, count: 3 },
        { ...BREWABLE_POTION_CATALOG.electro_storm_vial, count: 2 },
      ],
      equippedBrewId: 'napalm_flask',
      brewTossCooldown: 0,
      steamMechaActive: false,
      steamMechaTimer: 0,
      steamMechaCooldown: 0,
      oxygenPct: 100,
      autoReviveAvailable: true,
    };

    this.story = {
      spokeToAdvisor: false,
      spokeToGreatDuck: nightmare,
      fenrirIntroSeen: false,
      fenrirShieldBroken: false,
      fenrirPhase2Triggered: false,
      fenrirDefeated: false,
      dragonCataclysmSeen: false,
      bahamutDefeated: false,
      charybdisDefeated: false,
      chronosDefeated: false,
      voidCloneDefeated: false,
      aetherNullDefeated: false,
    };

    this.stats = {
      elapsedSeconds: 0,
      enemiesSlain: 0,
      damageDealt: 0,
      goldCollected: 0,
      fishTreatsCollected: 0,
      potionsUsed: 0,
      perfectDodges: 0,
      deaths: 0,
    };

    this.currentAct = 1;
    this.maxUnlockedAct = 1;
    this.clearedActs = new Set();
    this.openedChestIds = new Set();
    this.bossRushStage = null;
    this.pendingBossRushFromChoice = false;
    this.pendingWarCampaignFromChoice = false;
    this.vargosIntroSeen = false;
    this.bahamutIntroSeen = false;
    this.hitStopTimer = 0;
    this.toasts = [];
    this.floatingTexts = [];
    this.vfx.clearAll();
    this.pawPrints = [];
    this.goldenEggs = [];
    this.featherPickups = [];
    this.featherDropTimer = 10.0;
    this.dogCounterWaveTriggered = false;
    this.iceSlideVel = { x: 0, y: 0 };
    this.duckFlyover = { active: false, x: 0, y: 0, eggsDropped: 0 };

    this.recalculateStats(true);
    this.loadAct(1, 'west', false);

    if (startPlaying) {
      audio.unlock();
      this.mode = 'INTRO_CUTSCENE';
      this.startDialogue(INTRO_CUTSCENE_LINES, () => {
        this.story.spokeToAdvisor = true;
        this.mode = 'PLAYING';
        this.saveProgress();
        this.pushToast(
          nightmare
            ? '🔥🦆 Nightmare NG+! Equipped The Great Duck + Tier 11 Excaliquack & Sovereign Aegis (+3)!'
            : 'Clear Act 1 foes or speak to Advisor Whiskers [E]!',
          'gold'
        );
        this.emitHud();
      });
    } else {
      this.mode = 'TITLE';
    }
    this.emitHud();
  }

  public startNewGame(nightmare = false) {
    this.resetCampaignState(true, nightmare);
  }

  public startNightmareMode() {
    if (!this.nightmareUnlocked && !this.clearedActs.has(41) && !this.story?.fenrirDefeated) {
      this.pushToast('🔒 Complete Act 41 (Defeat Usurper Fenrir) to unlock Nightmare NG+!', 'amber');
      this.emitHud();
      return;
    }
    this.nightmareUnlocked = true;
    this.resetCampaignState(true, true);
  }

  public skipCutscene() {
    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE') {
      this.finishDialogue();
    }
  }

  public openWorldMap() {
    if (this.mode === 'PLAYING' || this.mode === 'VICTORY' || this.mode === 'TITLE') {
      this.returnModeFromMap = this.mode;
      this.mode = 'WORLD_MAP';
      this.emitHud();
    } else if (this.mode === 'WORLD_MAP') {
      this.mode = this.returnModeFromMap;
      this.emitHud();
    }
  }

  public openCapitalHub() {
    if (this.mode === 'PLAYING' || this.mode === 'VICTORY' || this.mode === 'TITLE') {
      this.returnModeFromMap = this.mode;
      this.mode = 'CAPITAL_HUB';
      this.emitHud();
    } else if (this.mode === 'CAPITAL_HUB') {
      this.mode = this.returnModeFromMap;
      this.emitHud();
    }
  }

  public openSkillTree() {
    if (this.mode === 'PLAYING' || this.mode === 'VICTORY' || this.mode === 'TITLE') {
      this.returnModeFromMap = this.mode;
      this.mode = 'SKILL_TREE';
      this.emitHud();
    } else if (this.mode === 'SKILL_TREE') {
      this.mode = this.returnModeFromMap;
      this.emitHud();
    }
  }

  public travelToAct(actNum: number) {
    if (actNum < 1 || actNum > 300) return;
    if (actNum > this.maxUnlockedAct) {
      this.pushToast(`Act ${actNum} is locked! Progress further first.`, 'amber');
      return;
    }
    audio.unlock();
    this.bossRushStage = null;
    this.mode = 'PLAYING';
    this.loadAct(actNum, 'west');
    this.pushToast(`Fast traveled to Act ${actNum}: ${this.currentWorld.act.title}`, 'cyan');
    this.emitHud();
  }

  public startWarOfTwoKingdoms() {
    audio.unlock();
    this.bossRushStage = null;
    this.pendingWarCampaignFromChoice = false;
    this.story.spokeToGreatDuck = true;
    this.player.hasDuckElixir = true;
    this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 42);
    this.clearedActs.add(40);
    this.clearedActs.add(41);
    this.player.hp = this.player.maxHp;
    this.player.healthPotions = Math.max(4, this.player.healthPotions);
    this.mode = 'PLAYING';
    this.loadAct(42, 'west');
    this.pushToast('Part II Unlocked: War of the Two Kingdoms (Acts 42–82)!', 'gold');
    this.emitHud();
  }

  public startDragonCataclysmCampaign() {
    audio.unlock();
    this.bossRushStage = null;
    this.story.spokeToGreatDuck = true;
    this.story.dragonCataclysmSeen = true;
    this.player.hasDuckElixir = true;
    this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 83);
    this.clearedActs.add(82);
    this.player.hp = this.player.maxHp;
    this.player.healthPotions = Math.max(5, this.player.healthPotions);
    this.mode = 'PLAYING';
    this.loadAct(83, 'west');
    this.saveProgress();
    this.pushToast('🐉 ARC III UNLOCKED: The Dragon Cataclysm (Acts 83–122)!', 'gold');
    this.emitHud();
  }

  /**
   * 1-Tap iPad Vault Restore & Act 1–300 Jump Slider with Scaled Gear, Level, Gold & Heroes.
   */
  public restoreActWithScaledGear(targetActRaw: number) {
    const targetAct = Math.max(1, Math.min(300, Math.floor(targetActRaw)));
    audio.unlock();
    this.bossRushStage = null;
    this.resetCampaignState(false, false);

    const scaled = createScaledActRestorePayload(targetAct);
    this.currentAct = targetAct;
    this.maxUnlockedAct = Math.max(this.maxUnlockedAct, targetAct);
    this.clearedActs = new Set(scaled.clearedActs);
    this.nightmareUnlocked = targetAct >= 42;
    this.story.spokeToGreatDuck = targetAct >= 39;
    this.story.fenrirDefeated = targetAct >= 42;
    this.story.dragonCataclysmSeen = targetAct >= 83;
    this.story.bahamutDefeated = targetAct >= 123;

    this.player.level = scaled.level;
    this.player.xp = 0;
    this.player.xpToNext = Math.round(60 + scaled.level * 28);
    this.player.baseMaxHp = Math.round(100 + scaled.level * 14);
    this.player.baseAtk = Math.round(10 + scaled.level * 3.2);
    this.player.baseDef = Math.round(2 + scaled.level * 1.1);
    this.player.gold = Math.max(this.player.gold, scaled.gold);
    this.player.starPoints = Math.max(this.player.starPoints, scaled.starPoints);
    this.player.healthPotions = Math.max(4, scaled.healthPotions);
    this.player.hasDuckElixir = scaled.hasDuckElixir;
    this.player.unlockedHeroes = ['nyx'];
    if (targetAct >= 20 && !this.player.unlockedHeroes.includes('king_leo')) {
      this.player.unlockedHeroes.push('king_leo');
    }
    if (targetAct >= 42 && !this.player.unlockedHeroes.includes('fenrir')) {
      this.player.unlockedHeroes.push('fenrir');
    }
    if (targetAct >= 83 && !this.player.unlockedHeroes.includes('great_duck')) {
      this.player.unlockedHeroes.push('great_duck');
    }

    // Equip appropriately scaled weapon & armor from GEAR_CATALOG for targetAct
    const targetTier = Math.max(1, Math.min(30, Math.ceil(targetAct / 10)));
    const allCatalogItems = Object.values(GEAR_CATALOG);
    const matchingWeapon =
      allCatalogItems
        .filter((g) => g.slot === 'weapon' && g.tier <= targetTier)
        .sort((a, b) => b.tier - a.tier)[0] ??
      allCatalogItems.find((g) => g.slot === 'weapon');
    const matchingArmor =
      allCatalogItems
        .filter((g) => g.slot === 'armor' && g.tier <= targetTier)
        .sort((a, b) => b.tier - a.tier)[0] ??
      allCatalogItems.find((g) => g.slot === 'armor');

    if (matchingWeapon) {
      const wInst = createGearInstance(matchingWeapon.id);
      if (wInst) {
        wInst.starLevel = Math.min(25, Math.floor(targetAct / 12));
        if (!this.player.inventory.some((i) => i.id === wInst.id)) {
          this.player.inventory.push(wInst);
        }
        this.player.equippedWeaponId = wInst.id;
      }
    }
    if (matchingArmor) {
      const aInst = createGearInstance(matchingArmor.id);
      if (aInst) {
        aInst.starLevel = Math.min(25, Math.floor(targetAct / 12));
        if (!this.player.inventory.some((i) => i.id === aInst.id)) {
          this.player.inventory.push(aInst);
        }
        this.player.equippedArmorId = aInst.id;
      }
    }

    this.recalculateStats(true);
    this.mode = 'PLAYING';
    this.loadAct(targetAct, 'west');
    this.saveProgress(true);
    this.pushToast(`⚡ Vault Restored to Act ${targetAct}/300 with Scaled Tier-${targetTier} Gear!`, 'gold');
    this.emitHud();
  }

  public startBossRush(grantTopGear = true) {
    audio.unlock();
    this.bossRushStage = 1;
    this.pendingBossRushFromChoice = false;
    this.story.spokeToGreatDuck = true;
    this.player.hasDuckElixir = true;
    this.player.duckElixirActive = false;
    this.player.duckSummonCooldown = 0;
    this.player.healthPotions = Math.max(4, this.player.healthPotions);
    if (grantTopGear) {
      this.claimUltimateDuckAndGear(true, true);
    }
    this.story.fenrirDefeated = false;
    this.story.fenrirShieldBroken = false;
    this.story.fenrirPhase2Triggered = false;
    this.story.fenrirIntroSeen = true;
    this.loadAct(41, 'west', false);
    this.enemies = [spawnEnemy('rush_1', 'grommash', 304, 128, 15, this.nightmareMode, 'Grommash (Boss Rush)', 'boss')];
    this.recalculateStats(true);
    this.mode = 'PLAYING';
    audio.bossRoar();
    this.pushToast('Boss Rush Wave 1/5: Grommash!', 'gold');
    this.emitHud();
  }

  public visitSanctuaryPostVictory() {
    this.bossRushStage = null;
    this.mode = 'PLAYING';
    this.loadAct(40, 'west');
    this.pushToast('Sanctuary Boss Rush Shrine is now open!', 'gold');
    this.emitHud();
  }

  public setFur(furId: CatFurId) {
    this.player.furId = furId;
    audio.talkBlip(640);
    const label = furId === 'nyx_void' ? 'Nyx Void' : furId.replace('_', ' ');
    this.pushToast(`Fur changed: ${label}`, 'cyan');
    this.saveProgress();
    this.emitHud();
  }

  public cycleFur() {
    const order: CatFurId[] = ['nyx_void', 'ginger', 'tuxedo', 'calico', 'persian', 'cyber_noir', 'starlight'];
    const idx = order.indexOf(this.player.furId);
    this.setFur(order[(idx + 1) % order.length]);
  }

  public setCatEmote(emote: CatEmoteId) {
    if (this.mode !== 'PLAYING') return;
    this.player.activeEmote = emote;
    this.player.emoteTimer = 0;

    if (emote === 'none') {
      audio.talkBlip(520);
      this.spawnParticles(this.player.x, this.player.y, '#fde68a', 8, 55);
      this.emitHud();
      return;
    }

    const meta: Record<Exclude<CatEmoteId, 'none'>, { label: string; floatText: string; color: string; toast: string }> = {
      bread_loaf: {
        label: '🍞 CAT BREAD LOAF!',
        floatText: '🍞 LOAF MODE! (+HP)',
        color: '#f59e0b',
        toast: '🍞 Bread Loaf Form! Cozy +5 HP/s & 40% Crust Guard!',
      },
      making_biscuits: {
        label: '🐾 MAKING BISCUITS~',
        floatText: '🐾 KNEAD DOUGH~',
        color: '#fde047',
        toast: '🐾 Nyx is kneading warm bakery biscuits! (+HP/s)',
      },
      eepy_croissant: {
        label: '🥐 CROISSANT NAP',
        floatText: '🥐 eepy zZz...',
        color: '#fb923c',
        toast: '🥐 Curled into a flaky Croissant Roll! (+HP/s & Crust Guard)',
      },
      zoomie_blep: {
        label: '👅 SILLY BLEP :P',
        floatText: '👅 BLEP! :P',
        color: '#f472b6',
        toast: '👅 Nyx does a silly wizard blep!',
      },
      purr_love: {
        label: '💖 COZY PURR ^ω^',
        floatText: '💖 PURRRR~ ♥',
        color: '#fb7185',
        toast: '💖 Nyx purrs happily! (+HP/s)',
      },
    };

    const info = meta[emote];
    if (emote === 'bread_loaf' || emote === 'making_biscuits' || emote === 'eepy_croissant') {
      audio.catLoafPurr();
    } else {
      audio.catMeow();
    }

    this.spawnFloatingText(this.player.x, this.player.y - 18, info.floatText, info.color, 1.12);
    this.spawnParticles(this.player.x, this.player.y, info.color, 16, 65);
    this.spawnParticles(this.player.x, this.player.y, '#fef3c7', 10, 45);
    if (this.story.spokeToGreatDuck) {
      this.spawnFloatingText(this.duckling.x, this.duckling.y - 12, 'QUACK ♥', '#fde047', 0.9);
    }
    this.pushToast(info.toast, 'gold');
    this.emitHud();
  }

  public toggleBreadLoaf() {
    if (this.mode !== 'PLAYING') return;
    if (this.player.activeEmote === 'bread_loaf') {
      this.setCatEmote('none');
    } else {
      this.setCatEmote('bread_loaf');
    }
  }

  public cycleCatEmote() {
    if (this.mode !== 'PLAYING') return;
    const order: CatEmoteId[] = [
      'bread_loaf',
      'making_biscuits',
      'eepy_croissant',
      'zoomie_blep',
      'purr_love',
      'none',
    ];
    const idx = order.indexOf(this.player.activeEmote);
    const next = order[(idx + 1) % order.length];
    this.setCatEmote(next);
  }

  public retryCurrentAct() {
    this.player.hp = this.player.maxHp;
    this.player.stamina = this.player.maxStamina;
    this.player.invulnTimer = 1.0;
    this.player.duckElixirActive = false;
    this.player.perfectDodgeEmpowered = false;
    this.player.mortalWoundTimer = 0;
    this.player.potionCooldown = 0;
    this.player.potionMaxCooldown = 0;
    if (this.bossRushStage !== null) {
      this.startBossRush(true);
      return;
    }
    this.loadAct(this.currentAct, 'west', false);
    if (this.currentAct === 41 && this.story.fenrirShieldBroken) {
      this.story.fenrirPhase2Triggered = false;
    }
    this.mode = 'PLAYING';
    this.emitHud();
  }

  public toggleMute(): boolean {
    const m = audio.toggleMute();
    this.emitHud();
    return m;
  }

  public toggleScreenShake(): boolean {
    this.screenShakeEnabled = !this.screenShakeEnabled;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    try {
      localStorage.setItem('claws_screen_shake_v1', String(this.screenShakeEnabled));
    } catch {
      // ignore storage errors
    }
    this.pushToast(`📳 Screen Shake: ${this.screenShakeEnabled ? 'ON' : 'OFF'}`, 'cyan');
    this.emitHud();
    return this.screenShakeEnabled;
  }

  public toggleInventory() {
    if (this.mode === 'PLAYING') {
      this.mode = 'INVENTORY';
      this.emitHud();
    } else if (this.mode === 'INVENTORY' || this.mode === 'BLACKSMITH') {
      this.mode = 'PLAYING';
      this.emitHud();
    }
  }

  public closeModal() {
    if (this.mode === 'INVENTORY' || this.mode === 'BLACKSMITH') {
      this.mode = 'PLAYING';
      this.emitHud();
    } else if (
      this.mode === 'WORLD_MAP' ||
      this.mode === 'CAPITAL_HUB' ||
      this.mode === 'SKILL_TREE'
    ) {
      this.mode = this.returnModeFromMap;
      this.emitHud();
    }
  }

  private syncUnlockedHeroesWithProgress() {
    const set = new Set<PlayableHeroId>(this.player.unlockedHeroes);
    set.add('nyx');
    if (this.clearedActs.has(41) || this.maxUnlockedAct >= 42 || this.story.fenrirDefeated) {
      set.add('king_leo');
    }
    if (this.clearedActs.has(82) || this.maxUnlockedAct >= 83 || this.story.dragonCataclysmSeen) {
      set.add('fenrir');
    }
    if (this.clearedActs.has(121) || this.maxUnlockedAct >= 121 || this.story.bahamutDefeated) {
      set.add('great_duck');
    }
    this.player.unlockedHeroes = Array.from(set);
  }

  public swapHero(heroId: PlayableHeroId) {
    this.syncUnlockedHeroesWithProgress();
    const meta = HERO_METADATA[heroId];
    if (!this.player.unlockedHeroes.includes(heroId)) {
      this.pushToast(`🔒 ${meta.name} unlocks after Act ${meta.unlockAct}!`, 'amber');
      return;
    }
    if (this.player.activeHeroId === heroId) return;
    this.player.activeHeroId = heroId;
    audio.elixirAwaken();
    this.vfx.spawnShockwave(this.player.x, this.player.y, 44, meta.color, 0.35);
    this.spawnParticles(this.player.x, this.player.y, meta.color, 22, 95);
    this.spawnFloatingText(this.player.x, this.player.y - 18, `⚡ HOT-SWAP: ${meta.shortName.toUpperCase()}!`, meta.color, 1.18);
    if (this.currentWorld) {
      this.player.partyCompanions = syncPartyCompanions(
        this.player,
        this.player.partyCompanions,
        this.currentWorld.grid,
        this.getExcludedCompanionHeroIds(this.currentWorld)
      );
    }
    this.recalculateStats(false);
    this.pushToast(`⚡ Switched active hero to ${meta.name}! (${meta.specialDesc})`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public tossBrewedPotion() {
    if (this.mode !== 'PLAYING') return;
    if (this.player.brewTossCooldown > 0) {
      this.pushToast(`🧪 Flask Toss recharging (${this.player.brewTossCooldown.toFixed(1)}s)`, 'amber');
      return;
    }
    const brew =
      this.player.brewedPotions.find((b) => b.id === this.player.equippedBrewId && b.count > 0) ??
      this.player.brewedPotions.find((b) => b.count > 0);
    if (!brew) {
      this.pushToast('🧪 No BlockCraft Flasks left! Brew more in [🏰 Capital] -> Cauldron!', 'amber');
      return;
    }
    brew.count -= 1;
    this.player.equippedBrewId = brew.id;
    const skillBonuses = computeSkillTreeBonuses(this.player.unlockedSkills);
    this.player.brewTossCooldown = Math.max(2.0, 4.5 - (this.player.unlockedSkills.includes('alch_12') ? 1.5 : 0));

    const f = this.facingToVec(this.player.facing);
    let tx = this.player.x + f.x * 64;
    let ty = this.player.y + f.y * 64;
    if (this.enemies.length > 0) {
      const nearest = this.enemies.reduce((best, e) =>
        Math.hypot(e.x - this.player.x, e.y - this.player.y) <
        Math.hypot(best.x - this.player.x, best.y - this.player.y)
          ? e
          : best
      );
      if (Math.hypot(nearest.x - this.player.x, nearest.y - this.player.y) <= 165) {
        tx = nearest.x;
        ty = nearest.y;
      }
    }

    audio.potionDrink();
    const radiusMult = this.player.unlockedSkills.includes('alch_2') ? 1.25 : 1.0;
    this.vfx.spawnShockwave(tx, ty, 52 * radiusMult, brew.color, 0.42);
    this.spawnParticles(tx, ty, brew.color, 28, 105);

    const totals = this.getTotalStats();
    const splashRadius = 56 * radiusMult;
    const baseSplashDmg = Math.round(
      (brew.power + totals.atk * 1.65) * skillBonuses.potionDmgMult * (skillBonuses.doublePotionThrow ? 2 : 1)
    );

    if (brew.effectKind === 'healing_lotus') {
      const heal = Math.round(this.player.maxHp * 0.45);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.player.mortalWoundTimer = 0;
      this.spawnFloatingText(this.player.x, this.player.y - 16, `🧪 +${heal} HP`, '#4ade80', 1.15);
    }

    for (const e of [...this.enemies]) {
      if (Math.hypot(e.x - tx, e.y - ty) <= splashRadius + e.width * 0.5) {
        this.damageEnemy(e, baseSplashDmg, totals.crit + 15, 0, -1, false, 28);
        if (brew.effectKind === 'electro_stun' || brew.effectKind === 'cryo_shatter' || brew.effectKind === 'prism_nova') {
          e.stunTimer = Math.max(e.stunTimer ?? 0, 2.2);
        }
      }
    }

    this.hazards.push({
      id: `brew_puddle_${Date.now()}`,
      x: tx,
      y: ty,
      radius: 34 * radiusMult,
      life: 4.0,
      kind: 'poison',
      damagePerSec: Math.max(25, Math.round(baseSplashDmg * 0.25)),
    });

    this.spawnFloatingText(tx, ty - 18, `🧪 ${brew.name.toUpperCase()}!`, brew.color, 1.2);
    this.pushToast(`🧪 Threw ${brew.name} (${brew.effectKind.replace('_', ' ').toUpperCase()})!`, 'emerald');
    this.emitHud();
  }

  public toggleSteamMecha() {
    if (this.mode !== 'PLAYING') return;
    if (this.player.steamMechaActive) {
      this.player.steamMechaActive = false;
      this.player.steamMechaTimer = 0;
      this.pushToast('⚙️ Disembarked from Steam-Mecha Titan Suit.', 'cyan');
      this.emitHud();
      return;
    }
    if (this.player.steamMechaCooldown > 0) {
      this.pushToast(`⚙️ Steam-Mecha cooling down (${Math.ceil(this.player.steamMechaCooldown)}s)`, 'amber');
      return;
    }
    const hangerLv = this.player.capitalBuildings.sky_airship_dock ?? 1;
    const duration = 15 + (hangerLv - 1) * 1.5;
    this.player.steamMechaActive = true;
    this.player.steamMechaTimer = duration;
    this.player.steamMechaCooldown = 36;
    audio.elixirAwaken();
    this.shake(0.3, 4.5);
    this.vfx.spawnShockwave(this.player.x, this.player.y, 64, '#f59e0b', 0.45);
    this.spawnParticles(this.player.x, this.player.y, '#fbbf24', 28, 110);
    this.spawnFloatingText(this.player.x, this.player.y - 22, `⚙️ STEAM-MECHA DEPLOYED (${duration.toFixed(0)}s)!`, '#fde047', 1.25);
    this.pushToast(`⚙️ Piloting Clockwork Steam-Mecha Suit (${duration.toFixed(0)}s)! +65% ATK, +50% DEF & Laser Cannon Slashes!`, 'gold');
    this.emitHud();
  }

  public unlockSkillNode(nodeId: string) {
    if (this.player.unlockedSkills.includes(nodeId)) return;
    const node = SKILL_TREE_NODES.find((n) => n.id === nodeId);
    if (!node) return;
    if (node.prereqId && !this.player.unlockedSkills.includes(node.prereqId)) {
      this.pushToast('🔒 Unlock the prerequisite constellation node first!', 'amber');
      return;
    }
    if (this.player.starPoints < node.cost) {
      this.pushToast(`Need ${node.cost} Star Point(s)! Level up or buy Star Points with Gold.`, 'amber');
      return;
    }
    this.player.starPoints -= node.cost;
    this.player.unlockedSkills.push(nodeId);
    this.recalculateStats(true);
    audio.levelUp();
    this.pushToast(`🌟 Unlocked Constellation Skill: ${node.icon} ${node.name}!`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public buyStarPoint() {
    const cost = 400;
    if (this.player.gold < cost) {
      this.pushToast(`Need ${cost} Gold to Astral Meditate for +1 Star Point!`, 'amber');
      return;
    }
    this.player.gold -= cost;
    this.player.starPoints += 1;
    audio.levelUp();
    this.pushToast('🌟 Astral Meditation complete! +1 Star Point!', 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public upgradeCapitalBuilding(buildingId: CapitalBuildingId) {
    const currentLv = this.player.capitalBuildings[buildingId] ?? 1;
    if (currentLv >= 10) {
      this.pushToast('🏰 This Capital structure has reached Lv.10 Golden Citadel!', 'gold');
      return;
    }
    const bDef = CAPITAL_BUILDINGS.find((b) => b.id === buildingId);
    if (!bDef) return;
    const cost = getBuildingUpgradeCost(bDef, currentLv);
    const res = this.player.kingdomResources;
    if (
      this.player.gold < cost.gold ||
      res.wood < cost.wood ||
      res.iron < cost.iron
    ) {
      this.pushToast('Not enough Kingdom Resources! Loot Acts or use the Royal Supply Exchange.', 'amber');
      return;
    }
    this.player.gold -= cost.gold;
    res.wood -= cost.wood;
    res.iron -= cost.iron;
    this.player.capitalBuildings[buildingId] = currentLv + 1;
    this.recalculateStats(true);
    audio.chestFanfare();
    this.pushToast(
      `🏰 Upgraded ${bDef.name} to Lv.${currentLv + 1} (${getBuildingStageLabel(currentLv + 1)})!`,
      'gold'
    );
    this.saveProgress();
    this.emitHud();
  }

  public exchangeKingdomResources() {
    const cost = 150;
    if (this.player.gold < cost) {
      this.pushToast('Need 150 Gold for a Royal Supply Shipment!', 'amber');
      return;
    }
    this.player.gold -= cost;
    this.player.kingdomResources.wood += 30;
    this.player.kingdomResources.iron += 25;
    this.player.kingdomResources.dragonScales += 8;
    this.player.kingdomResources.abyssalPearls += 8;
    this.player.kingdomResources.chronoGears += 6;
    this.player.kingdomResources.voidCrystals += 4;
    audio.chestFanfare();
    this.pushToast('📦 Royal Caravan arrived: +30 Wood, +25 Iron, +8 Scales, +8 Pearls, +6 Gears, +4 Crystals!', 'emerald');
    this.saveProgress();
    this.emitHud();
  }

  public brewCauldronPotion(ingA: string, ingB: string, ingC: string) {
    const price = 25;
    if (this.player.gold < price) {
      this.pushToast('Need 25 Gold to fuel the BlockCraft Cauldron!', 'amber');
      return;
    }
    this.player.gold -= price;
    const recipe = resolveCauldronRecipe(ingA, ingB, ingC);
    const breweryLv = this.player.capitalBuildings.alchemy_brewery ?? 1;
    const yieldCount = 2 + Math.floor(breweryLv / 3);
    const existing = this.player.brewedPotions.find((p) => p.id === recipe.id);
    if (existing) {
      existing.count += yieldCount;
    } else {
      this.player.brewedPotions.push({ ...recipe, count: yieldCount });
    }
    this.player.equippedBrewId = recipe.id;
    audio.potionDrink();
    this.pushToast(`🧪 Brewed ${yieldCount}x ${recipe.name}! Equipped to [F] Flask Toss!`, 'emerald');
    this.saveProgress();
    this.emitHud();
  }

  public equipBrewedPotion(potionId: string) {
    this.player.equippedBrewId = potionId;
    audio.talkBlip(660);
    this.emitHud();
  }

  public starUpGear(itemId: string) {
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) return;
    const starLv = item.starLevel ?? item.upgradeLevel ?? 0;
    if (starLv >= 25) {
      this.pushToast('★ This gear has reached maximum +25★ Star-Up!', 'gold');
      return;
    }
    const goldCost = 80 + starLv * 65;
    const shardCost = 1 + Math.floor(starLv / 4);
    if (this.player.gold < goldCost || this.player.materials < shardCost) {
      this.pushToast(`Need ${goldCost} Gold & ${shardCost} Shards for +${starLv + 1}★!`, 'amber');
      return;
    }
    this.player.gold -= goldCost;
    this.player.materials -= shardCost;
    item.starLevel = starLv + 1;
    item.upgradeLevel = item.starLevel;
    this.recalculateStats(true);
    audio.chestFanfare();
    this.pushToast(`🔨 Star-Up Success! ${item.name} is now +${item.starLevel}★!`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public socketGem(itemId: string, gemId: ElementalGemId) {
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) return;
    const cost = 60;
    if (this.player.gold < cost) {
      this.pushToast('Need 60 Gold to socket an Elemental Gem!', 'amber');
      return;
    }
    this.player.gold -= cost;
    item.socketedGem = gemId;
    this.recalculateStats(true);
    audio.levelUp();
    const gem = ELEMENTAL_GEMS.find((g) => g.id === gemId);
    this.pushToast(`💎 Socketed ${gem?.name ?? gemId} into ${item.name}!`, 'cyan');
    this.saveProgress();
    this.emitHud();
  }

  public reforgeMutation(itemId: string) {
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) return;
    const cost = 120;
    if (this.player.gold < cost || this.player.materials < 2) {
      this.pushToast('Need 120 Gold & 2 Shards to Reforge Weapon Mutation!', 'amber');
      return;
    }
    this.player.gold -= cost;
    this.player.materials -= 2;
    const anvilLv = this.player.capitalBuildings.star_anvil_forge ?? 1;
    const mut = rollWeaponMutation(anvilLv >= 8 && Math.random() < 0.35);
    item.mutation = mut;
    this.recalculateStats(true);
    audio.elixirAwaken();
    const mInfo = WEAPON_MUTATIONS[mut];
    this.pushToast(`✨ Reforged ${item.name} -> [${mInfo.label}] (${mInfo.desc})!`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public exportSaveCode(): string {
    this.saveProgress();
    const raw = localStorage.getItem(SAVE_KEY) ?? '{}';
    return exportSaveToCode(raw);
  }

  public importSaveCode(code: string): boolean {
    const decoded = importSaveFromCode(code);
    if (!decoded) {
      this.pushToast('Invalid COTC1 Save Code! Check your pasted string.', 'amber');
      return false;
    }
    try {
      const parsed = JSON.parse(decoded) as SavedCampaignData;
      if (!parsed || !parsed.player) return false;
      localStorage.setItem(SAVE_KEY, decoded);
      mirrorSaveToIndexedDB(SAVE_KEY, decoded);
      this.continueSavedGame();
      this.pushToast('💾 Cloud Save Vault Restored Successfully!', 'emerald');
      return true;
    } catch {
      return false;
    }
  }

  public equipItem(itemId: string) {
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) return;
    if (item.slot === 'weapon') {
      this.player.equippedWeaponId = item.id;
    } else {
      this.player.equippedArmorId = item.id;
    }
    this.recalculateStats(false);
    audio.talkBlip(680);
    this.pushToast(`Equipped ${item.name}`, 'cyan');
    this.saveProgress();
    this.emitHud();
  }

  public claimUltimateDuckAndGear(silent = false, preserveHigherTier = false) {
    if (
      !silent &&
      !this.nightmareUnlocked &&
      !this.nightmareMode &&
      !this.clearedActs.has(41) &&
      !this.story.fenrirDefeated
    ) {
      this.pushToast(
        '🔒 Clear Act 41 Boss first to unlock Nightmare Mode, The Great Duck & Tier 11 Mythic Gear!',
        'amber'
      );
      this.emitHud();
      return;
    }
    this.nightmareUnlocked = true;
    this.story.spokeToGreatDuck = true;
    this.player.hasDuckElixir = true;

    let sword = this.player.inventory.find((i) => i.id === 'quack_god_excalibur');
    if (!sword) {
      sword = createGearInstance('quack_god_excalibur', 3);
      this.player.inventory.push(sword);
    } else {
      sword.upgradeLevel = 3;
    }

    let armor = this.player.inventory.find((i) => i.id === 'sovereign_duck_aegis');
    if (!armor) {
      armor = createGearInstance('sovereign_duck_aegis', 3);
      this.player.inventory.push(armor);
    } else {
      armor.upgradeLevel = 3;
    }

    const curWep = this.getEquippedWeapon();
    const curArm = this.getEquippedArmor();
    if (!preserveHigherTier || curWep.tier <= 11) {
      this.player.equippedWeaponId = 'quack_god_excalibur';
    }
    if (!preserveHigherTier || curArm.tier <= 11) {
      this.player.equippedArmorId = 'sovereign_duck_aegis';
    }
    this.recalculateStats(true);
    this.saveProgress();

    if (!silent) {
      audio.elixirAwaken();
      audio.duckQuack();
      this.player.happyJumpTimer = 0.8;
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 32, 110);
      this.spawnParticles(this.player.x, this.player.y, '#f472b6', 20, 95);
      this.spawnFloatingText(this.player.x, this.player.y - 18, '🦆⚔️ TIER 11 MYTHIC +3!', '#fde047', 1.25);
      this.pushToast(
        '🦆⚔️ Equipped The Great Duck + Tier 11 Excaliquack (+3) & Sovereign Aegis (+3)!',
        'gold'
      );
      this.emitHud();
    }
  }

  public isTier30UnlockedForFree(): boolean {
    return (
      this.maxUnlockedAct >= 121 ||
      this.currentAct >= 121 ||
      this.clearedActs.has(121) ||
      this.clearedActs.has(122) ||
      Boolean(this.story.bahamutDefeated)
    );
  }

  public claimTier30EternalOmni(silent = false, targetUpgrade = 2) {
    const ownsBoth =
      this.player.inventory.some((i) => i.id === 'eternal_omni_blade') &&
      this.player.inventory.some((i) => i.id === 'eternal_omni_mantle');
    const freeUnlocked = this.isTier30UnlockedForFree();

    if (!silent && !freeUnlocked && !ownsBoth) {
      this.pushToast(
        'Reach Act 121 (United Sanctum) for free Tier 30 Omni Gear, or forge both in Forgepaw’s Anvil tab!',
        'amber'
      );
      this.emitHud();
      return;
    }

    const tier30Ids = ['eternal_omni_blade', 'eternal_omni_mantle'];
    for (const gId of tier30Ids) {
      const existing = this.player.inventory.find((i) => i.id === gId);
      if (!existing) {
        this.player.inventory.push(createGearInstance(gId, freeUnlocked ? targetUpgrade : 0));
      } else if (freeUnlocked) {
        existing.upgradeLevel = Math.max(existing.upgradeLevel, targetUpgrade);
      }
    }

    if (freeUnlocked) {
      this.story.spokeToGreatDuck = true;
      this.player.hasDuckElixir = true;
    }

    this.player.equippedWeaponId = 'eternal_omni_blade';
    this.player.equippedArmorId = 'eternal_omni_mantle';
    this.recalculateStats(true);
    this.saveProgress();

    if (!silent) {
      audio.elixirAwaken();
      audio.chestFanfare();
      this.player.happyJumpTimer = 0.85;
      this.vfx.spawnShockwave(this.player.x, this.player.y, 72, '#fde047', 0.5);
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 36, 120);
      this.spawnParticles(this.player.x, this.player.y, '#ef4444', 24, 100);
      this.spawnFloatingText(this.player.x, this.player.y - 20, '🐉⚔️ TIER 30 ETERNAL OMNI!', '#fde047', 1.3);
      this.pushToast(
        '🐉⚔️ Equipped Tier 30 Eternal Dragon-Slayer Omni-Blade & Eternal Omni-Crown Mantle!',
        'gold'
      );
      this.emitHud();
    }
  }

  public forgeBlacksmithGear(gearId: string) {
    const base = GEAR_CATALOG[gearId];
    if (!base) return;

    const existing = this.player.inventory.find((i) => i.id === gearId);
    if (existing) {
      if (base.slot === 'weapon') {
        this.player.equippedWeaponId = existing.id;
      } else {
        this.player.equippedArmorId = existing.id;
      }
      this.recalculateStats(false);
      audio.talkBlip(720);
      this.pushToast(`Equipped ${existing.name}!`, 'cyan');
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (base.tier >= 30) {
      const req = getTier30CraftRequirements(gearId, {
        inventory: this.player.inventory,
        maxUnlockedAct: this.maxUnlockedAct,
        fenrirDefeated: this.story.fenrirDefeated,
        level: this.player.level,
        enemiesSlain: this.stats.enemiesSlain,
      });
      if (!req.canCraft) {
        const missing = req.gates.find((g) => !g.met)?.label ?? 'Endgame Mastery';
        this.pushToast(`🔒 Tier 30 Forge Locked: ${missing}!`, 'amber');
        this.emitHud();
        return;
      }
    }

    const cost = getBlacksmithForgeCost(gearId);

    if (
      this.player.gold < cost.gold ||
      this.player.materials < cost.materials ||
      this.player.fishTreats < cost.fishTreats
    ) {
      const treatMsg = cost.fishTreats > 0 ? ` & ${cost.fishTreats} Fish Treats` : '';
      this.pushToast(
        `Need ${cost.gold.toLocaleString()} Gold, ${cost.materials} Shards${treatMsg} to forge ${base.name}!`,
        'amber'
      );
      this.emitHud();
      return;
    }

    this.player.gold -= cost.gold;
    this.player.materials -= cost.materials;
    this.player.fishTreats -= cost.fishTreats;

    const forged = createGearInstance(gearId, 0);
    this.player.inventory.push(forged);
    if (base.slot === 'weapon') {
      this.player.equippedWeaponId = forged.id;
    } else {
      this.player.equippedArmorId = forged.id;
    }
    this.recalculateStats(true);

    if (base.tier >= 30) {
      audio.elixirAwaken();
      this.vfx.spawnShockwave(this.player.x, this.player.y, 68, '#fde047', 0.45);
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 34, 115);
      this.spawnFloatingText(this.player.x, this.player.y - 20, '🐉⚔️ FORGED TIER 30!', '#fde047', 1.25);
    } else {
      audio.chestFanfare();
      this.spawnParticles(this.player.x, this.player.y, '#fbbf24', 22, 90);
    }

    this.pushToast(`🔨 Forged & Equipped ${forged.name}!`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public upgradeGear(itemId: string) {
    const item = this.player.inventory.find((i) => i.id === itemId);
    if (!item) return;
    const cost = getUpgradeCost(item);
    if (cost.maxed) return;
    if (this.player.gold < cost.gold || this.player.materials < cost.materials) {
      this.pushToast('Not enough Gold or Shards!', 'amber');
      return;
    }
    this.player.gold -= cost.gold;
    this.player.materials -= cost.materials;
    item.upgradeLevel += 1;
    this.recalculateStats(false);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 20);
    audio.chestFanfare();
    this.pushToast(`Forged ${item.name} +${item.upgradeLevel}!`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  public buyPotion() {
    const price = 20;
    if (this.player.gold < price) {
      this.pushToast('Need 20 Gold for a Health Potion!', 'amber');
      return;
    }
    this.player.gold -= price;
    this.player.healthPotions += 1;
    audio.potionDrink();
    this.pushToast('Bought Health Potion (+1)', 'emerald');
    this.saveProgress();
    this.emitHud();
  }

  public craftAlchemyRelic(recipeId: 'voxel_potion' | 'primal_guardian' | 'neko_thrusters' | 'sea_compass') {
    if (recipeId === 'voxel_potion') {
      if (this.player.gold < 15 || this.player.materials < 1) {
        this.pushToast('Need 15 Gold & 1 Shard!', 'amber');
        return;
      }
      this.player.gold -= 15;
      this.player.materials -= 1;
      this.player.healthPotions += 2;
      audio.potionDrink();
      this.spawnParticles(this.player.x, this.player.y, '#34d399', 18, 80);
      this.pushToast('Transmuted Voxel Potions (+2)!', 'emerald');
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (recipeId === 'primal_guardian') {
      if (this.player.alchemyRelics.primalGuardian) return;
      if (this.player.gold < 60 || this.player.materials < 3) {
        this.pushToast('Need 60 Gold & 3 Shards!', 'amber');
        return;
      }
      this.player.gold -= 60;
      this.player.materials -= 3;
      this.player.alchemyRelics.primalGuardian = true;
      audio.elixirAwaken();
      this.spawnParticles(this.player.x, this.player.y, '#10b981', 24, 95);
      this.pushToast('Spinning Primal Guardian awakened!', 'emerald');
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (recipeId === 'neko_thrusters') {
      if (this.player.alchemyRelics.nekoThrusters) return;
      if (this.player.gold < 40 || this.player.materials < 2) {
        this.pushToast('Need 40 Gold & 2 Shards!', 'amber');
        return;
      }
      this.player.gold -= 40;
      this.player.materials -= 2;
      this.player.alchemyRelics.nekoThrusters = true;
      audio.levelUp();
      this.spawnParticles(this.player.x, this.player.y, '#22d3ee', 22, 95);
      this.pushToast('Neko Noir Thrusters equipped (+18% Speed)!', 'cyan');
      this.saveProgress();
      this.emitHud();
      return;
    }

    if (recipeId === 'sea_compass') {
      if (this.player.alchemyRelics.seaCompass) return;
      if (this.player.gold < 50 || this.player.materials < 2) {
        this.pushToast('Need 50 Gold & 2 Shards!', 'amber');
        return;
      }
      this.player.gold -= 50;
      this.player.materials -= 2;
      this.player.alchemyRelics.seaCompass = true;
      audio.chestFanfare();
      this.spawnParticles(this.player.x, this.player.y, '#fbbf24', 22, 95);
      this.pushToast('Admiral Compass forged (+15% Crit & +25% Gold)!', 'gold');
      this.saveProgress();
      this.emitHud();
    }
  }

  private getEquippedWeapon(): GearItem {
    return this.player.inventory.find((i) => i.id === this.player.equippedWeaponId) ?? this.player.inventory[0];
  }

  private getEquippedArmor(): GearItem {
    return (
      this.player.inventory.find((i) => i.id === this.player.equippedArmorId) ??
      this.player.inventory[1] ??
      this.player.inventory[0]
    );
  }

  private getTotalStats() {
    const w = computeGearEffectiveStats(this.getEquippedWeapon());
    const a = computeGearEffectiveStats(this.getEquippedArmor());
    const skillBonuses = computeSkillTreeBonuses(this.player.unlockedSkills ?? []);
    const capBonuses = computeCapitalBonuses(this.player.capitalBuildings ?? createInitialCapitalBuildings());
    const heroMeta = HERO_METADATA[this.player.activeHeroId ?? 'nyx'];
    const isDragonGodElixir =
      this.currentAct >= 83 || this.player.inventory.some((i) => i.id === 'eternal_omni_blade');
    const atkMult =
      (this.player.duckElixirActive ? (isDragonGodElixir ? 1.35 : 1.22) : 1) *
      heroMeta.atkMult *
      skillBonuses.atkMult *
      capBonuses.atkMult *
      (this.player.steamMechaActive ? 1.65 : 1.0);
    const furyMult = this.player.dragonSlayerFuryTimer > 0 ? 2.0 : 1.0;
    const hoardPenalty = this.dragonController.getGearDebuffAtkPenalty();
    const defMult =
      (this.player.duckElixirActive ? (isDragonGodElixir ? 1.2 : 1.15) : 1) *
      heroMeta.defMult *
      skillBonuses.defMult *
      capBonuses.defMult *
      (this.player.steamMechaActive ? 1.5 : 1.0);
    const hpMult = skillBonuses.hpMult * capBonuses.hpMult;
    return {
      atk: Math.max(
        10,
        Math.round((this.player.baseAtk + w.atk + a.atk - hoardPenalty) * atkMult * furyMult)
      ),
      def: Math.round((this.player.baseDef + a.def) * defMult),
      maxHp: Math.round((this.player.baseMaxHp + a.hp) * hpMult),
      crit: Math.min(
        95,
        w.crit +
          a.crit +
          skillBonuses.critBonus +
          capBonuses.critBonus +
          (this.player.duckElixirActive ? 8 : 0) +
          (this.player.alchemyRelics.seaCompass ? 15 : 0)
      ),
      swordBeam: Boolean(
        this.getEquippedWeapon().swordBeam ||
          this.player.duckElixirActive ||
          skillBonuses.tripleSwordBeam ||
          this.player.activeHeroId === 'great_duck'
      ),
    };
  }

  private recalculateStats(healFull: boolean) {
    const prevMax = this.player.maxHp;
    const totals = this.getTotalStats();
    this.player.maxHp = totals.maxHp;
    if (healFull) {
      this.player.hp = this.player.maxHp;
    } else if (this.player.maxHp > prevMax) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + (this.player.maxHp - prevMax));
    } else {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp);
    }
  }

  private loadAct(actNum: number, spawnSide: 'west' | 'east' | 'center', shouldSave = true) {
    this.currentAct = Math.max(1, Math.min(300, actNum));
    this.maxUnlockedAct = Math.max(this.maxUnlockedAct, this.currentAct);
    this.syncUnlockedHeroesWithProgress();

    const alreadyCleared = this.clearedActs.has(this.currentAct);
    const world = generateActWorld(this.currentAct, spawnSide, this.nightmareMode, alreadyCleared);
    world.chests.forEach((c) => {
      if (this.openedChestIds.has(c.id)) c.opened = true;
    });
    this.currentWorld = world;

    const bgKey = `${this.currentAct}_${world.act.biomeId}`;
    if (!this.actBgCache[bgKey]) {
      this.actBgCache[bgKey] = renderActBackground(world.act, world.grid);
    }

    const safeSpawn = isWalkableTile(
      world.grid,
      Math.floor(world.playerSpawn.x / TILE_SIZE),
      Math.floor(world.playerSpawn.y / TILE_SIZE)
    )
      ? world.playerSpawn
      : findNearestDryTile(world.grid, world.playerSpawn.x, world.playerSpawn.y, false);
    this.player.x = safeSpawn.x;
    this.player.y = safeSpawn.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.oxygenPct = 100;
    this.iceSlideVel = { x: 0, y: 0 };
    this.duckling.x = this.player.x - 18;
    this.duckling.y = this.player.y + 6;
    const leoDry = findNearestDryTile(world.grid, this.player.x - 22, this.player.y - 10, false);
    this.leoCompanion.x = leoDry.x;
    this.leoCompanion.y = leoDry.y;
    const fenDry = findNearestDryTile(world.grid, this.player.x + 22, this.player.y - 10, false);
    this.fenrirCompanion.x = fenDry.x;
    this.fenrirCompanion.y = fenDry.y;
    this.player.partyCompanions = syncPartyCompanions(
      this.player,
      this.player.partyCompanions,
      world.grid,
      this.getExcludedCompanionHeroIds(world)
    );
    this.bossRaidState = createInitialBossRaidState();
    this.projectiles = [];
    this.hazards = [];
    this.vfx.clearAll();
    this.dragonController.resetForAct(world.dragonBallistas ?? []);
    this.biomeMechanics.resetForAct(world.biomeFeatures ?? []);
    const actBlueprint = getActBlueprint(this.currentAct);
    this.surfacePhysics = createInitialSurfacePhysicsState();
    this.destructibleProps = spawnActDestructibleProps(actBlueprint, world.grid, TILE_SIZE);
    this.bespokeTrapState = initActTrapSystem(actBlueprint, world.grid, TILE_SIZE);
    this.hitStopTimer = 0;
    this.traps = world.traps.map((t) => ({ ...t }));
    this.phaseLockPillars = [];
    this.siphonObelisks = [];
    this.cataclysmBurnTimer = 0;
    this.alliedSoldiers = world.alliedSoldiers.map((a) => ({ ...a }));
    this.warBanners = world.warBanners.map((b) => ({ ...b }));
    this.prisonCages = world.prisonCages.map((c) => ({ ...c }));
    this.siegeEngines = world.siegeEngines.map((s) => ({ ...s }));
    this.warMorale = alreadyCleared ? 100 : 52;
    this.warHornWaveTimer = 0;
    this.lavaTickTimer = 0;
    this.goldenEggs = [];
    this.featherPickups = [];
    this.featherDropTimer = 8.0;
    this.dogCounterWaveTriggered = false;
    this.portalCooldown = 0.55;

    this.enemies = world.enemies.map((e) => {
      if (isDragonBossEnemy(e)) ensureDragonState(e);
      if (this.isFinalBossEnemy(e)) {
        e.phaseGatesTriggered = [];
        e.siphonSpawnCooldown = 18.0;
      }
      if ((e.kind === 'fenrir_p1' || e.kind === 'bahamut_p1') && this.player.duckElixirActive) {
        return { ...e, shielded: false };
      }
      return e;
    });

    const mapW = world.grid[0].length * TILE_SIZE;
    const mapH = world.grid.length * TILE_SIZE;
    this.camZoom =
      this.dragonController.hasActiveDragon(this.enemies) ||
      this.currentAct === 180 ||
      this.currentAct === 240 ||
      this.currentAct === 300
        ? 0.85
        : 1.0;
    this.camX = Math.max(0, Math.min(mapW - LOGICAL_W, this.player.x - LOGICAL_W / 2));
    this.camY = Math.max(0, Math.min(mapH - LOGICAL_H, this.player.y - LOGICAL_H / 2));

    this.irisWipeTimer = 0.65;
    this.actBannerTimer = 2.6;

    const activeBoss = this.enemies.find((e) => e.isBoss || e.isMiniBoss);
    const trackId = audio.getTrackForBiome(
      world.act.biomeId,
      activeBoss ? world.act.role : 'normal',
      activeBoss?.kind
    );
    audio.setTrack(trackId, Boolean(activeBoss?.overdrive));

    if (
      activeBoss &&
      this.mode === 'PLAYING' &&
      this.currentAct !== 41 &&
      this.currentAct !== 82 &&
      this.currentAct !== 122 &&
      this.currentAct !== 180 &&
      this.currentAct !== 240 &&
      this.currentAct !== 280 &&
      this.currentAct !== 300
    ) {
      this.bossSplashTimer = 1.65;
      this.bossSplashName = activeBoss.name;
      audio.bossRoar();
      this.shake(0.3, 3.5);
    }

    if (this.currentAct === 41 && !this.story.fenrirIntroSeen && !this.story.fenrirDefeated && this.bossRushStage === null) {
      this.story.fenrirIntroSeen = true;
      this.startDialogue(FENRIR_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.65;
        this.bossSplashName = 'Usurper King Fenrir';
        this.pushToast('Press [Q] to drink The Great Duck’s Potion!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 82 && !this.vargosIntroSeen && !this.clearedActs.has(82) && this.bossRushStage === null) {
      this.vargosIntroSeen = true;
      this.player.duckElixirActive = false;
      this.startDialogue(ACT82_CHARIOT_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.65;
        this.bossSplashName = 'War-Emperor Fenrir & Dread-Chariot Cerberus';
        this.pushToast('Press [Q] to shatter the Imperial Ward & [R] to blow the War-Horn!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 122 && !this.bahamutIntroSeen && !this.clearedActs.has(122) && this.bossRushStage === null) {
      this.bahamutIntroSeen = true;
      this.player.duckElixirActive = false;
      this.startDialogue(ACT122_BAHAMUT_P1_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.85;
        this.bossSplashName = 'Ignis-Bahamut, The World-Breaker Dragon (1,500,000 Total HP)';
        this.pushToast('Press [Q] for 20s Dragon-God Quack Elixir & [R] for United War-Horn!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 123 && !this.clearedActs.has(123)) {
      this.startDialogue(ARC4_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.pushToast('🌊 ARC IV: Stand in Oxygen Bubble Streams Underwater or hot-swap [4] Great Duck!', 'cyan');
        this.emitHud();
      });
    } else if (this.currentAct === 180 && !this.clearedActs.has(180)) {
      this.startDialogue(ACT180_CHARYBDIS_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.95;
        this.bossSplashName = 'CHARYBDIS, THE 8-TENTACLE WORLD-KRAKEN (3,000,000 HP)';
        this.pushToast('🐙 Sever all 8 Independent Kraken Tentacles to break Charybdis’s Abyssal Ward!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 181 && !this.clearedActs.has(181)) {
      this.startDialogue(ARC5_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.pushToast('⚙️ ARC V: Press [G] anytime to pilot the Clockwork Steam-Mecha Suit!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 240 && !this.clearedActs.has(240)) {
      this.startDialogue(ACT240_CHRONOS_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.95;
        this.bossSplashName = 'CHRONOS-OMEGA, THE TIME-REWINDING TITAN (6,000,000 HP)';
        this.pushToast('⏳ Destroy the 4 Corner Chrono-Gears to stop Chronos-Omega’s 5-Second Time Rewind!', 'gold');
        this.emitHud();
      });
    } else if (this.currentAct === 280 && !this.clearedActs.has(280)) {
      this.startDialogue(ACT280_VOID_CLONE_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 1.85;
        this.bossSplashName = 'EVIL VOID-CLONE NYX, ECLIPSE ARCHMAGE (1,200,000 HP)';
        this.emitHud();
      });
    } else if (this.currentAct === 300 && !this.clearedActs.has(300)) {
      this.startDialogue(ACT300_AETHER_NULL_INTRO_LINES, () => {
        this.mode = 'PLAYING';
        this.bossSplashTimer = 2.1;
        this.bossSplashName = 'AETHER-NULL, THE ECLIPSE SINGULARITY (15,000,000 HP)';
        this.pushToast('🌌 TRUE FINAL BOSS: Resist Gravitational Pull & dodge Relativistic Pulsar Sweeps!', 'gold');
        this.emitHud();
      });
    }

    if (shouldSave && this.mode === 'PLAYING') {
      this.saveProgress();
    }
  }

  public handleKeyDown(e: KeyboardEvent) {
    const code = e.code;
    audio.unlock();

    if (code === 'Tab' || code === 'KeyI') {
      e.preventDefault();
      this.toggleInventory();
      return;
    }

    if (code === 'KeyM') {
      if (this.mode === 'PLAYING' || this.mode === 'WORLD_MAP' || this.mode === 'VICTORY') {
        e.preventDefault();
        this.openWorldMap();
      }
      return;
    }

    if (code === 'KeyK') {
      if (this.mode === 'PLAYING' || this.mode === 'SKILL_TREE' || this.mode === 'VICTORY') {
        e.preventDefault();
        this.openSkillTree();
      }
      return;
    }

    if (code === 'KeyP') {
      if (this.mode === 'PLAYING' || this.mode === 'CAPITAL_HUB' || this.mode === 'VICTORY') {
        e.preventDefault();
        this.openCapitalHub();
      }
      return;
    }

    if (code === 'Escape') {
      if (
        this.mode === 'INVENTORY' ||
        this.mode === 'BLACKSMITH' ||
        this.mode === 'WORLD_MAP' ||
        this.mode === 'CAPITAL_HUB' ||
        this.mode === 'SKILL_TREE'
      ) {
        this.closeModal();
      }
      return;
    }

    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE') {
      const current = this.dialogueQueue[this.dialogueIndex];
      if (current?.choices) {
        if (code === 'Digit1' && current.choices[0]) {
          e.preventDefault();
          this.dialogueChars = current.text.length;
          this.selectDialogueChoice(current.choices[0].id);
          return;
        }
        if (code === 'Digit2' && current.choices[1]) {
          e.preventDefault();
          this.dialogueChars = current.text.length;
          this.selectDialogueChoice(current.choices[1].id);
          return;
        }
      }
      if (code === 'Space' || code === 'Enter' || code === 'KeyE') {
        e.preventDefault();
        this.advanceDialogue();
      }
      return;
    }

    if (this.mode !== 'PLAYING') return;

    this.keys.add(code);

    if (code === 'Digit1') {
      e.preventDefault();
      this.swapHero('nyx');
    } else if (code === 'Digit2') {
      e.preventDefault();
      this.swapHero('king_leo');
    } else if (code === 'Digit3') {
      e.preventDefault();
      this.swapHero('fenrir');
    } else if (code === 'Digit4') {
      e.preventDefault();
      this.swapHero('great_duck');
    } else if (code === 'Space') {
      e.preventDefault();
      this.triggerAttack();
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      e.preventDefault();
      this.triggerDodge();
    } else if (code === 'KeyE') {
      e.preventDefault();
      this.triggerInteract();
    } else if (code === 'KeyF') {
      e.preventDefault();
      this.tossBrewedPotion();
    } else if (code === 'KeyG') {
      e.preventDefault();
      this.toggleSteamMecha();
    } else if (code === 'KeyH') {
      e.preventDefault();
      this.useHealthPotion();
    } else if (code === 'KeyQ') {
      e.preventDefault();
      this.useDuckElixir();
    } else if (code === 'KeyR') {
      e.preventDefault();
      this.triggerDuckSummon();
    } else if (code === 'KeyC') {
      e.preventDefault();
      this.cycleFur();
    } else if (code === 'KeyB') {
      e.preventDefault();
      this.toggleBreadLoaf();
    } else if (code === 'KeyV') {
      e.preventDefault();
      this.cycleCatEmote();
    }
  }

  public handleKeyUp(e: KeyboardEvent) {
    this.keys.delete(e.code);
  }

  public handleMouseMove(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.mouseLogical.x = ((clientX - rect.left) / rect.width) * LOGICAL_W;
    this.mouseLogical.y = ((clientY - rect.top) / rect.height) * LOGICAL_H;
  }

  public handleMouseDown(button: number) {
    audio.unlock();
    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE') {
      if (button === 0) this.advanceDialogue();
      return;
    }
    if (this.mode !== 'PLAYING') return;
    if (button === 0) {
      const worldMouseX = (this.mouseLogical.x - LOGICAL_W / 2) / Math.max(0.5, this.camZoom) + LOGICAL_W / 2 + this.camX;
      const worldMouseY = (this.mouseLogical.y - LOGICAL_H / 2) / Math.max(0.5, this.camZoom) + LOGICAL_H / 2 + this.camY;
      const angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
      this.triggerAttack(angle);
    } else if (button === 2) {
      this.triggerDodge();
    }
  }

  public setAnalogVector(x: number, y: number) {
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      this.analogInput.x = x / mag;
      this.analogInput.y = y / mag;
    } else {
      this.analogInput.x = x;
      this.analogInput.y = y;
    }
  }

  public setTouchInput(dirX: number, dirY: number) {
    this.setAnalogVector(dirX, dirY);
  }

  public triggerActionButton(action: 'attack' | 'dodge' | 'interact' | 'heal' | 'elixir' | 'summon' | 'loaf' | 'emote') {
    audio.unlock();
    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE') {
      this.advanceDialogue();
      return;
    }
    if (this.mode !== 'PLAYING') return;
    if (action === 'attack') this.triggerAttack();
    if (action === 'dodge') this.triggerDodge();
    if (action === 'interact') this.triggerInteract();
    if (action === 'heal') this.useHealthPotion();
    if (action === 'elixir') this.useDuckElixir();
    if (action === 'summon') this.triggerDuckSummon();
    if (action === 'loaf') this.toggleBreadLoaf();
    if (action === 'emote') this.cycleCatEmote();
  }

  public triggerDuckSummon() {
    if (this.player.duckSummonCooldown > 0) {
      this.pushToast(`War-Horn recharging (${Math.ceil(this.player.duckSummonCooldown)}s)`, 'cyan');
      return;
    }
    this.player.duckSummonCooldown = 12;
    this.warHornWaveTimer = 0.65;
    this.warHornActiveTimer = 6.0;
    this.warMorale = Math.min(100, this.warMorale + 10);
    audio.warHorn();
    this.shake(0.24, 3.5);
    this.spawnParticles(this.player.x, this.player.y, '#fde047', 24, 110);
    this.spawnFloatingText(this.player.x, this.player.y - 18, '📯 WAR HORN RALLY! (+50% SPD)', '#fde047', 1.2);

    // Rally & Heal all Allied Cat Soldiers by 30% + 6s +50% Attack/Move Speed
    for (const ally of this.alliedSoldiers) {
      ally.hp = Math.min(ally.maxHp, ally.hp + Math.round(ally.maxHp * 0.35));
      ally.rallyTimer = 6.0;
      this.spawnParticles(ally.x, ally.y, '#38bdf8', 10, 75);
      this.spawnFloatingText(ally.x, ally.y - 14, '🐾 FOR KING LEO!', '#fde047', 0.95);
    }

    // In Arc III (Acts 83–122), spawn mixed Cat Knight + Reformed Dog Paladin reinforcements on War-Horn!
    if (this.alliedSoldiers.length < (this.currentAct >= 83 ? 6 : 5)) {
      const rawRx = Math.max(48, Math.min(540, this.player.x - 24));
      const rawRy = Math.max(48, Math.min(310, this.player.y + (Math.random() - 0.5) * 28));
      const drySpot = findNearestDryTile(this.currentWorld.grid, rawRx, rawRy, false);
      const reinforceKind =
        this.currentAct >= 83 && this.alliedSoldiers.length % 2 === 1 ? 'bulldog_paladin' : 'cat_knight';
      const knight = spawnAlliedSoldier(`ally_horn_${Date.now()}`, reinforceKind, drySpot.x, drySpot.y, this.currentAct);
      knight.rallyTimer = 6.0;
      this.alliedSoldiers.push(knight);
      this.spawnParticles(drySpot.x, drySpot.y, '#fde047', 16, 85);
    }
    this.dragonController.rallyAllLockedBallistas(this.enemies, this.player, this.getDragonCallbacks());
    this.vfx.spawnShockwave(this.player.x, this.player.y, 98, '#fde047', 0.55);

    if (this.story.spokeToGreatDuck) {
      this.duckFlyover = {
        active: true,
        x: Math.max(20, this.camX - 24),
        y: Math.max(40, this.player.y - 44),
        eggsDropped: 0,
      };
      audio.duckQuack();
      this.pushToast(
        this.currentAct >= 83
          ? '📯 United War-Horn! Cat & Dog Warriors rallied (+35% HP, +50% Speed) & Great Duck Swoops!'
          : '📯 War-Horn Sounded! Cat Army Rallied (+35% HP, +50% Speed) & Great Duck Swoops!',
        'gold'
      );
    } else {
      this.pushToast('📯 War-Horn Sounded! Allied Soldiers healed & rallied (+50% Speed)!', 'gold');
    }
    this.emitHud();
  }

  private startDialogue(lines: DialogueLine[], onComplete: () => void) {
    this.dialogueQueue = lines;
    this.dialogueIndex = 0;
    this.dialogueChars = 0;
    this.dialogueCharTimer = 0;
    this.onDialogueComplete = onComplete;
    this.keys.clear();
    if (this.mode !== 'INTRO_CUTSCENE' && this.mode !== 'EPILOGUE_CUTSCENE') {
      this.mode = 'DIALOGUE';
    }
    const first = lines[0];
    if (first?.sceneCue) {
      audio.setCutsceneCueTrack(first.sceneCue);
    }
    if (first?.sound === 'quack') audio.duckQuack();
    else if (first?.sound === 'roar') audio.bossRoar();
    else if (first?.sound === 'chime') audio.levelUp();
    this.emitHud();
  }

  public advanceDialogue() {
    const current = this.dialogueQueue[this.dialogueIndex];
    if (!current) {
      this.finishDialogue();
      return;
    }
    if (this.dialogueChars < current.text.length) {
      this.dialogueChars = current.text.length;
      this.emitHud();
      return;
    }
    if (current.choices && current.choices.length > 0) {
      return;
    }
    this.dialogueIndex += 1;
    if (this.dialogueIndex >= this.dialogueQueue.length) {
      this.finishDialogue();
      return;
    }
    this.dialogueChars = 0;
    this.dialogueCharTimer = 0;
    const next = this.dialogueQueue[this.dialogueIndex];
    if (next?.sceneCue) {
      audio.setCutsceneCueTrack(next.sceneCue);
    }
    if (next?.sound === 'quack') audio.duckQuack();
    else if (next?.sound === 'roar') audio.bossRoar();
    else if (next?.sound === 'chime') audio.levelUp();
    this.emitHud();
  }

  public selectDialogueChoice(choiceId: string) {
    const current = this.dialogueQueue[this.dialogueIndex];
    if (!current?.choices) return;
    const choice = current.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.effect === 'duck_catnip') {
      this.player.gold += 100;
      this.stats.goldCollected += 100;
      audio.chestFanfare();
      this.pushToast('+100 Sanctuary Gold!', 'gold');
    } else if (choice.effect === 'duck_pet') {
      this.player.fishTreats += 3;
      this.stats.fishTreatsCollected += 3;
      this.player.happyJumpTimer = 0.65;
      audio.duckQuack();
      this.pushToast('Fluffy wing pat! +3 Lucky Fish Treats', 'cyan');
    } else if (choice.effect === 'leo_feast') {
      this.player.fishTreats += 5;
      this.stats.fishTreatsCollected += 5;
      this.player.happyJumpTimer = 0.75;
      audio.levelUp();
    } else if (choice.effect === 'leo_rush') {
      this.pendingBossRushFromChoice = true;
      audio.elixirAwaken();
    } else if (choice.effect === 'leo_war_campaign') {
      this.pendingWarCampaignFromChoice = true;
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 42);
      this.player.gold += 150;
      this.player.healthPotions += 3;
      audio.elixirAwaken();
      this.pushToast('War of Two Kingdoms Unlocked! +150G & +3 Potions!', 'gold');
    } else if (choice.effect === 'leo_dragon_campaign') {
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 83);
      this.story.dragonCataclysmSeen = true;
      this.player.gold += 250;
      this.player.healthPotions += 4;
      audio.elixirAwaken();
      this.pushToast('Dragon Cataclysm Arc III Unlocked! +250G & +4 Potions!', 'gold');
    }

    const remaining = this.dialogueQueue.slice(this.dialogueIndex + 1);
    this.dialogueQueue = [
      ...this.dialogueQueue.slice(0, this.dialogueIndex + 1),
      ...choice.replyLines,
      ...remaining,
    ];
    this.dialogueIndex += 1;
    this.dialogueChars = 0;
    this.dialogueCharTimer = 0;
    const next = this.dialogueQueue[this.dialogueIndex];
    if (next?.sound === 'quack') audio.duckQuack();
    else if (next?.sound === 'roar') audio.bossRoar();
    else if (next?.sound === 'chime') audio.levelUp();
    this.emitHud();
  }

  private finishDialogue() {
    const wasIntro = this.mode === 'INTRO_CUTSCENE';
    const cb = this.onDialogueComplete;
    this.dialogueQueue = [];
    this.onDialogueComplete = null;
    if (cb) cb();
    if (wasIntro && this.mode === 'PLAYING') {
      const activeBoss = this.enemies.find((e) => e.isBoss || e.isMiniBoss);
      const trackId = audio.getTrackForBiome(
        this.currentWorld.act.biomeId,
        activeBoss ? this.currentWorld.act.role : 'normal',
        activeBoss?.kind
      );
      audio.setTrack(trackId, false);
      this.actBannerTimer = 2.8;
    }
    this.emitHud();
  }

  public useHealthPotion() {
    if (this.player.potionCooldown > 0) {
      this.pushToast(`⏳ Potion on cooldown (${Math.ceil(this.player.potionCooldown)}s) due to Mortal Wound!`, 'amber');
      return;
    }
    if (this.player.healthPotions <= 0) {
      this.pushToast('No Health Potions left!', 'amber');
      return;
    }
    if (this.player.hp >= this.player.maxHp) {
      this.pushToast('HP is already full!', 'cyan');
      return;
    }
    this.player.healthPotions -= 1;
    this.stats.potionsUsed += 1;
    const wounded = this.player.mortalWoundTimer > 0;
    const healAmt = Math.round(this.player.maxHp * (wounded ? 0.225 : 0.45));
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
    if (wounded) {
      this.player.potionCooldown = 10.0;
      this.player.potionMaxCooldown = 10.0;
    }
    audio.potionDrink();
    this.spawnFloatingText(
      this.player.x,
      this.player.y - 12,
      wounded ? `+${healAmt} HP (💔 -50% WOUND)` : `+${healAmt} HP`,
      wounded ? '#fb7185' : '#4ade80'
    );
    this.spawnParticles(this.player.x, this.player.y, wounded ? '#fb7185' : '#4ade80', 14, 55);
    this.emitHud();
  }

  public useDuckElixir() {
    if (!this.player.hasDuckElixir) {
      this.pushToast('Seek The Great Duck in Act 40 first!', 'amber');
      return;
    }
    if (this.player.duckElixirActive) {
      this.pushToast(
        `⏳ Astral Quack Form active (${this.player.duckElixirTimer.toFixed(1)}s remaining)!`,
        'gold'
      );
      return;
    }
    if (this.player.duckElixirCooldown > 0) {
      this.pushToast(
        `🦆 Elixir brewing (${Math.ceil(this.player.duckElixirCooldown)}s) — Collect 🪶 ${this.player.elixirFeathers}/5 Golden Feathers or Perfect Dodge/Backstab to refill!`,
        'amber'
      );
      return;
    }

    const isDragonGodElixir =
      this.currentAct >= 83 || this.player.inventory.some((i) => i.id === 'eternal_omni_blade');
    const duration = isDragonGodElixir ? 20.0 : 8.0;

    this.player.duckElixirActive = true;
    this.player.duckElixirTimer = duration;
    this.player.duckElixirMaxTimer = duration;
    this.player.duckElixirCooldown = 0;
    this.player.elixirFeathers = 0;
    this.player.duckElixirBurstTimer = 0.85;
    this.player.happyJumpTimer = 0.65;
    this.player.hp = Math.min(
      this.player.maxHp,
      this.player.hp + Math.round(this.player.maxHp * (isDragonGodElixir ? 0.5 : 0.3))
    );
    this.player.stamina = this.player.maxStamina;
    this.stats.potionsUsed += 1;
    audio.elixirAwaken();
    this.triggerHaptic([25, 30, 45]);
    this.shake(0.08, 2.5, true);
    this.vfx.spawnShockwave(this.player.x, this.player.y, 44, '#fde047', 0.38);
    this.spawnParticles(this.player.x, this.player.y, '#fde047', 24, 115);
    this.spawnParticles(this.player.x, this.player.y, '#f472b6', 10, 95);
    this.spawnParticles(this.player.x, this.player.y, '#38bdf8', 10, 95);
    this.spawnFloatingText(
      this.player.x,
      this.player.y - 18,
      isDragonGodElixir ? '^ω^ DRAGON-GOD QUACK! (20s)' : '^ω^ GOLDEN NYX! (8.0s)',
      '#fde047',
      1.2
    );
    this.pushToast(
      isDragonGodElixir
        ? '🦆🐉 Dragon-God Quack Elixir Active (20s)! +35% ATK, +20% DEF & Barrier Shatter!'
        : '🦆✨ Great Duck’s Elixir Active (8.0s Burst)! +22% ATK, +15% DEF & Dark Barrier Pierce!',
      'gold'
    );

    for (const dBoss of this.enemies) {
      if (isDragonBossEnemy(dBoss)) {
        const ds = ensureDragonState(dBoss);
        if (!ds.coreCracked) {
          ds.coreCracked = true;
          this.vfx.spawnShockwave(dBoss.x, dBoss.y, 60, '#fde047', 0.4);
          this.spawnFloatingText(dBoss.x, dBoss.y - 24, '💥 DRAGON CORE CRACKED!', '#fde047', 1.25);
        }
      }
    }

    const shieldedBoss = this.enemies.find(
      (e) =>
        (e.kind === 'fenrir_p1' || e.kind === 'fenrir_p2' || e.kind === 'bahamut_p1') && e.shielded
    );
    if (shieldedBoss) {
      const wasFirstBreak = !this.story.fenrirShieldBroken && shieldedBoss.kind === 'fenrir_p1';
      shieldedBoss.shielded = false;
      this.story.fenrirShieldBroken = true;
      this.vfx.spawnShockwave(shieldedBoss.x, shieldedBoss.y, 64, '#fde047', 0.45);
      this.spawnParticles(shieldedBoss.x, shieldedBoss.y, '#c084fc', 36, 120);
      this.spawnFloatingText(shieldedBoss.x, shieldedBoss.y - 18, '💥 BARRIER SHATTERED!', '#fde047', 1.2);
      if (wasFirstBreak) {
        this.startDialogue(FENRIR_SHIELD_SHATTER_LINES, () => {
          this.mode = 'PLAYING';
          this.emitHud();
        });
      } else {
        this.emitHud();
      }
    } else {
      this.emitHud();
    }
  }

  private addElixirFeatherCharge(amount: number, reason: string) {
    if (!this.player.hasDuckElixir || this.player.duckElixirActive || this.player.duckElixirCooldown <= 0) {
      return;
    }
    this.player.elixirFeathers = Math.min(5, this.player.elixirFeathers + amount);
    this.player.duckElixirCooldown = Math.max(0, this.player.duckElixirCooldown - 9.0 * amount);
    if (this.player.elixirFeathers >= 5 || this.player.duckElixirCooldown <= 0) {
      this.player.duckElixirCooldown = 0;
      this.player.elixirFeathers = 5;
      audio.levelUp();
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 22, 95);
      this.spawnFloatingText(this.player.x, this.player.y - 20, '🦆 ELIXIR 100% READY! [Q]', '#fde047', 1.22);
      this.pushToast(`🦆🪶 5/5 Golden Feathers (${reason})! Great Duck’s Elixir [Q] 100% READY!`, 'gold');
    } else {
      this.spawnFloatingText(
        this.player.x,
        this.player.y - 16,
        `🪶 ${this.player.elixirFeathers}/5 FEATHERS!`,
        '#fde047',
        1.08
      );
    }
    this.emitHud();
  }

  private spawnArenaFeatherDrops(count: number) {
    audio.duckQuack();
    this.duckFlyover = {
      active: true,
      x: this.camX - 24,
      y: Math.max(48, this.player.y - 38),
      eggsDropped: 5,
    };
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / Math.max(1, count) + Math.random() * 0.6;
      const dist = 34 + Math.random() * 38;
      const fx = Math.max(42, Math.min(438, this.player.x + Math.cos(ang) * dist));
      const fy = Math.max(48, Math.min(224, this.player.y + Math.sin(ang) * dist));
      this.featherPickups.push({
        id: `feather_${Date.now()}_${i}_${Math.random()}`,
        x: fx,
        y: fy,
        vy: 0,
        life: 18.0,
      });
      this.spawnParticles(fx, fy, '#fde047', 10, 60);
    }
  }

  private getDragonCallbacks(): DragonCombatCallbacks {
    return {
      vfx: this.vfx,
      damagePlayer: (rawDmg, sx, sy, options) => this.damagePlayer(rawDmg, sx, sy, options),
      spawnParticles: (x, y, color, count, speed) => this.spawnParticles(x, y, color, count, speed),
      spawnFloatingText: (x, y, text, color, scale) => this.spawnFloatingText(x, y, text, color, scale),
      pushToast: (text, accent) => this.pushToast(text, accent),
      shake: (duration, intensity) => this.shake(duration, intensity, duration >= 0.5),
      setHitStop: (duration) => {
        this.hitStopTimer = Math.max(this.hitStopTimer, duration);
      },
      addBossStagger: (enemy, amount) => this.addBossStagger(enemy, amount),
      spawnDragonkinSquad: (x, y) => {
        if (this.enemies.length <= 20) {
          this.triggerDogKingdomCounterAttack(x, y);
        }
      },
      damageEnemyDirect: (
        enemy,
        rawDmg,
        critChance,
        dirX,
        dirY,
        forceCrit,
        staggerBonus,
        isDirectMelee,
        bypassPartArmor
      ) =>
        this.damageEnemy(
          enemy,
          rawDmg,
          critChance,
          dirX,
          dirY,
          forceCrit,
          staggerBonus,
          isDirectMelee,
          bypassPartArmor
        ),
      moveWithCollision: (ent, dx, dy) => this.moveEntityWithTileCollision(ent, dx, dy, this.currentWorld.grid),
    };
  }

  private getBiomeCallbacks(): BiomeMechanicsCallbacks {
    return {
      vfx: this.vfx,
      damagePlayer: (rawDmg, sx, sy) => this.damagePlayer(rawDmg, sx, sy),
      damageEnemy: (enemy, rawDmg, critChance, dirX, dirY, forceCrit, staggerBonus) =>
        this.damageEnemy(enemy, rawDmg, critChance, dirX, dirY, forceCrit, staggerBonus),
      spawnParticles: (x, y, color, count, speed) => this.spawnParticles(x, y, color, count, speed),
      spawnFloatingText: (x, y, text, color, scale) => this.spawnFloatingText(x, y, text, color, scale),
      pushToast: (text, accent) => this.pushToast(text, accent),
      shake: (duration, intensity) => this.shake(duration, intensity),
      giveGold: (amount) => {
        this.player.gold += amount;
        this.stats.goldCollected += amount;
      },
      boostMorale: (amount) => {
        this.warMorale = Math.min(100, this.warMorale + amount);
      },
      moveWithCollision: (ent, dx, dy) => this.moveEntityWithTileCollision(ent, dx, dy, this.currentWorld.grid),
    };
  }

  private triggerAttack(overrideAngle?: number) {
    if (this.dragonController.mount.active) {
      this.dragonController.triggerMountSlash(this.enemies, this.getDragonCallbacks());
      return;
    }
    if (this.player.attackCooldown > 0 || this.player.dodgeTimer > 0 || this.player.stunTimer > 0) return;

    const dirVec = this.facingToVec(this.player.facing);
    let angle = overrideAngle !== undefined ? overrideAngle : Math.atan2(dirVec.y, dirVec.x);

    // Auto-aim assist toward nearest enemy within 82px when using Keyboard Space or Mobile Slash
    if (overrideAngle === undefined && this.enemies.length > 0) {
      let bestDist = 82;
      let bestEnemy: Enemy | null = null;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
        if (d < bestDist) {
          bestDist = d;
          bestEnemy = e;
        }
      }
      if (bestEnemy) {
        angle = Math.atan2(bestEnemy.y - this.player.y, bestEnemy.x - this.player.x);
      }
    }

    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      this.player.facing = Math.cos(angle) >= 0 ? 'right' : 'left';
    } else {
      this.player.facing = Math.sin(angle) >= 0 ? 'down' : 'up';
    }

    this.player.attackAngle = angle;
    this.player.attackTimer = 0.16;
    // Modest +15% Attack Speed while Great Duck's Elixir is active (nerfed from +40%)
    this.player.attackCooldown = this.player.duckElixirActive ? 0.19 : 0.23;
    this.player.comboResetTimer = 0.65;

    const combo = this.player.comboStep;
    const isPerfectEmpowered = this.player.perfectDodgeEmpowered;
    this.player.perfectDodgeEmpowered = false;

    audio.swordSlash(combo);
    this.player.vx += Math.cos(angle) * 58;
    this.player.vy += Math.sin(angle) * 58;

    const skillBonuses = computeSkillTreeBonuses(this.player.unlockedSkills);
    const equippedWeapon = this.getEquippedWeapon();
    this.vfx.spawnSlash(
      this.player.x,
      this.player.y,
      angle,
      equippedWeapon.tier,
      (combo % 3) as 0 | 1 | 2,
      this.player.duckElixirActive || combo === 3
    );

    const totals = this.getTotalStats();
    const playerElev = this.surfacePhysics.playerElevation;
    const isPlungeSlash = this.surfacePhysics.ledgePlungeWindowTimer > 0;
    if (isPlungeSlash) {
      this.surfacePhysics.ledgePlungeWindowTimer = 0;
      this.vfx.spawnShockwave(this.player.x, this.player.y, 58, '#facc15', 0.42);
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 22, 105);
      this.spawnFloatingText(this.player.x, this.player.y - 22, '💥 METEOR PLUNGE SLASH! (2.0x AoE)', '#facc15', 1.25);
    }
    const isBushAmbush = this.surfacePhysics.ambushCritReady;
    if (isBushAmbush) {
      this.surfacePhysics.ambushCritReady = false;
      this.spawnParticles(this.player.x, this.player.y, '#4ade80', 16, 85);
      this.spawnFloatingText(this.player.x, this.player.y - 20, '🐾 BUSH AMBUSH CRIT! (2.0x)', '#4ade80', 1.2);
    }
    const isTornadoHit = combo === 3 && skillBonuses.tornadoFinisher;
    if (isTornadoHit) {
      this.vfx.spawnShockwave(this.player.x, this.player.y, 52, '#38bdf8', 0.36);
      this.spawnFloatingText(this.player.x, this.player.y - 18, '🌪️ 4TH-HIT TORNADO FINISHER!', '#38bdf8', 1.18);
    }
    const reach =
      (isPlungeSlash ? 56 : isTornadoHit ? 54 : combo === 2 ? 38 : 31) +
      (isPerfectEmpowered ? 8 : 0) +
      (this.player.duckElixirActive ? 3 : 0) +
      (this.player.steamMechaActive ? 14 : 0);
    const arcCosThreshold = isPlungeSlash || isTornadoHit ? -1.0 : combo === 2 ? -0.15 : 0.12;

    // Sword-Beam on 3rd combo hit or Perfect Dodge!
    // Tier 30 Eternal Omni-Blade fires Quadruple Dragon-Slayer Beams; Tier 20+ fires Triple Rainbow Sword-Beams!
    const isEternalOmni = this.player.equippedWeaponId === 'eternal_omni_blade';
    const isPrimordialExcalibur =
      this.player.equippedWeaponId === 'primordial_starlight_excalibur' || equippedWeapon.tier >= 21;
    if ((combo === 2 && totals.swordBeam) || isPerfectEmpowered) {
      audio.swordBeam();
      const waveAngles =
        isEternalOmni && combo === 2
          ? [angle - 0.24, angle - 0.08, angle + 0.08, angle + 0.24]
          : isPrimordialExcalibur && combo === 2
          ? [angle - 0.18, angle, angle + 0.18]
          : [angle];
      const rainbowColors = isEternalOmni
        ? ['#ef4444', '#fde047', '#38bdf8', '#f472b6']
        : ['#fde047', '#38bdf8', '#f472b6'];
      for (let wIdx = 0; wIdx < waveAngles.length; wIdx++) {
        const wAng = waveAngles[wIdx];
        this.projectiles.push({
          id: `sb_${performance.now()}_${wIdx}_${Math.random()}`,
          fromPlayer: true,
          x: this.player.x + Math.cos(wAng) * 12,
          y: this.player.y + Math.sin(wAng) * 12,
          vx: Math.cos(wAng) * 245,
          vy: Math.sin(wAng) * 245,
          radius: isPerfectEmpowered ? 8 : 6,
          damage: Math.round(totals.atk * (isPerfectEmpowered ? 1.45 : this.player.duckElixirActive ? 0.95 : 0.85) * (playerElev > 0 ? 1.25 : 1.0)),
          life: 0.85 * (playerElev > 0 ? 1.3 : 1.0),
          maxLife: 0.85 * (playerElev > 0 ? 1.3 : 1.0),
          color:
            waveAngles.length > 1
              ? rainbowColors[wIdx % rainbowColors.length]
              : isPerfectEmpowered
              ? '#38bdf8'
              : this.player.duckElixirActive
              ? '#fde047'
              : '#f59e0b',
          coreColor: '#fef9c3',
          kind: 'sword_beam',
          pierce: true,
        });
      }
    }

    // Deflect Reflectable Arcane Orbs back at Bosses for massive Stagger & Damage!
    for (const pr of this.projectiles) {
      if (!pr.fromPlayer && pr.reflectable) {
        const pd = Math.hypot(pr.x - this.player.x, pr.y - this.player.y);
        if (pd <= reach + 16) {
          pr.fromPlayer = true;
          pr.pierce = true;
          const target = this.enemies.find((e) => e.isBoss || e.isMiniBoss) ?? this.enemies[0];
          const refAng = target ? Math.atan2(target.y - pr.y, target.x - pr.x) : angle;
          pr.vx = Math.cos(refAng) * 240;
          pr.vy = Math.sin(refAng) * 240;
          pr.damage = Math.round(totals.atk * 2.4);
          pr.color = '#4ade80';
          pr.coreColor = '#fef9c3';
          pr.life = 1.4;
          audio.swordBeam();
          this.spawnParticles(pr.x, pr.y, '#4ade80', 14, 90);
          this.spawnFloatingText(pr.x, pr.y - 12, '⚡ ORB DEFLECTED!', '#4ade80', 1.15);
        }
      }
    }

    this.enemies.forEach((enemy) => {
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const isDragon = isDragonBossEnemy(enemy);
      const effectiveReach = reach + enemy.width * 0.45 + (isDragon ? 8 : 0);
      if (dist <= effectiveReach) {
        if (isDragon && ensureDragonState(enemy).altitude === 'sky') {
          this.spawnFloatingText(enemy.x, enemy.y - 16, '🦅 TOO HIGH! FIRE BALLISTA [E]!', '#fbbf24', 1.0);
          return;
        }
        const dot = dist > 0.01 ? (dx / dist) * Math.cos(angle) + (dy / dist) * Math.sin(angle) : 1;
        if (dot >= arcCosThreshold || dist < 16) {
          const comboMult = combo === 2 ? 1.45 : combo === 1 ? 1.15 : 1.0;
          const counterMult = isPerfectEmpowered ? 2.5 : 1.0;
          const plungeMult = isPlungeSlash ? 2.0 : 1.0;
          const bushMult = isBushAmbush ? 2.0 : 1.0;
          const enemyElev = getTileElevation(
            getActBlueprint(this.currentAct),
            Math.floor(enemy.x / TILE_SIZE),
            Math.floor(enemy.y / TILE_SIZE)
          );
          const hgBonus = computeHighGroundCombatMultiplier(playerElev, enemyElev);
          if (hgBonus.hasAdvantage && Math.random() < 0.45) {
            this.spawnFloatingText(enemy.x, enemy.y - 22, '⛰️ HIGH GROUND +25%!', '#fde047', 0.95);
          }
          this.damageEnemy(
            enemy,
            totals.atk * comboMult * counterMult * plungeMult * bushMult * hgBonus.dmgMult,
            totals.crit,
            Math.cos(angle),
            Math.sin(angle),
            isPerfectEmpowered || isPlungeSlash || isBushAmbush,
            isPlungeSlash ? 25 : 0,
            true
          );
        }
      }
    });

    // Slash Destructible Terrain Props (Breakable Crates, Explosive Oil Barrels, Zelda Bushes, Crumbling Pillars, Pushable Blocks)
    if (this.destructibleProps.length > 0) {
      const propRes = damageDestructiblePropsInRadius(
        this.destructibleProps,
        this.player.x + Math.cos(angle) * 14,
        this.player.y + Math.sin(angle) * 14,
        reach,
        totals.atk
      );
      if (propRes.goldDropped > 0) {
        this.player.gold += propRes.goldDropped;
        this.stats.goldCollected += propRes.goldDropped;
        this.spawnFloatingText(this.player.x, this.player.y - 16, `🌿 +${propRes.goldDropped}G`, '#fde047', 1.0);
      }
      if (propRes.heartsDropped > 0) {
        const heal = Math.round(this.player.maxHp * 0.15);
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.spawnFloatingText(this.player.x, this.player.y - 24, `❤️ +${heal} HP`, '#4ade80', 1.05);
      }
      for (const exp of propRes.explosions) {
        this.vfx.spawnShockwave(exp.x, exp.y, exp.radius, '#f97316', 0.4);
        this.spawnParticles(exp.x, exp.y, '#f97316', 24, 110);
        this.spawnFloatingText(exp.x, exp.y - 18, '🛢️ BARREL BLAST!', '#f97316', 1.2);
        for (const e of [...this.enemies]) {
          if (Math.hypot(e.x - exp.x, e.y - exp.y) <= exp.radius) {
            this.damageEnemy(e, exp.damage, 50, 0, -1, true, 30);
          }
        }
      }
    }

    // Slash Phase-Lock Rune Pillars & Corrupted Siphon Obelisks!
    const structureHitDmg = Math.max(120, Math.round(totals.atk * (combo === 2 ? 1.45 : combo === 1 ? 1.15 : 1.0)));
    for (const pillar of this.phaseLockPillars) {
      if (pillar.hp > 0 && Math.hypot(pillar.x - this.player.x, pillar.y - this.player.y) <= reach + 22) {
        this.damagePhaseLockPillar(pillar, structureHitDmg);
      }
    }
    for (const ob of this.siphonObelisks) {
      if (ob.hp > 0 && Math.hypot(ob.x - this.player.x, ob.y - this.player.y) <= reach + 22) {
        this.damageSiphonObelisk(ob, structureHitDmg);
      }
    }

    // Slash Dragon Stolen Treasure Hoard Piles (3 hits shatters & grants +100% Fury!)
    for (const pile of [...this.dragonController.hoardPiles]) {
      if (Math.hypot(pile.x - this.player.x, pile.y - this.player.y) <= reach + 20) {
        pile.hp -= 1;
        audio.hitImpact(true);
        this.spawnParticles(pile.x, pile.y, '#fde047', 12, 75);
        if (pile.hp <= 0) {
          this.dragonController.breakHoardPile(pile, this.player, this.featherPickups, this.getDragonCallbacks());
        } else {
          this.spawnFloatingText(pile.x, pile.y - 14, `💎 PILE (${pile.hp}/3)`, '#fde047', 1.05);
        }
      }
    }

    // Smash Iron Prisoner Cages to rescue captured Cat Kingdom Soldiers!
    for (const cage of this.prisonCages) {
      if (cage.broken) continue;
      if (Math.hypot(cage.x - this.player.x, cage.y - this.player.y) <= reach + 18) {
        this.damagePrisonCage(cage, totals.atk);
      }
    }

    // Attack Dog Kingdom Siege Catapults!
    for (const siege of this.siegeEngines) {
      if (siege.destroyed) continue;
      if (Math.hypot(siege.x - this.player.x, siege.y - this.player.y) <= reach + 20) {
        this.damageSiegeEngine(siege, totals.atk);
      }
    }

    // Trigger interactive biome traps/mechanics (Tripwires, Minecarts, Levers, Chandeliers, Barrels, etc.)
    this.biomeMechanics.handlePlayerSlash(
      this.player.x,
      this.player.y,
      reach,
      this.enemies,
      this.getBiomeCallbacks()
    );

    const maxComboSteps = skillBonuses.tornadoFinisher ? 4 : 3;
    this.player.comboStep = ((combo + 1) % maxComboSteps) as 0 | 1 | 2 | 3;
  }

  private triggerDodge() {
    if (this.dragonController.mount.active) {
      this.dragonController.triggerMountDodge();
      return;
    }
    if (this.player.dodgeTimer > 0 || this.player.dodgeCooldown > 0 || this.player.stamina < 1) return;
    this.player.stunTimer = 0;

    let dx = this.analogInput.x;
    let dy = this.analogInput.y;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += 1;

    if (Math.hypot(dx, dy) < 0.15) {
      const f = this.facingToVec(this.player.facing);
      dx = f.x;
      dy = f.y;
    } else {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    // Check Perfect Dodge window: Enemy finishing windup or in Counter Stance near player, projectile closing in, or trap about to trigger
    let perfectDodge = false;
    for (const e of this.enemies) {
      if (
        ((e.state === 'windup' && e.stateTimer <= 0.25) || (e.counterStanceTimer ?? 0) > 0) &&
        Math.hypot(e.x - this.player.x, e.y - this.player.y) <= 95
      ) {
        perfectDodge = true;
        break;
      }
    }
    if (!perfectDodge) {
      for (const pr of this.projectiles) {
        if (!pr.fromPlayer && Math.hypot(pr.x - this.player.x, pr.y - this.player.y) <= 42) {
          perfectDodge = true;
          break;
        }
      }
    }
    if (!perfectDodge) {
      for (const trap of this.traps) {
        const warnStart = trap.cycleTime - trap.warnDuration - trap.activeDuration;
        const activeStart = trap.cycleTime - trap.activeDuration;
        if (
          trap.timer >= warnStart &&
          trap.timer < activeStart + 0.15 &&
          Math.hypot(trap.x - this.player.x, trap.y - this.player.y) <= trap.radius + 24
        ) {
          perfectDodge = true;
          break;
        }
      }
    }

    if (perfectDodge) {
      this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 1);
      this.player.perfectDodgeEmpowered = true;
      this.stats.perfectDodges += 1;
      for (const e of this.enemies) {
        if ((e.isBoss || e.isMiniBoss) && Math.hypot(e.x - this.player.x, e.y - this.player.y) <= 135) {
          this.addBossStagger(e, 28);
        }
      }
      this.addElixirFeatherCharge(1, '⚡ Perfect Dodge');
      audio.levelUp();
      this.triggerHaptic(22);
      this.spawnFloatingText(this.player.x, this.player.y - 18, '⚡ PERFECT DODGE!', '#38bdf8', 1.18);
      this.spawnParticles(this.player.x, this.player.y, '#38bdf8', 16, 85);
      this.spawnParticles(this.player.x, this.player.y, '#fde047', 10, 75);
      this.pushToast('⚡ Perfect Dodge! +1 Stamina, +Boss Stagger & 2.5x Arcane Crit!', 'cyan');
    } else {
      this.player.stamina -= 1;
      this.player.staminaRegenTimer = 1.05;
      audio.dodgeRoll();
    }

    this.player.dodgeDirX = dx;
    this.player.dodgeDirY = dy;
    this.player.dodgeTimer = 0.24;
    this.player.dodgeCooldown = 0.3;
    this.player.invulnTimer = Math.max(this.player.invulnTimer, perfectDodge ? 0.42 : 0.3);
    if (this.player.activeHeroId === 'great_duck') {
      this.goldenEggs.push({
        x: this.player.x,
        y: this.player.y - 6,
        targetY: this.player.y + 4,
        vy: 140,
        damage: Math.round(this.getTotalStats().atk * 1.65),
      });
    }
    this.spawnParticles(this.player.x, this.player.y + 3, '#c084fc', 5, 45);
    this.spawnParticles(this.player.x, this.player.y + 3, '#bae6fd', 5, 45);
  }

  private triggerInteract() {
    for (const npc of this.currentWorld.npcs) {
      if (npc.id === 'king_leo_throne' && !this.story.fenrirDefeated) continue;
      const dist = Math.hypot(npc.x - this.player.x, npc.y - this.player.y);
      if (dist <= 36) {
        if (npc.id === 'advisor_whiskers') {
          this.story.spokeToAdvisor = true;
          const lines =
            this.currentAct === 81
              ? WAR_COUNCIL_ACT81_ADVISOR_LINES
              : this.currentAct >= 42
              ? WAR_ADVISOR_LINES
              : this.player.hasDuckElixir
              ? ADVISOR_ELIXIR_LINES
              : ADVISOR_QUEST_LINES;
          this.startDialogue(lines, () => {
            this.mode = 'PLAYING';
            this.emitHud();
          });
        } else if (npc.id === 'blacksmith_forgepaw') {
          audio.talkBlip(520);
          this.mode = 'BLACKSMITH';
          this.emitHud();
        } else if (npc.id === 'the_great_duck') {
          if (!this.story.spokeToGreatDuck) {
            this.startDialogue(GREAT_DUCK_FIRST_LINES, () => {
              this.story.spokeToGreatDuck = true;
              this.player.hasDuckElixir = true;
              this.player.baseMaxHp += 20;
              this.player.baseAtk += 5;
              this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 41);
              this.clearedActs.add(40);
              this.recalculateStats(true);
              audio.elixirAwaken();
              this.saveProgress();
              this.pushToast('Obtained Great Duck’s Blessing [Q] & Act 41 Warp!', 'gold');
              this.spawnParticles(this.player.x, this.player.y, '#fde047', 28, 90);
              this.mode = 'PLAYING';
              this.emitHud();
            });
          } else {
            this.startDialogue(GREAT_DUCK_REPEAT_LINES, () => {
              this.mode = 'PLAYING';
              this.emitHud();
            });
          }
        } else if (npc.id === 'king_leo_war_council' || npc.id === 'great_duck_war_council') {
          // ACT 81: THE GREAT DUCK'S SUPREME WAR COUNCIL & STAR-FORGE ANOINTMENT!
          this.startDialogue(WAR_COUNCIL_ACT81_LINES, () => {
            this.story.spokeToGreatDuck = true;
            this.player.hasDuckElixir = true;
            // Unlock & equip Tier 20 Primordial Starlight-Quack Excalibur & Primordial Crown-General Mantle
            const tier20Ids = ['primordial_starlight_excalibur', 'primordial_crown_mantle'];
            for (const gId of tier20Ids) {
              const existing = this.player.inventory.find((i) => i.id === gId);
              if (!existing) {
                this.player.inventory.push(createGearInstance(gId, 2));
              } else {
                existing.upgradeLevel = Math.max(existing.upgradeLevel, 2);
              }
            }
            if (this.getEquippedWeapon().tier <= 20) {
              this.player.equippedWeaponId = 'primordial_starlight_excalibur';
            }
            if (this.getEquippedArmor().tier <= 20) {
              this.player.equippedArmorId = 'primordial_crown_mantle';
            }
            this.player.baseMaxHp += 40;
            this.player.baseAtk += 15;
            this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 82);
            this.clearedActs.add(81);
            this.recalculateStats(true);
            audio.elixirAwaken();
            this.saveProgress();
            this.pushToast(
              '👑🦆 Forged Tier 20 Primordial Starlight-Quack Excalibur & Crown-General Mantle! Act 82 Obsidian Colosseum Portal Unlocked!',
              'gold'
            );
            this.spawnParticles(this.player.x, this.player.y, '#fde047', 36, 110);
            this.spawnParticles(this.player.x, this.player.y, '#38bdf8', 24, 95);
            this.mode = 'PLAYING';
            this.emitHud();
          });
        } else if (npc.id === 'king_leo_war_camp') {
          this.startDialogue(KING_LEO_WAR_CAMP_LINES, () => {
            this.player.hp = this.player.maxHp;
            if (this.player.healthPotions < 4) this.player.healthPotions = 4;
            this.pushToast("King Leo's Royal Blessing restored full HP & Potions!", 'gold');
            this.mode = 'PLAYING';
            this.emitHud();
          });
        } else if (npc.id === 'king_leo_throne') {
          this.mode = 'EPILOGUE_CUTSCENE';
          this.startDialogue(VICTORY_CUTSCENE_LINES, () => {
            if (this.pendingWarCampaignFromChoice) {
              this.startWarOfTwoKingdoms();
            } else {
              this.mode = 'VICTORY';
              this.emitHud();
            }
          });
        } else if (npc.id === 'king_leo_united' || npc.id === 'fenrir_united' || npc.id === 'great_duck_united') {
          // ACT 121: UNITED SANCTUM OF CAT, DOG & THE GREAT DUCK — Forges Tier 30 Eternal Omni Gear & 20s Dragon-God Elixir!
          this.startDialogue(ACT121_UNITED_SANCTUM_LINES, () => {
            this.story.spokeToGreatDuck = true;
            this.player.hasDuckElixir = true;
            const tier30Ids = ['eternal_omni_blade', 'eternal_omni_mantle'];
            for (const gId of tier30Ids) {
              const existing = this.player.inventory.find((i) => i.id === gId);
              if (!existing) {
                this.player.inventory.push(createGearInstance(gId, 2));
              } else {
                existing.upgradeLevel = Math.max(existing.upgradeLevel, 2);
              }
            }
            this.player.equippedWeaponId = 'eternal_omni_blade';
            this.player.equippedArmorId = 'eternal_omni_mantle';
            this.player.baseMaxHp += 80;
            this.player.baseAtk += 25;
            this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 122);
            this.clearedActs.add(121);
            this.recalculateStats(true);
            audio.elixirAwaken();
            this.saveProgress();
            this.vfx.spawnShockwave(this.player.x, this.player.y, 72, '#fde047', 0.5);
            this.spawnParticles(this.player.x, this.player.y, '#fde047', 36, 120);
            this.spawnParticles(this.player.x, this.player.y, '#ef4444', 24, 100);
            this.pushToast(
              '🐉⚔️ Forged Tier 30 Eternal Omni-Blade & Omni-Crown Mantle + 20s Dragon-God Elixir! Act 122 Sky-Warp Unlocked!',
              'gold'
            );
            this.mode = 'PLAYING';
            this.emitHud();
          });
        } else if (npc.id === 'king_leo_colosseum' || npc.id === 'great_duck_colosseum') {
          if (this.clearedActs.has(82)) {
            this.mode = 'EPILOGUE_CUTSCENE';
            this.startDialogue(ACT82_TO_83_CATACLYSM_LINES, () => {
              this.startDragonCataclysmCampaign();
            });
          } else {
            this.pushToast('👑 King Leo & The Great Duck are fighting beside you! Break Ragnarok’s Stagger Gauge!', 'gold');
          }
        } else if (npc.id === 'king_leo_sky' || npc.id === 'fenrir_sky' || npc.id === 'great_duck_sky') {
          if (this.clearedActs.has(122)) {
            this.mode = 'EPILOGUE_CUTSCENE';
            this.startDialogue(ACT122_GOLDEN_AGE_EPILOGUE_LINES, () => {
              this.mode = 'VICTORY';
              this.emitHud();
            });
          } else {
            this.pushToast(
              '👑🐺🦆 King Leo, Wolf-King Fenrir & The Great Duck fight beside you! Capture Harpoon Ballistas & shatter Bahamut!',
              'gold'
            );
          }
        } else if (npc.id.startsWith('king_leo_sanctuary_') || npc.id.startsWith('fenrir_sanctuary_') || npc.id.startsWith('great_duck_sanctuary_')) {
          this.story.spokeToGreatDuck = true;
          this.player.hasDuckElixir = true;
          this.player.hp = this.player.maxHp;
          this.player.healthPotions = Math.max(6, this.player.healthPotions);
          this.clearedActs.add(this.currentAct);
          this.maxUnlockedAct = Math.max(this.maxUnlockedAct, Math.min(300, this.currentAct + 1));
          this.claimTier30EternalOmni(true, 5);
          audio.elixirAwaken();
          this.vfx.spawnShockwave(this.player.x, this.player.y, 68, '#fde047', 0.45);
          this.pushToast(
            `🌟 Omniverse Sanctuary Blessing! Full HP, +Potions & Boss Portal to Act ${this.currentAct + 1} Unlocked!`,
            'gold'
          );
          this.saveProgress();
          this.emitHud();
        }
        return;
      }
    }

    const readyBallista = this.dragonController.getNearestReadyBallista(this.player.x, this.player.y);
    if (readyBallista) {
      if (this.dragonController.fireBallista(readyBallista, this.enemies, this.player, this.getDragonCallbacks())) {
        this.emitHud();
        return;
      }
    }

    for (const cage of this.prisonCages) {
      if (cage.broken) continue;
      if (Math.hypot(cage.x - this.player.x, cage.y - this.player.y) <= 30) {
        this.damagePrisonCage(cage, cage.hp + 999);
        return;
      }
    }

    for (const chest of this.currentWorld.chests) {
      if (chest.opened) continue;
      if (Math.hypot(chest.x - this.player.x, chest.y - this.player.y) <= 28) {
        if (chest.requiresActClear && this.enemies.length > 0 && !this.clearedActs.has(this.currentAct)) {
          this.pushToast('Defeat all foes in this Act to unlock the vault!', 'amber');
          return;
        }
        this.openChest(chest);
        return;
      }
    }

    for (const portal of this.currentWorld.portals) {
      const px = portal.x + portal.width / 2;
      const py = portal.y + portal.height / 2;
      if (Math.hypot(px - this.player.x, py - this.player.y) <= Math.max(portal.width, portal.height) * 0.8 + 14) {
        this.tryEnterPortal(portal);
        return;
      }
    }
  }

  private damagePrisonCage(cage: PrisonCage, dmg: number) {
    if (cage.broken) return;
    cage.hp -= dmg;
    audio.hitImpact(true);
    this.spawnParticles(cage.x, cage.y, '#94a3b8', 10, 65);
    if (cage.hp <= 0) {
      cage.broken = true;
      audio.bannerCaptured();
      const rescued = spawnAlliedSoldier(`rescued_${cage.id}`, cage.unitKind, cage.x, cage.y, this.currentAct);
      rescued.rallyTimer = 6.0;
      this.alliedSoldiers.push(rescued);
      this.warMorale = Math.min(100, this.warMorale + 14);
      this.spawnParticles(cage.x, cage.y, '#fde047', 22, 95);
      this.spawnFloatingText(cage.x, cage.y - 16, '🐾 FOR KING LEO! (+1 ALLY)', '#fde047', 1.15);
      this.pushToast(`🔓 Rescued ${rescued.name}! Joined your Cat Kingdom Squad!`, 'emerald');
      this.emitHud();
    }
  }

  private damageSiegeEngine(siege: SiegeEngine, dmg: number) {
    if (siege.destroyed) return;
    siege.hp -= dmg;
    audio.hitImpact(true);
    this.spawnParticles(siege.x, siege.y, '#f97316', 10, 70);
    this.spawnFloatingText(siege.x, siege.y - 14, `-${Math.round(dmg)} SIEGE`, '#fb923c', 1.0);
    if (siege.hp <= 0) {
      siege.destroyed = true;
      audio.staggerBreak();
      this.shake(0.3, 4.5);
      this.warMorale = Math.min(100, this.warMorale + 15);
      this.player.gold += 35;
      this.stats.goldCollected += 35;
      this.spawnParticles(siege.x, siege.y, '#ef4444', 28, 110);
      this.spawnParticles(siege.x, siege.y, '#fde047', 18, 90);
      this.spawnFloatingText(siege.x, siege.y - 18, '💥 CATAPULT DESTROYED!', '#fde047', 1.2);
      this.pushToast('💥 Dog Kingdom Siege Catapult Destroyed! (+35G & +15% Morale)', 'gold');
      this.emitHud();
    }
  }

  private openChest(chest: Chest) {
    chest.opened = true;
    this.openedChestIds.add(chest.id);
    audio.chestFanfare();
    this.player.gold += chest.gold;
    this.stats.goldCollected += chest.gold;
    this.player.fishTreats += 1;
    this.stats.fishTreatsCollected += 1;
    this.player.healthPotions += chest.potions;
    this.player.happyJumpTimer = 0.45;
    this.spawnParticles(chest.x, chest.y, '#fbbf24', 20, 70);

    if (chest.gearId) {
      this.grantGear(chest.gearId, true);
    }
    this.pushToast(`Opened ${chest.label}: +${chest.gold}G, +1 Fish Treat`, 'gold');
    this.saveProgress();
    this.emitHud();
  }

  private grantGear(gearId: string, autoEquipIfBetter: boolean) {
    const existing = this.player.inventory.find((i) => i.id === gearId);
    if (existing) {
      this.player.materials += 2;
      this.pushToast(`Duplicate ${existing.name} -> +2 Shards`, 'cyan');
      return;
    }
    const item = createGearInstance(gearId);
    this.player.inventory.push(item);
    if (autoEquipIfBetter) {
      const cur = item.slot === 'weapon' ? this.getEquippedWeapon() : this.getEquippedArmor();
      if (item.tier > cur.tier) {
        if (item.slot === 'weapon') this.player.equippedWeaponId = item.id;
        else this.player.equippedArmorId = item.id;
        this.recalculateStats(false);
        this.pushToast(`Equipped ${item.name}!`, 'emerald');
        return;
      }
    }
    this.pushToast(`Found ${item.name}!`, 'cyan');
  }

  private getExcludedCompanionHeroIds(world: GeneratedActWorld): PlayableHeroId[] {
    const excluded = new Set<PlayableHeroId>();
    for (let i = 0; i < world.npcs.length; i++) {
      const npc = world.npcs[i];
      if (npc.spriteId === 'king_leo' || npc.id === 'king_leo_throne') {
        excluded.add('king_leo');
      }
      if (npc.spriteId === 'fenrir') {
        excluded.add('fenrir');
      }
      if (npc.spriteId === 'great_duck') {
        excluded.add('great_duck');
      }
    }
    if (this.currentAct <= 82) {
      // Fenrir is an antagonist/Boss in Arcs 1–2 and must never duplicate onto the Hero squad!
      excluded.add('fenrir');
    }
    if (this.currentAct === 41 && !this.story.fenrirDefeated) {
      // King Leo is caged in the Throne Room — never let King Leo rescue himself!
      excluded.add('king_leo');
    }
    return Array.from(excluded);
  }

  private isPortalLockedReason(portal: Portal): string | null {
    if (portal.direction === 'next' && !this.clearedActs.has(this.currentAct)) {
      const hasBoss = this.enemies.some((e) => e.isBoss);
      const normalEnemiesAlive = this.enemies.filter((e) => !e.isBoss).length;
      const uncapturedBanners = this.warBanners.filter((b) => !b.captured).length;
      const check = canUnlockExitPortal({
        normalEnemiesAlive,
        hasBoss,
        bossDefeated: !hasBoss,
        uncapturedBanners,
        isSanctuaryAct:
          this.currentAct === 40 ||
          this.currentAct === 81 ||
          this.currentAct === 121 ||
          this.currentAct % 100 === 99,
      });
      if (!check.unlocked && check.lockReason) {
        return check.lockReason;
      }
    }
    if (portal.direction === 'sanctuary_warp' && !this.story.spokeToGreatDuck) {
      return 'Speak with The Great Duck [E] to receive the Astral Potion first!';
    }
    if (
      this.currentAct === 121 &&
      portal.direction === 'sanctuary_warp' &&
      !this.player.inventory.some((i) => i.id === 'eternal_omni_blade')
    ) {
      return 'Speak with King Leo, Fenrir & Great Duck [E] for Tier 30 Eternal Omni Gear first!';
    }
    if (
      portal.direction === 'prev' &&
      this.currentAct === 41 &&
      this.enemies.length > 0 &&
      this.story.fenrirIntroSeen &&
      !this.story.fenrirDefeated
    ) {
      return 'Fenrir has sealed the Throne Doors! Drink [Q] and defeat him!';
    }
    return null;
  }

  private tryEnterPortal(portal: Portal) {
    if (this.portalCooldown > 0) return;
    const lockReason = this.isPortalLockedReason(portal);
    if (lockReason) {
      if (this.lockToastCooldown <= 0) {
        this.pushToast(lockReason, 'amber');
        this.lockToastCooldown = 1.6;
        audio.shieldImmune();
      }
      return;
    }
    if (portal.direction === 'boss_rush') {
      this.startBossRush(true);
      return;
    }
    audio.dodgeRoll();
    const spawnSide = portal.direction === 'prev' ? 'east' : 'west';
    this.loadAct(portal.targetAct, spawnSide);
    this.emitHud();
  }

  private addBossStagger(enemy: Enemy, amount: number) {
    if (enemy.shielded || (enemy.stunTimer ?? 0) > 0) return;
    const maxStag = enemy.maxStagger ?? 100;
    enemy.stagger = Math.min(maxStag, (enemy.stagger ?? 0) + amount);
    if (enemy.stagger >= maxStag) {
      enemy.stagger = 0;
      enemy.stunTimer = 3.5;
      enemy.state = 'recover';
      audio.staggerBreak();
      this.shake(0.38, 4.8);
      this.hitStopTimer = 0.032;
      this.vfx.spawnShockwave(enemy.x, enemy.y, 56, '#fde047', 0.36);
      this.spawnParticles(enemy.x, enemy.y, '#fde047', 32, 105);

      const isBahamut =
        enemy.kind === 'bahamut_p1' || enemy.kind === 'bahamut_p2' || enemy.kind === 'bahamut_p3';
      const isFinalBoss = enemy.kind === 'fenrir_p1' || enemy.kind === 'fenrir_p2' || isBahamut;
      if (isFinalBoss) {
        if (this.currentAct === 122 || isBahamut) {
          const finisherDmg = 50000;
          enemy.hp = Math.max(1, enemy.hp - finisherDmg);
          this.stats.damageDealt += finisherDmg;
          this.vfx.spawnShockwave(enemy.x, enemy.y, 78, '#ef4444', 0.45);
          this.spawnParticles(enemy.x, enemy.y, '#fde047', 42, 150);
          this.spawnParticles(enemy.x, enemy.y, '#38bdf8', 32, 135);
          this.spawnParticles(enemy.x, enemy.y, '#ef4444', 28, 130);
          this.spawnFloatingText(enemy.x, enemy.y - 28, '⚡ FOUR-HERO UNITED FINISHER: 50,000 DMG!', '#fde047', 1.42);
          this.pushToast(
            '👑🐺🦆🐱 FOUR-HERO UNITED KINGDOM FINISHER! Nyx, Leo, Fenrir & Great Duck dealt 50,000 DMG!',
            'gold'
          );
        } else if (this.currentAct === 82) {
          const finisherDmg = 25000;
          enemy.hp = Math.max(1, enemy.hp - finisherDmg);
          this.stats.damageDealt += finisherDmg;
          this.spawnParticles(enemy.x, enemy.y, '#fde047', 42, 145);
          this.spawnParticles(enemy.x, enemy.y, '#38bdf8', 32, 130);
          this.spawnFloatingText(enemy.x, enemy.y - 28, '⚡ TRIPLE KINGDOM ULTIMATE SLASH: 25,000 DMG!', '#fde047', 1.38);
          this.pushToast(
            '👑🦆🐱 TRIPLE KINGDOM ULTIMATE SLASH! Nyx, King Leo & The Great Duck dealt 25,000 DMG!',
            'gold'
          );
        } else {
          const finisherDmg = 10000;
          enemy.hp = Math.max(1, enemy.hp - finisherDmg);
          this.stats.damageDealt += finisherDmg;
          this.spawnParticles(enemy.x, enemy.y, '#38bdf8', 28, 120);
          this.spawnFloatingText(enemy.x, enemy.y - 26, '💫 10,000 DMG ASTRAL FINISHER!', '#fde047', 1.32);
          this.pushToast(
            `💫 STUNNED FINISHER! 10,000 DMG Astral Lionheart Cleave on ${enemy.name} + 3.5s 2.0x Crit Window!`,
            'gold'
          );
        }
      } else {
        this.spawnFloatingText(enemy.x, enemy.y - 20, '💫 STUNNED! (2.0x DMG)', '#fde047', 1.22);
        if (enemy.isBoss || enemy.isMiniBoss) {
          this.pushToast(`💫 ${enemy.name} Stagger Broken! 2.0x Critical Window (3.5s)!`, 'gold');
        }
      }
    }
  }

  private isFinalBossEnemy(enemy: Enemy): boolean {
    return (
      enemy.kind === 'fenrir_p1' ||
      enemy.kind === 'fenrir_p2' ||
      enemy.kind === 'bahamut_p1' ||
      enemy.kind === 'bahamut_p2' ||
      enemy.kind === 'bahamut_p3' ||
      enemy.kind === 'charybdis_kraken' ||
      enemy.kind === 'chronos_omega' ||
      enemy.kind === 'void_clone_nyx' ||
      enemy.kind === 'aether_null'
    );
  }

  private damageEnemy(
    enemy: Enemy,
    rawDmg: number,
    critChance: number,
    dirX: number,
    dirY: number,
    forceCrit = false,
    staggerBonus = 0,
    isDirectMelee = false,
    bypassPartArmor = false
  ) {
    const isFinalBoss = this.isFinalBossEnemy(enemy);

    // 0. PHASE-GATE INVULNERABILITY LOCK (0 DAMAGE UNTIL 12s TRIAL OR 4 PILLARS DESTROYED!)
    if (enemy.isInvulnerablePhaseGate) {
      audio.shieldImmune();
      this.spawnParticles(enemy.x, enemy.y, '#c084fc', 5, 45);
      this.spawnFloatingText(enemy.x, enemy.y - 20, '🛡️ PHASE-GATE IMMUNE! BREAK PILLARS!', '#e879f9', 1.05);
      return;
    }

    // 1. DOG / DRAGON COUNTER-ATTACK MECHANIC (Parry Stance vs. Backstab Break!)
    if ((enemy.counterStanceTimer ?? 0) > 0 && isDirectMelee) {
      const isBehind =
        (enemy.facing === 'left' && this.player.x > enemy.x + 2) ||
        (enemy.facing === 'right' && this.player.x < enemy.x - 2) ||
        (enemy.facing === 'up' && this.player.y > enemy.y + 2) ||
        (enemy.facing === 'down' && this.player.y < enemy.y - 2) ||
        forceCrit;

      if (isBehind) {
        enemy.counterStanceTimer = 0;
        enemy.consecutiveHits = 0;
        forceCrit = true;
        rawDmg *= 2.5;
        staggerBonus = 60;
        this.hitStopTimer = 0.032;
        audio.staggerBreak();
        this.vfx.spawnShockwave(enemy.x, enemy.y, 40, '#38bdf8', 0.32);
        this.spawnParticles(enemy.x, enemy.y, '#38bdf8', 22, 105);
        this.spawnFloatingText(enemy.x, enemy.y - 22, '💥 2.5x BACKSTAB BREAK!', '#38bdf8', 1.25);
        this.pushToast(`💥 Backstab Counter-Break on ${enemy.name}! 2.5x Crit + Heavy Stagger!`, 'cyan');
        this.addElixirFeatherCharge(1, '💥 Backstab Counter');
      } else {
        enemy.counterStanceTimer = 0;
        enemy.consecutiveHits = 0;
        audio.counterParry();
        this.shake(0.34, 5.2);
        this.vfx.spawnShockwave(enemy.x, enemy.y, 34, '#f43f5e', 0.28);
        this.spawnParticles(enemy.x, enemy.y, '#f43f5e', 18, 95);
        this.spawnParticles(this.player.x, this.player.y, '#fda4af', 14, 85);
        this.spawnFloatingText(enemy.x, enemy.y - 18, '⚡ COUNTER-SLASH!', '#f43f5e', 1.22);

        if (isFinalBoss) {
          this.player.stunTimer = 1.0;
          const trueDmg = Math.max(12, Math.round(this.player.maxHp * 0.35));
          this.damagePlayer(trueDmg, enemy.x, enemy.y, {
            trueDamage: true,
            applyMortalWound: true,
            ignoreInvuln: true,
          });
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + 10000);
          this.spawnFloatingText(enemy.x, enemy.y - 30, '🩸 +10,000 HP LIFESTEAL!', '#f43f5e', 1.28);
          this.spawnFloatingText(this.player.x, this.player.y - 24, '💫 PARRIED! STUNNED 1.0s (-35% HP)', '#fda4af', 1.18);
          this.pushToast('🩸 COUNTER LIFESTEAL! Parried for 1.0s, 35% Max HP True DMG & Boss healed +10,000 HP!', 'amber');
        } else {
          this.player.stunTimer = 0.5;
          this.damagePlayer(Math.round(enemy.atk * 1.15), enemy.x, enemy.y);
          this.spawnFloatingText(this.player.x, this.player.y - 22, '💫 PARRIED! STUNNED 0.5s', '#fda4af', 1.15);
          if (this.enemies.length <= 16) {
            this.triggerDogKingdomCounterAttack(enemy.x, enemy.y);
          } else {
            this.pushToast('🛡️ Parried by Counter Stance! Roll [SHIFT] behind them for a 2.5x Backstab!', 'amber');
          }
        }
        return;
      }
    }

    // 2. DARK STARLIGHT / DRAGON-SCALE BARRIER (100% Armor Penetration while Great Duck's Elixir is active!)
    if (enemy.shielded) {
      if (this.player.duckElixirActive || bypassPartArmor) {
        enemy.shielded = false;
        this.story.fenrirShieldBroken = true;
        audio.staggerBreak();
        this.vfx.spawnShockwave(enemy.x, enemy.y, 52, '#fde047', 0.35);
        this.spawnParticles(enemy.x, enemy.y, '#fde047', 32, 115);
        this.spawnFloatingText(enemy.x, enemy.y - 20, '💥 100% ARMOR PIERCE!', '#fde047', 1.22);
      } else {
        const reduced = Math.max(1, Math.round(rawDmg * 0.1));
        enemy.hp = Math.max(1, enemy.hp - reduced);
        audio.shieldImmune();
        this.spawnFloatingText(enemy.x, enemy.y - 16, `-${reduced} (90% WARD! PRESS [Q])`, '#c084fc', 1.0);
        this.spawnParticles(enemy.x, enemy.y, '#a855f7', 6, 45);
        return;
      }
    }

    // 2C. KRAKEN TENTACLE GLOWING CUT-POINT WEAK SPOT (2.5x SLICE CRIT & IMMUNE TO BOSS CAP!)
    let isTentacleCutPointCrit = false;
    if (enemy.kind === 'kraken_tentacle') {
      const cutPointY = enemy.y + 3;
      if (Math.abs(this.player.y - cutPointY) <= 24 || isDirectMelee || forceCrit) {
        isTentacleCutPointCrit = true;
        forceCrit = true;
      }
    }

    const isStunned = (enemy.stunTimer ?? 0) > 0;
    const hasCaptainBuff =
      !enemy.isWolfCaptain &&
      this.enemies.some((c) => c.isWolfCaptain && Math.hypot(c.x - enemy.x, c.y - enemy.y) <= 130);
    const captainDefMult = hasCaptainBuff ? 0.82 : 1.0;
    const activeSiphons = this.siphonObelisks.filter((s) => s.bossId === enemy.id && s.hp > 0);
    const siphonDefMult = activeSiphons.length > 0 ? 0.25 : 1.0;
    const isCrit = isStunned || forceCrit || Math.random() * 100 < critChance;
    const stunMult = isStunned ? 2.0 : isCrit ? 1.65 : 1.0;
    const bossSlayerMult = isFinalBoss
      ? this.player.duckElixirActive
        ? 4.2
        : 3.2
      : enemy.kind === 'dragon_boss'
      ? this.player.duckElixirActive
        ? 3.4
        : 2.6
      : 1.0;

    // 2B. BESPOKE DRAGON BOSS 4-PART ANATOMY HITBOXES (Wings / Tail / Molten Core / Exposed Head)
    let partMult = isTentacleCutPointCrit ? 2.5 : 1.0;
    let partTag = isTentacleCutPointCrit ? ' 💥 2.5x SLICE CRIT!' : '';
    if (isDragonBossEnemy(enemy) && !bypassPartArmor) {
      const ds = ensureDragonState(enemy);
      if (ds.altitude === 'sky' && isDirectMelee) return;
      const part = resolveDragonHitPart(enemy, this.player.x, this.player.y);
      ds.lastHitPart = part;

      if (part === 'head') {
        partMult = 3.0;
        forceCrit = true;
        partTag = ' 🎯 HEAD 3.0x!';
      } else if (part === 'core' && !ds.coreCracked) {
        if (this.player.duckElixirActive) {
          ds.coreCracked = true;
          audio.partBreak();
          this.vfx.spawnShockwave(enemy.x, enemy.y, 48, '#fde047', 0.32);
          this.spawnFloatingText(enemy.x, enemy.y - 24, '💥 CORE SCALES CRACKED!', '#fde047', 1.2);
          if (this.dragonController.hoardPiles.length > 0) {
            this.dragonController.breakHoardPile(
              this.dragonController.hoardPiles[0],
              this.player,
              this.featherPickups,
              this.getDragonCallbacks()
            );
          }
        } else {
          partMult = 0.2;
          partTag = ' (🛡️ 80% CORE SCALES)';
        }
      } else if (part === 'wings') {
        partTag = ' [WINGS]';
      } else if (part === 'tail') {
        partTag = ' [TAIL]';
      }
    }

    const prevHpPct = enemy.hp / Math.max(1, enemy.maxHp);
    let dmg = Math.max(
      1,
      Math.round(
        rawDmg *
          (bypassPartArmor ? 1.0 : bossSlayerMult) *
          captainDefMult *
          siphonDefMult *
          stunMult *
          partMult *
          (0.94 + Math.random() * 0.12)
      )
    );

    // Kraken Tentacles are immune to the 1.2% Boss-body cap and guaranteed to die in 2–4 fast slashes!
    if (enemy.kind === 'kraken_tentacle') {
      const minSlashFloor = Math.max(
        1,
        Math.round(enemy.maxHp * (isTentacleCutPointCrit ? 0.36 : 0.28))
      );
      dmg = Math.max(dmg, minSlashFloor);
      if (isTentacleCutPointCrit) {
        this.vfx.spawnShockwave(enemy.x, enemy.y + 3, 28, '#38bdf8', 0.22);
        this.spawnParticles(enemy.x, enemy.y + 3, '#fde047', 10, 85);
      }
    }

    // ANTI-MELT DAMAGE CAP ON FINAL BOSSES (1.2% Max HP per normal hit!)
    let cappedLabel = '';
    if (isFinalBoss && enemy.kind !== 'kraken_tentacle') {
      const cap = bypassPartArmor
        ? Math.max(1, Math.round(enemy.maxHp * 0.055))
        : Math.max(1, Math.round(enemy.maxHp * 0.012));
      if (dmg > cap) {
        dmg = cap;
        cappedLabel = ' [CAP]';
      }
    }

    // MANDATORY PHASE-GATE INVULNERABILITY CHECKS AT 75%, 50%, 25% HP!
    let triggeredGatePct: number | null = null;
    if (isFinalBoss && enemy.hp > 0) {
      if (!enemy.phaseGatesTriggered) enemy.phaseGatesTriggered = [];
      for (const gatePct of [75, 50, 25]) {
        if (!enemy.phaseGatesTriggered.includes(gatePct)) {
          const thresholdHp = Math.ceil(enemy.maxHp * (gatePct / 100));
          if (enemy.hp > thresholdHp && enemy.hp - dmg <= thresholdHp) {
            dmg = Math.max(1, enemy.hp - thresholdHp);
            triggeredGatePct = gatePct;
            break;
          }
        }
      }
    }

    enemy.hp -= dmg;
    enemy.hitFlash = 0.14;
    this.stats.damageDealt += dmg;
    const nextHpPct = enemy.hp / Math.max(1, enemy.maxHp);

    // Apply Wing & Tail Break Thresholds (15,000 DMG each!)
    if (isDragonBossEnemy(enemy) && !bypassPartArmor && enemy.hp > 0) {
      const ds = ensureDragonState(enemy);
      if (ds.lastHitPart === 'wings' && !ds.wingsBroken) {
        ds.wingsHp = Math.max(0, ds.wingsHp - dmg);
        if (ds.wingsHp <= 0) {
          ds.wingsBroken = true;
          audio.partBreak();
          this.shake(0.35, 4.5);
          this.vfx.spawnShockwave(enemy.x, enemy.y, 64, '#38bdf8', 0.4);
          this.spawnFloatingText(enemy.x, enemy.y - 26, '💥 WING SHATTERED!', '#38bdf8', 1.3);
          this.pushToast('💥 WING SHATTERED! Sky-Flight duration halved & Wind-Gale pushback disabled!', 'cyan');
        }
      } else if (ds.lastHitPart === 'tail' && !ds.tailSevered) {
        ds.tailHp = Math.max(0, ds.tailHp - dmg);
        if (ds.tailHp <= 0) {
          ds.tailSevered = true;
          this.player.gold += 5000;
          this.stats.goldCollected += 5000;
          this.player.materials += 3;
          this.spawnArenaFeatherDrops(2);
          audio.partBreak();
          this.shake(0.38, 4.8);
          this.vfx.spawnShockwave(enemy.x, enemy.y, 64, '#fde047', 0.4);
          this.spawnFloatingText(enemy.x, enemy.y - 26, '💥 TAIL SEVERED! +5,000G & DRAGON GEM!', '#fde047', 1.32);
          this.pushToast('💥 TAIL SEVERED! +5,000 Bonus Gold, +3 Dragon Gems & Tail-Whip disabled!', 'gold');
        }
      }
      if (partTag || activeSiphons.length > 0 || cappedLabel) {
        this.spawnFloatingText(
          enemy.x,
          enemy.y - 24,
          `${dmg.toLocaleString()}${partTag}${activeSiphons.length > 0 ? ' (75% SIPHON!)' : cappedLabel}`,
          partMult >= 3 ? '#fde047' : '#cbd5e1',
          partMult >= 3 ? 1.25 : 0.92
        );
      }
    } else if (activeSiphons.length > 0 && isFinalBoss) {
      this.spawnFloatingText(enemy.x, enemy.y - 24, `${dmg.toLocaleString()} (75% SIPHON WARD!)`, '#e879f9', 0.96);
    }

    if (triggeredGatePct !== null && enemy.hp > 0) {
      this.triggerBossPhaseGate(enemy, triggeredGatePct);
    } else if (!isFinalBoss && enemy.kind === 'dragon_boss' && enemy.hp > 0) {
      const crossedQuarter =
        (prevHpPct > 0.75 && nextHpPct <= 0.75) ||
        (prevHpPct > 0.5 && nextHpPct <= 0.5) ||
        (prevHpPct > 0.25 && nextHpPct <= 0.25);
      if (crossedQuarter && this.enemies.length <= 18) {
        this.triggerDogKingdomCounterAttack(enemy.x, enemy.y);
      }
    }

    if (!isStunned && enemy.hp > 0) {
      const baseStagger = staggerBonus > 0 ? staggerBonus : forceCrit ? 34 : isCrit ? 16 : 9;
      this.addBossStagger(enemy, baseStagger);
    }

    // 3. TRIGGER COUNTER STANCE AFTER 3 CONSECUTIVE HITS!
    const canCounter =
      enemy.isBoss ||
      enemy.isMiniBoss ||
      enemy.isWolfCaptain ||
      enemy.kind === 'hound_scout' ||
      enemy.kind === 'shadow_wolf' ||
      enemy.kind === 'drakonid_lancer' ||
      enemy.kind === 'wyvern_kin' ||
      this.currentAct >= 42;
    if (
      canCounter &&
      isDirectMelee &&
      (!isDragonBossEnemy(enemy) || ensureDragonState(enemy).altitude !== 'sky') &&
      enemy.hp > 0 &&
      (enemy.stunTimer ?? 0) <= 0 &&
      (enemy.counterStanceTimer ?? 0) <= 0 &&
      (enemy.counterCooldown ?? 0) <= 0
    ) {
      enemy.consecutiveHits = (enemy.consecutiveHits ?? 0) + 1;
      if (enemy.consecutiveHits >= 3) {
        enemy.consecutiveHits = 0;
        enemy.counterStanceTimer = 0.85;
        enemy.counterCooldown = enemy.isBoss ? 4.2 : 5.0;
        audio.counterGuard();
        this.spawnParticles(enemy.x, enemy.y, '#fda4af', 12, 70);
        this.spawnFloatingText(enemy.x, enemy.y - 20, '🛡️ COUNTER STANCE!', '#fda4af', 1.16);
      }
    }

    // 50% HP Boss Overdrive / Enrage Transformation!
    if ((enemy.isBoss || enemy.isMiniBoss) && !enemy.overdrive && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.5) {
      enemy.overdrive = true;
      enemy.speed = Math.round(enemy.speed * 1.18);
      enemy.atk = Math.round(enemy.atk * 1.15);
      audio.bossRoar();
      audio.setOverdrive(true);
      this.shake(0.38, 4.5);
      this.vfx.spawnShockwave(enemy.x, enemy.y, 48, '#f97316', 0.36);
      this.spawnParticles(enemy.x, enemy.y, '#f97316', 32, 110);
      this.spawnParticles(enemy.x, enemy.y, '#fde047', 18, 90);
      this.spawnFloatingText(enemy.x, enemy.y - 22, '🔥 OVERDRIVE ENRAGED!', '#fb923c', 1.24);
      this.pushToast(`🔥 ${enemy.name} entered 50% HP OVERDRIVE! (+15% Music Tempo & Speed)`, 'amber');
    }

    const kb = enemy.isBoss ? 28 : enemy.isMiniBoss ? 55 : 120;
    enemy.vx += dirX * kb;
    enemy.vy += dirY * kb;

    audio.hitImpact(isCrit);
    this.spawnParticles(enemy.x, enemy.y, isCrit ? '#fde047' : '#f87171', isCrit ? 12 : 7, 75);
    const dmgLabel = dmg.toLocaleString();
    this.spawnFloatingText(
      enemy.x + (Math.random() - 0.5) * 8,
      enemy.y - 12,
      isTentacleCutPointCrit
        ? `${dmgLabel} 2.5x SLICE CRIT!`
        : isStunned
        ? `${dmgLabel} STAGGER 2.0x!`
        : forceCrit
        ? `${dmgLabel} ARCANE CRIT!`
        : isCrit
        ? `${dmgLabel} CRIT!`
        : `${dmgLabel}`,
      isTentacleCutPointCrit
        ? '#38bdf8'
        : isStunned
        ? '#fde047'
        : forceCrit
        ? '#38bdf8'
        : isCrit
        ? '#fde047'
        : '#ffffff',
      isTentacleCutPointCrit ? 1.24 : isStunned ? 1.25 : forceCrit ? 1.2 : isCrit ? 1.12 : 1.0
    );

    if (isCrit || (isDirectMelee && this.player.comboStep === 2)) {
      this.hitStopTimer = 0.032; // 2-frame (32ms) impact hit-stop at 60FPS!
      this.vfx.spawnBurst(enemy.x, enemy.y, isCrit ? '#fde047' : '#38bdf8', 8, 125);
      if (forceCrit || this.player.comboStep === 2) {
        this.vfx.spawnShockwave(enemy.x, enemy.y, forceCrit ? 28 : 20, forceCrit ? '#38bdf8' : '#fde047', 0.24);
      }
      // No screen shake on normal sword slashes or normal tentacle/enemy hits!
      this.triggerHaptic(16);
    }

    if (enemy.hp <= 0) {
      this.handleEnemyDefeated(enemy);
    }
  }

  private handleEnemyDefeated(enemy: Enemy) {
    this.warMorale = Math.min(
      100,
      this.warMorale + (enemy.isBoss ? 25 : enemy.isMiniBoss || enemy.isWolfCaptain ? 14 : 5)
    );
    if (enemy.isWolfCaptain) {
      this.pushToast(
        this.currentAct >= 83
          ? '🚩 Dragon-Scale Captain Slain! Dragon Legion Aura Shattered!'
          : '🚩 Wolf Banner Captain Slain! Dog Legion Aura Shattered!',
        'gold'
      );
    }

    // Clean up any Phase-Lock Pillars & Siphon Obelisks bound to this boss phase
    this.phaseLockPillars = this.phaseLockPillars.filter((pl) => pl.bossId !== enemy.id);
    this.siphonObelisks = this.siphonObelisks.filter((ob) => ob.bossId !== enemy.id);

    if (enemy.kind === 'fenrir_p1') {
      enemy.hp = 0;
      this.projectiles = [];
      this.hazards = [];
      this.story.fenrirPhase2Triggered = true;
      this.shake(0.6, 6);
      audio.bossRoar();
      const isAct82 = this.currentAct === 82;
      audio.setTrack(isAct82 ? 'track_18_ragnarok' : 'track_14_fenrir_p2', false);
      this.vfx.spawnShockwave(enemy.x, enemy.y, 70, '#c084fc', 0.45);
      this.spawnParticles(enemy.x, enemy.y, '#c084fc', 48, 140);

      this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
      const p2Lines = isAct82 ? ACT82_DUAL_SOVEREIGN_PHASE2_LINES : FENRIR_PHASE2_LINES;
      this.startDialogue(p2Lines, () => {
        const beast = spawnEnemy(
          isAct82 ? 'boss_vargos_p2' : 'boss_fenrir_p2',
          'fenrir_p2',
          304,
          128,
          isAct82 ? 82 : 41,
          this.nightmareMode,
          isAct82 ? 'Dual-Sovereign Fenrir & Shadow-Shogun Lupus (Phase 2/3)' : undefined
        );
        beast.bossPhase = 2;
        beast.phaseGatesTriggered = [];
        beast.siphonSpawnCooldown = 18.0;
        beast.bossVisualId = isAct82 ? 'boss_dual_sovereign_p2' : 'boss_fenrir_p2';
        if (isAct82) {
          beast.width = 56;
          beast.height = 56;
        }
        this.enemies.push(beast);
        this.bossSplashTimer = 1.75;
        this.bossSplashName = beast.name;
        this.shake(0.45, 5);
        this.mode = 'PLAYING';
        this.emitHud();
      });
      return;
    }

    // In Act 82 (Obsidian Colosseum Finale), Phase 2 awakens Phase 3: RAGNAROK, THE PRIMORDIAL WORLD-HOUND!
    if (enemy.kind === 'fenrir_p2' && this.currentAct === 82 && (enemy.bossPhase ?? 2) < 3) {
      enemy.hp = 0;
      this.projectiles = [];
      this.hazards = [];
      this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
      audio.bossRoar();
      audio.setTrack('track_18_ragnarok', true);
      this.shake(0.65, 6.5);
      this.vfx.spawnShockwave(enemy.x, enemy.y, 82, '#ef4444', 0.5);
      this.spawnParticles(enemy.x, enemy.y, '#ef4444', 52, 150);
      this.spawnParticles(enemy.x, enemy.y, '#fde047', 32, 130);

      this.startDialogue(ACT82_RAGNAROK_PHASE3_LINES, () => {
        const ragnarok = spawnEnemy(
          'boss_ragnarok_p3',
          'fenrir_p2',
          304,
          128,
          82,
          this.nightmareMode,
          'Ragnarok, The Primordial World-Hound (Phase 3/3)'
        );
        ragnarok.bossPhase = 3;
        ragnarok.phaseGatesTriggered = [];
        ragnarok.siphonSpawnCooldown = 18.0;
        ragnarok.bossVisualId = 'boss_ragnarok';
        ragnarok.width = 64;
        ragnarok.height = 64;
        ragnarok.overdrive = true;
        ragnarok.speed = Math.round(ragnarok.speed * 1.16);
        this.enemies.push(ragnarok);

        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.5));
        for (const ally of this.alliedSoldiers) {
          ally.hp = ally.maxHp;
          ally.rallyTimer = 10.0;
        }
        this.bossSplashTimer = 1.95;
        this.bossSplashName = 'RAGNAROK, THE PRIMORDIAL WORLD-HOUND (PHASE 3/3)';
        this.mode = 'PLAYING';
        this.pushToast('🔥 PHASE 3 AWAKENED: Ragnarok, The Primordial World-Hound (200,000 HP)!', 'gold');
        this.emitHud();
      });
      return;
    }

    // ACT 122: IGNIS-BAHAMUT PHASE 1 -> PHASE 2 (CATACLYSM SKY-FLIGHT + HARPOON BALLISTAS!)
    if (enemy.kind === 'bahamut_p1') {
      enemy.hp = 0;
      this.projectiles = [];
      this.hazards = [];
      this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
      audio.bossRoar();
      audio.setTrack('track_22_bahamut', false);
      this.shake(0.65, 6.5);
      this.vfx.spawnShockwave(enemy.x, enemy.y, 84, '#f97316', 0.5);
      this.spawnParticles(enemy.x, enemy.y, '#f97316', 50, 150);

      for (const banner of this.warBanners) {
        banner.captured = false;
        banner.captureProgress = 0;
      }

      this.startDialogue(ACT122_BAHAMUT_P2_LINES, () => {
        const p2 = spawnEnemy('boss_bahamut_p2', 'bahamut_p2', 304, 112, 122, this.nightmareMode);
        p2.bossPhase = 2;
        p2.phaseGatesTriggered = [];
        p2.siphonSpawnCooldown = 18.0;
        p2.bossVisualId = 'boss_bahamut_p2';
        p2.width = 56;
        p2.height = 56;
        ensureDragonState(p2);
        this.enemies.push(p2);
        this.bossSplashTimer = 1.9;
        this.bossSplashName = 'Ignis-Bahamut — Cataclysm Sky-Flight (Phase 2/3)';
        this.mode = 'PLAYING';
        this.pushToast('🏹 Align 2 Corner Harpoon Ballistas [E] or ride Updrafts onto Bahamut’s back!', 'gold');
        this.emitHud();
      });
      return;
    }

    // ACT 122: IGNIS-BAHAMUT PHASE 2 -> PHASE 3 (SIX-WINGED SUPERNOVA WORLD-BREAKER!)
    if (enemy.kind === 'bahamut_p2') {
      enemy.hp = 0;
      this.projectiles = [];
      this.hazards = [];
      this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
      audio.bossRoar();
      audio.setTrack('track_22_bahamut', true);
      this.shake(0.75, 7);
      this.vfx.spawnShockwave(enemy.x, enemy.y, 92, '#ef4444', 0.55);
      this.spawnParticles(enemy.x, enemy.y, '#ef4444', 52, 160);
      this.spawnParticles(enemy.x, enemy.y, '#fde047', 36, 140);

      this.startDialogue(ACT122_BAHAMUT_P3_LINES, () => {
        const p3 = spawnEnemy('boss_bahamut_p3', 'bahamut_p3', 304, 120, 122, this.nightmareMode);
        p3.bossPhase = 3;
        p3.phaseGatesTriggered = [];
        p3.siphonSpawnCooldown = 18.0;
        p3.bossVisualId = 'boss_bahamut_p3';
        p3.width = 58;
        p3.height = 58;
        p3.overdrive = true;
        ensureDragonState(p3);
        this.enemies.push(p3);

        this.player.hp = Math.min(this.player.maxHp, this.player.hp + Math.round(this.player.maxHp * 0.6));
        for (const ally of this.alliedSoldiers) {
          ally.hp = ally.maxHp;
          ally.rallyTimer = 12.0;
        }
        this.bossSplashTimer = 2.0;
        this.bossSplashName = 'IGNIS-BAHAMUT — SUPERNOVA WORLD-BREAKER (PHASE 3/3)';
        this.mode = 'PLAYING';
        this.pushToast('🔥 PHASE 3 AWAKENED: 500,000 HP Six-Winged Supernova! Watch 25% HP Wipe!', 'gold');
        this.emitHud();
      });
      return;
    }

    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
    if ((enemy.isBoss || enemy.isMiniBoss) && !this.enemies.some((e) => e.isBoss || e.isMiniBoss)) {
      audio.setOverdrive(false);
    }
    this.stats.enemiesSlain += 1;
    const koboldBonus = enemy.kind === 'kobold_thief' ? 45 : 0;
    const goldGain = Math.round((enemy.goldReward + koboldBonus) * (this.player.alchemyRelics.seaCompass ? 1.25 : 1));
    this.player.gold += goldGain;
    this.stats.goldCollected += goldGain;
    if (koboldBonus > 0) {
      this.spawnFloatingText(enemy.x, enemy.y - 26, `+${koboldBonus}G RELIC STASH!`, '#fde047', 1.12);
    }

    const matDrop = enemy.isBoss ? 4 : enemy.isMiniBoss ? 3 : Math.random() < 0.72 ? 1 : 0;
    this.player.materials += matDrop;

    if (!enemy.isBoss && Math.random() < 0.45) {
      this.player.fishTreats += 1;
      this.stats.fishTreatsCollected += 1;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 10);
      this.spawnFloatingText(enemy.x, enemy.y - 18, '+1 Fish Treat', '#7dd3fc');
    }
    if (!enemy.isBoss && Math.random() < 0.25) {
      this.player.healthPotions += 1;
      this.spawnFloatingText(enemy.x, enemy.y - 24, '+1 Potion', '#4ade80');
    }

    this.gainXp(enemy.xpReward);
    audio.enemyCry();
    this.vfx.spawnShockwave(enemy.x, enemy.y, enemy.isBoss ? 54 : 20, '#fbbf24', 0.3);
    this.spawnParticles(enemy.x, enemy.y, '#fbbf24', enemy.isBoss ? 50 : 16, 95);

    // Boss Rush Chain (5 Iconic Boss Waves)
    if (this.bossRushStage !== null) {
      if (enemy.kind === 'grommash') {
        this.bossRushStage = 2;
        this.enemies.push(spawnEnemy('rush_2', 'brambleback', 304, 128, 20, this.nightmareMode, 'Brambleback (Boss Rush)', 'boss'));
        this.pushToast('Boss Rush Wave 2/5: Brambleback!', 'gold');
        audio.bossRoar();
        return;
      }
      if (enemy.kind === 'brambleback') {
        this.bossRushStage = 3;
        this.enemies.push(spawnEnemy('rush_3', 'viperfang', 304, 128, 30, this.nightmareMode, 'Viperfang (Boss Rush)', 'boss'));
        this.pushToast('Boss Rush Wave 3/5: Viperfang!', 'gold');
        audio.bossRoar();
        return;
      }
      if (enemy.kind === 'viperfang') {
        this.bossRushStage = 4;
        this.enemies.push(spawnEnemy('rush_4', 'aether_wing', 304, 128, 39, this.nightmareMode, 'Aether-Wing (Boss Rush)', 'boss'));
        this.pushToast('Boss Rush Wave 4/5: Aether-Wing Griffin!', 'gold');
        audio.bossRoar();
        return;
      }
      if (enemy.kind === 'aether_wing') {
        this.bossRushStage = 5;
        const f = spawnEnemy('rush_5', 'fenrir_p1', 304, 120, 41, this.nightmareMode);
        f.shielded = !this.player.duckElixirActive;
        this.enemies.push(f);
        this.pushToast('Boss Rush Final Wave 5/5: Usurper Fenrir!', 'gold');
        audio.bossRoar();
        return;
      }
    }

    // ACT 122: IGNIS-BAHAMUT PHASE 3 VANQUISHED -> UNLOCKS ARC IV (ACT 123)!
    if (enemy.kind === 'bahamut_p3') {
      this.story.bahamutDefeated = true;
      this.clearedActs.add(122);
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 123);
      this.nightmareUnlocked = true;
      this.syncUnlockedHeroesWithProgress();
      this.claimTier30EternalOmni(true, 3);
      this.bossRushStage = null;
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.warMorale = 100;
      this.shake(0.75, 7);
      audio.setTheme('victory');
      audio.victoryFanfare();
      this.saveProgress();

      this.mode = 'EPILOGUE_CUTSCENE';
      this.startDialogue(ACT122_GOLDEN_AGE_EPILOGUE_LINES, () => {
        this.mode = 'PLAYING';
        this.loadAct(123, 'west');
        this.pushToast('🌊 ARC IV UNLOCKED: The Kraken & Sunken Abyssal Archipelago (Acts 123–180)!', 'gold');
        this.emitHud();
      });
      return;
    }

    if (enemy.isBoss) {
      this.shake(0.08, 2.5, true);
    }

    // SEVERED KRAKEN TENTACLE CHAIN-REACTION (Pixel Ink Burst + 2 Healing Sushi/Fish Drops + 10% Max HP Boss Shock-Stagger!)
    if (enemy.kind === 'kraken_tentacle') {
      this.shake(0.08, 2.5, true);
      // Burst into pixel ink + 2 Healing Sushi/Fish Drops
      this.spawnParticles(enemy.x, enemy.y, '#1e1b4b', 22, 110);
      this.spawnParticles(enemy.x, enemy.y, '#312e81', 16, 95);
      this.spawnParticles(enemy.x, enemy.y, '#38bdf8', 14, 85);
      this.player.fishTreats += 2;
      this.stats.fishTreatsCollected += 2;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 28);
      this.spawnFloatingText(enemy.x, enemy.y - 22, '💥 TENTACLE SEVERED! +2 🍣 SUSHI/FISH!', '#38bdf8', 1.25);

      const remainingTentacles = this.enemies.filter((e) => e.kind === 'kraken_tentacle' && e.hp > 0).length;
      const charybdis = this.enemies.find((e) => e.kind === 'charybdis_kraken' && e.hp > 0);
      if (charybdis) {
        const shockDmg = Math.max(1, Math.round(charybdis.maxHp * 0.1));
        charybdis.hp = Math.max(1, charybdis.hp - shockDmg);
        charybdis.hitFlash = 0.22;
        this.addBossStagger(charybdis, 35);
        this.vfx.spawnShockwave(charybdis.x, charybdis.y, 68, '#38bdf8', 0.42);
        this.spawnParticles(charybdis.x, charybdis.y, '#fde047', 24, 110);
        this.spawnFloatingText(
          charybdis.x,
          charybdis.y - 26,
          `⚡ -${shockDmg.toLocaleString()} (10% MAX HP SHOCK-STAGGER!)`,
          '#fde047',
          1.26
        );
        if (remainingTentacles === 0 && charybdis.shielded) {
          charybdis.shielded = false;
          audio.staggerBreak();
          this.vfx.spawnShockwave(charybdis.x, charybdis.y, 84, '#38bdf8', 0.5);
          this.pushToast('🐙 ALL 8 KRAKEN TENTACLES SEVERED! Charybdis’s Abyssal Ward is SHATTERED!', 'gold');
        } else if (remainingTentacles > 0) {
          this.pushToast(`💥 Tentacle Severed! -10% Boss HP Shock-Stagger (${remainingTentacles} left)`, 'cyan');
        }
      }
    }

    // ACT 240: CHRONO-GEAR SHATTERED!
    if (this.currentAct === 240 && enemy.kind === 'tesla_drone') {
      const remainingGears = this.enemies.filter((e) => e.kind === 'tesla_drone' && e.hp > 0).length;
      if (remainingGears === 0) {
        this.pushToast('⏳ ALL 4 CHRONO-GEARS SHATTERED! Chronos-Omega can no longer rewind time!', 'gold');
      } else {
        this.pushToast(`⏳ Chrono-Gear Destroyed! (${remainingGears} remaining)`, 'cyan');
      }
    }

    // ACT 180: CHARYBDIS DEFEATED -> UNLOCKS ARC V (ACT 181)!
    if (enemy.kind === 'charybdis_kraken') {
      this.story.charybdisDefeated = true;
      this.clearedActs.add(180);
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 181);
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.player.kingdomResources.abyssalPearls += 30;
      audio.victoryFanfare();
      this.saveProgress();
      this.loadAct(181, 'west');
      this.pushToast('⚙️ ARC V UNLOCKED: The Clockwork Mecha-Empire of the Sky-Citadels (Acts 181–240)!', 'gold');
      this.emitHud();
      return;
    }

    // ACT 240: CHRONOS-OMEGA DEFEATED -> UNLOCKS ARC VI (ACT 241)!
    if (enemy.kind === 'chronos_omega') {
      this.story.chronosDefeated = true;
      this.clearedActs.add(240);
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 241);
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.player.kingdomResources.chronoGears += 35;
      audio.victoryFanfare();
      this.saveProgress();
      this.loadAct(241, 'west');
      this.pushToast('🌌 ARC VI UNLOCKED: The Void-Eclipse Multiverse (Acts 241–300)!', 'gold');
      this.emitHud();
      return;
    }

    // ACT 280: EVIL VOID-CLONE NYX DEFEATED!
    if (enemy.kind === 'void_clone_nyx') {
      this.story.voidCloneDefeated = true;
      this.clearedActs.add(280);
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 281);
      this.player.starPoints += 5;
      this.pushToast('🪞 Evil Void-Clone Nyx Vanquished! +5 Constellation Star Points & Act 281 Unlocked!', 'gold');
      this.saveProgress();
    }

    // ACT 300: AETHER-NULL TRUE OMNIVERSE FINALE VICTORY!
    if (enemy.kind === 'aether_null') {
      this.story.aetherNullDefeated = true;
      this.clearedActs.add(300);
      this.maxUnlockedAct = 300;
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.warMorale = 100;
      this.shake(0.85, 8);
      audio.setTheme('victory');
      audio.victoryFanfare();
      this.saveProgress();

      this.mode = 'EPILOGUE_CUTSCENE';
      this.startDialogue(ACT300_OMNIVERSE_VICTORY_LINES, () => {
        this.mode = 'VICTORY';
        this.emitHud();
      });
      return;
    }

    if (enemy.kind === 'fenrir_p2') {
      const isAct82 = this.currentAct === 82;
      this.story.fenrirDefeated = true;
      this.clearedActs.add(this.currentAct);
      if (!isAct82) {
        this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 42);
      } else {
        this.maxUnlockedAct = Math.max(this.maxUnlockedAct, 83);
        this.story.dragonCataclysmSeen = true;
      }
      this.nightmareUnlocked = true;
      this.syncUnlockedHeroesWithProgress();
      this.claimUltimateDuckAndGear(isAct82, isAct82);
      this.bossRushStage = null;
      this.enemies = [];
      this.projectiles = [];
      this.hazards = [];
      this.warMorale = 100;
      this.shake(0.65, 6);
      audio.setTheme('victory');
      audio.victoryFanfare();
      this.saveProgress();

      this.mode = 'EPILOGUE_CUTSCENE';
      if (isAct82) {
        const cataclysmSequence = [...WAR_FINALE_VICTORY_LINES.slice(0, 3), ...ACT82_TO_83_CATACLYSM_LINES];
        this.startDialogue(cataclysmSequence, () => {
          this.startDragonCataclysmCampaign();
        });
      } else {
        this.startDialogue(VICTORY_CUTSCENE_LINES, () => {
          if (this.pendingWarCampaignFromChoice) {
            this.startWarOfTwoKingdoms();
          } else if (this.pendingBossRushFromChoice) {
            this.startBossRush(true);
          } else {
            this.mode = 'VICTORY';
            this.emitHud();
          }
        });
      }
      return;
    }

    // Loot Kingdom Resources from slain enemies across Acts 1–300
    const resMult = computeCapitalBonuses(this.player.capitalBuildings).goldXpMult;
    if (Math.random() < 0.55) {
      this.player.kingdomResources.wood += Math.max(1, Math.round(2 * resMult));
      this.player.kingdomResources.iron += Math.max(1, Math.round(2 * resMult));
      if (this.currentAct >= 83) this.player.kingdomResources.dragonScales += 1;
      if (this.currentAct >= 123) this.player.kingdomResources.abyssalPearls += 1;
      if (this.currentAct >= 181) this.player.kingdomResources.chronoGears += 1;
      if (this.currentAct >= 241) this.player.kingdomResources.voidCrystals += 1;
    }

    // Check Act Clear for all standard & mini-boss acts across Acts 1–298!
    const isSanctuaryOrMajorFinale =
      this.currentAct === 40 ||
      this.currentAct === 41 ||
      this.currentAct === 81 ||
      this.currentAct === 82 ||
      this.currentAct === 121 ||
      this.currentAct === 122 ||
      this.currentAct === 179 ||
      this.currentAct === 180 ||
      this.currentAct === 239 ||
      this.currentAct === 240 ||
      this.currentAct === 299 ||
      this.currentAct === 300;
    if (this.enemies.length === 0 && !isSanctuaryOrMajorFinale) {
      this.clearedActs.add(this.currentAct);
      this.warMorale = 100;
      this.maxUnlockedAct = Math.max(this.maxUnlockedAct, Math.min(300, this.currentAct + 1));
      audio.setOverdrive(false);
      audio.setTrack(audio.getTrackForBiome(this.currentWorld.act.biomeId, 'normal'));
      audio.chestFanfare();
      this.pushToast(`Act ${this.currentAct} Cleared! East Portal to Act ${this.currentAct + 1} Unlocked!`, 'emerald');
      this.saveProgress();
    }
  }

  private gainXp(amount: number) {
    this.player.xp += amount;
    while (this.player.xp >= this.player.xpToNext) {
      this.player.xp -= this.player.xpToNext;
      this.player.level += 1;
      this.player.starPoints += 1;
      this.player.xpToNext = Math.round(this.player.xpToNext * 1.36);
      this.player.baseMaxHp += 18;
      this.player.baseAtk += 4;
      this.player.baseDef += 2;
      this.recalculateStats(true);
      audio.levelUp();
      this.spawnFloatingText(this.player.x, this.player.y - 18, `LEVEL ${this.player.level}! (+1 ★)`, '#38bdf8', 1.25);
      this.spawnParticles(this.player.x, this.player.y, '#38bdf8', 24, 90);
      this.pushToast(`Level Up! Now Level ${this.player.level} (+1 Constellation Star Point ★)`, 'cyan');
    }
  }

  private damagePlayer(
    rawDmg: number,
    sourceX: number,
    sourceY: number,
    options?: { trueDamage?: boolean; applyMortalWound?: boolean; ignoreInvuln?: boolean }
  ) {
    if ((!options?.ignoreInvuln && this.player.invulnTimer > 0) || this.mode !== 'PLAYING') {
      if (this.player.dodgeTimer > 0 && !options?.ignoreInvuln) {
        this.spawnFloatingText(this.player.x, this.player.y - 14, 'DODGE!', '#38bdf8');
      }
      return;
    }

    const totals = this.getTotalStats();
    const isCrustGuarded =
      !options?.trueDamage &&
      (this.player.activeEmote === 'bread_loaf' || this.player.activeEmote === 'eepy_croissant');
    const rawAfterDef = options?.trueDamage
      ? Math.max(2, Math.round(rawDmg))
      : Math.max(2, Math.round(rawDmg - totals.def * 0.52));
    const dmg = isCrustGuarded ? Math.max(1, Math.round(rawAfterDef * 0.6)) : rawAfterDef;
    this.player.hp = Math.max(0, this.player.hp - dmg);
    this.player.invulnTimer = 0.65;
    this.player.hitFlash = 0.22;

    if (options?.applyMortalWound) {
      const wasWounded = this.player.mortalWoundTimer > 0;
      this.player.mortalWoundTimer = 5.0;
      if (!wasWounded) {
        this.pushToast('💔 MORTAL WOUND (5s)! Potion Heal -50% & [H] Cooldown 10s!', 'amber');
      }
      this.spawnFloatingText(this.player.x, this.player.y - 26, '💔 MORTAL WOUND!', '#fb7185', 1.1);
    }

    const dx = this.player.x - sourceX;
    const dy = this.player.y - sourceY;
    const len = Math.max(1, Math.hypot(dx, dy));
    this.player.vx += (dx / len) * (isCrustGuarded ? 85 : 135);
    this.player.vy += (dy / len) * (isCrustGuarded ? 85 : 135);

    audio.playerHurt();
    if (options?.trueDamage) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, `-${dmg.toLocaleString()} TRUE!`, '#f43f5e', 1.15);
    } else if (isCrustGuarded) {
      this.spawnFloatingText(this.player.x, this.player.y - 16, `-${dmg} (🍞 CRUST GUARD!)`, '#fbbf24', 1.05);
      this.spawnParticles(this.player.x, this.player.y, '#d97706', 12, 65);
    } else {
      this.spawnFloatingText(this.player.x, this.player.y - 14, `-${dmg}`, '#f87171');
    }
    this.spawnParticles(this.player.x, this.player.y, '#ef4444', 10, 65);

    if (this.player.hp <= 0) {
      this.stats.deaths += 1;
      this.mode = 'GAME_OVER';
      this.emitHud();
    }
  }

  private update(dt: number) {
    this.globalTime += dt;

    if (this.shakeTimer > 0) this.shakeTimer = Math.max(0, this.shakeTimer - dt);
    if (this.shakeCooldown > 0) this.shakeCooldown = Math.max(0, this.shakeCooldown - dt);
    if (this.portalCooldown > 0) this.portalCooldown = Math.max(0, this.portalCooldown - dt);
    if (this.lockToastCooldown > 0) this.lockToastCooldown = Math.max(0, this.lockToastCooldown - dt);
    if (this.irisWipeTimer > 0) this.irisWipeTimer = Math.max(0, this.irisWipeTimer - dt);
    if (this.actBannerTimer > 0) this.actBannerTimer = Math.max(0, this.actBannerTimer - dt);
    if (this.bossSplashTimer > 0) this.bossSplashTimer = Math.max(0, this.bossSplashTimer - dt);

    if (this.mode === 'TITLE') {
      this.titleArenaSim.update(dt);
      this.updateParticles(dt);
      return;
    }

    const isCinematic =
      this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE';
    const targetLetterbox = isCinematic ? 1 : this.bossSplashTimer > 0 ? 0.55 : 0;
    this.letterboxRatio += (targetLetterbox - this.letterboxRatio) * Math.min(1, dt * 6);
    const hasDragon = this.dragonController.hasActiveDragon(this.enemies);
    const targetZoom = isCinematic ? 1.08 : hasDragon ? 0.85 : 1.0;
    this.camZoom += (targetZoom - this.camZoom) * Math.min(1, dt * 4);

    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE' || this.mode === 'DIALOGUE') {
      const line = this.dialogueQueue[this.dialogueIndex];
      if (line?.cameraTarget) {
        const mapW = this.currentWorld.grid[0].length * TILE_SIZE;
        const mapH = this.currentWorld.grid.length * TILE_SIZE;
        const tx = Math.max(0, Math.min(mapW - LOGICAL_W, line.cameraTarget.x - LOGICAL_W / 2));
        const ty = Math.max(0, Math.min(mapH - LOGICAL_H, line.cameraTarget.y - LOGICAL_H / 2));
        const lerp = 1 - Math.pow(0.004, dt);
        this.camX += (tx - this.camX) * lerp;
        this.camY += (ty - this.camY) * lerp;
      }
      if (line && this.dialogueChars < line.text.length) {
        this.dialogueCharTimer += dt;
        while (this.dialogueCharTimer >= 0.02 && this.dialogueChars < line.text.length) {
          this.dialogueCharTimer -= 0.02;
          this.dialogueChars += 1;
          if (this.dialogueChars % 4 === 0) {
            audio.talkBlip(line.speaker.includes('Duck') ? 390 : line.speaker.includes('Fenrir') ? 210 : 510);
          }
        }
        this.hudSyncTimer += dt;
        if (this.hudSyncTimer >= 0.04) {
          this.hudSyncTimer = 0;
          this.emitHud();
        }
      }
      this.updateParticles(dt);
      return;
    }

    if (this.mode !== 'PLAYING') {
      this.updateParticles(dt);
      return;
    }

    if (this.hitStopTimer > 0) {
      this.hitStopTimer = Math.max(0, this.hitStopTimer - dt);
      this.vfx.update(dt);
      this.updateCamera(dt);
      return;
    }

    if (this.warHornWaveTimer > 0) this.warHornWaveTimer = Math.max(0, this.warHornWaveTimer - dt);
    if (this.warHornActiveTimer > 0) this.warHornActiveTimer = Math.max(0, this.warHornActiveTimer - dt);

    this.stats.elapsedSeconds += dt;
    this.passiveResourceTimer += dt;
    if (this.passiveResourceTimer >= 10.0) {
      this.passiveResourceTimer = 0;
      const quarryLv = this.player.capitalBuildings.minecart_quarry ?? 1;
      this.player.kingdomResources.wood += quarryLv * 2;
      this.player.kingdomResources.iron += quarryLv * 2;
    }

    this.updatePlayer(dt);
    this.updateDuckCompanions(dt);
    updatePartyCompanionsAI(
      dt,
      this.player,
      this.player.partyCompanions,
      this.enemies,
      this.currentWorld.grid,
      this.getTotalStats().atk,
      (comp, target, dmg) => {
        this.spawnParticles(target.x, target.y, HERO_METADATA[comp.heroId].color, 6, 65);
        this.damageEnemy(target, dmg, 20, 0, -1, false, 8);
      },
      (proj) => this.projectiles.push(proj)
    );
    this.bossRaidTelemetry = updateOmniverseBossMechanics(
      dt,
      this.currentAct,
      this.player,
      this.enemies,
      this.bossRaidState,
      this.globalTime,
      (msg, acc) => this.pushToast(msg, acc),
      (x, y, text, color) => this.spawnFloatingText(x, y, text, color),
      (h) => this.hazards.push(h),
      (dmg, sx, sy) => this.damagePlayer(dmg, sx, sy)
    );
    this.updateAlliedSoldiers(dt);
    this.updateWarBanners(dt);
    this.updateSiegeEngines(dt);
    this.dragonController.updateAll(
      dt,
      this.enemies,
      this.player,
      this.alliedSoldiers,
      this.projectiles,
      this.hazards,
      this.featherPickups,
      this.getDragonCallbacks()
    );
    this.updateEnemies(dt);
    this.updateRaidMechanics(dt);
    this.updateProjectiles(dt);
    this.updateHazards(dt);
    this.updateTraps(dt);
    this.biomeMechanics.update(
      dt,
      this.currentWorld.act.biomeId,
      this.player,
      this.enemies,
      this.alliedSoldiers,
      this.getBiomeCallbacks()
    );
    this.updateParticles(dt);
    this.updateCamera(dt);

    this.toasts = this.toasts.map((t) => ({ ...t, life: t.life - dt })).filter((t) => t.life > 0);

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.08) {
      this.hudSyncTimer = 0;
      this.emitHud();
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    const grid = this.currentWorld.grid;

    if (p.stunTimer > 0) {
      p.stunTimer = Math.max(0, p.stunTimer - dt);
    }
    if (p.mortalWoundTimer > 0) {
      p.mortalWoundTimer = Math.max(0, p.mortalWoundTimer - dt);
    }
    if (p.potionCooldown > 0) {
      p.potionCooldown = Math.max(0, p.potionCooldown - dt);
      if (p.potionCooldown === 0) p.potionMaxCooldown = 0;
    }
    if (p.dragonSlayerFuryTimer > 0) {
      p.dragonSlayerFuryTimer = Math.max(0, p.dragonSlayerFuryTimer - dt);
    }

    // 8-Second Timed Great Duck's Elixir Duration & 45s / 5-Feather Refill Loop!
    if (p.duckElixirActive) {
      p.duckElixirTimer = Math.max(0, p.duckElixirTimer - dt);
      p.hp = Math.min(p.maxHp, p.hp + 1.5 * dt);
      if (p.duckElixirBurstTimer > 0) p.duckElixirBurstTimer = Math.max(0, p.duckElixirBurstTimer - dt);
      if (Math.random() < 0.35) {
        this.vfx.spawnSingleParticle(
          p.x + (Math.random() - 0.5) * 14,
          p.y + (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 16,
          -18 - Math.random() * 14,
          Math.random() < 0.5 ? '#fde047' : '#fef9c3',
          2,
          0.45
        );
      }

      if (p.duckElixirTimer <= 0) {
        p.duckElixirActive = false;
        p.duckElixirCooldown = 45.0;
        p.elixirFeathers = 0;
        this.spawnFloatingText(p.x, p.y - 20, '⚠️ ELIXIR WORE OFF! (45s CD)', '#fb923c', 1.2);

        const shieldedBoss = this.enemies.find(
          (e) => e.kind === 'fenrir_p1' || e.kind === 'fenrir_p2' || e.kind === 'bahamut_p1'
        );
        if (shieldedBoss && shieldedBoss.hp > 0) {
          shieldedBoss.shielded = true;
          audio.shieldImmune();
          this.spawnParticles(shieldedBoss.x, shieldedBoss.y, '#c084fc', 28, 110);
          this.spawnFloatingText(
            shieldedBoss.x,
            shieldedBoss.y - 20,
            shieldedBoss.kind === 'bahamut_p1' ? '🛡️ DRAGON SKY-WARD RESTORED!' : '🛡️ DARK BARRIER RESTORED!',
            '#c084fc',
            1.2
          );
          this.pushToast(
            `⚠️ Elixir Wore Off! ${shieldedBoss.name} re-cast a 90% Barrier! Collect 5 Golden Feathers 🪶 or Perfect Dodge/Backstab to refill [Q]!`,
            'amber'
          );
          this.spawnArenaFeatherDrops(3);
        } else {
          this.pushToast(
            '⚠️ Great Duck’s Elixir wore off! Recharging (45s) or collect 5 Golden Feathers 🪶!',
            'amber'
          );
        }
        this.emitHud();
      }
    } else if (p.duckElixirCooldown > 0) {
      p.duckElixirCooldown = Math.max(0, p.duckElixirCooldown - dt);
      if (this.enemies.some((e) => e.isBoss || e.isMiniBoss)) {
        this.featherDropTimer -= dt;
        if (this.featherDropTimer <= 0) {
          this.featherDropTimer = 10.5;
          this.spawnArenaFeatherDrops(2);
        }
      }
      if (p.duckElixirCooldown <= 0) {
        p.elixirFeathers = 5;
        audio.levelUp();
        this.spawnFloatingText(p.x, p.y - 18, '🦆 ELIXIR READY! [Q]', '#fde047', 1.2);
        this.pushToast('🦆 Great Duck’s Elixir [Q] is 100% READY!', 'gold');
        this.emitHud();
      }
    }

    // Update Golden Duck Feather pickups on the battlefield
    if (this.featherPickups.length > 0) {
      const nextFeathers: GoldenFeatherPickup[] = [];
      for (const fp of this.featherPickups) {
        fp.life -= dt;
        if (fp.life <= 0) continue;
        const d = Math.hypot(p.x - fp.x, p.y - fp.y);
        if (d < 34) {
          fp.x += ((p.x - fp.x) / Math.max(1, d)) * 115 * dt;
          fp.y += ((p.y - fp.y) / Math.max(1, d)) * 115 * dt;
        }
        if (d <= 15) {
          audio.duckQuack();
          const heal = Math.round(p.maxHp * 0.12);
          p.hp = Math.min(p.maxHp, p.hp + heal);
          this.spawnParticles(fp.x, fp.y, '#fde047', 14, 75);
          if (p.duckElixirCooldown > 0) {
            this.addElixirFeatherCharge(1, '🪶 Golden Feather');
          } else {
            this.spawnFloatingText(p.x, p.y - 14, `🪶 +${heal} HP`, '#fde047', 1.05);
          }
        } else {
          nextFeathers.push(fp);
        }
      }
      this.featherPickups = nextFeathers;
    }

    if (p.stamina < p.maxStamina) {
      p.staminaRegenTimer -= dt;
      if (p.staminaRegenTimer <= 0) {
        p.stamina = Math.min(p.maxStamina, p.stamina + 1);
        p.staminaRegenTimer = 1.1;
      }
    }

    if (p.attackTimer > 0) p.attackTimer = Math.max(0, p.attackTimer - dt);
    if (p.attackCooldown > 0) p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    if (p.comboResetTimer > 0) {
      p.comboResetTimer -= dt;
      if (p.comboResetTimer <= 0) p.comboStep = 0;
    }
    if (p.dodgeCooldown > 0) p.dodgeCooldown = Math.max(0, p.dodgeCooldown - dt);
    if (p.invulnTimer > 0) p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    if (p.hitFlash > 0) p.hitFlash = Math.max(0, p.hitFlash - dt);
    if (p.happyJumpTimer > 0) p.happyJumpTimer = Math.max(0, p.happyJumpTimer - dt);
    if (p.duckSummonCooldown > 0) p.duckSummonCooldown = Math.max(0, p.duckSummonCooldown - dt);
    if (p.brewTossCooldown > 0) p.brewTossCooldown = Math.max(0, p.brewTossCooldown - dt);
    if (p.steamMechaCooldown > 0) p.steamMechaCooldown = Math.max(0, p.steamMechaCooldown - dt);
    if (p.steamMechaActive) {
      p.steamMechaTimer = Math.max(0, p.steamMechaTimer - dt);
      if (p.steamMechaTimer <= 0) {
        p.steamMechaActive = false;
        this.pushToast('⚙️ Steam-Mecha Suit power depleted! Recharging...', 'amber');
      }
    }

    p.afterimages = p.afterimages.map((a) => ({ ...a, alpha: a.alpha - dt * 4 })).filter((a) => a.alpha > 0);
    this.blinkTimer -= dt;
    if (this.blinkTimer <= -0.14) this.blinkTimer = 2.6 + Math.random() * 2.2;
    this.pawPrints = this.pawPrints.map((pp) => ({ ...pp, life: pp.life - dt })).filter((pp) => pp.life > 0);

    // Airborne Dragon Spine-Mount overrides ground movement & tile collisions
    if (this.dragonController.mount.active) {
      let mx = this.analogInput.x;
      let my = this.analogInput.y;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) mx -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) mx += 1;
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) my -= 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) my += 1;
      const mmag = Math.hypot(mx, my);
      if (mmag > 1) {
        mx /= mmag;
        my /= mmag;
      }
      this.dragonController.updateMountMovement(mx, my, dt);
      return;
    }

    let moveX = 0;
    let moveY = 0;
    const tx = Math.floor(p.x / TILE_SIZE);
    const ty = Math.floor(p.y / TILE_SIZE);
    const onIce = isTileIce(grid, tx, ty);
    const onMud = isTileMud(grid, tx, ty);
    const onLava = isTileLavaHazard(grid, tx, ty);

    if (onLava && p.dodgeTimer <= 0) {
      this.lavaTickTimer += dt;
      if (this.lavaTickTimer >= 0.48) {
        this.lavaTickTimer = 0;
        const hazDmg = Math.max(4, Math.round(6 + this.currentAct * 0.25));
        this.damagePlayer(hazDmg, p.x, p.y);
        const palette = BIOME_PALETTES[this.currentWorld.act.biomeId];
        this.spawnParticles(p.x, p.y, palette.hazardB, 8, 55);
      }
    } else {
      this.lavaTickTimer = Math.max(0, this.lavaTickTimer - dt * 2);
    }

    if (p.activeEmote !== 'none') {
      p.emoteTimer += dt;
      // Cozy Cat Loaf / Emote regeneration (+5 HP/sec & faster stamina recovery)
      p.hp = Math.min(p.maxHp, p.hp + 5 * dt);
      if (p.stamina < p.maxStamina) {
        p.staminaRegenTimer -= dt * 0.65;
      }
      if (Math.random() < dt * 3.5) {
        const steamColor =
          p.activeEmote === 'bread_loaf' || p.activeEmote === 'eepy_croissant'
            ? '#fcd34d'
            : p.activeEmote === 'making_biscuits'
            ? '#fef3c7'
            : '#f472b6';
        this.vfx.spawnSingleParticle(
          p.x + (Math.random() - 0.5) * 14,
          p.y - 4 + (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 10,
          -16 - Math.random() * 12,
          steamColor,
          2,
          0.55
        );
      }
    }

    if (p.dodgeTimer > 0) {
      if (p.activeEmote !== 'none') {
        p.activeEmote = 'none';
        p.emoteTimer = 0;
      }
      p.dodgeTimer = Math.max(0, p.dodgeTimer - dt);
      moveX = p.dodgeDirX * 230;
      moveY = p.dodgeDirY * 230;
      p.afterimages.push({ x: p.x, y: p.y, alpha: 0.55, facing: p.facing });
      this.idleTimer = 0;
    } else if (p.stunTimer <= 0) {
      let ix = this.analogInput.x;
      let iy = this.analogInput.y;
      if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) ix -= 1;
      if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) ix += 1;
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) iy -= 1;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) iy += 1;

      const mag = Math.hypot(ix, iy);
      if (mag > 0.12) {
        if (p.activeEmote !== 'none' && p.emoteTimer > 0.2) {
          p.activeEmote = 'none';
          p.emoteTimer = 0;
          this.spawnParticles(p.x, p.y, '#fde68a', 6, 45);
        }
        if (mag > 1) {
          ix /= mag;
          iy /= mag;
        }
        if (Math.abs(ix) >= Math.abs(iy)) p.facing = ix > 0 ? 'right' : 'left';
        else p.facing = iy > 0 ? 'down' : 'up';

        p.animTimer += dt;
        if (p.animTimer >= 0.14) {
          p.animTimer = 0;
          p.animFrame = (p.animFrame + 1) % 2;
        }
        this.idleTimer = 0;
        this.pawPrintTimer += dt;
        if (this.pawPrintTimer >= 0.22) {
          this.pawPrintTimer = 0;
          this.pawPrints.push({ x: p.x + (Math.random() - 0.5) * 4, y: p.y + 6, life: 1.4 });
        }
        if (p.furId === 'starlight' && Math.random() < dt * 35) {
          const hue = (this.globalTime * 160 + Math.random() * 80) % 360;
          this.vfx.spawnSingleParticle(
            p.x + (Math.random() - 0.5) * 10,
            p.y + (Math.random() - 0.5) * 10,
            -ix * 25 + (Math.random() - 0.5) * 10,
            -iy * 25 + (Math.random() - 0.5) * 10,
            `hsl(${hue}, 100%, 70%)`,
            2,
            0.6
          );
        }
      } else {
        ix = 0;
        iy = 0;
        p.animFrame = 0;
        this.idleTimer += dt;
        if (this.idleTimer >= 5.0 && p.activeEmote === 'none' && this.enemies.length === 0) {
          this.idleTimer = 0;
          p.activeEmote = 'bread_loaf';
          p.emoteTimer = 0;
          audio.catLoafPurr();
          this.spawnFloatingText(p.x, p.y - 16, '🍞 Auto-Loaf~', '#fbbf24', 0.95);
        } else if (p.activeEmote !== 'none' && this.idleTimer >= 2.8) {
          this.idleTimer = 0;
          const EmoteTexts: Record<Exclude<CatEmoteId, 'none'>, string> = {
            bread_loaf: '🍞 *warm loaf purr*',
            making_biscuits: '🐾 *knead knead*',
            eepy_croissant: '🥐 zZz...',
            zoomie_blep: '👅 :P mlem~',
            purr_love: '💖 Prrr~ ♥',
          };
          this.spawnFloatingText(p.x, p.y - 16, EmoteTexts[p.activeEmote], '#fde68a', 0.9);
        }
      }

      const mudMult = onMud ? 0.65 : 1;
      const actBp = getActBlueprint(this.currentAct);
      const surfaceUpdate = updateSurfacePhysics(
        this.surfacePhysics,
        actBp,
        grid,
        this.destructibleProps,
        p.x,
        p.y,
        p.dodgeTimer > 0,
        dt,
        TILE_SIZE
      );
      if (surfaceUpdate.triggeredPlungeWindow) {
        this.spawnFloatingText(p.x, p.y - 18, '⛰️ LEDGE LEAP! PRESS ATTACK FOR 2.0x PLUNGE!', '#facc15', 1.05);
      }
      const biomeSpeedMult = this.biomeMechanics.getPlayerSpeedMultiplier(p.x, p.y) * surfaceUpdate.speedMultiplier;
      // +40% Move Speed while Great Duck's Elixir is active (138 vs 98)
      const baseSpeed =
        (p.duckElixirActive ? 138 : 98) * (p.alchemyRelics.nekoThrusters ? 1.18 : 1) * biomeSpeedMult;
      const targetVx = ix * baseSpeed * mudMult;
      const targetVy = iy * baseSpeed * mudMult;

      if (onIce) {
        const slideLerp = 1 - Math.pow(0.06, dt);
        this.iceSlideVel.x += (targetVx - this.iceSlideVel.x) * slideLerp;
        this.iceSlideVel.y += (targetVy - this.iceSlideVel.y) * slideLerp;
        moveX = this.iceSlideVel.x;
        moveY = this.iceSlideVel.y;
      } else {
        this.iceSlideVel.x = targetVx;
        this.iceSlideVel.y = targetVy;
        moveX = targetVx;
        moveY = targetVy;
      }
    }

    if (this.bespokeTrapState) {
      const trapOut = updateAndCheckTrapHazards(
        this.bespokeTrapState,
        getActBlueprint(this.currentAct),
        grid,
        p.x,
        p.y,
        this.surfacePhysics.playerElevation,
        dt,
        TILE_SIZE
      );
      if (trapOut.bounceToHighGround) {
        this.surfacePhysics.playerElevation = 2;
        this.surfacePhysics.ledgePlungeWindowTimer = 1.4;
      }
      if (trapOut.damageToPlayer > 0 && p.dodgeTimer <= 0) {
        this.damagePlayer(Math.round(trapOut.damageToPlayer), p.x - trapOut.knockbackVx, p.y - trapOut.knockbackVy);
      }
      p.vx += trapOut.knockbackVx + trapOut.pullVx * dt;
      p.vy += trapOut.knockbackVy + trapOut.pullVy * dt;
      if (trapOut.statusMessage) {
        this.spawnFloatingText(p.x, p.y - 20, trapOut.statusMessage, trapOut.statusColor, 1.05);
      }
    }

    p.vx *= Math.pow(0.001, dt);
    p.vy *= Math.pow(0.001, dt);
    this.moveEntityWithTileCollision(p, (moveX + p.vx) * dt, (moveY + p.vy) * dt, grid);

    if (this.portalCooldown <= 0) {
      for (const portal of this.currentWorld.portals) {
        if (
          p.x >= portal.x + 2 &&
          p.x <= portal.x + portal.width - 2 &&
          p.y >= portal.y + 2 &&
          p.y <= portal.y + portal.height - 2
        ) {
          this.tryEnterPortal(portal);
          break;
        }
      }
    }
  }

  private getCataclysmRingBounds(): {
    active: boolean;
    borderPct: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    isDragon: boolean;
  } {
    const finalBoss = this.enemies.find((e) => e.hp > 0 && this.isFinalBossEnemy(e));
    if (!finalBoss || this.bossRushStage !== null) {
      return { active: false, borderPct: 0, minX: 0, maxX: 608, minY: 0, maxY: 384, isDragon: false };
    }
    let phase = 1;
    if (finalBoss.kind === 'fenrir_p2') {
      phase = (finalBoss.bossPhase ?? 2) >= 3 ? 3 : 2;
    } else if (finalBoss.kind === 'bahamut_p2') {
      phase = 2;
    } else if (finalBoss.kind === 'bahamut_p3') {
      phase = 3;
    }
    const borderPct = phase === 3 ? 45 : phase === 2 ? 30 : 15;
    const insetX = Math.round(608 * (borderPct / 200));
    const insetY = Math.round(384 * (borderPct / 200));
    return {
      active: true,
      borderPct,
      minX: insetX,
      maxX: 608 - insetX,
      minY: insetY,
      maxY: 384 - insetY,
      isDragon: finalBoss.archetype === 'bahamut',
    };
  }

  private triggerBossPhaseGate(enemy: Enemy, gatePct: number) {
    if (!enemy.phaseGatesTriggered) enemy.phaseGatesTriggered = [];
    if (!enemy.phaseGatesTriggered.includes(gatePct)) {
      enemy.phaseGatesTriggered.push(gatePct);
    }
    enemy.isInvulnerablePhaseGate = true;
    enemy.phaseGateTimer = 12.0;
    enemy.phaseGateTick = 0.65;
    enemy.phaseGateMeteorTick = 2.2;
    enemy.counterStanceTimer = 0;

    if (isDragonBossEnemy(enemy)) {
      const ds = ensureDragonState(enemy);
      ds.altitude = 'ground';
      ds.skyHeight = 0;
      ds.breathWindup = 0;
      ds.windGaleWindup = 0;
      ds.tailWhipWindup = 0;
      ds.hoardTheftWindup = 0;
    }

    const centerDry = findNearestDryTile(this.currentWorld.grid, 304, 168, false);
    enemy.x = centerDry.x;
    enemy.y = centerDry.y;
    snapEntityToDryLand(enemy, this.currentWorld.grid, TILE_SIZE, false);

    // Clear old pillars for this boss and spawn 4 Phase-Lock Rune Pillars in arena corners
    this.phaseLockPillars = this.phaseLockPillars.filter((pl) => pl.bossId !== enemy.id);
    const pillarHp =
      enemy.archetype === 'bahamut' ? 5500 : this.currentAct === 82 ? 3200 : 1800;
    const corners = [
      { x: 176, y: 114 },
      { x: 432, y: 114 },
      { x: 176, y: 266 },
      { x: 432, y: 266 },
    ];
    for (let i = 0; i < corners.length; i++) {
      const dry = findNearestDryTile(this.currentWorld.grid, corners[i].x, corners[i].y, false);
      this.phaseLockPillars.push({
        id: `gate_pil_${enemy.id}_${gatePct}_${i}`,
        bossId: enemy.id,
        x: dry.x,
        y: dry.y,
        hp: pillarHp,
        maxHp: pillarHp,
        hitFlash: 0,
      });
      this.vfx.spawnShockwave(dry.x, dry.y, 26, '#c084fc', 0.3);
      this.spawnParticles(dry.x, dry.y, '#c084fc', 12, 70);
    }

    audio.bossRoar();
    this.shake(0.48, 5.5);
    this.vfx.spawnShockwave(enemy.x, enemy.y, 72, '#e879f9', 0.45);
    this.spawnFloatingText(enemy.x, enemy.y - 28, `🛡️ ${gatePct}% PHASE-GATE! DESTROY 4 PILLARS!`, '#e879f9', 1.32);
    this.pushToast(
      `🛡️ ${gatePct}% HP PHASE-GATE! Boss is INVULNERABLE for 12s — Shatter all 4 Rune Pillars early or survive the Nightmare Trial!`,
      'amber'
    );

    if (this.enemies.length <= 24) {
      this.triggerDogKingdomCounterAttack(enemy.x, enemy.y);
    }
  }

  private spawnSiphonObelisks(enemy: Enemy) {
    const existing = this.siphonObelisks.filter((s) => s.bossId === enemy.id && s.hp > 0);
    if (existing.length >= 3) return;
    this.siphonObelisks = this.siphonObelisks.filter((s) => s.bossId !== enemy.id);

    const obHp = enemy.archetype === 'bahamut' ? 4500 : this.currentAct === 82 ? 2800 : 1500;
    const spots = [
      { x: 188, y: 132 },
      { x: 420, y: 132 },
      { x: 304, y: 250 },
    ];
    for (let i = 0; i < spots.length; i++) {
      const dry = findNearestDryTile(this.currentWorld.grid, spots[i].x, spots[i].y, false);
      this.siphonObelisks.push({
        id: `siph_${enemy.id}_${Date.now()}_${i}`,
        bossId: enemy.id,
        x: dry.x,
        y: dry.y,
        hp: obHp,
        maxHp: obHp,
        hitFlash: 0,
      });
      this.vfx.spawnShockwave(dry.x, dry.y, 24, '#f43f5e', 0.3);
      this.spawnParticles(dry.x, dry.y, '#c084fc', 10, 65);
    }
    audio.shieldImmune();
    this.spawnFloatingText(enemy.x, enemy.y - 26, '🟣 3 SIPHON OBELISKS (+1,500 HP/s & 75% DR)!', '#e879f9', 1.24);
    this.pushToast(
      '🟣 3 Corrupted Siphon Obelisks summoned! Boss heals +1,500 HP/s & gains 75% Damage Reduction until shattered!',
      'amber'
    );
  }

  private damagePhaseLockPillar(pillar: PhaseLockPillar, rawDmg: number) {
    if (pillar.hp <= 0) return;
    pillar.hp = Math.max(0, pillar.hp - rawDmg);
    pillar.hitFlash = 0.14;
    audio.hitImpact(true);
    this.spawnParticles(pillar.x, pillar.y, '#c084fc', 10, 75);
    this.spawnFloatingText(pillar.x, pillar.y - 16, `-${rawDmg.toLocaleString()}`, '#e879f9', 1.0);
    if (pillar.hp <= 0) {
      this.vfx.spawnShockwave(pillar.x, pillar.y, 34, '#38bdf8', 0.32);
      this.spawnFloatingText(pillar.x, pillar.y - 22, '💥 PILLAR SHATTERED!', '#38bdf8', 1.15);
      const remaining = this.phaseLockPillars.filter((p) => p.bossId === pillar.bossId && p.hp > 0);
      if (remaining.length === 0) {
        const boss = this.enemies.find((e) => e.id === pillar.bossId);
        if (boss && boss.isInvulnerablePhaseGate) {
          boss.isInvulnerablePhaseGate = false;
          boss.phaseGateTimer = 0;
          boss.stunTimer = Math.max(boss.stunTimer ?? 0, 2.5);
          this.phaseLockPillars = this.phaseLockPillars.filter((p) => p.bossId !== pillar.bossId);
          audio.staggerBreak();
          this.shake(0.4, 4.8);
          this.vfx.spawnShockwave(boss.x, boss.y, 64, '#fde047', 0.42);
          this.spawnFloatingText(boss.x, boss.y - 28, '🔓 PHASE-GATE BROKEN! (2.5s STUN)', '#fde047', 1.28);
          this.pushToast('🔓 All 4 Phase-Lock Pillars destroyed early! Boss stunned for 2.5s!', 'gold');
        }
      }
    }
  }

  private damageSiphonObelisk(ob: SiphonObelisk, rawDmg: number) {
    if (ob.hp <= 0) return;
    ob.hp = Math.max(0, ob.hp - rawDmg);
    ob.hitFlash = 0.14;
    audio.hitImpact(true);
    this.spawnParticles(ob.x, ob.y, '#f43f5e', 10, 75);
    this.spawnFloatingText(ob.x, ob.y - 16, `-${rawDmg.toLocaleString()}`, '#fda4af', 1.0);
    if (ob.hp <= 0) {
      this.vfx.spawnShockwave(ob.x, ob.y, 34, '#fde047', 0.32);
      this.spawnFloatingText(ob.x, ob.y - 22, '💥 SIPHON DESTROYED!', '#fde047', 1.15);
      this.siphonObelisks = this.siphonObelisks.filter((s) => s.id !== ob.id);
      const rem = this.siphonObelisks.filter((s) => s.bossId === ob.bossId && s.hp > 0);
      if (rem.length === 0) {
        this.pushToast('✨ All Corrupted Siphon Obelisks destroyed! Boss healing & 75% DR removed!', 'emerald');
      }
    }
  }

  private updateRaidMechanics(dt: number) {
    for (const pl of this.phaseLockPillars) {
      if (pl.hitFlash > 0) pl.hitFlash = Math.max(0, pl.hitFlash - dt);
    }
    for (const ob of this.siphonObelisks) {
      if (ob.hitFlash > 0) ob.hitFlash = Math.max(0, ob.hitFlash - dt);
    }
    this.phaseLockPillars = this.phaseLockPillars.filter((pl) => pl.hp > 0);
    this.siphonObelisks = this.siphonObelisks.filter((ob) => ob.hp > 0);

    // Corrupted Siphon Obelisks regenerate Boss +1,500 HP/s & spark laser tether particles
    for (const e of this.enemies) {
      if (e.hp <= 0 || !this.isFinalBossEnemy(e)) continue;
      const activeSiphons = this.siphonObelisks.filter((ob) => ob.bossId === e.id && ob.hp > 0);
      if (activeSiphons.length > 0) {
        e.hp = Math.min(e.maxHp, e.hp + 1500 * dt);
        if (Math.random() < dt * 6) {
          const pick = activeSiphons[Math.floor(Math.random() * activeSiphons.length)];
          this.vfx.spawnSingleParticle(
            (pick.x + e.x) * 0.5 + (Math.random() - 0.5) * 20,
            (pick.y + e.y) * 0.5 + (Math.random() - 0.5) * 20,
            0,
            -18,
            '#e879f9',
            2,
            0.35
          );
        }
      }

      // 18-Second Siphon Obelisk Summon Loop
      if (!e.isInvulnerablePhaseGate && (e.stunTimer ?? 0) <= 0) {
        e.siphonSpawnCooldown = (e.siphonSpawnCooldown ?? 18.0) - dt;
        if (e.siphonSpawnCooldown <= 0) {
          e.siphonSpawnCooldown = 18.0;
          this.spawnSiphonObelisks(e);
        }
      }

      // Active 12-Second Phase-Gate Invulnerability Trial!
      if (e.isInvulnerablePhaseGate) {
        e.phaseGateTimer = Math.max(0, (e.phaseGateTimer ?? 0) - dt);
        e.phaseGateTick = (e.phaseGateTick ?? 0.65) - dt;
        e.phaseGateMeteorTick = (e.phaseGateMeteorTick ?? 2.2) - dt;
        e.x = 304;
        e.y = 168;

        if (e.phaseGateTick <= 0) {
          e.phaseGateTick = 0.65;
          const rot = this.globalTime * 1.8;
          const orbColor = e.archetype === 'bahamut' ? '#f97316' : '#c084fc';
          for (let i = 0; i < 10; i++) {
            const ang = rot + (Math.PI * 2 * i) / 10;
            this.projectiles.push({
              id: `pg_orb_${Date.now()}_${i}_${Math.random()}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * 128,
              vy: Math.sin(ang) * 128,
              radius: 5,
              damage: Math.round(e.atk * 1.05),
              life: 2.3,
              maxLife: 2.3,
              color: orbColor,
              coreColor: '#fef08a',
              kind: 'gem_laser',
              applyMortalWound: true,
            });
          }
        }
        if (e.phaseGateMeteorTick <= 0) {
          e.phaseGateMeteorTick = 2.2;
          this.hazards.push({
            id: `pg_met_${Date.now()}_${Math.random()}`,
            x: Math.max(138, Math.min(470, this.player.x)),
            y: Math.max(88, Math.min(294, this.player.y)),
            radius: 26,
            life: 0.95,
            kind: 'meteor_warn',
            damagePerSec: Math.round(e.atk * 1.2),
            triggered: false,
            applyMortalWound: true,
          });
        }

        if ((e.phaseGateTimer ?? 0) <= 0) {
          e.isInvulnerablePhaseGate = false;
          this.phaseLockPillars = this.phaseLockPillars.filter((p) => p.bossId !== e.id);
          audio.staggerBreak();
          this.vfx.spawnShockwave(e.x, e.y, 58, '#fde047', 0.36);
          this.spawnFloatingText(e.x, e.y - 26, '🔓 TRIAL SURVIVED! BARRIER DOWN!', '#fde047', 1.24);
          this.pushToast('🔓 12-Second Phase-Gate Trial survived! Boss is vulnerable again!', 'gold');
        }
      }
    }

    // Shrinking "Ring of Cataclysm" Arena Perimeter Burn (15% P1 / 30% P2 / 45% P3)
    const ring = this.getCataclysmRingBounds();
    if (ring.active && !this.dragonController.mount.active) {
      const p = this.player;
      const inAegis =
        this.dragonController.aegisDome.active &&
        Math.hypot(p.x - this.dragonController.aegisDome.x, p.y - this.dragonController.aegisDome.y) <=
          this.dragonController.aegisDome.radius + 4;
      const outsideSafe = p.x < ring.minX || p.x > ring.maxX || p.y < ring.minY || p.y > ring.maxY;
      if (outsideSafe && p.dodgeTimer <= 0 && !inAegis) {
        this.cataclysmBurnTimer += dt;
        if (this.cataclysmBurnTimer >= 0.55) {
          this.cataclysmBurnTimer = 0;
          const burnDmg = Math.max(8, Math.round(p.maxHp * 0.09));
          this.damagePlayer(burnDmg, 304, 192, { trueDamage: true, ignoreInvuln: true });
          this.spawnParticles(p.x, p.y, ring.isDragon ? '#f97316' : '#c084fc', 10, 65);
          this.spawnFloatingText(p.x, p.y - 22, '🔥 CATACLYSM BURN!', '#fb923c', 1.0);
        }
      } else {
        this.cataclysmBurnTimer = Math.max(0, this.cataclysmBurnTimer - dt * 2);
      }
    }
  }

  private updateEnemies(dt: number) {
    const grid = this.currentWorld.grid;
    const p = this.player;
    const biomeId = this.currentWorld.act.biomeId;

    for (const e of this.enemies) {
      const eDt = dt * this.biomeMechanics.getEnemyTimeScale(e.x, e.y);
      if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
      if (e.attackCooldown > 0) e.attackCooldown = Math.max(0, e.attackCooldown - eDt);
      if ((e.counterStanceTimer ?? 0) > 0) e.counterStanceTimer = Math.max(0, (e.counterStanceTimer ?? 0) - dt);
      if ((e.counterCooldown ?? 0) > 0) e.counterCooldown = Math.max(0, (e.counterCooldown ?? 0) - dt);
      if (e.isInvulnerablePhaseGate) continue;

      e.vx *= Math.pow(0.0015, dt);
      e.vy *= Math.pow(0.0015, dt);

      // Periodic Tactical Counter Stance for Bosses & Dog Warriors when Nyx presses close in melee
      const canPeriodicCounter =
        (e.isBoss || e.isMiniBoss || e.isWolfCaptain || e.kind === 'hound_scout' || e.kind === 'shadow_wolf') &&
        (!isDragonBossEnemy(e) || ensureDragonState(e).altitude !== 'sky');
      if (
        canPeriodicCounter &&
        (e.stunTimer ?? 0) <= 0 &&
        (e.counterStanceTimer ?? 0) <= 0 &&
        (e.counterCooldown ?? 0) <= 0 &&
        e.state === 'chase' &&
        Math.hypot(p.x - e.x, p.y - e.y) <= 46 &&
        Math.random() < dt * 0.45
      ) {
        e.counterStanceTimer = 0.85;
        e.counterCooldown = e.isBoss ? 5.2 : 6.5;
        audio.counterGuard();
        this.spawnParticles(e.x, e.y, '#fda4af', 10, 65);
        this.spawnFloatingText(e.x, e.y - 20, '🛡️ COUNTER STANCE!', '#fda4af', 1.14);
      }

      // Stagger Break Vulnerability Stun (3.5s)
      if ((e.stunTimer ?? 0) > 0) {
        e.stunTimer = Math.max(0, (e.stunTimer ?? 0) - dt);
        this.moveEntityWithTileCollision(e, e.vx * dt, e.vy * dt, grid);
        if (Math.random() < dt * 6) {
          this.vfx.spawnSingleParticle(
            e.x + (Math.random() - 0.5) * 16,
            e.y - 12 + (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 18,
            -14 - Math.random() * 10,
            '#fde047',
            2,
            0.35
          );
        }
        continue;
      }

      if (e.overdrive && Math.random() < dt * 5) {
        this.vfx.spawnSingleParticle(
          e.x + (Math.random() - 0.5) * 18,
          e.y + (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 20,
          -22 - Math.random() * 14,
          Math.random() < 0.5 ? '#f97316' : '#ef4444',
          2,
          0.35
        );
      }

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      const nx = dist > 0.1 ? dx / dist : 0;
      const ny = dist > 0.1 ? dy / dist : 1;

      if (Math.abs(dx) >= Math.abs(dy)) e.facing = dx >= 0 ? 'right' : 'left';
      else e.facing = dy >= 0 ? 'down' : 'up';

      e.animTimer += eDt;
      if (e.animTimer >= 0.2) {
        e.animTimer = 0;
        e.animFrame = (e.animFrame + 1) % 2;
      }

      if (isDragonBossEnemy(e)) {
        // Handled by bespoke DragonBossController.updateAll()
        continue;
      }
      if (e.archetype === 'fenrir_p1') {
        this.updateFenrirP1(e, eDt, dist, nx, ny, grid);
        continue;
      }
      if (e.archetype === 'fenrir_p2') {
        this.updateFenrirP2(e, eDt, dist, nx, ny, grid);
        continue;
      }
      if (e.archetype === 'warlord') {
        this.updateWarlord(e, eDt, dist, nx, ny, grid);
        continue;
      }
      if (e.archetype === 'bear') {
        this.updateBear(e, eDt, dist, nx, ny, grid, biomeId === 5);
        continue;
      }
      if (e.archetype === 'hydra') {
        this.updateHydra(e, eDt, dist, nx, ny, grid);
        continue;
      }
      if (e.archetype === 'mage') {
        this.updateBossMage(e, eDt, dist, nx, ny, grid, biomeId === 6);
        continue;
      }

      // Standard archetypes: grunt, ranged, charger (strictly use bridge-aware dry pathing!)
      const aggroRange = e.kind === 'shadow_wolf' ? 320 : 185;
      if (e.state === 'idle') {
        if (dist < aggroRange) e.state = 'chase';
      } else if (e.state === 'chase') {
        if (e.archetype === 'ranged') {
          if (dist < 64) {
            this.moveEntityWithTileCollision(e, (-nx * e.speed + e.vx) * eDt, (-ny * e.speed + e.vy) * eDt, grid);
          } else if (dist > 120) {
            this.moveUnitTowardWithBridgePathing(e, p.x, p.y, e.speed, eDt, grid, e.vx, e.vy);
          }
          if (e.attackCooldown <= 0 && dist < 185) {
            e.state = 'windup';
            e.windupDuration = 0.42;
            e.stateTimer = 0.42;
            e.chargeDirX = nx;
            e.chargeDirY = ny;
          }
        } else if (e.archetype === 'charger' && dist < 120 && e.attackCooldown <= 0) {
          e.state = 'windup';
          e.windupDuration = 0.46;
          e.stateTimer = 0.46;
          e.chargeDirX = nx;
          e.chargeDirY = ny;
        } else {
          this.moveUnitTowardWithBridgePathing(e, p.x, p.y, e.speed, eDt, grid, e.vx, e.vy);
          if (dist < 32 && e.attackCooldown <= 0) {
            e.state = 'windup';
            e.windupDuration = 0.36;
            e.stateTimer = 0.36;
            e.chargeDirX = nx;
            e.chargeDirY = ny;
          }
        }
      } else if (e.state === 'windup') {
        e.stateTimer -= eDt;
        if (e.stateTimer <= 0) {
          if (e.archetype === 'ranged') {
            const pKind: Projectile['kind'] =
              e.kind === 'lava_salamander'
                ? 'fireball'
                : e.kind === 'sporeling'
                ? 'poison'
                : e.kind === 'celestial_sentinel'
                ? 'gem_shard'
                : 'arrow';
            const color =
              pKind === 'fireball'
                ? '#ea580c'
                : pKind === 'poison'
                ? '#84cc16'
                : pKind === 'gem_shard'
                ? '#818cf8'
                : '#b45309';
            this.projectiles.push({
              id: `pr_${Date.now()}_${Math.random()}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: e.chargeDirX * 140,
              vy: e.chargeDirY * 140,
              radius: 4,
              damage: e.atk,
              life: 1.5,
              maxLife: 1.5,
              color,
              coreColor: '#fef9c3',
              kind: pKind,
            });
            e.state = 'chase';
            e.attackCooldown = 1.5;
          } else {
            e.state = 'charge';
            e.stateTimer = e.archetype === 'charger' ? 0.44 : 0.22;
          }
        }
      } else if (e.state === 'charge') {
        e.stateTimer -= eDt;
        const speed = e.archetype === 'charger' ? 155 : 120;
        this.moveEntityWithTileCollision(e, e.chargeDirX * speed * eDt, e.chargeDirY * speed * eDt, grid);
        if (e.stateTimer <= 0) {
          e.state = 'chase';
          e.attackCooldown = 1.45;
        }
      }

      if (dist < (e.width + p.width) * 0.48) {
        this.damagePlayer(e.atk, e.x, e.y);
      }
    }

    // Boids Separation Steering (22px radius) so two enemy animals never overlap on the exact same tile!
    for (let i = 0; i < this.enemies.length; i++) {
      const a = this.enemies[i];
      let sepX = 0;
      let sepY = 0;
      for (let j = 0; j < this.enemies.length; j++) {
        if (i === j) continue;
        const b = this.enemies[j];
        const sdx = a.x - b.x;
        const sdy = a.y - b.y;
        const sdist = Math.hypot(sdx, sdy);
        if (sdist < 22) {
          const push = ((22 - sdist) / 22) * 38;
          if (sdist > 0.05) {
            sepX += (sdx / sdist) * push;
            sepY += (sdy / sdist) * push;
          } else {
            const ang = (i * 2.39996) % (Math.PI * 2);
            sepX += Math.cos(ang) * push;
            sepY += Math.sin(ang) * push;
          }
        }
      }
      if (sepX !== 0 || sepY !== 0) {
        this.moveEntityWithTileCollision(a, sepX * dt, sepY * dt, grid);
      }
    }
  }

  private updateWarlord(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[]) {
    if (e.state === 'idle') {
      if (dist < 190) {
        e.state = 'chase';
        audio.bossRoar();
      }
      return;
    }
    if (e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0 && dist < 155) {
        e.state = 'windup';
        e.windupDuration = 0.52;
        e.stateTimer = 0.52;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 3;
        if (e.attackPatternIndex === 2 && this.enemies.length < 5) {
          const dryG = findNearestDryTile(
            grid,
            Math.max(48, Math.min(540, e.x + (Math.random() - 0.5) * 60)),
            Math.max(48, Math.min(320, e.y + (Math.random() - 0.5) * 60)),
            false
          );
          this.enemies.push(spawnEnemy(`war_sum_${Date.now()}`, 'goblin_grunt', dryG.x, dryG.y, this.currentAct, this.nightmareMode));
          this.spawnParticles(dryG.x, dryG.y, '#22c55e', 12, 50);
          this.spawnFloatingText(e.x, e.y - 18, 'REINFORCEMENTS!', '#4ade80');
        } else {
          this.shake(0.22, 4);
          audio.bossRoar();
          for (let i = 0; i < 8; i++) {
            const ang = (Math.PI * 2 * i) / 8;
            this.projectiles.push({
              id: `war_sw_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * 120,
              vy: Math.sin(ang) * 120,
              radius: 4.5,
              damage: e.atk,
              life: 1.25,
              maxLife: 1.25,
              color: '#ea580c',
              coreColor: '#fde047',
              kind: 'shockwave',
            });
          }
        }
        e.state = 'chase';
        e.attackCooldown = 1.85;
      }
    }
    if (dist < (e.width + this.player.width) * 0.5) this.damagePlayer(e.atk, e.x, e.y);
  }

  private updateBear(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[], isFrost: boolean) {
    if (e.state === 'idle') {
      if (dist < 190) {
        e.state = 'chase';
        audio.bossRoar();
      }
      return;
    }
    if (e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0 && dist < 170) {
        e.state = 'windup';
        e.windupDuration = 0.48;
        e.stateTimer = 0.48;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 2;
        if (e.attackPatternIndex === 0) {
          e.state = 'charge';
          e.stateTimer = 0.55;
          audio.bossRoar();
        } else {
          const baseAng = Math.atan2(ny, nx);
          for (let i = -2; i <= 2; i++) {
            const a = baseAng + i * 0.24;
            this.projectiles.push({
              id: `br_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(a) * 140,
              vy: Math.sin(a) * 140,
              radius: 4.5,
              damage: Math.round(e.atk * 0.85),
              life: 1.45,
              maxLife: 1.45,
              color: isFrost ? '#38bdf8' : '#15803d',
              coreColor: isFrost ? '#e0f2fe' : '#a3e635',
              kind: isFrost ? 'ice_shard' : 'thorn',
            });
          }
          e.state = 'chase';
          e.attackCooldown = 1.7;
        }
      }
    } else if (e.state === 'charge') {
      e.stateTimer -= dt;
      this.moveEntityWithTileCollision(e, e.chargeDirX * 170 * dt, e.chargeDirY * 170 * dt, grid);
      if (e.stateTimer <= 0) {
        e.state = 'chase';
        e.attackCooldown = 1.55;
      }
    }
    if (dist < (e.width + this.player.width) * 0.5) this.damagePlayer(e.atk, e.x, e.y);
  }

  private updateHydra(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[]) {
    if (e.state === 'idle') {
      if (dist < 195) {
        e.state = 'chase';
        audio.bossRoar();
      }
      return;
    }
    if (e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0 && dist < 195) {
        e.state = 'windup';
        e.windupDuration = 0.45;
        e.stateTimer = 0.45;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 3;
        if (e.attackPatternIndex === 0) {
          const baseAng = Math.atan2(ny, nx);
          for (let i = -1; i <= 1; i++) {
            const a = baseAng + i * 0.28;
            this.projectiles.push({
              id: `hy_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(a) * 145,
              vy: Math.sin(a) * 145,
              radius: 5,
              damage: e.atk,
              life: 1.6,
              maxLife: 1.6,
              color: '#65a30d',
              coreColor: '#d9f99d',
              kind: 'poison',
            });
          }
          e.state = 'chase';
          e.attackCooldown = 1.55;
        } else if (e.attackPatternIndex === 1) {
          e.state = 'charge';
          e.stateTimer = 0.48;
          audio.bossRoar();
        } else {
          this.hazards.push({
            id: `hy_pool_${Date.now()}`,
            x: this.player.x,
            y: this.player.y,
            radius: 22,
            life: 4.5,
            kind: 'poison',
            damagePerSec: e.atk,
          });
          e.state = 'chase';
          e.attackCooldown = 1.65;
        }
      }
    } else if (e.state === 'charge') {
      e.stateTimer -= dt;
      this.moveEntityWithTileCollision(e, e.chargeDirX * 180 * dt, e.chargeDirY * 180 * dt, grid);
      if (e.stateTimer <= 0) {
        e.state = 'chase';
        e.attackCooldown = 1.45;
      }
    }
    if (dist < (e.width + this.player.width) * 0.5) this.damagePlayer(e.atk, e.x, e.y);
  }

  private updateBossMage(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[], isVolcano: boolean) {
    if (e.state === 'idle') {
      if (dist < 195) {
        e.state = 'chase';
        audio.bossRoar();
      }
      return;
    }
    if (e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0 && dist < 200) {
        e.state = 'windup';
        e.windupDuration = 0.48;
        e.stateTimer = 0.48;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 3;
        if (e.attackPatternIndex === 0) {
          // 8-way Elemental Nova (every 4th orb is a Reflectable Green Arcane Orb!)
          audio.laserBeam();
          for (let i = 0; i < 8; i++) {
            const ang = this.globalTime + (Math.PI * 2 * i) / 8;
            const isReflectable = i % 4 === 0;
            this.projectiles.push({
              id: `mg_n_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * (isReflectable ? 105 : 130),
              vy: Math.sin(ang) * (isReflectable ? 105 : 130),
              radius: isReflectable ? 5.5 : 4.5,
              damage: Math.round(e.atk * 0.9),
              life: 1.8,
              maxLife: 1.8,
              color: isReflectable ? '#4ade80' : isVolcano ? '#f97316' : e.kind === 'mycora' ? '#c026d3' : '#6366f1',
              coreColor: isReflectable ? '#fef08a' : '#fef9c3',
              kind: isVolcano ? 'fireball' : 'gem_shard',
              reflectable: isReflectable,
            });
          }
        } else if (e.attackPatternIndex === 1) {
          this.hazards.push({
            id: `mg_met_${Date.now()}`,
            x: this.player.x,
            y: this.player.y,
            radius: 26,
            life: 0.95,
            kind: 'meteor_warn',
            damagePerSec: e.atk * 1.15,
            triggered: false,
          });
        } else {
          e.state = 'charge';
          e.stateTimer = 0.44;
          audio.bossRoar();
          return;
        }
        e.state = 'chase';
        e.attackCooldown = 1.6;
      }
    } else if (e.state === 'charge') {
      e.stateTimer -= dt;
      this.moveEntityWithTileCollision(e, e.chargeDirX * 175 * dt, e.chargeDirY * 175 * dt, grid);
      if (e.stateTimer <= 0) {
        e.state = 'chase';
        e.attackCooldown = 1.45;
      }
    }
    if (dist < (e.width + this.player.width) * 0.5) this.damagePlayer(e.atk, e.x, e.y);
  }

  private triggerFinalBossSpecialSkill(e: Enemy) {
    const skillIdx = (e.specialSkillIndex ?? 0) % 4;
    e.specialSkillIndex = skillIdx + 1;
    e.specialSkillCooldown = e.overdrive ? 6.2 : 7.8;

    audio.bossRoar();
    this.shake(0.42, 5.2);

    if (skillIdx === 0) {
      // SPECIAL SKILL 1: ECLIPSE DOOMSDAY SUPERNOVA!
      this.spawnFloatingText(e.x, e.y - 26, '🌑 SPECIAL SKILL: ECLIPSE DOOMSDAY SUPERNOVA!', '#c084fc', 1.28);
      this.pushToast(
        '🌑 BOSS SPECIAL SKILL: Eclipse Doomsday Supernova! Dodge the 16-Orb Void Ring & Meteor Shockwaves!',
        'amber'
      );
      this.spawnParticles(e.x, e.y, '#a855f7', 36, 135);
      for (let i = 0; i < 16; i++) {
        const ang = (Math.PI * 2 * i) / 16 + this.globalTime * 0.5;
        const isReflectable = i % 4 === 0;
        this.projectiles.push({
          id: `spec_nova_${Date.now()}_${i}`,
          fromPlayer: false,
          x: e.x,
          y: e.y,
          vx: Math.cos(ang) * (isReflectable ? 95 : 135),
          vy: Math.sin(ang) * (isReflectable ? 95 : 135),
          radius: isReflectable ? 6.5 : 5.5,
          damage: Math.round(e.atk * 1.15),
          life: 2.3,
          maxLife: 2.3,
          color: isReflectable ? '#4ade80' : '#c084fc',
          coreColor: isReflectable ? '#fef08a' : '#f5d0fe',
          kind: 'gem_laser',
          reflectable: isReflectable,
          applyMortalWound: true,
        });
      }
      for (let m = 0; m < 4; m++) {
        const ma = (Math.PI * 2 * m) / 4 + this.globalTime;
        this.hazards.push({
          id: `spec_met_${Date.now()}_${m}`,
          x: Math.max(110, Math.min(498, this.player.x + Math.cos(ma) * 44)),
          y: Math.max(80, Math.min(300, this.player.y + Math.sin(ma) * 44)),
          radius: 26,
          life: 0.95,
          kind: 'meteor_warn',
          damagePerSec: e.atk * 1.25,
          triggered: false,
          applyMortalWound: true,
        });
      }
    } else if (skillIdx === 1) {
      // SPECIAL SKILL 2: PHANTOM OMNI-SLASH BLITZ!
      this.spawnFloatingText(e.x, e.y - 26, '⚡ SPECIAL SKILL: PHANTOM OMNI-SLASH BLITZ!', '#38bdf8', 1.28);
      this.pushToast('⚡ BOSS SPECIAL SKILL: Phantom Omni-Slash Blitz! Watch for Shadow-Step & X-Lightning Rifts!', 'cyan');
      this.spawnParticles(e.x, e.y, '#38bdf8', 28, 120);
      const stepAng = Math.random() * Math.PI * 2;
      e.x = Math.max(120, Math.min(488, this.player.x + Math.cos(stepAng) * 58));
      e.y = Math.max(88, Math.min(290, this.player.y + Math.sin(stepAng) * 58));
      snapEntityToDryLand(e, this.currentWorld.grid, TILE_SIZE, false);
      this.spawnParticles(e.x, e.y, '#38bdf8', 28, 120);
      const px = this.player.x;
      const py = this.player.y;
      this.hazards.push({
        id: `spec_xlit1_${Date.now()}`,
        x: px - 75,
        y: py - 75,
        x2: px + 75,
        y2: py + 75,
        radius: 11,
        life: 0.9,
        kind: 'lightning_line',
        damagePerSec: e.atk * 1.15,
        triggered: false,
        applyMortalWound: true,
      });
      this.hazards.push({
        id: `spec_xlit2_${Date.now()}`,
        x: px - 75,
        y: py + 75,
        x2: px + 75,
        y2: py - 75,
        radius: 11,
        life: 0.9,
        kind: 'lightning_line',
        damagePerSec: e.atk * 1.15,
        triggered: false,
        applyMortalWound: true,
      });
    } else if (skillIdx === 2) {
      // SPECIAL SKILL 3: TRI-ELEMENTAL APOCALYPSE BEAM & GRAVITY VORTEX!
      this.spawnFloatingText(e.x, e.y - 26, '☄️ SPECIAL SKILL: TRI-ELEMENTAL APOCALYPSE!', '#fde047', 1.28);
      this.pushToast(
        '☄️ BOSS SPECIAL SKILL: Tri-Elemental Apocalypse Beam! Solar Gold, Glacial Cyan & Void Violet Streams!',
        'gold'
      );
      audio.laserBeam();
      const baseAng = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      const elemColors = ['#fde047', '#38bdf8', '#c084fc'];
      for (let b = 0; b < 3; b++) {
        const beamAng = baseAng + (b - 1) * 0.36;
        for (let step = 0; step < 5; step++) {
          const isRef = step === 4 && b === 1;
          this.projectiles.push({
            id: `spec_tri_${Date.now()}_${b}_${step}`,
            fromPlayer: false,
            x: e.x,
            y: e.y,
            vx: Math.cos(beamAng) * (120 + step * 24),
            vy: Math.sin(beamAng) * (120 + step * 24),
            radius: isRef ? 6.5 : 5.5,
            damage: Math.round(e.atk * 1.1),
            life: 2.1,
            maxLife: 2.1,
            color: isRef ? '#4ade80' : elemColors[b],
            coreColor: '#ffffff',
            kind: 'lightning_orb',
            reflectable: isRef,
            applyMortalWound: true,
          });
        }
      }
    } else {
      // SPECIAL SKILL 4: BLOOD-MOON SOUL SIPHON & ROYAL PACK CALL!
      this.spawnFloatingText(e.x, e.y - 26, '🩸 SPECIAL SKILL: BLOOD-MOON SOUL SIPHON!', '#f43f5e', 1.28);
      this.pushToast('🩸 BOSS SPECIAL SKILL: Blood-Moon Soul Siphon! Destroy or outrun the Homing Blood Orbs!', 'amber');
      for (let k = 0; k < 4; k++) {
        const a = (Math.PI * 2 * k) / 4;
        this.projectiles.push({
          id: `spec_blood_${Date.now()}_${k}`,
          fromPlayer: false,
          x: e.x + Math.cos(a) * 18,
          y: e.y + Math.sin(a) * 18,
          vx: Math.cos(a) * 105,
          vy: Math.sin(a) * 105,
          radius: 5.5,
          damage: Math.round(e.atk * 1.05),
          life: 2.8,
          maxLife: 2.8,
          color: '#f43f5e',
          coreColor: '#fecdd3',
          kind: 'gem_shard',
          homing: true,
          reflectable: k === 0,
          applyMortalWound: true,
        });
      }
    }
  }

  private updateFenrirP1(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[]) {
    if (e.shielded) {
      e.x = 304 + Math.sin(this.globalTime * 2) * 18;
      e.y = 112 + Math.cos(this.globalTime * 1.5) * 6;
      return;
    }

    e.specialSkillCooldown = (e.specialSkillCooldown ?? 5.5) - dt;
    if (e.specialSkillCooldown <= 0 && (e.stunTimer ?? 0) <= 0) {
      this.triggerFinalBossSpecialSkill(e);
    }

    if (e.state === 'idle' || e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0) {
        e.state = 'windup';
        e.windupDuration = 0.4;
        e.stateTimer = 0.4;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 3;
        if (e.attackPatternIndex === 0) {
          // ACT 41 / ACT 82: Twin Rotating Starlight Scythe-Lasers!
          audio.laserBeam();
          const base = Math.atan2(ny, nx);
          for (let side = 0; side < 2; side++) {
            const beamAng = base + side * Math.PI + Math.sin(this.globalTime * 3) * 0.35;
            this.hazards.push({
              id: `fn_scythe_${Date.now()}_${side}`,
              x: e.x,
              y: e.y,
              x2: e.x + Math.cos(beamAng) * 190,
              y2: e.y + Math.sin(beamAng) * 190,
              radius: 12,
              life: 0.85,
              kind: 'lightning_line',
              damagePerSec: Math.round(e.atk * 1.15),
              triggered: false,
              applyMortalWound: true,
            });
          }
          for (let i = 0; i < 4; i++) {
            const speed = 155 + i * 28;
            const isReflectable = i === 3;
            this.projectiles.push({
              id: `fn_las_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(base) * (isReflectable ? 125 : speed),
              vy: Math.sin(base) * (isReflectable ? 125 : speed),
              radius: isReflectable ? 6 : 5.5,
              damage: e.atk,
              life: 1.8,
              maxLife: 1.8,
              color: isReflectable ? '#4ade80' : '#a855f7',
              coreColor: isReflectable ? '#fef08a' : '#f5d0fe',
              kind: 'gem_laser',
              reflectable: isReflectable,
              applyMortalWound: true,
            });
          }
          e.state = 'chase';
          e.attackCooldown = 1.2;
        } else if (e.attackPatternIndex === 1) {
          // Cross-Arena Cavalry Stampede (Act 82) OR Shadow-Step Homing Volley
          if (this.currentAct === 82) {
            this.spawnFloatingText(e.x, e.y - 22, '🐺 CAVALRY STAMPEDE!', '#f43f5e', 1.16);
            for (let lane = -1; lane <= 1; lane++) {
              const ly = Math.max(88, Math.min(294, this.player.y + lane * 44));
              this.hazards.push({
                id: `cav_stmp_${Date.now()}_${lane}`,
                x: 96,
                y: ly,
                x2: 512,
                y2: ly,
                radius: 13,
                life: 0.9,
                kind: 'lightning_line',
                damagePerSec: Math.round(e.atk * 1.2),
                triggered: false,
                applyMortalWound: true,
              });
            }
          }
          const spots = [
            { x: 170, y: 120 },
            { x: 438, y: 120 },
            { x: 304, y: 245 },
            { x: 304, y: 106 },
          ];
          const pick = spots[Math.floor(Math.random() * spots.length)];
          this.spawnParticles(e.x, e.y, '#c084fc', 16, 80);
          e.x = pick.x;
          e.y = pick.y;
          this.spawnParticles(e.x, e.y, '#c084fc', 16, 80);
          for (let k = -1; k <= 1; k++) {
            const a = Math.atan2(this.player.y - e.y, this.player.x - e.x) + k * 0.42;
            const isRef = k === 0;
            this.projectiles.push({
              id: `fn_hom_${Date.now()}_${k}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(a) * 118,
              vy: Math.sin(a) * 118,
              radius: 5,
              damage: Math.round(e.atk * 0.9),
              life: 2.5,
              maxLife: 2.5,
              color: isRef ? '#4ade80' : '#ec4899',
              coreColor: '#fbcfe8',
              kind: 'gem_shard',
              homing: true,
              reflectable: isRef,
              applyMortalWound: true,
            });
          }
          e.state = 'chase';
          e.attackCooldown = 1.2;
        } else {
          // 3-Hit Tracking Wolf-Claw Dash Combo!
          e.state = 'charge';
          e.dashComboRemaining = 3;
          e.stateTimer = 0.34;
          audio.bossRoar();
          this.spawnFloatingText(e.x, e.y - 22, '🐾 3-HIT CLAW DASH!', '#ef4444', 1.15);
        }
      }
    } else if (e.state === 'charge') {
      e.stateTimer -= dt;
      this.moveEntityWithTileCollision(e, e.chargeDirX * 215 * dt, e.chargeDirY * 215 * dt, grid);
      if (e.stateTimer <= 0) {
        // Drop delayed exploding Crystal Mine along dash path!
        this.hazards.push({
          id: `fn_mine_${Date.now()}_${Math.random()}`,
          x: e.x,
          y: e.y,
          radius: 25,
          life: 1.0,
          kind: 'meteor_warn',
          damagePerSec: Math.round(e.atk * 1.15),
          triggered: false,
          applyMortalWound: true,
        });
        const rem = (e.dashComboRemaining ?? 1) - 1;
        e.dashComboRemaining = rem;
        if (rem > 0) {
          // Re-aim at Nyx for next tracking claw dash!
          const dLen = Math.max(1, Math.hypot(this.player.x - e.x, this.player.y - e.y));
          e.chargeDirX = (this.player.x - e.x) / dLen;
          e.chargeDirY = (this.player.y - e.y) / dLen;
          e.stateTimer = 0.32;
          audio.bossRoar();
        } else {
          e.state = 'chase';
          e.attackCooldown = 1.2;
        }
      }
    }

    if (dist < (e.width + this.player.width) * 0.5) {
      this.damagePlayer(e.atk, e.x, e.y, { applyMortalWound: e.state === 'charge' });
    }
  }

  private updateFenrirP2(e: Enemy, dt: number, dist: number, nx: number, ny: number, grid: string[]) {
    e.specialSkillCooldown = (e.specialSkillCooldown ?? 5.2) - dt;
    if (e.specialSkillCooldown <= 0 && (e.stunTimer ?? 0) <= 0) {
      this.triggerFinalBossSpecialSkill(e);
    }

    if (e.state === 'chase') {
      this.moveUnitTowardWithBridgePathing(e, this.player.x, this.player.y, e.speed, dt, grid, e.vx, e.vy);
      if (e.attackCooldown <= 0) {
        e.state = 'windup';
        e.windupDuration = 0.42;
        e.stateTimer = 0.42;
        e.chargeDirX = nx;
        e.chargeDirY = ny;
      }
    } else if (e.state === 'windup') {
      e.stateTimer -= dt;
      if (e.stateTimer <= 0) {
        e.attackPatternIndex = (e.attackPatternIndex + 1) % 4;
        if (e.attackPatternIndex === 0) {
          audio.laserBeam();
          const offset = this.globalTime;
          // Rotating Tri-Elemental Apocalypse Beams (Act 82) or Twin Scythe-Lasers (Act 41)
          const beamCount = this.currentAct === 82 ? 3 : 2;
          for (let b = 0; b < beamCount; b++) {
            const beamAng = offset + (Math.PI * 2 * b) / beamCount;
            this.hazards.push({
              id: `fn2_rot_${Date.now()}_${b}`,
              x: e.x,
              y: e.y,
              x2: e.x + Math.cos(beamAng) * 195,
              y2: e.y + Math.sin(beamAng) * 195,
              radius: 12,
              life: 0.85,
              kind: 'lightning_line',
              damagePerSec: Math.round(e.atk * 1.2),
              triggered: false,
              applyMortalWound: true,
            });
          }
          for (let i = 0; i < 12; i++) {
            const ang = offset + (Math.PI * 2 * i) / 12;
            const isReflectable = i % 4 === 0;
            this.projectiles.push({
              id: `fn2_nov_${Date.now()}_${i}`,
              fromPlayer: false,
              x: e.x,
              y: e.y,
              vx: Math.cos(ang) * (isReflectable ? 105 : 132),
              vy: Math.sin(ang) * (isReflectable ? 105 : 132),
              radius: isReflectable ? 6 : 5,
              damage: Math.round(e.atk * 0.95),
              life: 2.2,
              maxLife: 2.2,
              color: isReflectable ? '#4ade80' : '#38bdf8',
              coreColor: isReflectable ? '#fef08a' : '#e0f2fe',
              kind: 'lightning_orb',
              reflectable: isReflectable,
              applyMortalWound: true,
            });
          }
        } else if (e.attackPatternIndex === 1) {
          this.shake(0.25, 4);
          if (this.currentAct === 82) {
            // Cross-Arena Cavalry Stampedes + Homing Shadow-Spears!
            this.spawnFloatingText(e.x, e.y - 22, '🐎 RAGNAROK CAVALRY STAMPEDE!', '#ef4444', 1.18);
            for (let lane = -1; lane <= 1; lane++) {
              const ly = Math.max(92, Math.min(286, this.player.y + lane * 40));
              this.hazards.push({
                id: `rag_cav_${Date.now()}_${lane}`,
                x: 112,
                y: ly,
                x2: 496,
                y2: ly,
                radius: 13,
                life: 0.9,
                kind: 'lightning_line',
                damagePerSec: Math.round(e.atk * 1.25),
                triggered: false,
                applyMortalWound: true,
              });
            }
            for (let s = -1; s <= 1; s++) {
              const a = Math.atan2(ny, nx) + s * 0.45;
              this.projectiles.push({
                id: `rag_spr_${Date.now()}_${s}`,
                fromPlayer: false,
                x: e.x,
                y: e.y,
                vx: Math.cos(a) * 120,
                vy: Math.sin(a) * 120,
                radius: 5.5,
                damage: Math.round(e.atk * 1.05),
                life: 2.6,
                maxLife: 2.6,
                color: s === 0 ? '#4ade80' : '#f43f5e',
                coreColor: '#ffffff',
                kind: 'gem_shard',
                homing: true,
                reflectable: s === 0,
                applyMortalWound: true,
              });
            }
          } else {
            this.hazards.push({
              id: `fn2_met_${Date.now()}`,
              x: this.player.x,
              y: this.player.y,
              radius: 28,
              life: 0.95,
              kind: 'meteor_warn',
              damagePerSec: e.atk * 1.2,
              triggered: false,
              applyMortalWound: true,
            });
            this.hazards.push({
              id: `fn2_lit_${Date.now()}`,
              x: e.x,
              y: e.y,
              x2: this.player.x + nx * 90,
              y2: this.player.y + ny * 90,
              radius: 10,
              life: 0.85,
              kind: 'lightning_line',
              damagePerSec: e.atk,
              triggered: false,
              applyMortalWound: true,
            });
          }
        } else if (e.attackPatternIndex === 2) {
          if (this.enemies.length < 6) {
            const sp1 = findNearestDryTile(grid, Math.max(140, Math.min(468, e.x - 45)), e.y + 20, false);
            const sp2 = findNearestDryTile(grid, Math.max(140, Math.min(468, e.x + 45)), e.y + 20, false);
            this.enemies.push(spawnEnemy(`sw_${Date.now()}_1`, 'shadow_wolf', sp1.x, sp1.y, this.currentAct, this.nightmareMode));
            this.enemies.push(spawnEnemy(`sw_${Date.now()}_2`, 'shadow_wolf', sp2.x, sp2.y, this.currentAct, this.nightmareMode));
            this.spawnFloatingText(e.x, e.y - 22, 'SHADOW PACK!', '#38bdf8');
          }
        } else {
          // 3-Hit Tracking Wolf-Claw Dash Combo!
          e.state = 'charge';
          e.dashComboRemaining = 3;
          e.stateTimer = 0.36;
          audio.bossRoar();
          this.spawnFloatingText(e.x, e.y - 22, '🐾 3-HIT CLAW BLITZ!', '#ef4444', 1.15);
          return;
        }
        e.state = 'chase';
        e.attackCooldown = 1.2;
      }
    } else if (e.state === 'charge') {
      e.stateTimer -= dt;
      this.moveEntityWithTileCollision(e, e.chargeDirX * 225 * dt, e.chargeDirY * 225 * dt, grid);
      if (e.stateTimer <= 0) {
        this.hazards.push({
          id: `fn2_mine_${Date.now()}_${Math.random()}`,
          x: e.x,
          y: e.y,
          radius: 26,
          life: 1.0,
          kind: 'meteor_warn',
          damagePerSec: Math.round(e.atk * 1.2),
          triggered: false,
          applyMortalWound: true,
        });
        const rem = (e.dashComboRemaining ?? 1) - 1;
        e.dashComboRemaining = rem;
        if (rem > 0) {
          const dLen = Math.max(1, Math.hypot(this.player.x - e.x, this.player.y - e.y));
          e.chargeDirX = (this.player.x - e.x) / dLen;
          e.chargeDirY = (this.player.y - e.y) / dLen;
          e.stateTimer = 0.34;
          audio.bossRoar();
        } else {
          e.state = 'chase';
          e.attackCooldown = 1.2;
        }
      }
    }

    if (dist < (e.width + this.player.width) * 0.48) {
      this.damagePlayer(e.atk, e.x, e.y, { applyMortalWound: e.state === 'charge' });
    }
  }

  private updateProjectiles(dt: number) {
    const grid = this.currentWorld.grid;
    const next: Projectile[] = [];

    for (const pr of this.projectiles) {
      pr.life -= dt;
      if (pr.life <= 0) continue;

      if (pr.homing && !pr.fromPlayer) {
        const dx = this.player.x - pr.x;
        const dy = this.player.y - pr.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        pr.vx += (dx / d) * 140 * dt;
        pr.vy += (dy / d) * 140 * dt;
        const sp = Math.hypot(pr.vx, pr.vy);
        if (sp > 115) {
          pr.vx = (pr.vx / sp) * 115;
          pr.vy = (pr.vy / sp) * 115;
        }
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      const tx = Math.floor(pr.x / TILE_SIZE);
      const ty = Math.floor(pr.y / TILE_SIZE);
      if (isTileSolid(grid, tx, ty) && pr.kind !== 'sword_beam') {
        this.spawnParticles(pr.x, pr.y, pr.color, 4, 40);
        continue;
      }

      let consumed = false;
      if (pr.fromPlayer) {
        for (const pillar of this.phaseLockPillars) {
          if (pillar.hp > 0 && Math.hypot(pillar.x - pr.x, pillar.y - pr.y) < pr.radius + 13) {
            this.damagePhaseLockPillar(pillar, Math.max(80, pr.damage));
            if (!pr.pierce) {
              consumed = true;
              break;
            }
          }
        }
        if (!consumed) {
          for (const ob of this.siphonObelisks) {
            if (ob.hp > 0 && Math.hypot(ob.x - pr.x, ob.y - pr.y) < pr.radius + 13) {
              this.damageSiphonObelisk(ob, Math.max(80, pr.damage));
              if (!pr.pierce) {
                consumed = true;
                break;
              }
            }
          }
        }
        if (!consumed) {
          if (
            this.biomeMechanics.handleProjectileHit(
              pr.x,
              pr.y,
              pr.radius,
              this.enemies,
              this.getBiomeCallbacks()
            ) &&
            !pr.pierce
          ) {
            consumed = true;
          }
        }
        if (!consumed) {
          for (const e of [...this.enemies]) {
            if (isDragonBossEnemy(e) && ensureDragonState(e).altitude === 'sky' && !pr.reflectable) {
              continue;
            }
            if (Math.hypot(e.x - pr.x, e.y - pr.y) < pr.radius + e.width * 0.5) {
              this.damageEnemy(
                e,
                pr.damage,
                this.getTotalStats().crit,
                pr.vx > 0 ? 1 : -1,
                0,
                Boolean(pr.reflectable),
                pr.reflectable ? 45 : 8
              );
              if (!pr.pierce) {
                consumed = true;
                break;
              }
            }
          }
        }
      } else {
        if (Math.hypot(this.player.x - pr.x, this.player.y - pr.y) < pr.radius + this.player.width * 0.45) {
          this.damagePlayer(pr.damage, pr.x, pr.y, {
            applyMortalWound: Boolean(pr.applyMortalWound),
          });
          consumed = true;
        }
      }

      if (!consumed) next.push(pr);
    }

    this.projectiles = next;
  }

  private updateHazards(dt: number) {
    const next: HazardPool[] = [];
    for (const h of this.hazards) {
      h.life -= dt;
      if (h.kind === 'meteor_warn') {
        if (h.life <= 0.15 && !h.triggered) {
          h.triggered = true;
          this.shake(0.2, 4);
          audio.hitImpact(true);
          this.vfx.spawnBurst(h.x, h.y, this.currentAct >= 83 ? '#f97316' : '#c084fc', 20, 100);
          this.vfx.spawnShockwave(h.x, h.y, h.radius + 10, this.currentAct >= 83 ? '#fde047' : '#c084fc', 0.32);
          this.vfx.spawnDecal(h.x, h.y, this.currentAct >= 83 ? 'ember' : 'void', 4.5);
          if (Math.hypot(this.player.x - h.x, this.player.y - h.y) <= h.radius) {
            this.damagePlayer(h.damagePerSec, h.x, h.y, { applyMortalWound: Boolean(h.applyMortalWound) });
          }
        }
      } else if (h.kind === 'lightning_line') {
        if (h.life <= 0.15 && !h.triggered && h.x2 !== undefined && h.y2 !== undefined) {
          h.triggered = true;
          audio.laserBeam();
          this.vfx.spawnDecal((h.x + h.x2) / 2, (h.y + h.y2) / 2, 'lightning', 3.6);
          const distToSeg = this.pointToSegmentDistance(this.player.x, this.player.y, h.x, h.y, h.x2, h.y2);
          if (distToSeg <= 13) {
            this.damagePlayer(h.damagePerSec, h.x, h.y, { applyMortalWound: Boolean(h.applyMortalWound) });
          }
        }
      } else if (h.kind === 'poison') {
        if (Math.hypot(this.player.x - h.x, this.player.y - h.y) <= h.radius) {
          if (Math.random() < dt * 2.2) {
            this.damagePlayer(Math.round(h.damagePerSec * 0.55), h.x, h.y);
          }
        }
      }
      if (h.life > 0) next.push(h);
    }
    this.hazards = next;
  }

  private updateTraps(dt: number) {
    for (const trap of this.traps) {
      trap.timer += dt;
      if (trap.timer >= trap.cycleTime) {
        trap.timer -= trap.cycleTime;
        trap.firedThisCycle = false;
      }

      const activeStart = trap.cycleTime - trap.activeDuration;
      if (trap.timer >= activeStart) {
        if (trap.kind === 'arrow_turret') {
          if (!trap.firedThisCycle) {
            trap.firedThisCycle = true;
            const dx = trap.dirX ?? 0;
            const dy = trap.dirY ?? 1;
            this.projectiles.push({
              id: `trap_arr_${Date.now()}_${trap.id}`,
              fromPlayer: false,
              x: trap.x + dx * 6,
              y: trap.y + dy * 6,
              vx: dx * 145,
              vy: dy * 145,
              radius: 3.5,
              damage: trap.damage,
              life: 1.5,
              maxLife: 1.5,
              color: '#f59e0b',
              coreColor: '#fef3c7',
              kind: 'arrow',
            });
            this.spawnParticles(trap.x + dx * 6, trap.y + dy * 6, '#fbbf24', 5, 45);
          }
          continue;
        }

        if (!trap.firedThisCycle) {
          trap.firedThisCycle = true;
          const pColor =
            trap.kind === 'flame_geyser'
              ? '#f97316'
              : trap.kind === 'spore_vent'
              ? '#a3e635'
              : trap.kind === 'frost_crystal'
              ? '#38bdf8'
              : trap.kind === 'void_pillar'
              ? '#c084fc'
              : '#cbd5e1';
          this.spawnParticles(trap.x, trap.y, pColor, 10, 65);
          if (trap.kind === 'flame_geyser') this.vfx.spawnDecal(trap.x, trap.y, 'ember', 3.4);
          else if (trap.kind === 'frost_crystal') this.vfx.spawnDecal(trap.x, trap.y, 'frost', 3.4);
          else if (trap.kind === 'spore_vent') this.vfx.spawnDecal(trap.x, trap.y, 'poison', 3.4);
          else if (trap.kind === 'void_pillar') this.vfx.spawnDecal(trap.x, trap.y, 'void', 3.4);

          // Traps can also damage non-boss enemies lured onto them!
          for (const e of [...this.enemies]) {
            if (e.isBoss) continue;
            if (Math.hypot(e.x - trap.x, e.y - trap.y) <= trap.radius + e.width * 0.35) {
              e.hp -= Math.round(trap.damage * 1.25);
              e.hitFlash = 0.14;
              this.spawnFloatingText(e.x, e.y - 12, 'TRAP!', pColor, 0.95);
              if (e.hp <= 0) {
                this.handleEnemyDefeated(e);
              }
            }
          }
        }

        if (Math.hypot(this.player.x - trap.x, this.player.y - trap.y) <= trap.radius + 4) {
          this.damagePlayer(trap.damage, trap.x, trap.y);
        }
      }
    }
  }

  private renderTraps(ctx: CanvasRenderingContext2D) {
    for (const trap of this.traps) {
      const warnStart = trap.cycleTime - trap.warnDuration - trap.activeDuration;
      const activeStart = trap.cycleTime - trap.activeDuration;
      const isWarn = trap.timer >= warnStart && trap.timer < activeStart;
      const isActive = trap.timer >= activeStart;
      const tx = Math.round(trap.x);
      const ty = Math.round(trap.y);

      if (trap.kind === 'spike_trap') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx - 6, ty - 6, 12, 12);
        ctx.strokeStyle = isWarn ? '#f59e0b' : '#475569';
        ctx.strokeRect(tx - 6.5, ty - 6.5, 13, 13);

        const offsets = [
          [-3, -3],
          [3, -3],
          [-3, 3],
          [3, 3],
        ];
        for (const [ox, oy] of offsets) {
          if (isActive) {
            ctx.fillStyle = '#e2e8f0';
            ctx.fillRect(tx + ox - 1, ty + oy - 4, 2, 5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(tx + ox - 1, ty + oy - 4, 2, 1);
          } else if (isWarn) {
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(tx + ox - 1, ty + oy - 1, 2, 2);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(tx + ox - 1, ty + oy - 1, 2, 2);
          }
        }
      } else if (trap.kind === 'flame_geyser') {
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isActive ? '#fef08a' : isWarn ? '#f97316' : '#7c2d12';
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fill();

        if (isWarn) {
          ctx.strokeStyle = 'rgba(249, 115, 22, 0.75)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius * (0.6 + 0.4 * Math.sin(this.globalTime * 16)), 0, Math.PI * 2);
          ctx.stroke();
        } else if (isActive) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.42)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.fillRect(tx - 3, ty - 10, 6, 12);
        }
      } else if (trap.kind === 'spore_vent') {
        ctx.fillStyle = '#365314';
        ctx.beginPath();
        ctx.arc(tx, ty, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isActive ? '#d9f99d' : isWarn ? '#a3e635' : '#4d7c0f';
        ctx.beginPath();
        ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (isWarn) {
          ctx.strokeStyle = 'rgba(163, 230, 53, 0.75)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius * 0.75, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isActive) {
          ctx.fillStyle = 'rgba(132, 204, 22, 0.38)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trap.kind === 'frost_crystal') {
        ctx.fillStyle = isActive ? '#e0f2fe' : isWarn ? '#7dd3fc' : '#0284c7';
        ctx.fillRect(tx - 3, ty - 6, 6, 12);
        ctx.fillRect(tx - 5, ty - 2, 10, 4);

        if (isWarn) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isActive) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (trap.kind === 'void_pillar') {
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(tx - 4, ty - 7, 8, 14);
        ctx.fillStyle = isActive ? '#f5d0fe' : isWarn ? '#e879f9' : '#9333ea';
        ctx.fillRect(tx - 2, ty - 5, 4, 10);

        if (isWarn) {
          ctx.strokeStyle = 'rgba(216, 180, 254, 0.8)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius * 0.8, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isActive) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.38)';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f5d0fe';
          ctx.beginPath();
          ctx.arc(tx, ty, trap.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (trap.kind === 'arrow_turret') {
        ctx.fillStyle = '#44403c';
        ctx.fillRect(tx - 5, ty - 5, 10, 10);
        ctx.strokeStyle = isWarn ? '#fbbf24' : '#78716c';
        ctx.strokeRect(tx - 5.5, ty - 5.5, 11, 11);
        const dx = trap.dirX ?? 0;
        const dy = trap.dirY ?? 1;
        ctx.fillStyle = isWarn || isActive ? '#f59e0b' : '#1c1917';
        ctx.fillRect(tx + dx * 3 - 2, ty + dy * 3 - 2, 4, 4);
      }
    }
  }

  private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }

  private updateParticles(dt: number) {
    this.vfx.update(dt);

    this.floatingTexts = this.floatingTexts
      .map((ft) => ({
        ...ft,
        y: ft.y + ft.vy * dt,
        life: ft.life - dt,
      }))
      .filter((ft) => ft.life > 0);
  }

  private updateCamera(dt: number) {
    const mapW = this.currentWorld.grid[0].length * TILE_SIZE;
    const mapH = this.currentWorld.grid.length * TILE_SIZE;
    const z = Math.max(0.5, this.camZoom);
    const visW = LOGICAL_W / z;
    const visH = LOGICAL_H / z;
    const minCamX = visW >= mapW ? (mapW - LOGICAL_W) / 2 : (visW - LOGICAL_W) / 2;
    const maxCamX = visW >= mapW ? (mapW - LOGICAL_W) / 2 : mapW - LOGICAL_W / 2 - visW / 2;
    const minCamY = visH >= mapH ? (mapH - LOGICAL_H) / 2 : (visH - LOGICAL_H) / 2;
    const maxCamY = visH >= mapH ? (mapH - LOGICAL_H) / 2 : mapH - LOGICAL_H / 2 - visH / 2;
    const targetX = Math.max(minCamX, Math.min(maxCamX, this.player.x - LOGICAL_W / 2));
    const targetY = Math.max(minCamY, Math.min(maxCamY, this.player.y - LOGICAL_H / 2));
    const lerp = 1 - Math.pow(0.001, dt);
    this.camX += (targetX - this.camX) * lerp;
    this.camY += (targetY - this.camY) * lerp;
  }

  private moveEntityWithTileCollision(
    ent: { x: number; y: number; width: number; height: number },
    dx: number,
    dy: number,
    grid: string[]
  ) {
    const hw = ent.width * 0.4;
    const hh = ent.height * 0.4;

    const canStand = (cx: number, cy: number) => {
      const pts = [
        [cx - hw, cy - hh],
        [cx + hw, cy - hh],
        [cx - hw, cy + hh],
        [cx + hw, cy + hh],
      ];
      return pts.every(([px, py]) => !isTileSolid(grid, Math.floor(px / TILE_SIZE), Math.floor(py / TILE_SIZE)));
    };

    if (canStand(ent.x + dx, ent.y)) ent.x += dx;
    if (canStand(ent.x, ent.y + dy)) ent.y += dy;
  }

  private isLineWalkable(grid: string[], x1: number, y1: number, x2: number, y2: number): boolean {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(2, Math.min(14, Math.ceil(dist / 12)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const sx = x1 + (x2 - x1) * t;
      const sy = y1 + (y2 - y1) * t;
      const tx = Math.floor(sx / TILE_SIZE);
      const ty = Math.floor(sy / TILE_SIZE);
      if (!isWalkableTile(grid, tx, ty)) return false;
    }
    return true;
  }

  private moveUnitTowardWithBridgePathing(
    box: { x: number; y: number; width: number; height: number },
    targetX: number,
    targetY: number,
    speed: number,
    dt: number,
    grid: string[],
    vx = 0,
    vy = 0
  ) {
    const curTx = Math.floor(box.x / TILE_SIZE);
    const curTy = Math.floor(box.y / TILE_SIZE);
    if (!isWalkableTile(grid, curTx, curTy)) {
      const dry = findNearestDryTile(grid, box.x, box.y, false);
      box.x = dry.x;
      box.y = dry.y;
    }

    let steerX = targetX;
    let steerY = targetY;

    // If straight-line movement hits water (W), lava (L), or wall (#), steer toward the nearest reachable Bridge (B) or Gatehouse (P)!
    if (!this.isLineWalkable(grid, box.x, box.y, targetX, targetY)) {
      let bestScore = Infinity;
      const rows = grid.length;
      const cols = rows > 0 ? grid[0].length : 0;
      for (let ty = 1; ty < rows - 1; ty++) {
        const row = grid[ty];
        for (let tx = 1; tx < cols - 1; tx++) {
          const ch = row[tx];
          if (ch !== 'B' && ch !== 'P') continue;
          const wx = tx * TILE_SIZE + 8;
          const wy = ty * TILE_SIZE + 8;
          const dFromUnit = Math.hypot(wx - box.x, wy - box.y);
          if (dFromUnit < 10 || dFromUnit > 540) continue;
          if (!this.isLineWalkable(grid, box.x, box.y, wx, wy)) continue;
          const dToTarget = Math.hypot(targetX - wx, targetY - wy);
          const bridgePriority = ch === 'B' ? -36 : 0;
          const score = dFromUnit * 0.55 + dToTarget + bridgePriority;
          if (score < bestScore) {
            bestScore = score;
            steerX = wx;
            steerY = wy;
          }
        }
      }
    }

    const dx = steerX - box.x;
    const dy = steerY - box.y;
    const dist = Math.max(0.01, Math.hypot(dx, dy));
    const nx = dx / dist;
    const ny = dy / dist;
    const prevX = box.x;
    const prevY = box.y;

    this.moveEntityWithTileCollision(box, (nx * speed + vx) * dt, (ny * speed + vy) * dt, grid);

    // Perpendicular wall-slide fallback if snagged near a corner
    if (Math.hypot(box.x - prevX, box.y - prevY) < 0.08 && speed > 5) {
      const px = -ny;
      const py = nx;
      const sign = (targetX - box.x) * px + (targetY - box.y) * py >= 0 ? 1 : -1;
      this.moveEntityWithTileCollision(box, px * sign * speed * dt, py * sign * speed * dt, grid);
    }
  }

  private facingToVec(f: Direction): { x: number; y: number } {
    switch (f) {
      case 'left':
        return { x: -1, y: 0 };
      case 'right':
        return { x: 1, y: 0 };
      case 'up':
        return { x: 0, y: -1 };
      case 'down':
        return { x: 0, y: 1 };
    }
  }

  private shake(duration: number, intensity: number, majorEvent = false) {
    if (!this.screenShakeEnabled || !majorEvent || this.shakeCooldown > 0) return;
    this.shakeTimer = Math.min(0.08, duration);
    this.shakeIntensity = Math.min(2.5, intensity);
    this.shakeCooldown = 0.6;
  }

  private spawnParticles(x: number, y: number, color: string, count: number, speed: number) {
    this.vfx.spawnBurst(x, y, color, count, speed);
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, scale = 1) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      vy: -24,
      text,
      color,
      life: 0.85,
      maxLife: 0.85,
      scale,
    });
  }

  private pushToast(text: string, accent: ToastItem['accent']) {
    this.toasts = [{ id: `toast_${Date.now()}_${Math.random()}`, text, accent, life: 1.2 }];
    this.emitHud();
  }

  private render() {
    const ctx = this.ctx;
    ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

    const world = this.currentWorld;
    const bgKey = `${this.currentAct}_${world.act.biomeId}`;
    const bg = this.actBgCache[bgKey];
    if (!bg) return;

    const sx =
      this.screenShakeEnabled && this.shakeTimer > 0
        ? (Math.random() - 0.5) * Math.min(2.5, this.shakeIntensity) * 2
        : 0;
    const sy =
      this.screenShakeEnabled && this.shakeTimer > 0
        ? (Math.random() - 0.5) * Math.min(2.5, this.shakeIntensity) * 2
        : 0;
    const cx = Math.round(this.camX + sx);
    const cy = Math.round(this.camY + sy);

    ctx.save();
    ctx.translate(LOGICAL_W / 2, LOGICAL_H / 2);
    ctx.scale(this.camZoom, this.camZoom);
    ctx.translate(-LOGICAL_W / 2, -LOGICAL_H / 2);
    ctx.translate(-cx, -cy);

    ctx.drawImage(bg, 0, 0);

    // Living Environment Layer: Scrolling Water Waves, Bubbling Lava & Swaying Canopy Leaves
    const waveTick = this.globalTime * 3.5;
    for (let gy = 1; gy < world.grid.length - 1; gy += 2) {
      const row = world.grid[gy];
      if (!row) continue;
      for (let gx = 1; gx < row.length - 1; gx += 2) {
        const tile = row[gx];
        const wx = gx * TILE_SIZE;
        const wy = gy * TILE_SIZE;
        if (tile === 'W') {
          // Animated scrolling water wave highlight
          const shift = Math.round(Math.sin(waveTick + gx * 0.7 + gy * 0.5) * 2.5);
          ctx.fillStyle = 'rgba(186, 230, 253, 0.32)';
          ctx.fillRect(wx + 4 + shift, wy + 6, 5, 1);
          ctx.fillRect(wx + 7 - shift, wy + 11, 4, 1);
        } else if (tile === 'L') {
          // Animated bubbling magma / hazard spark
          const pop = (Math.sin(waveTick * 1.6 + gx * 1.3 + gy) + 1) * 0.5;
          if (pop > 0.65) {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(wx + 6, wy + Math.round(8 - pop * 4), 2, 2);
          }
        } else if (tile === '#' && (gx + gy) % 4 === 0) {
          // Swaying foliage leaf highlight on trees/walls
          const sway = Math.round(Math.sin(waveTick * 0.8 + gx * 0.9) * 1.5);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.14)';
          ctx.fillRect(wx + 5 + sway, wy + 3, 3, 2);
        }
      }
    }

    if (this.mode === 'TITLE') {
      ctx.restore();
      this.titleArenaSim.render(ctx, this.sprites, this.omniverseSprites, LOGICAL_W, LOGICAL_H);
      return;
    }

    for (const pp of this.pawPrints) {
      ctx.globalAlpha = Math.min(0.45, pp.life * 0.35);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(Math.round(pp.x - 2), Math.round(pp.y), 1, 1);
      ctx.fillRect(Math.round(pp.x + 1), Math.round(pp.y + 1), 1, 1);
    }
    ctx.globalAlpha = 1;

    for (const portal of world.portals) {
      const locked = this.isPortalLockedReason(portal) !== null;
      const pulse = 0.45 + 0.3 * Math.sin(this.globalTime * 4);
      ctx.fillStyle = locked
        ? `rgba(239, 68, 68, ${pulse * 0.45})`
        : portal.isGolden
        ? `rgba(250, 204, 21, ${pulse * 0.7})`
        : `rgba(56, 189, 248, ${pulse * 0.55})`;
      ctx.fillRect(portal.x, portal.y, portal.width, portal.height);
      ctx.strokeStyle = locked ? '#ef4444' : portal.isGolden ? '#fde047' : '#7dd3fc';
      ctx.strokeRect(portal.x + 0.5, portal.y + 0.5, portal.width - 1, portal.height - 1);

      // Rotating Vortex Rings inside Warp Portals
      const pcx = portal.x + portal.width / 2;
      const pcy = portal.y + portal.height / 2;
      for (let rIdx = 0; rIdx < 3; rIdx++) {
        const ang = this.globalTime * (locked ? 1.5 : 4.2) + (rIdx * Math.PI * 2) / 3;
        const rx = pcx + Math.cos(ang) * 4;
        const ry = pcy + Math.sin(ang) * 6;
        ctx.fillStyle = locked ? '#fca5a5' : portal.isGolden ? '#ffffff' : '#bae6fd';
        ctx.fillRect(Math.round(rx - 1), Math.round(ry - 1), 2, 2);
      }
    }

    const actBlueprint = getActBlueprint(this.currentAct);
    renderRiverHydrologyEffects(ctx, actBlueprint.riverConfig, world.grid, this.globalTime);
    renderActLandmarkPlace(ctx, actBlueprint, world.grid, this.player.x, this.player.y, this.globalTime);
    renderDynamicTopographyOverlays(
      ctx,
      actBlueprint,
      this.destructibleProps,
      this.player.x,
      this.player.y,
      this.surfacePhysics,
      this.globalTime,
      world.grid
    );
    if (this.bespokeTrapState) {
      renderBespokeTrapEffects(ctx, this.bespokeTrapState, this.globalTime);
    }

    this.renderTraps(ctx);
    this.biomeMechanics.render(ctx, this.globalTime, world.act.biomeId);
    this.vfx.renderDecals(ctx, this.globalTime);
    this.dragonController.renderArenaFeatures(ctx, this.enemies, this.globalTime);

    // Shrinking "Ring of Cataclysm" Arena Perimeter Border (15% / 30% / 45%)
    const catRing = this.getCataclysmRingBounds();
    if (catRing.active) {
      ctx.save();
      const pulse = 0.24 + 0.08 * Math.sin(this.globalTime * 8);
      ctx.fillStyle = catRing.isDragon
        ? `rgba(234, 88, 12, ${pulse})`
        : `rgba(126, 34, 206, ${pulse})`;
      ctx.fillRect(0, 0, 608, catRing.minY);
      ctx.fillRect(0, catRing.maxY, 608, 384 - catRing.maxY);
      ctx.fillRect(0, catRing.minY, catRing.minX, catRing.maxY - catRing.minY);
      ctx.fillRect(catRing.maxX, catRing.minY, 608 - catRing.maxX, catRing.maxY - catRing.minY);

      ctx.strokeStyle = catRing.isDragon ? '#f97316' : '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(catRing.minX, catRing.minY, catRing.maxX - catRing.minX, catRing.maxY - catRing.minY);
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = catRing.isDragon ? '#fed7aa' : '#f3e8ff';
      ctx.fillText(`🔥 RING OF CATACLYSM (${catRing.borderPct}% BORDER)`, 304, catRing.minY + 8);
      ctx.restore();
    }

    // Render Corrupted Heal Siphon Obelisks & Purple/Crimson Laser Tethers
    for (const ob of this.siphonObelisks) {
      const boss = this.enemies.find((e) => e.id === ob.bossId && e.hp > 0);
      if (boss) {
        ctx.save();
        ctx.strokeStyle = Math.sin(this.globalTime * 16) > 0 ? '#e879f9' : '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ob.x, ob.y - 6);
        ctx.lineTo(boss.x, boss.y);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      const ox = Math.round(ob.x);
      const oy = Math.round(ob.y);
      ctx.fillStyle = ob.hitFlash > 0 ? '#ffffff' : '#581c87';
      ctx.fillRect(ox - 6, oy - 12, 12, 18);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(ox - 6.5, oy - 12.5, 13, 19);
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(ox - 3, oy - 9, 6, 6);
      const bw = 18;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(ox - bw / 2, oy - 17, bw, 3);
      ctx.fillStyle = '#e879f9';
      ctx.fillRect(ox - bw / 2, oy - 17, Math.max(1, Math.round((ob.hp / ob.maxHp) * bw)), 3);
      ctx.font = 'bold 5px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f5d0fe';
      ctx.fillText('🟣 SIPHON', ox, oy - 19);
    }

    // Render 4 Corner Phase-Lock Rune Pillars during Boss Phase-Gate Trials!
    for (const pl of this.phaseLockPillars) {
      const px = Math.round(pl.x);
      const py = Math.round(pl.y);
      ctx.fillStyle = pl.hitFlash > 0 ? '#ffffff' : '#1e1b4b';
      ctx.fillRect(px - 7, py - 13, 14, 20);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(px - 7.5, py - 13.5, 15, 21);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px - 3, py - 9, 6, 8);
      const bw = 18;
      ctx.fillStyle = '#09090b';
      ctx.fillRect(px - bw / 2, py - 18, bw, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - bw / 2, py - 18, Math.max(1, Math.round((pl.hp / pl.maxHp) * bw)), 3);
      ctx.font = 'bold 5px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#bae6fd';
      ctx.fillText('⚡ RUNE PILLAR', px, py - 20);
    }

    // Render War Fort Capture Banners (Dog Kingdom Flag -> Golden Lion Flag)
    for (const banner of this.warBanners) {
      const pulse = 0.5 + 0.25 * Math.sin(this.globalTime * 4);
      ctx.save();
      ctx.strokeStyle = banner.captured ? `rgba(250, 204, 21, ${pulse})` : `rgba(239, 68, 68, ${pulse})`;
      ctx.fillStyle = banner.captured ? 'rgba(250, 204, 21, 0.12)' : 'rgba(239, 68, 68, 0.12)';
      ctx.beginPath();
      ctx.arc(banner.x, banner.y, banner.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Progress ring while capturing
      if (!banner.captured && banner.captureProgress > 0) {
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          banner.x,
          banner.y,
          banner.radius - 2,
          -Math.PI / 2,
          -Math.PI / 2 + (Math.PI * 2 * banner.captureProgress) / 100
        );
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      const bSpr = banner.captured ? this.sprites.warBannerCat : this.sprites.warBannerDog;
      const flagSway = Math.sin(this.globalTime * 6.5 + banner.x * 0.1) * 1.5;
      ctx.drawImage(bSpr, Math.round(banner.x - 10), Math.round(banner.y - 16));
      // Fluttering Flag Wind Tail
      ctx.fillStyle = banner.captured ? '#38bdf8' : '#ef4444';
      ctx.fillRect(Math.round(banner.x + 2), Math.round(banner.y - 14 + flagSway), 3, 4);
      ctx.restore();
    }

    // Render Caged Cat Kingdom Prisoners inside full-body Iron Jail Cells (clear open face window)
    for (const cage of this.prisonCages) {
      if (cage.broken) continue;
      const cx = Math.round(cage.x);
      const cy = Math.round(cage.y);
      // Cell floor shadow & dark interior back wall + rear bars behind the cat
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(cx - 11, cy + 10, 22, 4);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.58)';
      ctx.fillRect(cx - 11, cy - 10, 22, 20);
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 4, cy - 9, 1, 19);
      ctx.fillRect(cx + 3, cy - 9, 1, 19);

      // Captured cat inside the cell (18x18 centered, slight worried hop)
      const hop = Math.sin(this.globalTime * 4.5 + cage.x) * 0.8;
      const cageFrame = Math.floor(this.globalTime * 2) % 2;
      const allySpr = getAlliedCatVariantSprite(cage.unitKind, undefined, cageFrame);
      ctx.drawImage(allySpr, cx - 9, Math.round(cy - 8 + hop), 18, 18);

      // Front 26x26 Iron Jail Cell frame (wide open center so cat face/ears stay 100% visible)
      ctx.drawImage(this.sprites.prisonCage, cx - 13, cy - 13);

      if (cage.hp < cage.maxHp) {
        const bw = 18;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - bw / 2 - 1, cy - 17, bw + 2, 3);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cx - bw / 2, cy - 16, Math.max(1, Math.round((cage.hp / cage.maxHp) * bw)), 1.5);
      }

      if (Math.floor(this.globalTime * 2) % 2 === 0) {
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.fillText('HELP! [E]', cx, cy - 19);
      }
    }

    // Render Dog Kingdom Siege Catapults
    for (const siege of this.siegeEngines) {
      if (siege.destroyed) continue;
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(Math.round(siege.x - 10), Math.round(siege.y + 8), 20, 3);
      ctx.drawImage(this.sprites.siegeCatapult, Math.round(siege.x - 12), Math.round(siege.y - 12));
      const bw = 18;
      const bx = Math.round(siege.x - bw / 2);
      const by = Math.round(siege.y - 15);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 1, by - 1, bw + 2, 4);
      ctx.fillStyle = '#f97316';
      ctx.fillRect(bx, by, Math.max(1, Math.round((siege.hp / siege.maxHp) * bw)), 2);
    }

    for (const h of this.hazards) {
      if (h.kind === 'poison') {
        ctx.fillStyle = 'rgba(132, 204, 22, 0.38)';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (h.kind === 'meteor_warn') {
        ctx.strokeStyle = h.life < 0.25 ? '#f87171' : '#c084fc';
        ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (h.kind === 'lightning_line' && h.x2 !== undefined && h.y2 !== undefined) {
        ctx.strokeStyle = h.life < 0.22 ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = h.life < 0.22 ? 5 : 2;
        ctx.beginPath();
        ctx.moveTo(h.x, h.y);
        ctx.lineTo(h.x2, h.y2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }

    for (const t of world.torches) {
      const flicker = 6 + Math.sin(this.globalTime * 12 + t.x) * 2;
      const flameFrame = Math.floor(this.globalTime * 10 + t.x) % 3;
      ctx.fillStyle = t.color + '33';
      ctx.beginPath();
      ctx.arc(t.x, t.y, flicker + 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.color;
      ctx.fillRect(t.x - 1, t.y - 2 - flameFrame, 3, 4 + flameFrame);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(t.x - 1 + (flameFrame % 2), t.y - 3 - flameFrame, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(t.x, t.y - 1, 1, 2);
    }

    for (const chest of world.chests) {
      const spr = chest.opened ? this.sprites.chestOpen : this.sprites.chestClosed;
      const chestPop = chest.opened ? -1 : 0;
      ctx.drawImage(spr, Math.round(chest.x - 8), Math.round(chest.y - 8 + chestPop));
      if (!chest.opened) {
        const glintX = Math.floor((this.globalTime * 8 + chest.x) % 10) - 5;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.75)';
        ctx.fillRect(Math.round(chest.x + glintX), Math.round(chest.y - 4), 2, 2);
        ctx.fillRect(Math.round(chest.x - 1), Math.round(chest.y - 11 + Math.sin(this.globalTime * 4) * 2), 2, 2);
      }
    }

    for (const npc of world.npcs) {
      const spr = this.sprites.npcs[npc.spriteId];
      if (!spr) continue;
      const tNpc = this.globalTime * 6.0 + npc.x * 0.13;
      const bob =
        npc.spriteId === 'great_duck'
          ? Math.sin(this.globalTime * 2.8) * 2.2
          : Math.sin(tNpc * 0.85) * 0.9;
      const drawW = npc.spriteId === 'king_leo' || npc.spriteId === 'fenrir' ? 30 : spr.width;
      const drawH = npc.spriteId === 'king_leo' || npc.spriteId === 'fenrir' ? 30 : spr.height;

      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(Math.round(npc.x - drawW * 0.35), Math.round(npc.y + drawH * 0.35), Math.round(drawW * 0.7), 3);

      if (npc.spriteId === 'great_duck') {
        // Sacred Lotus Ripples & Wing Flaps for The Great Duck!
        const rippleR = 16 + ((this.globalTime * 9) % 8);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.beginPath();
        ctx.ellipse(npc.x, npc.y + 11, rippleR, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
        ctx.beginPath();
        ctx.arc(npc.x, npc.y, 20 + Math.sin(this.globalTime * 3) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.drawImage(spr, Math.round(npc.x - drawW / 2), Math.round(npc.y - drawH / 2 + bob), drawW, drawH);

      if (npc.spriteId === 'great_duck') {
        // Flapping white feathered wings + speaking orange beak
        const wingFlap = Math.sin(this.globalTime * 5.2) * 3;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(Math.round(npc.x - 15), Math.round(npc.y - 1 + bob + wingFlap), 3, 6);
        ctx.fillRect(Math.round(npc.x + 12), Math.round(npc.y - 1 + bob - wingFlap), 3, 6);
        if (this.mode === 'DIALOGUE' && Math.floor(this.globalTime * 8) % 2 === 0) {
          ctx.fillStyle = '#f97316';
          ctx.fillRect(Math.round(npc.x + 4), Math.round(npc.y - 3 + bob), 5, 3);
        }
      }

      if (npc.id === 'blacksmith_forgepaw') {
        // Living Blacksmith Cat: Swings golden smithing hammer onto glowing anvil every 1.0s with 4 flying sparks!
        const ax = Math.round(npc.x + 12);
        const ay = Math.round(npc.y + 2);
        ctx.fillStyle = '#334155';
        ctx.fillRect(ax - 4, ay - 2, 8, 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(ax - 5, ay - 4, 10, 3);
        ctx.fillStyle = Math.sin(this.globalTime * 10) > 0 ? '#fde047' : '#f97316';
        ctx.fillRect(ax - 10, ay - 3, 4, 4);

        const hammerPhase = this.globalTime % 1.0;
        const hammerDown = hammerPhase < 0.22;
        const hammerY = hammerDown ? ay - 6 : ay - 12 + Math.sin(hammerPhase * Math.PI) * 3;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ax - 6, Math.round(hammerY), 4, 2);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(ax - 3, Math.round(hammerY - 2), 4, 4);

        if (hammerDown) {
          const sparkProgress = hammerPhase / 0.22;
          for (let sIdx = 0; sIdx < 4; sIdx++) {
            const ang = -Math.PI * 0.8 + sIdx * 0.45;
            const sx = ax - 2 + Math.cos(ang) * sparkProgress * 12;
            const sy = ay - 5 + Math.sin(ang) * sparkProgress * 12 + sparkProgress * sparkProgress * 6;
            ctx.fillStyle = sIdx % 2 === 0 ? '#fde047' : '#f97316';
            ctx.fillRect(Math.round(sx), Math.round(sy), 2, 2);
          }
        }
      }
      if (npc.id === 'king_leo_throne' && !this.story.fenrirDefeated) {
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
        ctx.fillStyle = 'rgba(109, 40, 217, 0.25)';
        ctx.fillRect(Math.round(npc.x - 15), Math.round(npc.y - 15), 30, 30);
        ctx.strokeRect(Math.round(npc.x - 15.5), Math.round(npc.y - 15.5), 31, 31);
      }
    }

    const armorTier = this.getEquippedArmor().tier;
    const nyxFrames = this.player.duckElixirActive
      ? this.sprites.pipGolden
      : this.sprites.pipByFur[this.player.furId]?.[armorTier] ?? this.sprites.pip[armorTier];

    for (const ai of this.player.afterimages) {
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.5;
      this.drawFlippedSprite(ctx, nyxFrames.idle, ai.x, ai.y, ai.facing === 'left', 24, 24);
      ctx.restore();
    }

    if (this.story.spokeToGreatDuck) {
      const bob = Math.sin(this.globalTime * 7) * 1.2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(Math.round(this.duckling.x - 4), Math.round(this.duckling.y + 4), 8, 2);
      this.drawFlippedSprite(
        ctx,
        this.sprites.duckling,
        this.duckling.x,
        this.duckling.y + bob,
        this.player.x < this.duckling.x,
        12,
        12
      );
    }

    // Render Active Allied Cat Kingdom Soldiers marching & fighting alongside Nyx!
    for (const ally of this.alliedSoldiers) {
      const phase = ally.variant?.animPhaseOffset ?? (ally.x * 0.13 + ally.y * 0.07);
      const allyFrame = Math.floor(this.globalTime * 5.2 + phase) % 2;
      const aSpr = getAlliedCatVariantSprite(ally.kind, ally.variant, allyFrame);
      const bob = Math.abs(Math.sin(this.globalTime * 6.5 + phase)) * -1.5;
      const hitSquashX = ally.hitFlash > 0 ? 1.18 : 1.0;
      const hitSquashY = ally.hitFlash > 0 ? 0.85 : 1.0;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(Math.round(ally.x - 6), Math.round(ally.y + 7), 12, 2);

      if (ally.rallyTimer > 0) {
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.beginPath();
        ctx.arc(ally.x, ally.y, 11 + Math.sin(this.globalTime * 9 + phase) * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      this.drawFlippedSprite(
        ctx,
        aSpr,
        ally.x,
        ally.y + bob,
        ally.facing === 'left',
        Math.round(20 * hitSquashX),
        Math.round(20 * hitSquashY)
      );

      // Allied Cat Soldier Mini HP Bar (Cyan/Emerald)
      if (ally.hp < ally.maxHp) {
        const bw = 12;
        const bx = Math.round(ally.x - bw / 2);
        const by = Math.round(ally.y - 12);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 1, by - 1, bw + 2, 3);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(bx, by, Math.max(1, Math.round((ally.hp / ally.maxHp) * bw)), 1.5);
      }
    }

    if (this.player.alchemyRelics.primalGuardian) {
      const orbitAng = this.globalTime * 3.4;
      const gx = this.player.x + Math.cos(orbitAng) * 20;
      const gy = this.player.y + Math.sin(orbitAng) * 20;
      ctx.save();
      ctx.translate(Math.round(gx), Math.round(gy));
      ctx.rotate(this.globalTime * 5);
      ctx.drawImage(this.sprites.guardianOrb, -6, -6, 12, 12);
      ctx.restore();
    }

    // Render Underwater Oxygen Bubble Streams in Arc IV (Acts 123–180)
    if (
      this.currentAct >= 123 &&
      this.currentAct <= 180 &&
      (this.currentAct < 130 || this.currentAct > 136) &&
      this.currentAct !== 179
    ) {
      for (const spot of this.bossRaidState.oxygenBubbleSpots) {
        const pulse = 20 + Math.sin(this.globalTime * 4 + spot.x) * 3;
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#bae6fd';
        ctx.fillText('🫧 O2 BUBBLES', spot.x, spot.y - pulse - 3);
        ctx.restore();
      }
    }

    // Render 4-Hero Hot-Swap AI Party Companions fighting alongside the active hero (1 instance per hero)!
    const seenHeroIds = new Set<string>([this.player.activeHeroId]);
    for (const comp of this.player.partyCompanions) {
      if (seenHeroIds.has(comp.heroId)) continue;
      if (this.currentWorld.npcs.some((n) => n.spriteId === comp.heroId && (n.id !== 'king_leo_throne' || this.story.fenrirDefeated))) {
        continue;
      }
      seenHeroIds.add(comp.heroId);
      const compHeroFrames = this.omniverseSprites.heroes[comp.heroId] ?? this.omniverseSprites.heroes.nyx;
      const walkCycleStep = Math.floor(this.globalTime * 6 + comp.x * 0.1) % 2;
      const compSpr =
        comp.animFrame === 1
          ? walkCycleStep === 0
            ? compHeroFrames.walk
            : compHeroFrames.walkB ?? compHeroFrames.walk
          : compHeroFrames.idle;
      const isTallSovereign = comp.heroId === 'king_leo' || comp.heroId === 'fenrir';
      const compSize = isTallSovereign ? 28 : 22;
      const bob = Math.sin(this.globalTime * 5.8 + comp.x * 0.1) * 1.3;
      if (comp.heroId === 'king_leo') {
        this.vfx.drawHalo(ctx, comp.x | 0, comp.y | 0, 'gold', 32, 0.35);
      } else if (comp.heroId === 'fenrir') {
        this.vfx.drawHalo(ctx, comp.x | 0, comp.y | 0, 'emerald', 32, 0.35);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(Math.round(comp.x - compSize * 0.3), Math.round(comp.y + compSize * 0.32), Math.round(compSize * 0.6), 2);
      this.drawFlippedSprite(ctx, compSpr, comp.x, comp.y + bob, comp.facing === 'left', compSize, compSize);
      drawLivingHeroDetails(
        ctx,
        comp.heroId,
        comp.x,
        comp.y + bob,
        comp.facing,
        comp.animFrame === 1,
        comp.attackCooldown > 0.35 ? 0.15 : 0,
        this.globalTime,
        comp.x * 0.05
      );
    }

    for (const e of this.enemies) {
      const phase = e.variant?.animPhaseOffset ?? (e.x * 0.11 + e.y * 0.09);
      const enemyFrame = Math.floor(this.globalTime * 5.2 + phase) % 2;
      const omniEnemySpr = this.omniverseSprites.enemies[e.kind];
      const spr = omniEnemySpr
        ? omniEnemySpr
        : e.bossVisualId
        ? getBossSprite(e.bossVisualId, enemyFrame)
        : getEnemyVariantSprite(e, enemyFrame);
      const drawW =
        e.bossVisualId === 'boss_ragnarok'
          ? 64
          : e.bossVisualId === 'boss_emperor_chariot_p1' || e.bossVisualId === 'boss_dual_sovereign_p2'
          ? 56
          : e.kind === 'fenrir_p2'
          ? 48
          : e.kind === 'fenrir_p1'
          ? 30
          : spr.width;
      const drawH =
        e.bossVisualId === 'boss_ragnarok'
          ? 64
          : e.bossVisualId === 'boss_emperor_chariot_p1' || e.bossVisualId === 'boss_dual_sovereign_p2'
          ? 56
          : e.kind === 'fenrir_p2'
          ? 48
          : e.kind === 'fenrir_p1'
          ? 30
          : spr.height;
      const enemyBob = Math.sin(this.globalTime * 6.0 + phase) * (e.isBoss ? 1.5 : 1.1);
      // Hit-Reaction Horizontal Squash (scaleX: 1.2, scaleY: 0.85) + Attack Lunge (+4px)
      const hitSquashX = e.hitFlash > 0 ? 1.2 : 1 + Math.sin(this.globalTime * 4.5 + phase) * 0.03;
      const hitSquashY = e.hitFlash > 0 ? 0.85 : 1 - Math.sin(this.globalTime * 4.5 + phase) * 0.03;
      const lungeX = e.state === 'attack' || e.state === 'charge' ? e.chargeDirX * 4 : 0;
      const lungeY = e.state === 'attack' || e.state === 'charge' ? e.chargeDirY * 4 : 0;

      const isDrg = isDragonBossEnemy(e);
      const ds = isDrg ? ensureDragonState(e) : null;
      const drawY = e.y + lungeY - (ds ? ds.skyHeight * 28 : 0);
      const skyScale = 1 + (ds ? ds.skyHeight * 0.16 : 0);

      if (isDrg) {
        this.dragonController.renderDragonPreEffects(ctx, e, this.globalTime);
      }

      if (e.isWolfCaptain) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
        ctx.fillStyle = 'rgba(159, 18, 57, 0.22)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 15 + Math.sin(this.globalTime * 6 + phase) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (!ds || ds.altitude !== 'sky') {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(Math.round(e.x - drawW * 0.32), Math.round(e.y + drawH * 0.34), Math.round(drawW * 0.64), 3);
      }

      if (e.shielded) {
        ctx.strokeStyle = '#c084fc';
        ctx.fillStyle = 'rgba(168, 85, 247, 0.22)';
        ctx.beginPath();
        ctx.arc(e.x, drawY, 17 + Math.sin(this.globalTime * 5) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      if (e.overdrive) {
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.85)';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.beginPath();
        ctx.arc(e.x, drawY, drawW * 0.56 + Math.sin(this.globalTime * 10) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Glowing Cyan/Gold Cut-Point Weak Spot Ring at the Base/Mid-Section of Every Kraken Tentacle!
      if (e.kind === 'kraken_tentacle') {
        const ringPulse = Math.sin(this.globalTime * 12) > 0;
        ctx.save();
        ctx.strokeStyle = ringPulse ? '#38bdf8' : '#fde047';
        ctx.fillStyle = ringPulse ? 'rgba(56, 189, 248, 0.28)' : 'rgba(253, 224, 71, 0.28)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(e.x, drawY + 4, 11 + Math.sin(this.globalTime * 8) * 1.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fde047';
        ctx.fillText('🎯 2.5x SLICE', Math.round(e.x), Math.round(drawY - drawH * 0.5 - 5));
        ctx.restore();
      }

      // Crimson/Silver Guard Crosshair + Metallic Spark when Enemy is in COUNTER STANCE!
      if ((e.counterStanceTimer ?? 0) > 0) {
        const pulse = 0.65 + 0.35 * Math.sin(this.globalTime * 22);
        ctx.save();
        ctx.strokeStyle = `rgba(244, 63, 94, ${pulse})`;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, drawY, drawW * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Metallic Silver Crosshair Sparks
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(e.x - 9, drawY);
        ctx.lineTo(e.x + 9, drawY);
        ctx.moveTo(e.x, drawY - 9);
        ctx.lineTo(e.x, drawY + 9);
        ctx.stroke();
        ctx.font = 'bold 6px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fda4af';
        ctx.fillText('🛡️ COUNTER!', Math.round(e.x), Math.round(drawY - drawH * 0.58 - 4));
        ctx.restore();
      }

      // Red Telegraph Alert + Glowing Wind-Up Charge Spark before enemy strike / dash / volley
      if (e.state === 'windup') {
        const urgency = e.stateTimer <= 0.24 ? '#fef08a' : '#ef4444';
        ctx.strokeStyle = urgency;
        ctx.lineWidth = e.stateTimer <= 0.24 ? 2 : 1.2;
        ctx.beginPath();
        ctx.arc(e.x, drawY, drawW * 0.62, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.x, drawY);
        ctx.lineTo(e.x + e.chargeDirX * 26, drawY + e.chargeDirY * 26);
        ctx.stroke();
        ctx.lineWidth = 1;
        // Glowing Weapon Charge Spark
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(Math.round(e.x - e.chargeDirX * 8 - 1), Math.round(drawY - 6), 3, 3);
      }

      const activeSpr = e.hitFlash > 0 ? this.vfx.getWhiteFlashCanvas(spr) : spr;
      this.drawFlippedSprite(
        ctx,
        activeSpr,
        (e.x + lungeX) | 0,
        (drawY + enemyBob) | 0,
        e.facing === 'right',
        Math.round(drawW * skyScale * hitSquashX),
        Math.round(drawH * skyScale * hitSquashY)
      );

      if (isDrg) {
        this.dragonController.renderDragonPostOverlays(ctx, e, drawW * skyScale, drawH * skyScale, this.globalTime);
      }

      // Spinning Golden Stagger-Stun Stars above Boss/Enemy head
      if ((e.stunTimer ?? 0) > 0) {
        for (let s = 0; s < 3; s++) {
          const sa = this.globalTime * 5.5 + (Math.PI * 2 * s) / 3;
          const sx = e.x + Math.cos(sa) * 10;
          const sy = drawY - drawH * 0.52 + Math.sin(sa) * 3.5;
          ctx.fillStyle = '#fde047';
          ctx.fillRect(Math.round(sx - 1.5), Math.round(sy - 1.5), 3, 3);
        }
      }

      if (!e.isBoss && !e.isMiniBoss && e.hp < e.maxHp) {
        const bw = 14;
        const bx = Math.round(e.x - bw / 2);
        const by = Math.round(e.y - drawH / 2 - 5);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(bx - 1, by - 1, bw + 2, 4);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bx, by, Math.max(1, Math.round((e.hp / e.maxHp) * bw)), 2);
      }
    }

    // Render Glowing Golden Duck Feather Pickups on the Arena Floor!
    for (const fp of this.featherPickups) {
      const bob = Math.sin(this.globalTime * 6 + fp.x) * 2;
      ctx.save();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.28)';
      ctx.beginPath();
      ctx.arc(fp.x, fp.y + bob, 9 + Math.sin(this.globalTime * 8) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(this.sprites.goldenEgg, Math.round(fp.x - 5), Math.round(fp.y - 5 + bob));
      ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('🪶 FEATHER', Math.round(fp.x), Math.round(fp.y - 8 + bob));
      ctx.restore();
    }

    // Active Playable Hero (Nyx 24x24, Majestic Lion King Leo 30x30, Dire Wolf Fenrir 30x30, Great Duck 28x28)
    const p = this.player;
    const isMajesticSovereign = p.activeHeroId === 'king_leo' || p.activeHeroId === 'fenrir';
    if (p.activeEmote !== 'none') {
      // Cozy Bakery / Starlight Loaf Mat underneath Hero
      ctx.fillStyle = 'rgba(245, 158, 11, 0.24)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 7, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.65)';
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(Math.round(p.x - (isMajesticSovereign ? 8 : 6)), Math.round(p.y + 8), isMajesticSovereign ? 16 : 12, 3);
    }

    if (p.duckElixirActive || p.perfectDodgeEmpowered) {
      ctx.fillStyle = p.perfectDodgeEmpowered ? 'rgba(56, 189, 248, 0.28)' : 'rgba(250, 204, 21, 0.22)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, (isMajesticSovereign ? 17 : 14) + Math.sin(this.globalTime * 8) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.invulnTimer <= 0 || Math.floor(this.globalTime * 20) % 2 === 0) {
      let spr = nyxFrames.idle;
      let jumpOffset = 0;
      let spinAngle = 0;
      const isMovingNow = Math.hypot(p.vx, p.vy) > 8 || p.animFrame === 1;

      if (p.dodgeTimer > 0) {
        spr = nyxFrames.ball;
        spinAngle = (1 - p.dodgeTimer / 0.24) * Math.PI * 4;
      } else if (p.happyJumpTimer > 0) {
        spr = nyxFrames.happy;
        jumpOffset = -Math.abs(Math.sin((p.happyJumpTimer / 0.85) * Math.PI * 2)) * 7;
      } else if (p.activeEmote === 'bread_loaf') {
        spr = nyxFrames.breadLoaf;
        jumpOffset = Math.sin(this.globalTime * 3.5) * 0.6;
      } else if (p.activeEmote === 'making_biscuits') {
        spr = Math.floor(this.globalTime * 5) % 2 === 0 ? nyxFrames.biscuits : nyxFrames.happy;
        jumpOffset = Math.sin(this.globalTime * 10) * 1.1;
      } else if (p.activeEmote === 'eepy_croissant') {
        spr = nyxFrames.croissant;
        jumpOffset = Math.sin(this.globalTime * 2.2) * 0.5;
      } else if (p.activeEmote === 'zoomie_blep') {
        spr = nyxFrames.blep;
        jumpOffset = -Math.abs(Math.sin(this.globalTime * 7)) * 2.2;
      } else if (p.activeEmote === 'purr_love') {
        spr = nyxFrames.happy;
        jumpOffset = Math.sin(this.globalTime * 6) * 1.2;
      } else if (isMovingNow) {
        spr = Math.floor(this.globalTime * 8) % 2 === 0 ? nyxFrames.walk : nyxFrames.twitch;
        jumpOffset = -Math.abs(Math.sin(this.globalTime * 12)) * 1.6;
      } else if (this.blinkTimer <= 0) {
        spr = nyxFrames.blink;
      } else if (Math.sin(this.globalTime * 3.2) > 0.85) {
        spr = nyxFrames.twitch;
      } else {
        jumpOffset = Math.sin(this.globalTime * 4.5) * 0.6;
      }

      if (p.steamMechaActive) {
        spr = this.omniverseSprites.steamMecha;
      } else if (p.activeHeroId !== 'nyx') {
        const heroFrames = this.omniverseSprites.heroes[p.activeHeroId];
        if (heroFrames) {
          const walkStep = Math.floor(this.globalTime * 7.5) % 2;
          spr = isMovingNow
            ? walkStep === 0
              ? heroFrames.walk
              : heroFrames.walkB ?? heroFrames.walk
            : heroFrames.idle;
        }
      }

      const activeNyxSpr = p.hitFlash > 0 ? this.vfx.getWhiteFlashCanvas(spr) : spr;
      const baseDrawSize = p.steamMechaActive
        ? 28
        : isMajesticSovereign
        ? 30
        : p.activeHeroId === 'great_duck'
        ? 28
        : 24;
      const squashX = p.hitFlash > 0 ? 1.2 : 1.0;
      const squashY = p.hitFlash > 0 ? 0.85 : 1.0;
      const lungeOffset = p.attackTimer > 0 ? Math.cos(p.attackAngle) * 4 : 0;
      const lungeOffsetY = p.attackTimer > 0 ? Math.sin(p.attackAngle) * 4 : 0;

      ctx.save();
      if (spinAngle !== 0 && !p.steamMechaActive) {
        ctx.translate(p.x | 0, (p.y + jumpOffset) | 0);
        ctx.rotate(spinAngle);
        ctx.drawImage(activeNyxSpr, -12, -12, 24, 24);
      } else {
        this.drawFlippedSprite(
          ctx,
          activeNyxSpr,
          (p.x + lungeOffset) | 0,
          (p.y - (isMajesticSovereign ? 4 : 2) + jumpOffset + lungeOffsetY) | 0,
          p.facing === 'left',
          Math.round(baseDrawSize * squashX),
          Math.round(baseDrawSize * squashY)
        );
        if (!p.steamMechaActive && p.dodgeTimer <= 0 && p.activeEmote === 'none') {
          drawLivingHeroDetails(
            ctx,
            p.activeHeroId,
            p.x + lungeOffset,
            p.y - 2 + jumpOffset + lungeOffsetY,
            p.facing,
            isMovingNow,
            p.attackTimer,
            this.globalTime,
            0
          );
        }
      }
      ctx.restore();

      if (p.furId === 'starlight') {
        const cx = p.x;
        const cy = p.y - 10 + jumpOffset;
        const numStars = 6;
        for (let i = 0; i < numStars; i++) {
          const speed = 3.6;
          const angle = this.globalTime * speed + i * ((Math.PI * 2) / numStars);
          const orbitR = 12.0 + Math.sin(this.globalTime * 3.0 + i) * 1.0;
          const sx = Math.round(cx + Math.cos(angle) * orbitR);
          const sy = Math.round(cy + Math.sin(angle) * orbitR);

          const hue = (this.globalTime * 140 + i * (360 / numStars)) % 360;
          ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
          ctx.fillRect(sx, sy, 2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx, sy, 1, 1);
        }
      }

      if (p.activeEmote !== 'none') {
        this.renderCatEmoteBubble(ctx, Math.round(p.x), Math.round(p.y - 20 + Math.sin(this.globalTime * 4.5) * 1.5), p.activeEmote);
      }

      // 20-Second Golden Elixir Countdown Bar above Nyx's head!
      if (p.duckElixirActive) {
        const bw = 24;
        const bx = Math.round(p.x - bw / 2);
        const by = Math.round(p.y - 19);
        const ratio = Math.max(0, Math.min(1, p.duckElixirTimer / Math.max(1, p.duckElixirMaxTimer)));
        ctx.fillStyle = '#09090b';
        ctx.fillRect(bx - 1, by - 1, bw + 2, 4);
        ctx.fillStyle = ratio < 0.25 ? '#fb923c' : '#fde047';
        ctx.fillRect(bx, by, Math.max(1, Math.round(bw * ratio)), 2);
        ctx.font = 'bold 5px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(`⏳${p.duckElixirTimer.toFixed(1)}s`, Math.round(p.x), by - 2);
      }

      // Parry Stun Stars above Nyx if stunned by a Dog Counter-Slash
      if (p.stunTimer > 0) {
        for (let s = 0; s < 3; s++) {
          const sa = this.globalTime * 7 + (Math.PI * 2 * s) / 3;
          ctx.fillStyle = '#fda4af';
          ctx.fillRect(Math.round(p.x + Math.cos(sa) * 8 - 1), Math.round(p.y - 16 + Math.sin(sa) * 3 - 1), 2, 2);
        }
      }
    }

    this.vfx.renderSlashes(ctx);

    // Expanding Golden War-Horn Soundwave Ring
    if (this.warHornWaveTimer > 0) {
      const prog = 1 - this.warHornWaveTimer / 0.65;
      ctx.save();
      ctx.strokeStyle = `rgba(250, 204, 21, ${1 - prog})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12 + prog * 95, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (const pr of this.projectiles) {
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pr.coreColor;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const egg of this.goldenEggs) {
      ctx.drawImage(this.sprites.goldenEgg, (egg.x - 5) | 0, (egg.y - 5) | 0);
    }
    if (this.duckFlyover.active) {
      this.vfx.drawHalo(ctx, this.duckFlyover.x | 0, this.duckFlyover.y | 0, 'gold', 64, 0.55);
      this.drawFlippedSprite(ctx, this.sprites.greatDuck, this.duckFlyover.x, this.duckFlyover.y, false, 32, 32);
    }

    this.vfx.renderParticlesAndWaves(ctx);

    ctx.save();
    ctx.lineJoin = 'round';
    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
      const pxSize = Math.max(7.5, Math.round(8.5 * (ft.scale ?? 1)));
      ctx.font = `700 ${pxSize}px ui-sans-serif, system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#05070f';
      ctx.strokeText(ft.text, Math.round(ft.x), Math.round(ft.y));
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    ctx.restore();

    if (this.dragonController.mount.active) {
      this.dragonController.renderDragonMountOverlay(ctx, nyxFrames.happy, LOGICAL_W, LOGICAL_H, this.globalTime);
    }

    // Smooth Widescreen Letterbox Bars during Cutscenes & Boss Intro
    if (this.letterboxRatio > 0.01) {
      const barH = Math.round(this.letterboxRatio * 22);
      ctx.fillStyle = 'rgba(5, 7, 15, 0.92)';
      ctx.fillRect(0, 0, LOGICAL_W, barH);
      ctx.fillRect(0, LOGICAL_H - barH, LOGICAL_W, barH);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, barH, LOGICAL_W, 1);
      ctx.fillRect(0, LOGICAL_H - barH - 1, LOGICAL_W, 1);
    }

    // VS Boss Splash Banner
    if (this.bossSplashTimer > 0 && this.mode === 'PLAYING') {
      const alpha = Math.min(1, this.bossSplashTimer * 1.5);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(15, 7, 28, 0.9)';
      ctx.fillRect(70, 52, 340, 38);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(70, 52, 340, 38);
      ctx.font = '700 8.5px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f87171';
      ctx.fillText('⚔ BOSS ENCOUNTER ⚔', LOGICAL_W / 2, 66);
      ctx.font = '800 11px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#fde047';
      ctx.fillText(this.bossSplashName.toUpperCase(), LOGICAL_W / 2, 81);
      ctx.restore();
    } else if (this.actBannerTimer > 0 && this.mode === 'PLAYING') {
      // Act & Chiptune Song Banner
      const alpha = Math.min(1, this.actBannerTimer * 1.2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(9, 13, 26, 0.88)';
      ctx.fillRect(92, 44, 296, 34);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(92, 44, 296, 34);
      ctx.font = '700 9px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047';
      ctx.fillText(`ACT ${this.currentAct} · ${this.currentWorld.act.title}`, LOGICAL_W / 2, 58);
      ctx.font = '600 7.5px ui-sans-serif, system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#7dd3fc';
      ctx.fillText(`🎵 ${audio.getCurrentTrackTitle()}`, LOGICAL_W / 2, 71);
      ctx.restore();
    }

    // Expanding Iris Wipe on Act Transitions
    if (this.irisWipeTimer > 0) {
      const prog = 1 - this.irisWipeTimer / 0.55;
      const radius = Math.max(8, prog * 310);
      ctx.save();
      ctx.fillStyle = '#05070f';
      ctx.beginPath();
      ctx.rect(0, 0, LOGICAL_W, LOGICAL_H);
      ctx.arc(LOGICAL_W / 2, LOGICAL_H / 2, radius, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();
    }

    if (this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE') {
      this.renderCutscenePanel(ctx);
    }
  }

  private renderCutscenePanel(ctx: CanvasRenderingContext2D) {
    const line = this.dialogueQueue[this.dialogueIndex];
    const cue = line?.sceneCue ?? 'prologue_1';
    const px = 64;
    const py = 14;
    const pw = 352;
    const ph = 136;

    const isEpilogue = cue.startsWith('epilogue_');
    const isCataclysm = cue.startsWith('cataclysm_');
    ctx.fillStyle = 'rgba(7, 9, 18, 0.92)';
    ctx.fillRect(px - 3, py - 3, pw + 6, ph + 6);
    ctx.fillStyle = isCataclysm
      ? '#2b090e'
      : isEpilogue
      ? '#1e293b'
      : cue === 'prologue_2' || cue === 'prologue_3'
      ? '#1e1035'
      : '#172554';
    ctx.fillRect(px, py, pw, ph);

    // Golden, Crimson, or Violet Sky Backdrop Band
    ctx.fillStyle = isCataclysm
      ? '#ef444444'
      : isEpilogue
      ? '#f59e0b33'
      : cue === 'prologue_1'
      ? '#fbbf2433'
      : '#a855f733';
    ctx.fillRect(px + 10, py + 8, pw - 20, 42);

    // Throne Carpet & Pillars
    ctx.fillStyle = isEpilogue ? '#b91c1c' : '#7f1d1d';
    ctx.fillRect(px + 132, py + 26, 88, 106);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(px + 130, py + 26, 2, 106);
    ctx.fillRect(px + 220, py + 26, 2, 106);
    ctx.fillStyle = '#312e81';
    ctx.fillRect(px + 28, py + 12, 16, 112);
    ctx.fillRect(px + 308, py + 12, 16, 112);

    const nyxFrames = this.sprites.pipByFur[this.player.furId]?.[1] ?? this.sprites.pip[1];

    if (cue === 'cataclysm_1') {
      // United Cat & Dog Peace Treaty Banquet!
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 82, py + 94, 188, 14);
      ctx.drawImage(this.sprites.pipGolden.happy, px + 100, py + 68, 24, 24);
      ctx.drawImage(this.sprites.npcs.king_leo, px + 144, py + 62, 28, 28);
      ctx.drawImage(this.sprites.npcs.fenrir, px + 186, py + 62, 28, 28);
      ctx.drawImage(this.sprites.greatDuck, px + 224, py + 60, 30, 30);
    } else if (cue === 'cataclysm_2') {
      // Ignis-Bahamut descends from crimson sky & shatters the Peace Monument!
      if (Math.sin(this.globalTime * 16) > 0) {
        ctx.fillStyle = '#f9731644';
        ctx.fillRect(px + 12, py + 10, pw - 24, 48);
      }
      const bahSpr = getBossSprite('boss_bahamut_p3', Math.floor(this.globalTime * 5) % 2);
      ctx.drawImage(bahSpr, px + 136, py + 14, 72, 72);
      ctx.drawImage(this.sprites.npcs.king_leo, px + 88, py + 86, 24, 24);
      ctx.drawImage(nyxFrames.happy, px + 162, py + 88, 24, 24);
      ctx.drawImage(this.sprites.npcs.fenrir, px + 236, py + 86, 24, 24);
    } else if (cue === 'prologue_1') {
      // Peaceful Throne + King Leo + Starlight Gem Wand + Nyx practicing
      ctx.drawImage(this.sprites.npcs.king_leo, px + 162, py + 44, 28, 28);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 194, py + 46, 3, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px + 195.5, py + 45, 5 + Math.sin(this.globalTime * 6), 0, Math.PI * 2);
      ctx.fill();
      const drillX = px + 88 + Math.sin(this.globalTime * 4) * 6;
      ctx.drawImage(nyxFrames.idle, Math.round(drillX), py + 84, 24, 24);
    } else if (cue === 'prologue_2') {
      // Stormy invasion: lightning + Fenrir & Vanguard silhouettes
      if (Math.sin(this.globalTime * 14) > 0.3) {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px + 60, py + 8);
        ctx.lineTo(px + 85, py + 44);
        ctx.lineTo(px + 75, py + 72);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      ctx.drawImage(this.sprites.npcs.king_leo, px + 162, py + 48, 28, 28);
      this.drawFlippedSprite(ctx, this.sprites.enemies.fenrir_p1, px + 240, py + 74, false, 30, 30);
      this.drawFlippedSprite(ctx, this.sprites.enemies.hound_scout, px + 276, py + 88, false, 20, 20);
    } else if (cue === 'prologue_3') {
      // Theft of Wand & Dark Purple Stasis Chains
      ctx.drawImage(this.sprites.npcs.king_leo, px + 152, py + 58, 26, 26);
      ctx.strokeStyle = '#c084fc';
      ctx.strokeRect(px + 148, py + 54, 34, 34);
      const fenX = px + 218 + Math.sin(this.globalTime * 5) * 8;
      this.drawFlippedSprite(ctx, this.sprites.enemies.fenrir_p1, fenX, py + 62, false, 30, 30);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(Math.round(fenX - 18), py + 48, 3, 14);
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(fenX - 16.5, py + 47, 6 + Math.sin(this.globalTime * 8), 0, Math.PI * 2);
      ctx.fill();
    } else if (cue === 'prologue_4') {
      // Advisor Whiskers + Nyx Oath + Glowing 40-Act Scroll pointing East
      ctx.drawImage(this.sprites.npcs.advisor, px + 88, py + 82, 22, 22);
      ctx.drawImage(nyxFrames.happy, px + 126, py + 78, 26, 26);
      // 40-Act Quest Map Scroll
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(px + 206, py + 68, 48, 28);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(px + 206, py + 68, 48, 28);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(px + 214, py + 78, 32, 3);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 242, py + 76, 6, 6);
    } else if (cue === 'epilogue_1') {
      // Sunrise restoration + Nyx raising Purified Wand
      ctx.drawImage(nyxFrames.happy, px + 164, py + 74, 28, 28);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 190, py + 52, 3, 22);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(px + 191.5, py + 50, 7 + Math.sin(this.globalTime * 6), 0, Math.PI * 2);
      ctx.fill();
    } else if (cue === 'epilogue_2') {
      // King Leo knighting Nyx the Grand Archmage-Paladin
      ctx.drawImage(this.sprites.npcs.king_leo, px + 124, py + 64, 30, 30);
      ctx.drawImage(this.sprites.pipGolden.happy, px + 186, py + 72, 28, 28);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(px + 154, py + 68, 30, 3);
    } else if (cue === 'epilogue_3') {
      // Banquet Feast with Great Duck, Duckling, King Leo & Golden Nyx!
      ctx.fillStyle = '#78350f';
      ctx.fillRect(px + 96, py + 92, 160, 14);
      ctx.drawImage(this.sprites.pipGolden.happy, px + 114, py + 68, 24, 24);
      ctx.drawImage(this.sprites.npcs.king_leo, px + 158, py + 62, 28, 28);
      ctx.drawImage(this.sprites.greatDuck, px + 208, py + 60, 32, 32);
      ctx.drawImage(this.sprites.duckling, px + 244, py + 78, 14, 14);
    } else {
      // Epilogue 4: Hall of Fame Jubilee
      ctx.drawImage(this.sprites.pipGolden.happy, px + 162, py + 66, 28, 28);
      for (let i = 0; i < 12; i++) {
        const cx = px + 36 + ((i * 27 + Math.floor(this.globalTime * 35)) % (pw - 72));
        const cy = py + 16 + ((i * 19 + Math.floor(this.globalTime * 22)) % (ph - 32));
        ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#38bdf8';
        ctx.fillRect(cx, cy, 3, 3);
      }
    }

    ctx.strokeStyle = isCataclysm ? '#f97316' : isEpilogue ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, pw, ph);
    ctx.lineWidth = 1;
  }

  private renderCatEmoteBubble(ctx: CanvasRenderingContext2D, bx: number, by: number, emote: Exclude<CatEmoteId, 'none'>) {
    // Pixel Speech Bubble (16x13) with tail
    ctx.fillStyle = '#09090b';
    ctx.fillRect(bx - 8, by - 7, 16, 11);
    ctx.fillStyle = '#fffbeb';
    ctx.fillRect(bx - 7, by - 6, 14, 9);
    ctx.fillRect(bx - 1, by + 3, 3, 2);

    if (emote === 'bread_loaf') {
      // Mini Pixel Bread Loaf inside bubble
      ctx.fillStyle = '#92400e';
      ctx.fillRect(bx - 5, by - 4, 10, 3);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx - 4, by - 3, 8, 5);
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(bx - 2, by - 1, 5, 3);
    } else if (emote === 'making_biscuits') {
      // Pink Cat Paw Bean inside bubble
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(bx - 2, by - 1, 4, 3);
      ctx.fillRect(bx - 4, by - 4, 2, 2);
      ctx.fillRect(bx - 1, by - 5, 2, 2);
      ctx.fillRect(bx + 2, by - 4, 2, 2);
    } else if (emote === 'eepy_croissant') {
      // Golden Croissant + Z
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx - 4, by - 3, 8, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(bx - 2, by - 2, 4, 2);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(bx + 2, by - 5, 3, 1);
    } else if (emote === 'zoomie_blep') {
      // Cute :P Blep Tongue icon
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx - 4, by - 4, 2, 2);
      ctx.fillRect(bx + 2, by - 4, 2, 2);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(bx - 2, by - 1, 4, 3);
    } else {
      // Pixel Heart for purr_love
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(bx - 4, by - 4, 3, 3);
      ctx.fillRect(bx + 1, by - 4, 3, 3);
      ctx.fillRect(bx - 3, by - 2, 6, 3);
      ctx.fillRect(bx - 1, by + 1, 2, 1);
    }
  }

  private drawFlippedSprite(
    ctx: CanvasRenderingContext2D,
    spr: HTMLCanvasElement,
    cx: number,
    cy: number,
    flipX: boolean,
    w: number,
    h: number
  ) {
    ctx.save();
    ctx.translate(Math.round(cx), Math.round(cy));
    if (flipX) ctx.scale(-1, 1);
    ctx.drawImage(spr, Math.round(-w / 2), Math.round(-h / 2), w, h);
    ctx.restore();
  }

  private getActiveQuestText(): string {
    if (this.dragonController.mount.active) {
      return '⚔️ MOUNTED ON BAHAMUT! Dash along spine [WASD], slash Stolen Neck Gem [SPACE/CLICK] (5,000 DMG)!';
    }
    if (this.dragonController.isInSkyFlight(this.enemies)) {
      return '🦅 DRAGON SKY-FLIGHT! Fire 2 Corner Harpoon Ballistas [E] (or [R] Horn) to SKY-CRASH it!';
    }
    if (this.dragonController.hoardPiles.length > 0) {
      return '💎 HOARD STOLEN! Slash the glowing Stolen Treasure Pile (3 hits) to reclaim loot + gain +100% Fury!';
    }
    if (this.currentAct === 122) {
      const bahP1 = this.enemies.find((e) => e.kind === 'bahamut_p1');
      if (bahP1?.shielded) {
        return 'Press [Q] to unleash the 20s Dragon-God Elixir & shatter Bahamut’s Sky-Ward!';
      }
      const bahP2 = this.enemies.find((e) => e.kind === 'bahamut_p2');
      if (bahP2) {
        return 'Fire Corner Ballistas [E] or ride Updraft Geysers onto Ignis-Bahamut’s back!';
      }
      if (this.enemies.length > 0) {
        return `Slay ${this.enemies[0].name} with King Leo, Wolf-King Fenrir & the United Alliance!`;
      }
      return 'Victory! Speak with King Leo & Wolf-King Fenrir [E]!';
    }
    if (this.currentAct === 121) {
      return 'Speak with King Leo, Fenrir & Great Duck [E] for Tier 30 Gear & enter Act 122!';
    }
    if (this.currentAct === 82) {
      const vargos = this.enemies.find((e) => e.kind === 'fenrir_p1');
      if (vargos?.shielded) {
        return 'Press [Q] to shatter Emperor Fenrir’s Imperial Ward!';
      }
      if (this.enemies.length > 0) {
        return `Defeat ${this.enemies[0].name} with King Leo & your Cat Army!`;
      }
      return 'Victory! Speak with King Leo [E]!';
    }
    if (this.currentAct === 81) {
      return 'Speak with King Leo & Great Duck [E] at the War Council, then enter Act 82!';
    }
    if (this.currentAct === 41) {
      if (!this.story.fenrirShieldBroken && !this.story.fenrirDefeated) {
        return 'Press [Q] to shatter Fenrir’s 99% Barrier!';
      }
      if (!this.story.fenrirDefeated) {
        return 'Defeat Usurper King Fenrir!';
      }
      return 'Speak to King Leo [E] or enter East Portal to Act 42!';
    }
    if (this.currentAct === 40) {
      if (!this.story.spokeToGreatDuck) {
        return 'Speak with The Great Duck [E] for the Elixir!';
      }
      return 'Open Vaults & take Golden Warp to Act 41!';
    }
    const uncapturedBanners = this.warBanners.filter((b) => !b.captured).length;
    if (this.enemies.length > 0 && !this.clearedActs.has(this.currentAct)) {
      if (uncapturedBanners > 0) {
        const arcCfg = getArcConfig(this.currentAct);
        return `Defeat ${this.enemies.length} ${arcCfg.enemyFaction} & Capture ${uncapturedBanners} Banner(s)!`;
      }
      return `Defeat ${this.enemies.length} foe(s) to unlock Act ${this.currentAct + 1}`;
    }
    return `Act ${this.currentAct} Cleared! Enter East Portal to Act ${this.currentAct + 1}`;
  }

  private getNearestInteractPrompt(): { prompt: string | null; nearBlacksmith: boolean } {
    let nearBlacksmith = false;

    const readyBallista = this.dragonController.getNearestReadyBallista(this.player.x, this.player.y);
    if (readyBallista && this.dragonController.hasActiveDragon(this.enemies)) {
      return { prompt: `[E] Fire ${readyBallista.cornerLabel} (Harpoon Shot)!`, nearBlacksmith };
    }

    for (const npc of this.currentWorld.npcs) {
      if (npc.id === 'king_leo_throne' && !this.story.fenrirDefeated) continue;
      if (Math.hypot(npc.x - this.player.x, npc.y - this.player.y) <= 36) {
        if (npc.id === 'blacksmith_forgepaw') nearBlacksmith = true;
        return { prompt: `[E] ${npc.promptText}`, nearBlacksmith };
      }
    }
    for (const cage of this.prisonCages) {
      if (!cage.broken && Math.hypot(cage.x - this.player.x, cage.y - this.player.y) <= 30) {
        return { prompt: '[E] Rescue Captured Cat Soldier!', nearBlacksmith };
      }
    }
    for (const chest of this.currentWorld.chests) {
      if (!chest.opened && Math.hypot(chest.x - this.player.x, chest.y - this.player.y) <= 28) {
        return { prompt: `[E] Open ${chest.label}`, nearBlacksmith };
      }
    }
    for (const portal of this.currentWorld.portals) {
      const px = portal.x + portal.width / 2;
      const py = portal.y + portal.height / 2;
      if (Math.hypot(px - this.player.x, py - this.player.y) <= Math.max(portal.width, portal.height) * 0.75 + 10) {
        return { prompt: `[E] ${portal.label}`, nearBlacksmith };
      }
    }
    return { prompt: null, nearBlacksmith };
  }

  public emitHud() {
    const actCfg = this.currentWorld?.act ?? getActConfig(this.currentAct);
    const totals = this.getTotalStats();
    const boss = this.enemies.find((e) => e.isBoss || e.isMiniBoss);
    const { prompt, nearBlacksmith } = this.getNearestInteractPrompt();

    this.onHudUpdate({
      mode: this.mode,
      currentAct: this.currentAct,
      maxUnlockedAct: this.maxUnlockedAct,
      clearedActs: Array.from(this.clearedActs),
      actTitle: actCfg.title,
      biomeName: actCfg.biomeName,
      terrainTag: actCfg.terrainTag,
      nightmareMode: this.nightmareMode,
      nightmareUnlocked: this.nightmareUnlocked,
      hasSavedGame: this.hasSavedGame(),
      hp: Math.ceil(this.player.hp),
      maxHp: this.player.maxHp,
      stamina: this.player.stamina,
      maxStamina: this.player.maxStamina,
      mortalWoundTimer: Number(this.player.mortalWoundTimer.toFixed(1)),
      potionCooldown: Number(this.player.potionCooldown.toFixed(1)),
      potionMaxCooldown: this.player.potionMaxCooldown,
      level: this.player.level,
      xp: this.player.xp,
      xpToNext: this.player.xpToNext,
      gold: this.player.gold,
      fishTreats: this.player.fishTreats,
      materials: this.player.materials,
      healthPotions: this.player.healthPotions,
      hasDuckElixir: this.player.hasDuckElixir,
      duckElixirActive: this.player.duckElixirActive,
      duckElixirTimer: Number(this.player.duckElixirTimer.toFixed(1)),
      duckElixirMaxTimer: this.player.duckElixirMaxTimer,
      duckElixirCooldown: Math.ceil(this.player.duckElixirCooldown),
      elixirFeathers: this.player.elixirFeathers,
      duckSummonCooldown: this.player.duckSummonCooldown,
      warHornActive: this.warHornActiveTimer > 0,
      dragonSlayerFuryTimer: Number(this.player.dragonSlayerFuryTimer.toFixed(1)),
      warMorale: Math.round(this.warMorale),
      alliedUnitCount: this.alliedSoldiers.length,
      capturedBanners: this.warBanners.filter((b) => b.captured).length,
      totalBanners: this.warBanners.length,
      perfectDodgeEmpowered: this.player.perfectDodgeEmpowered,
      furId: this.player.furId,
      activeEmote: this.player.activeEmote,
      alchemyRelics: { ...this.player.alchemyRelics },
      bossRushStage: this.bossRushStage,
      equippedWeapon: this.getEquippedWeapon(),
      equippedArmor: this.getEquippedArmor(),
      inventory: [...this.player.inventory],
      totalAtk: totals.atk,
      totalDef: totals.def,
      totalCrit: totals.crit,
      questText: this.getActiveQuestText(),
      interactPrompt: prompt,
      dragonMount: this.dragonController.mount.active
        ? {
            active: true,
            dragonName: this.dragonController.mount.dragonName,
            timer: Number(this.dragonController.mount.timer.toFixed(1)),
            maxTimer: this.dragonController.mount.maxTimer,
            neckGemHits: this.dragonController.mount.neckGemHits,
          }
        : null,
      activeBoss: boss
        ? {
            name: boss.name,
            hp: Math.max(0, Math.ceil(boss.hp)),
            maxHp: boss.maxHp,
            totalCampaignHp:
              this.currentAct === 41 && (boss.kind === 'fenrir_p1' || boss.kind === 'fenrir_p2')
                ? Math.max(
                    0,
                    Math.ceil(
                      boss.kind === 'fenrir_p1'
                        ? boss.hp + Math.round(150000 * (this.nightmareMode ? 1.55 : 1))
                        : boss.hp
                    )
                  )
                : this.currentAct === 82 && (boss.kind === 'fenrir_p1' || boss.kind === 'fenrir_p2')
                ? Math.max(
                    0,
                    Math.ceil(
                      boss.kind === 'fenrir_p1'
                        ? boss.hp + Math.round(400000 * (this.nightmareMode ? 1.55 : 1))
                        : boss.bossPhase === 2
                        ? boss.hp + Math.round(200000 * (this.nightmareMode ? 1.55 : 1))
                        : boss.hp
                    )
                  )
                : this.currentAct === 122 &&
                  (boss.kind === 'bahamut_p1' || boss.kind === 'bahamut_p2' || boss.kind === 'bahamut_p3')
                ? Math.max(
                    0,
                    Math.ceil(
                      boss.kind === 'bahamut_p1'
                        ? boss.hp + Math.round(1000000 * (this.nightmareMode ? 1.55 : 1))
                        : boss.kind === 'bahamut_p2'
                        ? boss.hp + Math.round(500000 * (this.nightmareMode ? 1.55 : 1))
                        : boss.hp
                    )
                  )
                : undefined,
            totalCampaignMaxHp:
              this.currentAct === 41 && (boss.kind === 'fenrir_p1' || boss.kind === 'fenrir_p2')
                ? Math.round(250000 * (this.nightmareMode ? 1.55 : 1))
                : this.currentAct === 82 && (boss.kind === 'fenrir_p1' || boss.kind === 'fenrir_p2')
                ? Math.round(600000 * (this.nightmareMode ? 1.55 : 1))
                : this.currentAct === 122 &&
                  (boss.kind === 'bahamut_p1' || boss.kind === 'bahamut_p2' || boss.kind === 'bahamut_p3')
                ? Math.round(1500000 * (this.nightmareMode ? 1.55 : 1))
                : undefined,
            stagger: Math.round(boss.stagger ?? 0),
            maxStagger: boss.maxStagger ?? 100,
            stunned: (boss.stunTimer ?? 0) > 0,
            counterStance: (boss.counterStanceTimer ?? 0) > 0,
            overdrive: Boolean(boss.overdrive),
            phaseGateActive: Boolean(boss.isInvulnerablePhaseGate),
            phaseGateTimer: Number((boss.phaseGateTimer ?? 0).toFixed(1)),
            siphonCount: this.siphonObelisks.filter((s) => s.bossId === boss.id && s.hp > 0).length,
            cataclysmBorderPct: this.getCataclysmRingBounds().borderPct,
            phaseText:
              boss.kind === 'aether_null'
                ? `PHASE ${this.bossRaidState.aetherPhase} / 5 · SINGULARITY`
                : boss.kind === 'chronos_omega'
                ? 'CHRONO-TITAN · TIME REWIND'
                : boss.kind === 'charybdis_kraken'
                ? '8-TENTACLE WORLD-KRAKEN'
                : boss.kind === 'bahamut_p1'
                ? 'PHASE 1 / 3'
                : boss.kind === 'bahamut_p2'
                ? 'PHASE 2 / 3 · SKY-FLIGHT'
                : boss.kind === 'bahamut_p3'
                ? 'PHASE 3 / 3 · SUPERNOVA'
                : boss.kind === 'fenrir_p1'
                ? this.currentAct === 82
                  ? 'PHASE 1 / 3'
                  : 'PHASE 1 / 2'
                : boss.kind === 'fenrir_p2'
                ? this.currentAct === 82
                  ? `PHASE ${boss.bossPhase ?? 2} / 3`
                  : 'PHASE 2 / 2'
                : boss.isMiniBoss
                ? 'MINI-BOSS'
                : 'BIOME BOSS',
            shielded: Boolean(boss.shielded),
            krakenTentaclesAlive:
              boss.kind === 'charybdis_kraken' ? this.bossRaidTelemetry.krakenTentaclesAlive : undefined,
            chronoGearsAlive:
              boss.kind === 'chronos_omega' ? this.bossRaidTelemetry.chronoGearsAlive : undefined,
            singularityPullActive:
              boss.kind === 'aether_null' ? this.bossRaidTelemetry.singularityPullActive : undefined,
            dragonRaid: isDragonBossEnemy(boss)
              ? (() => {
                  const ds = ensureDragonState(boss);
                  return {
                    altitude: ds.altitude,
                    wingsHp: Math.max(0, Math.round(ds.wingsHp)),
                    wingsMaxHp: ds.wingsMaxHp,
                    wingsBroken: ds.wingsBroken,
                    tailHp: Math.max(0, Math.round(ds.tailHp)),
                    tailMaxHp: ds.tailMaxHp,
                    tailSevered: ds.tailSevered,
                    coreCracked: ds.coreCracked,
                    headExposedTimer: Number(ds.headExposedTimer.toFixed(1)),
                    harpoonChainsHit: ds.harpoonChainsHit,
                    hoardActive: this.dragonController.hoardPiles.length > 0,
                    supernovaWarning: ds.supernovaWindup > 0,
                    lastHitPart: ds.lastHitPart,
                  };
                })()
              : undefined,
          }
        : null,
      dialogue:
        this.mode === 'DIALOGUE' || this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE'
          ? {
              lines: this.dialogueQueue,
              index: this.dialogueIndex,
              displayedChars: this.dialogueChars,
              isCutscene: this.mode === 'INTRO_CUTSCENE' || this.mode === 'EPILOGUE_CUTSCENE',
            }
          : null,
      toasts: [...this.toasts],
      story: { ...this.story },
      stats: { ...this.stats },
      muted: audio.isMuted(),
      screenShakeEnabled: this.screenShakeEnabled,
      currentTrackTitle: getTrackForAct(this.currentAct, this.currentWorld?.act.role ?? (boss ? 'boss' : 'normal')).title,
      nearBlacksmith,
      actsSummary: ACTS_SUMMARY,
      activeHeroId: this.player.activeHeroId,
      unlockedHeroes: [...this.player.unlockedHeroes],
      partyCompanions: this.player.partyCompanions.map((c) => ({ ...c })),
      starPoints: this.player.starPoints,
      unlockedSkills: [...this.player.unlockedSkills],
      capitalBuildings: { ...this.player.capitalBuildings },
      kingdomResources: { ...this.player.kingdomResources },
      brewedPotions: this.player.brewedPotions.map((b) => ({ ...b })),
      equippedBrewId: this.player.equippedBrewId,
      brewTossCooldown: Number(this.player.brewTossCooldown.toFixed(1)),
      steamMechaActive: this.player.steamMechaActive,
      steamMechaTimer: Number(this.player.steamMechaTimer.toFixed(1)),
      steamMechaCooldown: Number(this.player.steamMechaCooldown.toFixed(1)),
      oxygenPct: Math.round(this.player.oxygenPct),
    });
  }

  private updateAlliedSoldiers(dt: number) {
    const grid = this.currentWorld.grid;
    const nextAllies: AlliedCatSoldier[] = [];

    for (const ally of this.alliedSoldiers) {
      if (ally.rallyTimer > 0) ally.rallyTimer = Math.max(0, ally.rallyTimer - dt);
      if (ally.attackCooldown > 0) ally.attackCooldown = Math.max(0, ally.attackCooldown - dt);

      const speedMult = ally.rallyTimer > 0 ? 1.5 : 1.0;
      const atkMult = ally.rallyTimer > 0 ? 1.5 : 1.0;

      // Ensure Ally never lingers on non-walkable river/lava/wall tiles
      const allyBox = { x: ally.x, y: ally.y, width: 12, height: 12 };
      if (!isWalkableTile(grid, Math.floor(allyBox.x / TILE_SIZE), Math.floor(allyBox.y / TILE_SIZE))) {
        const dry = findNearestDryTile(grid, allyBox.x, allyBox.y, false);
        allyBox.x = dry.x;
        allyBox.y = dry.y;
      }

      // Find nearest unshielded enemy, or follow Nyx in formation
      let targetEnemy: Enemy | null = null;
      let bestDist = 240;
      for (const e of this.enemies) {
        if (e.shielded) continue;
        if (isDragonBossEnemy(e) && ensureDragonState(e).altitude === 'sky') continue;
        const d = Math.hypot(e.x - allyBox.x, e.y - allyBox.y);
        if (d < bestDist) {
          bestDist = d;
          targetEnemy = e;
        }
      }

      if (targetEnemy) {
        const dx = targetEnemy.x - allyBox.x;
        const dy = targetEnemy.y - allyBox.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / dist;
        const ny = dy / dist;
        ally.facing = dx >= 0 ? 'right' : 'left';

        const isRanged = ally.kind === 'calico_archer' || ally.kind === 'arcane_cat_mage';
        const desiredRange = isRanged ? 115 : 22;

        if (dist > desiredRange) {
          this.moveUnitTowardWithBridgePathing(
            allyBox,
            targetEnemy.x,
            targetEnemy.y,
            ally.speed * speedMult,
            dt,
            grid
          );
        }

        if (ally.attackCooldown <= 0 && dist <= desiredRange + 16) {
          ally.attackCooldown = (isRanged ? 1.25 : 0.85) / speedMult;
          if (isRanged) {
            const ang = Math.atan2(dy, dx);
            this.projectiles.push({
              id: `ally_pr_${Date.now()}_${Math.random()}`,
              fromPlayer: true,
              x: allyBox.x,
              y: allyBox.y,
              vx: Math.cos(ang) * 185,
              vy: Math.sin(ang) * 185,
              radius: 3.5,
              damage: Math.round(ally.atk * atkMult),
              life: 1.1,
              maxLife: 1.1,
              color: ally.kind === 'arcane_cat_mage' ? '#c084fc' : '#fde047',
              coreColor: '#ffffff',
              kind: ally.kind === 'arcane_cat_mage' ? 'gem_shard' : 'arrow',
            });
          } else {
            this.spawnParticles(targetEnemy.x, targetEnemy.y, '#fde047', 5, 55);
            this.damageEnemy(targetEnemy, Math.round(ally.atk * atkMult), 15, nx, ny, false, 6);
            // Enemy clashes back slightly in melee
            ally.hp -= Math.max(1, Math.round(targetEnemy.atk * 0.16));
          }
        }
      } else {
        // March alongside Nyx or toward nearest uncaptured War Banner using Bridge-Aware Pathfinding!
        const uncaptured = this.warBanners.find((b) => !b.captured);
        const goalX = uncaptured ? uncaptured.x : this.player.x + (ally.id.charCodeAt(0) % 2 === 0 ? -24 : 24);
        const goalY = uncaptured ? uncaptured.y : this.player.y + (ally.id.charCodeAt(1) % 2 === 0 ? -16 : 16);
        const dx = goalX - allyBox.x;
        const dy = goalY - allyBox.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 20) {
          ally.facing = dx >= 0 ? 'right' : 'left';
          this.moveUnitTowardWithBridgePathing(
            allyBox,
            goalX,
            goalY,
            ally.speed * speedMult,
            dt,
            grid
          );
        }
      }

      ally.x = allyBox.x;
      ally.y = allyBox.y;

      if (ally.hp > 0) {
        nextAllies.push(ally);
      } else {
        this.spawnParticles(ally.x, ally.y, '#94a3b8', 10, 50);
      }
    }

    // Tile-Safe Boids Separation Steering (22px radius) so Allies never overlap AND never step into water/lava!
    for (let i = 0; i < nextAllies.length; i++) {
      const a = nextAllies[i];
      let sepX = 0;
      let sepY = 0;
      for (let j = 0; j < nextAllies.length; j++) {
        if (i === j) continue;
        const b = nextAllies[j];
        const sdx = a.x - b.x;
        const sdy = a.y - b.y;
        const sdist = Math.hypot(sdx, sdy);
        if (sdist < 22) {
          const push = ((22 - sdist) / 22) * 42;
          if (sdist > 0.05) {
            sepX += (sdx / sdist) * push;
            sepY += (sdy / sdist) * push;
          } else {
            const ang = (i * 2.39996) % (Math.PI * 2);
            sepX += Math.cos(ang) * push;
            sepY += Math.sin(ang) * push;
          }
        }
      }
      if (sepX !== 0 || sepY !== 0) {
        const sepBox = { x: a.x, y: a.y, width: 12, height: 12 };
        this.moveEntityWithTileCollision(sepBox, sepX * dt, sepY * dt, grid);
        a.x = sepBox.x;
        a.y = sepBox.y;
      }
    }

    this.alliedSoldiers = nextAllies;
  }

  private updateWarBanners(dt: number) {
    for (const banner of this.warBanners) {
      if (banner.captured) continue;
      const playerInside = Math.hypot(this.player.x - banner.x, this.player.y - banner.y) <= banner.radius + 8;
      const alliesInside = this.alliedSoldiers.filter(
        (a) => Math.hypot(a.x - banner.x, a.y - banner.y) <= banner.radius + 8
      ).length;

      if (playerInside || alliesInside > 0) {
        const rate = (playerInside ? 26 : 0) + alliesInside * 14;
        banner.captureProgress = Math.min(100, banner.captureProgress + rate * dt);
        if (Math.random() < dt * 4) {
          this.spawnParticles(banner.x, banner.y - 8, '#fde047', 2, 35);
        }
        if (banner.captureProgress >= 100) {
          banner.captured = true;
          audio.bannerCaptured();
          this.warMorale = Math.min(100, this.warMorale + 20);
          this.player.gold += 40;
          this.stats.goldCollected += 40;

          if (this.currentAct === 122) {
            const s1 = findNearestDryTile(this.currentWorld.grid, banner.x - 14, banner.y + 8, false);
            const s2 = findNearestDryTile(this.currentWorld.grid, banner.x + 14, banner.y + 8, false);
            const k1 = spawnAlliedSoldier(`ban_k_${banner.id}`, 'cat_knight', s1.x, s1.y, this.currentAct);
            const k2 = spawnAlliedSoldier(`ban_d_${banner.id}`, 'bulldog_paladin', s2.x, s2.y, this.currentAct);
            k1.rallyTimer = 6.0;
            k2.rallyTimer = 6.0;
            this.alliedSoldiers.push(k1, k2);
            this.vfx.spawnShockwave(banner.x, banner.y, 48, '#fde047', 0.36);

            const bahamut = this.enemies.find(
              (e) => e.kind === 'bahamut_p1' || e.kind === 'bahamut_p2' || e.kind === 'bahamut_p3'
            );
            if (bahamut && bahamut.hp > 0) {
              const harpoonDmg = bahamut.shielded ? 2500 : 50000;
              this.vfx.spawnShockwave(bahamut.x, bahamut.y, 70, '#f43f5e', 0.42);
              this.spawnParticles(bahamut.x, bahamut.y, '#fde047', 34, 130);
              this.shake(0.38, 5);
              audio.hitImpact(true);
              this.hitStopTimer = 0.032;
              this.spawnFloatingText(
                bahamut.x,
                bahamut.y - 26,
                `🏹 HARPOON BALLISTA HIT: ${harpoonDmg.toLocaleString()} DMG!`,
                '#fde047',
                1.35
              );
              this.pushToast(
                `🏹 ${banner.label} FIRED! Blazing Harpoon struck Ignis-Bahamut for ${harpoonDmg.toLocaleString()} DMG & +100 STAGGER!`,
                'gold'
              );
              this.damageEnemy(bahamut, harpoonDmg, 100, 0, -1, false, 100);
            }
          } else if (this.currentAct >= 83) {
            const s1 = findNearestDryTile(this.currentWorld.grid, banner.x - 14, banner.y + 8, false);
            const s2 = findNearestDryTile(this.currentWorld.grid, banner.x + 14, banner.y + 8, false);
            const k1 = spawnAlliedSoldier(`ban_k_${banner.id}`, 'cat_knight', s1.x, s1.y, this.currentAct);
            const k2 = spawnAlliedSoldier(`ban_d_${banner.id}`, 'bulldog_paladin', s2.x, s2.y, this.currentAct);
            k1.rallyTimer = 5.0;
            k2.rallyTimer = 5.0;
            this.alliedSoldiers.push(k1, k2);
            this.spawnParticles(banner.x, banner.y, '#fde047', 28, 100);
            this.vfx.spawnShockwave(banner.x, banner.y, 44, '#38bdf8', 0.34);
            this.spawnFloatingText(banner.x, banner.y - 18, '🐱🐶 ALLIANCE BANNER RAISED!', '#fde047', 1.2);
            this.pushToast('🐱🐶 Alliance Banner Captured! +1 Cat Knight & +1 Bulldog Paladin!', 'gold');
            this.triggerDogKingdomCounterAttack(banner.x, banner.y);
          } else {
            const s1 = findNearestDryTile(this.currentWorld.grid, banner.x - 14, banner.y + 8, false);
            const s2 = findNearestDryTile(this.currentWorld.grid, banner.x + 14, banner.y + 8, false);
            const k1 = spawnAlliedSoldier(`ban_k_${banner.id}`, 'cat_knight', s1.x, s1.y, this.currentAct);
            const k2 = spawnAlliedSoldier(`ban_a_${banner.id}`, 'calico_archer', s2.x, s2.y, this.currentAct);
            k1.rallyTimer = 5.0;
            k2.rallyTimer = 5.0;
            this.alliedSoldiers.push(k1, k2);
            this.spawnParticles(banner.x, banner.y, '#fde047', 28, 100);
            this.spawnFloatingText(banner.x, banner.y - 18, '🦁 GOLDEN LION BANNER RAISED!', '#fde047', 1.2);
            this.pushToast('🦁 Golden Lion Banner Captured! +2 Cat Reinforcements & +20% War Morale!', 'gold');
            this.triggerDogKingdomCounterAttack(banner.x, banner.y);
          }
          this.emitHud();
        }
      }
    }

    if (
      this.currentAct >= 42 &&
      this.currentAct !== 122 &&
      this.warMorale >= 65 &&
      !this.dogCounterWaveTriggered &&
      this.enemies.length > 0
    ) {
      this.dogCounterWaveTriggered = true;
      this.triggerDogKingdomCounterAttack(this.player.x + 80, this.player.y);
    }
  }

  private triggerDogKingdomCounterAttack(targetX: number, targetY: number) {
    this.dogCounterWaveTriggered = true;
    audio.dogCounterHorn();
    this.shake(0.42, 4.8);

    // 1. Synchronized Counter-Slash: All nearby non-boss enemies flash crimson/silver together!
    for (const existing of this.enemies) {
      if (!existing.isBoss && Math.hypot(existing.x - targetX, existing.y - targetY) <= 220) {
        existing.counterStanceTimer = 0.85;
        existing.state = 'chase';
        this.spawnParticles(existing.x, existing.y, '#fda4af', 6, 55);
      }
    }

    const now = Date.now();
    const arcCfg = getArcConfig(this.currentAct);

    // Arc IV (Acts 123–180): 10-Abyssal Tide Ambush (Shark-Knights, Crab-Corsairs, Siren-Mages & Kraken Tentacle-Spawns)!
    if (this.currentAct >= 123 && this.currentAct <= 180) {
      const abyssSpecs: Array<{
        kind: 'shark_knight' | 'crab_corsair' | 'siren_mage' | 'kraken_tentacle';
        name: string;
        archetype: Enemy['archetype'];
        offsetX: number;
        offsetY: number;
      }> = [
        { kind: 'shark_knight', name: 'Atlantean Shark-Knight', archetype: 'grunt', offsetX: 54, offsetY: -28 },
        { kind: 'shark_knight', name: 'Megalodon Trident-Guard', archetype: 'grunt', offsetX: 58, offsetY: 0 },
        { kind: 'shark_knight', name: 'Riptide Shark-Paladin', archetype: 'grunt', offsetX: 54, offsetY: 28 },
        { kind: 'crab_corsair', name: 'Armored Crab-Corsair', archetype: 'charger', offsetX: -58, offsetY: -32 },
        { kind: 'crab_corsair', name: 'Iron-Pincer Buccaneer', archetype: 'charger', offsetX: -58, offsetY: 32 },
        { kind: 'crab_corsair', name: 'Reef-Crusher Crab', archetype: 'charger', offsetX: 0, offsetY: -58 },
        { kind: 'siren_mage', name: 'Abyssal Siren-Mage', archetype: 'ranged', offsetX: 86, offsetY: -26 },
        { kind: 'siren_mage', name: 'Tempest Choir Siren', archetype: 'ranged', offsetX: 86, offsetY: 26 },
        { kind: 'kraken_tentacle', name: 'Kraken Tentacle-Spawn', archetype: 'grunt', offsetX: 38, offsetY: -46 },
        { kind: 'kraken_tentacle', name: 'Hadal Crusher-Tentacle', archetype: 'grunt', offsetX: 38, offsetY: 46 },
      ];

      for (let i = 0; i < 10; i++) {
        const spec = abyssSpecs[i];
        const rawX = Math.max(42, Math.min(564, targetX + spec.offsetX));
        const rawY = Math.max(46, Math.min(294, targetY + spec.offsetY));
        const dryPt = findNearestDryTile(this.currentWorld.grid, rawX, rawY, false);
        const unit = spawnEnemy(
          `abyss_tide_${i}_${now}`,
          spec.kind,
          dryPt.x,
          dryPt.y,
          this.currentAct,
          this.nightmareMode,
          spec.name
        );
        unit.archetype = spec.archetype;
        unit.state = 'chase';
        if (spec.kind === 'shark_knight') unit.counterStanceTimer = 0.85;
        this.enemies.push(unit);
        this.vfx.spawnShockwave(dryPt.x, dryPt.y, 26, '#38bdf8', 0.28);
        this.spawnParticles(dryPt.x, dryPt.y, '#38bdf8', 8, 70);
      }

      this.pushToast(`${arcCfg.counterBanner} (${arcCfg.counterSummary})`, 'cyan');
      return;
    }

    // Arc V (Acts 181–240): 10-Automaton Drop-Pods (Steam-Golems, Clockwork Owls, Cyber-Rat Snipers & Tesla Drones)!
    if (this.currentAct >= 181 && this.currentAct <= 240) {
      const mechaSpecs: Array<{
        kind: 'steam_golem' | 'clockwork_owl' | 'cyber_rat' | 'tesla_drone';
        name: string;
        archetype: Enemy['archetype'];
        offsetX: number;
        offsetY: number;
      }> = [
        { kind: 'steam_golem', name: 'Brass Steam-Golem', archetype: 'grunt', offsetX: 54, offsetY: -28 },
        { kind: 'steam_golem', name: 'Piston Siege-Automaton', archetype: 'grunt', offsetX: 58, offsetY: 0 },
        { kind: 'steam_golem', name: 'Boiler-Core Juggernaut', archetype: 'grunt', offsetX: 54, offsetY: 28 },
        { kind: 'clockwork_owl', name: 'Clockwork Razor-Owl', archetype: 'charger', offsetX: -58, offsetY: -32 },
        { kind: 'clockwork_owl', name: 'Chrono-Wing Interceptor', archetype: 'charger', offsetX: -58, offsetY: 32 },
        { kind: 'clockwork_owl', name: 'Aether-Gear Raptor', archetype: 'charger', offsetX: 0, offsetY: -58 },
        { kind: 'cyber_rat', name: 'Cyber-Rat Railgun Sniper', archetype: 'ranged', offsetX: 86, offsetY: -26 },
        { kind: 'cyber_rat', name: 'Neon-Scope Saboteur', archetype: 'ranged', offsetX: 86, offsetY: 26 },
        { kind: 'tesla_drone', name: 'Arc-Coil Tesla Drone', archetype: 'ranged', offsetX: 38, offsetY: -46 },
        { kind: 'tesla_drone', name: 'Overclocked Volt-Sphere', archetype: 'ranged', offsetX: 38, offsetY: 46 },
      ];

      for (let i = 0; i < 10; i++) {
        const spec = mechaSpecs[i];
        const rawX = Math.max(42, Math.min(564, targetX + spec.offsetX));
        const rawY = Math.max(46, Math.min(294, targetY + spec.offsetY));
        const dryPt = findNearestDryTile(this.currentWorld.grid, rawX, rawY, false);
        const unit = spawnEnemy(
          `mecha_drop_${i}_${now}`,
          spec.kind,
          dryPt.x,
          dryPt.y,
          this.currentAct,
          this.nightmareMode,
          spec.name
        );
        unit.archetype = spec.archetype;
        unit.state = 'chase';
        if (spec.kind === 'steam_golem') unit.counterStanceTimer = 0.85;
        this.enemies.push(unit);
        this.vfx.spawnShockwave(dryPt.x, dryPt.y, 26, '#fbbf24', 0.28);
        this.spawnParticles(dryPt.x, dryPt.y, '#fbbf24', 8, 70);
      }

      this.pushToast(`${arcCfg.counterBanner} (${arcCfg.counterSummary})`, 'gold');
      return;
    }

    // Arc VI (Acts 241–300): 10-Void Rift Incursion (Void-Stalkers, Astral Wraiths, Singularity Knights & Eclipse Mages)!
    if (this.currentAct >= 241) {
      const voidSpecs: Array<{
        kind: 'void_stalker' | 'nebula_seraph' | 'entropy_knight' | 'void_sorcerer';
        name: string;
        archetype: Enemy['archetype'];
        offsetX: number;
        offsetY: number;
      }> = [
        { kind: 'void_stalker', name: 'Dimensional Void-Stalker', archetype: 'charger', offsetX: 54, offsetY: -28 },
        { kind: 'void_stalker', name: 'Event-Horizon Predator', archetype: 'charger', offsetX: 58, offsetY: 0 },
        { kind: 'void_stalker', name: 'Null-Rift Assassin', archetype: 'charger', offsetX: 54, offsetY: 28 },
        { kind: 'nebula_seraph', name: 'Corrupted Astral Wraith', archetype: 'ranged', offsetX: -58, offsetY: -32 },
        { kind: 'nebula_seraph', name: 'Quasar-Wing Seraph', archetype: 'ranged', offsetX: -58, offsetY: 32 },
        { kind: 'nebula_seraph', name: 'Dark-Star Choir Wraith', archetype: 'ranged', offsetX: 0, offsetY: -58 },
        { kind: 'entropy_knight', name: 'Singularity Dread-Knight', archetype: 'grunt', offsetX: 38, offsetY: -46 },
        { kind: 'entropy_knight', name: 'Black-Hole Vanguard', archetype: 'grunt', offsetX: 38, offsetY: 46 },
        { kind: 'void_sorcerer', name: 'Eclipse Singularity Mage', archetype: 'ranged', offsetX: 86, offsetY: -26 },
        { kind: 'void_sorcerer', name: 'Herald of Aether-Null', archetype: 'ranged', offsetX: 86, offsetY: 26 },
      ];

      for (let i = 0; i < 10; i++) {
        const spec = voidSpecs[i];
        const rawX = Math.max(42, Math.min(564, targetX + spec.offsetX));
        const rawY = Math.max(46, Math.min(294, targetY + spec.offsetY));
        const dryPt = findNearestDryTile(this.currentWorld.grid, rawX, rawY, false);
        const unit = spawnEnemy(
          `void_rift_${i}_${now}`,
          spec.kind,
          dryPt.x,
          dryPt.y,
          this.currentAct,
          this.nightmareMode,
          spec.name
        );
        unit.archetype = spec.archetype;
        unit.state = 'chase';
        if (spec.kind === 'entropy_knight') unit.counterStanceTimer = 0.85;
        this.enemies.push(unit);
        this.vfx.spawnShockwave(dryPt.x, dryPt.y, 26, '#c084fc', 0.28);
        this.spawnParticles(dryPt.x, dryPt.y, '#c084fc', 8, 70);
      }

      this.pushToast(`${arcCfg.counterBanner} (${arcCfg.counterSummary})`, 'amber');
      return;
    }

    if (this.currentAct >= 83 && this.currentAct <= 122) {
      // Arc III (Acts 83–122): 10-Dragonkin Sky-Drop Counter-Attack Squad!
      const drakeSpecs: Array<{
        kind: 'wyvern_kin' | 'drakonid_lancer' | 'kobold_thief' | 'magma_drake' | 'void_sorcerer';
        name: string;
        archetype: Enemy['archetype'];
        offsetX: number;
        offsetY: number;
      }> = [
        { kind: 'wyvern_kin', name: 'Sky-Drop Flame Wyvern', archetype: 'charger', offsetX: 54, offsetY: -28 },
        { kind: 'wyvern_kin', name: 'Sky-Drop Storm Wyvern', archetype: 'charger', offsetX: 58, offsetY: 0 },
        { kind: 'wyvern_kin', name: 'Sky-Drop Gale Wyvern', archetype: 'charger', offsetX: 54, offsetY: 28 },
        { kind: 'drakonid_lancer', name: 'Drakonid Shield-Lancer', archetype: 'grunt', offsetX: -58, offsetY: -32 },
        { kind: 'drakonid_lancer', name: 'Drakonid Iron-Lancer', archetype: 'grunt', offsetX: -58, offsetY: 32 },
        { kind: 'drakonid_lancer', name: 'Drakonid Spear-Guard', archetype: 'grunt', offsetX: 0, offsetY: -58 },
        { kind: 'kobold_thief', name: 'Kobold Relic-Raider', archetype: 'charger', offsetX: 38, offsetY: -46 },
        { kind: 'kobold_thief', name: 'Kobold Gold-Snatcher', archetype: 'charger', offsetX: 38, offsetY: 46 },
        { kind: 'magma_drake', name: 'Obsidian Magma-Drake', archetype: 'ranged', offsetX: 86, offsetY: -26 },
        { kind: 'void_sorcerer', name: 'Dragon-Cult Void Sorcerer', archetype: 'ranged', offsetX: 86, offsetY: 26 },
      ];

      for (let i = 0; i < 10; i++) {
        const spec = drakeSpecs[i];
        const rawX = Math.max(42, Math.min(564, targetX + spec.offsetX));
        const rawY = Math.max(46, Math.min(294, targetY + spec.offsetY));
        const dryPt = findNearestDryTile(this.currentWorld.grid, rawX, rawY, false);
        const unit = spawnEnemy(
          `drake_drop_${i}_${now}`,
          spec.kind,
          dryPt.x,
          dryPt.y,
          this.currentAct,
          this.nightmareMode,
          spec.name
        );
        unit.archetype = spec.archetype;
        unit.state = 'chase';
        if (spec.kind === 'drakonid_lancer') unit.counterStanceTimer = 0.85;
        this.enemies.push(unit);
        this.vfx.spawnShockwave(dryPt.x, dryPt.y, 26, '#f97316', 0.28);
        this.spawnParticles(dryPt.x, dryPt.y, '#f97316', 8, 70);
      }

      this.hazards.push({
        id: `drake_barrage_${now}`,
        x: Math.max(48, Math.min(540, targetX)),
        y: Math.max(52, Math.min(280, targetY)),
        radius: 28,
        life: 0.95,
        kind: 'meteor_warn',
        damagePerSec: Math.round(18 + this.currentAct * 1.25),
        triggered: false,
      });
      this.pushToast(`${arcCfg.counterBanner} (${arcCfg.counterSummary})`, 'amber');
      return;
    }

    // Arc II (Acts 42–82): Deploy a full 10-Unit Dog Kingdom Strike Pack simultaneously on validated dry ground:
    const packSpecs: Array<{
      kind: 'hound_scout' | 'shadow_wolf';
      breedId: 'bulldog_phalanx' | 'doberman_shock' | 'husky_raider' | 'bloodhound_gunner';
      name: string;
      archetype: Enemy['archetype'];
      offsetX: number;
      offsetY: number;
    }> = [
      { kind: 'hound_scout', breedId: 'bulldog_phalanx', name: 'Bulldog Heavy Shield-Bearer', archetype: 'grunt', offsetX: 54, offsetY: -26 },
      { kind: 'hound_scout', breedId: 'bulldog_phalanx', name: 'Bulldog Heavy Shield-Bearer', archetype: 'grunt', offsetX: 58, offsetY: 0 },
      { kind: 'hound_scout', breedId: 'bulldog_phalanx', name: 'Bulldog Heavy Shield-Bearer', archetype: 'grunt', offsetX: 54, offsetY: 26 },
      { kind: 'shadow_wolf', breedId: 'doberman_shock', name: 'Doberman Shock-Assassin', archetype: 'charger', offsetX: -66, offsetY: -34 },
      { kind: 'shadow_wolf', breedId: 'doberman_shock', name: 'Doberman Shock-Assassin', archetype: 'charger', offsetX: -66, offsetY: 34 },
      { kind: 'shadow_wolf', breedId: 'doberman_shock', name: 'Doberman Shock-Assassin', archetype: 'charger', offsetX: 0, offsetY: -62 },
      { kind: 'hound_scout', breedId: 'husky_raider', name: 'Siberian Husky Berserker', archetype: 'charger', offsetX: 38, offsetY: -48 },
      { kind: 'hound_scout', breedId: 'husky_raider', name: 'Siberian Husky Berserker', archetype: 'charger', offsetX: 38, offsetY: 48 },
      { kind: 'hound_scout', breedId: 'bloodhound_gunner', name: 'Bloodhound Mortar Gunner', archetype: 'ranged', offsetX: 88, offsetY: -28 },
      { kind: 'hound_scout', breedId: 'bloodhound_gunner', name: 'Bloodhound Crossbow Gunner', archetype: 'ranged', offsetX: 88, offsetY: 28 },
    ];

    for (let i = 0; i < 10; i++) {
      const spec = packSpecs[i];
      const rawX = Math.max(42, Math.min(564, targetX + spec.offsetX));
      const rawY = Math.max(46, Math.min(294, targetY + spec.offsetY));
      const dryPt = findNearestDryTile(this.currentWorld.grid, rawX, rawY, false);
      const unit = spawnEnemy(
        `dog_counter_${i}_${now}`,
        spec.kind,
        dryPt.x,
        dryPt.y,
        this.currentAct,
        this.nightmareMode,
        spec.name
      );
      unit.archetype = spec.archetype;
      unit.state = 'chase';
      if (unit.variant) {
        unit.variant.breedId = spec.breedId;
        unit.variant.helmetId = i % 5;
        unit.variant.weaponId = i % 4;
        unit.variant.scarOrStripe = i % 4;
        unit.variant.animPhaseOffset = (i * 0.628) % (Math.PI * 2);
      }
      if (i < 3) {
        unit.counterStanceTimer = 0.85;
      }
      this.enemies.push(unit);
      this.spawnParticles(dryPt.x, dryPt.y, '#f43f5e', 8, 65);
    }

    this.hazards.push({
      id: `counter_barrage_${now}`,
      x: Math.max(48, Math.min(540, targetX)),
      y: Math.max(52, Math.min(280, targetY)),
      radius: 26,
      life: 1.0,
      kind: 'meteor_warn',
      damagePerSec: Math.round(16 + this.currentAct * 1.2),
      triggered: false,
    });
    this.pushToast(`${arcCfg.counterBanner} (${arcCfg.counterSummary})`, 'amber');
  }

  private updateSiegeEngines(dt: number) {
    if (this.enemies.length === 0) return;
    for (const siege of this.siegeEngines) {
      if (siege.destroyed) continue;
      siege.fireTimer -= dt;
      if (siege.fireTimer <= 0) {
        siege.fireTimer = 3.5;
        const targetX = this.player.x + (Math.random() - 0.5) * 32;
        const targetY = this.player.y + (Math.random() - 0.5) * 32;
        this.hazards.push({
          id: `siege_boulder_${Date.now()}_${siege.id}`,
          x: targetX,
          y: targetY,
          radius: 24,
          life: 1.05,
          kind: 'meteor_warn',
          damagePerSec: Math.round(18 + this.currentAct * 1.4),
          triggered: false,
        });
        this.spawnParticles(siege.x, siege.y - 6, '#f97316', 8, 60);
      }
    }
  }

  private updateDuckCompanions(dt: number) {
    if (this.story.spokeToGreatDuck) {
      const targetX = this.player.x + (this.player.facing === 'right' ? -18 : 18);
      const targetY = this.player.y + 8;
      this.duckling.x += (targetX - this.duckling.x) * Math.min(1, dt * 4.5);
      this.duckling.y += (targetY - this.duckling.y) * Math.min(1, dt * 4.5);

      this.duckling.fireTimer -= dt;
      if (this.duckling.fireTimer <= 0 && this.enemies.length > 0) {
        let nearest: Enemy | null = null;
        let bestDist = 145;
        for (const e of this.enemies) {
          if (e.shielded) continue;
          const d = Math.hypot(e.x - this.duckling.x, e.y - this.duckling.y);
          if (d < bestDist) {
            bestDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          this.duckling.fireTimer = 1.5;
          const ang = Math.atan2(nearest.y - this.duckling.y, nearest.x - this.duckling.x);
          this.projectiles.push({
            id: `bub_${Date.now()}_${Math.random()}`,
            fromPlayer: true,
            x: this.duckling.x,
            y: this.duckling.y,
            vx: Math.cos(ang) * 165,
            vy: Math.sin(ang) * 165,
            radius: 3.5,
            damage: Math.max(8, Math.round(this.getTotalStats().atk * 0.4)),
            life: 1.0,
            maxLife: 1.0,
            color: '#38bdf8',
            coreColor: '#e0f2fe',
            kind: 'water_bubble',
          });
        }
      }
    }

    // Party companions (King Leo, Wolf-King Fenrir, The Great Duck) are updated by updatePartyCompanions()

    if (this.player.alchemyRelics.primalGuardian) {
      this.guardianFireTimer -= dt;
      if (this.guardianFireTimer <= 0 && this.enemies.length > 0) {
        let nearest: Enemy | null = null;
        let bestDist = 170;
        for (const e of this.enemies) {
          if (e.shielded) continue;
          const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
          if (d < bestDist) {
            bestDist = d;
            nearest = e;
          }
        }
        if (nearest) {
          this.guardianFireTimer = 1.2;
          const orbitAng = this.globalTime * 3.4;
          const gx = this.player.x + Math.cos(orbitAng) * 20;
          const gy = this.player.y + Math.sin(orbitAng) * 20;
          const ang = Math.atan2(nearest.y - gy, nearest.x - gx);
          this.projectiles.push({
            id: `grd_${Date.now()}_${Math.random()}`,
            fromPlayer: true,
            x: gx,
            y: gy,
            vx: Math.cos(ang) * 200,
            vy: Math.sin(ang) * 200,
            radius: 4,
            damage: Math.max(10, Math.round(this.getTotalStats().atk * 0.52)),
            life: 1.1,
            maxLife: 1.1,
            color: '#10b981',
            coreColor: '#ecfdf5',
            kind: 'water_bubble',
          });
        }
      }
    }

    if (this.duckFlyover.active) {
      this.duckFlyover.x += 235 * dt;
      const expectedEggs = Math.floor((this.duckFlyover.x - this.camX) / 85);
      if (expectedEggs > this.duckFlyover.eggsDropped && this.duckFlyover.eggsDropped < 5) {
        this.duckFlyover.eggsDropped += 1;
        const target = this.enemies[this.duckFlyover.eggsDropped % Math.max(1, this.enemies.length)];
        const dropX = target ? target.x : this.duckFlyover.x;
        const dropY = target ? target.y : this.player.y;
        this.goldenEggs.push({
          x: dropX,
          y: this.duckFlyover.y,
          targetY: dropY,
          vy: 195,
          damage: Math.round(this.getTotalStats().atk * 1.75),
        });
      }
      if (this.duckFlyover.x > this.camX + LOGICAL_W + 40) {
        this.duckFlyover.active = false;
      }
    }

    const nextEggs: typeof this.goldenEggs = [];
    for (const egg of this.goldenEggs) {
      egg.y += egg.vy * dt;
      if (egg.y >= egg.targetY) {
        audio.hitImpact(true);
        this.shake(0.15, 3);
        this.spawnParticles(egg.x, egg.targetY, '#fde047', 16, 90);
        for (const e of [...this.enemies]) {
          if (Math.hypot(e.x - egg.x, e.y - egg.targetY) <= 46) {
            this.damageEnemy(e, egg.damage, 35, 0, -1);
          }
        }
      } else {
        nextEggs.push(egg);
      }
    }
    this.goldenEggs = nextEggs;
  }

  private triggerHaptic(pattern: number | number[]) {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore if vibration is blocked
    }
  }
}

export { GEAR_CATALOG };
