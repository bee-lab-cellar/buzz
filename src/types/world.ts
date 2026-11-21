/**
 * Pillar 1 — Strict World, Tile, Trap, Landmark, Hydrology, Lighting Occluder,
 * Arc Faction Routing & V7 Save Vault Types. Zero `any`.
 */

import type { CubicBezierSpline, ElevationTier, Polygon2D, Vec2 } from './math';
import type { EnemyFactionId, HeroId } from './entities';
import type { CapitalBuildingId } from './saveAndProgression';

export type ArcNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type TileId =
  | 'grass'
  | 'dirt_road'
  | 'tall_stealth_grass'
  | 'river_water'
  | 'shallow_ford'
  | 'wood_bridge'
  | 'stone_bridge'
  | 'cliff_wall'
  | 'stair_ramp'
  | 'cobble_patio'
  | 'lava'
  | 'ice_sheet'
  | 'cracking_ice'
  | 'acid_bog'
  | 'conveyor_belt'
  | 'star_forge_tile';

export type TrapCategory =
  | 'swinging_log'
  | 'rolling_boulder'
  | 'bounce_mushroom'
  | 'cracking_ice'
  | 'explosive_minecart'
  | 'laser_prism'
  | 'quicksand_whirlpool'
  | 'dart_totem'
  | 'rune_drawbridge'
  | 'trench_landmine'
  | 'blizzard_brazier'
  | 'factory_crusher'
  | 'battering_ram_payload'
  | 'wildfire_barrel'
  | 'rising_acid_tide'
  | 'rotating_firebar'
  | 'updraft_geyser'
  | 'oxygen_vent'
  | 'steam_mecha_bay'
  | 'black_hole_well'
  | 'sawmill_buzzsaw'
  | 'bear_trap'
  | 'chain_lightning_pylon'
  | 'leaf_pitfall'
  | 'retracting_thorn_wall'
  | 'poison_puffball'
  | 'darkness_lantern'
  | 'cliff_wind_gust'
  | 'magma_geyser'
  | 'boiling_oil_cauldron'
  | 'bamboo_warp_mirror'
  | 'barbed_wire_trench'
  | 'artillery_barrage'
  | 'moving_river_barge'
  | 'rockslide_lever'
  | 'windmill_propeller'
  | 'conveyor_belt_hazard'
  | 'chandelier_drop'
  | 'electric_floor_tile'
  | 'spreading_wildfire_barrel'
  | 'gold_mimic'
  | 'lightning_spire'
  | 'twister_vortex'
  | 'dragonfire_brazier'
  | 'chrono_slow_dome'
  | 'fire_spinner_bar'
  | 'depth_charge_mine'
  | 'siren_whirlpool'
  | 'ink_cloud_vent'
  | 'steam_valve_jet'
  | 'gear_blade_track'
  | 'phantom_rail_train'
  | 'tesla_arc_coil'
  | 'void_rift_tear'
  | 'gravity_flip_pad';

export interface TrapInstance {
  readonly id: string;
  readonly category: TrapCategory;
  position: Vec2;
  elevation: ElevationTier;
  triggerIntervalSec: number;
  damage: number;
  radius: number;
  direction: 'N' | 'S' | 'E' | 'W' | 'RADIAL';
  patrolWaypoints: ReadonlyArray<Vec2>;
}

export type TrapEntity = TrapInstance;

export interface LandmarkSpec {
  readonly id: string;
  readonly name: string;
  readonly position: Vec2;
  readonly loreSummary: string;
  readonly auraColor: string;
  readonly interactiveBuff: 'heal_pulse' | 'gold_blessing' | 'mana_surge' | 'lore_shrine';
}

export interface RiverBridgeSpan {
  readonly centerCol: number;
  readonly centerRow: number;
  readonly halfWidthTiles: number;
  readonly orientation: 'horizontal' | 'vertical';
  readonly style: 'wood_railed' | 'stone_arched' | 'coral_bridge' | 'astral_span';
}

export interface RiverBezierSpline {
  readonly spline: CubicBezierSpline;
  readonly liquid: 'water' | 'acid' | 'lava' | 'void_stream';
  readonly widthTiles: number;
  readonly flowVelocity: Vec2;
  readonly bridges: ReadonlyArray<RiverBridgeSpan>;
}

export type RiverHydrologySpec = RiverBezierSpline;

