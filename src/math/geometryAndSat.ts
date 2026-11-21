/**
 * Pillar 1 — 2D Vector/Matrix Math, SAT OBB-vs-OBB & Circle-vs-Polygon Collision Solver,
 * Sweep-and-Prune Broadphase, and Zero-Allocation SpatialHashGrid.
 * Zero `any` types.
 */

import type {
  AABB,
  CircleCollider,
  Mat3,
  OBB,
  Polygon2D,
  ReadonlyVec2,
  SATCollisionResult,
  SpatialHashCell,
  SpatialHashEntity,
  Vec2,
} from '../types/math';

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function addVec2(a: ReadonlyVec2, b: ReadonlyVec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subVec2(a: ReadonlyVec2, b: ReadonlyVec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scaleVec2(v: ReadonlyVec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function dotVec2(a: ReadonlyVec2, b: ReadonlyVec2): number {
  return a.x * b.x + a.y * b.y;
}

export function crossVec2(a: ReadonlyVec2, b: ReadonlyVec2): number {
  return a.x * b.y - a.y * b.x;
}

export function lengthVec2(v: ReadonlyVec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalizeVec2(v: ReadonlyVec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  if (len <= 1e-8) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function mat3Identity(): Mat3 {
  return {
    m00: 1, m01: 0, m02: 0,
    m10: 0, m11: 1, m12: 0,
    m20: 0, m21: 0, m22: 1,
  };
}

export function mat3FromTRS(tx: number, ty: number, rad: number, sx = 1, sy = 1): Mat3 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return {
    m00: c * sx, m01: -s * sy, m02: tx,
    m10: s * sx, m11: c * sy, m12: ty,
    m20: 0, m21: 0, m22: 1,
  };
}

export function mat3Multiply(a: Mat3, b: Mat3): Mat3 {
  return {
    m00: a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20,
    m01: a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21,
    m02: a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22,
    m10: a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20,
    m11: a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21,
    m12: a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22,
    m20: a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20,
    m21: a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21,
    m22: a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22,
  };
}

export function mat3TransformPoint(m: Mat3, p: ReadonlyVec2): Vec2 {
  return {
    x: m.m00 * p.x + m.m01 * p.y + m.m02,
    y: m.m10 * p.x + m.m11 * p.y + m.m12,
  };
}

export function obbToPolygon(obb: OBB): Polygon2D {
  const c = Math.cos(obb.rotation);
  const s = Math.sin(obb.rotation);
  const ux = c * obb.halfExtents.x;
  const uy = s * obb.halfExtents.x;
  const vx = -s * obb.halfExtents.y;
  const vy = c * obb.halfExtents.y;
  const cx = obb.center.x;
  const cy = obb.center.y;
  return {
    vertices: [
      { x: cx - ux - vx, y: cy - uy - vy },
      { x: cx + ux - vx, y: cy + uy - vy },
      { x: cx + ux + vx, y: cy + uy + vy },
      { x: cx - ux + vx, y: cy - uy + vy },
    ],
  };
}

function projectPolyOnAxis(verts: ReadonlyArray<ReadonlyVec2>, axis: ReadonlyVec2): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < verts.length; i++) {
    const p = verts[i].x * axis.x + verts[i].y * axis.y;
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

function polygonCentroid(verts: ReadonlyArray<ReadonlyVec2>): Vec2 {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < verts.length; i++) {
    sx += verts[i].x;
    sy += verts[i].y;
  }
  const inv = verts.length > 0 ? 1 / verts.length : 1;
  return { x: sx * inv, y: sy * inv };
}

/**
 * Full Separating Axis Theorem (SAT) convex polygon vs polygon solver.
 * Returns Minimum Translation Vector (MTV) pushing `polyA` out of `polyB`.
 */
export function satPolygonVsPolygon(polyA: Polygon2D, polyB: Polygon2D): SATCollisionResult {
  const vertsA = polyA.vertices;
  const vertsB = polyB.vertices;
  if (vertsA.length < 3 || vertsB.length < 3) {
    return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
  }

  let minOverlap = Infinity;
  let axisX = 0;
  let axisY = 0;

  const list: ReadonlyArray<ReadonlyArray<ReadonlyVec2>> = [vertsA, vertsB];
  for (let s = 0; s < 2; s++) {
    const verts = list[s];
    for (let i = 0; i < verts.length; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % verts.length];
      const ex = p2.x - p1.x;
      const ey = p2.y - p1.y;
      const len = Math.hypot(ex, ey);
      if (len <= 1e-8) continue;
      const nx = -ey / len;
      const ny = ex / len;
      const axis = { x: nx, y: ny };

      const projA = projectPolyOnAxis(vertsA, axis);
      const projB = projectPolyOnAxis(vertsB, axis);
      const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
      if (overlap <= 0) {
        return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
      }
      if (overlap < minOverlap) {
        minOverlap = overlap;
        axisX = nx;
        axisY = ny;
      }
    }
  }

  const cA = polygonCentroid(vertsA);
  const cB = polygonCentroid(vertsB);
  if ((cA.x - cB.x) * axisX + (cA.y - cB.y) * axisY < 0) {
    axisX = -axisX;
    axisY = -axisY;
  }

  return {
    colliding: true,
    overlap: minOverlap,
    mtv: { x: axisX * minOverlap, y: axisY * minOverlap },
  };
}

/**
 * Exact SAT OBB-vs-OBB collision solver with MTV resolution.
 */
export function satObbVsObb(a: OBB, b: OBB): SATCollisionResult {
  return satPolygonVsPolygon(obbToPolygon(a), obbToPolygon(b));
}

/**
 * Exact SAT Circle-vs-Convex-Polygon collision solver.
 * Tests all polygon edge normals PLUS the axis from circle center to closest vertex.
 */
export function satCircleVsPolygon(circle: CircleCollider, poly: Polygon2D): SATCollisionResult {
  const verts = poly.vertices;
  if (verts.length < 3 || circle.radius <= 0) {
    return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
  }

  let minOverlap = Infinity;
  let axisX = 0;
  let axisY = 0;

  let closestVertex = verts[0];
  let closestDistSq = Infinity;
  for (let i = 0; i < verts.length; i++) {
    const dx = verts[i].x - circle.x;
    const dy = verts[i].y - circle.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < closestDistSq) {
      closestDistSq = dSq;
      closestVertex = verts[i];
    }
  }

  const testAxis = (nx: number, ny: number): boolean => {
    const projPoly = projectPolyOnAxis(verts, { x: nx, y: ny });
    const cProj = circle.x * nx + circle.y * ny;
    const cMin = cProj - circle.radius;
    const cMax = cProj + circle.radius;
    const overlap = Math.min(cMax, projPoly.max) - Math.max(cMin, projPoly.min);
    if (overlap <= 0) return false;
    if (overlap < minOverlap) {
      minOverlap = overlap;
      axisX = nx;
      axisY = ny;
    }
    return true;
  };

  for (let i = 0; i < verts.length; i++) {
    const p1 = verts[i];
    const p2 = verts[(i + 1) % verts.length];
    const ex = p2.x - p1.x;
    const ey = p2.y - p1.y;
    const len = Math.hypot(ex, ey);
    if (len <= 1e-8) continue;
    if (!testAxis(-ey / len, ex / len)) {
      return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
    }
  }

  const vdx = closestVertex.x - circle.x;
  const vdy = closestVertex.y - circle.y;
  const vLen = Math.hypot(vdx, vdy);
  if (vLen > 1e-8) {
    if (!testAxis(vdx / vLen, vdy / vLen)) {
      return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
    }
  }

  const cPoly = polygonCentroid(verts);
  if ((circle.x - cPoly.x) * axisX + (circle.y - cPoly.y) * axisY < 0) {
    axisX = -axisX;
    axisY = -axisY;
  }

  return {
    colliding: true,
    overlap: minOverlap,
    mtv: { x: axisX * minOverlap, y: axisY * minOverlap },
  };
}

export interface SweepBody {
  readonly id: string;
  readonly aabb: AABB;
}

export interface BroadphasePair {
  readonly aId: string;
  readonly bId: string;
}

/**
 * 1D Sort-and-Sweep (Sweep-and-Prune) broadphase collision pair finder on X-axis
 * with exact Y-interval rejection.
 */
export function sweepAndPruneBroadphase(bodies: ReadonlyArray<SweepBody>): BroadphasePair[] {
  if (bodies.length < 2) return [];
  const sorted = [...bodies].sort((u, v) => u.aabb.minX - v.aabb.minX);
  const pairs: BroadphasePair[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    for (let j = i + 1; j < sorted.length; j++) {
      const b = sorted[j];
      if (b.aabb.minX > a.aabb.maxX) break;
      if (a.aabb.minY <= b.aabb.maxY && a.aabb.maxY >= b.aabb.minY) {
        pairs.push({ aId: a.id, bId: b.id });
      }
    }
  }
  return pairs;
}

/**
 * Zero-Allocation Spatial Hash Grid for O(1) neighbor lookup during combat & steering.
 */
export class ZeroAllocSpatialHashGrid {
  private readonly cellSize: number;
  private readonly invCellSize: number;
  private readonly cells = new Map<number, SpatialHashCell>();
  private readonly activeKeys: number[] = [];
  private readonly resultScratch: SpatialHashEntity[] = [];
  private readonly seenScratch = new Set<string>();

  constructor(cellSize = 32) {
    this.cellSize = Math.max(8, cellSize);
    this.invCellSize = 1 / this.cellSize;
  }

  private keyFor(cx: number, cy: number): number {
    return ((cx + 32768) << 16) ^ (cy + 32768);
  }

  public clear(): void {
    for (let i = 0; i < this.activeKeys.length; i++) {
      const cell = this.cells.get(this.activeKeys[i]);
      if (cell) cell.count = 0;
    }
    this.activeKeys.length = 0;
  }

  public insert(entity: SpatialHashEntity): void {
    const minCx = Math.floor((entity.x - entity.radius) * this.invCellSize);
    const maxCx = Math.floor((entity.x + entity.radius) * this.invCellSize);
    const minCy = Math.floor((entity.y - entity.radius) * this.invCellSize);
    const maxCy = Math.floor((entity.y + entity.radius) * this.invCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const k = this.keyFor(cx, cy);
        let cell = this.cells.get(k);
        if (!cell) {
          cell = { key: k, cx, cy, entities: [], count: 0 };
          this.cells.set(k, cell);
        }
        if (cell.count === 0) {
          this.activeKeys.push(k);
        }
        cell.entities[cell.count] = entity;
        cell.count += 1;
      }
    }
  }

  public queryRadius(
    x: number,
    y: number,
    radius: number,
    layerFilter?: SpatialHashEntity['layer'],
  ): ReadonlyArray<SpatialHashEntity> {
    this.resultScratch.length = 0;
    this.seenScratch.clear();

    const minCx = Math.floor((x - radius) * this.invCellSize);
    const maxCx = Math.floor((x + radius) * this.invCellSize);
    const minCy = Math.floor((y - radius) * this.invCellSize);
    const maxCy = Math.floor((y + radius) * this.invCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const cell = this.cells.get(this.keyFor(cx, cy));
        if (!cell || cell.count === 0) continue;
        for (let i = 0; i < cell.count; i++) {
          const ent = cell.entities[i];
          if (layerFilter && ent.layer !== layerFilter) continue;
          if (this.seenScratch.has(ent.id)) continue;
          const dx = ent.x - x;
          const dy = ent.y - y;
          const sumR = radius + ent.radius;
          if (dx * dx + dy * dy <= sumR * sumR) {
            this.seenScratch.add(ent.id);
            this.resultScratch.push(ent);
          }
        }
      }
    }

    return this.resultScratch;
  }
}
