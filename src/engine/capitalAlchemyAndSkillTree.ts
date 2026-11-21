/**
 * Layer 4 — Capital Hub (12 Upgradable Buildings), BlockCraft Alchemy (50+ Recipes),
 * Star-Up Anvil (+25★ & 0.02% Primordial Mutation), & 60-Node Constellation Skill Tree.
 */

import type {
  AlchemyIngredientId,
  AlchemyRecipe,
  CapitalBuildingId,
  CapitalBuildingState,
  ConstellationBranch,
  ConstellationSkillNode,
  GearItem,
} from '../types/saveAndProgression';

export const PRIMORDIAL_MUTATION_CHANCE = 0.0002; // 0.02% mutation roll
export const MAX_GEAR_STAR_LEVEL = 25;

export const INITIAL_12_CAPITAL_BUILDINGS: ReadonlyArray<CapitalBuildingState> = [
  { id: 'royal_palace', name: 'Royal Cat Palace', description: 'Boosts global Gold & XP rewards.', level: 1, maxLevel: 10, baseGoldCost: 150, passiveBonusLabel: '+8% Gold/Lv', passiveBonusPerLevel: 8 },
  { id: 'star_forge_smithy', name: 'Star-Forge Smithy', description: 'Unlocks +25★ Star-Up forging & Primordial rolls.', level: 1, maxLevel: 10, baseGoldCost: 180, passiveBonusLabel: '+6% ATK/Lv', passiveBonusPerLevel: 6 },
  { id: 'blockcraft_alchemy_lab', name: 'BlockCraft Alchemy Lab', description: 'Brews 50+ elemental flasks & boss elixirs.', level: 1, maxLevel: 10, baseGoldCost: 160, passiveBonusLabel: '+10% Brew Power/Lv', passiveBonusPerLevel: 10 },
  { id: 'cat_knight_barracks', name: 'Cat-Knight Barracks', description: 'Strengthens Allied Cat Knights & Archers.', level: 1, maxLevel: 10, baseGoldCost: 140, passiveBonusLabel: '+12% Cat Ally HP/Lv', passiveBonusPerLevel: 12 },
  { id: 'dog_alliance_embassy', name: 'Dog Alliance Embassy', description: 'Calls Bulldog, Doberman & Husky allies in Arc II+.', level: 1, maxLevel: 10, baseGoldCost: 220, passiveBonusLabel: '+12% Dog Ally ATK/Lv', passiveBonusPerLevel: 12 },
  { id: 'great_duck_observatory', name: 'Great Duck Observatory', description: 'Extends Great Duck Elixir & Golden Feather drops.', level: 1, maxLevel: 10, baseGoldCost: 240, passiveBonusLabel: '+1.5s Elixir/Lv', passiveBonusPerLevel: 1.5 },
  { id: 'fish_market_bazaar', name: 'Fish Market Bazaar', description: 'Generates passive Salmon & Healing Fish stocks.', level: 1, maxLevel: 10, baseGoldCost: 120, passiveBonusLabel: '+15% Potion Heal/Lv', passiveBonusPerLevel: 15 },
  { id: 'arcane_library', name: 'Arcane Starlight Library', description: 'Boosts Nyx & Mage spell damage.', level: 1, maxLevel: 10, baseGoldCost: 190, passiveBonusLabel: '+7% Spell DMG/Lv', passiveBonusPerLevel: 7 },
  { id: 'training_dojo', name: 'Royal Training Dojo', description: 'Improves Backstab Crit & Dodge window.', level: 1, maxLevel: 10, baseGoldCost: 130, passiveBonusLabel: '+2% Crit/Lv', passiveBonusPerLevel: 2 },
  { id: 'sky_harpoon_armory', name: 'Sky-Harpoon Armory', description: 'Speeds up Arc III Dragon Ballista reload.', level: 1, maxLevel: 10, baseGoldCost: 260, passiveBonusLabel: '-8% Ballista CD/Lv', passiveBonusPerLevel: 8 },
  { id: 'abyssal_drydock', name: 'Abyssal Kraken Drydock', description: 'Boosts Kraken Tentacle Weak-Spot slice damage.', level: 1, maxLevel: 10, baseGoldCost: 280, passiveBonusLabel: '+10% Weak-Spot DMG/Lv', passiveBonusPerLevel: 10 },
  { id: 'chronos_clocktower', name: 'Chronos Clocktower', description: 'Reduces skill & war-horn cooldowns across all 300 Acts.', level: 1, maxLevel: 10, baseGoldCost: 320, passiveBonusLabel: '-4% Cooldowns/Lv', passiveBonusPerLevel: 4 },
];

