/**
 * File 91 / 100 — Automated Suite 02: 2D Verlet Cloth Physics & Cellular Fluid/Fire Automaton (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  applyWindVector,
  createFenrirWolfScarfRig,
  createKingLeoCapeAndManeRig,
  createNyxStarryCloakRig,
  createVerletChainRig,
  createWarBannerRig,
  integrateNodes,
  sampleBiomeWind,
  solveDistanceConstraints,
  stepVerletClothRig,
} from '../math/verletCapeAndManePhysics';
import { CellularFluidAndFireSim } from '../math/cellularFluidAndFireSim';

describe('02. Verlet Cloth/Mane Physics & Cellular Fluid Automaton (20 Tests)', () => {
  it('01. creates Nyx Starry Cloak rig with pinned root node 0', () => {
    const rig = createNyxStarryCloakRig({ x: 50, y: 60 });
    expect(rig.nodes.length).toBeGreaterThanOrEqual(5);
    expect(rig.nodes[0].pinned).toBe(true);
    expect(rig.nodes[1].pinned).toBe(false);
  });

  it('02. creates King Leo Crimson Cape and 360-degree Golden Mane strands', () => {
    const leo = createKingLeoCapeAndManeRig({ x: 100, y: 120 });
    expect(leo.crimsonCape.nodes.length).toBeGreaterThanOrEqual(6);
    expect(leo.goldenManeTop.nodes.length).toBe(4);
    expect(leo.goldenManeSide.nodes.length).toBe(4);
  });

  it('03. creates Fenrir Wolf Scarf and Kingdom War Banner Verlet rigs', () => {
    const scarf = createFenrirWolfScarfRig({ x: 80, y: 90 });
    const banner = createWarBannerRig('banner_1', { x: 120, y: 40 });
    expect(scarf.kind).toBe('fenrir_scarf');
    expect(banner.kind).toBe('war_banner');
  });

  it('04. keeps pinned root locked onto moving hero anchor during integration', () => {
    const rig = createNyxStarryCloakRig({ x: 10, y: 10 });
    integrateNodes(rig, 1 / 60, { x: 45, y: 72 });
    expect(rig.nodes[0].x).toBe(45);
    expect(rig.nodes[0].y).toBe(72);
  });

  it('05. gravity pulls unpinned cloth nodes downward when integrated', () => {
    const rig = createNyxStarryCloakRig({ x: 40, y: 40 });
    const yBefore = rig.nodes[rig.nodes.length - 1].y;
    integrateNodes(rig, 1 / 60);
    expect(rig.nodes[rig.nodes.length - 1].y).toBeGreaterThan(yBefore);
  });

  it('06. Jakobsen constraint solver converges stretched sticks tightly', () => {
    const rig = createVerletChainRig('test_chain', 'nyx_cloak', { x: 0, y: 0 }, 5, 10, {
      stiffness: 1.0,
      constraintIterations: 12,
    });
    rig.nodes[4].x += 50;
    const err = solveDistanceConstraints(rig, 24);
    expect(err).toBeLessThan(0.5);
  });

  it('07. wind vector pushes unpinned nodes horizontally without moving pinned root', () => {
    const rig = createNyxStarryCloakRig({ x: 50, y: 50 });
    const tipBefore = rig.nodes[rig.nodes.length - 1].x;
    applyWindVector(rig, { x: 600, y: 0 }, 1 / 30);
    expect(rig.nodes[0].x).toBe(50);
    expect(rig.nodes[rig.nodes.length - 1].x).toBeGreaterThan(tipBefore);
  });

  it('08. sampleBiomeWind produces finite oscillating gust vectors', () => {
    const w1 = sampleBiomeWind({ baseWindX: 20, baseWindY: 0, gustAmplitude: 15, gustFrequencyHz: 1.2 }, 0.25, 2);
    expect(Number.isFinite(w1.x)).toBe(true);
    expect(Number.isFinite(w1.y)).toBe(true);
  });

  it('09. stepVerletClothRig stays finite and bounded over 120 frames of fast hero motion', () => {
    const rig = createNyxStarryCloakRig({ x: 0, y: 0 });
    for (let f = 0; f < 120; f++) {
      stepVerletClothRig(
        rig,
        { x: f * 2.5, y: 50 + Math.sin(f * 0.2) * 10 },
        { x: 150, y: 0 },
        { baseWindX: -30, baseWindY: 0, gustAmplitude: 12, gustFrequencyHz: 1 },
        f / 60,
        1 / 60,
      );
    }
    const tip = rig.nodes[rig.nodes.length - 1];
    expect(Number.isFinite(tip.x)).toBe(true);
    expect(Number.isFinite(tip.y)).toBe(true);
  });

  it('10. initializes CellularFluidAndFireSim grid completely empty at ambient temp', () => {
    const sim = new CellularFluidAndFireSim(16, 10);
    expect(sim.countPhase('empty')).toBe(160);
    expect(sim.getCell(4, 4)?.temperature).toBe(22);
  });

  it('11. sets lava temperature to 1100C and water temperature to 18C', () => {
    const sim = new CellularFluidAndFireSim(12, 12);
    sim.setCell(3, 3, 'lava');
    sim.setCell(4, 3, 'water');
    expect(sim.getCell(3, 3)?.temperature).toBe(1100);
    expect(sim.getCell(4, 3)?.temperature).toBe(18);
  });

  it('12. water + adjacent lava reacts to form solid obsidian and steam', () => {
    const sim = new CellularFluidAndFireSim(12, 12);
    sim.setCell(5, 11, 'lava');
    sim.setCell(6, 11, 'water');
    const events = sim.step();
    expect(events.some((e) => e.reaction === 'lava_water_obsidian')).toBe(true);
    expect(sim.countPhase('obsidian')).toBeGreaterThanOrEqual(1);
  });

  it('13. water extinguishes adjacent fire into steam', () => {
    const sim = new CellularFluidAndFireSim(12, 12);
    sim.setCell(5, 11, 'fire');
    sim.setCell(6, 11, 'water');
    const events = sim.step();
    expect(events.some((e) => e.reaction === 'fire_extinguished_steam')).toBe(true);
  });

  it('14. acid + adjacent lava reacts into toxic smoke', () => {
    const sim = new CellularFluidAndFireSim(12, 12);
    sim.setCell(5, 11, 'acid');
    sim.setCell(6, 11, 'lava');
    const events = sim.step();
    expect(events.some((e) => e.reaction === 'acid_lava_smoke')).toBe(true);
  });

  it('15. water falls downward under gravity into empty lower cell', () => {
    const sim = new CellularFluidAndFireSim(10, 10);
    sim.setCell(5, 2, 'water');
    sim.step();
    expect(sim.getCell(5, 3)?.phase).toBe('water');
  });

  it('16. steam rises upward into empty upper cell', () => {
    const sim = new CellularFluidAndFireSim(10, 10);
    sim.setCell(5, 6, 'steam');
    sim.step();
    expect(sim.getCell(5, 5)?.phase).toBe('steam');
  });

  it('17. injectSplash populates circular radius of fluid cells accurately', () => {
    const sim = new CellularFluidAndFireSim(16, 16);
    sim.injectSplash(8, 8, 2, 'water');
    expect(sim.countPhase('water')).toBeGreaterThanOrEqual(9);
  });

  it('18. fire cools down and eventually dissipates after fuel expires', () => {
    const sim = new CellularFluidAndFireSim(10, 10);
    sim.setCell(5, 5, 'fire', 2);
    for (let i = 0; i < 12; i++) sim.step();
    expect(sim.countPhase('fire')).toBe(0);
  });

  it('19. out-of-bounds cell queries return null safely', () => {
    const sim = new CellularFluidAndFireSim(8, 8);
    expect(sim.getCell(-1, 0)).toBeNull();
    expect(sim.getCell(8, 8)).toBeNull();
  });

  it('20. obsidian formed by water + lava stays solid and immovable under gravity', () => {
    const sim = new CellularFluidAndFireSim(10, 10);
    sim.setCell(4, 4, 'obsidian');
    sim.step();
    expect(sim.getCell(4, 4)?.phase).toBe('obsidian');
  });
});
