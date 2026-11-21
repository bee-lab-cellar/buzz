import { CapitalBuildingId, KingdomResources } from './types';

export interface CapitalBuildingDef {
  id: CapitalBuildingId;
  name: string;
  icon: string;
  category: 'forge' | 'alchemy' | 'military' | 'economy' | 'sanctuary';
  description: string;
  bonusPerLevelText: string;
  baseGoldCost: number;
  baseWoodCost: number;
  baseIronCost: number;
}

export const CAPITAL_BUILDINGS: CapitalBuildingDef[] = [
  {
    id: 'alchemy_brewery',
    name: "Nyx's BlockCraft Alchemy Brewery",
    icon: '⚗️',
    category: 'alchemy',
    description: '3D Voxel Cauldron where Nyx stirs biome catalysts to brew elemental combat flasks [F].',
    bonusPerLevelText: '+10% Alchemy Flask Damage & +1 Max Brew Batch per level',
    baseGoldCost: 120,
    baseWoodCost: 15,
    baseIronCost: 10,
  },
  {
    id: 'star_anvil_forge',
    name: 'Master Blacksmith Star-Up Anvil',
    icon: '🔨',
    category: 'forge',
    description: 'Reforges weapons up to +25★, sockets Elemental Gems, and rolls Primordial Mutations!',
    bonusPerLevelText: '+4% Total Weapon ATK & higher Primordial Mutation luck per level',
    baseGoldCost: 150,
    baseWoodCost: 10,
    baseIronCost: 20,
  },
  {
    id: 'united_barracks',
    name: 'Cat & Dog United War Barracks',
    icon: '⚔️',
    category: 'military',
    description: 'Trains Knights, Halberdiers, Archers, Mages, Bulldogs, and Wolf Captains.',
    bonusPerLevelText: '+8% Allied Squad ATK/HP & +1 Squad Capacity at Lv.5 & Lv.10',
    baseGoldCost: 140,
    baseWoodCost: 20,
    baseIronCost: 18,
  },
  {
    id: 'sacred_lotus_pond',
    name: "The Great Duck's Sacred Lotus Pond",
    icon: '🦆',
    category: 'sanctuary',
    description: 'Serene astral pond that empowers The Great Duck’s Elixir [Q] and breeds Pet Ducklings.',
    bonusPerLevelText: '+1.5s Great Duck’s Elixir [Q] Duration per level (up to +15s!)',
    baseGoldCost: 160,
    baseWoodCost: 18,
    baseIronCost: 12,
  },
  {
    id: 'royal_guild_hall',
    name: 'Royal Bounty & Siege Guild Hall',
    icon: '📜',
    category: 'military',
    description: 'Issues Boss Hunt Contracts and increases Gold & XP earned from clearing Acts.',
    bonusPerLevelText: '+7% Gold & XP from all slain enemies per level',
    baseGoldCost: 130,
    baseWoodCost: 22,
    baseIronCost: 14,
  },
  {
    id: 'mystic_wardrobe',
    name: 'Mystic Wardrobe & Starlight Salon',
    icon: '👑',
    category: 'sanctuary',
    description: 'Tailors open-face royal crowns and shimmering Starlight fur aura trails.',
    bonusPerLevelText: '+3% Move Speed & +2% Dodge Invulnerability per level',
    baseGoldCost: 110,
    baseWoodCost: 16,
    baseIronCost: 8,
  },
  {
    id: 'minecart_quarry',
    name: 'Deep-Vein Minecart Iron Quarry',
    icon: '⛏️',
    category: 'economy',
    description: 'Automated minecarts extract Iron, Dragon Scales, and Star-Forge Shards while you battle.',
    bonusPerLevelText: '+3 Passive Iron & +2 Forge Shards every minute per level',
    baseGoldCost: 100,
    baseWoodCost: 25,
    baseIronCost: 10,
  },
  {
    id: 'lumber_mill',
    name: 'Whispering Timber & Sawmill',
    icon: '🪵',
    category: 'economy',
    description: 'Harvests enchanted timber from the 48 biomes to expand the United Capital.',
    bonusPerLevelText: '+4 Passive Wood & +25 Passive Gold every minute per level',
    baseGoldCost: 90,
    baseWoodCost: 12,
    baseIronCost: 12,
  },
  {
    id: 'chiptune_tavern',
    name: '30-Track Chiptune Jukebox Tavern',
    icon: '🎵',
    category: 'sanctuary',
    description: 'Cozy tavern where all 4 Heroes feast and listen to the 30 procedural 16-bit OST tracks.',
    bonusPerLevelText: '+5% Max HP for all 4 Playable Heroes per level',
    baseGoldCost: 115,
    baseWoodCost: 20,
    baseIronCost: 10,
  },
  {
    id: 'sky_airship_dock',
    name: 'Clockwork Sky-Galleon & Mecha Dock',
    icon: '🚢',
    category: 'military',
    description: 'Maintains the Cat-Galleon Broadside Cannons and Nyx’s Pilotable Steam-Mecha [V].',
    bonusPerLevelText: '+1.2s Steam-Mecha Duration & +8% Ballista/Cannon Damage per level',
    baseGoldCost: 180,
    baseWoodCost: 24,
    baseIronCost: 24,
  },
  {
    id: 'abyssal_pearl_harbor',
    name: 'Abyssal Pearl & Kraken Harbor',
    icon: '🫧',
    category: 'economy',
    description: 'Refines luminescent Abyssal Pearls and pressurizes underwater oxygen tanks.',
    bonusPerLevelText: '+6% Total Armor DEF & slower Underwater Oxygen drain per level',
    baseGoldCost: 175,
    baseWoodCost: 20,
    baseIronCost: 22,
  },
  {
    id: 'astral_observatory',
    name: 'Omniverse Constellation Observatory',
    icon: '🔭',
    category: 'sanctuary',
    description: 'Charts the 60 Constellation Nodes and grants bonus Star Points at Lv.3, Lv.6, and Lv.10!',
    bonusPerLevelText: '+2% Critical Hit Chance per level + Bonus Star Points!',
    baseGoldCost: 220,
    baseWoodCost: 25,
    baseIronCost: 25,
  },
];

