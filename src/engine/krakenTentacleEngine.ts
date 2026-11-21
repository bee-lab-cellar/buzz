/**
 * Pillar 2 — Fast-Kill Kraken Tentacle Engine (Arc IV: Acts 123–180)
 *
 * STRICT BALANCE & FEEL RULES:
 * - Cuts Tentacle HP by 65% (normal `kraken_spawn` = 30% standard enemy HP;
 *   each of Charybdis's 8 Boss Tentacles = 5% of Boss Max HP, immune to the 1.2% Boss-body cap!)
 * - Glowing cyan/gold Weak-Spot Cut Ring deals `2.5x SLICE CRIT!`
 * - Severing drops **2 Healing Fish** & inflicts **10% Max HP Shock-Stagger** on Charybdis.
 * - ZERO camera shake on normal tentacle hits (`camShake = 0`); micro-shake ONLY on sever!
 */

import type { KrakenWeakSpotTentacle } from '../types/combat';
import type { Vec2 } from '../types/math';

export const KRAKEN_HP_REDUCTION_FACTOR = 0.35; // 65% reduced HP vs legacy baseline!
export const KRAKEN_SPAWN_HP_RATIO = 0.3;
export const CHARYBDIS_TENTACLE_HP_RATIO = 0.05;
export const KRAKEN_WEAKSPOT_MULTIPLIER = 2.5;
export const CHARYBDIS_SEVER_SHOCK_RATIO = 0.1;
export const HEALING_FISH_PER_SEVER = 2;

export interface KrakenTentacleHitReport {
  readonly tentacleId: string;
  readonly damageDealt: number;
  readonly hitWeakSpotCrit: boolean;
  readonly severedNow: boolean;
  readonly healingFishDropped: number;
  readonly bossShockStaggerDamage: number;
  /** Strictly false on normal strikes; true ONLY on severing blow */
  readonly triggerMicroShake: boolean;
  readonly callout: string;
}

export function createReducedHpKrakenSpawn(
  id: string,
  position: Vec2,
  legacyBaselineHp: number,
  standardEnemyHp?: number,
): KrakenWeakSpotTentacle {
  const reducedHp =
    standardEnemyHp !== undefined
      ? Math.max(15, Math.round(standardEnemyHp * KRAKEN_SPAWN_HP_RATIO))
      : Math.max(15, Math.round(legacyBaselineHp * KRAKEN_HP_REDUCTION_FACTOR));

  return {
    tentacleIndex: 1,
    id,
    isBossTentacle: false,
    basePosition: { x: position.x, y: position.y },
    weakSpotCenter: { x: position.x, y: position.y - 10 },
    weakSpotRadius: 11,
    hp: reducedHp,
    maxHp: reducedHp,
    severed: false,
    swayPhaseRad: 0,
  };
}

export function createCharybdis8BossTentacles(
  bossCenter: Vec2,
  bossMaxHp: number,
): KrakenWeakSpotTentacle[] {
  const perTentacleHp = Math.max(20, Math.round(bossMaxHp * CHARYBDIS_TENTACLE_HP_RATIO));
  const indices: ReadonlyArray<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8> = [1, 2, 3, 4, 5, 6, 7, 8];

  return indices.map((idx) => {
    const angle = (Math.PI * 2 * (idx - 1)) / 8 + 0.2;
    const bx = bossCenter.x + Math.cos(angle) * 76;
    const by = bossCenter.y + Math.sin(angle) * 50;
    return {
      tentacleIndex: idx,
      id: `charybdis_tentacle_${idx}`,
      isBossTentacle: true,
      basePosition: { x: bx, y: by },
      weakSpotCenter: { x: bx, y: by - 12 },
      weakSpotRadius: 12,
      hp: perTentacleHp,
      maxHp: perTentacleHp,
      severed: false,
      swayPhaseRad: idx * 0.78,
    };
  });
}

/**
 * Evaluates a player slash against a Kraken Tentacle.
 * Completely bypasses the 1.2% Final Boss damage cap so tentacles slice cleanly in 3–4 combos.
 */
export function resolveKrakenTentacleSlash(
  tentacle: KrakenWeakSpotTentacle,
  strikePos: Vec2,
  rawDamage: number,
  bossMaxHp = 0,
): KrakenTentacleHitReport {
  if (tentacle.severed) {
    return {
      tentacleId: tentacle.id,
      damageDealt: 0,
      hitWeakSpotCrit: false,
      severedNow: false,
      healingFishDropped: 0,
      bossShockStaggerDamage: 0,
      triggerMicroShake: false,
      callout: '',
    };
  }

  const dist = Math.hypot(
    strikePos.x - tentacle.weakSpotCenter.x,
    strikePos.y - tentacle.weakSpotCenter.y,
  );
  const hitWeakSpotCrit = dist <= tentacle.weakSpotRadius + 10;
  const damageDealt = Math.max(
    1,
    Math.round(hitWeakSpotCrit ? rawDamage * KRAKEN_WEAKSPOT_MULTIPLIER : rawDamage),
  );

  tentacle.hp = Math.max(0, tentacle.hp - damageDealt);
  const severedNow = tentacle.hp <= 0;
  if (severedNow) {
    tentacle.severed = true;
  }

  return {
    tentacleId: tentacle.id,
    damageDealt,
    hitWeakSpotCrit,
    severedNow,
    healingFishDropped: severedNow ? HEALING_FISH_PER_SEVER : 0,
    bossShockStaggerDamage:
      severedNow && tentacle.isBossTentacle
        ? Math.round(bossMaxHp * CHARYBDIS_SEVER_SHOCK_RATIO)
        : 0,
    triggerMicroShake: severedNow, // ZERO screen shake on normal tentacle hits!
    callout: severedNow
      ? '💥 TENTACLE SEVERED!'
      : hitWeakSpotCrit
        ? '2.5x SLICE CRIT!'
        : 'SLICE!',
  };
}
