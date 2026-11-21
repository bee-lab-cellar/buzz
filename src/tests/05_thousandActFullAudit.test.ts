/**
 * File 94 / 100 — Automated Suite 05: Full 1,000-Act, 10-Arc, 100-Boss, 10-Sanctuary & Open-Face Cat Audit (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  ALL_1000_OMNIVERSE_ACTS,
  getOmniverseActBlueprint,
  getOmniverseArcConfig,
  OMNIVERSE_ARC_CONFIGS,
} from '../data/arc10_acts901to1000';
import { BOSSES_ARC_1_TO_5 } from '../data/bossesArc1to5Registry';
import { ALL_100_BOSS_MANIFEST, BOSSES_ARC_6_TO_10 } from '../data/bossesArc6to10Registry';
import {
  ALL_10_SANCTUARY_ACTS,
  getSanctuaryDialogueAndTheme,
  resolveDynamicSanctuaryPortalDestination,
} from '../data/sanctuaryDialogues10';
import {
  ALL_6_CAT_COATS,
  auditOpenFaceCatHeadgear,
  buildAlliedCatSprite,
} from '../sprites/alliedCatArmyMatrices';
import { NYX_IDLE_MATRIX_24X24 } from '../sprites/heroNyxMatrix';
import { KING_LEO_IDLE_MATRIX_32X32 } from '../sprites/heroKingLeoMatrix';
import { BOSS_SPRITES_ARC_1_TO_5 } from '../sprites/bossesArc1to5Matrices';
import { BOSS_SPRITES_ARC_6_TO_10 } from '../sprites/bossesArc6to10Matrices';
import { auditArenaCleanliness } from '../sprites/cleanBiomeAndLandmarkTileset';
import { BIOME_TRAP_CATALOG_55 } from '../data/biomeTrapCatalog55';
import { triggerOmniverseArcCounterAttackWave } from '../engine/kingdomWarAndCounterWaves';

describe('05. 1,000-Act Full Audit, 10 Sanctuaries, 100 Bosses & Open-Face Cats (20 Tests)', () => {
  it('01. contains exactly 1,000 contiguous Act blueprints from Act 1 to Act 1,000', () => {
    expect(ALL_1000_OMNIVERSE_ACTS.length).toBe(1000);
    expect(ALL_1000_OMNIVERSE_ACTS[0].actId).toBe(1);
    expect(ALL_1000_OMNIVERSE_ACTS[999].actId).toBe(1000);
  });

  it('02. every Act 1..1000 maps to its exact ArcId (1..10) with zero fallthrough bugs', () => {
    for (let act = 1; act <= 1000; act++) {
      const expectedArc = Math.floor((act - 1) / 100) + 1;
      expect(getOmniverseArcConfig(act).arcId).toBe(expectedArc);
      expect(getOmniverseActBlueprint(act).arcId).toBe(expectedArc);
    }
  });

  it('03. Arc 4 (Acts 301..400) underwater counter-attack waves NEVER spawn land Dragons', () => {
    const wave = triggerOmniverseArcCounterAttackWave(350);
    expect(wave.length).toBe(10);
    for (const unit of wave) {
      expect(unit.arcId).toBe(4);
      expect(unit.enemyKind.toLowerCase()).not.toContain('dragon');
    }
  });

  it('04. exactly 100 unique Boss specs exist across Arcs 1–10 (50 + 50)', () => {
    expect(BOSSES_ARC_1_TO_5.length).toBe(50);
    expect(BOSSES_ARC_6_TO_10.length).toBe(50);
    expect(ALL_100_BOSS_MANIFEST.length).toBe(100);
  });

  it('05. ZERO emoji bosses (👹) appear in any of the 100 Boss names or titles', () => {
    for (const boss of ALL_100_BOSS_MANIFEST) {
      expect(boss.name).not.toContain('👹');
      expect(boss.title).not.toContain('👹');
      expect(boss.spriteMatrixId.length).toBeGreaterThan(2);
    }
  });

  it('06. explicit switch handles all 10 Sanctuaries (99, 199, ..., 999) with unique 3-line dialogues', () => {
    expect(ALL_10_SANCTUARY_ACTS.length).toBe(10);
    const seenDialogues = new Set<string>();
    for (const actId of ALL_10_SANCTUARY_ACTS) {
      const s = getSanctuaryDialogueAndTheme(actId);
      expect(s).not.toBeNull();
      expect(s!.lines.length).toBe(3);
      seenDialogues.add(s!.lines[0]);
    }
    expect(seenDialogues.size).toBe(10);
  });

  it('07. EVERY Sanctuary exit portal dynamically warps to currentAct + 1 (NEVER hardcoded Act 41)', () => {
    for (const actId of ALL_10_SANCTUARY_ACTS) {
      const dest = resolveDynamicSanctuaryPortalDestination(actId);
      expect(dest).toBe(actId + 1);
      expect(dest).not.toBe(41);
    }
  });

  it('08. EVERY Sanctuary uses dark royal cosmic/stone border palette (NO blinding neon-yellow)', () => {
    for (const actId of ALL_10_SANCTUARY_ACTS) {
      const s = getSanctuaryDialogueAndTheme(actId)!;
      expect(s.borderStoneHex.toLowerCase()).not.toBe('#ffff00');
      expect(s.borderStoneHex.toLowerCase()).not.toBe('#facc15');
      expect(s.floorBaseHex.toLowerCase()).not.toBe('#00ffff');
    }
  });

  it('09. non-Sanctuary acts return null from getSanctuaryDialogueAndTheme', () => {
    expect(getSanctuaryDialogueAndTheme(1)).toBeNull();
    expect(getSanctuaryDialogueAndTheme(41)).toBeNull();
    expect(getSanctuaryDialogueAndTheme(500)).toBeNull();
  });

  it('10. Allied Cat Knight passes strict Open-Face Headgear Audit (y=1..4 only, pink #ff8fab nose visible)', () => {
    const knight = buildAlliedCatSprite('ginger_tabby', 'cat_knight');
    const audit = auditOpenFaceCatHeadgear(knight);
    expect(audit.passed).toBe(true);
    expect(audit.violationReason).toBeNull();
  });

  it('11. Blacksmith Forgepaw passes strict Open-Face Headgear Audit (red headband y=1..4 only)', () => {
    const smith = buildAlliedCatSprite('tuxedo', 'blacksmith_cat');
    const audit = auditOpenFaceCatHeadgear(smith);
    expect(audit.passed).toBe(true);
    expect(audit.violationReason).toBeNull();
  });

  it('12. All 6 distinct Allied Cat Coat Breeds pass open-face audit with pink #ff8fab noses', () => {
    expect(ALL_6_CAT_COATS.length).toBe(6);
    for (const coat of ALL_6_CAT_COATS) {
      const spec = buildAlliedCatSprite(coat, 'cat_knight');
      expect(spec.palette.p?.toLowerCase()).toBe('#ff8fab');
      expect(auditOpenFaceCatHeadgear(spec).passed).toBe(true);
    }
  });

  it('13. Nyx sprite matrix keeps her Crooked Starry Wizard Hat ON (hat pixels present in top rows)', () => {
    const topRows = NYX_IDLE_MATRIX_24X24.slice(0, 6).join('');
    expect(topRows).toMatch(/[HGSW]/);
  });

  it('14. King Leo sprite matrix is a towering 32x32 Majestic Golden Lion', () => {
    expect(KING_LEO_IDLE_MATRIX_32X32.length).toBe(32);
    expect(KING_LEO_IDLE_MATRIX_32X32[0].length).toBe(32);
  });

  it('15. All 10 Arc Finale Bosses have real pixel-art matrices (48x48 to 88x88 equivalent grid)', () => {
    const allBossSprites = [...BOSS_SPRITES_ARC_1_TO_5, ...BOSS_SPRITES_ARC_6_TO_10];
    expect(allBossSprites.length).toBe(10);
    for (const m of allBossSprites) {
      expect(m.widthPx).toBeGreaterThanOrEqual(48);
      expect(m.heightPx).toBeGreaterThanOrEqual(48);
      expect(m.coreMatrix16x16.length).toBeGreaterThanOrEqual(16);
    }
  });

  it('16. All 1,000 Acts cap environmental traps at max 4 per Act (clean 16-bit arenas)', () => {
    for (const act of ALL_1000_OMNIVERSE_ACTS) {
      expect(act.traps.length).toBeLessThanOrEqual(4);
    }
  });

  it('17. All 1,000 Acts place hero spawn and blacksmith safely inside arena bounds', () => {
    for (const act of ALL_1000_OMNIVERSE_ACTS) {
      expect(act.heroSpawnCol).toBeGreaterThanOrEqual(1);
      expect(act.heroSpawnCol).toBeLessThanOrEqual(22);
      expect(act.blacksmithCol).toBeGreaterThanOrEqual(1);
      expect(act.blacksmithCol).toBeLessThanOrEqual(22);
    }
  });

  it('18. All 10 Arc Biome Palettes & Arenas pass cleanliness audit (zero neon-yellow or CUT LOG clutter)', () => {
    for (let arc = 1; arc <= 10; arc++) {
      const cfg = OMNIVERSE_ARC_CONFIGS[arc as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10];
      expect(cfg.palette.cliffHex.toLowerCase()).not.toBe('#ffff00');
      const report = auditArenaCleanliness(getOmniverseActBlueprint((arc - 1) * 100 + 5));
      expect(report.passed).toBe(true);
    }
  });

  it('19. Biome Trap Catalog contains all 55 distinct tactical biome hazards', () => {
    expect(BIOME_TRAP_CATALOG_55.length).toBe(55);
  });

  it('20. Every 10th Act (10, 20, ..., 1000) is flagged as a Regional or Arc Final Boss Act', () => {
    let bossActs = 0;
    for (const act of ALL_1000_OMNIVERSE_ACTS) {
      if (act.actId % 10 === 0) {
        expect(act.isRegionalBoss || act.isArcFinalBoss).toBe(true);
        bossActs += 1;
      }
    }
    expect(bossActs).toBe(100);
  });
});
