/**
 * Pillar 2 — Nightmare Boss Raid AI & Timed 20.0s Great Duck's Elixir Loop
 *
 * Enforces:
 * - Strict `1.2% Max HP` per-hit cap on Final Bosses (bypassed on Kraken Tentacles!)
 * - 75% / 50% / 25% HP Invulnerability Phase Gates with 4 Rune Pillars
 * - Siphon Obelisks & Shrinking Arena Border
 * - 20.0s Timed Great Duck's Elixir (`[Q]`) + 3 Golden Feathers Instant Refill Loop
 */

import type { ElixirTimerState } from '../types/combat';
import type { Vec2 } from '../types/math';

export const FINAL_BOSS_HIT_CAP_FRACTION = 0.012;
export const DUCK_ELIXIR_DURATION_SEC = 20.0 as const;

export interface RaidRunePillar {
  readonly id: string;
  readonly position: Vec2;
  hp: number;
  maxHp: number;
  destroyed: boolean;
}

export interface RaidSiphonObelisk {
  readonly id: string;
  readonly position: Vec2;
  hp: number;
  maxHp: number;
  healPerSec: number;
}

export interface NightmareBossRaidState {
  readonly actId: number;
  readonly isFinalBoss: boolean;
  bossMaxHp: number;
  bossHp: number;
  phaseNumber: 1 | 2 | 3 | 4;
  triggeredGates: number[];
  invulnerableWardActive: boolean;
  arenaShrinkMarginPx: number;
  runePillars: RaidRunePillar[];
  siphonObelisks: RaidSiphonObelisk[];
  elixir: ElixirTimerState;
}

export function createElixirTimerState(unlocked = true): ElixirTimerState {
  return {
    unlocked,
    active: false,
    remainingSec: 0,
    maxDurationSec: DUCK_ELIXIR_DURATION_SEC,
    cooldownSec: 0,
    maxCooldownSec: 32.0,
    feathersCollected: 0,
    feathersRequiredForRefill: 3,
    damageMultiplier: 2.35,
    shattersInvulnShield: true,
  };
}

export function createNightmareBossRaid(
  actId: number,
  isFinalBoss: boolean,
  bossMaxHp: number,
  elixirUnlocked = true,
): NightmareBossRaidState {
  return {
    actId,
    isFinalBoss,
    bossMaxHp,
    bossHp: bossMaxHp,
    phaseNumber: 1,
    triggeredGates: [],
    invulnerableWardActive: false,
    arenaShrinkMarginPx: 0,
    runePillars: [],
    siphonObelisks: [],
    elixir: createElixirTimerState(elixirUnlocked),
  };
}

/**
 * Applies a hit to a Nightmare Raid Boss, strictly enforcing the 1.2% Max HP per-hit cap
 * on Final Bosses while allowing Kraken Tentacles to bypass the cap.
 */
export function applyNightmareBossHit(
  raid: NightmareBossRaidState,
  rawDamage: number,
  options: { readonly isKrakenTentacle?: boolean } = {},
): { readonly appliedDamage: number; readonly wasCapped: boolean; readonly blockedByWard: boolean } {
  const isTentacle = Boolean(options.isKrakenTentacle);
  if (raid.invulnerableWardActive && !isTentacle && !raid.elixir.active) {
    return { appliedDamage: 0, wasCapped: false, blockedByWard: true };
  }

  let dmg = raid.elixir.active ? rawDamage * raid.elixir.damageMultiplier : rawDamage;
  let wasCapped = false;

  if (raid.isFinalBoss && !isTentacle) {
    const maxAllowed = Math.max(1, Math.floor(raid.bossMaxHp * FINAL_BOSS_HIT_CAP_FRACTION));
    if (dmg > maxAllowed) {
      dmg = maxAllowed;
      wasCapped = true;
    }
  }

  const appliedDamage = Math.max(1, Math.round(dmg));
  raid.bossHp = Math.max(0, raid.bossHp - appliedDamage);
  return { appliedDamage, wasCapped, blockedByWard: false };
}

