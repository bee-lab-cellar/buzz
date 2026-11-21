/**
 * Strict Save Vault (V6 iPad-Proof), Gear, Alchemy & Constellation Progression Schemas
 */

import type { HeroId } from './entities';

export type GearRarity =
  | 'common'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'primordial';

export type GearSlot = 'weapon' | 'armor' | 'relic';

export interface GearItem {
  readonly id: string;
  readonly name: string;
  readonly slot: GearSlot;
  readonly tier: number;
  readonly rarity: GearRarity;
  readonly atkBonus: number;
  readonly defBonus: number;
  readonly hpBonus: number;
  readonly critBonus: number;
  starLevel: number; // 0 to 25 (+25★ Star-Up Anvil!)
  isPrimordialMutated: boolean; // 0.02% mutation roll
  readonly description: string;
}

export type AlchemyIngredientId =
  | 'sunleaf_herb'
  | 'moon_petal'
  | 'ember_crystal'
  | 'frost_shard'
  | 'abyssal_pearl'
  | 'clockwork_gear'
  | 'void_dust'
  | 'golden_feather'
  | 'dragon_scale'
  | 'coral_nectar';

export interface AlchemyRecipe {
  readonly id: string;
  readonly name: string;
  readonly category: 'offensive_flask' | 'healing_elixir' | 'buff_tonic' | 'primordial_brew';
  readonly ingredients: ReadonlyArray<{ readonly id: AlchemyIngredientId; readonly qty: number }>;
  readonly goldCost: number;
  readonly effectSummary: string;
  readonly powerValue: number;
  readonly durationSec: number;
  readonly colorHex: string;
}

export type CapitalBuildingId =
  | 'royal_palace'
  | 'star_forge_smithy'
  | 'blockcraft_alchemy_lab'
  | 'cat_knight_barracks'
  | 'dog_alliance_embassy'
  | 'great_duck_observatory'
  | 'fish_market_bazaar'
  | 'arcane_library'
  | 'training_dojo'
  | 'sky_harpoon_armory'
  | 'abyssal_drydock'
  | 'chronos_clocktower';

export interface CapitalBuildingState {
  readonly id: CapitalBuildingId;
  readonly name: string;
  readonly description: string;
  level: number;
  readonly maxLevel: number;
  readonly baseGoldCost: number;
  readonly passiveBonusLabel: string;
  readonly passiveBonusPerLevel: number;
}

export type ConstellationBranch =
  | 'blade_sovereign'
  | 'arcane_starlight'
  | 'iron_guardian'
  | 'swift_shadow'
  | 'alliance_commander'
  | 'omniverse_alchemist';

export interface ConstellationSkillNode {
  readonly id: string;
  readonly branch: ConstellationBranch;
  readonly tier: 1 | 2 | 3 | 4 | 5;
  readonly name: string;
  readonly description: string;
  readonly starPointCost: number;
  readonly prerequisiteIds: ReadonlyArray<string>;
  readonly statKey: 'atkPct' | 'hpPct' | 'critPct' | 'speedPct' | 'goldPct' | 'allyPowerPct' | 'elixirDurationSec';
  readonly statValue: number;
  unlocked: boolean;
}

export interface COTCSavePayloadV6 {
  readonly schemaVersion: 6;
  readonly savedAtIso: string;
  currentAct: number;
  maxUnlockedAct: number;
  clearedActs: number[];
  activeHeroId: HeroId;
  unlockedHeroes: HeroId[];
  level: number;
  xp: number;
  gold: number;
  starPoints: number;
  healthPotions: number;
  hasDuckElixir: boolean;
  nightmareMode: boolean;
  nightmareUnlocked: boolean;
  screenShakeEnabled: boolean;
  muted: boolean;
  equippedWeaponId: string;
  equippedArmorId: string;
  ownedGearIds: string[];
  gearStarLevels: Record<string, number>;
  primordialGearIds: string[];
  capitalBuildingLevels: Record<CapitalBuildingId, number>;
  unlockedSkillNodeIds: string[];
  brewedFlaskCounts: Record<string, number>;
  /** Explicit flag required before any save write may downgrade maxUnlockedAct */
  forceReset?: boolean;
}