interface RecipeSeed {
  readonly id: string;
  readonly name: string;
  readonly category: AlchemyRecipe['category'];
  readonly a: AlchemyIngredientId;
  readonly b: AlchemyIngredientId;
  readonly cost: number;
  readonly power: number;
  readonly dur: number;
  readonly color: string;
  readonly summary: string;
}

const ALCHEMY_50_SEEDS: ReadonlyArray<RecipeSeed> = [
  { id: 'brew_01', name: 'Sunleaf Healing Draught', category: 'healing_elixir', a: 'sunleaf_herb', b: 'coral_nectar', cost: 25, power: 55, dur: 0, color: '#22c55e', summary: 'Restores 55% Max HP instantly.' },
  { id: 'brew_02', name: 'Moonpetal Mana Dew', category: 'buff_tonic', a: 'moon_petal', b: 'sunleaf_herb', cost: 30, power: 40, dur: 20, color: '#38bdf8', summary: '+40% Arcane Regen for 20s.' },
  { id: 'brew_03', name: 'Emberburst Bomb Flask', category: 'offensive_flask', a: 'ember_crystal', b: 'sunleaf_herb', cost: 35, power: 120, dur: 4, color: '#f97316', summary: 'Ignites enemies for 120 burn DMG.' },
  { id: 'brew_04', name: 'Glacier Shard Vial', category: 'offensive_flask', a: 'frost_shard', b: 'moon_petal', cost: 40, power: 110, dur: 5, color: '#7dd3fc', summary: 'Freezes enemies in a 60px ring.' },
  { id: 'brew_05', name: 'Abyssal Pearl Tonic', category: 'buff_tonic', a: 'abyssal_pearl', b: 'coral_nectar', cost: 55, power: 35, dur: 25, color: '#06b6d4', summary: '+35% Kraken Weak-Spot Crit.' },
  { id: 'brew_06', name: 'Clockwork Overdrive Oil', category: 'buff_tonic', a: 'clockwork_gear', b: 'ember_crystal', cost: 65, power: 30, dur: 22, color: '#eab308', summary: '+30% Attack & Move Speed.' },
  { id: 'brew_07', name: 'Void-Dust Blink Brew', category: 'buff_tonic', a: 'void_dust', b: 'moon_petal', cost: 75, power: 45, dur: 18, color: '#a855f7', summary: 'Zero-cooldown phase dash.' },
  { id: 'brew_08', name: 'Golden Feather Nectar', category: 'primordial_brew', a: 'golden_feather', b: 'sunleaf_herb', cost: 120, power: 100, dur: 20, color: '#fde047', summary: 'Refills Great Duck Elixir gauge.' },
  { id: 'brew_09', name: 'Dragonscale Bulwark Tonic', category: 'buff_tonic', a: 'dragon_scale', b: 'ember_crystal', cost: 90, power: 50, dur: 30, color: '#ef4444', summary: '+50% Armor & Knockback Immunity.' },
  { id: 'brew_10', name: 'Coral Reef Regen Stew', category: 'healing_elixir', a: 'coral_nectar', b: 'abyssal_pearl', cost: 60, power: 80, dur: 10, color: '#2dd4bf', summary: 'Regenerates 80% HP over 10s.' },
  { id: 'brew_11', name: 'Solar Flare Grenade', category: 'offensive_flask', a: 'ember_crystal', b: 'golden_feather', cost: 85, power: 220, dur: 3, color: '#fbbf24', summary: 'Blinding 220 AoE solar blast.' },
  { id: 'brew_12', name: 'Permafrost Nova Flask', category: 'offensive_flask', a: 'frost_shard', b: 'abyssal_pearl', cost: 80, power: 195, dur: 6, color: '#0ea5e9', summary: 'Shatters shields with frost.' },
  { id: 'brew_13', name: 'Starlight Fang Venom', category: 'offensive_flask', a: 'moon_petal', b: 'void_dust', cost: 95, power: 240, dur: 8, color: '#c084fc', summary: 'Coats blade in astral poison.' },
  { id: 'brew_14', name: 'Steam-Press Shock Jar', category: 'offensive_flask', a: 'clockwork_gear', b: 'frost_shard', cost: 70, power: 180, dur: 4, color: '#94a3b8', summary: 'Stuns mechanical enemies 4s.' },
  { id: 'brew_15', name: 'Catnip Berserk Brew', category: 'buff_tonic', a: 'sunleaf_herb', b: 'ember_crystal', cost: 45, power: 40, dur: 20, color: '#fb7185', summary: '+40% Crit Chance for all Cats.' },
  { id: 'brew_16', name: 'Wolf-Blood Howl Elixir', category: 'buff_tonic', a: 'frost_shard', b: 'dragon_scale', cost: 85, power: 45, dur: 25, color: '#60a5fa', summary: 'Boosts Fenrir & Wolf allies.' },
  { id: 'brew_17', name: 'Lionheart Crown Draught', category: 'healing_elixir', a: 'golden_feather', b: 'dragon_scale', cost: 110, power: 100, dur: 15, color: '#f59e0b', summary: 'Full heal + 15s Royal Shield.' },
  { id: 'brew_18', name: 'Tidebreaker Harpoon Oil', category: 'buff_tonic', a: 'abyssal_pearl', b: 'clockwork_gear', cost: 75, power: 60, dur: 25, color: '#0284c7', summary: '+60% Ballista & Tentacle DMG.' },
  { id: 'brew_19', name: 'Chrono-Sand Hourglass Brew', category: 'primordial_brew', a: 'clockwork_gear', b: 'void_dust', cost: 130, power: 50, dur: 14, color: '#818cf8', summary: 'Slows boss attacks by 50%.' },
  { id: 'brew_20', name: 'Nebula Singularity Flask', category: 'offensive_flask', a: 'void_dust', b: 'dragon_scale', cost: 140, power: 340, dur: 5, color: '#7e22ce', summary: 'Pulls enemies into void vortex.' },
  { id: 'brew_21', name: 'Emerald Meadow Balm', category: 'healing_elixir', a: 'sunleaf_herb', b: 'sunleaf_herb', cost: 20, power: 40, dur: 0, color: '#4ade80', summary: 'Fast 40% HP field bandage.' },
  { id: 'brew_22', name: 'Silver Moon Reflection Tonic', category: 'buff_tonic', a: 'moon_petal', b: 'moon_petal', cost: 50, power: 35, dur: 20, color: '#e2e8f0', summary: 'Reflects 35% projectile DMG.' },
  { id: 'brew_23', name: 'Magma Core Molotov', category: 'offensive_flask', a: 'ember_crystal', b: 'dragon_scale', cost: 95, power: 260, dur: 6, color: '#dc2626', summary: 'Leaves molten pool for 6s.' },
  { id: 'brew_24', name: 'Blizzard Cloak Potion', category: 'buff_tonic', a: 'frost_shard', b: 'sunleaf_herb', cost: 55, power: 30, dur: 24, color: '#bae6fd', summary: 'Chills attackers on contact.' },
  { id: 'brew_25', name: 'Siren Song Antidote', category: 'healing_elixir', a: 'coral_nectar', b: 'moon_petal', cost: 50, power: 60, dur: 0, color: '#34d399', summary: 'Cleanses slow, ink & poison.' },
  { id: 'brew_26', name: 'Brass Golem Armor Polish', category: 'buff_tonic', a: 'clockwork_gear', b: 'dragon_scale', cost: 90, power: 55, dur: 28, color: '#d97706', summary: '+55 Defense & Trap resistance.' },
  { id: 'brew_27', name: 'Eclipse Shadow Ink', category: 'buff_tonic', a: 'void_dust', b: 'coral_nectar', cost: 85, power: 200, dur: 12, color: '#4c1d95', summary: 'Grants instant 2.0x Ambush.' },
  { id: 'brew_28', name: 'Phoenix Duck Feather Tonic', category: 'primordial_brew', a: 'golden_feather', b: 'ember_crystal', cost: 160, power: 100, dur: 60, color: '#facc15', summary: 'Auto-revives once with 100% HP.' },
  { id: 'brew_29', name: 'Wyvern Wing Zephyr Vial', category: 'buff_tonic', a: 'dragon_scale', b: 'moon_petal', cost: 80, power: 35, dur: 25, color: '#2dd4bf', summary: '+35% Jump & Plunge DMG.' },
  { id: 'brew_30', name: 'Kraken Ink Smoke Bomb', category: 'offensive_flask', a: 'abyssal_pearl', b: 'void_dust', cost: 90, power: 170, dur: 6, color: '#312e81', summary: 'Blinds enemies & grants crits.' },
  { id: 'brew_31', name: 'Royal Honey Salmon Broth', category: 'healing_elixir', a: 'sunleaf_herb', b: 'golden_feather', cost: 65, power: 90, dur: 0, color: '#fbbf24', summary: 'Restores 90% HP & Stamina.' },
  { id: 'brew_32', name: 'Arcane Comet Vial', category: 'offensive_flask', a: 'moon_petal', b: 'ember_crystal', cost: 70, power: 210, dur: 2, color: '#6366f1', summary: 'Calls 3 falling starlight bolts.' },
  { id: 'brew_33', name: 'Thundercoil Tesla Flask', category: 'offensive_flask', a: 'clockwork_gear', b: 'abyssal_pearl', cost: 85, power: 230, dur: 4, color: '#22d3ee', summary: 'Chains lightning to 6 foes.' },
  { id: 'brew_34', name: 'Crystalline Frost Shield', category: 'buff_tonic', a: 'frost_shard', b: 'golden_feather', cost: 95, power: 75, dur: 18, color: '#38bdf8', summary: 'Absorbs 75% Max HP barrier.' },
  { id: 'brew_35', name: 'Crimson War-Horn Mead', category: 'buff_tonic', a: 'ember_crystal', b: 'coral_nectar', cost: 60, power: 50, dur: 20, color: '#f43f5e', summary: '+50% Allied Squad Attack.' },
  { id: 'brew_36', name: 'Deep-Sea Oxygen Draught', category: 'buff_tonic', a: 'coral_nectar', b: 'frost_shard', cost: 55, power: 100, dur: 35, color: '#06b6d4', summary: 'Full swim speed in Arc IV.' },
  { id: 'brew_37', name: 'Star-Forge Liquid Metal', category: 'primordial_brew', a: 'clockwork_gear', b: 'golden_feather', cost: 150, power: 65, dur: 30, color: '#fde047', summary: '+65% Weapon ATK for 30s.' },
  { id: 'brew_38', name: 'Astral Prism Laser Jar', category: 'offensive_flask', a: 'void_dust', b: 'ember_crystal', cost: 115, power: 300, dur: 3, color: '#e879f9', summary: 'Fires piercing void beam.' },
  { id: 'brew_39', name: 'Emerald Lotus Recovery', category: 'healing_elixir', a: 'sunleaf_herb', b: 'abyssal_pearl', cost: 70, power: 85, dur: 8, color: '#10b981', summary: 'Heals Hero & all nearby allies.' },
  { id: 'brew_40', name: 'Dragonfire Breath Flask', category: 'offensive_flask', a: 'dragon_scale', b: 'golden_feather', cost: 135, power: 320, dur: 5, color: '#ea580c', summary: 'Cone of sovereign dragonfire.' },
  { id: 'brew_41', name: 'Glacial Spear Infusion', category: 'buff_tonic', a: 'frost_shard', b: 'clockwork_gear', cost: 75, power: 45, dur: 22, color: '#60a5fa', summary: 'Melee hits fire ice lances.' },
  { id: 'brew_42', name: 'Tidal Surge Vial', category: 'offensive_flask', a: 'abyssal_pearl', b: 'sunleaf_herb', cost: 60, power: 165, dur: 3, color: '#0ea5e9', summary: 'Knocks back enemy waves.' },
  { id: 'brew_43', name: 'Gilded Treasury Tonic', category: 'buff_tonic', a: 'golden_feather', b: 'coral_nectar', cost: 90, power: 100, dur: 45, color: '#eab308', summary: 'Double Gold drops for 45s.' },
  { id: 'brew_44', name: 'Phantom Assassin Draught', category: 'buff_tonic', a: 'void_dust', b: 'frost_shard', cost: 105, power: 250, dur: 16, color: '#a855f7', summary: 'Backstab crits deal 3.0x DMG.' },
  { id: 'brew_45', name: 'Iron-Paw Fortress Brew', category: 'buff_tonic', a: 'dragon_scale', b: 'sunleaf_herb', cost: 70, power: 40, dur: 30, color: '#94a3b8', summary: 'Reduces trap damage by 70%.' },
  { id: 'brew_46', name: 'Clockwork Repair Serum', category: 'healing_elixir', a: 'clockwork_gear', b: 'coral_nectar', cost: 75, power: 75, dur: 0, color: '#f59e0b', summary: 'Heals 75% HP & resets skills.' },
  { id: 'brew_47', name: 'Moonlit Sovereign Cordial', category: 'healing_elixir', a: 'moon_petal', b: 'golden_feather', cost: 120, power: 100, dur: 20, color: '#c4b5fd', summary: 'Full heal + +30% Crit.' },
  { id: 'brew_48', name: 'Void-Breaker Catalyst', category: 'primordial_brew', a: 'void_dust', b: 'golden_feather', cost: 190, power: 150, dur: 20, color: '#d946ef', summary: 'Shatters Arc VI Void shields.' },
  { id: 'brew_49', name: 'Sovereign Dragon Elixir', category: 'primordial_brew', a: 'dragon_scale', b: 'abyssal_pearl', cost: 175, power: 120, dur: 25, color: '#f43f5e', summary: '+120% ATK & fire aura.' },
  { id: 'brew_50', name: 'Omniverse Crown Ambrosia', category: 'primordial_brew', a: 'golden_feather', b: 'void_dust', cost: 250, power: 200, dur: 30, color: '#fef08a', summary: 'Maxes all stats + Golden Aura.' },
];

