/**
 * Layer 2 — Arc I: The Stolen Starlight Wand & Quest for The Great Duck (Acts 1–100)
 * Sanctuary: Act 99 (Lotus Sanctuary -> Act 100)
 * Arc Final Boss: Act 100 — Usurper King Fenrir (250,000 HP, 2 Phases + 20s Timed Great Duck's Elixir)
 *
 * Also exports the deterministic `buildArc100Acts()` compiler used by all 10 Arc files
 * to guarantee dry-land Hero & Blacksmith spawns, Bezier river bridges, lighting occluders,
 * clean outer-perimeter framing, and dynamic `act + 1` Sanctuary Portal routing across Acts 1–1,000.
 */

import { Mulberry32, type ElevationTier } from '../types/math';
import type {
  OmniverseActBlueprint,
  OmniverseArcConfig,
  OmniverseSanctuaryScript,
  RiverBezierSpline,
  TrapCategory,
  TrapEntity,
} from '../types/world';
import {
  distancePointToBezierRiver,
  snapEntityToDryLand,
  stampBlacksmith3x3StonePatio,
} from '../math/bezierRiverAndElevation';
import { enforceOpenArenaPerimeterFraming } from '../sprites/cleanBiomeTileset';

export interface ArcSubRegionSeed {
  readonly name: string;
  readonly biomeTheme: string;
  readonly landmarkPrefix: string;
  readonly trapPool: ReadonlyArray<TrapCategory>;
  readonly liquid: RiverBezierSpline['liquid'];
  readonly bridgeStyle: 'wood_railed' | 'stone_arched' | 'coral_bridge' | 'astral_span';
}

