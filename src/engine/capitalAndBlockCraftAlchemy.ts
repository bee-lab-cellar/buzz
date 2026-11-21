import {
  CAPITAL_BUILDINGS,
  computeCapitalBonuses,
  createInitialCapitalBuildings,
  createInitialKingdomResources,
  getBuildingStageLabel,
  getBuildingUpgradeCost,
  type CapitalBuildingDef,
} from '../game/kingdomBuilderEngine';
import {
  ALCHEMY_INGREDIENTS,
  BREWABLE_POTION_CATALOG,
  ELEMENTAL_GEMS,
  WEAPON_MUTATIONS,
  createStarterBrewedPotions,
  resolveCauldronRecipe,
  type AlchemyIngredientDef,
} from '../game/alchemyForgeEngine';
import {
  CAPITAL_BUILDING_MATRICES_24X24,
  getCachedStaticMatrixCanvas,
  getCapitalBuildingSpriteMatrix,
} from '../sprites/index';
import type { BrewedPotionItem, CapitalBuildingId, KingdomResources } from '../game/types';

export {
  ALCHEMY_INGREDIENTS,
  BREWABLE_POTION_CATALOG,
  CAPITAL_BUILDINGS,
  CAPITAL_BUILDING_MATRICES_24X24,
  ELEMENTAL_GEMS,
  WEAPON_MUTATIONS,
  computeCapitalBonuses,
  createInitialCapitalBuildings,
  createInitialKingdomResources,
  createStarterBrewedPotions,
  getBuildingStageLabel,
  getBuildingUpgradeCost,
  getCapitalBuildingSpriteMatrix,
  resolveCauldronRecipe,
};
export type { AlchemyIngredientDef, CapitalBuildingDef };

export interface CapitalPassiveYieldOutcome {
  goldEarned: number;
  woodEarned: number;
  ironEarned: number;
}

export function computePassiveCapitalTick(
  buildings: Record<CapitalBuildingId, number>,
  elapsedMinutes: number
): CapitalPassiveYieldOutcome {
  const quarryLv = Math.max(1, buildings?.minecart_quarry ?? 1);
  const lumberLv = Math.max(1, buildings?.lumber_mill ?? 1);
  const scale = Math.max(0, elapsedMinutes);
  return {
    goldEarned: Math.floor(25 * lumberLv * scale),
    woodEarned: Math.floor(4 * lumberLv * scale),
    ironEarned: Math.floor(3 * quarryLv * scale),
  };
}

export function applyPassiveCapitalResources(
  resources: KingdomResources,
  buildings: Record<CapitalBuildingId, number>,
  elapsedMinutes: number
): { resources: KingdomResources; goldEarned: number } {
  const yieldOutcome = computePassiveCapitalTick(buildings, elapsedMinutes);
  return {
    goldEarned: yieldOutcome.goldEarned,
    resources: {
      ...resources,
      wood: resources.wood + yieldOutcome.woodEarned,
      iron: resources.iron + yieldOutcome.ironEarned,
    },
  };
}

export function brewAndComputeFlaskPower(
  ing1: string,
  ing2: string,
  ing3: string,
  buildings: Record<CapitalBuildingId, number>
): { recipe: Omit<BrewedPotionItem, 'count'>; batchCount: number; boostedPower: number } {
  const recipe = resolveCauldronRecipe(ing1, ing2, ing3);
  const bonuses = computeCapitalBonuses(buildings);
  const breweryLv = Math.max(1, buildings?.alchemy_brewery ?? 1);
  return {
    recipe,
    batchCount: Math.min(5, 1 + Math.floor((breweryLv - 1) / 2)),
    boostedPower: Math.round(recipe.power * bonuses.potionMult),
  };
}

export function getCapitalBuildingPreviewCanvas(id: CapitalBuildingId): HTMLCanvasElement | null {
  return getCachedStaticMatrixCanvas(getCapitalBuildingSpriteMatrix(id));
}