export interface LightingOccluder {
  readonly id: string;
  readonly kind: 'cliff_ledge' | 'castle_wall' | 'pillar' | 'boss_monolith';
  readonly polygon: Polygon2D;
  readonly castsShadow: boolean;
  readonly elevation: ElevationTier;
}

export interface ArcFactionConfig {
  readonly arcNumber: ArcNumber;
  readonly actMin: number;
  readonly actMax: number;
  readonly arcBadge: string;
  readonly arcTitle: string;
  readonly factionId: EnemyFactionId;
  readonly enemyFactionLabel: string;
  readonly counterBanner: string;
  readonly counterSquadSummary: string;
  readonly captainPrefix: string;
  readonly enemyKinds: ReadonlyArray<string>;
  readonly sanctuaryAct: number;
  readonly finaleAct: number;
}

export interface SanctuaryPortalConfig {
  readonly sanctuaryAct: number;
  readonly destinationAct: number;
  readonly portalLabel: string;
  readonly themeColor: string;
  readonly unlocksNextArc: boolean;
}

export interface ActBlueprint {
  readonly actId: number;
  readonly arc: ArcNumber;
  readonly title: string;
  readonly subRegion: string;
  readonly biomeTheme: string;
  readonly tileGrid: ReadonlyArray<ReadonlyArray<number>>;
  readonly elevationGrid: ReadonlyArray<ReadonlyArray<ElevationTier>>;
  readonly river: RiverBezierSpline | null;
  readonly occluders: ReadonlyArray<LightingOccluder>;
  readonly traps: ReadonlyArray<TrapEntity>;
  readonly landmark: LandmarkSpec;
  readonly blacksmithCol: number;
  readonly blacksmithRow: number;
  readonly isSanctuary: boolean;
  readonly isFinaleBoss: boolean;
  readonly sanctuaryRouting: SanctuaryPortalConfig | null;
}

export interface SaveVaultPayloadV7 {
  readonly schemaVersion: 7;
  readonly savedAtIso: string;
  currentAct: number;
  maxUnlockedAct: number;
  clearedActs: number[];
  activeHeroId: HeroId;
  unlockedHeroes: HeroId[];
  level: number;
  xp: number;
  gold: number;
  starPoints: number;
  healthPotions: number;
  hasDuckElixir: boolean;
  nightmareMode: boolean;
  nightmareUnlocked: boolean;
  screenShakeEnabled: boolean;
  muted: boolean;
  equippedWeaponId: string;
  equippedArmorId: string;
  ownedGearIds: string[];
  gearStarLevels: Record<string, number>;
  primordialGearIds: string[];
  capitalBuildingLevels: Record<CapitalBuildingId, number>;
  unlockedSkillNodeIds: string[];
  brewedFlaskCounts: Record<string, number>;
  lastReplaySerialized?: string;
  /** Explicit flag required before any save write may downgrade maxUnlockedAct */
  forceReset?: boolean;
}

export type ArcId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type OmniverseFactionId =
  | 'usurper_wolves'
  | 'iron_hound_legion'
  | 'draconic_cataclysm'
  | 'abyssal_kraken_armada'
  | 'clockwork_mecha_empire'
  | 'volcanic_obsidian_horde'
  | 'astral_glacier_giants'
  | 'tempest_sky_griffins'
  | 'mirror_shadow_doppelgangers'
  | 'void_eclipse_singularity';

export interface BiomePaletteSpec {
  readonly groundPrimary: string;
  readonly groundSecondary: string;
  readonly roadHex: string;
  readonly liquidHex: string;
  readonly cliffHex: string;
  readonly accentHex: string;
}

export interface OmniverseArcConfig {
  readonly arcId: ArcId;
  readonly actMin: number;
  readonly actMax: number;
  readonly arcBadge: string;
  readonly arcTitle: string;
  readonly factionId: OmniverseFactionId;
  readonly factionLabel: string;
  readonly captainPrefix: string;
  readonly enemyPool: ReadonlyArray<string>;
  readonly sanctuaryAct: number;
  readonly finalBossAct: number;
  readonly finalBossName: string;
  readonly finalBossMaxHp: number;
  readonly palette: BiomePaletteSpec;
}

export interface OmniverseSanctuaryScript {
  readonly sanctuaryAct: number;
  readonly destinationAct: number;
  readonly speaker: string;
  readonly greetingLine: string;
  readonly blessingLine: string;
  readonly portalLabel: string;
  readonly themeColor: string;
}

