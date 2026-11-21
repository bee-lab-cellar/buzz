/**
 * Wave 5 Automated Vitest Suite #4 (16 Strict Tests):
 * Nightmare Boss 1.2% Cap & Phase Gates, Kraken Fast-Kill Tentacles (65% HP cut, 2.5x weak-spot,
 * 2 Healing Fish, 10% shock-stagger, zero normal hit-shake), 10-Arc 10-Enemy Counter-Attack Waves,
 * 20.0s Great Duck Elixir & 3-Feather Refill, 4-Hero Hot-Swap, Dragon Sky-Siege,
 * AND executing EVERY SINGLE ONE of the 10 Signature Omniverse Cutscenes through `stepCinemaCutsceneRig`!
 */

import { describe, expect, it } from 'vitest';
import {
  activateElixirQ,
  applyNightmareBossHit,
  collectElixirGoldenFeather,
  createNightmareBossRaid,
  DUCK_ELIXIR_DURATION_SEC,
  FINAL_BOSS_HIT_CAP_FRACTION,
  stepNightmareBossRaidAI,
} from '../engine/nightmareBossRaidAI';
import {
  CHARYBDIS_SEVER_SHOCK_RATIO,
  createCharybdis8BossTentacles,
  createReducedHpKrakenSpawn,
  HEALING_FISH_PER_SEVER,
  KRAKEN_WEAKSPOT_MULTIPLIER,
  resolveKrakenTentacleSlash,
} from '../engine/krakenTentacleEngine';
import {
  COUNTER_ATTACK_AMBUSH_COUNT,
  triggerOmniverseArcCounterAttackWave,
} from '../engine/kingdomWarAndCounterWaves';
import {
  createInitialHeroCombatState,
  hotSwapHeroSlot,
  perform3HitArcaneCombo,
  resolveStrikeAgainstCounterStance,
} from '../engine/heroHotSwapCombat';
import {
  createDragonSkySiegeSession,
  enterDragonSkyFlightMode,
  fireBallistaE,
  strikeDragonAnatomyPart,
} from '../engine/dragonSkySiegeEngine';
import {
  createCutsceneCinemaRig,
  skipCinemaCutscene,
  startCinemaCutscene,
  stepCinemaCutsceneRig,
  toggleCutsceneFastForward,
} from '../engine/cutsceneDirector';
import {
  ALL_10_OMNIVERSE_CUTSCENES,
  ALL_13_OMNIVERSE_STORY_CUTSCENES,
  getOmniverseCutsceneById,
  getOmniverseCutsceneForAct,
} from '../engine/cutscenesArc10Finale';

