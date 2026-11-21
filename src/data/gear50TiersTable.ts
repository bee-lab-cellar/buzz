/**
 * File 35 / 100 — 50-Tier Equipment Table, +25★ Star-Up Anvil Math,
 * Elemental Gem Sockets & Primordial Mutation Bonuses. Zero `any`.
 */

import type { EquipmentTier, EquipmentTierSpec } from '../types/combat';
import {
  ALL_100_GEAR_TIERS,
  ARMORS_50_TIERS,
  getRecommendedGearTierForAct,
  WEAPONS_50_TIERS,
} from './gear50TiersAndAlchemy';

export {
  ALL_100_GEAR_TIERS,
  ARMORS_50_TIERS,
  getRecommendedGearTierForAct,
  WEAPONS_50_TIERS,
};

export const MAX_GEAR_STAR_LEVEL = 25;

export interface EffectiveGearTotals {
  readonly atk: number;
  readonly def: number;
  readonly hp: number;
  readonly powerScore: number;
}

export function getGearById(id: string): EquipmentTierSpec | null {
  return ALL_100_GEAR_TIERS.find((g) => g.id === id) ?? null;
}

export function getWeaponForTier(tier: EquipmentTier): EquipmentTierSpec {
  return WEAPONS_50_TIERS[Math.max(0, Math.min(49, tier - 1))];
}

export function getArmorForTier(tier: EquipmentTier): EquipmentTierSpec {
  return ARMORS_50_TIERS[Math.max(0, Math.min(49, tier - 1))];
}

export function computeStarUpGoldCost(tier: EquipmentTier, currentStar: number): number {
  const safeStar = Math.max(0, Math.min(MAX_GEAR_STAR_LEVEL, Math.floor(currentStar)));
  return Math.round((45 + tier * 28) * Math.pow(1.22, safeStar));
}

export function computeEffectiveGearStats(
  item: EquipmentTierSpec,
  starLevel: number,
  primordialMutated: boolean,
  socketedGemCount = 0,
): EffectiveGearTotals {
  const clampedStar = Math.max(0, Math.min(MAX_GEAR_STAR_LEVEL, Math.floor(starLevel)));
  const starMult = 1 + clampedStar * 0.14;
  const primordialMult = primordialMutated || item.primordialMutated ? 1.35 : 1.0;
  const gemBonus = Math.max(0, Math.min(3, socketedGemCount)) * 0.08;
  const totalMult = starMult * primordialMult * (1 + gemBonus);

  const atk = Math.round(item.atkBonus * totalMult);
  const def = Math.round(item.defBonus * totalMult);
  const hp = Math.round(item.hpBonus * totalMult);
  return {
    atk,
    def,
    hp,
    powerScore: atk * 4 + def * 3 + Math.round(hp * 0.5),
  };
}
