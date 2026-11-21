/**
 * Pillar 3 — Arc I Campaign Blueprints (Acts 1–41: Quest for The Great Duck)
 * Sanctuary Act 40 routes dynamically to Act 41 (`40 -> 41`).
 * Every Blacksmith Cat is strictly snapped to a guaranteed dry-land tile.
 */

import { ALL_300_ATLAS_ACTS, type AtlasActEntry } from '../atlas';
import { snapEntityToDryLand } from '../math/bezierRiverAndElevation';
import type { ElevationTier } from '../types/math';
import type { ActBlueprint, LightingOccluder, SanctuaryPortalConfig, TrapEntity } from '../types/world';

export const ARC1_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 40,
  destinationAct: 41,
  portalLabel: 'Sanctuary Gate -> Act 41: Usurper Fenrir',
  themeColor: '#a855f7',
  unlocksNextArc: true,
};

export function compileAtlasEntryToActBlueprint(
  entry: AtlasActEntry,
  sanctuaryConfig: SanctuaryPortalConfig | null,
): ActBlueprint {
  const drySmith = snapEntityToDryLand(entry.tileGrid, 5, 5);
  const elevGrid = entry.elevationGrid.map((row) =>
    row.map((v) => (v === 2 ? 2 : v === 1 ? 1 : 0) as ElevationTier),
  );

  const occluders: LightingOccluder[] = [
    {
      id: `occ_north_ledge_${entry.actId}`,
      kind: 'cliff_ledge',
      polygon: {
        vertices: [
          { x: 0, y: 0 },
          { x: 480, y: 0 },
          { x: 480, y: 18 },
          { x: 0, y: 18 },
        ],
      },
      castsShadow: true,
      elevation: 2,
    },
    {
      id: `occ_pillar_a_${entry.actId}`,
      kind: 'pillar',
      polygon: {
        vertices: [
          { x: 148, y: 84 },
          { x: 164, y: 84 },
          { x: 164, y: 100 },
          { x: 148, y: 100 },
        ],
      },
      castsShadow: true,
      elevation: 1,
    },
  ];

  const traps: TrapEntity[] = entry.traps.slice(0, 4).map((t) => ({
    id: t.id,
    category: t.type,
    position: { x: t.x, y: t.y },
    elevation: 0,
    triggerIntervalSec: t.triggerInterval,
    damage: t.damage,
    radius: 16,
    direction: t.direction,
    patrolWaypoints: t.patrolPath,
  }));

  const isSanctuary = sanctuaryConfig !== null && entry.actId === sanctuaryConfig.sanctuaryAct;
  const isFinaleBoss = sanctuaryConfig !== null && entry.actId === sanctuaryConfig.destinationAct;

  return {
    actId: entry.actId,
    arc: entry.arc,
    title: entry.title,
    subRegion: entry.subRegion,
    biomeTheme: `arc${entry.arc}_${entry.subRegion.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    tileGrid: entry.tileGrid,
    elevationGrid: elevGrid,
    river: entry.riverPath
      ? {
          spline: {
            p0: { x: entry.riverPath.x0, y: entry.riverPath.y0 },
            p1: { x: entry.riverPath.cx1, y: entry.riverPath.cy1 },
            p2: { x: entry.riverPath.cx2, y: entry.riverPath.cy2 },
            p3: { x: entry.riverPath.x1, y: entry.riverPath.y1 },
          },
          liquid: entry.riverPath.liquid,
          widthTiles: Math.max(1, Math.round(entry.riverPath.width / 20)),
          flowVelocity: { x: entry.riverPath.flowVx, y: entry.riverPath.flowVy },
          bridges: [
            {
              centerCol: 12,
              centerRow: 7,
              halfWidthTiles: 1,
              orientation: 'horizontal',
              style: entry.arc === 4 ? 'coral_bridge' : entry.arc === 6 ? 'astral_span' : 'wood_railed',
            },
          ],
        }
      : null,
    occluders,
    traps,
    landmark: {
      id: entry.landmark.id,
      name: entry.landmark.name,
      position: { x: entry.landmark.x, y: entry.landmark.y },
      loreSummary: entry.landmark.loreSummary,
      auraColor: entry.landmark.auraColor,
      interactiveBuff: isSanctuary ? 'heal_pulse' : 'lore_shrine',
    },
    blacksmithCol: drySmith.col,
    blacksmithRow: drySmith.row,
    isSanctuary,
    isFinaleBoss,
    sanctuaryRouting: isSanctuary ? sanctuaryConfig : null,
  };
}

export const ARC1_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 1 && a.actId <= 41,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC1_SANCTUARY_PORTAL));
