/**
 * Wave 5 Automated Vitest Suite #3 (16 Strict Full-File Audit Tests):
 * Exhaustively iterates through ALL 1,000 OMNIVERSE ACTS (Acts 1 to 1,000),
 * all 10 Story Arcs, all 10 Sanctuaries (99..999 -> act + 1), all 100 Bosses,
 * all 50 Weapon & 50 Armor Tiers, 50 Alchemy Recipes, 60 Constellation Nodes,
 * 36 DSP OST Tracks, and 10 Bespoke Arc Boss Sprite Specs!
 */

import { describe, expect, it } from 'vitest';
import {
  ALL_1000_OMNIVERSE_ACTS,
  OMNIVERSE_ARC_CONFIGS,
  getOmniverseActBlueprint,
  getOmniverseArcConfig,
  resolveOmniverseSanctuaryDestination,
} from '../data/arc10_acts901to1000';
import { BOSSES_100_REGISTRY, getBossForAct } from '../data/bosses100Registry';
import {
  ALL_100_GEAR_TIERS,
  ARMORS_50_TIERS,
  OMNIVERSE_50_ALCHEMY_RECIPES,
  OMNIVERSE_60_CONSTELLATION_NODES,
  WEAPONS_50_TIERS,
  getRecommendedGearTierForAct,
} from '../data/gear50TiersAndAlchemy';
import { ALL_36_OMNIVERSE_OST_TRACKS, getOmniverseOstForAct } from '../audio/ostTracksArc6to10';
import { ALL_10_ARC_BOSS_SPRITES } from '../sprites/bossesArc6to10Sprites';
import { isWaterOrImpassableTile } from '../math/flowFieldArmyPathfinder';

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