export function createInitialCapitalBuildings(): Record<CapitalBuildingId, number> {
  return {
    alchemy_brewery: 1,
    star_anvil_forge: 1,
    united_barracks: 1,
    sacred_lotus_pond: 1,
    royal_guild_hall: 1,
    mystic_wardrobe: 1,
    minecart_quarry: 1,
    lumber_mill: 1,
    chiptune_tavern: 1,
    sky_airship_dock: 1,
    abyssal_pearl_harbor: 1,
    astral_observatory: 1,
  };
}

export function createInitialKingdomResources(): KingdomResources {
  return {
    wood: 60,
    iron: 45,
    dragonScales: 10,
    abyssalPearls: 5,
    chronoGears: 5,
    voidCrystals: 3,
  };
}

export function getBuildingUpgradeCost(def: CapitalBuildingDef, currentLevel: number): {
  gold: number;
  wood: number;
  iron: number;
} {
  const mult = Math.pow(1.45, Math.max(0, currentLevel - 1));
  return {
    gold: Math.round(def.baseGoldCost * mult),
    wood: Math.round(def.baseWoodCost * mult),
    iron: Math.round(def.baseIronCost * mult),
  };
}

export function getBuildingStageLabel(level: number): string {
  if (level <= 1) return 'Lv.1 Ruined Rubble';
  if (level <= 3) return `Lv.${level} Timber Outpost`;
  if (level <= 6) return `Lv.${level} Stone Bastion`;
  if (level <= 9) return `Lv.${level} Royal Keep`;
  return 'Lv.10 ★ GOLDEN CITADEL';
}

export function computeCapitalBonuses(buildings: Record<CapitalBuildingId, number>): {
  atkMult: number;
  defMult: number;
  hpMult: number;
  critBonus: number;
  elixirBonusSec: number;
  mechaBonusSec: number;
  potionMult: number;
  goldXpMult: number;
} {
  const lv = (id: CapitalBuildingId) => Math.max(1, buildings?.[id] ?? 1);
  return {
    atkMult: 1 + (lv('star_anvil_forge') - 1) * 0.04,
    defMult: 1 + (lv('abyssal_pearl_harbor') - 1) * 0.06,
    hpMult: 1 + (lv('chiptune_tavern') - 1) * 0.05,
    critBonus: (lv('astral_observatory') - 1) * 2,
    elixirBonusSec: (lv('sacred_lotus_pond') - 1) * 1.5,
    mechaBonusSec: (lv('sky_airship_dock') - 1) * 1.2,
    potionMult: 1 + (lv('alchemy_brewery') - 1) * 0.1,
    goldXpMult: 1 + (lv('royal_guild_hall') - 1) * 0.07,
  };
}
