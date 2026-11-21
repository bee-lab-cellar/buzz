/**
 * File 95 / 100 — Automated Suite 06: Hero Hot-Swap, 3-Condition Portal Lock, Dragon, Kraken, Gear & Bounties (20 Tests).
 */

import { describe, expect, it } from 'vitest';
import {
  createInitialHeroCombatState,
  HERO_ARCHETYPES,
  hotSwapHeroSlot,
  perform3HitArcaneCombo,
  resolveStrikeAgainstCounterStance,
  triggerDodgeRollIFrames,
} from '../engine/heroHotSwapCombat';
import {
  canUnlockExitPortal,
  createKingdomWarState,
  triggerArcCounterAttackWave,
  triggerWarHornRally,
} from '../engine/kingdomWarAndCounterWaves';
import {
  createDragonSkySiegeSession,
  enterDragonSkyFlightMode,
  fireBallistaE,
  strikeDragonAnatomyPart,
} from '../engine/dragonSkySiegeEngine';
import {
  CHARYBDIS_SEVER_SHOCK_RATIO,
  createCharybdis8BossTentacles,
  createReducedHpKrakenSpawn,
  HEALING_FISH_PER_SEVER,
  KRAKEN_HP_REDUCTION_FACTOR,
  KRAKEN_WEAKSPOT_MULTIPLIER,
  resolveKrakenTentacleSlash,
} from '../engine/krakenTentacleEngine';
import {
  ALL_100_GEAR_TIERS,
  computeEffectiveGearStats,
  getWeaponForTier,
  MAX_GEAR_STAR_LEVEL,
} from '../data/gear50TiersTable';
import {
  advanceBountyProgress,
  claimBountyReward,
  computeTotalTitleBonuses,
  createInitialBountyAndAchievementState,
} from '../engine/bountyAndAchievementEngine';

