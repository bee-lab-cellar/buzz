/**
 * Layer 2 — 50 Equipment Tiers (Iron -> Primordial Omniverse Gear),
 * 60-Node Constellation Skill Tree, & 50 BlockCraft Alchemy Cauldron Recipes.
 */

import type { EquipmentRarity, EquipmentTier, EquipmentTierSpec } from '../types/combat';
import {
  BLOCKCRAFT_50_ALCHEMY_RECIPES,
  create60NodeConstellationTree,
} from '../engine/capitalAlchemyAndSkillTree';

const TIER_PREFIXES: ReadonlyArray<string> = [
  'Iron', 'Tempered Steel', 'Oak-Rune', 'Moss-Silver', 'Starlight Apprentice',
  'Whisker-Guard', 'Emerald Knight', 'Lotus-Blessed', 'Sun-Crown', 'Fenrir-Bane',
  'Trench-Iron', 'Wolf-Fang', 'Battering-Plate', 'Siege-Lord', 'Treaty-Forged',
  'Cinder-Scale', 'Wyrm-Slayer', 'Harpoon-Steel', 'Obsidian-Flame', 'Bahamut-Aegis',
  'Coral-Edge', 'Trident-Steel', 'Siren-Weave', 'Kraken-Severer', 'Charybdis-Tide',
  'Brass-Cog', 'Steam-Piston', 'Tesla-Coil', 'Horologium', 'Chronos-Prime',
  'Basalt-Core', 'Magma-Quenched', 'Hellfire-Crucible', 'Caldera-Lord', 'Vulcan-Heart',
  'Rime-Crystal', 'Glacier-Plate', 'Aurora-Prism', 'Permafrost', 'Borealis-Zero',
  'Gale-Feather', 'Cloud-Strider', 'Tempest-Talon', 'Hurricane-Eye', 'Zephyrus-Wing',
  'Mirror-Glass', 'Umbral-Echo', 'Event-Horizon', 'Quasar-Crown', 'Primordial Omniverse',
];

function rarityForTier(tier: number): EquipmentRarity {
  if (tier <= 6) return 'common';
  if (tier <= 14) return 'uncommon';
  if (tier <= 22) return 'rare';
  if (tier <= 32) return 'epic';
  if (tier <= 40) return 'legendary';
  if (tier <= 47) return 'mythic';
  return 'primordial';
}

export const WEAPONS_50_TIERS: ReadonlyArray<EquipmentTierSpec> = TIER_PREFIXES.map((prefix, idx) => {
  const tier = (idx + 1) as EquipmentTier;
  return {
    tier,
    id: `wpn_tier_${tier}`,
    name: `${prefix} Star-Blade`,
    slot: 'weapon',
    rarity: rarityForTier(tier),
    atkBonus: Math.round(14 + tier * 24 + tier * tier * 1.85),
    defBonus: Math.round(tier * 2.5),
    hpBonus: Math.round(tier * 18),
    starLevel: 0,
    primordialMutated: tier >= 48,
  };
});

export const ARMORS_50_TIERS: ReadonlyArray<EquipmentTierSpec> = TIER_PREFIXES.map((prefix, idx) => {
  const tier = (idx + 1) as EquipmentTier;
  return {
    tier,
    id: `arm_tier_${tier}`,
    name: `${prefix} Royal Mantle`,
    slot: 'armor',
    rarity: rarityForTier(tier),
    atkBonus: Math.round(tier * 3.5),
    defBonus: Math.round(10 + tier * 16 + tier * tier * 1.1),
    hpBonus: Math.round(45 + tier * 68 + tier * tier * 4.2),
    starLevel: 0,
    primordialMutated: tier >= 48,
  };
});

export const ALL_100_GEAR_TIERS: ReadonlyArray<EquipmentTierSpec> = [
  ...WEAPONS_50_TIERS,
  ...ARMORS_50_TIERS,
];

export const OMNIVERSE_50_ALCHEMY_RECIPES = BLOCKCRAFT_50_ALCHEMY_RECIPES;
export const OMNIVERSE_60_CONSTELLATION_NODES = create60NodeConstellationTree();

export function getRecommendedGearTierForAct(actId: number): EquipmentTier {
  const clamped = Math.max(1, Math.min(1000, Math.floor(actId)));
  return Math.max(1, Math.min(50, Math.ceil(clamped / 20))) as EquipmentTier;
}