export interface OmniverseActBlueprint {
  readonly actId: number;
  readonly arcId: ArcId;
  readonly title: string;
  readonly subRegion: string;
  readonly biomeTheme: string;
  readonly palette: BiomePaletteSpec;
  readonly tileGrid: ReadonlyArray<ReadonlyArray<number>>;
  readonly elevationGrid: ReadonlyArray<ReadonlyArray<ElevationTier>>;
  readonly river: RiverBezierSpline | null;
  readonly occluders: ReadonlyArray<LightingOccluder>;
  readonly traps: ReadonlyArray<TrapEntity>;
  readonly landmark: LandmarkSpec;
  readonly heroSpawnCol: number;
  readonly heroSpawnRow: number;
  readonly blacksmithCol: number;
  readonly blacksmithRow: number;
  readonly factionId: OmniverseFactionId;
  readonly enemyPool: ReadonlyArray<string>;
  readonly isSanctuary: boolean;
  readonly isRegionalBoss: boolean;
  readonly isArcFinalBoss: boolean;
  readonly bossId: string | null;
  readonly sanctuaryScript: OmniverseSanctuaryScript | null;
  readonly sanctuaryPortalDestination: number | null;
}

export interface CutsceneKeyframe {
  readonly id: string;
  readonly durationSec: number;
  readonly camX: number;
  readonly camY: number;
  readonly camZoom: number;
  readonly letterboxPx: number;
  readonly speaker: string;
  readonly dialogue: string;
  readonly lightingHex: string;
}

export interface CutsceneTrack {
  readonly id: string;
  readonly arcId: ArcId;
  readonly title: string;
  readonly triggerAct: number;
  readonly keyframes: ReadonlyArray<CutsceneKeyframe>;
}

export interface SaveVaultPayloadV8 {
  readonly schemaVersion: 8;
  readonly savedAtIso: string;
  currentAct: number;
  maxUnlockedAct: number;
  clearedActs: number[];
  activeHeroId: HeroId;
  unlockedHeroes: HeroId[];
  level: number;
  xp: number;
  gold: number;
  starPoints: number;
  healthPotions: number;
  hasDuckElixir: boolean;
  nightmareMode: boolean;
  nightmareUnlocked: boolean;
  screenShakeEnabled: boolean;
  muted: boolean;
  equippedWeaponId: string;
  equippedArmorId: string;
  ownedGearIds: string[];
  gearStarLevels: Record<string, number>;
  primordialGearIds: string[];
  capitalBuildingLevels: Record<CapitalBuildingId, number>;
  unlockedSkillNodeIds: string[];
  brewedFlaskCounts: Record<string, number>;
  lastReplaySerialized?: string;
  forceReset?: boolean;
}

export type DayNightPhase = 'dawn' | 'noon' | 'dusk' | 'midnight' | 'blood_eclipse';

export type WeatherKind =
  | 'clear'
  | 'rain'
  | 'snow'
  | 'ash_embers'
  | 'starlight_motes'
  | 'underwater_bubbles'
  | 'void_sparks';

export interface BountyQuestSpec {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly targetArc: ArcId;
  readonly targetCount: number;
  readonly rewardGold: number;
  readonly rewardStarPoints: number;
  readonly rewardTitleId: string;
}

export interface AchievementTitleSpec {
  readonly id: string;
  readonly badge: string;
  readonly title: string;
  readonly requirement: string;
  readonly bonusAtkPct: number;
  readonly bonusDefPct: number;
}

export interface CapitalBuildingSpec {
  readonly id: CapitalBuildingId;
  readonly name: string;
  readonly maxLevel: number;
  readonly baseGoldCost: number;
  readonly description: string;
  readonly passiveBonusLabel: string;
}

export type TileKindCode = 0 | 1 | 2 | 3 | 4;

export interface CustomDungeonEntityPlacement {
  readonly id: string;
  readonly kind: 'hero_spawn' | 'blacksmith' | 'enemy_squad' | 'boss_spawn' | 'war_banner' | 'exit_portal' | 'trap';
  readonly col: number;
  readonly row: number;
  readonly subtype?: string;
}

export interface CustomDungeonMapV1 {
  readonly version: 1;
  readonly name: string;
  readonly arcId: ArcId;
  readonly cols: 24;
  readonly rows: 14;
  readonly tiles: TileKindCode[][];
  readonly spawnTile: { readonly col: number; readonly row: number };
  readonly bossTile: { readonly col: number; readonly row: number };
  readonly trapCount: number;
  readonly placements?: CustomDungeonEntityPlacement[];
}