export function buildArc100Acts(
  config: OmniverseArcConfig,
  subRegions: ReadonlyArray<ArcSubRegionSeed>,
  sanctuaryScript: OmniverseSanctuaryScript,
): ReadonlyArray<OmniverseActBlueprint> {
  const acts: OmniverseActBlueprint[] = [];
  const rows = 14;
  const cols = 24;
  const tilePx = 20;

  for (let offset = 0; offset < 100; offset++) {
    const actId = config.actMin + offset;
    const regionIdx = Math.min(subRegions.length - 1, Math.floor(offset / 10));
    const region = subRegions[regionIdx];
    const rng = new Mulberry32(actId * 2654435761 ^ (config.arcId * 0x9e3779b9));

    const isSanctuary = actId === config.sanctuaryAct;
    const isArcFinalBoss = actId === config.finalBossAct;
    const isRegionalBoss = !isArcFinalBoss && actId % 10 === 0;

    // Build clean 14x24 tile grid & 3-tier elevation grid
    const tileGrid: number[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    const elevationGrid: ElevationTier[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c): ElevationTier => {
        if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) return 2;
        if (!isSanctuary && r >= 2 && r <= 4 && c >= 15 && c <= 20) return 1;
        return 0;
      }),
    );

    // Horizontal dirt road connecting west entrance to east boss/portal zone
    const roadRow = 6 + (actId % 3);
    for (let c = 1; c < cols - 1; c++) {
      tileGrid[roadRow][c] = 1;
    }

    // Tall stealth grass pockets on dry flanks
    if (!isSanctuary) {
      const grassStartC = 4 + (actId % 4);
      for (let c = grassStartC; c < grassStartC + 3; c++) {
        tileGrid[3][c] = 2;
        tileGrid[rows - 4][c + 6] = 2;
      }
    }

    // Analytic Cubic Bezier River with guaranteed dry bridge span on non-Sanctuary maps
    let river: RiverBezierSpline | null = null;
    if (!isSanctuary && actId % 2 === 0) {
      const riverColBase = 11 + (actId % 4);
      const riverSpline = {
        p0: { x: riverColBase * tilePx, y: 0 },
        p1: { x: (riverColBase - 1.5) * tilePx, y: rows * tilePx * 0.33 },
        p2: { x: (riverColBase + 1.5) * tilePx, y: rows * tilePx * 0.67 },
        p3: { x: riverColBase * tilePx, y: rows * tilePx },
      };
      const liquidCode =
        region.liquid === 'lava' ? 10 : region.liquid === 'acid' ? 13 : 3;

      for (let r = 1; r < rows - 1; r++) {
        for (let c = 2; c < cols - 2; c++) {
          const dist = distancePointToBezierRiver(
            { x: (c + 0.5) * tilePx, y: (r + 0.5) * tilePx },
            riverSpline,
            18,
          ).distance;
          if (dist <= tilePx * 0.85) {
            tileGrid[r][c] = liquidCode;
          }
        }
      }

      // Stamp wide, dry crossing bridge along roadRow & roadRow - 1
      const bridgeCode = region.bridgeStyle === 'wood_railed' ? 5 : 6;
      for (let br = Math.max(2, roadRow - 1); br <= Math.min(rows - 3, roadRow + 1); br++) {
        for (let bc = riverColBase - 3; bc <= riverColBase + 3; bc++) {
          if (bc >= 2 && bc < cols - 2 && tileGrid[br][bc] === liquidCode) {
            tileGrid[br][bc] = bridgeCode;
          }
        }
      }

      river = {
        spline: riverSpline,
        liquid: region.liquid,
        widthTiles: 1.6,
        flowVelocity: { x: 0, y: 24 + (actId % 5) * 4 },
        bridges: [
          {
            centerCol: riverColBase,
            centerRow: roadRow,
            halfWidthTiles: 2,
            orientation: 'horizontal',
            style: region.bridgeStyle,
          },
        ],
      };
    }

    // Enforce clean perimeter framing (zero noisy interior walls)
    enforceOpenArenaPerimeterFraming(tileGrid);

    // Guarantee dry-land Hero spawn (west side) and Blacksmith 3x3 stone patio (northwest safe pocket)
    const heroSnap = snapEntityToDryLand(tileGrid, 3, roadRow, tilePx);
    const smithTargetCol = isSanctuary ? 10 : 5 + (actId % 3);
    const smithTargetRow = isSanctuary ? 4 : 3;
    const smithCoord = stampBlacksmith3x3StonePatio(tileGrid, smithTargetCol, smithTargetRow);

    // 2–3 well-spaced traps for tactical gameplay clarity
    const trapCount = isSanctuary ? 0 : 2 + (actId % 2);
    const traps: TrapEntity[] = [];
    for (let t = 0; t < trapCount; t++) {
      const cat = region.trapPool[(actId + t) % region.trapPool.length];
      traps.push({
        id: `trap_${actId}_${t}`,
        category: cat,
        position: { x: 150 + t * 95 + rng.nextInt(-10, 10), y: 95 + (t % 2) * 70 },
        elevation: 0,
        triggerIntervalSec: 2.2 + t * 0.5,
        damage: Math.round(14 + actId * 0.65),
        radius: 16,
        direction: t % 2 === 0 ? 'E' : 'RADIAL',
        patrolWaypoints: [],
      });
    }

    const occluders = [
      {
        id: `occ_${actId}_nw`,
        kind: 'pillar' as const,
        castsShadow: true,
        elevation: 2 as ElevationTier,
        polygon: {
          vertices: [
            { x: 168, y: 46 },
            { x: 188, y: 46 },
            { x: 188, y: 66 },
            { x: 168, y: 66 },
          ],
        },
      },
      {
        id: `occ_${actId}_se`,
        kind: 'cliff_ledge' as const,
        castsShadow: true,
        elevation: 2 as ElevationTier,
        polygon: {
          vertices: [
            { x: 312, y: 188 },
            { x: 344, y: 188 },
            { x: 344, y: 208 },
            { x: 312, y: 208 },
          ],
        },
      },
    ];

    const bossOrdinal = Math.floor(actId / 10);
    const bossId =
      isArcFinalBoss || isRegionalBoss
        ? `boss_${String(bossOrdinal).padStart(3, '0')}`
        : null;

    const title = isArcFinalBoss
      ? `Act ${actId}: ${config.finalBossName} (Arc ${config.arcId} Finale)`
      : isSanctuary
        ? `Act ${actId}: ${sanctuaryScript.speaker}'s Sanctuary`
        : isRegionalBoss
          ? `Act ${actId}: ${region.name} Citadel Siege`
          : `Act ${actId}: ${region.name} — Stage ${(offset % 10) + 1}`;

    acts.push({
      actId,
      arcId: config.arcId,
      title,
      subRegion: region.name,
      biomeTheme: region.biomeTheme,
      palette: config.palette,
      tileGrid,
      elevationGrid,
      river,
      occluders,
      traps,
      landmark: {
        id: `landmark_${actId}`,
        name: `${region.landmarkPrefix} of Act ${actId}`,
        position: { x: 240, y: 130 },
        loreSummary: `${config.arcTitle} — ${region.name}.`,
        auraColor: config.palette.accentHex,
        interactiveBuff: isSanctuary
          ? 'heal_pulse'
          : actId % 3 === 0
            ? 'gold_blessing'
            : actId % 3 === 1
              ? 'mana_surge'
              : 'lore_shrine',
      },
      heroSpawnCol: heroSnap.col,
      heroSpawnRow: heroSnap.row,
      blacksmithCol: smithCoord.col,
      blacksmithRow: smithCoord.row,
      factionId: config.factionId,
      enemyPool: config.enemyPool,
      isSanctuary,
      isRegionalBoss,
      isArcFinalBoss,
      bossId,
      sanctuaryScript: isSanctuary ? sanctuaryScript : null,
      sanctuaryPortalDestination: isSanctuary ? actId + 1 : null,
    });
  }

  return acts;
}

