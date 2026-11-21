/**
 * Pillar 1 — Analytic Cubic Bezier River Hydrology, 4-Bit Auto-Tiling,
 * 3-Tier Elevation Physics & Dry-Land Placement (with 3x3 Blacksmith Stone Patio).
 * Zero `any` types.
 */

import type { CubicBezierSpline, ElevationTier, GridCoord, ReadonlyVec2, Vec2 } from '../types/math';
import { isWaterOrImpassableTile } from './flowFieldArmyPathfinder';

export const HIGH_GROUND_BONUS_MULTIPLIER = 1.25;
export const PLUNGE_SLASH_MULTIPLIER = 2.0;
export const TALL_GRASS_STEALTH_MULTIPLIER = 2.0;

export function evaluateCubicBezier(spline: CubicBezierSpline, tRaw: number): Vec2 {
  const t = Math.max(0, Math.min(1, tRaw));
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return {
    x: uuu * spline.p0.x + 3 * uu * t * spline.p1.x + 3 * u * tt * spline.p2.x + ttt * spline.p3.x,
    y: uuu * spline.p0.y + 3 * uu * t * spline.p1.y + 3 * u * tt * spline.p2.y + ttt * spline.p3.y,
  };
}

export function evaluateCubicBezierDerivative(spline: CubicBezierSpline, tRaw: number): Vec2 {
  const t = Math.max(0, Math.min(1, tRaw));
  const u = 1 - t;
  return {
    x:
      3 * u * u * (spline.p1.x - spline.p0.x) +
      6 * u * t * (spline.p2.x - spline.p1.x) +
      3 * t * t * (spline.p3.x - spline.p2.x),
    y:
      3 * u * u * (spline.p1.y - spline.p0.y) +
      6 * u * t * (spline.p2.y - spline.p1.y) +
      3 * t * t * (spline.p3.y - spline.p2.y),
  };
}

/**
 * Computes minimum Euclidean distance from point `p` to a Cubic Bezier river centerline
 * via coarse sampling + Newton-Raphson refinement.
 */
export function distancePointToBezierRiver(
  p: ReadonlyVec2,
  spline: CubicBezierSpline,
  samples = 36,
): { readonly distance: number; readonly closestPoint: Vec2; readonly t: number } {
  let bestT = 0;
  let bestPt = evaluateCubicBezier(spline, 0);
  let bestDistSq = (p.x - bestPt.x) ** 2 + (p.y - bestPt.y) ** 2;

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const pt = evaluateCubicBezier(spline, t);
    const dSq = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestPt = pt;
      bestT = t;
    }
  }

  // Golden-section local refinement around bestT
  let lo = Math.max(0, bestT - 1 / samples);
  let hi = Math.min(1, bestT + 1 / samples);
  for (let iter = 0; iter < 8; iter++) {
    const m1 = lo + (hi - lo) * 0.382;
    const m2 = lo + (hi - lo) * 0.618;
    const p1 = evaluateCubicBezier(spline, m1);
    const p2 = evaluateCubicBezier(spline, m2);
    const d1 = (p.x - p1.x) ** 2 + (p.y - p1.y) ** 2;
    const d2 = (p.x - p2.x) ** 2 + (p.y - p2.y) ** 2;
    if (d1 < d2) {
      hi = m2;
      if (d1 < bestDistSq) {
        bestDistSq = d1;
        bestPt = p1;
        bestT = m1;
      }
    } else {
      lo = m1;
      if (d2 < bestDistSq) {
        bestDistSq = d2;
        bestPt = p2;
        bestT = m2;
      }
    }
  }

  return {
    distance: Math.sqrt(bestDistSq),
    closestPoint: bestPt,
    t: bestT,
  };
}

/**
 * 4-Bit Cardinal Auto-Tile Bitmask (North=1, East=2, South=4, West=8).
 */
export function compute4BitAutoTileMask(
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  col: number,
  row: number,
  targetTileCode: number,
): number {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;
  let mask = 0;
  if (row > 0 && tileGrid[row - 1][col] === targetTileCode) mask |= 1;
  if (col + 1 < cols && tileGrid[row][col + 1] === targetTileCode) mask |= 2;
  if (row + 1 < rows && tileGrid[row + 1][col] === targetTileCode) mask |= 4;
  if (col > 0 && tileGrid[row][col - 1] === targetTileCode) mask |= 8;
  return mask;
}

