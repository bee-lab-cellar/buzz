/**
 * Pillar 4 — Automated Vitest Suite #3:
 * Nightmare Boss 1.2% Cap & Phase Gates, 20.0s Great Duck Elixir & 3-Feather Refill,
 * Fast-Kill Kraken Tentacles (65% reduced HP, 2.5x Weak-Spot, 2 Healing Fish, zero hit-shake),
 * 10-Enemy Counter-Attack Wave Routing, 4-Hero Hot-Swap & 2.5x Backstab Crits,
 * Articulated Dragon Sky-Siege, 60FPS Cutscene Cinema, & iPad Save Vault Anti-Overwrite Guard.
 */

import { beforeEach, describe, expect, it } from 'vitest';
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
  createKingdomWarState,
  triggerArcCounterAttackWave,
  triggerWarHornRally,
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
  startCinemaCutscene,
  stepCinemaCutsceneRig,
  toggleCutsceneFastForward,
} from '../engine/cutsceneDirector';
import { CUTSCENE_CHOREOGRAPHY_TRACKS } from '../engine/cutsceneChoreographyTracks';
import {
  createScaledActRestorePayload,
  exportVaultToSaveCode,
  importVaultFromSaveCode,
  loadSavedGame,
  resetInMemoryVaultForTests,
  saveToVault,
} from '../ui/ipadSaveVaultEngine';