describe('06. Combat, 3-Condition Portal Lock, Dragon, Kraken, Gear & Bounties (20 Tests)', () => {
  it('01. defines all 4 playable hero archetypes with towering 32x32 King Leo', () => {
    expect(HERO_ARCHETYPES.nyx.spriteDimensions).toEqual({ w: 24, h: 24 });
    expect(HERO_ARCHETYPES.king_leo.spriteDimensions).toEqual({ w: 32, h: 32 });
    expect(HERO_ARCHETYPES.fenrir.spriteDimensions).toEqual({ w: 32, h: 32 });
    expect(HERO_ARCHETYPES.great_duck.spriteDimensions).toEqual({ w: 32, h: 32 });
  });

  it('02. hotSwapHeroSlot switches cleanly across [1][2][3][4] unlocked heroes', () => {
    const st = createInitialHeroCombatState(['nyx', 'king_leo', 'fenrir', 'great_duck']);
    expect(hotSwapHeroSlot(st, 2)).toBe('king_leo');
    expect(hotSwapHeroSlot(st, 3)).toBe('fenrir');
    expect(hotSwapHeroSlot(st, 4)).toBe('great_duck');
    expect(hotSwapHeroSlot(st, 1)).toBe('nyx');
  });

  it('03. 3-hit Arcane Combo escalates to Arcane Finisher on hit 3', () => {
    const st = createInitialHeroCombatState();
    const h1 = perform3HitArcaneCombo(st);
    const h2 = perform3HitArcaneCombo(st);
    const h3 = perform3HitArcaneCombo(st);
    expect(h1.comboHitNumber).toBe(1);
    expect(h2.comboHitNumber).toBe(2);
    expect(h3.comboHitNumber).toBe(3);
    expect(h3.isArcaneFinisher).toBe(true);
    expect(h3.rawDamage).toBeGreaterThan(h1.rawDamage);
  });

  it('04. Dodge-Roll grants temporary i-frames and enforces cooldown', () => {
    const st = createInitialHeroCombatState();
    expect(triggerDodgeRollIFrames(st, { x: 1, y: 0 })).toBe(true);
    expect(st.dodgeIFrameSec).toBeGreaterThan(0);
    expect(triggerDodgeRollIFrames(st, { x: 1, y: 0 })).toBe(false);
  });

  it('05. Counter-Stance blocks frontal hits and rewards 2.5x backstab crit from behind', () => {
    const stance = {
      phase: 'active_guard' as const,
      remainingSec: 2.0,
      facingDir: { x: 1, y: 0 },
      backstabMultiplier: 2.5 as const,
    };
    const front = resolveStrikeAgainstCounterStance({ x: 200, y: 100 }, { x: 100, y: 100 }, stance, 100);
    expect(front.outcome).toBe('blocked_front');
    expect(front.finalDamage).toBeLessThan(20);

    const back = resolveStrikeAgainstCounterStance({ x: 40, y: 100 }, { x: 100, y: 100 }, stance, 100);
    expect(back.outcome).toBe('backstab_crit_2_5x');
    expect(back.finalDamage).toBe(250);
  });

  it('06. STRICT PORTAL LOCK: stays locked when normal enemies are still alive', () => {
    const res = canUnlockExitPortal({
      normalEnemiesAlive: 3,
      hasBoss: false,
      bossDefeated: true,
      uncapturedBanners: 0,
    });
    expect(res.unlocked).toBe(false);
    expect(res.lockReason).toContain('3 remaining enemies');
  });

  it('07. STRICT PORTAL LOCK: stays locked when Act Boss is still undefeated', () => {
    const res = canUnlockExitPortal({
      normalEnemiesAlive: 0,
      hasBoss: true,
      bossDefeated: false,
      uncapturedBanners: 0,
    });
    expect(res.unlocked).toBe(false);
    expect(res.lockReason).toContain('Act Boss');
  });

  it('08. STRICT PORTAL LOCK: stays locked when War Banners are uncaptured', () => {
    const res = canUnlockExitPortal({
      normalEnemiesAlive: 0,
      hasBoss: false,
      bossDefeated: true,
      uncapturedBanners: 2,
    });
    expect(res.unlocked).toBe(false);
    expect(res.lockReason).toContain('2 War Banners');
  });

  it('09. STRICT PORTAL LOCK: unlocks ONLY when all 3 conditions pass simultaneously', () => {
    const res = canUnlockExitPortal({
      normalEnemiesAlive: 0,
      hasBoss: true,
      bossDefeated: true,
      uncapturedBanners: 0,
    });
    expect(res.unlocked).toBe(true);
    expect(res.lockReason).toBeNull();
  });

  it('10. Sanctuary acts unlock portal immediately without combat barriers', () => {
    const res = canUnlockExitPortal({
      normalEnemiesAlive: 0,
      hasBoss: false,
      bossDefeated: false,
      uncapturedBanners: 0,
      isSanctuaryAct: true,
    });
    expect(res.unlocked).toBe(true);
  });

  it('11. Kingdom War Horn Rally boosts tug-of-war morale and starts cooldown', () => {
    const war = createKingdomWarState(60);
    expect(triggerWarHornRally(war)).toBe(true);
    expect(war.tugOfWarPct).toBe(62);
    expect(triggerWarHornRally(war)).toBe(false);
  });

  it('12. Counter-Attack Wave spawns exactly 10 enemies with 1 Captain', () => {
    const war = createKingdomWarState(60);
    const wave = triggerArcCounterAttackWave(war, { x: 240, y: 120 });
    expect(wave.length).toBe(10);
    expect(wave.filter((u) => u.isCaptain).length).toBe(1);
  });

  it('13. Dragon Sky-Siege initializes 4 corner Harpoon Ballistas & 4 breakable anatomy parts', () => {
    const dragon = createDragonSkySiegeSession('Ignis-Bahamut', 12000);
    expect(dragon.ballistas.length).toBe(4);
    expect(dragon.anatomy.wings.maxHp).toBeGreaterThan(0);
    expect(dragon.anatomy.severableTail.maxHp).toBeGreaterThan(0);
  });

  it('14. Firing a Harpoon Ballista [E] sky-crashes an airborne Dragon and staggers it', () => {
    const dragon = createDragonSkySiegeSession('Ignis-Bahamut', 12000);
    expect(enterDragonSkyFlightMode(dragon, 9)).toBe(true);
    const res = fireBallistaE(dragon, dragon.ballistas[0].position);
    expect(res.fired).toBe(true);
    expect(res.skyCrashTriggered).toBe(true);
    expect(dragon.isAirborne).toBe(false);
    expect(dragon.groundedStaggerSec).toBeGreaterThan(0);
  });

  it('15. Striking Dragon Head deals 3.0x weak-point multiplier', () => {
    const dragon = createDragonSkySiegeSession('Ignis-Bahamut', 10000);
    const hit = strikeDragonAnatomyPart(dragon, 'head', 100);
    expect(hit.damageDealt).toBe(300);
  });

  it('16. Kraken Spawn cuts tentacle HP by 65% vs legacy baseline', () => {
    expect(KRAKEN_HP_REDUCTION_FACTOR).toBe(0.35);
    const spawn = createReducedHpKrakenSpawn('t1', { x: 120, y: 120 }, 1000);
    expect(spawn.maxHp).toBe(350);
  });

  it('17. Kraken Weak-Spot Cut Ring deals 2.5x SLICE CRIT with ZERO shake on normal hit', () => {
    expect(KRAKEN_WEAKSPOT_MULTIPLIER).toBe(2.5);
    const t = createReducedHpKrakenSpawn('t2', { x: 100, y: 100 }, 1000);
    const hit = resolveKrakenTentacleSlash(t, t.weakSpotCenter, 40);
    expect(hit.hitWeakSpotCrit).toBe(true);
    expect(hit.damageDealt).toBe(100);
    expect(hit.triggerMicroShake).toBe(false);
  });

  it('18. Severing Charybdis Boss Tentacle drops 2 Healing Fish & deals 10% Boss Shock-Stagger', () => {
    expect(HEALING_FISH_PER_SEVER).toBe(2);
    expect(CHARYBDIS_SEVER_SHOCK_RATIO).toBe(0.1);
    const tentacles = createCharybdis8BossTentacles({ x: 240, y: 135 }, 10000);
    expect(tentacles.length).toBe(8);
    const sever = resolveKrakenTentacleSlash(tentacles[0], tentacles[0].weakSpotCenter, 500, 10000);
    expect(sever.severedNow).toBe(true);
    expect(sever.healingFishDropped).toBe(2);
    expect(sever.bossShockStaggerDamage).toBe(1000);
    expect(sever.triggerMicroShake).toBe(true);
  });

  it('19. 50 Gear Tiers (100 Weapons + Armors) scale monotonically up to +25★ Mythic Cap', () => {
    expect(ALL_100_GEAR_TIERS.length).toBe(100);
    expect(MAX_GEAR_STAR_LEVEL).toBe(25);
    const t1 = computeEffectiveGearStats(getWeaponForTier(1), 0, false);
    const t50 = computeEffectiveGearStats(getWeaponForTier(50), 25, true);
    expect(t50.atk).toBeGreaterThan(t1.atk * 20);
  });

  it('20. Bounty Quest Engine tracks progress, claims rewards, and accumulates Achievement Title ATK/DEF bonuses', () => {
    const state = createInitialBountyAndAchievementState();
    advanceBountyProgress(state, 'bounty_01', 25);
    const claim = claimBountyReward(state, 'bounty_01');
    expect(claim.ok).toBe(true);
    expect(claim.goldAwarded).toBeGreaterThan(0);
    expect(claim.unlockedTitle).not.toBeNull();
    const totals = computeTotalTitleBonuses(state.unlockedTitleIds);
    expect(totals.unlockedCount).toBe(1);
    expect(totals.totalAtkPct).toBeGreaterThan(0);
  });
});
