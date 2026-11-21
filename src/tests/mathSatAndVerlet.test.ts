/**
 * Wave 5 Automated Vitest Suite #1 (16 Strict Tests):
 * SAT OBB/Circle-Polygon Collision, Spatial Hash, Sweep-and-Prune, Mat3 TRS,
 * and 2D Verlet Spring-Mass Cloth & Mane Physics Convergence & Stability.
 */

import { describe, expect, it } from 'vitest';
import {
  mat3FromTRS,
  mat3TransformPoint,
  satCircleVsPolygon,
  satObbVsObb,
  sweepAndPruneBroadphase,
  ZeroAllocSpatialHashGrid,
} from '../math/geometryAndSat';
import {
  applyWindVector,
  createFenrirWolfScarfRig,
  createKingLeoCapeAndManeRig,
  createNyxStarryCloakRig,
  createVerletChainRig,
  createWarBannerRig,
  integrateNodes,
  measureMaxStickError,
  sampleBiomeWind,
  solveDistanceConstraints,
  stepVerletClothRig,
  type BiomeWindField,
} from '../math/verletCapeAndManePhysics';

const TEST_WIND: BiomeWindField = {
  baseWindX: 110,
  baseWindY: -12,
  gustAmplitude: 45,
  gustFrequencyHz: 0.75,
};

