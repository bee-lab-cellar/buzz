/**
 * File 58 / 100 — Capital Building Upgrades, +25★ Star-Forge Anvil, & BlockCraft Alchemy Cauldron Engine.
 * Strictly typed (ZERO `any`).
 */

import {
  CAPITAL_12_BUILDINGS,
  getCapitalBuildingUpgradeCost,
} from '../data/capital12BuildingsData';
import {
  ALCHEMY_50_RECIPES,
  canUnlockConstellationNode,
  findAlchemyRecipeById,
} from '../data/alchemy50RecipesAndSkills60';
import {
  computeEffectiveGearStats,
  computeStarUpGoldCost,
  getWeaponForTier,
  MAX_GEAR_STAR_LEVEL,
} from '../data/gear50TiersTable';
import type { EquipmentTier } from '../types/combat';
import type {
  AlchemyIngredientId,
  AlchemyRecipe,
  CapitalBuildingId,
} from '../types/saveAndProgression';

export interface CapitalAlchemyState {
  gold: number;
  starPoints: number;
  buildingLevels: Record<CapitalBuildingId, number>;
  ingredients: Record<AlchemyIngredientId, number>;
  brewedFlasks: Record<string, number>;
  unlockedSkillIds: string[];
  equippedGearTier: number;
  equippedGearStars: number;
}

export interface CapitalUpgradeResult {
  readonly ok: boolean;
  readonly reason: string | null;
  readonly newLevel: number;
  readonly goldSpent: number;
}

export interface CauldronBrewResult {
  readonly ok: boolean;
  readonly reason: string | null;
  readonly recipe: AlchemyRecipe | null;
  readonly potencyMultiplier: number;
  readonly liquidHex: string;
}

export interface StarForgeResult {
  readonly ok: boolean;
  readonly reason: string | null;
  readonly newStars: number;
  readonly goldSpent: number;
  readonly atk: number;
  readonly def: number;
  readonly hp: number;
}

export function createInitialCapitalAlchemyState(startingGold = 1500): CapitalAlchemyState {
  return {
    gold: startingGold,
    starPoints: 4,
    buildingLevels: {
      royal_palace: 1,
      star_forge_smithy: 1,
      blockcraft_alchemy_lab: 1,
      cat_knight_barracks: 1,
      dog_alliance_embassy: 0,
      great_duck_observatory: 0,
      fish_market_bazaar: 1,
      arcane_library: 0,
      training_dojo: 0,
      sky_harpoon_armory: 0,
      abyssal_drydock: 0,
      chronos_clocktower: 1,
    },
    ingredients: {
      sunleaf_herb: 12,
      moon_petal: 12,
      ember_crystal: 10,
      frost_shard: 10,
      abyssal_pearl: 8,
      clockwork_gear: 8,
      void_dust: 6,
      golden_feather: 8,
      dragon_scale: 8,
      coral_nectar: 10,
    },
    brewedFlasks: {},
    unlockedSkillIds: [],
    equippedGearTier: 1,
    equippedGearStars: 0,
  };
}

export function upgradeCapitalBuilding(
  state: CapitalAlchemyState,
  buildingId: CapitalBuildingId,
): CapitalUpgradeResult {
  const spec = CAPITAL_12_BUILDINGS.find((b) => b.id === buildingId);
  if (!spec) {
    return { ok: false, reason: 'Unknown building', newLevel: 0, goldSpent: 0 };
  }
  const current = state.buildingLevels[buildingId] ?? 0;
  if (current >= spec.maxLevel) {
    return { ok: false, reason: 'Building is already at max level', newLevel: current, goldSpent: 0 };
  }
  const cost = getCapitalBuildingUpgradeCost(buildingId, current);
  if (state.gold < cost) {
    return { ok: false, reason: `Needs ${cost} Gold`, newLevel: current, goldSpent: 0 };
  }
  state.gold -= cost;
  state.buildingLevels[buildingId] = current + 1;
  return {
    ok: true,
    reason: null,
    newLevel: current + 1,
    goldSpent: cost,
  };
}