export const ARC01_CONFIG: OmniverseArcConfig = {
  arcId: 1,
  actMin: 1,
  actMax: 100,
  arcBadge: 'ARC I • STARLIGHT WAND',
  arcTitle: 'The Stolen Starlight Wand & Quest for The Great Duck',
  factionId: 'usurper_wolves',
  factionLabel: 'Usurper Wolf Raiders',
  captainPrefix: 'Eclipse Fang',
  enemyPool: ['wolf_scout', 'shadow_hound', 'thorn_bandit', 'usurper_halberdier', 'dark_acolyte'],
  sanctuaryAct: 99,
  finalBossAct: 100,
  finalBossName: 'Usurper King Fenrir',
  finalBossMaxHp: 250000,
  palette: {
    groundPrimary: '#2f6d3a',
    groundSecondary: '#3b8046',
    roadHex: '#a98256',
    liquidHex: '#2563eb',
    cliffHex: '#475569',
    accentHex: '#fde047',
  },
};

export const ARC01_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 99,
  destinationAct: 100,
  speaker: 'The Great Duck',
  greetingLine: 'Quack! You crossed 98 verdant stages to reach the Golden Lotus Pond, Nyx!',
  blessingLine: 'Drink my 20-second Golden Pond Elixir [Q] to shatter Usurper King Fenrir’s Eclipse Ward in Act 100!',
  portalLabel: 'Golden Lotus Gate -> Act 100: Usurper King Fenrir',
  themeColor: '#fde047',
};

const ARC01_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Whisker Castle Outskirts', biomeTheme: 'emerald_meadow', landmarkPrefix: 'Sun-Crown Milestone', trapPool: ['swinging_log', 'bounce_mushroom'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Mossbrook Riverlands', biomeTheme: 'emerald_meadow', landmarkPrefix: 'Fisher Cat Pier', trapPool: ['bounce_mushroom', 'bear_trap'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Briarwood Canopy', biomeTheme: 'deep_forest', landmarkPrefix: 'Ancient Oak Shrine', trapPool: ['leaf_pitfall', 'retracting_thorn_wall'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Amber Sawmill Hollow', biomeTheme: 'timber_woods', landmarkPrefix: 'Waterwheel Mill', trapPool: ['sawmill_buzzsaw', 'swinging_log'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Whispering Bamboo Grove', biomeTheme: 'bamboo_mist', landmarkPrefix: 'Jade Wind Chime', trapPool: ['bamboo_warp_mirror', 'dart_totem'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Starlight Quarry Cliffs', biomeTheme: 'highland_ridge', landmarkPrefix: 'Astral Cairn', trapPool: ['rolling_boulder', 'cliff_wind_gust'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Sunken Cat-Knight Watch', biomeTheme: 'ruined_keep', landmarkPrefix: 'Fallen Lion Banner', trapPool: ['rune_drawbridge', 'dart_totem'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Twilight Reed Marshes', biomeTheme: 'twilight_bog', landmarkPrefix: 'Lantern Causeway', trapPool: ['poison_puffball', 'darkness_lantern'], liquid: 'acid', bridgeStyle: 'wood_railed' },
  { name: 'Golden Pond Approaches', biomeTheme: 'lotus_glade', landmarkPrefix: 'Duck Archway', trapPool: ['bounce_mushroom', 'chain_lightning_pylon'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Lotus Sanctuary & Throne Approach', biomeTheme: 'royal_citadel', landmarkPrefix: 'Golden Lotus Altar', trapPool: ['rune_drawbridge', 'laser_prism'], liquid: 'water', bridgeStyle: 'stone_arched' },
];

export const ARC01_ACTS_001_TO_100: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC01_CONFIG,
  ARC01_SUBREGIONS,
  ARC01_SANCTUARY_SCRIPT,
);
