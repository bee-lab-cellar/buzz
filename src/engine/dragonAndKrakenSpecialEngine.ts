/**
 * Layer 4 — Articulated Dragon Sky-Siege & Fast-Kill Kraken Tentacle Engine
 *
 * Implements:
 * - Arc III Dragon Bosses: 4-part breakable anatomy (Wings, Tail, ChestCore, Head),
 *   Sky-Flight Mode + 4 corner Harpoon Ballistas ([E]), Hoard-Vacuum theft, Updraft Dragon-Back Mounting.
 * - Arc IV Kraken Tentacles:
 *   * 65% reduced HP (normal tentacle = 30% standard enemy HP; Charybdis boss tentacle = 5% boss Max HP,
 *     immune to the 1.2% final boss cap so tentacles die in 3–4 fast slashes!)
 *   * Glowing cyan/gold Weak-Spot Cut Ring deals 2.5x SLICE CRIT!
 *   * Severing drops 2 Healing Fish & triggers 10% Boss Shock-Stagger!
 *   * ZERO screen shake on normal tentacle hits; micro-shake ONLY on tentacle sever!
 */

import type { BossPartHitbox } from '../types/entities';
import type { Vec2 } from '../types/math';
import { createArticulatedDragonHitboxes } from '../sprites/arc3DragonBossSprites';

export const KRAKEN_WEAKSPOT_CRIT_MULTIPLIER = 2.5;
export const KRAKEN_BOSS_TENTACLE_HP_RATIO = 0.05;
export const KRAKEN_NORMAL_TENTACLE_HP_RATIO = 0.3;
export const KRAKEN_SEVER_BOSS_SHOCK_RATIO = 0.1;

export interface HarpoonBallistaState {
  readonly id: string;
  readonly position: Vec2;
  cooldownSec: number;
  ready: boolean;
}

export interface DragonSkySiegeState {
  readonly bossId: string;
  isAirborne: boolean;
  flightTimerSec: number;
  groundedStaggerSec: number;
  hoardStolenGold: number;
  playerMountedSec: number;
  parts: BossPartHitbox[];
  ballistas: HarpoonBallistaState[];
}

export interface KrakenTentacleNode {
  readonly id: string;
  readonly isBossTentacle: boolean;
  basePos: Vec2;
  weakSpotPos: Vec2;
  weakSpotRadius: number;
  hp: number;
  maxHp: number;
  severed: boolean;
  swayPhase: number;
}

export interface TentacleStrikeOutcome {
  readonly damageDealt: number;
  readonly isWeakSpotCrit: boolean;
  readonly severedNow: boolean;
  readonly healingFishDropped: number;
  readonly bossShockStaggerDamage: number;
  /** Strictly false on normal hits; true ONLY on sever to trigger a single micro-shake */
  readonly triggerSeverMicroShake: boolean;
}

export function createDragonSkySiegeState(
  bossId: string,
  bossMaxHp: number,
  arenaBounds: { width: number; height: number },
): DragonSkySiegeState {
  const m = 44;
  return {
    bossId,
    isAirborne: false,
    flightTimerSec: 0,
    groundedStaggerSec: 0,
    hoardStolenGold: 0,
    playerMountedSec: 0,
    parts: createArticulatedDragonHitboxes(bossMaxHp),
    ballistas: [
      { id: 'ballista_nw', position: { x: m, y: m }, cooldownSec: 0, ready: true },
      { id: 'ballista_ne', position: { x: arenaBounds.width - m, y: m }, cooldownSec: 0, ready: true },
      { id: 'ballista_sw', position: { x: m, y: arenaBounds.height - m }, cooldownSec: 0, ready: true },
      { id: 'ballista_se', position: { x: arenaBounds.width - m, y: arenaBounds.height - m }, cooldownSec: 0, ready: true },
    ],
  };
}

