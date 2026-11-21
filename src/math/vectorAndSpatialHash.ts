/**
 * Custom 2D/3D Vector Math Library, SAT Polygon Collision & Zero-GC SpatialHashGrid
 * Supports O(1) broad-phase queries across 10-enemy counter-attack squads & projectiles.
 */

import type {
  AABB,
  OBB,
  SATCollisionResult,
  SpatialHashCell,
  SpatialHashEntity,
  Vec2,
  Vec3,
} from '../types/math';

export function vec2(x = 0, y = 0): Vec2 {
  return { x, y };
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function add2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub2(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale2(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function dot3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross2(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function lengthSq2(v: Vec2): number {
  return v.x * v.x + v.y * v.y;
}

export function length2(v: Vec2): number {
  return Math.hypot(v.x, v.y);
}

export function normalize2(v: Vec2): Vec2 {
  const len = Math.hypot(v.x, v.y);
  if (len <= 1e-8) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function clamp(val: number, min: number, max: number): number {
  return val < min ? min : val > max ? max : val;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerp2(a: Vec2, b: Vec2, t: number): Vec2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function slerp(a: Vec2, b: Vec2, t: number): Vec2 {
  const na = normalize2(a);
  const nb = normalize2(b);
  const d = clamp(dot(na, nb), -1, 1);
  const theta = Math.acos(d) * t;
  const relX = nb.x - na.x * d;
  const relY = nb.y - na.y * d;
  const relLen = Math.hypot(relX, relY);
  if (relLen <= 1e-6) {
    return na;
  }
  const rx = relX / relLen;
  const ry = relY / relLen;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  return {
    x: na.x * c + rx * s,
    y: na.y * c + ry * s,
  };
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (Math.abs(edge1 - edge0) <= 1e-8) return x < edge0 ? 0 : 1;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function projectPointOnSegment(p: Vec2, segA: Vec2, segB: Vec2): {
  closest: Vec2;
  t: number;
  distanceSq: number;
} {
  const abX = segB.x - segA.x;
  const abY = segB.y - segA.y;
  const lenSq = abX * abX + abY * abY;
  if (lenSq <= 1e-8) {
    const dx = p.x - segA.x;
    const dy = p.y - segA.y;
    return { closest: { x: segA.x, y: segA.y }, t: 0, distanceSq: dx * dx + dy * dy };
  }
  const t = clamp(((p.x - segA.x) * abX + (p.y - segA.y) * abY) / lenSq, 0, 1);
  const cx = segA.x + abX * t;
  const cy = segA.y + abY * t;
  const dx = p.x - cx;
  const dy = p.y - cy;
  return { closest: { x: cx, y: cy }, t, distanceSq: dx * dx + dy * dy };
}

export function aabbIntersects(a: AABB, b: AABB): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function obbToVertices(obb: OBB): readonly [Vec2, Vec2, Vec2, Vec2] {
  const cos = Math.cos(obb.rotation);
  const sin = Math.sin(obb.rotation);
  const ux = cos * obb.halfExtents.x;
  const uy = sin * obb.halfExtents.x;
  const vx = -sin * obb.halfExtents.y;
  const vy = cos * obb.halfExtents.y;
  const cx = obb.center.x;
  const cy = obb.center.y;
  return [
    { x: cx - ux - vx, y: cy - uy - vy },
    { x: cx + ux - vx, y: cy + uy - vy },
    { x: cx + ux + vx, y: cy + uy + vy },
    { x: cx - ux + vx, y: cy - uy + vy },
  ];
}

function projectPolygon(verts: ReadonlyArray<Vec2>, axis: Vec2): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < verts.length; i++) {
    const proj = verts[i].x * axis.x + verts[i].y * axis.y;
    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }
  return { min, max };
}

export function satPolygonCollision(
  polyA: ReadonlyArray<Vec2>,
  polyB: ReadonlyArray<Vec2>
): SATCollisionResult {
  if (polyA.length < 3 || polyB.length < 3) {
    return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
  }

  let minOverlap = Infinity;
  let smallestAxisX = 0;
  let smallestAxisY = 0;

  const polygons: ReadonlyArray<ReadonlyArray<Vec2>> = [polyA, polyB];
  for (let pIdx = 0; pIdx < 2; pIdx++) {
    const poly = polygons[pIdx];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const edgeX = b.x - a.x;
      const edgeY = b.y - a.y;
      const len = Math.hypot(edgeX, edgeY);
      if (len <= 1e-8) continue;
      const axis: Vec2 = { x: -edgeY / len, y: edgeX / len };

      const projA = projectPolygon(polyA, axis);
      const projB = projectPolygon(polyB, axis);
      const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
      if (overlap <= 0) {
        return { colliding: false, overlap: 0, mtv: { x: 0, y: 0 } };
      }
      if (overlap < minOverlap) {
        minOverlap = overlap;
        smallestAxisX = axis.x;
        smallestAxisY = axis.y;
      }
    }
  }

  // Ensure MTV points from B toward A
  let cAx = 0;
  let cAy = 0;
  for (let i = 0; i < polyA.length; i++) {
    cAx += polyA[i].x;
    cAy += polyA[i].y;
  }
  cAx /= polyA.length;
  cAy /= polyA.length;

  let cBx = 0;
  let cBy = 0;
  for (let i = 0; i < polyB.length; i++) {
    cBx += polyB[i].x;
    cBy += polyB[i].y;
  }
  cBx /= polyB.length;
  cBy /= polyB.length;

  if ((cAx - cBx) * smallestAxisX + (cAy - cBy) * smallestAxisY < 0) {
    smallestAxisX = -smallestAxisX;
    smallestAxisY = -smallestAxisY;
  }

  return {
    colliding: true,
    overlap: minOverlap,
    mtv: { x: smallestAxisX * minOverlap, y: smallestAxisY * minOverlap },
  };
}

/**
 * Zero-GC Spatial Hash Grid for O(1) broad-phase queries across squads & projectiles.
 * Reuses pre-allocated cell arrays and scratch result buffers every frame!
 */
export class SpatialHashGrid {
  private readonly cellSize: number;
  private readonly invCellSize: number;
  private readonly cells: Map<number, SpatialHashCell> = new Map();
  private readonly activeCellKeys: number[] = [];
  private readonly queryBuffer: SpatialHashEntity[] = [];
  private readonly seenIds: Set<string> = new Set();

  constructor(cellSize = 32) {
    this.cellSize = Math.max(8, cellSize);
    this.invCellSize = 1 / this.cellSize;
  }

  private hashKey(cx: number, cy: number): number {
    return ((cx + 32768) << 16) ^ (cy + 32768);
  }

  public clear(): void {
    for (let i = 0; i < this.activeCellKeys.length; i++) {
      const cell = this.cells.get(this.activeCellKeys[i]);
      if (cell) {
        cell.count = 0;
      }
    }
    this.activeCellKeys.length = 0;
  }

  public insert(entity: SpatialHashEntity): void {
    const minCx = Math.floor((entity.x - entity.radius) * this.invCellSize);
    const maxCx = Math.floor((entity.x + entity.radius) * this.invCellSize);
    const minCy = Math.floor((entity.y - entity.radius) * this.invCellSize);
    const maxCy = Math.floor((entity.y + entity.radius) * this.invCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const key = this.hashKey(cx, cy);
        let cell = this.cells.get(key);
        if (!cell) {
          cell = { key, cx, cy, entities: [], count: 0 };
          this.cells.set(key, cell);
        }
        if (cell.count === 0) {
          this.activeCellKeys.push(key);
        }
        cell.entities[cell.count] = entity;
        cell.count++;
      }
    }
  }

  /**
   * Returns a reused scratch array of nearby entities (zero allocations during combat loop).
   * Consume immediately before the next queryRadius call.
   */
  public queryRadius(
    x: number,
    y: number,
    radius: number,
    filterLayer?: SpatialHashEntity['layer']
  ): ReadonlyArray<SpatialHashEntity> {
    this.queryBuffer.length = 0;
    this.seenIds.clear();

    const minCx = Math.floor((x - radius) * this.invCellSize);
    const maxCx = Math.floor((x + radius) * this.invCellSize);
    const minCy = Math.floor((y - radius) * this.invCellSize);
    const maxCy = Math.floor((y + radius) * this.invCellSize);

    for (let cy = minCy; cy <= maxCy; cy++) {
      for (let cx = minCx; cx <= maxCx; cx++) {
        const cell = this.cells.get(this.hashKey(cx, cy));
        if (!cell || cell.count === 0) continue;
        for (let i = 0; i < cell.count; i++) {
          const ent = cell.entities[i];
          if (filterLayer && ent.layer !== filterLayer) continue;
          if (this.seenIds.has(ent.id)) continue;
          const dx = ent.x - x;
          const dy = ent.y - y;
          const maxDist = radius + ent.radius;
          if (dx * dx + dy * dy <= maxDist * maxDist) {
            this.seenIds.add(ent.id);
            this.queryBuffer.push(ent);
          }
        }
      }
    }

    return this.queryBuffer;
  }

  public getCellSize(): number {
    return this.cellSize;
  }
}
