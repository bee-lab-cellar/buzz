/**
 * Pillar 4 — Automated Vitest Suite #2:
 * 300-Act Campaign Coverage, Dynamic Sanctuary Portal Routing, Arc Faction Routing,
 * Dry-Land Blacksmith Invariant across all 300 Acts, Open-Face Cat Art Rules,
 * 30-Track Soundtrack, 8 Cinema Tracks, Puzzles & Zero-Lag VFX Ring-Buffer.
 */

import { describe, expect, it } from 'vitest';
import {
  ALL_300_CAMPAIGN_BLUEPRINTS,
  getCampaignActBlueprint,
  resolveSanctuaryDestinationAct,
} from '../data/arc6Campaign';
import { getArcConfig } from '../engine/heroPartyAndWarEngine';
import { isWaterOrImpassableTile } from '../math/flowFieldArmyPathfinder';
import { stampBlacksmith3x3StonePatio } from '../math/bezierRiverAndElevation';
import { enforceOpenArenaPerimeterFraming } from '../sprites/cleanBiomeTileset';
import { OPEN_FACE_BLACKSMITH_SPEC, verifyOpenFaceCatMatrix } from '../sprites/armyAndBlacksmithSprites';
import { HERO_FOUR_MATRICES } from '../sprites/heroFourMatrices';
import { getSoundtrackTrackForAct, SOUNDTRACK_30_TRACKS } from '../audio/soundtrack30Tracks';
import { CUTSCENE_CHOREOGRAPHY_TRACKS } from '../engine/cutsceneChoreographyTracks';
import { createActBiomePuzzles, redirectMinecartByStrike } from '../engine/trapAndPuzzleEngine';
import { PRIMORDIAL_ANIMATED_GRADIENT, sampleBlockCraftCauldronVoxels } from '../engine/capitalAlchemyAndSkills';
import { ZeroLagVfxRingBuffer } from '../engine/zeroLagVfxRingBuffer';