export interface ElevationDamageModifiers {
  readonly totalMultiplier: number;
  readonly highGroundApplied: boolean;
  readonly plungeApplied: boolean;
  readonly stealthAmbushApplied: boolean;
}

export function computeElevationCombatModifiers(
  attackerTier: ElevationTier,
  defenderTier: ElevationTier,
  isPlungeSlash: boolean,
  attackerInTallGrass: boolean,
): ElevationDamageModifiers {
  let mult = 1.0;
  const highGroundApplied = attackerTier > defenderTier;
  if (highGroundApplied) mult *= HIGH_GROUND_BONUS_MULTIPLIER;

  const plungeApplied = isPlungeSlash && attackerTier > defenderTier;
  if (plungeApplied) mult *= PLUNGE_SLASH_MULTIPLIER;

  const stealthAmbushApplied = attackerInTallGrass;
  if (stealthAmbushApplied) mult *= TALL_GRASS_STEALTH_MULTIPLIER;

  return {
    totalMultiplier: mult,
    highGroundApplied,
    plungeApplied,
    stealthAmbushApplied,
  };
}

export function isDryLandCode(code: number): boolean {
  return !isWaterOrImpassableTile(code) && code !== 4;
}

/**
 * Strictly snaps any Hero, Blacksmith Cat, NPC, or Sanctuary Portal to a guaranteed dry-land tile.
 */
export function snapEntityToDryLand(
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  desiredCol: number,
  desiredRow: number,
  tileSizePx = 20,
): { readonly col: number; readonly row: number; readonly worldPos: Vec2; readonly wasMoved: boolean } {
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;
  const c0 = Math.max(1, Math.min(cols - 2, Math.floor(desiredCol)));
  const r0 = Math.max(1, Math.min(rows - 2, Math.floor(desiredRow)));

  if (rows > 0 && cols > 0 && isDryLandCode(tileGrid[r0][c0])) {
    return {
      col: c0,
      row: r0,
      worldPos: { x: (c0 + 0.5) * tileSizePx, y: (r0 + 0.5) * tileSizePx },
      wasMoved: false,
    };
  }

  const maxR = Math.max(rows, cols);
  for (let rad = 1; rad <= maxR; rad++) {
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) {
        if (Math.abs(dx) !== rad && Math.abs(dy) !== rad) continue;
        const nc = c0 + dx;
        const nr = r0 + dy;
        if (nr < 1 || nr >= rows - 1 || nc < 1 || nc >= cols - 1) continue;
        if (isDryLandCode(tileGrid[nr][nc])) {
          return {
            col: nc,
            row: nr,
            worldPos: { x: (nc + 0.5) * tileSizePx, y: (nr + 0.5) * tileSizePx },
            wasMoved: true,
          };
        }
      }
    }
  }

  return {
    col: c0,
    row: r0,
    worldPos: { x: (c0 + 0.5) * tileSizePx, y: (r0 + 0.5) * tileSizePx },
    wasMoved: false,
  };
}

/**
 * Stamps a clean 3x3 Stone Cobblestone Patio (tile code 9) under the Blacksmith Cat.
 */
export function stampBlacksmith3x3StonePatio(
  tileGrid: number[][],
  desiredCol: number,
  desiredRow: number,
): GridCoord {
  const snapped = snapEntityToDryLand(tileGrid, desiredCol, desiredRow);
  const rows = tileGrid.length;
  const cols = rows > 0 ? tileGrid[0].length : 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const c = snapped.col + dx;
      const r = snapped.row + dy;
      if (r >= 1 && r < rows - 1 && c >= 1 && c < cols - 1) {
        const cur = tileGrid[r][c];
        if (cur !== 3 && cur !== 5 && cur !== 6 && cur !== 10) {
          tileGrid[r][c] = 9;
        }
      }
    }
  }
  tileGrid[snapped.row][snapped.col] = 9;
  return { col: snapped.col, row: snapped.row };
}