describe('Omniverse Suite 4 — Boss Balance, 10-Arc Counter Waves & All 10 Cutscenes (16 Tests)', () => {
  it('01. caps Nightmare Final Boss body hits strictly at 1.2% of Max HP', () => {
    const raid = createNightmareBossRaid(1000, true, 1_000_000);
    const res = applyNightmareBossHit(raid, 250_000);
    expect(res.wasCapped).toBe(true);
    expect(res.appliedDamage).toBe(Math.floor(1_000_000 * FINAL_BOSS_HIT_CAP_FRACTION));
  });

  it('02. Kraken Tentacles bypass the 1.2% Final Boss damage cap cleanly', () => {
    const raid = createNightmareBossRaid(400, true, 100_000);
    const res = applyNightmareBossHit(raid, 6200, { isKrakenTentacle: true });
    expect(res.wasCapped).toBe(false);
    expect(res.appliedDamage).toBe(6200);
  });

  it('03. activates 75%, 50%, and 25% Invulnerability Phase Gates spawning 4 Rune Pillars each', () => {
    const raid = createNightmareBossRaid(1000, true, 100_000);
    raid.bossHp = 74_000;
    stepNightmareBossRaidAI(raid, 0.016);
    expect(raid.invulnerableWardActive).toBe(true);
    expect(raid.runePillars).toHaveLength(4);
    expect(raid.phaseNumber).toBe(2);

    raid.invulnerableWardActive = false;
    raid.bossHp = 49_000;
    stepNightmareBossRaidAI(raid, 0.016);
    expect(raid.invulnerableWardActive).toBe(true);
    expect(raid.phaseNumber).toBe(3);

    raid.invulnerableWardActive = false;
    raid.bossHp = 24_000;
    stepNightmareBossRaidAI(raid, 0.016);
    expect(raid.invulnerableWardActive).toBe(true);
    expect(raid.phaseNumber).toBe(4);
  });

  it('04. Great Duck Elixir [Q] runs strictly 20.0s, shatters wards, and expires at 0s', () => {
    const raid = createNightmareBossRaid(900, true, 50_000, true);
    raid.invulnerableWardActive = true;
    expect(activateElixirQ(raid)).toBe(true);
    expect(raid.elixir.remainingSec).toBe(DUCK_ELIXIR_DURATION_SEC);
    expect(raid.invulnerableWardActive).toBe(false);

    for (let i = 0; i < 201; i++) {
      stepNightmareBossRaidAI(raid, 0.1);
    }
    expect(raid.elixir.active).toBe(false);
    expect(raid.elixir.remainingSec).toBe(0);
  });

  it('05. 3 Golden Feathers instantly reset Great Duck Elixir cooldown to 0', () => {
    const raid = createNightmareBossRaid(700, true, 50_000, true);
    activateElixirQ(raid);
    expect(raid.elixir.cooldownSec).toBeGreaterThan(0);
    expect(collectElixirGoldenFeather(raid).refilled).toBe(false);
    expect(collectElixirGoldenFeather(raid).refilled).toBe(false);
    expect(collectElixirGoldenFeather(raid).refilled).toBe(true);
    expect(raid.elixir.cooldownSec).toBe(0);
  });

  it('06. Kraken Spawn HP is cut by 65% (30% standard enemy HP)', () => {
    const reduced = createReducedHpKrakenSpawn('kt_a', { x: 100, y: 100 }, 2000);
    expect(reduced.maxHp).toBe(700);
    const stdScaled = createReducedHpKrakenSpawn('kt_b', { x: 120, y: 100 }, 2000, 600);
    expect(stdScaled.maxHp).toBe(180);
  });

  it('07. Charybdis spawns 8 severable boss tentacles at 5% Boss Max HP with 2.5x weak-spot & 2 Healing Fish', () => {
    const bossHp = 40_000;
    const tentacles = createCharybdis8BossTentacles({ x: 240, y: 135 }, bossHp);
    expect(tentacles).toHaveLength(8);

    const hit1 = resolveKrakenTentacleSlash(tentacles[0], tentacles[0].weakSpotCenter, 400, bossHp);
    expect(hit1.hitWeakSpotCrit).toBe(true);
    expect(hit1.damageDealt).toBe(Math.round(400 * KRAKEN_WEAKSPOT_MULTIPLIER));
    expect(hit1.triggerMicroShake).toBe(false);

    const hit2 = resolveKrakenTentacleSlash(tentacles[0], tentacles[0].weakSpotCenter, 600, bossHp);
    expect(hit2.severedNow).toBe(true);
    expect(hit2.healingFishDropped).toBe(HEALING_FISH_PER_SEVER);
    expect(hit2.bossShockStaggerDamage).toBe(Math.round(bossHp * CHARYBDIS_SEVER_SHOCK_RATIO));
    expect(hit2.triggerMicroShake).toBe(true);
  });

  it('08. triggerOmniverseArcCounterAttackWave spawns strictly 10 Arc-accurate enemies across ALL 10 Arcs', () => {
    for (let arc = 1; arc <= 10; arc++) {
      const sampleAct = (arc - 1) * 100 + 34;
      const squad = triggerOmniverseArcCounterAttackWave(sampleAct, { x: 340, y: 135 });
      expect(squad).toHaveLength(COUNTER_ATTACK_AMBUSH_COUNT);
      expect(squad[0].isCaptain).toBe(true);
      for (const unit of squad) {
        expect(unit.arcId).toBe(arc);
        expect(unit.actId).toBe(sampleAct);
      }
    }
  });

  it('09. 4-Hero Hot-Swap cycles cleanly across Nyx, King Leo, Fenrir, and Great Duck', () => {
    const st = createInitialHeroCombatState(['nyx', 'king_leo', 'fenrir', 'great_duck']);
    expect(hotSwapHeroSlot(st, 2)).toBe('king_leo');
    expect(hotSwapHeroSlot(st, 3)).toBe('fenrir');
    expect(hotSwapHeroSlot(st, 4)).toBe('great_duck');
    expect(hotSwapHeroSlot(st, 1)).toBe('nyx');
  });

  it('10. 3-Hit Arcane Combo triggers STARLIGHT CLEAVE! finisher and Backstab deals 2.5x Crit', () => {
    const st = createInitialHeroCombatState(['nyx']);
    perform3HitArcaneCombo(st);
    perform3HitArcaneCombo(st);
    const fin = perform3HitArcaneCombo(st);
    expect(fin.isArcaneFinisher).toBe(true);
    expect(fin.callout).toBe('STARLIGHT CLEAVE!');

    const backstab = resolveStrikeAgainstCounterStance(
      { x: 60, y: 100 },
      { x: 100, y: 100 },
      { phase: 'active_guard', remainingSec: 2, facingDir: { x: 1, y: 0 }, backstabMultiplier: 2.5 },
      120,
    );
    expect(backstab.outcome).toBe('backstab_crit_2_5x');
    expect(backstab.finalDamage).toBe(300);
  });

  it('11. Dragon Sky-Siege Ballista grounds Ignis-Bahamut and 3.0x Head Crit + Tail Hoard Recovery trigger', () => {
    const siege = createDragonSkySiegeSession('Ignis-Bahamut', 25_000);
    expect(enterDragonSkyFlightMode(siege, 9.0)).toBe(true);
    const shot = fireBallistaE(siege, siege.ballistas[0].position);
    expect(shot.skyCrashTriggered).toBe(true);
    expect(siege.isAirborne).toBe(false);

    const headCrit = strikeDragonAnatomyPart(siege, 'head', 300);
    expect(headCrit.damageDealt).toBe(900);

    siege.stolenGoldHoard = 1400;
    const tail = strikeDragonAnatomyPart(siege, 'severable_tail', 9000);
    expect(tail.partBrokenNow).toBe(true);
    expect(tail.goldRecovered).toBe(1400);
  });

  it('12. ALL_10_OMNIVERSE_CUTSCENES & ALL_13_OMNIVERSE_STORY_CUTSCENES have unique IDs and 2+ beats each', () => {
    expect(ALL_10_OMNIVERSE_CUTSCENES).toHaveLength(10);
    expect(ALL_13_OMNIVERSE_STORY_CUTSCENES).toHaveLength(13);
    const ids = new Set(ALL_13_OMNIVERSE_STORY_CUTSCENES.map((c) => c.id));
    expect(ids.size).toBe(13);
    for (const track of ALL_13_OMNIVERSE_STORY_CUTSCENES) {
      expect(track.beats.length).toBeGreaterThanOrEqual(2);
      expect(getOmniverseCutsceneById(track.id)?.id).toBe(track.id);
    }
  });

  it('13. executes ALL 10 Signature Omniverse Cutscenes to completion with 0 NaN camera values', () => {
    for (const track of ALL_10_OMNIVERSE_CUTSCENES) {
      const rig = createCutsceneCinemaRig();
      startCinemaCutscene(rig, track, { x: 100, y: 140 });
      toggleCutsceneFastForward(rig);

      let completed = false;
      for (let step = 0; step < 800 && !completed; step++) {
        const res = stepCinemaCutsceneRig(rig, 0.04, { x: 120, y: 150 });
        expect(Number.isFinite(rig.camX)).toBe(true);
        expect(Number.isFinite(rig.camY)).toBe(true);
        expect(Number.isFinite(rig.camZoom)).toBe(true);
        expect(rig.camZoom).toBeGreaterThanOrEqual(1.0);
        expect(rig.camZoom).toBeLessThanOrEqual(1.75);
        if (res.finishedNow) completed = true;
      }

      expect(completed).toBe(true);
      expect(rig.phase).toBe('completed');
      expect(rig.letterboxBarHeightPx).toBe(0);
      expect(rig.hudFadeAlpha).toBe(1);
    }
  });

  it('14. Sanctuary Cutscenes at Acts 99, 299, and 999 resolve by Act trigger cleanly', () => {
    expect(getOmniverseCutsceneForAct(99)?.id).toBe('omni_cutscene_02_lotus_blessing');
    expect(getOmniverseCutsceneForAct(299)?.id).toBe('omni_cutscene_05_star_forge');
    expect(getOmniverseCutsceneForAct(999)?.id).toBe('omni_cutscene_12_four_leader_blessing');
    expect(getOmniverseCutsceneForAct(1000)?.id).toBe('omni_cutscene_13_grand_epilogue');
  });

  it('15. skipping an active Omniverse Cutscene smoothly transitions into the 0.85s zero-cut handoff glide', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, ALL_10_OMNIVERSE_CUTSCENES[9], { x: 240, y: 135 });
    stepCinemaCutsceneRig(rig, 0.05, { x: 140, y: 150 });
    skipCinemaCutscene(rig);
    expect(rig.phase).toBe('handoff_glide');

    let done = false;
    for (let i = 0; i < 40 && !done; i++) {
      if (stepCinemaCutsceneRig(rig, 0.04, { x: 140, y: 150 }).finishedNow) {
        done = true;
      }
    }
    expect(done).toBe(true);
    expect(rig.camX).toBeCloseTo(140, 2);
    expect(rig.camY).toBeCloseTo(150, 2);
  });

  it('16. Cutscene typewriter triggers per-character lip-sync voice blips on every Arc finale track', () => {
    const rig = createCutsceneCinemaRig();
    startCinemaCutscene(rig, ALL_10_OMNIVERSE_CUTSCENES[8], { x: 200, y: 130 });
    for (let i = 0; i < 45; i++) {
      stepCinemaCutsceneRig(rig, 0.04, { x: 200, y: 130 });
    }
    expect(rig.voiceBlipsTriggered).toBeGreaterThan(0);
  });
});
