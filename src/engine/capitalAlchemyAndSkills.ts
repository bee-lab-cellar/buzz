/**
 * Pillar 2 — Capital Hub (12 Buildings), Interactive BlockCraft 3D Voxel Cauldron (50+ Recipes),
 * Star-Up Anvil (+25★ & 0.02% Primordial Animated Gradient Mutations), & 60-Node Constellation Tree.
 */

import {
  BLOCKCRAFT_50_ALCHEMY_RECIPES,
  INITIAL_12_CAPITAL_BUILDINGS,
  MAX_GEAR_STAR_LEVEL,
  PRIMORDIAL_MUTATION_CHANCE,
  create60NodeConstellationTree,
  getBuildingUpgradeCost,
  starUpGearAtAnvil,
  upgradeCapitalBuilding,
} from './capitalAlchemyAndSkillTree';

export interface VoxelCauldronBubble {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly colorHex: string;
  readonly sizePx: number;
}

export interface PrimordialGradientSpec {
  readonly stops: ReadonlyArray<string>;
  readonly cycleSpeedHz: number;
  readonly mutationProbability: number;
}

export const PRIMORDIAL_ANIMATED_GRADIENT: PrimordialGradientSpec = {
  stops: ['#fde047', '#f472b6', '#38bdf8', '#c084fc', '#fde047'],
  cycleSpeedHz: 1.4,
  mutationProbability: PRIMORDIAL_MUTATION_CHANCE,
};

/**
 * Generates deterministic 3D voxel bubbles rising from the BlockCraft Alchemy Cauldron.
 */
export function sampleBlockCraftCauldronVoxels(
  timeSec: number,
  brewColorHex: string,
  bubbleCount = 8,
): VoxelCauldronBubble[] {
  const voxels: VoxelCauldronBubble[] = [];
  for (let i = 0; i < bubbleCount; i++) {
    const phase = (timeSec * 0.9 + i / bubbleCount) % 1;
    const angle = i * 2.1 + timeSec * 1.5;
    voxels.push({
      x: Math.cos(angle) * (6 + phase * 5),
      y: -phase * 24,
      z: Math.sin(angle) * 6,
      colorHex: brewColorHex,
      sizePx: Math.max(2, Math.round(5 * (1 - phase * 0.55))),
    });
  }
  return voxels;
}

export {
  BLOCKCRAFT_50_ALCHEMY_RECIPES,
  INITIAL_12_CAPITAL_BUILDINGS,
  MAX_GEAR_STAR_LEVEL,
  PRIMORDIAL_MUTATION_CHANCE,
  create60NodeConstellationTree,
  getBuildingUpgradeCost,
  starUpGearAtAnvil,
  upgradeCapitalBuilding,
};