export const BLOCKCRAFT_50_ALCHEMY_RECIPES: ReadonlyArray<AlchemyRecipe> = ALCHEMY_50_SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  ingredients: [
    { id: s.a, qty: 2 },
    { id: s.b, qty: 1 },
  ],
  goldCost: s.cost,
  effectSummary: s.summary,
  powerValue: s.power,
  durationSec: s.dur,
  colorHex: s.color,
}));

export function starUpGearAtAnvil(
  item: GearItem,
  playerGold: number,
  randomRoll = Math.random(),
): {
  readonly success: boolean;
  readonly goldSpent: number;
  readonly primordialTriggered: boolean;
  readonly newStarLevel: number;
} {
  if (item.starLevel >= MAX_GEAR_STAR_LEVEL) {
    return { success: false, goldSpent: 0, primordialTriggered: false, newStarLevel: item.starLevel };
  }
  const cost = Math.round(45 * Math.pow(1.22, item.starLevel));
  if (playerGold < cost) {
    return { success: false, goldSpent: 0, primordialTriggered: false, newStarLevel: item.starLevel };
  }

  item.starLevel += 1;
  const primordialTriggered = !item.isPrimordialMutated && randomRoll < PRIMORDIAL_MUTATION_CHANCE;
  if (primordialTriggered) {
    item.isPrimordialMutated = true;
  }

  return {
    success: true,
    goldSpent: cost,
    primordialTriggered,
    newStarLevel: item.starLevel,
  };
}