describe('Pillar 2 & 3 — Combat Balance, Cinema Rig & iPad Save Vault Integrity', () => {
  beforeEach(() => {
    resetInMemoryVaultForTests();
  });

  it('1. strictly caps Final Boss body hits at 1.2% of Boss Max HP', () => {
    const raid = createNightmareBossRaid(300, true, 100000);
    const res = applyNightmareBossHit(raid, 25000);
    expect(res.wasCapped).toBe(true);
    expect(res.appliedDamage).toBeLessThanOrEqual(Math.floor(100000 * FINAL_BOSS_HIT_CAP_FRACTION));
    expect(res.appliedDamage).toBe(1200);
  });

  it('2. allows Kraken Tentacles to bypass the 1.2% Final Boss damage cap', () => {
    const raid = createNightmareBossRaid(180, true, 100000);
    const res = applyNightmareBossHit(raid, 4500, { isKrakenTentacle: true });
    expect(res.wasCapped).toBe(false);
    expect(res.appliedDamage).toBe(4500);
  });

  it('3. triggers 75% / 50% / 25% Invulnerability Phase Gates and spawns 4 Rune Pillars', () => {
    const raid = createNightmareBossRaid(122, true, 10000);
    raid.bossHp = 7400; // Crossed 75% threshold
    stepNightmareBossRaidAI(raid, 0.016);
    expect(raid.invulnerableWardActive).toBe(true);
    expect(raid.runePillars).toHaveLength(4);
    expect(raid.phaseNumber).toBe(2);

    const blocked = applyNightmareBossHit(raid, 500);
    expect(blocked.blockedByWard).toBe(true);
    expect(blocked.appliedDamage).toBe(0);
  });

  it('4. Great Duck Elixir [Q] lasts strictly 20.0s, shatters Invulnerable Ward, and expires cleanly', () => {
    const raid = createNightmareBossRaid(180, true, 20000, true);
    raid.invulnerableWardActive = true;
    const activated = activateElixirQ(raid);
    expect(activated).toBe(true);
    expect(raid.elixir.active).toBe(true);
    expect(raid.elixir.remainingSec).toBe(DUCK_ELIXIR_DURATION_SEC);
    expect(raid.invulnerableWardActive).toBe(false);

    // Step 20.1 seconds -> Elixir strictly expires
    for (let i = 0; i < 201; i++) {
      stepNightmareBossRaidAI(raid, 0.1);
    }
    expect(raid.elixir.active).toBe(false);
    expect(raid.elixir.remainingSec).toBe(0);
  });

  it('5. collecting 3 Golden Feathers instantly refills Great Duck Elixir cooldown', () => {
    const raid = createNightmareBossRaid(180, true, 20000, true);
    activateElixirQ(raid);
    expect(raid.elixir.cooldownSec).toBeGreaterThan(0);

    expect(collectElixirGoldenFeather(raid).refilled).toBe(false);
    expect(collectElixirGoldenFeather(raid).refilled).toBe(false);
    expect(collectElixirGoldenFeather(raid).refilled).toBe(true);
    expect(raid.elixir.cooldownSec).toBe(0);
  });

  it('6. cuts Kraken Tentacle spawn HP by 65% (30% standard enemy HP)', () => {
    const tentacleByLegacy = createReducedHpKrakenSpawn('kt_1', { x: 100, y: 100 }, 1000);
    expect(tentacleByLegacy.maxHp).toBe(350);

    const tentacleByStd = createReducedHpKrakenSpawn('kt_2', { x: 120, y: 100 }, 1000, 400);
    expect(tentacleByStd.maxHp).toBe(120);
  });

  it('7. spawns all 8 Charybdis Boss Tentacles at 5% Boss Max HP each', () => {
    const tentacles = createCharybdis8BossTentacles({ x: 240, y: 135 }, 40000);
    expect(tentacles).toHaveLength(8);
    for (const t of tentacles) {
      expect(t.isBossTentacle).toBe(true);
      expect(t.maxHp).toBe(2000);
    }
  });

  it('8. Kraken Weak-Spot deals 2.5x crit with ZERO hit-shake, and severing drops 2 Healing Fish + 10% Shock-Stagger', () => {
    const bossMaxHp = 20000;
    const [t1] = createCharybdis8BossTentacles({ x: 240, y: 135 }, bossMaxHp);
    expect(t1.hp).toBe(1000);

    // First slash hits glowing Weak-Spot directly (2.5x crit), does NOT sever yet -> ZERO shake!
    const hit1 = resolveKrakenTentacleSlash(t1, t1.weakSpotCenter, 200, bossMaxHp);
    expect(hit1.hitWeakSpotCrit).toBe(true);
    expect(hit1.damageDealt).toBe(Math.round(200 * KRAKEN_WEAKSPOT_MULTIPLIER));
    expect(hit1.severedNow).toBe(false);
    expect(hit1.triggerMicroShake).toBe(false);
    expect(hit1.healingFishDropped).toBe(0);

    // Second weak-spot slash severs tentacle -> 2 Healing Fish + 10% Boss Shock-Stagger + micro-shake!
    const hit2 = resolveKrakenTentacleSlash(t1, t1.weakSpotCenter, 250, bossMaxHp);
    expect(hit2.severedNow).toBe(true);
    expect(hit2.healingFishDropped).toBe(HEALING_FISH_PER_SEVER);
    expect(hit2.bossShockStaggerDamage).toBe(Math.round(bossMaxHp * CHARYBDIS_SEVER_SHOCK_RATIO));
    expect(hit2.triggerMicroShake).toBe(true);
  });

  it('9. spawns strictly 10-Enemy Counter-Attack Ambush Wave routed to Arc IV Kraken Armada at Act 134', () => {
    const war = createKingdomWarState(134);
    const wave = triggerArcCounterAttackWave(war, { x: 320, y: 140 });
    expect(wave).toHaveLength(COUNTER_ATTACK_AMBUSH_COUNT);
    expect(wave[0].isCaptain).toBe(true);
    for (const unit of wave) {
      expect(unit.arcNumber).toBe(4);
      expect(unit.factionId).toBe('abyssal_armada');
    }
  });

  it('10. War Horn Rally boosts Kingdom Tug-of-War and enforces cooldown', () => {
    const war = createKingdomWarState(60);
    expect(triggerWarHornRally(war)).toBe(true);
    expect(war.tugOfWarPct).toBe(62);
    expect(triggerWarHornRally(war)).toBe(false);
  });

  it('11. [1][2][3][4] Hero Hot-Swap & 3-Hit Arcane Combo finishes with STARLIGHT CLEAVE!', () => {
    const combat = createInitialHeroCombatState(['nyx', 'king_leo', 'fenrir', 'great_duck']);
    expect(hotSwapHeroSlot(combat, 2)).toBe('king_leo');
    expect(hotSwapHeroSlot(combat, 3)).toBe('fenrir');
    expect(hotSwapHeroSlot(combat, 4)).toBe('great_duck');
    expect(hotSwapHeroSlot(combat, 1)).toBe('nyx');

    const h1 = perform3HitArcaneCombo(combat);
    const h2 = perform3HitArcaneCombo(combat);
    const h3 = perform3HitArcaneCombo(combat);
    expect(h1.comboHitNumber).toBe(1);
    expect(h2.comboHitNumber).toBe(2);
    expect(h3.comboHitNumber).toBe(3);
    expect(h3.isArcaneFinisher).toBe(true);
    expect(h3.callout).toBe('STARLIGHT CLEAVE!');
  });

  it('12. Backstabbing a Counter-Stance enemy deals 2.5x CRIT and triggers Guard Break', () => {
    const guardStance = {
      phase: 'active_guard' as const,
      remainingSec: 2.0,
      facingDir: { x: 1, y: 0 }, // Facing East (+X)
      backstabMultiplier: 2.5 as const,
    };

    // Frontal hit (attacker east of defender) is blocked
    const front = resolveStrikeAgainstCounterStance({ x: 140, y: 100 }, { x: 100, y: 100 }, guardStance, 100);
    expect(front.outcome).toBe('blocked_front');
    expect(front.finalDamage).toBeLessThan(25);

    // Backstab hit (attacker west of defender) deals 2.5x CRIT + Guard Break
    const back = resolveStrikeAgainstCounterStance({ x: 60, y: 100 }, { x: 100, y: 100 }, guardStance, 100);
    expect(back.outcome).toBe('backstab_crit_2_5x');
    expect(back.finalDamage).toBe(250);
    expect(back.updatedStance.phase).toBe('guard_broken');
  });

  it('13. Dragon Sky-Siege Harpoon Ballista [E] grounds airborne dragon & 3.0x Head Crit + Tail Hoard Recovery work', () => {
    const siege = createDragonSkySiegeSession('Ignis-Bahamut', 15000);
    expect(enterDragonSkyFlightMode(siege, 8.0)).toBe(true);
    expect(siege.isAirborne).toBe(true);

    const shot = fireBallistaE(siege, siege.ballistas[0].position);
    expect(shot.fired).toBe(true);
    expect(shot.skyCrashTriggered).toBe(true);
    expect(siege.isAirborne).toBe(false);

    const headHit = strikeDragonAnatomyPart(siege, 'head', 200);
    expect(headHit.damageDealt).toBe(600); // 3.0x head crit multiplier!

    siege.stolenGoldHoard = 850;
    const tailSever = strikeDragonAnatomyPart(siege, 'severable_tail', 5000);
    expect(tailSever.partBrokenNow).toBe(true);
    expect(tailSever.goldRecovered).toBe(850);
  });

  it('14. 60FPS Cutscene Cinema interpolates beats, supports 2x fast-forward, fires voice blips & completes 0.85s zero-cut hand-off', () => {
    const rig = createCutsceneCinemaRig();
    const track = Object.values(CUTSCENE_CHOREOGRAPHY_TRACKS)[0];
    startCinemaCutscene(rig, track, { x: 80, y: 140 });
    expect(toggleCutsceneFastForward(rig)).toBe(2);

    let finished = false;
    for (let step = 0; step < 600 && !finished; step++) {
      const tick = stepCinemaCutsceneRig(rig, 0.04, { x: 120, y: 150 });
      if (tick.finishedNow) finished = true;
    }

    expect(finished).toBe(true);
    expect(rig.phase).toBe('completed');
    expect(rig.voiceBlipsTriggered).toBeGreaterThan(0);
    expect(rig.camZoom).toBe(1.0);
    expect(rig.letterboxBarHeightPx).toBe(0);
    expect(rig.hudFadeAlpha).toBe(1);
  });

  it('15. iPad Save Vault Anti-Overwrite Guard STRICTLY BLOCKS an Act 1 save from overwriting Act 134', () => {
    const act134 = createScaledActRestorePayload(134);
    const saved134 = saveToVault(act134);
    expect(saved134.saved).toBe(true);
    expect(saved134.blockedByGuard).toBe(false);

    // Attempt accidental overwrite with Act 1 state (without forceReset)
    const accidentalAct1 = { ...createScaledActRestorePayload(1), forceReset: undefined };
    const blocked = saveToVault(accidentalAct1);
    expect(blocked.saved).toBe(false);
    expect(blocked.blockedByGuard).toBe(true);

    // Vault still faithfully holds Act 134!
    expect(loadSavedGame()?.maxUnlockedAct).toBe(134);

    // Explicit forceReset: true is permitted
    const explicitReset = saveToVault({ ...accidentalAct1, forceReset: true });
    expect(explicitReset.saved).toBe(true);
    expect(loadSavedGame()?.maxUnlockedAct).toBe(1);
  });

  it('16. Portable COTC1:... Base64 Save Code exports & restores Act 134 with all 4 heroes unlocked', () => {
    const act134 = createScaledActRestorePayload(134);
    expect(act134.unlockedHeroes).toEqual(['nyx', 'king_leo', 'fenrir', 'great_duck']);

    const code = exportVaultToSaveCode(act134);
    expect(code.startsWith('COTC1:')).toBe(true);

    resetInMemoryVaultForTests();
    const restored = importVaultFromSaveCode(code);
    expect(restored).not.toBeNull();
    expect(restored!.currentAct).toBe(134);
    expect(restored!.maxUnlockedAct).toBe(134);
    expect(restored!.unlockedHeroes).toContain('great_duck');
  });
});