describe('Omniverse Suite 3 — Exhaustive 1,000-Act, 100-Boss & 50-Tier Full Audit (16 Tests)', () => {
  it('01. ALL_1000_OMNIVERSE_ACTS contains strictly 1,000 unique Acts ordered 1..1000', () => {
    expect(ALL_1000_OMNIVERSE_ACTS).toHaveLength(1000);
    for (let i = 0; i < 1000; i++) {
      expect(ALL_1000_OMNIVERSE_ACTS[i].actId).toBe(i + 1);
    }
  });

  it('02. OMNIVERSE_ARC_CONFIGS spans all 10 contiguous 100-Act Story Arcs (1..1000)', () => {
    const configs = Object.values(OMNIVERSE_ARC_CONFIGS);
    expect(configs).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      const cfg = configs[i];
      expect(cfg.arcId).toBe(i + 1);
      expect(cfg.actMin).toBe(i * 100 + 1);
      expect(cfg.actMax).toBe((i + 1) * 100);
    }
  });

  it('03. EVERY SINGLE ACT (1..1000) has valid 6-digit hex biome palettes and non-empty titles/landmarks', () => {
    for (let i = 0; i < ALL_1000_OMNIVERSE_ACTS.length; i++) {
      const act = ALL_1000_OMNIVERSE_ACTS[i];
      expect(act.title.length).toBeGreaterThan(4);
      expect(act.landmark.name.length).toBeGreaterThan(3);
      expect(HEX_COLOR_RE.test(act.palette.groundPrimary)).toBe(true);
      expect(HEX_COLOR_RE.test(act.palette.groundSecondary)).toBe(true);
      expect(HEX_COLOR_RE.test(act.palette.roadHex)).toBe(true);
      expect(HEX_COLOR_RE.test(act.palette.liquidHex)).toBe(true);
      expect(HEX_COLOR_RE.test(act.palette.cliffHex)).toBe(true);
      expect(HEX_COLOR_RE.test(act.palette.accentHex)).toBe(true);
    }
  });

  it('04. EVERY SINGLE ACT (1..1000) spawns the Hero on strictly walkable dry land (NEVER water/lava/cliff)', () => {
    for (let i = 0; i < ALL_1000_OMNIVERSE_ACTS.length; i++) {
      const act = ALL_1000_OMNIVERSE_ACTS[i];
      const tile = act.tileGrid[act.heroSpawnRow]?.[act.heroSpawnCol];
      expect(tile).toBeDefined();
      expect(isWaterOrImpassableTile(tile)).toBe(false);
    }
  });

  it('05. EVERY SINGLE ACT (1..1000) places the Royal Blacksmith on strictly walkable dry land', () => {
    for (let i = 0; i < ALL_1000_OMNIVERSE_ACTS.length; i++) {
      const act = ALL_1000_OMNIVERSE_ACTS[i];
      const tile = act.tileGrid[act.blacksmithRow]?.[act.blacksmithCol];
      expect(tile).toBeDefined();
      expect(isWaterOrImpassableTile(tile)).toBe(false);
    }
  });

  it('06. ALL 10 Sanctuaries (99, 199, ..., 999) route dynamically to act + 1 (NEVER hardcoded to 40!)', () => {
    const expectedSanctuaries = [99, 199, 299, 399, 499, 599, 699, 799, 899, 999];
    for (const sAct of expectedSanctuaries) {
      const act = getOmniverseActBlueprint(sAct);
      expect(act.isSanctuary).toBe(true);
      expect(act.sanctuaryPortalDestination).toBe(sAct + 1);
      expect(resolveOmniverseSanctuaryDestination(sAct)).toBe(sAct + 1);
    }
  });

  it('07. ALL 10 Sanctuaries have unique speaker greetings and custom blessing scripts', () => {
    const greetings = new Set<string>();
    for (let arc = 1; arc <= 10; arc++) {
      const sAct = arc * 100 - 1;
      const act = getOmniverseActBlueprint(sAct);
      expect(act.sanctuaryScript).not.toBeNull();
      expect(act.sanctuaryScript!.destinationAct).toBe(sAct + 1);
      greetings.add(act.sanctuaryScript!.greetingLine);
    }
    expect(greetings.size).toBe(10);
  });

  it('08. ALL 10 Arcs possess 10 distinct enemy faction IDs with zero cross-arc Wolf leakage', () => {
    const factionIds = new Set<string>();
    for (let arc = 1; arc <= 10; arc++) {
      const sampleAct = (arc - 1) * 100 + 50;
      const cfg = getOmniverseArcConfig(sampleAct);
      factionIds.add(cfg.factionId);
      expect(cfg.enemyPool.length).toBeGreaterThanOrEqual(4);
      if (arc >= 3) {
        expect(cfg.factionId).not.toBe('usurper_wolves');
      }
    }
    expect(factionIds.size).toBe(10);
  });

  it('09. BOSSES_100_REGISTRY contains strictly 100 unique Bosses mapped to Acts 10, 20, ..., 1000', () => {
    expect(BOSSES_100_REGISTRY).toHaveLength(100);
    for (let i = 0; i < 100; i++) {
      const boss = BOSSES_100_REGISTRY[i];
      const expectedAct = (i + 1) * 10;
      expect(boss.actId).toBe(expectedAct);
      expect(getBossForAct(expectedAct)?.id).toBe(boss.id);
    }
  });

  it('10. Arc X Final Boss at Act 1,000 is 5-Phase AETHER-NULL with 12,500,000 HP', () => {
    const finalBoss = getBossForAct(1000);
    expect(finalBoss).not.toBeNull();
    expect(finalBoss!.isArcFinalBoss).toBe(true);
    expect(finalBoss!.name).toContain('AETHER-NULL');
    expect(finalBoss!.phaseThresholds.length).toBeGreaterThanOrEqual(4);
    expect(finalBoss!.maxHp).toBe(12_500_000);
  });

  it('11. WEAPONS_50_TIERS & ARMORS_50_TIERS provide 50 monotonic power tiers each (100 total gear items)', () => {
    expect(WEAPONS_50_TIERS).toHaveLength(50);
    expect(ARMORS_50_TIERS).toHaveLength(50);
    expect(ALL_100_GEAR_TIERS).toHaveLength(100);
    for (let i = 1; i < 50; i++) {
      expect(WEAPONS_50_TIERS[i].atkBonus).toBeGreaterThan(WEAPONS_50_TIERS[i - 1].atkBonus);
      expect(ARMORS_50_TIERS[i].defBonus).toBeGreaterThan(ARMORS_50_TIERS[i - 1].defBonus);
    }
    expect(getRecommendedGearTierForAct(1)).toBe(1);
    expect(getRecommendedGearTierForAct(1000)).toBe(50);
  });

  it('12. OMNIVERSE_50_ALCHEMY_RECIPES defines strictly 50 unique BlockCraft formulas with valid colors', () => {
    expect(OMNIVERSE_50_ALCHEMY_RECIPES).toHaveLength(50);
    const ids = new Set(OMNIVERSE_50_ALCHEMY_RECIPES.map((r) => r.id));
    expect(ids.size).toBe(50);
    for (const r of OMNIVERSE_50_ALCHEMY_RECIPES) {
      expect(r.ingredients.length).toBeGreaterThanOrEqual(2);
      expect(HEX_COLOR_RE.test(r.colorHex)).toBe(true);
    }
  });

  it('13. OMNIVERSE_60_CONSTELLATION_NODES defines strictly 60 balanced nodes across 6 branches (10 each)', () => {
    expect(OMNIVERSE_60_CONSTELLATION_NODES).toHaveLength(60);
    const counts = new Map<string, number>();
    for (const node of OMNIVERSE_60_CONSTELLATION_NODES) {
      counts.set(node.branch, (counts.get(node.branch) ?? 0) + 1);
    }
    expect(counts.get('blade_sovereign')).toBe(10);
    expect(counts.get('arcane_starlight')).toBe(10);
    expect(counts.get('iron_guardian')).toBe(10);
    expect(counts.get('swift_shadow')).toBe(10);
    expect(counts.get('alliance_commander')).toBe(10);
    expect(counts.get('omniverse_alchemist')).toBe(10);
  });

  it('14. ALL_36_OMNIVERSE_OST_TRACKS contains 36 unique compositions covering all 10 Arcs', () => {
    expect(ALL_36_OMNIVERSE_OST_TRACKS).toHaveLength(36);
    const ids = new Set(ALL_36_OMNIVERSE_OST_TRACKS.map((t) => t.id));
    expect(ids.size).toBe(36);
    for (let arc = 1; arc <= 10; arc++) {
      const exploreTrack = getOmniverseOstForAct((arc - 1) * 100 + 25, 'explore');
      const bossTrack = getOmniverseOstForAct(arc * 100, 'boss');
      expect(exploreTrack.arc).toBe(arc);
      expect(bossTrack.arc).toBe(arc);
      expect(exploreTrack.id).not.toBe(bossTrack.id);
    }
  });

  it('15. ALL_10_ARC_BOSS_SPRITES provides 10 bespoke 16x16 matrices sized 48px..88px', () => {
    expect(ALL_10_ARC_BOSS_SPRITES).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      const sp = ALL_10_ARC_BOSS_SPRITES[i];
      expect(sp.arcId).toBe(i + 1);
      expect(sp.widthPx).toBeGreaterThanOrEqual(48);
      expect(sp.widthPx).toBeLessThanOrEqual(88);
      expect(sp.coreMatrix16x16).toHaveLength(16);
      expect(sp.parts.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('16. Every non-sanctuary Act (1..1000) spawns active hazards/traps and a valid 24x14 tile grid', () => {
    for (let i = 0; i < ALL_1000_OMNIVERSE_ACTS.length; i++) {
      const act = ALL_1000_OMNIVERSE_ACTS[i];
      expect(act.tileGrid).toHaveLength(14);
      expect(act.tileGrid[0]).toHaveLength(24);
      if (!act.isSanctuary) {
        expect(act.traps.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
