/**
 * File 39 / 100 — 12 Felis-Fang United Capital Buildings Data & Passive Bonuses.
 * Strictly aligned with `CapitalBuildingId` in `src/types/saveAndProgression.ts`. Zero `any` types.
 */

import type { CapitalBuildingId, CapitalBuildingState } from '../types/saveAndProgression';

export const CAPITAL_12_BUILDINGS: ReadonlyArray<Omit<CapitalBuildingState, 'level'>> = [
  { id: 'royal_palace', name: 'Royal Lion Palace', maxLevel: 10, baseGoldCost: 200, description: 'Seat of the United Cat & Dog Alliance.', passiveBonusLabel: '+6% Max HP per level', passiveBonusPerLevel: 6 },
  { id: 'star_forge_smithy', name: 'Star-Forge Smithy', maxLevel: 10, baseGoldCost: 240, description: 'Master Forgepaw’s +25★ Star-Up Anvil.', passiveBonusLabel: '+5% Weapon ATK per level', passiveBonusPerLevel: 5 },
  { id: 'blockcraft_alchemy_lab', name: 'BlockCraft Alchemy Lab', maxLevel: 10, baseGoldCost: 220, description: 'Houses the 3D Hollow BlockCraft Cauldron.', passiveBonusLabel: '+8% Flask Potency per level', passiveBonusPerLevel: 8 },
  { id: 'cat_knight_barracks', name: 'Cat-Knight Barracks', maxLevel: 10, baseGoldCost: 210, description: 'Trains diverse 6-coat allied feline knights.', passiveBonusLabel: '+6% Allied Cat HP per level', passiveBonusPerLevel: 6 },
  { id: 'dog_alliance_embassy', name: 'Reformed Dog Embassy', maxLevel: 10, baseGoldCost: 260, description: 'Fenrir’s vanguard hall for allied hounds.', passiveBonusLabel: '+5% Squad Crit per level', passiveBonusPerLevel: 5 },
  { id: 'great_duck_observatory', name: 'Great Duck Observatory', maxLevel: 10, baseGoldCost: 300, description: 'Channels Starlight for 60-Node Constellation skills.', passiveBonusLabel: '+4% Star Point gain per level', passiveBonusPerLevel: 4 },
  { id: 'fish_market_bazaar', name: 'Golden Fish Bazaar', maxLevel: 10, baseGoldCost: 180, description: 'Supplies healing fish rations for every expedition.', passiveBonusLabel: '+10% Potion Heal per level', passiveBonusPerLevel: 10 },
  { id: 'arcane_library', name: 'Starlight Arcane Library', maxLevel: 10, baseGoldCost: 250, description: 'Archives all 100 Boss codices and 10 Sanctuaries.', passiveBonusLabel: '+5% Arcane Spell DMG per level', passiveBonusPerLevel: 5 },
  { id: 'training_dojo', name: 'Counter-Stance Dojo', maxLevel: 10, baseGoldCost: 230, description: 'Sharpens 2.5x Perfect-Dodge Backstab timing.', passiveBonusLabel: '+4% Counter Crit DMG per level', passiveBonusPerLevel: 4 },
  { id: 'sky_harpoon_armory', name: 'Sky Harpoon Armory', maxLevel: 10, baseGoldCost: 290, description: 'Calibrates anti-dragon & kraken siege ballistas.', passiveBonusLabel: '+7% Boss Part Break DMG', passiveBonusPerLevel: 7 },
  { id: 'abyssal_drydock', name: 'Abyssal Coral Drydock', maxLevel: 10, baseGoldCost: 280, description: 'Supplies underwater oxygen vents & pearl trade.', passiveBonusLabel: '+10% Gold Drop per level', passiveBonusPerLevel: 10 },
  { id: 'chronos_clocktower', name: 'Chronos Eclipse Tower', maxLevel: 10, baseGoldCost: 450, description: 'Links all 10 Sanctuaries & preserves V8 saves.', passiveBonusLabel: '+4% All Stats per level', passiveBonusPerLevel: 4 },
];

export function getCapitalBuildingUpgradeCost(id: CapitalBuildingId, currentLevel: number): number {
  const spec = CAPITAL_12_BUILDINGS.find((b) => b.id === id);
  const base = spec?.baseGoldCost ?? 250;
  return Math.round(base * Math.pow(1.32, Math.max(0, currentLevel)));
}