export function create60NodeConstellationTree(): ConstellationSkillNode[] {
  const branches: ReadonlyArray<{
    readonly branch: ConstellationBranch;
    readonly label: string;
    readonly statKey: ConstellationSkillNode['statKey'];
    readonly baseValue: number;
  }> = [
    { branch: 'blade_sovereign', label: 'Blade Sovereign', statKey: 'atkPct', baseValue: 5 },
    { branch: 'arcane_starlight', label: 'Arcane Starlight', statKey: 'critPct', baseValue: 2.5 },
    { branch: 'iron_guardian', label: 'Iron Guardian', statKey: 'hpPct', baseValue: 7 },
    { branch: 'swift_shadow', label: 'Swift Shadow', statKey: 'speedPct', baseValue: 3 },
    { branch: 'alliance_commander', label: 'Alliance Commander', statKey: 'allyPowerPct', baseValue: 8 },
    { branch: 'omniverse_alchemist', label: 'Omniverse Alchemist', statKey: 'elixirDurationSec', baseValue: 1.2 },
  ];

  const nodes: ConstellationSkillNode[] = [];
  for (let b = 0; b < branches.length; b++) {
    const spec = branches[b];
    for (let idx = 1; idx <= 10; idx++) {
      const tier = Math.min(5, Math.ceil(idx / 2)) as 1 | 2 | 3 | 4 | 5;
      const id = `${spec.branch}_node_${idx}`;
      const prevId = idx > 1 ? `${spec.branch}_node_${idx - 1}` : null;
      nodes.push({
        id,
        branch: spec.branch,
        tier,
        name: `${spec.label} Star ${idx}`,
        description: `Grants +${(spec.baseValue * (1 + (tier - 1) * 0.25)).toFixed(1)} ${spec.statKey}.`,
        starPointCost: tier,
        prerequisiteIds: prevId ? [prevId] : [],
        statKey: spec.statKey,
        statValue: Number((spec.baseValue * (1 + (tier - 1) * 0.25)).toFixed(2)),
        unlocked: false,
      });
    }
  }
  return nodes;
}

export function getBuildingUpgradeCost(building: CapitalBuildingState): number {
  return Math.round(building.baseGoldCost * Math.pow(1.45, building.level - 1));
}

export function upgradeCapitalBuilding(
  buildings: CapitalBuildingState[],
  id: CapitalBuildingId,
  playerGold: number,
): { readonly upgraded: boolean; readonly goldSpent: number; readonly newLevel: number } {
  const target = buildings.find((b) => b.id === id);
  if (!target || target.level >= target.maxLevel) {
    return { upgraded: false, goldSpent: 0, newLevel: target?.level ?? 0 };
  }
  const cost = getBuildingUpgradeCost(target);
  if (playerGold < cost) {
    return { upgraded: false, goldSpent: 0, newLevel: target.level };
  }
  target.level += 1;
  return { upgraded: true, goldSpent: cost, newLevel: target.level };
}
