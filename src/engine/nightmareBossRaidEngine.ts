/**
 * Layer 4 — Nightmare Boss Raid Engine & Great Duck's Elixir Loop
 *
 * Implements:
 * - 1.2% Max HP per-hit damage cap on Final Bosses (immune on Kraken Tentacles!)
 * - 75% / 50% / 25% Phase Gates with 4 Rune Pillars
 * - Siphon Obelisks & Shrinking Arena Border
 * - 20.0s Timed Great Duck's Elixir ([Q]) + 3 Golden Feathers instant refill loop
 */

import type { ElixirBuffState } from '../types/entities';
import type { Vec2 } from '../types/math';

export const FINAL_BOSS_PER_HIT_CAP_RATIO = 0.012;
export const GREAT_DUCK_ELIXIR_DURATION_SEC = 20.0;
export const GREAT_DUCK_ELIXIR_COOLDOWN_SEC = 35.0;
export const FEATHERS_FOR_INSTANT_REFILL = 3;

export interface RunePillarNode {
  readonly id: string;
  position: Vec2;
  hp: number;
  maxHp: number;
  destroyed: boolean;
}

export interface SiphonObeliskNode {
  readonly id: string;
  position: Vec2;
  hp: number;
  maxHp: number;
  healPerSec: number;
  active: boolean;
}

export interface GoldenFeatherPickup {
  readonly id: string;
  position: Vec2;
  collected: boolean;
  bobPhase: number;
}

export interface NightmareRaidState {
  readonly actId: number;
  readonly isFinalBoss: boolean;
  bossMaxHp: number;
  bossHp: number;
  phaseIndex: 1 | 2 | 3 | 4;
  triggeredGates: ReadonlyArray<number>;
  invulnerableShieldActive: boolean;
  arenaShrinkMarginPx: number;
  runePillars: RunePillarNode[];
  siphonObelisks: SiphonObeliskNode[];
  feathers: GoldenFeatherPickup[];
  elixir: ElixirBuffState;
}

export function createInitialElixirState(unlocked: boolean): ElixirBuffState {
  return {
    unlocked,
    active: false,
    remainingSeconds: 0,
    maxDurationSeconds: GREAT_DUCK_ELIXIR_DURATION_SEC,
    cooldownSeconds: 0,
    feathersCollected: 0,
    feathersRequiredForRefill: FEATHERS_FOR_INSTANT_REFILL,
    damageMultiplier: 2.4,
    breaksBossInvulnerabilityShield: true,
  };
}

export function createNightmareRaidState(
  actId: number,
  isFinalBoss: boolean,
  bossMaxHp: number,
  elixirUnlocked: boolean,
): NightmareRaidState {
  return {
    actId,
    isFinalBoss,
    bossMaxHp,
    bossHp: bossMaxHp,
    phaseIndex: 1,
    triggeredGates: [],
    invulnerableShieldActive: false,
    arenaShrinkMarginPx: 0,
    runePillars: [],
    siphonObelisks: [],
    feathers: [],
    elixir: createInitialElixirState(elixirUnlocked),
  };
}

export function activateGreatDuckElixir(state: NightmareRaidState): boolean {
  if (!state.elixir.unlocked) return false;
  if (state.elixir.active || state.elixir.cooldownSeconds > 0) return false;

  state.elixir.active = true;
  state.elixir.remainingSeconds = state.elixir.maxDurationSeconds;
  state.elixir.cooldownSeconds = GREAT_DUCK_ELIXIR_COOLDOWN_SEC;

  // Instantly shatters active boss invulnerability shield when triggered
  if (state.elixir.breaksBossInvulnerabilityShield && state.invulnerableShieldActive) {
    state.invulnerableShieldActive = false;
    for (let i = 0; i < state.runePillars.length; i++) {
      state.runePillars[i].destroyed = true;
      state.runePillars[i].hp = 0;
    }
  }
  return true;
}

export function collectGoldenFeather(state: NightmareRaidState): { readonly instantRefilled: boolean } {
  state.elixir.feathersCollected += 1;
  if (state.elixir.feathersCollected >= state.elixir.feathersRequiredForRefill) {
    state.elixir.feathersCollected = 0;
    state.elixir.cooldownSeconds = 0;
    if (state.elixir.active) {
      state.elixir.remainingSeconds = state.elixir.maxDurationSeconds;
    }
    return { instantRefilled: true };
  }
  return { instantRefilled: false };
}