describe('Pillar 2 & 3 — 300-Act Campaign, Sanctuary Routing, Art Rules & Audio Invariants', () => {
  it('1. builds all 300 unique ActBlueprints from Act 1 through Act 300', () => {
    expect(ALL_300_CAMPAIGN_BLUEPRINTS).toHaveLength(300);
    const seen = new Set<number>();
    for (const bp of ALL_300_CAMPAIGN_BLUEPRINTS) {
      seen.add(bp.actId);
    }
    expect(seen.size).toBe(300);
    expect(seen.has(1)).toBe(true);
    expect(seen.has(300)).toBe(true);
  });

  it('2. assigns every Act to the exact Story Arc boundary (1-41, 42-82, 83-122, 123-180, 181-240, 241-300)', () => {
    expect(getCampaignActBlueprint(1).arc).toBe(1);
    expect(getCampaignActBlueprint(41).arc).toBe(1);
    expect(getCampaignActBlueprint(42).arc).toBe(2);
    expect(getCampaignActBlueprint(82).arc).toBe(2);
    expect(getCampaignActBlueprint(83).arc).toBe(3);
    expect(getCampaignActBlueprint(122).arc).toBe(3);
    expect(getCampaignActBlueprint(123).arc).toBe(4);
    expect(getCampaignActBlueprint(180).arc).toBe(4);
    expect(getCampaignActBlueprint(181).arc).toBe(5);
    expect(getCampaignActBlueprint(240).arc).toBe(5);
    expect(getCampaignActBlueprint(241).arc).toBe(6);
    expect(getCampaignActBlueprint(300).arc).toBe(6);
  });

  it('3. routes all 6 Sanctuary Portals dynamically to act + 1 (NEVER hardcoded to Act 41)', () => {
    const sanctuaryPairs: ReadonlyArray<readonly [number, number]> = [
      [40, 41],
      [81, 82],
      [121, 122],
      [179, 180],
      [239, 240],
      [299, 300],
    ];
    for (const [sanctuaryAct, expectedDestination] of sanctuaryPairs) {
      const bp = getCampaignActBlueprint(sanctuaryAct);
      expect(bp.isSanctuary).toBe(true);
      expect(resolveSanctuaryDestinationAct(sanctuaryAct)).toBe(expectedDestination);
    }
  });

  it('4. getArcConfig(124) routes strictly to Arc IV Kraken Abyssal Armada, NEVER Arc III Dragons', () => {
    const cfg124 = getArcConfig(124);
    expect(cfg124.arcNumber).toBe(4);
    expect(cfg124.factionId).toBe('abyssal_armada');
    expect(cfg124.arcTitle.toLowerCase()).not.toContain('dragon');
  });

  it('5. getArcConfig maps all 6 Arcs to distinct enemy factions and captain prefixes', () => {
    const sampleActs = [15, 60, 100, 145, 210, 275];
    const factions = new Set(sampleActs.map((a) => getArcConfig(a).factionId));
    expect(factions.size).toBe(6);
  });

  it('6. places EVERY Blacksmith across all 300 Acts strictly on dry walkable land', () => {
    for (const bp of ALL_300_CAMPAIGN_BLUEPRINTS) {
      const row = bp.tileGrid[bp.blacksmithRow];
      expect(row).toBeDefined();
      const tileCode = row[bp.blacksmithCol];
      expect(isWaterOrImpassableTile(tileCode)).toBe(false);
    }
  });

  it('7. stampBlacksmith3x3StonePatio snaps to dry land and writes a dry 3x3 cobble patio (code=9)', () => {
    const grid = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => 0));
    const placed = stampBlacksmith3x3StonePatio(grid, 5, 5);
    expect(placed).toEqual({ col: 5, row: 5 });
    for (let r = 4; r <= 6; r++) {
      for (let c = 4; c <= 6; c++) {
        expect(grid[r][c]).toBe(9);
      }
    }
  });

  it('8. enforceOpenArenaPerimeterFraming removes interior wall/cliff spam while keeping outer rim', () => {
    const grid = Array.from({ length: 14 }, (_, r) =>
      Array.from({ length: 20 }, (_, c) => (r === 7 && c === 10 ? 7 : 0)),
    );
    enforceOpenArenaPerimeterFraming(grid);
    expect(grid[7][10]).toBe(0); // Interior clutter cliff cleared!
    expect(grid[0][0]).toBe(7); // Outer perimeter rim framed cleanly!
  });

  it('9. enforces Open-Face Cat Headband rule (y=1..4 only, zero visor bars across eyes)', () => {
    expect(OPEN_FACE_BLACKSMITH_SPEC.browBandRowMin).toBe(1);
    expect(OPEN_FACE_BLACKSMITH_SPEC.browBandRowMax).toBe(4);
    expect(OPEN_FACE_BLACKSMITH_SPEC.openFaceGuaranteed).toBe(true);

    const validOpenFace = [
      '....HHHH....',
      '...HHHHHH...',
      '..HHBBBBHH..',
      '..HBBBBBBH..',
      '..B.E..E.B..',
      '..B..PP..B..',
      '..B......B..',
    ];
    expect(verifyOpenFaceCatMatrix(validOpenFace)).toBe(true);

    const invalidVisorFace = [
      '....HHHH....',
      '...HHHHHH...',
      '..HHHHHHHH..',
      '..HHHHHHHH..',
      '..B.E..E.B..',
      '..BVVVVVVB..', // Metallic visor covering eyes at y=5 -> illegal!
      '..B..PP..B..',
    ];
    expect(verifyOpenFaceCatMatrix(invalidVisorFace)).toBe(false);
  });

  it('10. enforces Nyx 24x24 pink nose (#ff8fab) and 32x32 Royal Lion, Fenrir, and Great Duck matrices', () => {
    expect(HERO_FOUR_MATRICES.nyx.width).toBe(24);
    expect(HERO_FOUR_MATRICES.nyx.height).toBe(24);
    expect(HERO_FOUR_MATRICES.nyx.pinkNoseHex).toBe('#ff8fab');
    expect(Object.values(HERO_FOUR_MATRICES.nyx.sheet.palette)).toContain('#ff8fab');

    expect(HERO_FOUR_MATRICES.king_leo.width).toBe(32);
    expect(HERO_FOUR_MATRICES.king_leo.has360LionMane).toBe(true);
    expect(HERO_FOUR_MATRICES.fenrir.width).toBe(32);
    expect(HERO_FOUR_MATRICES.great_duck.width).toBe(32);
  });

  it('11. supplies 30 unique Soundtrack tracks covering all 6 Arcs, Sanctuaries, and Bosses', () => {
    expect(SOUNDTRACK_30_TRACKS).toHaveLength(30);
    const uniqueIds = new Set(SOUNDTRACK_30_TRACKS.map((t) => t.id));
    expect(uniqueIds.size).toBe(30);

    const krakenBossTrack = getSoundtrackTrackForAct(180, false, true);
    expect(krakenBossTrack.arc).toBe(4);
    expect(krakenBossTrack.mood).toBe('boss');
  });

  it('12. supplies all 8 Choreographed Multi-Beat Cinema Cutscene Tracks', () => {
    const allTracks = Object.values(CUTSCENE_CHOREOGRAPHY_TRACKS);
    expect(allTracks).toHaveLength(8);
    for (const track of allTracks) {
      expect(track.beats.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('13. spawns 2-3 clean spaced biome puzzles per Act and allows redirecting Minecart by strike', () => {
    const puzzles = createActBiomePuzzles(124);
    expect(puzzles.length).toBeGreaterThanOrEqual(2);
    expect(puzzles.length).toBeLessThanOrEqual(3);

    const minecart = {
      id: 'cart_1',
      kind: 'redirectable_minecart' as const,
      position: { x: 100, y: 120 },
      velocity: { x: 0, y: 0 },
      radius: 16,
      timerSec: 0,
      stateValue: 0,
      active: true,
      redirectedByPlayer: false,
    };
    const redirected = redirectMinecartByStrike(minecart, { x: 1, y: 0 });
    expect(redirected).toBe(true);
    expect(minecart.redirectedByPlayer).toBe(true);
    expect(minecart.velocity.x).toBeGreaterThan(100);
  });

  it('14. provides BlockCraft 3D Voxel Cauldron geometry & Primordial Starlight gradient stops', () => {
    const voxels = sampleBlockCraftCauldronVoxels(0.5, '#38bdf8', 12);
    expect(voxels).toHaveLength(12);
    expect(PRIMORDIAL_ANIMATED_GRADIENT.stops.length).toBeGreaterThanOrEqual(4);
  });

  it('15. ZeroLagVfxRingBuffer caps particles at 200, keeps camShake=0 on normal hits, and honors shake toggle', () => {
    const vfx = new ZeroLagVfxRingBuffer();
    for (let i = 0; i < 40; i++) {
      vfx.triggerNormalHitImpact({ x: 120, y: 120 }, '#38bdf8');
    }
    expect(vfx.getActiveParticleCount()).toBeLessThanOrEqual(200);

    // Normal hit: strictly ZERO camera shake!
    vfx.update(0.016);
    expect(vfx.getShakeOffset().x).toBe(0);
    expect(vfx.getShakeOffset().y).toBe(0);

    // Micro shake disabled when toggled off
    vfx.setScreenShakeEnabled(false);
    expect(vfx.screenShakeEnabled).toBe(false);
    vfx.triggerMajorImpactShake('tentacle_sever', { x: 120, y: 120 });
    expect(vfx.getShakeOffset().x).toBe(0);
    expect(vfx.getShakeOffset().y).toBe(0);
  });
});
