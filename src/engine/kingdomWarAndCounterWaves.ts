/**
 * Pillar 2 — Kingdom War Engine & Arc-Specific 10-Enemy Counter-Attack Ambush Waves
 *
 * Uses `flowFieldArmyPathfinder` (Dijkstra + Vector Flow-Field + Boids Steering)
 * so 20+ Allied Cat Knights, Dog Warriors, and 10-Enemy Counter-Attack Squads
 * march smoothly across bridges in formation without walking on water or clumping.
 */

import type { GridCoord, Vec2 } from '../types/math';
import type { ArcFactionConfig, ArcId, OmniverseFactionId } from '../types/world';
import {
  buildFlowField,
  stepArmyBoidsOnFlowField,
  type BoidAgent,
  type FlowFieldGrid,
} from '../math/flowFieldArmyPathfinder';
import { getArcConfig } from './heroPartyAndWarEngine';
import { getOmniverseArcConfig } from '../data/arc10_acts901to1000';
import { createCatCoatShuffleBag, createDogBreedShuffleBag } from '../sprites/armyAndBlacksmithSprites';

export const COUNTER_ATTACK_AMBUSH_COUNT = 10;

export interface CapturableWarBanner {
  readonly id: string;
  readonly position: Vec2;
  /** -100 = Enemy controlled, +100 = Cat-Dog Alliance controlled */
  captureProgress: number;
  owner: 'neutral' | 'alliance' | 'enemy';
}

export interface CounterAttackUnit {
  readonly id: string;
  readonly arcNumber: ArcFactionConfig['arcNumber'];
  readonly factionId: ArcFactionConfig['factionId'];
  readonly enemyKind: string;
  readonly isCaptain: boolean;
  readonly displayName: string;
  readonly agent: BoidAgent;
  hp: number;
  maxHp: number;
}

export interface OmniverseCounterAttackUnit {
  readonly id: string;
  readonly actId: number;
  readonly arcId: ArcId;
  readonly factionId: OmniverseFactionId;
  readonly enemyKind: string;
  readonly isCaptain: boolean;
  readonly displayName: string;
  readonly agent: BoidAgent;
  hp: number;
  maxHp: number;
}

export interface KingdomWarState {
  readonly actId: number;
  readonly arcConfig: ArcFactionConfig;
  tugOfWarPct: number; // 0..100 (50 = balanced)
  warHornCooldownSec: number;
  warHornBuffRemainingSec: number;
  banners: CapturableWarBanner[];
  alliedAgents: BoidAgent[];
  counterWave: CounterAttackUnit[];
  flowField: FlowFieldGrid | null;
}

export function createKingdomWarState(actId: number, allyCount = 12, origin: Vec2 = { x: 60, y: 140 }): KingdomWarState {
  const arcConfig = getArcConfig(actId);
  const catBag = createCatCoatShuffleBag(actId * 13 + 7);
  const dogBag = createDogBreedShuffleBag(actId * 29 + 5);
  const alliedAgents: BoidAgent[] = [];

  for (let i = 0; i < allyCount; i++) {
    const isDog = actId >= 42 && i % 3 === 2;
    const tag = isDog ? dogBag.next() : catBag.next();
    alliedAgents.push({
      id: `ally_${actId}_${i}_${tag}`,
      position: {
        x: origin.x + (i % 4) * 14,
        y: origin.y + Math.floor(i / 4) * 14 - 18,
      },
      velocity: { x: 0, y: 0 },
      radius: 7,
      maxSpeed: 68,
    });
  }

  return {
    actId,
    arcConfig,
    tugOfWarPct: 50,
    warHornCooldownSec: 0,
    warHornBuffRemainingSec: 0,
    banners: [
      { id: 'banner_west', position: { x: 160, y: 120 }, captureProgress: 20, owner: 'neutral' },
      { id: 'banner_east', position: { x: 320, y: 140 }, captureProgress: -20, owner: 'neutral' },
    ],
    alliedAgents,
    counterWave: [],
    flowField: null,
  };
}

/**
 * Spawns an Arc-Accurate 10-Enemy Counter-Attack Ambush Squad routed strictly via `getArcConfig(actId)`.
 */
export function triggerArcCounterAttackWave(
  warState: KingdomWarState,
  spawnOrigin: Vec2,
): ReadonlyArray<CounterAttackUnit> {
  const cfg = getArcConfig(warState.actId);
  const units: CounterAttackUnit[] = [];

  for (let i = 0; i < COUNTER_ATTACK_AMBUSH_COUNT; i++) {
    const isCaptain = i === 0;
    const enemyKind = cfg.enemyKinds[i % cfg.enemyKinds.length];
    const baseHp = Math.round((85 + warState.actId * 6.5) * (isCaptain ? 1.85 : 1.0));
    units.push({
      id: `counter_${warState.actId}_${i}`,
      arcNumber: cfg.arcNumber,
      factionId: cfg.factionId,
      enemyKind,
      isCaptain,
      displayName: isCaptain ? `${cfg.captainPrefix} ${enemyKind}` : enemyKind,
      agent: {
        id: `counter_agent_${i}`,
        position: {
          x: spawnOrigin.x + (i % 5) * 14 - 28,
          y: spawnOrigin.y + Math.floor(i / 5) * 16 - 8,
        },
        velocity: { x: 0, y: 0 },
        radius: isCaptain ? 10 : 7,
        maxSpeed: isCaptain ? 64 : 72,
      },
      hp: baseHp,
      maxHp: baseHp,
    });
  }

  warState.counterWave = units;
  return units;
}

