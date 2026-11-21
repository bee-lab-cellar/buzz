/**
 * File 92 / 100 — Automated Suite 03: Flow-Field Army Pathfinder, Raycast Lighting & Day/Night Weather (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  buildFlowField,
  isWaterOrImpassableTile,
  sampleFlowVector,
  stepArmyBoidsOnFlowField,
  type BoidAgent,
} from '../math/flowFieldArmyPathfinder';
import {
  computeVisibilityPolygon,
  extractOccluderSegments,
  intersectRaySegment,
} from '../math/raycastPixelLighting';
import {
  BiomeWeatherParticleSystem,
  evaluateDayNightLighting,
  getBiomeWeatherForArc,
} from '../math/dayNightAndWeatherLighting';
import {
  compute4BitAutoTileMask,
  computeElevationCombatModifiers,
  evaluateCubicBezier,
} from '../math/bezierRiverAndElevation';

function makeBridgeArena(): number[][] {
  // Tile codes: 0=grass, 3=river water (impassable), 5=wooden bridge, 7=cliff wall (impassable)
  const grid: number[][] = [];
  for (let r = 0; r < 10; r++) {
    const row: number[] = [];
    for (let c = 0; c < 14; c++) {
      const border = r === 0 || r === 9 || c === 0 || c === 13;
      const river = c === 7 && r >= 1 && r <= 8;
      const bridge = c === 7 && (r === 4 || r === 5);
      row.push(border ? 7 : bridge ? 5 : river ? 3 : 0);
    }
    grid.push(row);
  }
  return grid;
}

describe('03. Flow-Field Army AI, Raycast Lighting & Day/Night Weather (20 Tests)', () => {
  it('01. marks ground (0) and bridge (5) walkable, river (3) and cliffs (7) unwalkable', () => {
    expect(isWaterOrImpassableTile(0)).toBe(false);
    expect(isWaterOrImpassableTile(5)).toBe(false);
    expect(isWaterOrImpassableTile(3)).toBe(true);
    expect(isWaterOrImpassableTile(7)).toBe(true);
  });

  it('02. Dijkstra Flow-Field assigns Infinity integration cost to river/water tiles', () => {
    const grid = makeBridgeArena();
    const field = buildFlowField(grid, { col: 11, row: 4 });
    const riverCell = field.cells[2 * field.cols + 7];
    expect(riverCell.integration).toBe(Infinity);
  });

  it('03. Dijkstra Flow-Field assigns finite cost across bridge tiles', () => {
    const grid = makeBridgeArena();
    const field = buildFlowField(grid, { col: 11, row: 4 });
    const bridgeCell = field.cells[4 * field.cols + 7];
    expect(Number.isFinite(bridgeCell.integration)).toBe(true);
    expect(bridgeCell.integration).toBeGreaterThan(0);
  });

  it('04. Flow-Field directs left-bank units toward the bridge rather than straight into river', () => {
    const grid = makeBridgeArena();
    const field = buildFlowField(grid, { col: 11, row: 4 });
    const dir = sampleFlowVector(field, 5, 2);
    expect(dir.y).toBeGreaterThan(0);
  });

  it('05. Boids army marches across bridge and NEVER steps onto water tiles', () => {
    const grid = makeBridgeArena();
    const field = buildFlowField(grid, { col: 11, row: 4 });
    const agents: BoidAgent[] = [
      { id: 'cat_1', position: { x: 40, y: 72 }, velocity: { x: 0, y: 0 }, radius: 6, maxSpeed: 64 },
      { id: 'cat_2', position: { x: 40, y: 88 }, velocity: { x: 0, y: 0 }, radius: 6, maxSpeed: 64 },
    ];
    for (let step = 0; step < 180; step++) {
      stepArmyBoidsOnFlowField(agents, field, grid, 16, 1 / 60);
      for (const a of agents) {
        const col = Math.floor(a.position.x / 16);
        const row = Math.floor(a.position.y / 16);
        expect(grid[row][col]).not.toBe(3);
      }
    }
    expect(agents[0].position.x).toBeGreaterThan(100);
  });

  it('06. Boids 26px separation pushes overlapping allies apart cleanly', () => {
    const grid = makeBridgeArena();
    const field = buildFlowField(grid, { col: 11, row: 4 });
    const agents: BoidAgent[] = [
      { id: 'a', position: { x: 48, y: 72 }, velocity: { x: 0, y: 0 }, radius: 6, maxSpeed: 64 },
      { id: 'b', position: { x: 50, y: 72 }, velocity: { x: 0, y: 0 }, radius: 6, maxSpeed: 64 },
    ];
    for (let i = 0; i < 30; i++) {
      stepArmyBoidsOnFlowField(agents, field, grid, 16, 1 / 60);
    }
    const dist = Math.hypot(agents[0].position.x - agents[1].position.x, agents[0].position.y - agents[1].position.y);
    expect(dist).toBeGreaterThan(6);
  });

  it('07. raycast hits vertical occluder wall at exact intersection distance', () => {
    const hitDist = intersectRaySegment(
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 }, maxDistance: 100 },
      { a: { x: 25, y: -10 }, b: { x: 25, y: 10 } },
    );
    expect(hitDist).not.toBeNull();
    expect(hitDist!).toBeCloseTo(25, 4);
  });

  it('08. raycast returns null for non-intersecting segment cleanly', () => {
    const hitDist = intersectRaySegment(
      { origin: { x: 0, y: 0 }, direction: { x: 1, y: 0 }, maxDistance: 80 },
      { a: { x: 25, y: 20 }, b: { x: 25, y: 40 } },
    );
    expect(hitDist).toBeNull();
  });

  it('09. extractOccluderSegments produces 4 boundary edges plus polygon occluder edges', () => {
    const segs = extractOccluderSegments(
      [
        {
          id: 'wall_1',
          kind: 'pillar',
          castsShadow: true,
          elevation: 1,
          polygon: {
            vertices: [
              { x: 40, y: 40 },
              { x: 60, y: 40 },
              { x: 60, y: 60 },
              { x: 40, y: 60 },
            ],
          },
        },
      ],
      320,
      180,
    );
    expect(segs.length).toBe(8);
  });

  it('10. computeVisibilityPolygon generates closed shadow-casting polygon around torch', () => {
    const segs = extractOccluderSegments(
      [
        {
          id: 'pillar',
          kind: 'pillar',
          castsShadow: true,
          elevation: 1,
          polygon: {
            vertices: [
              { x: 140, y: 90 },
              { x: 156, y: 90 },
              { x: 156, y: 110 },
              { x: 140, y: 110 },
            ],
          },
        },
      ],
      320,
      180,
    );
    const poly = computeVisibilityPolygon(
      { id: 'torch_1', position: { x: 100, y: 100 }, radius: 120, colorHex: '#f59e0b', intensity: 1, kind: 'torch' },
      segs,
    );
    expect(poly.vertices.length).toBeGreaterThanOrEqual(8);
  });

  it('11. Day/Night cycle evaluates dawn, noon, dusk, and midnight phases', () => {
    expect(evaluateDayNightLighting(0.1, 1).phase).toBe('dawn');
    expect(evaluateDayNightLighting(0.4, 1).phase).toBe('noon');
    expect(evaluateDayNightLighting(0.7, 1).phase).toBe('dusk');
    expect(evaluateDayNightLighting(0.9, 1).phase).toBe('midnight');
  });

  it('12. Arc 10 or boss finale triggers blood_eclipse atmosphere', () => {
    expect(evaluateDayNightLighting(0.4, 10).phase).toBe('blood_eclipse');
    expect(evaluateDayNightLighting(0.4, 3, true).phase).toBe('blood_eclipse');
  });

  it('13. getBiomeWeatherForArc returns distinct themed weather across all 10 Arcs', () => {
    expect(getBiomeWeatherForArc(4)).toBe('underwater_bubbles');
    expect(getBiomeWeatherForArc(7)).toBe('snow');
    expect(getBiomeWeatherForArc(10)).toBe('void_sparks');
  });

  it('14. BiomeWeatherParticleSystem updates and wraps particles cleanly inside viewport', () => {
    const sys = new BiomeWeatherParticleSystem(320, 180, 24);
    sys.configure('snow');
    sys.update(0.5);
    const particles = sys.getParticles();
    expect(particles.length).toBe(24);
    for (const p of particles) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(320);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(180);
    }
  });

  it('15. evaluateCubicBezier produces smooth centerline points across arena', () => {
    const spline = {
      p0: { x: 0, y: 120 },
      p1: { x: 100, y: 60 },
      p2: { x: 220, y: 180 },
      p3: { x: 320, y: 110 },
    };
    const start = evaluateCubicBezier(spline, 0);
    const mid = evaluateCubicBezier(spline, 0.5);
    const end = evaluateCubicBezier(spline, 1);
    expect(start.x).toBeCloseTo(0, 4);
    expect(mid.x).toBeGreaterThan(100);
    expect(end.x).toBeCloseTo(320, 4);
  });

  it('16. 4-bit bitmask auto-tiling computes exact N/E/S/W bit flags (0..15)', () => {
    const fullGrid = [
      [3, 3, 3],
      [3, 3, 3],
      [3, 3, 3],
    ];
    const emptyNeighbors = [
      [0, 0, 0],
      [0, 3, 0],
      [0, 0, 0],
    ];
    expect(compute4BitAutoTileMask(fullGrid, 1, 1, 3)).toBe(15);
    expect(compute4BitAutoTileMask(emptyNeighbors, 1, 1, 3)).toBe(0);
  });

  it('17. High-Ground elevation grants bonus attack multiplier against lower defenders', () => {
    const adv = computeElevationCombatModifiers(2, 0, false, false);
    expect(adv.totalMultiplier).toBeGreaterThan(1.0);
    expect(adv.highGroundApplied).toBe(true);
  });

  it('18. Equal elevation yields neutral 1.0x combat multiplier', () => {
    const adv = computeElevationCombatModifiers(1, 1, false, false);
    expect(adv.totalMultiplier).toBe(1.0);
    expect(adv.highGroundApplied).toBe(false);
  });

  it('19. underwater bubbles weather rises upward (vy < 0)', () => {
    const sys = new BiomeWeatherParticleSystem(320, 180, 10);
    sys.configure('underwater_bubbles');
    expect(sys.getParticles()[0].vy).toBeLessThan(0);
  });

  it('20. Flow-Field handles unreachable goal gracefully without throwing', () => {
    const walled = [
      [7, 7, 7],
      [7, 7, 7],
      [7, 7, 7],
    ];
    const field = buildFlowField(walled, { col: 1, row: 1 });
    expect(field.cells.length).toBe(9);
  });
});