export function fireCornerHarpoonBallista(
  siege: DragonSkySiegeState,
  playerPos: Vec2,
): { readonly fired: boolean; readonly groundedDragon: boolean } {
  for (let i = 0; i < siege.ballistas.length; i++) {
    const b = siege.ballistas[i];
    if (!b.ready) continue;
    const dist = Math.hypot(playerPos.x - b.position.x, playerPos.y - b.position.y);
    if (dist <= 34) {
      b.ready = false;
      b.cooldownSec = 9.0;
      const wasAirborne = siege.isAirborne;
      if (wasAirborne) {
        siege.isAirborne = false;
        siege.groundedStaggerSec = 4.5;
        const wings = siege.parts.find((p) => p.kind === 'dragon_wings');
        if (wings && !wings.broken) {
          wings.hp = Math.max(0, wings.hp - Math.round(wings.maxHp * 0.45));
          if (wings.hp <= 0) wings.broken = true;
        }
      }
      return { fired: true, groundedDragon: wasAirborne };
    }
  }
  return { fired: false, groundedDragon: false };
}

export function createCharybdis8Tentacles(
  bossCenter: Vec2,
  bossMaxHp: number,
): KrakenTentacleNode[] {
  const tentacleHp = Math.max(25, Math.round(bossMaxHp * KRAKEN_BOSS_TENTACLE_HP_RATIO));
  const nodes: KrakenTentacleNode[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + 0.25;
    const bx = bossCenter.x + Math.cos(angle) * 78;
    const by = bossCenter.y + Math.sin(angle) * 52;
    nodes.push({
      id: `charybdis_tentacle_${i + 1}`,
      isBossTentacle: true,
      basePos: { x: bx, y: by },
      weakSpotPos: { x: bx, y: by - 12 },
      weakSpotRadius: 11,
      hp: tentacleHp,
      maxHp: tentacleHp,
      severed: false,
      swayPhase: i * 0.85,
    });
  }
  return nodes;
}

export function createNormalKrakenSpawnTentacle(
  id: string,
  pos: Vec2,
  standardEnemyHp: number,
): KrakenTentacleNode {
  const hp = Math.max(18, Math.round(standardEnemyHp * KRAKEN_NORMAL_TENTACLE_HP_RATIO));
  return {
    id,
    isBossTentacle: false,
    basePos: { x: pos.x, y: pos.y },
    weakSpotPos: { x: pos.x, y: pos.y - 10 },
    weakSpotRadius: 10,
    hp,
    maxHp: hp,
    severed: false,
    swayPhase: 0,
  };
}

/**
 * Resolves a player strike against a Kraken Tentacle.
 * - Immune to the 1.2% final boss damage cap.
 * - Hitting inside the glowing cyan/gold weak-spot ring deals 2.5x SLICE CRIT!
 * - Severing drops 2 Healing Fish & deals 10% Shock-Stagger damage to Charybdis.
 */
export function strikeKrakenTentacle(
  tentacle: KrakenTentacleNode,
  strikeWorldPos: Vec2,
  rawDamage: number,
  bossMaxHp = 0,
): TentacleStrikeOutcome {
  if (tentacle.severed) {
    return {
      damageDealt: 0,
      isWeakSpotCrit: false,
      severedNow: false,
      healingFishDropped: 0,
      bossShockStaggerDamage: 0,
      triggerSeverMicroShake: false,
    };
  }

  const distToRing = Math.hypot(
    strikeWorldPos.x - tentacle.weakSpotPos.x,
    strikeWorldPos.y - tentacle.weakSpotPos.y,
  );
  const isWeakSpotCrit = distToRing <= tentacle.weakSpotRadius + 10;
  const finalDamage = Math.max(
    1,
    Math.round(isWeakSpotCrit ? rawDamage * KRAKEN_WEAKSPOT_CRIT_MULTIPLIER : rawDamage),
  );

  tentacle.hp = Math.max(0, tentacle.hp - finalDamage);
  const severedNow = tentacle.hp <= 0;
  if (severedNow) {
    tentacle.severed = true;
  }

  return {
    damageDealt: finalDamage,
    isWeakSpotCrit,
    severedNow,
    healingFishDropped: severedNow ? 2 : 0,
    bossShockStaggerDamage:
      severedNow && tentacle.isBossTentacle
        ? Math.round(bossMaxHp * KRAKEN_SEVER_BOSS_SHOCK_RATIO)
        : 0,
    triggerSeverMicroShake: severedNow,
  };
}
