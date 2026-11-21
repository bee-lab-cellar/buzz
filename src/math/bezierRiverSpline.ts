/**
 * Analytic Cubic Bezier River Spline Evaluator & Perpendicular Bridge Placer
 * Carves continuous, smooth 16-bit rivers with crisp shoreline foam and railed bridges.
 */

import type { CubicBezierSpline, Vec2 } from '../types/math';
import type { RiverBridgeSpan, RiverHydrologySpec } from '../types/world';
import { clamp, normalize2 } from './vectorAndSpatialHash';

export interface ShorelineFoamPoint {
  readonly x: number;
  readonly y: number;
  readonly normalX: number;
  readonly normalY: number;
  readonly phase: number;
}

export function sampleRiverPoint(spline: CubicBezierSpline, tRaw: number): Vec2 {
  const t = clamp(tRaw, 0, 1);
  const inv = 1 - t;
  const inv2 = inv * inv;
  const inv3 = inv2 * inv;
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      inv3 * spline.p0.x +
      3 * inv2 * t * spline.p1.x +
      3 * inv * t2 * spline.p2.x +
      t3 * spline.p3.x,
    y:
      inv3 * spline.p0.y +
      3 * inv2 * t * spline.p1.y +
      3 * inv * t2 * spline.p2.y +
      t3 * spline.p3.y,
  };
}

export function getRiverTangent(spline: CubicBezierSpline, tRaw: number): Vec2 {
  const t = clamp(tRaw, 0, 1);
  const inv = 1 - t;
  const dx =
    3 * inv * inv * (spline.p1.x - spline.p0.x) +
    6 * inv * t * (spline.p2.x - spline.p1.x) +
    3 * t * t * (spline.p3.x - spline.p2.x);
  const dy =
    3 * inv * inv * (spline.p1.y - spline.p0.y) +
    6 * inv * t * (spline.p2.y - spline.p1.y) +
    3 * t * t * (spline.p3.y - spline.p2.y);
  return normalize2({ x: dx, y: dy });
}

export function getRiverNormal(spline: CubicBezierSpline, t: number): Vec2 {
  const tan = getRiverTangent(spline, t);
  return { x: -tan.y, y: tan.x };
}

export function distanceToRiverCenterline(
  spline: CubicBezierSpline,
  point: Vec2,
  samples = 36
): { distance: number; closestPoint: Vec2; t: number } {
  let bestDistSq = Infinity;
  let bestT = 0;
  let bestPt: Vec2 = { x: spline.p0.x, y: spline.p0.y };

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = sampleRiverPoint(spline, t);
    const dx = point.x - pt.x;
    const dy = point.y - pt.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestT = t;
      bestPt = pt;
    }
  }

  return {
    distance: Math.sqrt(bestDistSq),
    closestPoint: bestPt,
    t: bestT,
  };
}

export function generateShorelineFoamPoints(
  hydrology: RiverHydrologySpec,
  tileSize = 16,
  stepCount = 28
): ShorelineFoamPoint[] {
  const halfWidthPx = hydrology.widthTiles * tileSize * 0.5;
  const result: ShorelineFoamPoint[] = [];

  for (let i = 1; i < stepCount; i++) {
    const t = i / stepCount;
    const center = sampleRiverPoint(hydrology.spline, t);
    const normal = getRiverNormal(hydrology.spline, t);

    // Left bank foam
    result.push({
      x: center.x * tileSize + normal.x * halfWidthPx,
      y: center.y * tileSize + normal.y * halfWidthPx,
      normalX: normal.x,
      normalY: normal.y,
      phase: i * 0.65,
    });
    // Right bank foam
    result.push({
      x: center.x * tileSize - normal.x * halfWidthPx,
      y: center.y * tileSize - normal.y * halfWidthPx,
      normalX: -normal.x,
      normalY: -normal.y,
      phase: i * 0.65 + Math.PI,
    });
  }

  return result;
}

/**
 * Evaluates clean perpendicular bridge spans along a Cubic Bezier river so
 * every crossing connects dry bank to dry bank cleanly with zero floating planks.
 */
export function computePerpendicularBridgeSpans(
  spline: CubicBezierSpline,
  widthTiles: number,
  tCrossings: ReadonlyArray<number>,
  style: RiverBridgeSpan['style'] = 'wood_railed'
): RiverBridgeSpan[] {
  const halfW = Math.max(1, Math.ceil(widthTiles * 0.5) + 1);
  return tCrossings.map((t) => {
    const pt = sampleRiverPoint(spline, t);
    const tan = getRiverTangent(spline, t);
    const orientation: 'horizontal' | 'vertical' = Math.abs(tan.y) >= Math.abs(tan.x) ? 'horizontal' : 'vertical';
    return {
      centerCol: Math.round(pt.x),
      centerRow: Math.round(pt.y),
      halfWidthTiles: halfW,
      orientation,
      style,
    };
  });
}