describe('Omniverse Suite 1 — SAT Geometry, Spatial Hash & 2D Verlet Cloth Physics (16 Tests)', () => {
  it('01. SAT OBB-vs-OBB detects rotated overlap and produces valid separating MTV', () => {
    const a = { center: { x: 100, y: 100 }, halfExtents: { x: 22, y: 12 }, rotation: 0.35 };
    const b = { center: { x: 116, y: 108 }, halfExtents: { x: 20, y: 10 }, rotation: -0.25 };
    const hit = satObbVsObb(a, b);
    expect(hit.colliding).toBe(true);
    expect(hit.overlap).toBeGreaterThan(0);

    const resolvedA = {
      ...a,
      center: { x: a.center.x + hit.mtv.x * 1.05, y: a.center.y + hit.mtv.y * 1.05 },
    };
    expect(satObbVsObb(resolvedA, b).colliding).toBe(false);
  });

  it('02. SAT OBB-vs-OBB reports zero overlap for disjoint rotated hitboxes', () => {
    const a = { center: { x: 20, y: 20 }, halfExtents: { x: 14, y: 8 }, rotation: 1.1 };
    const b = { center: { x: 140, y: 140 }, halfExtents: { x: 14, y: 8 }, rotation: -0.6 };
    const res = satObbVsObb(a, b);
    expect(res.colliding).toBe(false);
    expect(res.overlap).toBe(0);
  });

  it('03. SAT Circle-vs-Polygon resolves exact edge penetration and rejects misses', () => {
    const poly = {
      vertices: [
        { x: 50, y: 50 },
        { x: 90, y: 50 },
        { x: 90, y: 90 },
        { x: 50, y: 90 },
      ],
    };
    const hit = satCircleVsPolygon({ x: 44, y: 70, radius: 10, elevation: 0 }, poly);
    expect(hit.colliding).toBe(true);
    expect(hit.overlap).toBeCloseTo(4, 3);

    const miss = satCircleVsPolygon({ x: 20, y: 70, radius: 10, elevation: 0 }, poly);
    expect(miss.colliding).toBe(false);
  });

  it('04. Sweep-and-Prune broadphase isolates overlapping AABB pairs accurately', () => {
    const pairs = sweepAndPruneBroadphase([
      { id: 'nyx', aabb: { minX: 0, minY: 0, maxX: 24, maxY: 24 } },
      { id: 'wolf', aabb: { minX: 18, minY: 12, maxX: 40, maxY: 36 } },
      { id: 'far_dragon', aabb: { minX: 200, minY: 0, maxX: 260, maxY: 60 } },
    ]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual({ aId: 'nyx', bId: 'wolf' });
  });

  it('05. ZeroAllocSpatialHashGrid performs fast radius + layer queries and clean resets', () => {
    const hash = new ZeroAllocSpatialHashGrid(32);
    hash.insert({ id: 'hero', x: 100, y: 100, radius: 8, layer: 'ally' });
    hash.insert({ id: 'enemy_a', x: 112, y: 104, radius: 8, layer: 'enemy' });
    hash.insert({ id: 'enemy_b', x: 260, y: 260, radius: 8, layer: 'enemy' });

    const hits = hash.queryRadius(100, 100, 28, 'enemy');
    expect(hits).toHaveLength(1);
    expect(hits[0].id).toBe('enemy_a');

    hash.clear();
    expect(hash.queryRadius(100, 100, 500)).toHaveLength(0);
  });

  it('06. Mat3 TRS matrix accurately composes scale, 90deg rotation, and translation', () => {
    const m = mat3FromTRS(30, 40, Math.PI / 2, 2, 2);
    const out = mat3TransformPoint(m, { x: 10, y: 0 });
    expect(out.x).toBeCloseTo(30, 4);
    expect(out.y).toBeCloseTo(60, 4);
  });

  it('07. createVerletChainRig pins root anchor at index 0 and sets exact rest lengths', () => {
    const rig = createVerletChainRig('test_chain', 'war_banner', { x: 120, y: 80 }, 6, 5.0);
    expect(rig.nodes).toHaveLength(6);
    expect(rig.sticks).toHaveLength(5);
    expect(rig.nodes[0].pinned).toBe(true);
    expect(rig.nodes[1].pinned).toBe(false);
    expect(measureMaxStickError(rig)).toBeCloseTo(0, 6);
  });

  it('08. Nyx Starry Cloak Verlet rig initializes cleanly with 6 segments', () => {
    const cloak = createNyxStarryCloakRig({ x: 100, y: 140 });
    expect(cloak.kind).toBe('nyx_cloak');
    expect(cloak.nodes).toHaveLength(6);
    expect(cloak.nodes[0].x).toBe(100);
    expect(cloak.nodes[0].y).toBe(140);
  });

  it('09. King Leo 360-degree Mane & Crimson Cape factory returns 3 synchronized Verlet rigs', () => {
    const leoRigs = createKingLeoCapeAndManeRig({ x: 200, y: 150 });
    expect(leoRigs.crimsonCape.kind).toBe('king_leo_cape');
    expect(leoRigs.goldenManeTop.kind).toBe('king_leo_mane');
    expect(leoRigs.goldenManeSide.kind).toBe('king_leo_mane');
    expect(leoRigs.crimsonCape.nodes).toHaveLength(7);
  });

  it('10. Fenrir Wolf Scarf & War Banner Verlet rigs initialize with proper rest orientation', () => {
    const scarf = createFenrirWolfScarfRig({ x: 260, y: 140 });
    const banner = createWarBannerRig('banner_north', { x: 300, y: 90 });
    expect(scarf.kind).toBe('fenrir_scarf');
    expect(banner.kind).toBe('war_banner');
    expect(banner.nodes[banner.nodes.length - 1].x).toBeGreaterThan(banner.nodes[0].x);
  });

  it('11. sampleBiomeWind oscillates smoothly across time without NaN', () => {
    const w0 = sampleBiomeWind(TEST_WIND, 0, 0);
    const w1 = sampleBiomeWind(TEST_WIND, 0.33, 2);
    expect(Number.isFinite(w0.x)).toBe(true);
    expect(Number.isFinite(w1.y)).toBe(true);
    expect(w0.x).not.toBeCloseTo(w1.x, 3);
  });

  it('12. applyWindVector deflects unpinned tail nodes while keeping pinned root fixed', () => {
    const rig = createWarBannerRig('wind_test', { x: 50, y: 50 });
    const startTailX = rig.nodes[5].x;
    applyWindVector(rig, { x: 800, y: 0 }, 1 / 30);
    expect(rig.nodes[0].x).toBe(50);
    expect(rig.nodes[5].x).toBeGreaterThan(startTailX);
  });

  it('13. solveDistanceConstraints converges perturbed cloth sticks below 0.25px error', () => {
    const rig = createNyxStarryCloakRig({ x: 100, y: 100 });
    // Artificially stretch nodes far out of rest length along chain direction
    for (let i = 1; i < rig.nodes.length; i++) {
      rig.nodes[i].x -= i * 9;
      rig.nodes[i].y += i * 6;
    }
    expect(measureMaxStickError(rig)).toBeGreaterThan(5);

    solveDistanceConstraints(rig, 64);
    expect(measureMaxStickError(rig)).toBeLessThan(0.25);
  });

  it('14. integrateNodes strictly locks pinned root to moving hero anchor', () => {
    const rig = createNyxStarryCloakRig({ x: 100, y: 100 });
    integrateNodes(rig, 1 / 60, { x: 142, y: 118 });
    expect(rig.nodes[0].x).toBe(142);
    expect(rig.nodes[0].y).toBe(118);
  });

  it('15. hero rightward sprint creates realistic opposite slipstream trailing behind hero', () => {
    const rig = createNyxStarryCloakRig({ x: 100, y: 140 });
    let anchorX = 100;
    for (let tick = 0; tick < 60; tick++) {
      anchorX += 2.5;
      stepVerletClothRig(
        rig,
        { x: anchorX, y: 140 },
        { x: 150, y: 0 },
        { baseWindX: 0, baseWindY: 0, gustAmplitude: 0, gustFrequencyHz: 0 },
        tick / 60,
        1 / 60,
      );
    }
    // Tail tip must trail behind the sprinting anchor
    expect(rig.nodes[rig.nodes.length - 1].x).toBeLessThan(anchorX);
  });

  it('16. 300 ticks of high-wind Verlet cloth simulation produce zero NaN/Infinity and bounded stick error', () => {
    const rig = createKingLeoCapeAndManeRig({ x: 120, y: 120 }).crimsonCape;
    for (let tick = 0; tick < 300; tick++) {
      const t = tick / 60;
      const anchor = { x: 120 + Math.sin(t * 2) * 30, y: 120 + Math.cos(t * 1.5) * 14 };
      stepVerletClothRig(rig, anchor, { x: Math.cos(t * 2) * 60, y: 0 }, TEST_WIND, t, 1 / 60);
    }
    for (const n of rig.nodes) {
      expect(Number.isFinite(n.x)).toBe(true);
      expect(Number.isFinite(n.y)).toBe(true);
    }
    expect(measureMaxStickError(rig)).toBeLessThan(1.5);
  });
});
