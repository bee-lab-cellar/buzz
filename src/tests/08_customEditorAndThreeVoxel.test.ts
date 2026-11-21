/**
 * File 97 / 100 — Automated Suite 08: Custom Dungeon Editor & Three.js 3D Hollow Cauldron / Trophies / Heroes (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  compileAndSanitizeCustomMap,
  createBlankCustomDungeonMap,
  CUSTOM_MAP_COLS,
  CUSTOM_MAP_ROWS,
  MAX_CUSTOM_ARENA_TRAPS,
  parseCustomDungeonMapJson,
  serializeCustomDungeonMap,
  validateCustomDungeonMap,
} from '../engine/customMapCompiler';
import {
  createSharedVoxelMaterials,
  VoxelResourceTracker,
} from '../three/voxelGeometryFactory';
import {
  buildAuthenticHollowVoxelCauldron,
  setCauldronBrewColor,
  stepVoxelCauldronAnimation,
} from '../three/voxelCauldronBuilder';
import {
  buildVoxelBossTrophyGroup,
  TEN_ARC_BOSS_TROPHIES,
} from '../three/voxelBossTrophyStage';
import { buildVoxelHeroSculpture } from '../three/voxelHeroShowcaseStage';
import {
  brewAlchemyRecipe,
  createInitialCapitalAlchemyState,
  starUpEquippedGear,
  upgradeCapitalBuilding,
} from '../engine/capitalAndAlchemyEngine';
import { CAPITAL_12_BUILDINGS } from '../data/capital12BuildingsData';
import { ALCHEMY_50_RECIPES, CONSTELLATION_60_SKILLS } from '../data/alchemy50RecipesAndSkills60';

describe('08. Custom Arena Compiler, 3D Hollow Voxel Cauldron, Boss Trophies & Hero Sculptures (20 Tests)', () => {
  it('01. createBlankCustomDungeonMap builds a valid 24x14 arena with central bridge', () => {
    const map = createBlankCustomDungeonMap();
    expect(map.cols).toBe(CUSTOM_MAP_COLS);
    expect(map.rows).toBe(CUSTOM_MAP_ROWS);
    const report = validateCustomDungeonMap(map);
    expect(report.valid).toBe(true);
    expect(report.bridgeTileCount).toBeGreaterThanOrEqual(2);
  });

  it('02. validateCustomDungeonMap rejects disconnected arena when bridge is removed', () => {
    const map = createBlankCustomDungeonMap();
    const brokenTiles = map.tiles.map((row) => row.map((c) => (c === 3 ? 2 : c)));
    const report = validateCustomDungeonMap({ ...map, tiles: brokenTiles });
    expect(report.valid).toBe(false);
    expect(report.errors.some((e) => e.includes('bridge'))).toBe(true);
  });

  it('03. compileAndSanitizeCustomMap clamps trap count to max 4 and seals outer borders', () => {
    const map = createBlankCustomDungeonMap();
    const compiled = compileAndSanitizeCustomMap({ ...map, trapCount: 99 });
    expect(compiled.trapCount).toBe(MAX_CUSTOM_ARENA_TRAPS);
    expect(compiled.tiles[0][5]).toBe(1);
    expect(compiled.tiles[13][5]).toBe(1);
  });

  it('04. serializeCustomDungeonMap and parseCustomDungeonMapJson round-trip losslessly', () => {
    const map = createBlankCustomDungeonMap('Starlight Forge Trial', 5);
    const json = serializeCustomDungeonMap(map);
    const parsed = parseCustomDungeonMapJson(json);
    expect(parsed).not.toBeNull();
    expect(parsed?.name).toBe('Starlight Forge Trial');
    expect(parsed?.arcId).toBe(5);
  });

  it('05. parseCustomDungeonMapJson returns null on malformed JSON safely', () => {
    expect(parseCustomDungeonMapJson('{not_valid_json')).toBeNull();
  });

  it('06. AUTHENTIC HOLLOW 3D VOXEL CAULDRON has 4 separate hollow cast-iron walls (NEVER a flat box!)', () => {
    const tracker = new VoxelResourceTracker();
    const mats = createSharedVoxelMaterials(tracker);
    const assembly = buildAuthenticHollowVoxelCauldron(tracker, mats, false);
    expect(assembly.wallMeshes.length).toBe(4);
    expect(assembly.footMeshes.length).toBe(4);
    tracker.disposeAll();
  });

  it('07. 3D Hollow Cauldron includes Oak-Log & Magma Campfire with 6 flickering flame cubes & warm PointLight', () => {
    const tracker = new VoxelResourceTracker();
    const mats = createSharedVoxelMaterials(tracker);
    const assembly = buildAuthenticHollowVoxelCauldron(tracker, mats, false);
    expect(assembly.flameMeshes.length).toBe(6);
    expect(assembly.campfireLight.intensity).toBeGreaterThan(0);
    tracker.disposeAll();
  });

  it('08. 3D Hollow Cauldron spawns 32 instanced rising bubble voxels & 3 blocky glass potion bottles', () => {
    const tracker = new VoxelResourceTracker();
    const mats = createSharedVoxelMaterials(tracker);
    const assembly = buildAuthenticHollowVoxelCauldron(tracker, mats, false);
    expect(assembly.bubbleStates.length).toBe(32);
    expect(assembly.bottleGroups.length).toBe(3);
    tracker.disposeAll();
  });

  it('09. 3D Hollow Cauldron animation updates stirring ladle & potion color reaction cleanly', () => {
    const tracker = new VoxelResourceTracker();
    const mats = createSharedVoxelMaterials(tracker);
    const assembly = buildAuthenticHollowVoxelCauldron(tracker, mats, false, '#38bdf8');
    setCauldronBrewColor(assembly, '#a855f7');
    stepVoxelCauldronAnimation(assembly, 0.016, 1.5, 1.8);
    expect(assembly.ladlePivot.rotation.y).not.toBe(0);
    expect(assembly.liquidMesh.material.color.getHexString()).toBe('a855f7');
    tracker.disposeAll();
  });

  it('10. VoxelResourceTracker disposes all tracked geometries and materials without errors', () => {
    const tracker = new VoxelResourceTracker();
    const mats = createSharedVoxelMaterials(tracker);
    buildAuthenticHollowVoxelCauldron(tracker, mats, false);
    expect(() => tracker.disposeAll()).not.toThrow();
  });

  it('11. TEN_ARC_BOSS_TROPHIES defines 10 unique 3D Boss Trophy relics across Arcs 1..10', () => {
    expect(TEN_ARC_BOSS_TROPHIES.length).toBe(10);
    const tracker = new VoxelResourceTracker();
    for (const meta of TEN_ARC_BOSS_TROPHIES) {
      const grp = buildVoxelBossTrophyGroup(tracker, meta, false);
      expect(grp.children.length).toBeGreaterThanOrEqual(4);
    }
    tracker.disposeAll();
  });

  it('12. 3D Voxel Hero Showcase builds Nyx with Crooked Starry Wizard Hat & pink nose', () => {
    const tracker = new VoxelResourceTracker();
    const nyx = buildVoxelHeroSculpture(tracker, 'nyx', false);
    expect(nyx.getObjectByName('nyx_hat_brim')).toBeDefined();
    expect(nyx.getObjectByName('nyx_hat_tip')).toBeDefined();
    expect(nyx.getObjectByName('nyx_nose')).toBeDefined();
    tracker.disposeAll();
  });

  it('13. 3D Voxel Hero Showcase builds King Leo, Fenrir, and The Great Duck cleanly', () => {
    const tracker = new VoxelResourceTracker();
    expect(buildVoxelHeroSculpture(tracker, 'king_leo', false).children.length).toBeGreaterThan(6);
    expect(buildVoxelHeroSculpture(tracker, 'fenrir', false).children.length).toBeGreaterThan(6);
    expect(buildVoxelHeroSculpture(tracker, 'great_duck', false).children.length).toBeGreaterThan(6);
    tracker.disposeAll();
  });

  it('14. Capital contains all 12 Felis-Fang United Capital Buildings', () => {
    expect(CAPITAL_12_BUILDINGS.length).toBe(12);
  });

  it('15. upgradeCapitalBuilding deducts gold and increments building level cleanly', () => {
    const st = createInitialCapitalAlchemyState(2000);
    const res = upgradeCapitalBuilding(st, 'royal_palace');
    expect(res.ok).toBe(true);
    expect(res.newLevel).toBe(2);
    expect(st.gold).toBeLessThan(2000);
  });

  it('16. ALCHEMY_50_RECIPES provides 50 distinct BlockCraft Alchemy Cauldron recipes', () => {
    expect(ALCHEMY_50_RECIPES.length).toBe(50);
  });

  it('17. brewAlchemyRecipe consumes ingredients and increments brewedFlasks inventory', () => {
    const st = createInitialCapitalAlchemyState(2000);
    const firstId = ALCHEMY_50_RECIPES[0].id;
    const res = brewAlchemyRecipe(st, firstId);
    expect(res.ok).toBe(true);
    expect(st.brewedFlasks[firstId]).toBe(1);
  });

  it('18. starUpEquippedGear upgrades gear star level and boosts ATK/DEF/HP', () => {
    const st = createInitialCapitalAlchemyState(5000);
    const r1 = starUpEquippedGear(st);
    const r2 = starUpEquippedGear(st);
    expect(r1.ok).toBe(true);
    expect(r2.newStars).toBe(2);
    expect(r2.atk).toBeGreaterThan(r1.atk);
  });

  it('19. starUpEquippedGear enforces +25★ Mythic Cap safely', () => {
    const st = createInitialCapitalAlchemyState(999999);
    st.equippedGearStars = 25;
    const res = starUpEquippedGear(st);
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('+25★');
  });

  it('20. CONSTELLATION_60_SKILLS contains exactly 60 Constellation Skill Tree nodes', () => {
    expect(CONSTELLATION_60_SKILLS.length).toBe(60);
  });
});