export function computeCapitalPassiveBonuses(
  levels: Readonly<Record<CapitalBuildingId, number>>,
): {
  readonly maxHpPct: number;
  readonly atkPct: number;
  readonly flaskPotencyPct: number;
  readonly goldDropPct: number;
  readonly bossPartDamagePct: number;
  readonly allStatsPct: number;
} {
  const tower = levels.chronos_clocktower ?? 0;
  return {
    maxHpPct: (levels.royal_palace ?? 0) * 6 + tower * 4,
    atkPct: (levels.star_forge_smithy ?? 0) * 5 + tower * 4,
    flaskPotencyPct: (levels.blockcraft_alchemy_lab ?? 0) * 8 + tower * 4,
    goldDropPct: (levels.abyssal_drydock ?? 0) * 10,
    bossPartDamagePct: (levels.sky_harpoon_armory ?? 0) * 7,
    allStatsPct: tower * 4,
  };
}

export function brewAlchemyRecipe(
  state: CapitalAlchemyState,
  recipeId: string,
): CauldronBrewResult {
  const recipe = findAlchemyRecipeById(recipeId);
  if (!recipe) {
    return { ok: false, reason: 'Unknown recipe', recipe: null, potencyMultiplier: 1, liquidHex: '#a855f7' };
  }

  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ing = recipe.ingredients[i];
    const have = state.ingredients[ing.id] ?? 0;
    if (have < ing.qty) {
      return {
        ok: false,
        reason: `Missing ${ing.qty - have}x ${ing.id}`,
        recipe,
        potencyMultiplier: 1,
        liquidHex: recipe.colorHex,
      };
    }
  }

  for (let i = 0; i < recipe.ingredients.length; i++) {
    const ing = recipe.ingredients[i];
    state.ingredients[ing.id] = Math.max(0, (state.ingredients[ing.id] ?? 0) - ing.qty);
  }

  state.brewedFlasks[recipe.id] = (state.brewedFlasks[recipe.id] ?? 0) + 1;
  const labLv = state.buildingLevels.blockcraft_alchemy_lab ?? 0;
  const potencyMultiplier = Number((1 + labLv * 0.08).toFixed(2));

  return {
    ok: true,
    reason: null,
    recipe,
    potencyMultiplier,
    liquidHex: recipe.colorHex,
  };
}

export function findRecipeByIngredientPair(
  a: AlchemyIngredientId,
  b: AlchemyIngredientId,
): AlchemyRecipe {
  const match = ALCHEMY_50_RECIPES.find((r) => {
    const ids = r.ingredients.map((i) => i.id);
    return ids.includes(a) && ids.includes(b);
  });
  return match ?? ALCHEMY_50_RECIPES[0];
}

export function starUpEquippedGear(state: CapitalAlchemyState): StarForgeResult {
  const clampedTier = Math.max(1, Math.min(50, Math.floor(state.equippedGearTier))) as EquipmentTier;
  const tierSpec = getWeaponForTier(clampedTier);
  const currentStars = state.equippedGearStars;
  if (currentStars >= MAX_GEAR_STAR_LEVEL) {
    const stats = computeEffectiveGearStats(tierSpec, currentStars, false);
    return {
      ok: false,
      reason: 'Already at +25★ Mythic Cap',
      newStars: currentStars,
      goldSpent: 0,
      atk: stats.atk,
      def: stats.def,
      hp: stats.hp,
    };
  }

  const forgeLv = state.buildingLevels.star_forge_smithy ?? 0;
  const discount = Math.max(0.65, 1 - forgeLv * 0.03);
  const goldCost = Math.round(computeStarUpGoldCost(clampedTier, currentStars) * discount);

  if (state.gold < goldCost) {
    const stats = computeEffectiveGearStats(tierSpec, currentStars, false);
    return {
      ok: false,
      reason: `Needs ${goldCost} Gold`,
      newStars: currentStars,
      goldSpent: 0,
      atk: stats.atk,
      def: stats.def,
      hp: stats.hp,
    };
  }

  state.gold -= goldCost;
  state.equippedGearStars = currentStars + 1;
  const nextStats = computeEffectiveGearStats(tierSpec, state.equippedGearStars, false);
  return {
    ok: true,
    reason: null,
    newStars: state.equippedGearStars,
    goldSpent: goldCost,
    atk: nextStats.atk,
    def: nextStats.def,
    hp: nextStats.hp,
  };
}

export function unlockSkillTreeNode(
  state: CapitalAlchemyState,
  nodeId: string,
): { readonly ok: boolean; readonly reason: string | null } {
  const check = canUnlockConstellationNode(nodeId, state.unlockedSkillIds, state.starPoints);
  if (!check.allowed) {
    return { ok: false, reason: check.reason };
  }
  state.starPoints = Math.max(0, state.starPoints - 1);
  state.unlockedSkillIds = [...state.unlockedSkillIds, nodeId];
  return { ok: true, reason: null };
}