export function activateElixirQ(raid: NightmareBossRaidState): boolean {
  if (!raid.elixir.unlocked || raid.elixir.active || raid.elixir.cooldownSec > 0) {
    return false;
  }
  raid.elixir.active = true;
  raid.elixir.remainingSec = raid.elixir.maxDurationSec;
  raid.elixir.cooldownSec = raid.elixir.maxCooldownSec;

  if (raid.elixir.shattersInvulnShield && raid.invulnerableWardActive) {
    raid.invulnerableWardActive = false;
    for (let i = 0; i < raid.runePillars.length; i++) {
      raid.runePillars[i].destroyed = true;
      raid.runePillars[i].hp = 0;
    }
  }
  return true;
}

export function collectElixirGoldenFeather(raid: NightmareBossRaidState): { readonly refilled: boolean } {
  raid.elixir.feathersCollected += 1;
  if (raid.elixir.feathersCollected >= raid.elixir.feathersRequiredForRefill) {
    raid.elixir.feathersCollected = 0;
    raid.elixir.cooldownSec = 0;
    if (raid.elixir.active) {
      raid.elixir.remainingSec = raid.elixir.maxDurationSec;
    }
    return { refilled: true };
  }
  return { refilled: false };
}

export function stepNightmareBossRaidAI(
  raid: NightmareBossRaidState,
  dt: number,
  arenaCenter: Vec2 = { x: 240, y: 135 },
): { readonly newlyTriggeredGatePct: number | null } {
  if (raid.elixir.active) {
    raid.elixir.remainingSec = Math.max(0, raid.elixir.remainingSec - dt);
    if (raid.elixir.remainingSec <= 0) {
      raid.elixir.active = false;
    }
  } else if (raid.elixir.cooldownSec > 0) {
    raid.elixir.cooldownSec = Math.max(0, raid.elixir.cooldownSec - dt);
  }

  for (let i = 0; i < raid.siphonObelisks.length; i++) {
    const ob = raid.siphonObelisks[i];
    if (ob.hp > 0) {
      raid.bossHp = Math.min(raid.bossMaxHp, raid.bossHp + ob.healPerSec * dt);
    }
  }

  if (raid.invulnerableWardActive && raid.runePillars.length > 0) {
    if (raid.runePillars.every((p) => p.destroyed || p.hp <= 0)) {
      raid.invulnerableWardActive = false;
    }
  }

  const ratio = raid.bossMaxHp > 0 ? raid.bossHp / raid.bossMaxHp : 0;
  const gates: ReadonlyArray<number> = [75, 50, 25];
  let newlyTriggeredGatePct: number | null = null;

  for (let i = 0; i < gates.length; i++) {
    const pct = gates[i];
    if (ratio * 100 <= pct && !raid.triggeredGates.includes(pct)) {
      raid.triggeredGates.push(pct);
      raid.phaseNumber = (i + 2) as 2 | 3 | 4;
      raid.invulnerableWardActive = true;
      raid.arenaShrinkMarginPx = Math.min(54, raid.arenaShrinkMarginPx + 16);
      newlyTriggeredGatePct = pct;

      const corners: ReadonlyArray<Vec2> = [
        { x: -108, y: -62 },
        { x: 108, y: -62 },
        { x: -108, y: 62 },
        { x: 108, y: 62 },
      ];
      raid.runePillars = corners.map((c, idx) => ({
        id: `pillar_${pct}_${idx}`,
        position: { x: arenaCenter.x + c.x, y: arenaCenter.y + c.y },
        hp: Math.max(50, Math.round(raid.bossMaxHp * 0.04)),
        maxHp: Math.max(50, Math.round(raid.bossMaxHp * 0.04)),
        destroyed: false,
      }));
      raid.siphonObelisks = [
        {
          id: `siphon_${pct}`,
          position: { x: arenaCenter.x, y: arenaCenter.y - 74 },
          hp: Math.max(60, Math.round(raid.bossMaxHp * 0.05)),
          maxHp: Math.max(60, Math.round(raid.bossMaxHp * 0.05)),
          healPerSec: raid.bossMaxHp * 0.007,
        },
      ];
      break;
    }
  }

  return { newlyTriggeredGatePct };
}
