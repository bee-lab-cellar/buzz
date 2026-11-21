/**
 * File 90 / 100 — Automated Suite 01: Vector2D, Mat3, SAT OBB/Polygon/Circle, & SpatialHashGrid (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  addVec2,
  clampScalar,
  crossVec2,
  cubicBezierEase,
  dampScalar,
  distanceVec2,
  dotVec2,
  easeInOutCubic,
  lengthVec2,
  lerpVec2,
  mat3Determinant,
  mat3FromTRS,
  mat3Identity,
  mat3Invert,
  mat3Multiply,
  mat3TransformPoint,
  normalizeVec2,
  perpVec2,
  rotateVec2,
  scaleVec2,
  subVec2,
} from '../math/vectorAndMatrix2D';
import {
  computeObbAabb,
  obbToPolygon,
  satCircleVsPolygon,
  satObbVsObb,
  satPolygonVsPolygon,
  sweepAndPruneBroadphase,
  ZeroAllocSpatialHashGrid,
} from '../math/satCollisionAndSpatialHash';

describe('01. Vector2D, Mat3, SAT Collision & SpatialHashGrid (20 Tests)', () => {
  it('01. adds and subtracts 2D vectors accurately', () => {
    expect(addVec2({ x: 3, y: 4 }, { x: 5, y: -2 })).toEqual({ x: 8, y: 2 });
    expect(subVec2({ x: 9, y: 7 }, { x: 4, y: 10 })).toEqual({ x: 5, y: -3 });
  });

  it('02. scales and computes dot and 2D cross products', () => {
    expect(scaleVec2({ x: 2, y: -3 }, 4)).toEqual({ x: 8, y: -12 });
    expect(dotVec2({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    expect(crossVec2({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1);
  });

  it('03. computes vector length, distance, and unit normalization', () => {
    expect(lengthVec2({ x: 3, y: 4 })).toBeCloseTo(5, 6);
    expect(distanceVec2({ x: 1, y: 1 }, { x: 4, y: 5 })).toBeCloseTo(5, 6);
    const n = normalizeVec2({ x: 0, y: 9 });
    expect(n.x).toBeCloseTo(0, 6);
    expect(n.y).toBeCloseTo(1, 6);
  });

  it('04. handles zero-length vector normalization safely without NaN', () => {
    const n = normalizeVec2({ x: 0, y: 0 });
    expect(Number.isFinite(n.x)).toBe(true);
    expect(n).toEqual({ x: 0, y: 0 });
  });

  it('05. rotates and computes perpendicular vectors accurately', () => {
    expect(perpVec2({ x: 2, y: 5 })).toEqual({ x: -5, y: 2 });
    const rot = rotateVec2({ x: 1, y: 0 }, Math.PI / 2);
    expect(rot.x).toBeCloseTo(0, 5);
    expect(rot.y).toBeCloseTo(1, 5);
  });

  it('06. interpolates vectors, clamps scalars, and damps smoothly', () => {
    expect(lerpVec2({ x: 0, y: 0 }, { x: 10, y: 20 }, 0.5)).toEqual({ x: 5, y: 10 });
    expect(clampScalar(15, 0, 10)).toBe(10);
    expect(dampScalar(0, 100, 5, 0.1)).toBeGreaterThan(30);
  });

  it('07. evaluates cubic-bezier and easeInOutCubic boundaries cleanly', () => {
    expect(cubicBezierEase(0, 0.25, 0.75)).toBeCloseTo(0, 5);
    expect(cubicBezierEase(1, 0.25, 0.75)).toBeCloseTo(1, 5);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });

  it('08. computes identity Mat3 determinant = 1 and transforms point unchanged', () => {
    const id = mat3Identity();
    expect(mat3Determinant(id)).toBeCloseTo(1, 6);
    expect(mat3TransformPoint(id, { x: 7, y: -3 })).toEqual({ x: 7, y: -3 });
  });

  it('09. builds TRS Mat3 and transforms local points into world coordinates', () => {
    const m = mat3FromTRS(10, 20, Math.PI / 2, 2, 2);
    const pt = mat3TransformPoint(m, { x: 1, y: 0 });
    expect(pt.x).toBeCloseTo(10, 5);
    expect(pt.y).toBeCloseTo(22, 5);
  });

  it('10. inverts invertible Mat3 so M * M^-1 == Identity', () => {
    const m = mat3FromTRS(12, -8, 0.75, 1.5, 0.8);
    const inv = mat3Invert(m);
    expect(inv).not.toBeNull();
    const prod = mat3Multiply(m, inv!);
    expect(prod.m00).toBeCloseTo(1, 5);
    expect(prod.m11).toBeCloseTo(1, 5);
    expect(prod.m02).toBeCloseTo(0, 5);
    expect(prod.m12).toBeCloseTo(0, 5);
  });

  it('11. returns null when inverting singular (zero-scale) Mat3', () => {
    const singular = mat3FromTRS(5, 5, 0, 0, 1);
    expect(mat3Invert(singular)).toBeNull();
  });

  it('12. converts rotated OBB into 4-vertex polygon and tight AABB', () => {
    const obb = { center: { x: 10, y: 10 }, halfExtents: { x: 4, y: 2 }, rotation: Math.PI / 4 };
    const poly = obbToPolygon(obb);
    expect(poly.vertices.length).toBe(4);
    const aabb = computeObbAabb(obb);
    expect(aabb.minX).toBeLessThan(10);
    expect(aabb.maxX).toBeGreaterThan(10);
  });

  it('13. SAT detects overlapping axis-aligned OBBs with valid MTV', () => {
    const a = { center: { x: 0, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0 };
    const b = { center: { x: 8, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0 };
    const res = satObbVsObb(a, b);
    expect(res.colliding).toBe(true);
    expect(res.overlap).toBeCloseTo(2, 4);
  });

  it('14. SAT reports non-colliding for separated OBBs', () => {
    const a = { center: { x: 0, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0 };
    const b = { center: { x: 15, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0.4 };
    expect(satObbVsObb(a, b).colliding).toBe(false);
  });

  it('15. SAT detects rotated OBB corner overlap accurately', () => {
    const a = { center: { x: 0, y: 0 }, halfExtents: { x: 6, y: 2 }, rotation: Math.PI / 4 };
    const b = { center: { x: 6, y: 0 }, halfExtents: { x: 6, y: 2 }, rotation: -Math.PI / 4 };
    expect(satObbVsObb(a, b).colliding).toBe(true);
  });

  it('16. SAT Polygon-vs-Polygon resolves overlapping triangles cleanly', () => {
    const triA = { vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }] };
    const triB = { vertices: [{ x: 4, y: 2 }, { x: 14, y: 2 }, { x: 9, y: 12 }] };
    const res = satPolygonVsPolygon(triA, triB);
    expect(res.colliding).toBe(true);
    expect(res.overlap).toBeGreaterThan(0);
  });

  it('17. SAT Circle-vs-Polygon detects circle penetrating square edge', () => {
    const square = obbToPolygon({ center: { x: 0, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0 });
    const res = satCircleVsPolygon({ x: 7, y: 0, radius: 3, elevation: 0 }, square);
    expect(res.colliding).toBe(true);
    expect(res.overlap).toBeCloseTo(1, 4);
  });

  it('18. SAT Circle-vs-Polygon rejects distant circle cleanly', () => {
    const square = obbToPolygon({ center: { x: 0, y: 0 }, halfExtents: { x: 5, y: 5 }, rotation: 0 });
    expect(satCircleVsPolygon({ x: 20, y: 20, radius: 3, elevation: 0 }, square).colliding).toBe(false);
  });

  it('19. Sweep-and-Prune broadphase reports overlapping AABB pairs only', () => {
    const pairs = sweepAndPruneBroadphase([
      { id: 'a', aabb: { minX: 0, minY: 0, maxX: 10, maxY: 10 } },
      { id: 'b', aabb: { minX: 8, minY: 2, maxX: 18, maxY: 12 } },
      { id: 'c', aabb: { minX: 50, minY: 50, maxX: 60, maxY: 60 } },
    ]);
    expect(pairs.length).toBe(1);
    expect(pairs[0]).toEqual({ aId: 'a', bId: 'b' });
  });

  it('20. ZeroAllocSpatialHashGrid returns nearby entities and excludes distant entities', () => {
    const grid = new ZeroAllocSpatialHashGrid(32);
    grid.insert({ id: 'nyx', x: 16, y: 16, radius: 6, layer: 'hero' });
    grid.insert({ id: 'goblin', x: 24, y: 20, radius: 6, layer: 'enemy' });
    grid.insert({ id: 'dragon', x: 300, y: 300, radius: 24, layer: 'enemy' });
    const nearby = grid.queryRadius(16, 16, 20);
    expect(nearby.map((e) => e.id)).toContain('nyx');
    expect(nearby.map((e) => e.id)).toContain('goblin');
    expect(nearby.map((e) => e.id)).not.toContain('dragon');
  });
});
