/**
 * File 36 / 100 — 50 BlockCraft Alchemy Cauldron Recipes & 60-Node Constellation Skill Tree.
 * Strictly aligned with `AlchemyRecipe` and `ConstellationSkillNode` in `src/types/saveAndProgression.ts`.
 * Zero `any` types.
 */

import {
  BLOCKCRAFT_50_ALCHEMY_RECIPES,
  create60NodeConstellationTree,
} from '../engine/capitalAlchemyAndSkillTree';
import type { AlchemyRecipe, ConstellationSkillNode } from '../types/saveAndProgression';

export const ALCHEMY_50_RECIPES: ReadonlyArray<AlchemyRecipe> = BLOCKCRAFT_50_ALCHEMY_RECIPES;
export const CONSTELLATION_60_SKILLS: ReadonlyArray<ConstellationSkillNode> = create60NodeConstellationTree();

export function findAlchemyRecipeById(recipeId: string): AlchemyRecipe | null {
  return ALCHEMY_50_RECIPES.find((r) => r.id === recipeId) ?? null;
}

export function findSkillNodeById(nodeId: string): ConstellationSkillNode | null {
  return CONSTELLATION_60_SKILLS.find((n) => n.id === nodeId) ?? null;
}

export function canUnlockConstellationNode(
  nodeId: string,
  unlockedIds: ReadonlyArray<string>,
  availableStarPoints: number,
): { readonly allowed: boolean; readonly reason: string | null } {
  const node = findSkillNodeById(nodeId);
  if (!node) return { allowed: false, reason: 'Unknown constellation node' };
  if (unlockedIds.includes(nodeId)) return { allowed: false, reason: 'Already unlocked' };
  if (availableStarPoints < node.starPointCost) {
    return { allowed: false, reason: `Requires ${node.starPointCost} Star Point(s)` };
  }
  for (let i = 0; i < node.prerequisiteIds.length; i++) {
    if (!unlockedIds.includes(node.prerequisiteIds[i])) {
      return { allowed: false, reason: `Requires prerequisite ${node.prerequisiteIds[i]}` };
    }
  }
  return { allowed: true, reason: null };
}

export function aggregateSkillTreeBonuses(unlockedIds: ReadonlyArray<string>): {
  readonly atkPct: number;
  readonly hpPct: number;
  readonly critPct: number;
  readonly speedPct: number;
  readonly goldPct: number;
  readonly allyPowerPct: number;
  readonly elixirDurationSec: number;
} {
  const set = new Set(unlockedIds);
  let atkPct = 0;
  let hpPct = 0;
  let critPct = 0;
  let speedPct = 0;
  let goldPct = 0;
  let allyPowerPct = 0;
  let elixirDurationSec = 0;

  for (let i = 0; i < CONSTELLATION_60_SKILLS.length; i++) {
    const node = CONSTELLATION_60_SKILLS[i];
    if (!set.has(node.id)) continue;
    switch (node.statKey) {
      case 'atkPct':
        atkPct += node.statValue;
        break;
      case 'hpPct':
        hpPct += node.statValue;
        break;
      case 'critPct':
        critPct += node.statValue;
        break;
      case 'speedPct':
        speedPct += node.statValue;
        break;
      case 'goldPct':
        goldPct += node.statValue;
        break;
      case 'allyPowerPct':
        allyPowerPct += node.statValue;
        break;
      case 'elixirDurationSec':
        elixirDurationSec += node.statValue;
        break;
    }
  }

  return { atkPct, hpPct, critPct, speedPct, goldPct, allyPowerPct, elixirDurationSec };
}