/**
 * Spawns a 10-Arc Omniverse 10-Enemy Counter-Attack Ambush Squad routed strictly via
 * `getOmniverseArcConfig(actId)` across Acts 1 to 1,000!
 */
export function triggerOmniverseArcCounterAttackWave(
  actId: number,
  spawnOrigin: Vec2 = { x: 340, y: 135 },
): ReadonlyArray<OmniverseCounterAttackUnit> {
  const clampedAct = Math.max(1, Math.min(1000, Math.floor(actId)));
  const cfg = getOmniverseArcConfig(clampedAct);
  const units: OmniverseCounterAttackUnit[] = [];

  for (let i = 0; i < COUNTER_ATTACK_AMBUSH_COUNT; i++) {
    const isCaptain = i === 0;
    const enemyKind = cfg.enemyPool[i % cfg.enemyPool.length];
    const baseHp = Math.round((95 + clampedAct * 8.2) * (isCaptain ? 1.9 : 1.0));
    units.push({
      id: `omni_counter_${clampedAct}_${i}`,
      actId: clampedAct,
      arcId: cfg.arcId,
      factionId: cfg.factionId,
      enemyKind,
      isCaptain,
      displayName: isCaptain ? `${cfg.captainPrefix} ${enemyKind}` : enemyKind,
      agent: {
        id: `omni_counter_agent_${clampedAct}_${i}`,
        position: {
          x: spawnOrigin.x + (i % 5) * 14 - 28,
          y: spawnOrigin.y + Math.floor(i / 5) * 16 - 8,
        },
        velocity: { x: 0, y: 0 },
        radius: isCaptain ? 10 : 7,
        maxSpeed: isCaptain ? 64 : 72,
      },
      hp: baseHp,
      maxHp: baseHp,
    });
  }

  return units;
}

export function triggerWarHornRally(warState: KingdomWarState): boolean {
  if (warState.warHornCooldownSec > 0) return false;
  warState.warHornCooldownSec = 18.0;
  warState.warHornBuffRemainingSec = 8.0;
  warState.tugOfWarPct = Math.min(100, warState.tugOfWarPct + 12);
  return true;
}

export function stepKingdomWarFlowSimulation(
  warState: KingdomWarState,
  tileGrid: ReadonlyArray<ReadonlyArray<number>>,
  objectiveGoal: GridCoord,
  tileSizePx: number,
  dt: number,
): void {
  if (warState.warHornCooldownSec > 0) {
    warState.warHornCooldownSec = Math.max(0, warState.warHornCooldownSec - dt);
  }
  if (warState.warHornBuffRemainingSec > 0) {
    warState.warHornBuffRemainingSec = Math.max(0, warState.warHornBuffRemainingSec - dt);
  }

  if (
    !warState.flowField ||
    warState.flowField.goal.col !== objectiveGoal.col ||
    warState.flowField.goal.row !== objectiveGoal.row
  ) {
    warState.flowField = buildFlowField(tileGrid, objectiveGoal);
  }

  const speedBoost = warState.warHornBuffRemainingSec > 0 ? 1.35 : 1.0;
  stepArmyBoidsOnFlowField(warState.alliedAgents, warState.flowField, tileGrid, tileSizePx, dt * speedBoost);

  if (warState.counterWave.length > 0) {
    const enemyAgents = warState.counterWave.filter((u) => u.hp > 0).map((u) => u.agent);
    stepArmyBoidsOnFlowField(enemyAgents, warState.flowField, tileGrid, tileSizePx, dt);
  }
}

export interface PortalUnlockInput {
  readonly normalEnemiesAlive: number;
  readonly hasBoss: boolean;
  readonly bossDefeated: boolean;
  readonly uncapturedBanners: number;
  readonly isSanctuaryAct?: boolean;
}

export interface PortalUnlockResult {
  readonly unlocked: boolean;
  readonly lockReason: string | null;
  readonly remainingEnemies: number;
  readonly remainingBanners: number;
  readonly bossPending: boolean;
}

/**
 * STRICT 3-CONDITION EXIT PORTAL LOCK (Renewal Pillar 3):
 * Exit Portal remains locked (`🔒`) until ALL THREE conditions pass simultaneously:
 *   1. `normalEnemiesAlive === 0`
 *   2. `!hasBoss || bossDefeated === true`
 *   3. `uncapturedBanners === 0`
 */
export function canUnlockExitPortal(input: PortalUnlockInput): PortalUnlockResult {
  if (input.isSanctuaryAct) {
    return {
      unlocked: true,
      lockReason: null,
      remainingEnemies: 0,
      remainingBanners: 0,
      bossPending: false,
    };
  }

  const remainingEnemies = Math.max(0, Math.floor(input.normalEnemiesAlive));
  const remainingBanners = Math.max(0, Math.floor(input.uncapturedBanners));
  const bossPending = input.hasBoss && !input.bossDefeated;

  const reasons: string[] = [];
  if (remainingEnemies > 0) {
    reasons.push(`Defeat ${remainingEnemies} remaining ${remainingEnemies === 1 ? 'enemy' : 'enemies'}`);
  }
  if (bossPending) {
    reasons.push('Defeat the Act Boss');
  }
  if (remainingBanners > 0) {
    reasons.push(`Capture ${remainingBanners} War ${remainingBanners === 1 ? 'Banner' : 'Banners'}`);
  }

  if (reasons.length > 0) {
    return {
      unlocked: false,
      lockReason: `🔒 Portal Locked: ${reasons.join(' • ')}`,
      remainingEnemies,
      remainingBanners,
      bossPending,
    };
  }

  return {
    unlocked: true,
    lockReason: null,
    remainingEnemies: 0,
    remainingBanners: 0,
    bossPending: false,
  };
}

export { getArcConfig };

