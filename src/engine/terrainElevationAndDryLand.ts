/**
 * Layer 4 — Multi-Elevation Terrain Combat & Dry-Land Placement Physics
 *
 * Implements:
 * - 3-Tier Elevation (+25% High-Ground Damage Bonus)
 * - 2.0x Ledge Plunge-Slash Multiplier
 * - 2.0x Tall Stealth Grass Ambush Crit
 * - `snapEntityToDryLand` so Heroes, NPCs, & Portals NEVER spawn on water, lava, or cliffs
 * - 3x3 Cobblestone Patio carving beneath every Blacksmith Cat anvil
 */

import type { ElevationLayer, GridCoord, Vec2 } from '../types/math';
import { isTileWalkableCode } from '../math/aStarBridgePathfinder';

export const HIGH_GROUND_DAMAGE_MULTIPLIER = 1.25;
export const LEDGE_PLUNGE_SLASH_MULTIPLIER = 2.0;
export const STEALTH_GRASS_AMBUSH_MULTIPLIER = 2.0;

export interface ElevationCombatResult {
  readonly damageMultiplier: number;
  readonly highGroundBonusApplied: boolean;
  readonly plungeSlashTriggered: boolean;
  readonly stealthAmbushTriggered: boolean;
  readonly calloutText: string | null;
}

export function evaluateElevationAndStealthDamage(
  attackerElevation: ElevationLayer,
  defenderElevation: ElevationLayer,
  isAirborneLedgePlunge: boolean,
  attackerInStealthGrass: boolean,
): ElevationCombatResult {
  let multiplier = 1.0;
  let highGroundBonusApplied = false;
  let plungeSlashTriggered = false;
  let stealthAmbushTriggered = false;
  let calloutText: string | null = null;

  if (attackerElevation > defenderElevation) {
    multiplier *= HIGH_GROUND_DAMAGE_MULTIPLIER;
    highGroundBonusApplied = true;
    calloutText = 'HIGH GROUND +25%!';
  }

  if (isAirborneLedgePlunge && attackerElevation > defenderElevation) {
    multiplier *= LEDGE_PLUNGE_SLASH_MULTIPLIER;
    plungeSlashTriggered = true;
    calloutText = 'LEDGE PLUNGE 2.0x!';
  }

  if (attackerInStealthGrass) {
    multiplier *= STEALTH_GRASS_AMBUSH_MULTIPLIER;
    stealthAmbushTriggered = true;
    calloutText = 'AMBUSH CRIT 2.0x!';
  }

  return {
    damageMultiplier: multiplier,
    highGroundBonusApplied,
    plungeSlashTriggered,
    stealthAmbushTriggered,
    calloutText,
  };
}

export function isDryLandTileCode(code: number): boolean {
  // Dry land excludes RiverWater (3), ShallowFord (4), CliffWall (7), Lava (10), AcidBog (13)
  return isTileWalkableCode(code) && code !== 4;
}

/**
 * Guarantees any entity, NPC, Blacksmith, or Sanctuary Portal is snapped to a valid
 * dry-land tile via expanding Chebyshev spiral search.
 */
export function snapEntityToDryLand(
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  desiredCol: number,
  desiredRow: number,
  tileSizePx = 20,
): { readonly grid: GridCoord; readonly world: Vec2; readonly relocated: boolean } {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;

  const clampedCol = Math.max(1, Math.min(cols - 2, Math.floor(desiredCol)));
  const clampedRow = Math.max(1, Math.min(rows - 2, Math.floor(desiredRow)));

  if (rows > 0 && cols > 0 && isDryLandTileCode(tileGrid[clampedRow][clampedCol])) {
    return {
      grid: { col: clampedCol, row: clampedRow },
      world: { x: (clampedCol + 0.5) * tileSizePx, y: (clampedRow + 0.5) * tileSizePx },
      relocated: false,
    };
  }

  const maxRadius = Math.max(rows, cols);
  for (let r = 1; r <= maxRadius; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const c = clampedCol + dx;
        const nr = clampedRow + dy;
        if (nr < 1 || nr >= rows - 1 || c < 1 || c >= cols - 1) continue;
        if (isDryLandTileCode(tileGrid[nr][c])) {
          return {
            grid: { col: c, row: nr },
            world: { x: (c + 0.5) * tileSizePx, y: (nr + 0.5) * tileSizePx },
            relocated: true,
          };
        }
      }
    }
  }

  return {
    grid: { col: clampedCol, row: clampedRow },
    world: { x: (clampedCol + 0.5) * tileSizePx, y: (clampedRow + 0.5) * tileSizePx },
    relocated: false,
  };
}

/**
 * Stamps a clean 3x3 Cobblestone Patio (tile code 9) underneath the Blacksmith Cat's anvil
 * so the forge never sits in water, cliffs, or foliage.
 */
export function carveBlacksmithCobblePatio(
  mutableTileGrid: number[][],
  centerCol: number,
  centerRow: number,
): GridCoord {
  const snapped = snapEntityToDryLand(mutableTileGrid, centerCol, centerRow);
  const rows = mutableTileGrid.length;
  const cols = rows > 0 ? mutableTileGrid[0].length : 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const c = snapped.grid.col + dx;
      const r = snapped.grid.row + dy;
      if (r >= 1 && r < rows - 1 && c >= 1 && c < cols - 1) {
        const existing = mutableTileGrid[r][c];
        if (existing !== 3 && existing !== 5 && existing !== 6 && existing !== 10) {
          mutableTileGrid[r][c] = 9; // CobblePatio
        }
      }
    }
  }

  mutableTileGrid[snapped.grid.row][snapped.grid.col] = 9;
  return snapped.grid;
}

export function getSurfaceMoveSpeedMultiplier(tileCode: number): number {
  switch (tileCode) {
    case 1: // DirtRoad
    case 9: // CobblePatio
      return 1.2;
    case 4: // ShallowFord
      return 0.78;
    case 11: // IceSheet
      return 1.3;
    case 12: // CrackingIce
      return 1.1;
    case 13: // AcidBog
      return 0.65;
    case 14: // ConveyorBelt
      return 1.25;
    default:
      return 1.0;
  }
}
