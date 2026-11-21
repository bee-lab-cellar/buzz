/**
 * Pillar 4 — Automated Vitest Suite #1:
 * Math, SAT Collision, Spatial Hash, Bezier Rivers, Elevation, Visibility Raycasting,
 * Flow-Field Army Pathfinding (NEVER steps on water!), & Deterministic 60Hz Replay.
 */

import { describe, expect, it } from 'vitest';
import { Mulberry32 } from '../types/math';
import { INPUT_BIT_ATTACK, INPUT_BIT_DODGE, INPUT_BIT_ELIXIR } from '../types/combat';
import {
  mat3FromTRS,
  mat3TransformPoint,
  satCircleVsPolygon,
  satObbVsObb,
  sweepAndPruneBroadphase,
  ZeroAllocSpatialHashGrid,
} from '../math/geometryAndSat';
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
import {
  advanceFixedTimestep,
  createFixedTimestepState,
  deserializeReplay,
  DeterministicReplayPlayer,
  DeterministicReplayRecorder,
  serializeReplay,
} from '../math/deterministicReplayEngine';

describe('Pillar 1 — Math, SAT Physics, Lighting, Flow-Field & Replay Invariants', () => {
  it('1. resolves colliding rotated OBBs via SAT with separating MTV', () => {
    const obbA = { center: { x: 100, y: 100 }, halfExtents: { x: 20, y: 12 }, rotation: 0.4 };
    const obbB = { center: { x: 118, y: 106 }, halfExtents: { x: 18, y: 12 }, rotation: -0.3 };
    const hit = satObbVsObb(obbA, obbB);
    expect(hit.colliding).toBe(true);
    expect(hit.overlap).toBeGreaterThan(0);

    // Applying MTV separates the two OBBs
    const pushedA = {
      ...obbA,
      center: { x: obbA.center.x + hit.mtv.x * 1.05, y: obbA.center.y + hit.mtv.y * 1.05 },
    };
    expect(satObbVsObb(pushedA, obbB).colliding).toBe(false);
  });

  it('2. detects separated rotated OBBs cleanly with zero overlap', () => {
    const obbA = { center: { x: 10, y: 10 }, halfExtents: { x: 12, y: 8 }, rotation: 0.75 };
    const obbB = { center: { x: 80, y: 80 }, halfExtents: { x: 12, y: 8 }, rotation: -0.5 };
    const res = satObbVsObb(obbA, obbB);
    expect(res.colliding).toBe(false);
    expect(res.overlap).toBe(0);
  });

  it('3. solves SAT Circle-vs-Polygon for overlapping and separated cases', () => {
    const square = {
      vertices: [
        { x: 40, y: 40 },
        { x: 80, y: 40 },
        { x: 80, y: 80 },
        { x: 40, y: 80 },
      ],
    };
    const hit = satCircleVsPolygon({ x: 35, y: 60, radius: 10, elevation: 0 }, square);
    expect(hit.colliding).toBe(true);
    expect(hit.overlap).toBeCloseTo(5, 3);

    const miss = satCircleVsPolygon({ x: 10, y: 60, radius: 8, elevation: 0 }, square);
    expect(miss.colliding).toBe(false);
  });

  it('4. Sweep-and-Prune broadphase detects overlapping pairs and ignores disjoint bodies', () => {
    const pairs = sweepAndPruneBroadphase([
      { id: 'hero', aabb: { minX: 0, minY: 0, maxX: 20, maxY: 20 } },
      { id: 'enemy_near', aabb: { minX: 15, minY: 10, maxX: 35, maxY: 30 } },
      { id: 'enemy_far', aabb: { minX: 120, minY: 0, maxX: 140, maxY: 20 } },
    ]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual({ aId: 'hero', bId: 'enemy_near' });
  });

  it('5. ZeroAllocSpatialHashGrid performs O(1) radius query with layer filtering', () => {
    const grid = new ZeroAllocSpatialHashGrid(32);
    grid.insert({ id: 'ally_1', x: 50, y: 50, radius: 8, layer: 'ally' });
    grid.insert({ id: 'enemy_1', x: 64, y: 52, radius: 8, layer: 'enemy' });
    grid.insert({ id: 'enemy_far', x: 300, y: 300, radius: 8, layer: 'enemy' });

    const enemies = grid.queryRadius(50, 50, 24, 'enemy');
    expect(enemies).toHaveLength(1);
    expect(enemies[0].id).toBe('enemy_1');

    grid.clear();
    expect(grid.queryRadius(50, 50, 100)).toHaveLength(0);
  });

  it('6. Mat3 TRS matrix transforms points accurately', () => {
    const m = mat3FromTRS(10, 20, Math.PI / 2, 2, 2);
    const pt = mat3TransformPoint(m, { x: 5, y: 0 });
    expect(pt.x).toBeCloseTo(10, 4);
    expect(pt.y).toBeCloseTo(30, 4);
  });

  it('7. evaluates Cubic Bezier river spline endpoints and smooth midpoint', () => {
    const spline = {
      p0: { x: 0, y: 0 },
      p1: { x: 0, y: 100 },
      p2: { x: 100, y: 100 },
      p3: { x: 100, y: 0 },
    };
    expect(evaluateCubicBezier(spline, 0)).toEqual({ x: 0, y: 0 });
    expect(evaluateCubicBezier(spline, 1)).toEqual({ x: 100, y: 0 });
    const mid = evaluateCubicBezier(spline, 0.5);
    expect(mid.x).toBeCloseTo(50, 4);
    expect(mid.y).toBeCloseTo(75, 4);
  });

  it('8. computes exact minimum distance from point to Bezier river centerline', () => {
    const straightRiver = {
      p0: { x: 0, y: 100 },
      p1: { x: 100, y: 100 },
      p2: { x: 200, y: 100 },
      p3: { x: 300, y: 100 },
    };
    const res = distancePointToBezierRiver({ x: 150, y: 124 }, straightRiver);
    expect(res.distance).toBeCloseTo(24, 2);
    expect(res.closestPoint.y).toBeCloseTo(100, 2);
  });

  it('9. computes exact 4-bit cardinal auto-tile bitmask (N=1, E=2, S=4, W=8)', () => {
    const grid = [
      [0, 3, 0],
      [3, 3, 3],
      [0, 0, 0],
    ];
    // Center cell (col=1, row=1) has N(1), E(2), W(8) neighbors of code 3 => 1 + 2 + 8 = 11
    expect(compute4BitAutoTileMask(grid, 1, 1, 3)).toBe(11);
  });

  it('10. enforces High Ground (+25%), Plunge Slash (2.0x), and Tall Grass Stealth (2.0x)', () => {
    const highGround = computeElevationCombatModifiers(2, 0, false, false);
    expect(highGround.highGroundApplied).toBe(true);
    expect(highGround.totalMultiplier).toBeCloseTo(1.25, 4);

    const plunge = computeElevationCombatModifiers(2, 0, true, false);
    expect(plunge.plungeApplied).toBe(true);
    expect(plunge.totalMultiplier).toBeCloseTo(2.5, 4);

    const stealth = computeElevationCombatModifiers(0, 0, false, true);
    expect(stealth.stealthAmbushApplied).toBe(true);
    expect(stealth.totalMultiplier).toBeCloseTo(2.0, 4);
  });

  it('11. intersects 2D lighting ray with occluder segment accurately', () => {
    const hitT = intersectRaySegment(
      { origin: { x: 0, y: 50 }, direction: { x: 1, y: 0 }, maxDistance: 200 },
      { a: { x: 60, y: 0 }, b: { x: 60, y: 100 } },
    );
    expect(hitT).toBeCloseTo(60, 4);

    const miss = intersectRaySegment(
      { origin: { x: 0, y: 50 }, direction: { x: -1, y: 0 }, maxDistance: 200 },
      { a: { x: 60, y: 0 }, b: { x: 60, y: 100 } },
    );
    expect(miss).toBeNull();
  });

  it('12. computes 2D Visibility Polygon bounded by cliff wall occluders', () => {
    const segs = extractOccluderSegments(
      [
        {
          id: 'wall_1',
          kind: 'cliff_ledge',
          castsShadow: true,
          elevation: 2,
          polygon: {
            vertices: [
              { x: 140, y: 80 },
              { x: 160, y: 80 },
              { x: 160, y: 160 },
              { x: 140, y: 160 },
            ],
          },
        },
      ],
      480,
      270,
    );
    const vis = computeVisibilityPolygon(
      {
        id: 'torch_1',
        position: { x: 100, y: 120 },
        radius: 120,
        colorHex: '#fbbf24',
        intensity: 1,
        kind: 'torch',
      },
      segs,
    );
    expect(vis.vertices.length).toBeGreaterThanOrEqual(16);
    // No ray pointing directly east (y ~ 120, x > 140.5) should penetrate the solid wall at x=140
    const penetrated = vis.vertices.some((v) => Math.abs(v.y - 120) < 2 && v.x > 141);
    expect(penetrated).toBe(false);
  });

  it('13. Flow-Field pathfinder crosses river via bridge and NEVER steps onto water/lava/cliff', () => {
    // 12 cols x 9 rows map split vertically by a full River (col=6, code=3), with a single WoodBridge (code=5) at row=7
    const rows = 9;
    const cols = 12;
    const grid: number[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        if (c === 6) return r === 7 ? 5 : 3; // Bridge ONLY at (6, 7), water everywhere else in col 6
        return 0;
      }),
    );

    const field = buildFlowField(grid, { col: 10, row: 1 });
    const path = traceFlowFieldPath(field, grid, { col: 1, row: 1 });

    expect(path.length).toBeGreaterThan(8);
    expect(path[path.length - 1]).toEqual({ col: 10, row: 1 });
    // Every single stepped cell must be strictly walkable dry/bridge land
    for (const step of path) {
      expect(isWaterOrImpassableTile(grid[step.row][step.col])).toBe(false);
    }
    // Must have crossed the bridge at (col=6, row=7)
    expect(path.some((p) => p.col === 6 && p.row === 7)).toBe(true);
  });

  it('14. Army Boids steering marches 12 units on Flow-Field and NEVER enters water tiles', () => {
    const rows = 8;
    const cols = 12;
    const tilePx = 24;
    const grid: number[][] = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => (c === 6 ? (r === 4 ? 6 : 3) : 0)),
    );
    const field = buildFlowField(grid, { col: 10, row: 4 });

    const agents: BoidAgent[] = Array.from({ length: 12 }, (_, i) => ({
      id: `cat_knight_${i}`,
      position: { x: 36 + (i % 3) * 18, y: 60 + Math.floor(i / 3) * 20 },
      velocity: { x: 0, y: 0 },
      radius: 7,
      maxSpeed: 72,
    }));

    for (let tick = 0; tick < 180; tick++) {
      stepArmyBoidsOnFlowField(agents, field, grid, tilePx, 1 / 60);
      for (const a of agents) {
        const c = Math.max(0, Math.min(cols - 1, Math.floor(a.position.x / tilePx)));
        const r = Math.max(0, Math.min(rows - 1, Math.floor(a.position.y / tilePx)));
        expect(isWaterOrImpassableTile(grid[r][c])).toBe(false);
      }
    }
  });

  it('15. Mulberry32 deterministic RNG produces identical streams for identical seeds', () => {
    const rngA = new Mulberry32(987654);
    const rngB = new Mulberry32(987654);
    const seqA = Array.from({ length: 12 }, () => rngA.nextFloat());
    const seqB = Array.from({ length: 12 }, () => rngB.nextFloat());
    expect(seqA).toEqual(seqB);
  });

  it('16. Fixed-timestep 60Hz recorder + Base64 serializer replays exact inputs frame-for-frame', () => {
    const stepper = createFixedTimestepState();
    const recorder = new DeterministicReplayRecorder();
    recorder.startRecording(180, 'nyx', 424242);

    const ticksExecuted = advanceFixedTimestep(stepper, 0.05, (tick) => {
      recorder.recordFrame({
        tick,
        moveX: tick === 1 ? 1 : 0,
        moveY: 0,
        actionMask: tick === 2 ? INPUT_BIT_ATTACK | INPUT_BIT_ELIXIR : INPUT_BIT_DODGE,
        swapSlot: tick === 2 ? 4 : 0,
        aimDeciDeg: tick * 450,
      });
    });

    expect(ticksExecuted).toBe(3);
    const replay = recorder.stopAndExport();
    const encoded = serializeReplay(replay);
    expect(encoded.startsWith('COTCR1:')).toBe(true);

    const decoded = deserializeReplay(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.actId).toBe(180);
    expect(decoded!.seed).toBe(424242);

    const player = new DeterministicReplayPlayer(decoded!);
    const f2 = player.getInputForTick(2);
    expect(f2.actionMask).toBe(INPUT_BIT_ATTACK | INPUT_BIT_ELIXIR);
    expect(f2.swapSlot).toBe(4);
  });
});