export function computeRaidBossDamage(
  state: NightmareRaidState,
  rawDamage: number,
  targetIsKrakenTentacle: boolean,
): { readonly appliedDamage: number; readonly capped: boolean; readonly blockedByShield: boolean } {
  if (state.invulnerableShieldActive && !targetIsKrakenTentacle && !state.elixir.active) {
    return { appliedDamage: 0, blockedByShield: true, capped: false };
  }

  let scaled = state.elixir.active ? rawDamage * state.elixir.damageMultiplier : rawDamage;

  if (state.isFinalBoss && !targetIsKrakenTentacle) {
    const cap = Math.max(1, Math.round(state.bossMaxHp * FINAL_BOSS_PER_HIT_CAP_RATIO));
    if (scaled > cap) {
      scaled = cap;
      return { appliedDamage: cap, capped: true, blockedByShield: false };
    }
  }

  return { appliedDamage: Math.max(1, Math.round(scaled)), capped: false, blockedByShield: false };
}

export function stepNightmareRaid(
  state: NightmareRaidState,
  dt: number,
  arenaCenter: Vec2,
): { readonly phaseGateTriggered: number | null } {
  // Update Great Duck Elixir timer & cooldown
  if (state.elixir.active) {
    state.elixir.remainingSeconds = Math.max(0, state.elixir.remainingSeconds - dt);
    if (state.elixir.remainingSeconds <= 0) {
      state.elixir.active = false;
    }
  } else if (state.elixir.cooldownSeconds > 0) {
    state.elixir.cooldownSeconds = Math.max(0, state.elixir.cooldownSeconds - dt);
  }

  // Siphon Obelisk healing tick
  for (let i = 0; i < state.siphonObelisks.length; i++) {
    const obelisk = state.siphonObelisks[i];
    if (!obelisk.active || obelisk.hp <= 0) continue;
    state.bossHp = Math.min(state.bossMaxHp, state.bossHp + obelisk.healPerSec * dt);
  }

  // Check if all 4 Rune Pillars destroyed -> lift shield
  if (state.invulnerableShieldActive && state.runePillars.length > 0) {
    const allDown = state.runePillars.every((p) => p.destroyed || p.hp <= 0);
    if (allDown) {
      state.invulnerableShieldActive = false;
    }
  }

  // Evaluate 75% / 50% / 25% Phase Gates
  const hpPct = state.bossMaxHp > 0 ? state.bossHp / state.bossMaxHp : 0;
  const thresholds: ReadonlyArray<number> = [0.75, 0.5, 0.25];
  let triggeredGate: number | null = null;

  for (let i = 0; i < thresholds.length; i++) {
    const threshold = thresholds[i];
    const gatePct = Math.round(threshold * 100);
    if (hpPct <= threshold && !state.triggeredGates.includes(gatePct)) {
      state.triggeredGates = [...state.triggeredGates, gatePct];
      state.phaseIndex = (i + 2) as 2 | 3 | 4;
      state.invulnerableShieldActive = true;
      state.arenaShrinkMarginPx = Math.min(48, state.arenaShrinkMarginPx + 14);
      triggeredGate = gatePct;

      // Spawn 4 Rune Pillars around the arena
      const pillarOffsets: ReadonlyArray<Vec2> = [
        { x: -110, y: -64 },
        { x: 110, y: -64 },
        { x: -110, y: 64 },
        { x: 110, y: 64 },
      ];
      state.runePillars = pillarOffsets.map((off, idx) => ({
        id: `rune_pillar_${gatePct}_${idx}`,
        position: { x: arenaCenter.x + off.x, y: arenaCenter.y + off.y },
        hp: Math.max(40, Math.round(state.bossMaxHp * 0.04)),
        maxHp: Math.max(40, Math.round(state.bossMaxHp * 0.04)),
        destroyed: false,
      }));

      // Spawn 1 Siphon Obelisk & 3 Golden Feathers for Elixir loop
      state.siphonObelisks = [
        {
          id: `siphon_${gatePct}`,
          position: { x: arenaCenter.x, y: arenaCenter.y - 78 },
          hp: Math.max(50, Math.round(state.bossMaxHp * 0.05)),
          maxHp: Math.max(50, Math.round(state.bossMaxHp * 0.05)),
          healPerSec: state.bossMaxHp * 0.008,
          active: true,
        },
      ];
      state.feathers = [0, 1, 2].map((idx) => ({
        id: `feather_${gatePct}_${idx}`,
        position: {
          x: arenaCenter.x + (idx - 1) * 84,
          y: arenaCenter.y + 72,
        },
        collected: false,
        bobPhase: idx * 2.1,
      }));
      break;
    }
  }

  return { phaseGateTriggered: triggeredGate };
}
