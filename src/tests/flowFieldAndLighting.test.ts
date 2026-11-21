/**
 * Wave 5 Automated Vitest Suite #2 (16 Strict Tests):
 * Dijkstra Flow-Field Army Pathfinding (NEVER enters water/lava/cliff), Boids Steering,
 * 2D Raycasted Visibility Polygons, Cubic Bezier River Hydrology, Auto-Tiling, & Elevation Combat.
 */

import { describe, expect, it } from 'vitest';
import {
  buildFlowField,
  isWaterOrImpassableTile,
  stepArmyBoidsOnFlowField,
  traceFlowFieldPath,
  type BoidAgent,
} from '../math/flowFieldArmyPathfinder';
import {
  computeVisibilityPolygon,
  extractOccluderSegments,
  intersectRaySegment,
} from '../math/raycastPixelLighting';
import {
  compute4BitAutoTileMask,
  computeElevationCombatModifiers,
  distancePointToBezierRiver,
  evaluateCubicBezier,
} from '../math/bezierRiverAndElevation';

describe('Omniverse Suite 2 — Flow-Field Army AI, Raycast Lighting & River Elevation (16 Tests)', () => {
  it('01. marks River Water (3), Cliff Wall (7), Lava (10), and Acid Bog (13) as impassable', () => {
    expect(isWaterOrImpassableTile(3)).toBe(true);
    expect(isWaterOrImpassableTile(7)).toBe(true);
    expect(isWaterOrImpassableTile(10)).toBe(true);
    expect(isWaterOrImpassableTile(13)).toBe(true);
    expect(isWaterOrImpassableTile(0)).toBe(false);
    expect(isWaterOrImpassableTile(5)).toBe(false);
    expect(isWaterOrImpassableTile(6)).toBe(false);
  });

  it('02. Dijkstra Flow-Field assigns Infinity integration cost to river cells', () => {
    const grid = [
      [0, 3, 0],
      [0, 5, 0],
      [0, 3, 0],
    ];
    const field = buildFlowField(grid, { col: 2, row: 1 });
    expect(field.cells[0 * 3 + 1].integration).toBe(Number.POSITIVE_INFINITY);
    expect(field.cells[2 * 3 + 1].integration).toBe(Number.POSITIVE_INFINITY);
    expect(Number.isFinite(field.cells[1 * 3 + 1].integration)).toBe(true);
  });

  it('03. routes smoothly across a vertical river using a single southern wood bridge', () => {
    const grid: number[][] = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 12 }, (_, c) => (c === 6 ? (r === 8 ? 5 : 3) : 0)),
    );
    const field = buildFlowField(grid, { col: 10, row: 1 });
    const path = traceFlowFieldPath(field, grid, { col: 1, row: 1 });
    expect(path[path.length - 1]).toEqual({ col: 10, row: 1 });
    expect(path.some((p) => p.col === 6 && p.row === 8)).toBe(true);
    for (const step of path) {
      expect(isWaterOrImpassableTile(grid[step.row][step.col])).toBe(false);
    }
  });

  it('04. routes smoothly across a horizontal lava chasm using a single western stone bridge', () => {
    const grid: number[][] = Array.from({ length: 10 }, (_, r) =>
      Array.from({ length: 12 }, (_, c) => (r === 5 ? (c === 2 ? 6 : 10) : 0)),
    );
    const field = buildFlowField(grid, { col: 10, row: 8 });
    const path = traceFlowFieldPath(field, grid, { col: 10, row: 1 });
    expect(path[path.length - 1]).toEqual({ col: 10, row: 8 });
    expect(path.some((p) => p.col === 2 && p.row === 5)).toBe(true);
  });

  it('05. automatically chooses the closer of two bridges to minimize total path cost', () => {
    const grid: number[][] = Array.from({ length: 11 }, (_, r) =>
      Array.from({ length: 11 }, (_, c) => {
        if (c === 5) return r === 2 || r === 9 ? 5 : 3;
        return 0;
      }),
    );
    const field = buildFlowField(grid, { col: 9, row: 2 });
    const path = traceFlowFieldPath(field, grid, { col: 1, row: 2 });
    expect(path.some((p) => p.col === 5 && p.row === 2)).toBe(true);
    expect(path.some((p) => p.col === 5 && p.row === 9)).toBe(false);
  });

  it('06. Boids 20-agent Cat-Dog army marches across river bridge and NEVER touches water', () => {
    const rows = 9;
    const cols = 14;
    const tilePx = 24;
    const grid: number[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (c === 7 ? (r === 4 ? 5 : 3) : 0)),
    );
    const field = buildFlowField(grid, { col: 12, row: 4 });
    const agents: BoidAgent[] = Array.from({ length: 20 }, (_, i) => ({
      id: `soldier_${i}`,
      position: { x: 30 + (i % 4) * 16, y: 48 + Math.floor(i / 4) * 18 },
      velocity: { x: 0, y: 0 },
      radius: 6,
      maxSpeed: 74,
    }));

    for (let tick = 0; tick < 200; tick++) {
      stepArmyBoidsOnFlowField(agents, field, grid, tilePx, 1 / 60);
      for (const a of agents) {
        const c = Math.max(0, Math.min(cols - 1, Math.floor(a.position.x / tilePx)));
        const r = Math.max(0, Math.min(rows - 1, Math.floor(a.position.y / tilePx)));
        expect(isWaterOrImpassableTile(grid[r][c])).toBe(false);
      }
    }
  });

  it('07. Boids separation force prevents stacked agents from remaining permanently overlapped', () => {
    const grid: number[][] = Array.from({ length: 6 }, () => Array.from({ length: 6 }, () => 0));
    const field = buildFlowField(grid, { col: 5, row: 3 });
    const agents: BoidAgent[] = [
      { id: 'a', position: { x: 48, y: 72 }, velocity: { x: 0, y: 0 }, radius: 8, maxSpeed: 70 },
      { id: 'b', position: { x: 49, y: 72 }, velocity: { x: 0, y: 0 }, radius: 8, maxSpeed: 70 },
    ];
    for (let t = 0; t < 20; t++) {
      stepArmyBoidsOnFlowField(agents, field, grid, 24, 1 / 60);
    }
    const dist = Math.hypot(
      agents[0].position.x - agents[1].position.x,
      agents[0].position.y - agents[1].position.y,
    );
    expect(dist).toBeGreaterThan(2);
  });

  it('08. ray-segment intersection returns exact hit distance for perpendicular wall', () => {
    const t = intersectRaySegment(
      { origin: { x: 10, y: 50 }, direction: { x: 1, y: 0 }, maxDistance: 200 },
      { a: { x: 85, y: 0 }, b: { x: 85, y: 100 } },
    );
    expect(t).toBeCloseTo(75, 4);
  });

  it('09. ray-segment intersection returns null when ray points away or beyond maxDistance', () => {
    const behind = intersectRaySegment(
      { origin: { x: 10, y: 50 }, direction: { x: -1, y: 0 }, maxDistance: 200 },
      { a: { x: 85, y: 0 }, b: { x: 85, y: 100 } },
    );
    const tooFar = intersectRaySegment(
      { origin: { x: 10, y: 50 }, direction: { x: 1, y: 0 }, maxDistance: 50 },
      { a: { x: 85, y: 0 }, b: { x: 85, y: 100 } },
    );
    expect(behind).toBeNull();
    expect(tooFar).toBeNull();
  });

  it('10. extractOccluderSegments converts cliff polygons + 4 arena bounds into segments', () => {
    const segs = extractOccluderSegments(
      [
        {
          id: 'pillar_1',
          kind: 'pillar',
          castsShadow: true,
          elevation: 2,
          polygon: {
            vertices: [
              { x: 100, y: 100 },
              { x: 120, y: 100 },
              { x: 120, y: 120 },
              { x: 100, y: 120 },
            ],
          },
        },
      ],
      480,
      270,
    );
    // 4 arena boundary edges + 4 pillar polygon edges = 8
    expect(segs).toHaveLength(8);
  });

  it('11. 2D Visibility Polygon stops cleanly at solid shadow-casting castle wall', () => {
    const segs = extractOccluderSegments(
      [
        {
          id: 'castle_wall',
          kind: 'castle_wall',
          castsShadow: true,
          elevation: 2,
          polygon: {
            vertices: [
              { x: 180, y: 60 },
              { x: 200, y: 60 },
              { x: 200, y: 180 },
              { x: 180, y: 180 },
            ],
          },
        },
      ],
      480,
      270,
    );
    const vis = computeVisibilityPolygon(
      {
        id: 'nyx_wand_light',
        position: { x: 120, y: 120 },
        radius: 140,
        colorHex: '#38bdf8',
        intensity: 1,
        kind: 'starlight_beam',
      },
      segs,
    );
    expect(vis.vertices.length).toBeGreaterThanOrEqual(16);
    const leaked = vis.vertices.some((v) => Math.abs(v.y - 120) < 2 && v.x > 181);
    expect(leaked).toBe(false);
  });

  it('12. Cubic Bezier river spline matches endpoints exactly and arches smoothly at t=0.5', () => {
    const curve = {
      p0: { x: 0, y: 20 },
      p1: { x: 0, y: 140 },
      p2: { x: 120, y: 140 },
      p3: { x: 120, y: 20 },
    };
    expect(evaluateCubicBezier(curve, 0)).toEqual({ x: 0, y: 20 });
    expect(evaluateCubicBezier(curve, 1)).toEqual({ x: 120, y: 20 });
    expect(evaluateCubicBezier(curve, 0.5).x).toBeCloseTo(60, 4);
    expect(evaluateCubicBezier(curve, 0.5).y).toBeCloseTo(110, 4);
  });

  it('13. distancePointToBezierRiver measures accurate perpendicular clearance to river centerline', () => {
    const river = {
      p0: { x: 0, y: 135 },
      p1: { x: 160, y: 135 },
      p2: { x: 320, y: 135 },
      p3: { x: 480, y: 135 },
    };
    const probe = distancePointToBezierRiver({ x: 240, y: 105 }, river);
    expect(probe.distance).toBeCloseTo(30, 2);
    expect(probe.closestPoint.y).toBeCloseTo(135, 2);
  });

  it('14. 4-bit cardinal auto-tile bitmask encodes N=1, E=2, S=4, W=8 across full cross', () => {
    const cross = [
      [0, 3, 0],
      [3, 3, 3],
      [0, 3, 0],
    ];
    expect(compute4BitAutoTileMask(cross, 1, 1, 3)).toBe(15);

    const isolated = [
      [0, 0, 0],
      [0, 3, 0],
      [0, 0, 0],
    ];
    expect(compute4BitAutoTileMask(isolated, 1, 1, 3)).toBe(0);
  });

  it('15. Elevation combat modifiers apply +25% High Ground and 2.5x Combined Plunge Attack', () => {
    const hg = computeElevationCombatModifiers(1, 0, false, false);
    expect(hg.highGroundApplied).toBe(true);
    expect(hg.totalMultiplier).toBeCloseTo(1.25, 4);

    const plunge = computeElevationCombatModifiers(2, 0, true, false);
    expect(plunge.plungeApplied).toBe(true);
    expect(plunge.totalMultiplier).toBeCloseTo(2.5, 4);
  });

  it('16. Tall Grass Stealth Ambush doubles first-strike damage cleanly on flat ground', () => {
    const ambush = computeElevationCombatModifiers(0, 0, false, true);
    expect(ambush.stealthAmbushApplied).toBe(true);
    expect(ambush.totalMultiplier).toBeCloseTo(2.0, 4);
  });
});
