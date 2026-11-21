import { ARMOR_TIERS, WEAPON_TIERS } from './gear';
import { generateBiomeFeaturesForAct } from './biomeMechanics';
import { ACTS_123_TO_300, OMNIVERSE_BIOME_PALETTES } from './campaignActsData';
import { applyOmniverseLayoutGeometry, generateOmniverseSpecialWorld } from './worldArchitect';
import { compileActBespokeTopology, getActBlueprint } from '../engine/dungeonRoomCompiler';
import { renderOrganicAutoTiledSurface } from '../engine/terrainTopographyEngine';
import {
  ActSummary,
  AlliedCatSoldier,
  AlliedCatUnitKind,
  BiomeFeature,
  BiomeId,
  CatCoatId,
  Chest,
  DogBreedId,
  DragonBallista,
  Enemy,
  EnemyKind,
  NPC,
  Portal,
  PrisonCage,
  SiegeEngine,
  Trap,
  TrapKind,
  UnitVisualVariant,
  WarBanner,
} from './types';

export const TILE_SIZE = 16;
export const GRID_COLS = 38;
export const GRID_ROWS = 24;

export type MapLayoutType =
  | 'courtyard_gates'
  | 'twin_bridges'
  | 'watchtower_fort'
  | 'winding_canyon'
  | 'island_archipelago'
  | 'labyrinth_ruins'
  | 'spiral_hollow'
  | 'canopy_walkways'
  | 'hazard_gauntlet'
  | 'boss_colosseum'
  | 'sanctuary_lotus'
  | 'throne_hall';

export interface BiomePalette {
  name: string;
  theme: 'calm' | 'adventure' | 'sanctuary' | 'boss';
  groundA: string;
  groundB: string;
  wallA: string;
  wallB: string;
  pathA: string;
  pathB: string;
  waterA: string;
  waterB: string;
  carpetA: string;
  carpetB: string;
  bridgeA: string;
  bridgeB: string;
  hazardA: string;
  hazardB: string;
  accent: string;
}

export const BIOME_PALETTES: Record<BiomeId, BiomePalette> = {
  1: {
    name: 'Ruined Citadel & Whispering Woods',
    theme: 'adventure',
    groundA: '#284a32',
    groundB: '#22402b',
    wallA: '#14532d',
    wallB: '#0f3f21',
    pathA: '#856746',
    pathB: '#73583a',
    waterA: '#1d4ed8',
    waterB: '#2563eb',
    carpetA: '#991b1b',
    carpetB: '#b91c1c',
    bridgeA: '#92400e',
    bridgeB: '#78350f',
    hazardA: '#b45309',
    hazardB: '#d97706',
    accent: '#4ade80',
  },
  2: {
    name: 'Howling Bramble Ravine',
    theme: 'adventure',
    groundA: '#3d3428',
    groundB: '#332b21',
    wallA: '#3f6212',
    wallB: '#365314',
    pathA: '#6b5344',
    pathB: '#574337',
    waterA: '#1e3a8a',
    waterB: '#1d4ed8',
    carpetA: '#7c2d12',
    carpetB: '#9a3412',
    bridgeA: '#78350f',
    bridgeB: '#57280f',
    hazardA: '#4d7c0f',
    hazardB: '#84cc16',
    accent: '#a3e635',
  },
  3: {
    name: 'Fungal Glow-Shroom Grotto',
    theme: 'adventure',
    groundA: '#1c2541',
    groundB: '#161e36',
    wallA: '#312e81',
    wallB: '#1e1b4b',
    pathA: '#475569',
    pathB: '#334155',
    waterA: '#0d9488',
    waterB: '#14b8a6',
    carpetA: '#701a75',
    carpetB: '#86198f',
    bridgeA: '#6b21a8',
    bridgeB: '#581c87',
    hazardA: '#a21caf',
    hazardB: '#e879f9',
    accent: '#2dd4bf',
  },
  4: {
    name: 'Crimson Autumn Canopy',
    theme: 'adventure',
    groundA: '#5c2d1c',
    groundB: '#4c2416',
    wallA: '#9a3412',
    wallB: '#7c2d12',
    pathA: '#a16207',
    pathB: '#854d0e',
    waterA: '#0284c7',
    waterB: '#0ea5e9',
    carpetA: '#b91c1c',
    carpetB: '#dc2626',
    bridgeA: '#9a3412',
    bridgeB: '#7c2d12',
    hazardA: '#dc2626',
    hazardB: '#f97316',
    accent: '#fb923c',
  },
  5: {
    name: 'Frostpeak Pine & Crystal Caverns',
    theme: 'adventure',
    groundA: '#cbd5e1',
    groundB: '#94a3b8',
    wallA: '#1e3a8a',
    wallB: '#172554',
    pathA: '#e2e8f0',
    pathB: '#cbd5e1',
    waterA: '#0284c7',
    waterB: '#38bdf8',
    carpetA: '#0369a1',
    carpetB: '#0284c7',
    bridgeA: '#475569',
    bridgeB: '#334155',
    hazardA: '#0284c7',
    hazardB: '#67e8f9',
    accent: '#67e8f9',
  },
  6: {
    name: 'Embercrag Scorched Woods',
    theme: 'adventure',
    groundA: '#292524',
    groundB: '#1c1917',
    wallA: '#451a03',
    wallB: '#270e02',
    pathA: '#57534e',
    pathB: '#44403c',
    waterA: '#c2410c',
    waterB: '#ea580c',
    carpetA: '#991b1b',
    carpetB: '#dc2626',
    bridgeA: '#44403c',
    bridgeB: '#292524',
    hazardA: '#ea580c',
    hazardB: '#facc15',
    accent: '#fb923c',
  },
  7: {
    name: 'Cursed Blight Marsh',
    theme: 'adventure',
    groundA: '#233529',
    groundB: '#1b2b20',
    wallA: '#134e4a',
    wallB: '#0f3f3c',
    pathA: '#5c4d3c',
    pathB: '#4a3d2f',
    waterA: '#065f46',
    waterB: '#047857',
    carpetA: '#3f6212',
    carpetB: '#365314',
    bridgeA: '#4d3b2c',
    bridgeB: '#3a2c20',
    hazardA: '#65a30d',
    hazardB: '#a3e635',
    accent: '#a3e635',
  },
  8: {
    name: 'Astral Bamboo Grove',
    theme: 'adventure',
    groundA: '#1e293b',
    groundB: '#162030',
    wallA: '#065f46',
    wallB: '#064e3b',
    pathA: '#64748b',
    pathB: '#475569',
    waterA: '#312e81',
    waterB: '#4338ca',
    carpetA: '#6d28d9',
    carpetB: '#7c3aed',
    bridgeA: '#d97706',
    bridgeB: '#b45309',
    hazardA: '#7c3aed',
    hazardB: '#c084fc',
    accent: '#c084fc',
  },
  sanctuary: {
    name: 'Sanctuary of the Great Duck',
    theme: 'sanctuary',
    groundA: '#1f5e4b',
    groundB: '#1a5140',
    wallA: '#064e3b',
    wallB: '#047857',
    pathA: '#d6d3d1',
    pathB: '#a8a29e',
    waterA: '#0ea5e9',
    waterB: '#38bdf8',
    carpetA: '#fef08a',
    carpetB: '#fde047',
    bridgeA: '#fde047',
    bridgeB: '#facc15',
    hazardA: '#38bdf8',
    hazardB: '#bae6fd',
    accent: '#fde047',
  },
  throne: {
    name: 'Corrupted Felis Throne Room',
    theme: 'boss',
    groundA: '#1e1b2e',
    groundB: '#181526',
    wallA: '#312e81',
    wallB: '#1e1b4b',
    pathA: '#4c1d95',
    pathB: '#3b0764',
    waterA: '#4c1d95',
    waterB: '#6d28d9',
    carpetA: '#7f1d1d',
    carpetB: '#991b1b',
    bridgeA: '#6d28d9',
    bridgeB: '#4c1d95',
    hazardA: '#9333ea',
    hazardB: '#e879f9',
    accent: '#c084fc',
  },
  9: {
    name: 'War Front 1: Shattered Border Trenches',
    theme: 'adventure',
    groundA: '#365314',
    groundB: '#2e4711',
    wallA: '#78350f',
    wallB: '#451a03',
    pathA: '#ca8a04',
    pathB: '#a16207',
    waterA: '#0284c7',
    waterB: '#0369a1',
    carpetA: '#b91c1c',
    carpetB: '#dc2626',
    bridgeA: '#92400e',
    bridgeB: '#78350f',
    hazardA: '#b45309',
    hazardB: '#f59e0b',
    accent: '#facc15',
  },
  10: {
    name: 'War Front 2: River of Claws Naval Bridgehead',
    theme: 'adventure',
    groundA: '#1e293b',
    groundB: '#0f172a',
    wallA: '#334155',
    wallB: '#1e293b',
    pathA: '#78350f',
    pathB: '#57280f',
    waterA: '#0369a1',
    waterB: '#075985',
    carpetA: '#0284c7',
    carpetB: '#0369a1',
    bridgeA: '#92400e',
    bridgeB: '#78350f',
    hazardA: '#0ea5e9',
    hazardB: '#38bdf8',
    accent: '#38bdf8',
  },
  11: {
    name: 'War Front 3: Howling Canyon Siege Lines',
    theme: 'adventure',
    groundA: '#3b181e',
    groundB: '#2a1015',
    wallA: '#4c0519',
    wallB: '#3b0413',
    pathA: '#7f1d1d',
    pathB: '#651616',
    waterA: '#881337',
    waterB: '#9f1239',
    carpetA: '#be123c',
    carpetB: '#e11d48',
    bridgeA: '#7c2d12',
    bridgeB: '#57200d',
    hazardA: '#e11d48',
    hazardB: '#fb7185',
    accent: '#fb7185',
  },
  12: {
    name: 'War Front 4: Sky-Galleon Paratrooper Ridge',
    theme: 'adventure',
    groundA: '#312e81',
    groundB: '#1e1b4b',
    wallA: '#4338ca',
    wallB: '#312e81',
    pathA: '#94a3b8',
    pathB: '#64748b',
    waterA: '#1e1b4b',
    waterB: '#0f172a',
    carpetA: '#d97706',
    carpetB: '#b45309',
    bridgeA: '#cbd5e1',
    bridgeB: '#94a3b8',
    hazardA: '#6366f1',
    hazardB: '#a5b4fc',
    accent: '#fde047',
  },
  13: {
    name: 'War Front 5: Frostbite Tundra Campaign',
    theme: 'adventure',
    groundA: '#94a3b8',
    groundB: '#64748b',
    wallA: '#1e293b',
    wallB: '#0f172a',
    pathA: '#cbd5e1',
    pathB: '#94a3b8',
    waterA: '#0369a1',
    waterB: '#0284c7',
    carpetA: '#1d4ed8',
    carpetB: '#2563eb',
    bridgeA: '#475569',
    bridgeB: '#334155',
    hazardA: '#06b6d4',
    hazardB: '#67e8f9',
    accent: '#22d3ee',
  },
  14: {
    name: 'War Front 6: Iron-Collar Foundry & War-Machine Factory',
    theme: 'adventure',
    groundA: '#27272a',
    groundB: '#18181b',
    wallA: '#3f3f46',
    wallB: '#27272a',
    pathA: '#52525b',
    pathB: '#3f3f46',
    waterA: '#ea580c',
    waterB: '#c2410c',
    carpetA: '#991b1b',
    carpetB: '#7f1d1d',
    bridgeA: '#71717a',
    bridgeB: '#52525b',
    hazardA: '#ea580c',
    hazardB: '#fb923c',
    accent: '#f97316',
  },
  15: {
    name: 'War Front 7: Shadow-Fang Citadel Outer Walls',
    theme: 'adventure',
    groundA: '#18181b',
    groundB: '#09090b',
    wallA: '#450a0a',
    wallB: '#280505',
    pathA: '#3f3f46',
    pathB: '#27272a',
    waterA: '#b91c1c',
    waterB: '#991b1b',
    carpetA: '#dc2626',
    carpetB: '#b91c1c',
    bridgeA: '#52525b',
    bridgeB: '#3f3f46',
    hazardA: '#dc2626',
    hazardB: '#f87171',
    accent: '#ef4444',
  },
  16: {
    name: 'War Front 8: The Obsidian War-Palace Gauntlet',
    theme: 'adventure',
    groundA: '#1e1b4b',
    groundB: '#110e2e',
    wallA: '#3b0764',
    wallB: '#2e054e',
    pathA: '#581c87',
    pathB: '#4c1d95',
    waterA: '#4c1d95',
    waterB: '#6d28d9',
    carpetA: '#a21caf',
    carpetB: '#86198f',
    bridgeA: '#ca8a04',
    bridgeB: '#a16207',
    hazardA: '#9333ea',
    hazardB: '#d8b4fe',
    accent: '#e879f9',
  },
  war_sanctuary: {
    name: "The Great Duck's War Council & Supreme Awakening",
    theme: 'sanctuary',
    groundA: '#450a0a',
    groundB: '#360810',
    wallA: '#78350f',
    wallB: '#451a03',
    pathA: '#b45309',
    pathB: '#92400e',
    waterA: '#450a0a',
    waterB: '#7f1d1d',
    carpetA: '#991b1b',
    carpetB: '#dc2626',
    bridgeA: '#eab308',
    bridgeB: '#ca8a04',
    hazardA: '#f59e0b',
    hazardB: '#fde047',
    accent: '#fde047',
  },
  imperial_throne: {
    name: 'The Colosseum of Kings (Dog Kingdom Capital)',
    theme: 'boss',
    groundA: '#1c0d18',
    groundB: '#120810',
    wallA: '#450a0a',
    wallB: '#2a0505',
    pathA: '#7f1d1d',
    pathB: '#450a0a',
    waterA: '#991b1b',
    waterB: '#dc2626',
    carpetA: '#b45309',
    carpetB: '#d97706',
    bridgeA: '#991b1b',
    bridgeB: '#7f1d1d',
    hazardA: '#dc2626',
    hazardB: '#f59e0b',
    accent: '#fbbf24',
  },
  // ARC III (ACTS 83–122): THE DRAGON CATACLYSM AFTER THE PEACE
  17: {
    name: 'Scorched Peace Courtyard & Smoldering Ruins',
    theme: 'adventure',
    groundA: '#3b2418',
    groundB: '#2d1a11',
    wallA: '#57280f',
    wallB: '#3d1a08',
    pathA: '#78350f',
    pathB: '#5c280b',
    waterA: '#b91c1c',
    waterB: '#ea580c',
    carpetA: '#991b1b',
    carpetB: '#dc2626',
    bridgeA: '#57534e',
    bridgeB: '#44403c',
    hazardA: '#ea580c',
    hazardB: '#facc15',
    accent: '#fb923c',
  },
  18: {
    name: 'Ashen Gold-Vault Caverns',
    theme: 'adventure',
    groundA: '#292014',
    groundB: '#1f180e',
    wallA: '#713f12',
    wallB: '#422006',
    pathA: '#a16207',
    pathB: '#854d0e',
    waterA: '#d97706',
    waterB: '#f59e0b',
    carpetA: '#b45309',
    carpetB: '#ca8a04',
    bridgeA: '#eab308',
    bridgeB: '#a16207',
    hazardA: '#f59e0b',
    hazardB: '#fef08a',
    accent: '#fde047',
  },
  19: {
    name: 'Storm-Scale Sky-Bridges & Shattered Spire',
    theme: 'adventure',
    groundA: '#1e293b',
    groundB: '#0f172a',
    wallA: '#0369a1',
    wallB: '#0c4a6e',
    pathA: '#334155',
    pathB: '#1e293b',
    waterA: '#0284c7',
    waterB: '#38bdf8',
    carpetA: '#0284c7',
    carpetB: '#0ea5e9',
    bridgeA: '#475569',
    bridgeB: '#64748b',
    hazardA: '#0ea5e9',
    hazardB: '#fef08a',
    accent: '#38bdf8',
  },
  20: {
    name: 'Frozen Dragon-Graveyard & Permafrost Peak',
    theme: 'adventure',
    groundA: '#162c3d',
    groundB: '#0e1f2d',
    wallA: '#0891b2',
    wallB: '#155e75',
    pathA: '#bae6fd',
    pathB: '#7dd3fc',
    waterA: '#0369a1',
    waterB: '#22d3ee',
    carpetA: '#0e7490',
    carpetB: '#0891b2',
    bridgeA: '#94a3b8',
    bridgeB: '#64748b',
    hazardA: '#06b6d4',
    hazardB: '#ecfeff',
    accent: '#67e8f9',
  },
  21: {
    name: 'Venom-Scale Jungle & Acid Caldera',
    theme: 'adventure',
    groundA: '#14331d',
    groundB: '#0d2414',
    wallA: '#15803d',
    wallB: '#052e16',
    pathA: '#365314',
    pathB: '#1a2e05',
    waterA: '#4d7c0f',
    waterB: '#84cc16',
    carpetA: '#166534',
    carpetB: '#15803d',
    bridgeA: '#3f6212',
    bridgeB: '#365314',
    hazardA: '#65a30d',
    hazardB: '#bef264',
    accent: '#4ade80',
  },
  22: {
    name: 'Astral Star-Forge Ruins',
    theme: 'adventure',
    groundA: '#1e1b4b',
    groundB: '#151238',
    wallA: '#4c1d95',
    wallB: '#2e1065',
    pathA: '#3b0764',
    pathB: '#581c87',
    waterA: '#4f46e5',
    waterB: '#7c3aed',
    carpetA: '#6d28d9',
    carpetB: '#7c3aed',
    bridgeA: '#6366f1',
    bridgeB: '#4338ca',
    hazardA: '#9333ea',
    hazardB: '#e879f9',
    accent: '#c084fc',
  },
  23: {
    name: 'Abyssal Dragon Citadel & Magma Sanctum',
    theme: 'adventure',
    groundA: '#1c0b0b',
    groundB: '#120606',
    wallA: '#7f1d1d',
    wallB: '#450a0a',
    pathA: '#450a0a',
    pathB: '#280505',
    waterA: '#b91c1c',
    waterB: '#ef4444',
    carpetA: '#991b1b',
    carpetB: '#dc2626',
    bridgeA: '#44403c',
    bridgeB: '#292524',
    hazardA: '#dc2626',
    hazardB: '#fde047',
    accent: '#f43f5e',
  },
  24: {
    name: 'Ascent to the Shattered Sky-Throne',
    theme: 'adventure',
    groundA: '#291729',
    groundB: '#1c0f1d',
    wallA: '#701a75',
    wallB: '#4a044e',
    pathA: '#b45309',
    pathB: '#92400e',
    waterA: '#1e1b4b',
    waterB: '#312e81',
    carpetA: '#ca8a04',
    carpetB: '#eab308',
    bridgeA: '#d97706',
    bridgeB: '#b45309',
    hazardA: '#e11d48',
    hazardB: '#fbbf24',
    accent: '#fde047',
  },
  dragon_sanctuary: {
    name: 'United Sanctum of Cat, Dog & The Great Duck',
    theme: 'sanctuary',
    groundA: '#064e3b',
    groundB: '#047857',
    wallA: '#1e3a8a',
    wallB: '#1e1b4b',
    pathA: '#fde047',
    pathB: '#facc15',
    waterA: '#0284c7',
    waterB: '#38bdf8',
    carpetA: '#b45309',
    carpetB: '#d97706',
    bridgeA: '#fde047',
    bridgeB: '#f59e0b',
    hazardA: '#38bdf8',
    hazardB: '#fef08a',
    accent: '#fde047',
  },
  sky_throne: {
    name: 'The Shattered Sky-Throne (World-Breaker Peak)',
    theme: 'boss',
    groundA: '#1a0a14',
    groundB: '#0f050b',
    wallA: '#7f1d1d',
    wallB: '#450a0a',
    pathA: '#92400e',
    pathB: '#78350f',
    waterA: '#991b1b',
    waterB: '#ea580c',
    carpetA: '#b91c1c',
    carpetB: '#dc2626',
    bridgeA: '#d97706',
    bridgeB: '#92400e',
    hazardA: '#ef4444',
    hazardB: '#fde047',
    accent: '#fde047',
  },
  ...(OMNIVERSE_BIOME_PALETTES as Record<string | number, BiomePalette>),
} as Record<BiomeId, BiomePalette>;

export interface ActConfig {
  act: number;
  biomeId: BiomeId;
  biomeName: string;
  title: string;
  subtitle: string;
  role: 'normal' | 'miniboss' | 'boss' | 'sanctuary' | 'final_boss';
  layout: MapLayoutType;
  terrainTag: string;
  trapPool: TrapKind[];
  enemyPool: EnemyKind[];
  bossKind?: EnemyKind;
  bossName?: string;
  hasBlacksmith?: boolean;
  hasAdvisor?: boolean;
  rewardTier: number;
}

export const ACTS_DATA: ActConfig[] = [
  // BIOME 1 (Acts 1–5): Ruined Citadel & Whispering Woods
  { act: 1, biomeId: 1, biomeName: BIOME_PALETTES[1].name, title: 'Shattered Castle Gates', subtitle: 'Skirmish in the Fallen Courtyard', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Castle Moat · Floor Spike Grates', trapPool: ['spike_trap'], enemyPool: ['hound_scout', 'goblin_grunt'], hasAdvisor: true, hasBlacksmith: true, rewardTier: 1 },
  { act: 2, biomeId: 1, biomeName: BIOME_PALETTES[1].name, title: 'Weeping Pine Trail', subtitle: 'Goblin Slingers at the Twin Bridges', role: 'normal', layout: 'twin_bridges', terrainTag: 'River Crossing · Dart Totems', trapPool: ['arrow_turret'], enemyPool: ['goblin_grunt', 'goblin_archer'], rewardTier: 2 },
  { act: 3, biomeId: 1, biomeName: BIOME_PALETTES[1].name, title: 'Goblin Watchtower', subtitle: 'Mini-Boss: Knucklebite', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Timber Fort · Spike Grates & Darts', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['goblin_grunt', 'goblin_archer'], bossKind: 'grommash', bossName: 'Knucklebite the Goblin Captain', rewardTier: 2 },
  { act: 4, biomeId: 1, biomeName: BIOME_PALETTES[1].name, title: 'Mossy Timber Camp', subtitle: 'Serpentine Forest Ambush', role: 'normal', layout: 'winding_canyon', terrainTag: 'Winding Woods · Mud & Dart Traps', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['goblin_grunt', 'goblin_archer', 'hound_scout'], rewardTier: 2 },
  { act: 5, biomeId: 1, biomeName: BIOME_PALETTES[1].name, title: "Warlord's Palisade", subtitle: 'Boss: Grommash the Goblin Warlord', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Spiked Palisade Arena', trapPool: ['spike_trap'], enemyPool: ['goblin_grunt', 'goblin_archer'], bossKind: 'grommash', bossName: 'Grommash the Goblin Warlord', rewardTier: 2 },

  // BIOME 2 (Acts 6–10): Howling Bramble Ravine
  { act: 6, biomeId: 2, biomeName: BIOME_PALETTES[2].name, title: 'Thornwall Gorge', subtitle: 'Razor Badgers in the Narrow Gorge', role: 'normal', layout: 'winding_canyon', terrainTag: 'Bramble Thorns · Crossbow Totems', trapPool: ['arrow_turret'], enemyPool: ['razor_badger', 'goblin_archer'], hasBlacksmith: true, rewardTier: 3 },
  { act: 7, biomeId: 2, biomeName: BIOME_PALETTES[2].name, title: 'Boar-Tusk Hollow', subtitle: 'Mud Wallows & Bog Islands', role: 'normal', layout: 'island_archipelago', terrainTag: 'Mud Islands · Thorn Mire & Spikes', trapPool: ['spike_trap'], enemyPool: ['rabid_boar', 'razor_badger'], rewardTier: 3 },
  { act: 8, biomeId: 2, biomeName: BIOME_PALETTES[2].name, title: 'Blood-Oak Clearing', subtitle: 'Mini-Boss: Gore-Tusk', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Spiral Ring · Thorn Pits & Totems', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['rabid_boar'], bossKind: 'brambleback', bossName: 'Gore-Tusk the Alpha Boar', rewardTier: 3 },
  { act: 9, biomeId: 2, biomeName: BIOME_PALETTES[2].name, title: 'Grizzly Cavern Mouth', subtitle: 'Suspended Ravine Walkways', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Ravine Bridges · Dart Crossfire', trapPool: ['arrow_turret'], enemyPool: ['rabid_boar', 'hound_scout', 'razor_badger'], rewardTier: 3 },
  { act: 10, biomeId: 2, biomeName: BIOME_PALETTES[2].name, title: 'Den of the Titan', subtitle: 'Boss: Brambleback the Dire Bear', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Bramble Pit Colosseum', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['razor_badger'], bossKind: 'brambleback', bossName: 'Brambleback the Dire Bear', rewardTier: 3 },

  // BIOME 3 (Acts 11–15): Fungal Glow-Shroom Grotto
  { act: 11, biomeId: 3, biomeName: BIOME_PALETTES[3].name, title: 'Sporelit Trail', subtitle: 'Bioluminescent Cavern Boardwalks', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Glow-Pools · Toxic Spore Vents', trapPool: ['spore_vent'], enemyPool: ['sporeling', 'goblin_archer'], hasBlacksmith: true, rewardTier: 4 },
  { act: 12, biomeId: 3, biomeName: BIOME_PALETTES[3].name, title: 'Mycelium Labyrinth', subtitle: 'Twisting Fungal Chambers', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Fungal Maze · Spore Geysers & Mire', trapPool: ['spore_vent', 'spike_trap'], enemyPool: ['sporeling', 'razor_badger'], rewardTier: 4 },
  { act: 13, biomeId: 3, biomeName: BIOME_PALETTES[3].name, title: "Alchemist's Outpost", subtitle: 'Mini-Boss: Snaggletooth', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Acid Moat · Bubbling Spore Vents', trapPool: ['spore_vent'], enemyPool: ['sporeling', 'goblin_archer'], bossKind: 'mycora', bossName: 'Snaggletooth the Mad Brewmaster', rewardTier: 4 },
  { act: 14, biomeId: 3, biomeName: BIOME_PALETTES[3].name, title: 'Bioluminescent Depths', subtitle: 'Subterranean Archipelago', role: 'normal', layout: 'island_archipelago', terrainTag: 'Luminous Isles · Acid Bog & Vents', trapPool: ['spore_vent', 'arrow_turret'], enemyPool: ['sporeling', 'shadow_wolf'], rewardTier: 4 },
  { act: 15, biomeId: 3, biomeName: BIOME_PALETTES[3].name, title: 'Heart of the Spore-Hive', subtitle: 'Boss: Mycora the Toad-King', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Spore-Hive Caldera · Toxic Vents', trapPool: ['spore_vent'], enemyPool: ['sporeling'], bossKind: 'mycora', bossName: 'Mycora the Colossal Toad-King', rewardTier: 4 },

  // BIOME 4 (Acts 16–20): Crimson Autumn Canopy
  { act: 16, biomeId: 4, biomeName: BIOME_PALETTES[4].name, title: 'Maple-Blade Bridge', subtitle: 'Dog Kingdom Bridge Garrison', role: 'normal', layout: 'twin_bridges', terrainTag: 'Twin Maple Bridges · Crossbow Traps', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['hound_scout', 'goblin_archer'], hasBlacksmith: true, rewardTier: 5 },
  { act: 17, biomeId: 4, biomeName: BIOME_PALETTES[4].name, title: 'Treetop Rope-Walks', subtitle: 'High-Canopy Plank Network', role: 'normal', layout: 'canopy_walkways', terrainTag: 'High Rope-Walks · Wind Dart Totems', trapPool: ['arrow_turret'], enemyPool: ['hound_scout', 'razor_badger', 'shadow_wolf'], rewardTier: 5 },
  { act: 18, biomeId: 4, biomeName: BIOME_PALETTES[4].name, title: "Crow's Nest Stronghold", subtitle: 'Mini-Boss: Talon-Eye', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Bastion Chambers · Spike & Flame Traps', trapPool: ['spike_trap', 'flame_geyser'], enemyPool: ['goblin_archer', 'hound_scout'], bossKind: 'general_vane', bossName: 'Talon-Eye the Falconer Bandit', rewardTier: 5 },
  { act: 19, biomeId: 4, biomeName: BIOME_PALETTES[4].name, title: 'Burning Sawmill', subtitle: 'Blazing Timber Gauntlet', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Sawmill Fire Lanes · Flame Vents', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['hound_scout', 'lava_salamander'], rewardTier: 5 },
  { act: 20, biomeId: 4, biomeName: BIOME_PALETTES[4].name, title: 'Crimson Fortress Courtyard', subtitle: 'Boss: General Vane', role: 'boss', layout: 'courtyard_gates', terrainTag: 'Fortress Bastion · Iron Spikes & Turrets', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['hound_scout'], bossKind: 'general_vane', bossName: 'General Vane the Iron Mastiff', rewardTier: 5 },

  // BIOME 5 (Acts 21–25): Frostpeak Pine & Crystal Caverns
  { act: 21, biomeId: 5, biomeName: BIOME_PALETTES[5].name, title: 'Blizzard Pass', subtitle: 'Slippery Ice Canyon', role: 'normal', layout: 'winding_canyon', terrainTag: 'Glacier Slide · Cryo Pulse Crystals', trapPool: ['frost_crystal'], enemyPool: ['ice_golem', 'goblin_archer'], hasBlacksmith: true, rewardTier: 6 },
  { act: 22, biomeId: 5, biomeName: BIOME_PALETTES[5].name, title: 'Glacier Crevasse', subtitle: 'Frozen Floes Over Abyssal Water', role: 'normal', layout: 'island_archipelago', terrainTag: 'Ice Floe Bridges · Cryo Crystals', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'razor_badger'], rewardTier: 6 },
  { act: 23, biomeId: 5, biomeName: BIOME_PALETTES[5].name, title: 'Frozen Shrine', subtitle: 'Mini-Boss: Shivermaw', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Rime Ring · Slippery Ice & Obelisks', trapPool: ['frost_crystal'], enemyPool: ['ice_golem', 'shadow_wolf'], bossKind: 'cryo_fang', bossName: 'Shivermaw the Wendigo-Hound', rewardTier: 6 },
  { act: 24, biomeId: 5, biomeName: BIOME_PALETTES[5].name, title: 'Crystal Mirror Halls', subtitle: 'Ice Labyrinth & Arcane Sentinels', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Mirror Ice Maze · Cryo & Spike Traps', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'shadow_wolf'], rewardTier: 6 },
  { act: 25, biomeId: 5, biomeName: BIOME_PALETTES[5].name, title: 'Summit of Eternal Rime', subtitle: 'Boss: Cryo-Fang Mammoth', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Glacier Colosseum · Cryo Obelisks', trapPool: ['frost_crystal'], enemyPool: ['ice_golem'], bossKind: 'cryo_fang', bossName: 'Cryo-Fang the Mammoth Behemoth', rewardTier: 6 },

  // BIOME 6 (Acts 26–30): Embercrag Scorched Woods
  { act: 26, biomeId: 6, biomeName: BIOME_PALETTES[6].name, title: 'Ashfall Trail', subtitle: 'Scorched Ravine & Magma Cracks', role: 'normal', layout: 'winding_canyon', terrainTag: 'Magma Streams · Flame Geysers', trapPool: ['flame_geyser'], enemyPool: ['lava_salamander', 'goblin_grunt'], hasBlacksmith: true, rewardTier: 7 },
  { act: 27, biomeId: 6, biomeName: BIOME_PALETTES[6].name, title: 'Obsidian Quarry', subtitle: 'Catwalks Over Molten Pits', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Molten Quarry Catwalks · Flame Vents', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['lava_salamander', 'rabid_boar'], rewardTier: 7 },
  { act: 28, biomeId: 6, biomeName: BIOME_PALETTES[6].name, title: "Smelter's Crucible", subtitle: 'Mini-Boss: Ignis-Crag', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Foundry Chambers · Lava & Geysers', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['lava_salamander'], bossKind: 'volcanis', bossName: 'Ignis-Crag the Magma Golem', rewardTier: 7 },
  { act: 29, biomeId: 6, biomeName: BIOME_PALETTES[6].name, title: 'Brimstone Bridge', subtitle: 'Twin Viaducts Over Lava Rivers', role: 'normal', layout: 'twin_bridges', terrainTag: 'Lava Viaducts · Erupting Geysers', trapPool: ['flame_geyser', 'arrow_turret'], enemyPool: ['lava_salamander', 'hound_scout'], rewardTier: 7 },
  { act: 30, biomeId: 6, biomeName: BIOME_PALETTES[6].name, title: 'Caldera of the Forge-Lord', subtitle: 'Boss: Volcanis Drake', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Volcanic Caldera Ring · Magma Vents', trapPool: ['flame_geyser'], enemyPool: ['lava_salamander'], bossKind: 'volcanis', bossName: 'Volcanis the Three-Tailed Drake', rewardTier: 7 },

  // BIOME 7 (Acts 31–35): Cursed Blight Marsh
  { act: 31, biomeId: 7, biomeName: BIOME_PALETTES[7].name, title: 'Miasma Bog', subtitle: 'Plank Causeways Across Acid Bog', role: 'normal', layout: 'island_archipelago', terrainTag: 'Blight Islands · Acid Mire & Spores', trapPool: ['spore_vent'], enemyPool: ['swamp_croc', 'sporeling'], hasBlacksmith: true, rewardTier: 8 },
  { act: 32, biomeId: 7, biomeName: BIOME_PALETTES[7].name, title: 'Sunken Catacombs', subtitle: 'Flooded Crypt Labyrinth', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Flooded Crypts · Spike Grates & Darts', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['swamp_croc', 'shadow_wolf'], rewardTier: 8 },
  { act: 33, biomeId: 7, biomeName: BIOME_PALETTES[7].name, title: 'Drowned Altar', subtitle: 'Mini-Boss: Dread-Scale', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Sunken Ring · Poison Vents & Spikes', trapPool: ['spore_vent', 'spike_trap'], enemyPool: ['swamp_croc'], bossKind: 'viperfang', bossName: 'Dread-Scale the Gator Knight', rewardTier: 8 },
  { act: 34, biomeId: 7, biomeName: BIOME_PALETTES[7].name, title: 'Venom-Mist Reedbeds', subtitle: 'Dual-Lane Poison Gauntlet', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Venom Gauntlet · Spore & Dart Traps', trapPool: ['spore_vent', 'arrow_turret'], enemyPool: ['swamp_croc', 'sporeling', 'goblin_archer'], rewardTier: 8 },
  { act: 35, biomeId: 7, biomeName: BIOME_PALETTES[7].name, title: 'Abyssal Marsh Gate', subtitle: 'Boss: Viperfang the Swamp Hydra', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Hydra Lagoon · Acid Pools & Vents', trapPool: ['spore_vent'], enemyPool: ['swamp_croc'], bossKind: 'viperfang', bossName: 'Viperfang the Swamp Hydra', rewardTier: 8 },

  // BIOME 8 (Acts 36–40): Astral Bamboo Grove & Sanctuary
  { act: 36, biomeId: 8, biomeName: BIOME_PALETTES[8].name, title: 'Starlight Bamboo Path', subtitle: 'Astral Terraces & Void Pylons', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Starlit Terraces · Void Lightning Pylons', trapPool: ['void_pillar'], enemyPool: ['celestial_sentinel', 'hound_scout'], hasBlacksmith: true, rewardTier: 9 },
  { act: 37, biomeId: 8, biomeName: BIOME_PALETTES[8].name, title: 'Floating Lantern Bridges', subtitle: 'Bridges Over the Starry Abyss', role: 'normal', layout: 'twin_bridges', terrainTag: 'Astral Bridges · Void Pylons & Darts', trapPool: ['void_pillar', 'arrow_turret'], enemyPool: ['celestial_sentinel', 'shadow_wolf'], rewardTier: 9 },
  { act: 38, biomeId: 8, biomeName: BIOME_PALETTES[8].name, title: 'Gate of the Golden Feather', subtitle: 'Mini-Boss: Kiba the Shadow', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Celestial Citadel · Void Pylons & Spikes', trapPool: ['void_pillar', 'spike_trap'], enemyPool: ['shadow_wolf', 'celestial_sentinel'], bossKind: 'aether_wing', bossName: "Kiba the Wolf King's Shadow", rewardTier: 9 },
  { act: 39, biomeId: 8, biomeName: BIOME_PALETTES[8].name, title: 'Trial of the Lotus Guardian', subtitle: 'Boss: Aether-Wing Griffin', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Sky-Temple Colosseum · Astral Pylons', trapPool: ['void_pillar'], enemyPool: ['celestial_sentinel'], bossKind: 'aether_wing', bossName: 'Aether-Wing the Corrupted Griffin', rewardTier: 9 },
  { act: 40, biomeId: 'sanctuary', biomeName: BIOME_PALETTES.sanctuary.name, title: 'Sanctuary of the Great Duck', subtitle: 'Sacred Lotus Pond & Elixir Shrine', role: 'sanctuary', layout: 'sanctuary_lotus', terrainTag: 'Sacred Lotus Sanctum · Safe Haven', trapPool: [], enemyPool: [], hasBlacksmith: true, rewardTier: 10 },

  // ACT 41 FINALE (PART I: KING LEO'S COMEBACK)
  { act: 41, biomeId: 'throne', biomeName: BIOME_PALETTES.throne.name, title: 'Corrupted Felis Throne Room', subtitle: 'Final Showdown: Usurper King Fenrir', role: 'final_boss', layout: 'throne_hall', terrainTag: 'Royal Throne Hall · Void Pylons', trapPool: ['void_pillar'], enemyPool: [], bossKind: 'fenrir_p1', bossName: 'Usurper King Fenrir', rewardTier: 10 },

  // ============================================================================
  // ARC II (ACTS 42–82): THE GREAT WAR OF CATS AND DOGS (41 FULL-SCALE WAR ACTS)
  // ============================================================================

  // WAR FRONT 1 (Acts 42–46): The Shattered Border Trenches
  { act: 42, biomeId: 9, biomeName: BIOME_PALETTES[9].name, title: 'Shattered Border Trenches', subtitle: 'Allied Cat Infantry vs. Bulldog Siege Legions', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Border Trenches · Capture Banner & Catapults', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['hound_scout', 'goblin_archer'], hasAdvisor: true, hasBlacksmith: true, rewardTier: 10 },
  { act: 43, biomeId: 9, biomeName: BIOME_PALETTES[9].name, title: 'No-Cat’s-Land Barricades', subtitle: 'Crossfire Trenches & Bulldog Shield-Walls', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Dual War Trenches · Artillery & Spikes', trapPool: ['arrow_turret', 'flame_geyser'], enemyPool: ['hound_scout', 'rabid_boar', 'goblin_archer'], rewardTier: 10 },
  { act: 44, biomeId: 9, biomeName: BIOME_PALETTES[9].name, title: 'Redoubt of the Iron Hound', subtitle: 'Mini-Boss: Siege-Captain Brutus', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Border Redoubt · Siege Ballistas & Spikes', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['hound_scout', 'shadow_wolf'], bossKind: 'general_vane', bossName: 'Siege-Captain Brutus', rewardTier: 10 },
  { act: 45, biomeId: 9, biomeName: BIOME_PALETTES[9].name, title: 'Sunken Catapult Crossing', subtitle: 'Twin Pontoon Bridges Under Bombardment', role: 'normal', layout: 'twin_bridges', terrainTag: 'Pontoon Bridges · Firebomb Geysers', trapPool: ['flame_geyser', 'arrow_turret'], enemyPool: ['hound_scout', 'razor_badger', 'shadow_wolf'], rewardTier: 10 },
  { act: 46, biomeId: 9, biomeName: BIOME_PALETTES[9].name, title: 'Bastion of the War-Mammoth', subtitle: 'Boss: General Iron-Jaws & The War Mammoth', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Border War Colosseum · Siege Turrets', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['hound_scout'], bossKind: 'cryo_fang', bossName: 'General Iron-Jaws & The War Mammoth', rewardTier: 10 },

  // WAR FRONT 2 (Acts 47–51): River of Claws Naval Bridgehead
  { act: 47, biomeId: 10, biomeName: BIOME_PALETTES[10].name, title: 'River of Claws Bridgehead', subtitle: 'Amphibious Dog Marines & Bridge Captures', role: 'normal', layout: 'twin_bridges', terrainTag: 'Naval Bridgehead · Catapult Bombardment', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['swamp_croc', 'hound_scout'], hasBlacksmith: true, rewardTier: 10 },
  { act: 48, biomeId: 10, biomeName: BIOME_PALETTES[10].name, title: 'Galleon Boarding Planks', subtitle: 'Ship-to-Ship Deck Skirmish', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Warship Decks · Harpoon Turrets', trapPool: ['arrow_turret', 'frost_crystal'], enemyPool: ['hound_scout', 'goblin_archer', 'swamp_croc'], rewardTier: 10 },
  { act: 49, biomeId: 10, biomeName: BIOME_PALETTES[10].name, title: 'Maelstrom Naval Drydock', subtitle: 'Mini-Boss: Admiral Fang-Tide', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Whirlpool Basin · Cannon & Frost Traps', trapPool: ['arrow_turret', 'frost_crystal'], enemyPool: ['swamp_croc', 'hound_scout'], bossKind: 'viperfang', bossName: 'Admiral Fang-Tide', rewardTier: 10 },
  { act: 50, biomeId: 10, biomeName: BIOME_PALETTES[10].name, title: 'Tempest Breakwater Isles', subtitle: 'Island Hopping Under Naval Fire', role: 'normal', layout: 'island_archipelago', terrainTag: 'Naval Isles · Harpoon & Rime Grates', trapPool: ['spike_trap', 'frost_crystal'], enemyPool: ['swamp_croc', 'ice_golem'], rewardTier: 10 },
  { act: 51, biomeId: 10, biomeName: BIOME_PALETTES[10].name, title: 'Dreadnought Anchorage', subtitle: 'Boss: Dreadnought War-Barge Cerberus', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Dreadnought Deck · Abyssal Moat', trapPool: ['frost_crystal', 'arrow_turret'], enemyPool: ['swamp_croc'], bossKind: 'viperfang', bossName: 'Dreadnought War-Barge Cerberus', rewardTier: 10 },

  // WAR FRONT 3 (Acts 52–56): Howling Canyon Siege Lines
  { act: 52, biomeId: 11, biomeName: BIOME_PALETTES[11].name, title: 'Captured Felis Village', subtitle: 'Smash Iron Cages to Recruit Freed Cat Knights!', role: 'normal', layout: 'winding_canyon', terrainTag: 'Howling Canyon · Prisoner Cages & Banners', trapPool: ['spike_trap', 'arrow_turret'], enemyPool: ['shadow_wolf', 'rabid_boar', 'hound_scout'], hasAdvisor: true, hasBlacksmith: true, rewardTier: 10 },
  { act: 53, biomeId: 11, biomeName: BIOME_PALETTES[11].name, title: 'Canyon of Falling Standards', subtitle: 'Encircled Outpost Liberation', role: 'normal', layout: 'island_archipelago', terrainTag: 'Canyon Isles · Crossbow Volley', trapPool: ['arrow_turret', 'spike_trap'], enemyPool: ['shadow_wolf', 'razor_badger'], rewardTier: 10 },
  { act: 54, biomeId: 11, biomeName: BIOME_PALETTES[11].name, title: 'Stockade of the Iron Collar', subtitle: 'Mini-Boss: Warden Blood-Howl', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Prison Stockade · Cages & Spike Traps', trapPool: ['void_pillar', 'spike_trap'], enemyPool: ['shadow_wolf', 'hound_scout'], bossKind: 'grommash', bossName: 'Warden Blood-Howl', rewardTier: 10 },
  { act: 55, biomeId: 11, biomeName: BIOME_PALETTES[11].name, title: 'Wailing Siege-Ruins', subtitle: 'Shattered Canyon Maze', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Ruined Bastion · Flame & Spore Traps', trapPool: ['flame_geyser', 'spore_vent'], enemyPool: ['shadow_wolf', 'sporeling', 'hound_scout'], rewardTier: 10 },
  { act: 56, biomeId: 11, biomeName: BIOME_PALETTES[11].name, title: 'Arena of the Twin-Axes', subtitle: 'Boss: Goliath the Twin-Axe Rottweiler', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Canyon Colosseum · Bloodmoon Pylons', trapPool: ['spike_trap', 'flame_geyser'], enemyPool: ['shadow_wolf'], bossKind: 'grommash', bossName: 'Goliath the Twin-Axe Rottweiler', rewardTier: 10 },

  // WAR FRONT 4 (Acts 57–61): Sky-Galleon Paratrooper Ridge
  { act: 57, biomeId: 12, biomeName: BIOME_PALETTES[12].name, title: 'Sky-Galleon Paratrooper Ridge', subtitle: 'High-Cliff Warfare with Cat Sky-Archers', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Sky-Bridges · Swooping Falcon-Hounds', trapPool: ['void_pillar', 'arrow_turret'], enemyPool: ['celestial_sentinel', 'hound_scout'], hasBlacksmith: true, rewardTier: 10 },
  { act: 58, biomeId: 12, biomeName: BIOME_PALETTES[12].name, title: 'Aether-Dock Mooring Bays', subtitle: 'Twin Airship Gangways', role: 'normal', layout: 'twin_bridges', terrainTag: 'Zeppelin Gangways · Arc Pylons', trapPool: ['void_pillar'], enemyPool: ['celestial_sentinel', 'shadow_wolf'], rewardTier: 10 },
  { act: 59, biomeId: 12, biomeName: BIOME_PALETTES[12].name, title: 'Cloud-Radar Bastion', subtitle: 'Mini-Boss: Wing-Commander Rex', role: 'miniboss', layout: 'courtyard_gates', terrainTag: 'Sky Courtyard · Storm Pylons & Turrets', trapPool: ['void_pillar', 'arrow_turret'], enemyPool: ['celestial_sentinel'], bossKind: 'aether_wing', bossName: 'Wing-Commander Rex', rewardTier: 10 },
  { act: 60, biomeId: 12, biomeName: BIOME_PALETTES[12].name, title: 'Stratosphere Gun-Deck', subtitle: 'High-Altitude Broadside Gauntlet', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Broadside Lanes · Lightning & Flame Traps', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['celestial_sentinel', 'lava_salamander'], rewardTier: 10 },
  { act: 61, biomeId: 12, biomeName: BIOME_PALETTES[12].name, title: 'Eyrie of the Wyvern-Hound', subtitle: 'Boss: Storm-Howler the Armored Wyvern-Hound', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Shattered Sky Arena · Arc Pylons', trapPool: ['void_pillar'], enemyPool: ['celestial_sentinel'], bossKind: 'aether_wing', bossName: 'Storm-Howler the Armored Wyvern-Hound', rewardTier: 10 },

  // WAR FRONT 5 (Acts 62–66): Frostbite Tundra Campaign
  { act: 62, biomeId: 13, biomeName: BIOME_PALETTES[13].name, title: 'Frostbite Tundra Trenches', subtitle: 'Cat Mages & Arcane Bonfires vs. Husky Legions', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Blizzard Trenches · Cryo Obelisks', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'shadow_wolf'], hasBlacksmith: true, rewardTier: 10 },
  { act: 63, biomeId: 13, biomeName: BIOME_PALETTES[13].name, title: 'Permafrost Siege Corridors', subtitle: 'Slippery Ice Artillery Lanes', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Sheer Ice Lanes · Cryo & Arrow Traps', trapPool: ['frost_crystal', 'arrow_turret'], enemyPool: ['ice_golem', 'hound_scout'], rewardTier: 10 },
  { act: 64, biomeId: 13, biomeName: BIOME_PALETTES[13].name, title: 'Keep of the Husky Berserkers', subtitle: 'Mini-Boss: Jarl Frost-Bite', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Winter Keep · Cryo Crystals & Spikes', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'shadow_wolf'], bossKind: 'brambleback', bossName: 'Jarl Frost-Bite', rewardTier: 10 },
  { act: 65, biomeId: 13, biomeName: BIOME_PALETTES[13].name, title: 'Howling Ice-Spire Bridges', subtitle: 'Frozen Viaducts Over the Abyss', role: 'normal', layout: 'twin_bridges', terrainTag: 'Glacier Bridges · Blizzard Crystals', trapPool: ['frost_crystal', 'void_pillar'], enemyPool: ['ice_golem', 'celestial_sentinel'], rewardTier: 10 },
  { act: 66, biomeId: 13, biomeName: BIOME_PALETTES[13].name, title: 'Summit of the Avalanche Titan', subtitle: 'Boss: Avalanche Titan Fenris-Mk.II', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Frost-Iron Arena · Cryo Obelisks', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem'], bossKind: 'cryo_fang', bossName: 'Avalanche Titan Fenris-Mk.II', rewardTier: 10 },

  // WAR FRONT 6 (Acts 67–71): Iron-Collar Foundry & War-Machine Factory
  { act: 67, biomeId: 14, biomeName: BIOME_PALETTES[14].name, title: 'Iron-Collar Steam Foundry', subtitle: 'Sabotaging Dog Kingdom Tank Lines with Cat Sappers', role: 'normal', layout: 'twin_bridges', terrainTag: 'Molten Slag Rivers · Furnace Vents', trapPool: ['flame_geyser'], enemyPool: ['lava_salamander', 'hound_scout'], hasBlacksmith: true, rewardTier: 10 },
  { act: 68, biomeId: 14, biomeName: BIOME_PALETTES[14].name, title: 'Blast-Furnace Assembly', subtitle: 'Suspended Foundry Catwalks', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Smelter Catwalks · Flame & Spike Grates', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['lava_salamander', 'goblin_archer'], rewardTier: 10 },
  { act: 69, biomeId: 14, biomeName: BIOME_PALETTES[14].name, title: 'Steam-Tank Dynamo Core', subtitle: 'Mini-Boss: Chief Engineer Spark-Bark', role: 'miniboss', layout: 'labyrinth_ruins', terrainTag: 'Iron Labyrinth · Slag Pits & Flame Vents', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['lava_salamander', 'hound_scout'], bossKind: 'mycora', bossName: 'Chief Engineer Spark-Bark', rewardTier: 10 },
  { act: 70, biomeId: 14, biomeName: BIOME_PALETTES[14].name, title: 'Hellfire Munitions Yard', subtitle: 'Dual-Lane Smelter Gauntlet', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Munitions Lanes · Magma & Turrets', trapPool: ['flame_geyser', 'arrow_turret'], enemyPool: ['lava_salamander', 'shadow_wolf'], rewardTier: 10 },
  { act: 71, biomeId: 14, biomeName: BIOME_PALETTES[14].name, title: 'Crucible of the Steam-Hound', subtitle: 'Boss: The Colossal Steam-Hound Colossus', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Foundry Core · Molten Perimeter', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['lava_salamander'], bossKind: 'volcanis', bossName: 'The Colossal Steam-Hound Colossus', rewardTier: 10 },

  // WAR FRONT 7 (Acts 72–76): Shadow-Fang Citadel Outer Walls
  { act: 72, biomeId: 15, biomeName: BIOME_PALETTES[15].name, title: 'Shadow-Fang Outer Gatehouse', subtitle: 'Escort the Cat Kingdom Lion-Ram Through the Gates!', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Citadel Gate 1 · Boiling Oil & Ballistas', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['hound_scout', 'lava_salamander', 'shadow_wolf'], hasBlacksmith: true, rewardTier: 10 },
  { act: 73, biomeId: 15, biomeName: BIOME_PALETTES[15].name, title: 'Murder-Hole Bastion', subtitle: 'Breaching the Second Citadel Wall', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Citadel Gate 2 · Void & Flame Traps', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['shadow_wolf', 'celestial_sentinel'], rewardTier: 10 },
  { act: 74, biomeId: 15, biomeName: BIOME_PALETTES[15].name, title: 'Inquisition Dread-Keep', subtitle: 'Mini-Boss: High Inquisitor Varg', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Execution Keep · Spikes & Void Pylons', trapPool: ['spike_trap', 'void_pillar'], enemyPool: ['shadow_wolf', 'hound_scout'], bossKind: 'general_vane', bossName: 'High Inquisitor Varg', rewardTier: 10 },
  { act: 75, biomeId: 15, biomeName: BIOME_PALETTES[15].name, title: 'Magma-Moat Inner Causeway', subtitle: 'Smashing the Third Fortress Gate', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Citadel Gate 3 · Magma & Arc Traps', trapPool: ['flame_geyser', 'void_pillar'], enemyPool: ['lava_salamander', 'celestial_sentinel', 'shadow_wolf'], rewardTier: 10 },
  { act: 76, biomeId: 15, biomeName: BIOME_PALETTES[15].name, title: 'Chamber of the Hound Dukes', subtitle: 'Boss: The Four Royal Hound Dukes', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Obsidian Senate · Void & Flame Rings', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['shadow_wolf', 'hound_scout'], bossKind: 'general_vane', bossName: 'The Four Royal Hound Dukes', rewardTier: 10 },

  // WAR FRONT 8 (Acts 77–80): The Obsidian War-Palace Gauntlet
  { act: 77, biomeId: 16, biomeName: BIOME_PALETTES[16].name, title: 'Obsidian War-Palace Entrance', subtitle: 'King Leo & The Great Duck Fight Beside Nyx!', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Royal Hero Trio · Palace Vanguard', trapPool: ['void_pillar', 'frost_crystal'], enemyPool: ['celestial_sentinel', 'shadow_wolf'], hasBlacksmith: true, rewardTier: 10 },
  { act: 78, biomeId: 16, biomeName: BIOME_PALETTES[16].name, title: 'Hall of Clashing Crowns', subtitle: 'Golden Lion Guard vs. Imperial Wolf Guard', role: 'normal', layout: 'twin_bridges', terrainTag: 'Palace Grand Hall · Dual Void Pylons', trapPool: ['void_pillar', 'spike_trap'], enemyPool: ['celestial_sentinel', 'shadow_wolf', 'hound_scout'], rewardTier: 10 },
  { act: 79, biomeId: 16, biomeName: BIOME_PALETTES[16].name, title: 'Sanctum of the Eclipse Blade', subtitle: 'Mini-Boss: Shadow-General Kiba Awakened', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Eclipse Sanctum · Astral Storms', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['shadow_wolf', 'celestial_sentinel'], bossKind: 'aether_wing', bossName: 'Shadow-General Kiba Awakened', rewardTier: 10 },
  { act: 80, biomeId: 16, biomeName: BIOME_PALETTES[16].name, title: 'Throne Approach of the Undefeated', subtitle: 'Boss: Grand Marshal Lupus the Undefeated', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Imperial War-Court · Calamity Pylons', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['celestial_sentinel', 'shadow_wolf'], bossKind: 'volcanis', bossName: 'Grand Marshal Lupus the Undefeated', rewardTier: 10 },

  // ACT 81: THE GREAT DUCK'S SUPREME WAR COUNCIL & STAR-FORGE
  { act: 81, biomeId: 'war_sanctuary', biomeName: BIOME_PALETTES.war_sanctuary.name, title: "The Great Duck's Supreme War Council", subtitle: 'King Leo & The Great Duck Grant Tier 20 Primordial Gear!', role: 'sanctuary', layout: 'sanctuary_lotus', terrainTag: 'Obsidian Command Pavilion & Star-Forge', trapPool: [], enemyPool: [], hasAdvisor: true, hasBlacksmith: true, rewardTier: 11 },

  // ACT 82 GRAND FINALE: THE OBSIDIAN COLOSSEUM OF KINGS — 3-PHASE FINAL WAR BOSS
  { act: 82, biomeId: 'imperial_throne', biomeName: BIOME_PALETTES.imperial_throne.name, title: 'Obsidian Colosseum: Ragnarok Finale', subtitle: '3-Phase Finale: Dread-Chariot, Dual-Sovereign & Ragnarok', role: 'final_boss', layout: 'throne_hall', terrainTag: 'Obsidian Colosseum · 3-Phase Ragnarok Finale', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: [], bossKind: 'fenrir_p1', bossName: 'War-Emperor Fenrir & Dread-Chariot Cerberus (Phase 1/3)', rewardTier: 11 },

  // ============================================================================
  // ARC III (ACTS 83–122): THE DRAGON CATACLYSM AFTER THE PEACE (40 DRAGON ACTS)
  // ============================================================================

  // BIOME 17 (Acts 83–87): Scorched Peace Courtyard & Smoldering Ruins (T21–22)
  { act: 83, biomeId: 17, biomeName: BIOME_PALETTES[17].name, title: 'Scorched Peace Courtyard', subtitle: 'Cats & Dogs Unite as Ignis-Bahamut Strikes!', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Shattered Treaty Plaza · Ember Geysers', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['wyvern_kin', 'kobold_thief', 'drakonid_lancer'], hasAdvisor: true, hasBlacksmith: true, rewardTier: 21 },
  { act: 84, biomeId: 17, biomeName: BIOME_PALETTES[17].name, title: 'Ashen Banquet Causeway', subtitle: 'Rescuing Trapped Knights Under Dragonfire', role: 'normal', layout: 'twin_bridges', terrainTag: 'Smoldering Bridges · Flame Vents', trapPool: ['flame_geyser', 'arrow_turret'], enemyPool: ['wyvern_kin', 'drakonid_lancer'], rewardTier: 21 },
  { act: 85, biomeId: 17, biomeName: BIOME_PALETTES[17].name, title: 'Hoard-Sack Garrison', subtitle: 'Mini-Boss: Pyre-Claw the Kobold Hoard-Master', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Looted Keep · Flame & Dart Traps', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['kobold_thief', 'wyvern_kin'], bossKind: 'dragon_boss', bossName: 'Pyre-Claw the Kobold Hoard-Master', rewardTier: 21 },
  { act: 86, biomeId: 17, biomeName: BIOME_PALETTES[17].name, title: 'Cindered Siege-Trench', subtitle: 'Dragon-Slayer Vanguard Breakthrough', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Cinder Lanes · Lava Mire & Geysers', trapPool: ['flame_geyser'], enemyPool: ['drakonid_lancer', 'magma_drake', 'kobold_thief'], rewardTier: 22 },
  { act: 87, biomeId: 17, biomeName: BIOME_PALETTES[17].name, title: 'Ruins of the Iron Wyvern', subtitle: 'Elder Boss: Vermithrax the Armored Siege-Wyvern', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Scorched Arena · Wyvern Firestorms', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['wyvern_kin', 'drakonid_lancer'], bossKind: 'dragon_boss', bossName: 'Vermithrax the Armored Siege-Wyvern', rewardTier: 22 },

  // BIOME 18 (Acts 88–92): Ashen Gold-Vault Caverns (T23)
  { act: 88, biomeId: 18, biomeName: BIOME_PALETTES[18].name, title: 'Ashen Gold-Vault Caverns', subtitle: 'Tracking the Stolen Royal Treasury', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Gold Vaults · Kobold Raiders & Geysers', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['kobold_thief', 'drakonid_lancer'], hasBlacksmith: true, rewardTier: 23 },
  { act: 89, biomeId: 18, biomeName: BIOME_PALETTES[18].name, title: 'Molten Bullion River', subtitle: 'Crossing Liquid Gold Bridges', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Gold Catwalks · Magma Vents', trapPool: ['flame_geyser', 'arrow_turret'], enemyPool: ['magma_drake', 'kobold_thief'], rewardTier: 23 },
  { act: 90, biomeId: 18, biomeName: BIOME_PALETTES[18].name, title: 'Chamber of Gilded Traps', subtitle: 'Mini-Boss: Greed-Maw the Mimic-Drake', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Treasure Ring · Mimic Ambush', trapPool: ['spike_trap', 'flame_geyser'], enemyPool: ['kobold_thief', 'magma_drake'], bossKind: 'dragon_boss', bossName: 'Greed-Maw the Mimic-Drake', rewardTier: 23 },
  { act: 91, biomeId: 18, biomeName: BIOME_PALETTES[18].name, title: 'Smelted Crown Gallery', subtitle: 'Reclaiming the First Dragon-Scale Shard', role: 'normal', layout: 'winding_canyon', terrainTag: 'Gilded Chasm · Flame & Spike Grates', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['drakonid_lancer', 'magma_drake'], rewardTier: 23 },
  { act: 92, biomeId: 18, biomeName: BIOME_PALETTES[18].name, title: 'Sanctum of Liquid Gold', subtitle: 'Elder Boss: Aurum-Rex the Molten Gold Dragon', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Molten Gold Arena · Gilded Firestorms', trapPool: ['flame_geyser'], enemyPool: ['magma_drake', 'kobold_thief'], bossKind: 'dragon_boss', bossName: 'Aurum-Rex the Molten Gold Dragon', rewardTier: 23 },

  // BIOME 19 (Acts 93–97): Storm-Scale Sky-Bridges & Shattered Spire (T24)
  { act: 93, biomeId: 19, biomeName: BIOME_PALETTES[19].name, title: 'Storm-Scale Sky-Bridges', subtitle: 'Ascending Above the Thunderheads', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Sky-Bridges · Lightning Pylons', trapPool: ['void_pillar', 'arrow_turret'], enemyPool: ['wyvern_kin', 'void_sorcerer'], hasBlacksmith: true, rewardTier: 24 },
  { act: 94, biomeId: 19, biomeName: BIOME_PALETTES[19].name, title: 'Thunderhead Viaduct', subtitle: 'Twin Bridges in Lightning Crossfire', role: 'normal', layout: 'twin_bridges', terrainTag: 'Storm Viaducts · Arc Pylons', trapPool: ['void_pillar'], enemyPool: ['wyvern_kin', 'drakonid_lancer'], rewardTier: 24 },
  { act: 95, biomeId: 19, biomeName: BIOME_PALETTES[19].name, title: 'Spire of Static Fangs', subtitle: 'Mini-Boss: Volt-Talon the Thunder-Drakonid', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Lightning Spire · Shock Pylons', trapPool: ['void_pillar', 'spike_trap'], enemyPool: ['drakonid_lancer', 'void_sorcerer'], bossKind: 'dragon_boss', bossName: 'Volt-Talon the Thunder-Drakonid', rewardTier: 24 },
  { act: 96, biomeId: 19, biomeName: BIOME_PALETTES[19].name, title: 'Cyclone Archipelago', subtitle: 'Cloud-Isles Under Wyvern Dive-Bombs', role: 'normal', layout: 'island_archipelago', terrainTag: 'Sky Isles · Gale & Arc Traps', trapPool: ['void_pillar', 'arrow_turret'], enemyPool: ['wyvern_kin', 'void_sorcerer', 'kobold_thief'], rewardTier: 24 },
  { act: 97, biomeId: 19, biomeName: BIOME_PALETTES[19].name, title: 'Eye of the Dragon-Tempest', subtitle: 'Elder Boss: Tempestria the Twin-Winged Storm Dragon', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Tempest Spire Arena · Lightning Rings', trapPool: ['void_pillar'], enemyPool: ['wyvern_kin', 'void_sorcerer'], bossKind: 'dragon_boss', bossName: 'Tempestria the Twin-Winged Storm Dragon', rewardTier: 24 },

  // BIOME 20 (Acts 98–102): Frozen Dragon-Graveyard & Permafrost Peak (T25)
  { act: 98, biomeId: 20, biomeName: BIOME_PALETTES[20].name, title: 'Frozen Dragon-Graveyard', subtitle: 'Necro-Drakes Rising from Ancient Bones', role: 'normal', layout: 'winding_canyon', terrainTag: 'Rime Canyon · Cryo Obelisks', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'drakonid_lancer', 'wyvern_kin'], hasBlacksmith: true, rewardTier: 25 },
  { act: 99, biomeId: 20, biomeName: BIOME_PALETTES[20].name, title: 'Glacial Ribcage Maze', subtitle: 'Labyrinth of Petrified Wyrm-Bones', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Ice Labyrinth · Cryo & Spike Traps', trapPool: ['frost_crystal', 'spike_trap'], enemyPool: ['ice_golem', 'void_sorcerer'], rewardTier: 25 },
  { act: 100, biomeId: 20, biomeName: BIOME_PALETTES[20].name, title: 'Mausoleum of Absolute Zero', subtitle: 'Mini-Boss: Bone-Chill the Skeletal Frost-Drake', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Permafrost Ring · Blizzard Obelisks', trapPool: ['frost_crystal'], enemyPool: ['ice_golem', 'wyvern_kin'], bossKind: 'dragon_boss', bossName: 'Bone-Chill the Skeletal Frost-Drake', rewardTier: 25 },
  { act: 101, biomeId: 20, biomeName: BIOME_PALETTES[20].name, title: 'Permafrost Ice-Floes', subtitle: 'Advancing Across Frozen Shatter-Lakes', role: 'normal', layout: 'island_archipelago', terrainTag: 'Frozen Isles · Cryo Crystals', trapPool: ['frost_crystal', 'void_pillar'], enemyPool: ['drakonid_lancer', 'ice_golem'], rewardTier: 25 },
  { act: 102, biomeId: 20, biomeName: BIOME_PALETTES[20].name, title: 'Throne of Eternal Permafrost', subtitle: 'Elder Boss: Glacius-Zero the Necro-Ice Dragon', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Glacial Colosseum · Zero-Kelvin Storms', trapPool: ['frost_crystal'], enemyPool: ['ice_golem', 'wyvern_kin'], bossKind: 'dragon_boss', bossName: 'Glacius-Zero the Necro-Ice Dragon', rewardTier: 25 },

  // BIOME 21 (Acts 103–107): Venom-Scale Jungle & Acid Caldera (T26)
  { act: 103, biomeId: 21, biomeName: BIOME_PALETTES[21].name, title: 'Venom-Scale Canopy', subtitle: 'Emerald Wyverns in the Acid Rainforest', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Acid Canopy · Toxic Spore Vents', trapPool: ['spore_vent', 'arrow_turret'], enemyPool: ['wyvern_kin', 'swamp_croc', 'drakonid_lancer'], hasBlacksmith: true, rewardTier: 26 },
  { act: 104, biomeId: 21, biomeName: BIOME_PALETTES[21].name, title: 'Blight-Root Causeways', subtitle: 'Poison Moat Crossing with Dog & Cat Sappers', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Acid Lanes · Spore Geysers', trapPool: ['spore_vent', 'spike_trap'], enemyPool: ['swamp_croc', 'kobold_thief', 'void_sorcerer'], rewardTier: 26 },
  { act: 105, biomeId: 21, biomeName: BIOME_PALETTES[21].name, title: 'Basilisk Breeding Pit', subtitle: 'Mini-Boss: Blight-Wing the Basilisk-Rider', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Venom Keep · Spore & Dart Traps', trapPool: ['spore_vent', 'arrow_turret'], enemyPool: ['wyvern_kin', 'swamp_croc'], bossKind: 'dragon_boss', bossName: 'Blight-Wing the Basilisk-Rider', rewardTier: 26 },
  { act: 106, biomeId: 21, biomeName: BIOME_PALETTES[21].name, title: 'Caldera of Boiling Emerald', subtitle: 'Acid Archipelago Before the Hydra Nest', role: 'normal', layout: 'island_archipelago', terrainTag: 'Acid Caldera · Spore Vents', trapPool: ['spore_vent'], enemyPool: ['drakonid_lancer', 'void_sorcerer'], rewardTier: 26 },
  { act: 107, biomeId: 21, biomeName: BIOME_PALETTES[21].name, title: 'Five-Headed Hydra Nest', subtitle: 'Elder Boss: Miasma-Gorgon the Five-Headed Hydra-Dragon', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Acid Arena · Toxic Hydras & Vents', trapPool: ['spore_vent'], enemyPool: ['wyvern_kin', 'swamp_croc'], bossKind: 'dragon_boss', bossName: 'Miasma-Gorgon the Five-Headed Hydra-Dragon', rewardTier: 26 },

  // BIOME 22 (Acts 108–112): Astral Star-Forge Ruins (T27)
  { act: 108, biomeId: 22, biomeName: BIOME_PALETTES[22].name, title: 'Astral Star-Forge Ruins', subtitle: 'Shattered Constellations & Star-Drakes', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Star-Forge Plaza · Void Pylons', trapPool: ['void_pillar', 'spike_trap'], enemyPool: ['void_sorcerer', 'celestial_sentinel', 'drakonid_lancer'], hasBlacksmith: true, rewardTier: 27 },
  { act: 109, biomeId: 22, biomeName: BIOME_PALETTES[22].name, title: 'Nebula Bridge of Memories', subtitle: 'Twin Starlight Bridges Across the Void', role: 'normal', layout: 'twin_bridges', terrainTag: 'Starlight Bridges · Astral Pylons', trapPool: ['void_pillar'], enemyPool: ['wyvern_kin', 'void_sorcerer'], rewardTier: 27 },
  { act: 110, biomeId: 22, biomeName: BIOME_PALETTES[22].name, title: 'Clockwork Nebula Sanctum', subtitle: 'Mini-Boss: Chronos-Drake the Time-Eater', role: 'miniboss', layout: 'spiral_hollow', terrainTag: 'Temporal Ring · Void & Frost Traps', trapPool: ['void_pillar', 'frost_crystal'], enemyPool: ['void_sorcerer', 'celestial_sentinel'], bossKind: 'dragon_boss', bossName: 'Chronos-Drake the Time-Eater', rewardTier: 27 },
  { act: 111, biomeId: 22, biomeName: BIOME_PALETTES[22].name, title: 'Comet-Anvil Labyrinth', subtitle: 'Forging the Anti-Bahamut Dragon-Lances', role: 'normal', layout: 'labyrinth_ruins', terrainTag: 'Star-Anvil Maze · Cosmic Pylons', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['drakonid_lancer', 'magma_drake', 'void_sorcerer'], rewardTier: 27 },
  { act: 112, biomeId: 22, biomeName: BIOME_PALETTES[22].name, title: 'Heart of the Star-Forge', subtitle: 'Elder Boss: Nebula-Wyrm the Cosmic Star-Dragon', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Astral Colosseum · Supernova Pylons', trapPool: ['void_pillar'], enemyPool: ['void_sorcerer', 'wyvern_kin'], bossKind: 'dragon_boss', bossName: 'Nebula-Wyrm the Cosmic Star-Dragon', rewardTier: 27 },

  // BIOME 23 (Acts 113–117): Abyssal Dragon Citadel & Magma Sanctum (T28–29)
  { act: 113, biomeId: 23, biomeName: BIOME_PALETTES[23].name, title: 'Abyssal Dragon Citadel', subtitle: 'Storming Bahamut’s Obsidian Bastion', role: 'normal', layout: 'courtyard_gates', terrainTag: 'Citadel Gates · Magma & Void Traps', trapPool: ['flame_geyser', 'void_pillar'], enemyPool: ['drakonid_lancer', 'magma_drake', 'wyvern_kin'], hasBlacksmith: true, rewardTier: 28 },
  { act: 114, biomeId: 23, biomeName: BIOME_PALETTES[23].name, title: 'Magma-Moat Siege Corridor', subtitle: 'King Leo & Wolf-King Fenrir Hold the Line!', role: 'normal', layout: 'hazard_gauntlet', terrainTag: 'Magma Gauntlet · Inferno Geysers', trapPool: ['flame_geyser', 'spike_trap'], enemyPool: ['magma_drake', 'drakonid_lancer', 'void_sorcerer'], rewardTier: 28 },
  { act: 115, biomeId: 23, biomeName: BIOME_PALETTES[23].name, title: 'Barracks of the Dragon-Knights', subtitle: 'Mini-Boss: Dread-General Malakor the Dragon-Knight', role: 'miniboss', layout: 'watchtower_fort', terrainTag: 'Dragon Keep · Flame & Void Pylons', trapPool: ['flame_geyser', 'void_pillar'], enemyPool: ['drakonid_lancer', 'magma_drake'], bossKind: 'dragon_boss', bossName: 'Dread-General Malakor the Dragon-Knight', rewardTier: 28 },
  { act: 116, biomeId: 23, biomeName: BIOME_PALETTES[23].name, title: 'Obsidian Crucible Bridge', subtitle: 'Twin Viaducts Above the Abyssal Core', role: 'normal', layout: 'twin_bridges', terrainTag: 'Abyssal Bridges · Hellfire Vents', trapPool: ['flame_geyser', 'void_pillar'], enemyPool: ['magma_drake', 'void_sorcerer'], rewardTier: 29 },
  { act: 117, biomeId: 23, biomeName: BIOME_PALETTES[23].name, title: 'Inner Magma Sanctum', subtitle: 'Elder Boss: Inferno-Lord Balrog-Drake', role: 'boss', layout: 'boss_colosseum', terrainTag: 'Magma Sanctum · Erupting Inferno', trapPool: ['flame_geyser', 'void_pillar'], enemyPool: ['magma_drake', 'drakonid_lancer'], bossKind: 'dragon_boss', bossName: 'Inferno-Lord Balrog-Drake', rewardTier: 29 },

  // BIOME 24 (Acts 118–120): Ascent to the Shattered Sky-Throne (T29)
  { act: 118, biomeId: 24, biomeName: BIOME_PALETTES[24].name, title: 'Sky-Throne Outer Stairway', subtitle: 'Cat & Dog Alliance Final Ascent', role: 'normal', layout: 'canopy_walkways', terrainTag: 'Sky-Stairs · Astral & Flame Pylons', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['wyvern_kin', 'drakonid_lancer', 'void_sorcerer'], hasBlacksmith: true, rewardTier: 29 },
  { act: 119, biomeId: 24, biomeName: BIOME_PALETTES[24].name, title: 'Hall of Fallen Crowns', subtitle: 'Piercing the Outer Dragon-Guard', role: 'normal', layout: 'winding_canyon', terrainTag: 'Sky-Spire Gauntlet · Dual Pylons', trapPool: ['void_pillar', 'frost_crystal'], enemyPool: ['magma_drake', 'void_sorcerer', 'drakonid_lancer'], rewardTier: 29 },
  { act: 120, biomeId: 24, biomeName: BIOME_PALETTES[24].name, title: 'Eclipse Twin-Spire Gate', subtitle: 'Mini-Boss: Eclipse-Twin Dragons Sol & Luna', role: 'miniboss', layout: 'boss_colosseum', terrainTag: 'Eclipse Gate · Solar & Lunar Storms', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: ['wyvern_kin', 'void_sorcerer'], bossKind: 'dragon_boss', bossName: 'Eclipse-Twin Dragons Sol & Luna', rewardTier: 29 },

  // ACT 121: UNITED SANCTUM OF CAT, DOG & DUCK (TIER 30 OMNI FORGE!)
  { act: 121, biomeId: 'dragon_sanctuary', biomeName: BIOME_PALETTES.dragon_sanctuary.name, title: 'Floating Astral Star-Forge Sanctum', subtitle: 'King Leo, Wolf-King Fenrir & The Great Duck Forge Tier 30 Gear!', role: 'sanctuary', layout: 'sanctuary_lotus', terrainTag: 'Floating Astral Star-Forge · Tier 30 Forge', trapPool: [], enemyPool: [], hasAdvisor: true, hasBlacksmith: true, rewardTier: 30 },

  // ACT 122: TRUE GRAND FINALE — IGNIS-BAHAMUT, THE WORLD-BREAKER DRAGON (1,500,000 HP)
  { act: 122, biomeId: 'sky_throne', biomeName: BIOME_PALETTES.sky_throne.name, title: 'Shattered Sky-Throne: World-Breaker Finale', subtitle: '3-Phase Final Boss: Ignis-Bahamut, The World-Breaker Dragon', role: 'final_boss', layout: 'throne_hall', terrainTag: 'Shattered Sky-Throne · 4 Corner Harpoon Ballistas & 3 Phases', trapPool: ['void_pillar', 'flame_geyser'], enemyPool: [], bossKind: 'bahamut_p1', bossName: 'Ignis-Bahamut, The World-Breaker Dragon (Phase 1/3)', rewardTier: 30 },
  ...ACTS_123_TO_300,
];

export const ACTS_SUMMARY: ActSummary[] = ACTS_DATA.map((a) => ({
  act: a.act,
  title: a.title,
  biomeId: a.biomeId,
  biomeName: a.biomeName,
  role: a.role,
  terrainTag: a.terrainTag,
}));

export function getActConfig(actNum: number): ActConfig {
  return ACTS_DATA[Math.max(0, Math.min(ACTS_DATA.length - 1, actNum - 1))];
}

// ============================================================================
// ANTI-CLONE SHUFFLE-BAG SPAWNER & BESPOKE BOSS VISUAL ID RESOLVER
// Guarantees no two adjacent Allied Cats or Dog Legionnaires share the same coat/breed/headgear!
// ============================================================================
const ALL_CAT_COATS: CatCoatId[] = [
  'ginger_tabby',
  'tuxedo',
  'calico_tri',
  'siamese_royal',
  'russian_blue',
  'golden_lion',
];
const ALL_DOG_BREEDS: DogBreedId[] = [
  'bulldog_phalanx',
  'doberman_shock',
  'husky_raider',
  'bloodhound_gunner',
];
const SHIELD_EMBLEMS = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#9333ea'];
const CAT_EYE_COLORS = ['#38bdf8', '#10b981', '#fbbf24', '#a855f7', '#22d3ee'];
const ENEMY_EYE_COLORS = ['#ef4444', '#f97316', '#fde047', '#38bdf8', '#ec4899'];

let catShuffleCursor = 0;
let enemyShuffleCursor = 0;

function nextCatVariant(unitKind: AlliedCatUnitKind): UnitVisualVariant {
  const idx = catShuffleCursor++;
  const coatId = ALL_CAT_COATS[idx % ALL_CAT_COATS.length];
  const helmetId =
    unitKind === 'arcane_cat_mage'
      ? 4
      : unitKind === 'calico_archer'
      ? 3
      : unitKind === 'lion_halberdier'
      ? 2
      : idx % 3;
  return {
    coatId,
    helmetId,
    weaponId: idx % 4,
    shieldEmblemColor: SHIELD_EMBLEMS[idx % SHIELD_EMBLEMS.length],
    eyeColor: coatId === 'russian_blue' ? '#10b981' : CAT_EYE_COLORS[idx % CAT_EYE_COLORS.length],
    scarOrStripe: idx % 4,
    animPhaseOffset: ((idx * 1.73) % (Math.PI * 2)) + Math.random() * 0.35,
  };
}

function nextEnemyVariant(): UnitVisualVariant {
  const idx = enemyShuffleCursor++;
  const breedId = ALL_DOG_BREEDS[idx % ALL_DOG_BREEDS.length];
  return {
    coatId: ALL_CAT_COATS[idx % ALL_CAT_COATS.length],
    breedId,
    helmetId: idx % 5,
    weaponId: (idx * 3) % 4,
    shieldEmblemColor: SHIELD_EMBLEMS[(idx + 2) % SHIELD_EMBLEMS.length],
    eyeColor: ENEMY_EYE_COLORS[idx % ENEMY_EYE_COLORS.length],
    scarOrStripe: idx % 4,
    animPhaseOffset: ((idx * 2.17) % (Math.PI * 2)) + Math.random() * 0.35,
  };
}

export function resolveBossVisualId(
  actNum: number,
  kind: EnemyKind,
  isMiniBoss: boolean,
  isBoss: boolean
): string | undefined {
  if (!isMiniBoss && !isBoss) return undefined;
  if (actNum === 85) return 'mini_pyre_claw';
  if (actNum === 90) return 'mini_greed_maw';
  if (actNum === 95) return 'mini_volt_talon';
  if (actNum === 100) return 'mini_bone_chill';
  if (actNum === 105) return 'mini_blight_wing';
  if (actNum === 110) return 'mini_chronos_drake';
  if (actNum === 115) return 'mini_malakor';
  if (actNum === 120) return 'mini_sol_luna';
  if (isMiniBoss) {
    if (actNum === 3) return 'mini_knucklebite';
    if (actNum === 8) return 'mini_gore_tusk';
    if (actNum === 13 || actNum === 69) return 'mini_snaggletooth';
    if (actNum === 18 || actNum === 59) return 'mini_talon_eye';
    if (actNum === 23 || actNum === 64) return 'mini_shivermaw';
    if (actNum === 28) return 'mini_ignis_crag';
    if (actNum === 33 || actNum === 49) return 'mini_dread_scale';
    if (actNum === 38 || actNum === 79 || actNum === 44 || actNum === 54 || actNum === 74) return 'mini_kiba';
    return 'mini_kiba';
  }
  // Regional & Final Bosses across Arc 1 (Acts 1–41), Arc 2 (Acts 42–82), & Arc 3 (Acts 83–122)
  if (actNum === 87) return 'boss_vermithrax';
  if (actNum === 92) return 'boss_aurum_rex';
  if (actNum === 97) return 'boss_tempestria';
  if (actNum === 102) return 'boss_glacius_zero';
  if (actNum === 107) return 'boss_miasma_gorgon';
  if (actNum === 112) return 'boss_nebula_wyrm';
  if (actNum === 117) return 'boss_balrog_drake';
  if (kind === 'bahamut_p1') return 'boss_bahamut_p1';
  if (kind === 'bahamut_p2') return 'boss_bahamut_p2';
  if (kind === 'bahamut_p3') return 'boss_bahamut_p3';
  if (actNum === 46) return 'boss_iron_jaws';
  if (actNum === 51) return 'boss_cerberus_barge';
  if (actNum === 56) return 'boss_goliath';
  if (actNum === 61) return 'boss_storm_howler';
  if (actNum === 66) return 'boss_avalanche_titan';
  if (actNum === 71) return 'boss_steam_colossus';
  if (actNum === 76) return 'boss_hound_dukes';
  if (actNum === 80) return 'boss_marshal_lupus';
  if (actNum === 82 && kind === 'fenrir_p1') return 'boss_emperor_chariot_p1';
  if (actNum === 82 && kind === 'fenrir_p2') return 'boss_ragnarok';

  switch (kind) {
    case 'grommash':
      return 'boss_grommash';
    case 'brambleback':
      return 'boss_brambleback';
    case 'mycora':
      return 'boss_mycora';
    case 'general_vane':
      return 'boss_general_vane';
    case 'cryo_fang':
      return 'boss_cryo_fang';
    case 'volcanis':
      return 'boss_volcanis';
    case 'viperfang':
      return 'boss_viperfang';
    case 'aether_wing':
      return 'boss_aether_wing';
    case 'fenrir_p1':
      return actNum >= 82 ? 'boss_emperor_chariot_p1' : 'boss_fenrir_p1';
    case 'fenrir_p2':
      return actNum >= 82 ? 'boss_ragnarok' : 'boss_fenrir_p2';
    case 'dragon_boss':
      return 'boss_vermithrax';
    default:
      return 'boss_grommash';
  }
}

function makeScaledEnemy(
  id: string,
  kind: EnemyKind,
  x: number,
  y: number,
  actNum: number,
  nightmareMode: boolean,
  overrideName?: string,
  overrideRole?: 'miniboss' | 'boss'
): Enemy {
  const effectiveAct = actNum <= 41 ? actNum : 41 + (actNum - 41) * 0.55;
  const scale = 1 + (effectiveAct - 1) * 0.14;
  const nm = nightmareMode ? 1.55 : 1;
  const totalScale = scale * nm;

  const isFenrirP1 = kind === 'fenrir_p1';
  const isFenrirP2 = kind === 'fenrir_p2';
  const isBahamut = kind === 'bahamut_p1' || kind === 'bahamut_p2' || kind === 'bahamut_p3';
  const isFinal = isFenrirP1 || isFenrirP2 || isBahamut;

  const variant = nextEnemyVariant();

  let archetype: Enemy['archetype'] = 'grunt';
  let name = overrideName ?? 'Forest Goblin';
  let baseHp = 28;
  let baseAtk = 7;
  let speed = 50;
  let width = 14;
  let height = 14;
  let isBoss = overrideRole === 'boss' || isFinal;
  const isMiniBoss = overrideRole === 'miniboss';

  const breedNames: Record<DogBreedId, string> = {
    bulldog_phalanx: 'Bulldog Heavy Phalanx',
    doberman_shock: 'Doberman Shock-Trooper',
    husky_raider: 'Siberian Husky Raider',
    bloodhound_gunner: 'Bloodhound Siege Gunner',
  };

  switch (kind) {
    case 'goblin_grunt':
      name = overrideName ?? 'Forest Goblin';
      archetype = 'grunt';
      baseHp = 28;
      baseAtk = 7;
      speed = 50;
      break;
    case 'goblin_archer':
      name = overrideName ?? 'Goblin Archer';
      archetype = 'ranged';
      baseHp = 22;
      baseAtk = 8;
      speed = 42;
      break;
    case 'rabid_boar':
      name = overrideName ?? 'Rabid Boar';
      archetype = 'charger';
      baseHp = 36;
      baseAtk = 10;
      speed = 55;
      width = 15;
      break;
    case 'razor_badger':
      name = overrideName ?? 'Razor Badger';
      archetype = 'grunt';
      baseHp = 34;
      baseAtk = 9;
      speed = 64;
      break;
    case 'hound_scout':
      name = overrideName ?? breedNames[variant.breedId ?? 'bulldog_phalanx'];
      archetype = variant.breedId === 'bloodhound_gunner' ? 'ranged' : 'grunt';
      baseHp = variant.breedId === 'bulldog_phalanx' ? 46 : 38;
      baseAtk = 10;
      speed = variant.breedId === 'doberman_shock' ? 68 : 58;
      break;
    case 'shadow_wolf':
      name = overrideName ?? breedNames[variant.breedId ?? 'doberman_shock'];
      archetype = 'charger';
      baseHp = 34;
      baseAtk = 11;
      speed = 74;
      break;
    case 'sporeling':
      name = overrideName ?? 'Spore Alchemist';
      archetype = 'ranged';
      baseHp = 30;
      baseAtk = 10;
      speed = 44;
      break;
    case 'ice_golem':
      name = overrideName ?? 'Frost Golem';
      archetype = 'grunt';
      baseHp = 48;
      baseAtk = 12;
      speed = 42;
      width = 16;
      height = 16;
      break;
    case 'lava_salamander':
      name = overrideName ?? 'Cinder Salamander';
      archetype = 'ranged';
      baseHp = 40;
      baseAtk = 12;
      speed = 52;
      break;
    case 'swamp_croc':
      name = overrideName ?? 'Blight Croc';
      archetype = 'charger';
      baseHp = 46;
      baseAtk = 12;
      speed = 56;
      break;
    case 'celestial_sentinel':
      name = overrideName ?? 'Astral Sentinel';
      archetype = 'ranged';
      baseHp = 48;
      baseAtk = 13;
      speed = 56;
      break;
    case 'wyvern_kin':
      name = overrideName ?? 'Wyvern Sky-Stalker';
      archetype = 'charger';
      baseHp = 85;
      baseAtk = 16;
      speed = 74;
      width = 18;
      height = 18;
      break;
    case 'drakonid_lancer':
      name = overrideName ?? 'Drakonid Shield-Lancer';
      archetype = 'grunt';
      baseHp = 110;
      baseAtk = 17;
      speed = 58;
      width = 18;
      height = 18;
      break;
    case 'kobold_thief':
      name = overrideName ?? 'Kobold Hoard-Thief';
      archetype = 'grunt';
      baseHp = 75;
      baseAtk = 14;
      speed = 78;
      width = 16;
      height = 16;
      break;
    case 'magma_drake':
      name = overrideName ?? 'Magma Fire-Drake';
      archetype = 'ranged';
      baseHp = 98;
      baseAtk = 18;
      speed = 60;
      width = 18;
      height = 18;
      break;
    case 'void_sorcerer':
      name = overrideName ?? 'Void-Scale Dragon Mage';
      archetype = 'mage';
      baseHp = 92;
      baseAtk = 19;
      speed = 54;
      width = 18;
      height = 18;
      break;
    case 'dragon_boss':
      name = overrideName ?? 'Elder Wyrm';
      archetype = isMiniBoss ? 'mage' : 'dragon';
      baseHp = 320;
      baseAtk = 22;
      speed = 64;
      width = isMiniBoss ? 26 : 52;
      height = isMiniBoss ? 26 : 52;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'grommash':
      name = overrideName ?? 'Grommash the Goblin Warlord';
      archetype = 'warlord';
      baseHp = 115;
      baseAtk = 14;
      speed = 46;
      width = 24;
      height = 24;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'brambleback':
      name = overrideName ?? 'Brambleback the Dire Bear';
      archetype = 'bear';
      baseHp = 135;
      baseAtk = 15;
      speed = 50;
      width = 26;
      height = 24;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'mycora':
      name = overrideName ?? 'Mycora the Toad-King';
      archetype = 'mage';
      baseHp = 150;
      baseAtk = 16;
      speed = 48;
      width = 26;
      height = 26;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'general_vane':
      name = overrideName ?? 'General Vane';
      archetype = 'warlord';
      baseHp = 160;
      baseAtk = 16;
      speed = 52;
      width = 26;
      height = 26;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'cryo_fang':
      name = overrideName ?? 'Cryo-Fang the Mammoth';
      archetype = 'bear';
      baseHp = 175;
      baseAtk = 17;
      speed = 48;
      width = 28;
      height = 26;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'volcanis':
      name = overrideName ?? 'Volcanis the Caldera Drake';
      archetype = 'mage';
      baseHp = 185;
      baseAtk = 17;
      speed = 52;
      width = 28;
      height = 26;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'viperfang':
      name = overrideName ?? 'Viperfang the Swamp Hydra';
      archetype = 'hydra';
      baseHp = 195;
      baseAtk = 18;
      speed = 54;
      width = 30;
      height = 28;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'aether_wing':
      name = overrideName ?? 'Aether-Wing the Griffin';
      archetype = 'mage';
      baseHp = 210;
      baseAtk = 19;
      speed = 60;
      width = 28;
      height = 26;
      if (!isMiniBoss) isBoss = true;
      break;
    case 'fenrir_p1':
      name = overrideName ?? (actNum >= 81 ? 'War-Emperor Fenrir & Vargos' : 'Usurper King Fenrir');
      archetype = 'fenrir_p1';
      baseHp = actNum >= 81 ? 200000 : 100000;
      baseAtk = actNum >= 81 ? 20 : 18;
      speed = 64;
      width = 26;
      height = 26;
      isBoss = true;
      break;
    case 'fenrir_p2':
      name = overrideName ?? (actNum >= 81 ? 'Calamity Overlord Fenrir' : 'Calamity Overlord Fenrir');
      archetype = 'fenrir_p2';
      baseHp = actNum >= 81 ? 200000 : 150000;
      baseAtk = actNum >= 81 ? 24 : 22;
      speed = 72;
      width = 38;
      height = 36;
      isBoss = true;
      break;
    case 'bahamut_p1':
      name = overrideName ?? 'Ignis-Bahamut, The World-Breaker Dragon (Phase 1/3)';
      archetype = 'bahamut';
      baseHp = 500000;
      baseAtk = 26;
      speed = 66;
      width = 56;
      height = 56;
      isBoss = true;
      break;
    case 'bahamut_p2':
      name = overrideName ?? 'Ignis-Bahamut — Cataclysm Sky-Flight (Phase 2/3)';
      archetype = 'bahamut';
      baseHp = 500000;
      baseAtk = 28;
      speed = 76;
      width = 56;
      height = 56;
      isBoss = true;
      break;
    case 'bahamut_p3':
      name = overrideName ?? 'Ignis-Bahamut — Supernova World-Breaker (Phase 3/3)';
      archetype = 'bahamut';
      baseHp = 500000;
      baseAtk = 32;
      speed = 82;
      width = 58;
      height = 58;
      isBoss = true;
      break;
    case 'crab_corsair':
      name = overrideName ?? 'Pirate Crab-Corsair';
      archetype = 'grunt';
      baseHp = 125;
      baseAtk = 19;
      speed = 62;
      width = 18;
      height = 18;
      break;
    case 'shark_knight':
      name = overrideName ?? 'Atlantean Shark-Knight';
      archetype = 'charger';
      baseHp = 148;
      baseAtk = 21;
      speed = 74;
      width = 18;
      height = 18;
      break;
    case 'siren_mage':
      name = overrideName ?? 'Abyssal Siren Cantor';
      archetype = 'mage';
      baseHp = 112;
      baseAtk = 20;
      speed = 58;
      width = 18;
      height = 18;
      break;
    case 'abyssal_eel':
      name = overrideName ?? 'Bio-Shock Moray Eel';
      archetype = 'ranged';
      baseHp = 118;
      baseAtk = 20;
      speed = 68;
      width = 18;
      height = 18;
      break;
    case 'kraken_tentacle':
      name = overrideName ?? 'Abyssal Crusher Tentacle';
      archetype = 'warlord';
      baseHp = 40;
      baseAtk = 22;
      speed = 24;
      width = 24;
      height = 28;
      break;
    case 'charybdis_kraken':
      name = overrideName ?? 'Charybdis, The 8-Tentacle World-Kraken';
      archetype = 'hydra';
      baseHp = actNum === 180 ? 3000000 : 420000;
      baseAtk = 32;
      speed = 56;
      width = 54;
      height = 54;
      isBoss = true;
      break;
    case 'clockwork_owl':
      name = overrideName ?? 'Clockwork Automaton Owl';
      archetype = 'ranged';
      baseHp = 142;
      baseAtk = 22;
      speed = 68;
      width = 18;
      height = 18;
      break;
    case 'cyber_rat':
      name = overrideName ?? 'Cyber-Rat Rail Saboteur';
      archetype = 'charger';
      baseHp = 128;
      baseAtk = 21;
      speed = 82;
      width = 16;
      height = 16;
      break;
    case 'steam_golem':
      name = overrideName ?? 'Brass-Boiler Steam Golem';
      archetype = 'bear';
      baseHp = 185;
      baseAtk = 24;
      speed = 52;
      width = 22;
      height = 22;
      break;
    case 'tesla_drone':
      name = overrideName ?? 'High-Voltage Tesla Drone';
      archetype = 'mage';
      baseHp = 135;
      baseAtk = 23;
      speed = 70;
      width = 18;
      height = 18;
      break;
    case 'chronos_omega':
      name = overrideName ?? 'Chronos-Omega, The Time-Rewinding Titan';
      archetype = 'fenrir_p2';
      baseHp = actNum === 240 ? 6000000 : 520000;
      baseAtk = 36;
      speed = 70;
      width = 52;
      height = 52;
      isBoss = true;
      break;
    case 'void_stalker':
      name = overrideName ?? 'Dimensional Void-Stalker';
      archetype = 'charger';
      baseHp = 165;
      baseAtk = 25;
      speed = 80;
      width = 18;
      height = 18;
      break;
    case 'nebula_seraph':
      name = overrideName ?? 'Fallen Nebula-Seraph';
      archetype = 'mage';
      baseHp = 175;
      baseAtk = 26;
      speed = 68;
      width = 20;
      height = 20;
      break;
    case 'entropy_knight':
      name = overrideName ?? 'Black-Hole Entropy Knight';
      archetype = 'warlord';
      baseHp = 210;
      baseAtk = 28;
      speed = 64;
      width = 20;
      height = 20;
      break;
    case 'void_clone_nyx':
      name = overrideName ?? 'Darth-Nyx, Evil Void-Clone';
      archetype = 'fenrir_p2';
      baseHp = actNum === 280 ? 1200000 : 240;
      baseAtk = 30;
      speed = 86;
      width = 24;
      height = 24;
      if (actNum === 280) isBoss = true;
      break;
    case 'aether_null':
      name = overrideName ?? 'AETHER-NULL, THE ECLIPSE SINGULARITY';
      archetype = 'bahamut';
      baseHp = actNum === 300 ? 15000000 : 750000;
      baseAtk = 42;
      speed = 78;
      width = 58;
      height = 58;
      isBoss = true;
      break;
  }

  const elderDragonHpTable: Record<number, number> = {
    87: 150000,
    92: 175000,
    97: 200000,
    102: 225000,
    107: 250000,
    112: 300000,
    117: 350000,
  };
  const roleMult = isMiniBoss ? 0.85 : isBoss ? 1.15 : 1;
  const hp = isFenrirP1
    ? actNum >= 81
      ? Math.round(200000 * nm)
      : Math.round(100000 * nm)
    : isFenrirP2
    ? actNum >= 81
      ? Math.round(200000 * nm)
      : Math.round(150000 * nm)
    : kind === 'bahamut_p1' || kind === 'bahamut_p2' || kind === 'bahamut_p3'
    ? Math.round(500000 * nm)
    : kind === 'charybdis_kraken' || kind === 'chronos_omega' || kind === 'aether_null' || (kind === 'void_clone_nyx' && actNum === 280)
    ? Math.round(baseHp * nm)
    : kind === 'dragon_boss' && elderDragonHpTable[actNum]
    ? Math.round(elderDragonHpTable[actNum] * nm)
    : Math.round(baseHp * totalScale * roleMult);
  const atk = Math.round(baseAtk * (1 + (effectiveAct - 1) * 0.085) * nm);
  const bossVisualId = resolveBossVisualId(actNum, kind, isMiniBoss, isBoss);

  return {
    id,
    kind,
    bossVisualId,
    variant,
    name,
    isBoss,
    isMiniBoss,
    archetype,
    x,
    y,
    vx: 0,
    vy: 0,
    width,
    height,
    hp,
    maxHp: hp,
    atk,
    speed,
    facing: 'left',
    state: isFenrirP2 ? 'chase' : 'idle',
    stateTimer: 0,
    windupDuration: 0.45,
    attackCooldown: 0.8 + Math.random() * 0.4,
    hitFlash: 0,
    animFrame: variant.scarOrStripe % 2,
    animTimer: (variant.animPhaseOffset % 1) * 0.25,
    homeX: x,
    homeY: y,
    xpReward: Math.round((isBoss ? 120 : isMiniBoss ? 75 : 20) * (1 + actNum * 0.08)),
    goldReward: Math.round((isBoss ? 65 : isMiniBoss ? 40 : 11) * (1 + actNum * 0.06)),
    shielded: isFenrirP1 || kind === 'bahamut_p1',
    bossPhase: isFenrirP1 || kind === 'bahamut_p1' ? 1 : isFenrirP2 || kind === 'bahamut_p2' ? 2 : kind === 'bahamut_p3' ? 3 : undefined,
    attackPatternIndex: 0,
    chargeDirX: 0,
    chargeDirY: 0,
    stagger: 0,
    maxStagger: isBoss ? 100 : isMiniBoss ? 80 : 60,
    stunTimer: 0,
    overdrive: false,
    consecutiveHits: 0,
    counterStanceTimer: 0,
    counterCooldown: 0,
  };
}

export function spawnEnemy(
  id: string,
  kind: EnemyKind,
  x: number,
  y: number,
  actNum = 1,
  nightmareMode = false,
  overrideName?: string,
  overrideRole?: 'miniboss' | 'boss'
): Enemy {
  return makeScaledEnemy(id, kind, x, y, actNum, nightmareMode, overrideName, overrideRole);
}

export function spawnAlliedSoldier(
  id: string,
  kind: AlliedCatUnitKind,
  x: number,
  y: number,
  actNum = 42
): AlliedCatSoldier {
  const scale = 1 + Math.max(0, actNum - 1) * 0.08;
  const variant = nextCatVariant(kind);
  const coatLabels: Record<CatCoatId, string> = {
    ginger_tabby: 'Ginger Tabby',
    tuxedo: 'Tuxedo',
    calico_tri: 'Calico',
    siamese_royal: 'Royal Siamese',
    russian_blue: 'Russian Blue',
    golden_lion: 'Lion-Blood',
  };
  const spec: Record<AlliedCatUnitKind, { name: string; hp: number; atk: number; speed: number }> = {
    cat_knight: { name: `${coatLabels[variant.coatId]} Vanguard Knight`, hp: 95, atk: 14, speed: 66 },
    lion_halberdier: { name: `${coatLabels[variant.coatId]} Royal Halberdier`, hp: 135, atk: 19, speed: 60 },
    calico_archer: { name: `${coatLabels[variant.coatId]} Longbow Ranger`, hp: 75, atk: 15, speed: 58 },
    arcane_cat_mage: { name: `${coatLabels[variant.coatId]} Arcane Mage`, hp: 82, atk: 18, speed: 56 },
    bulldog_paladin: { name: 'Allied Bulldog Paladin', hp: 155, atk: 22, speed: 58 },
    doberman_blade: { name: 'Allied Doberman Blade-Master', hp: 120, atk: 24, speed: 70 },
    husky_berserker: { name: 'Allied Husky Frost-Axeman', hp: 140, atk: 23, speed: 64 },
    wolf_captain: { name: 'Allied Wolf Banner-Captain', hp: 165, atk: 25, speed: 66 },
  };
  const base = spec[kind];
  const maxHp = Math.round(base.hp * scale);
  return {
    id,
    kind,
    variant,
    name: base.name,
    x,
    y,
    vx: 0,
    vy: 0,
    hp: maxHp,
    maxHp,
    atk: Math.round(base.atk * scale),
    speed: base.speed,
    facing: 'right',
    attackCooldown: 0.4 + Math.random() * 0.45,
    hitFlash: 0,
    rallyTimer: 0,
    animFrame: variant.scarOrStripe % 2,
    animTimer: (variant.animPhaseOffset % 1) * 0.25,
  };
}

export interface GeneratedActWorld {
  act: ActConfig;
  grid: string[];
  playerSpawn: { x: number; y: number };
  npcs: NPC[];
  chests: Chest[];
  portals: Portal[];
  enemies: Enemy[];
  alliedSoldiers: AlliedCatSoldier[];
  warBanners: WarBanner[];
  prisonCages: PrisonCage[];
  siegeEngines: SiegeEngine[];
  dragonBallistas?: DragonBallista[];
  traps: Trap[];
  biomeFeatures: BiomeFeature[];
  torches: Array<{ x: number; y: number; color: string }>;
}

function fillRect(rows: string[][], x1: number, y1: number, x2: number, y2: number, ch: string) {
  const minX = Math.max(1, Math.min(GRID_COLS - 2, x1));
  const maxX = Math.max(1, Math.min(GRID_COLS - 2, x2));
  const minY = Math.max(1, Math.min(GRID_ROWS - 2, y1));
  const maxY = Math.max(1, Math.min(GRID_ROWS - 2, y2));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      rows[y][x] = ch;
    }
  }
}

function getBiomeFloorHazardTile(biomeId: BiomeId): string {
  if (biomeId === 5 || biomeId === 14) return 'I'; // Slippery glacier ice
  if (biomeId === 6 || biomeId === 3 || biomeId === 4 || biomeId === 10 || biomeId === 13 || biomeId === 15 || biomeId === 16) return 'L'; // Lava / Acid / Ember / Slag
  if (biomeId === 2 || biomeId === 7 || biomeId === 9 || biomeId === 11 || biomeId === 12) return 'M'; // Deep mud / Blight bog / Trench mire
  return 'M';
}

function applyLayoutGeometry(rows: string[][], cfg: ActConfig) {
  const hazTile = getBiomeFloorHazardTile(cfg.biomeId);
  const shift = (cfg.act % 3) - 1;
  const variant = cfg.act % 3;

  // Boss & Dragon Boss Acts (role === 'boss'): Open Octagon Colosseum Arena (4 corner pillars, zero interior water)
  if (cfg.role === 'boss') {
    const outerHazard =
      cfg.biomeId === 6 || cfg.biomeId === 14 || cfg.biomeId === 17 || cfg.biomeId === 23 ? 'L' : 'W';
    for (let y = 1; y < GRID_ROWS - 1; y++) {
      for (let x = 1; x < GRID_COLS - 1; x++) {
        const dx = Math.abs(x - 18.5);
        const dy = Math.abs(y - 11.5);
        // Octagonal wall/moat frame around a spacious open arena
        if (dx + dy * 1.35 > 23.5) {
          rows[y][x] = outerHazard;
        } else if (dx <= 8 && dy <= 5) {
          rows[y][x] = 'C';
        } else if (dx <= 13 && dy <= 8) {
          rows[y][x] = 'P';
        } else {
          rows[y][x] = '.';
        }
      }
    }
    // 4 Corner Tactical Pillars (spaced clear of the 4 Dragon Harpoon Ballistas)
    fillRect(rows, 11, 5, 12, 6, '#');
    fillRect(rows, 25, 5, 26, 6, '#');
    fillRect(rows, 11, 17, 12, 18, '#');
    fillRect(rows, 25, 17, 26, 18, '#');
    // Guaranteed West/East Colosseum causeways
    fillRect(rows, 1, 10, 8, 13, 'P');
    fillRect(rows, 29, 10, 36, 13, 'P');
    return;
  }

  if (applyOmniverseLayoutGeometry(rows, cfg)) {
    return;
  }

  // 6 Distinct Architectural Topologies driven by currentAct % 6 so no two consecutive Acts share a layout!
  const layoutType = cfg.act % 6;

  if (layoutType === 1) {
    // 1: Winding S-Canyon (ZERO water 'W')
    fillRect(rows, 1, 1, 36, 22, '#');
    if (variant === 1) {
      fillRect(rows, 1, 10, 9, 13, 'P');
      fillRect(rows, 6, 10, 10, 19, 'P');
      fillRect(rows, 6, 15, 20, 19, '.');
      fillRect(rows, 8, 16, 18, 18, 'P');
      fillRect(rows, 16, 4, 21, 19, '.');
      fillRect(rows, 18, 5, 19, 18, 'P');
      fillRect(rows, 16, 4, 31, 8, '.');
      fillRect(rows, 18, 5, 29, 7, 'P');
      fillRect(rows, 27, 4, 31, 13, '.');
      fillRect(rows, 28, 10, 36, 13, 'P');
      fillRect(rows, 11, 16, 14, 18, hazTile === 'L' ? 'M' : hazTile);
      fillRect(rows, 22, 5, 25, 7, hazTile === 'L' ? 'M' : hazTile);
    } else {
      fillRect(rows, 1, 10, 9, 13, 'P');
      fillRect(rows, 6, 4, 10, 13, 'P');
      fillRect(rows, 6, 4, 20, 8, '.');
      fillRect(rows, 8, 5, 18, 7, 'P');
      fillRect(rows, 16, 4, 21, 19, '.');
      fillRect(rows, 18, 6, 19, 18, 'P');
      fillRect(rows, 16, 15, 31, 19, '.');
      fillRect(rows, 18, 16, 29, 18, 'P');
      fillRect(rows, 27, 10, 31, 19, '.');
      fillRect(rows, 28, 10, 36, 13, 'P');
      fillRect(rows, 11, 5, 14, 7, hazTile === 'L' ? 'M' : hazTile);
      fillRect(rows, 22, 16, 25, 18, hazTile === 'L' ? 'M' : hazTile);
    }
    if (cfg.biomeId === 5 || cfg.biomeId === 13 || cfg.biomeId === 20) {
      fillRect(rows, 17, 8, 20, 15, 'I');
    }
  } else if (layoutType === 2) {
    // 2: Twin-Bridge River Crossing
    fillRect(rows, 10, 1, 14, 22, 'W');
    fillRect(rows, 23, 1, 27, 22, 'W');

    if (variant === 0) {
      fillRect(rows, 10, 5 + shift, 14, 7 + shift, 'B');
      fillRect(rows, 10, 16 + shift, 14, 18 + shift, 'B');
      fillRect(rows, 23, 10 - shift, 27, 13 - shift, 'B');
    } else if (variant === 1) {
      fillRect(rows, 10, 10 + shift, 14, 13 + shift, 'B');
      fillRect(rows, 23, 5, 27, 7, 'B');
      fillRect(rows, 23, 16, 27, 18, 'B');
    } else {
      fillRect(rows, 10, 4, 14, 6, 'B');
      fillRect(rows, 10, 11, 14, 12, 'B');
      fillRect(rows, 23, 11, 27, 12, 'B');
      fillRect(rows, 23, 17, 27, 19, 'B');
    }

    fillRect(rows, 2, 11, 9, 12, 'P');
    fillRect(rows, 6, 4, 8, 19, 'P');
    fillRect(rows, 15, 4, 22, 19, '.');
    fillRect(rows, 17, 5, 19, 18, 'P');
    fillRect(rows, 18, 10, 20, 13, hazTile);
    if (hazTile === 'L') {
      fillRect(rows, 18, 11, 20, 12, 'B');
    }
    fillRect(rows, 28, 4, 30, 19, 'P');
    fillRect(rows, 28, 11, 36, 12, 'P');
  } else if (layoutType === 3) {
    // 3: 3-Room Dungeon Chamber Labyrinth (ZERO water 'W')
    fillRect(rows, 1, 1, 36, 22, '#');
    // Room 1: West Guardroom (x: 3..11, y: 3..20)
    fillRect(rows, 3, 3, 11, 20, '.');
    fillRect(rows, 5, 5, 9, 18, 'P');
    // Room 2: Central Altar Chamber (x: 14..23, y: 3..20)
    fillRect(rows, 14, 3, 23, 20, '.');
    fillRect(rows, 16, 6, 21, 17, 'C');
    // Room 3: East Vault Hall (x: 26..34, y: 3..20)
    fillRect(rows, 26, 3, 34, 20, '.');
    fillRect(rows, 28, 5, 32, 18, 'P');
    // Corridors connecting the 3 chambers (North, Center, South doorways)
    fillRect(rows, 11, 5, 14, 7, 'P');
    fillRect(rows, 11, 16, 14, 18, 'P');
    fillRect(rows, 23, 10, 26, 13, 'P');
    if (variant !== 1) {
      fillRect(rows, 11, 11, 14, 12, 'P');
      fillRect(rows, 23, 5, 26, 7, 'P');
    }
    // Interior stone pillars in Center Chamber
    rows[5][15] = '#';
    rows[5][22] = '#';
    rows[18][15] = '#';
    rows[18][22] = '#';
    // Entry & Exit Corridors
    fillRect(rows, 1, 10, 5, 13, 'P');
    fillRect(rows, 32, 10, 36, 13, 'P');
  } else if (layoutType === 4) {
    // 4: Central Island Ring with 4 Bridges
    const moatTile =
      cfg.biomeId === 6 || cfg.biomeId === 14 || cfg.biomeId === 17 || cfg.biomeId === 23 ? 'L' : 'W';
    fillRect(rows, 10, 4, 27, 19, moatTile);
    // Giant central battle island
    fillRect(rows, 13, 7, 24, 16, '.');
    fillRect(rows, 15, 8, 22, 15, 'C');
    // 4 Bridges (North, South, West, East)
    fillRect(rows, 17, 4, 20, 7, 'B');
    fillRect(rows, 17, 16, 20, 19, 'B');
    fillRect(rows, 10, 10, 13, 13, 'B');
    fillRect(rows, 24, 10, 27, 13, 'B');
    // Outer ring promenade
    fillRect(rows, 7, 2, 30, 3, 'P');
    fillRect(rows, 7, 20, 30, 21, 'P');
    fillRect(rows, 7, 2, 9, 21, 'P');
    fillRect(rows, 28, 2, 30, 21, 'P');
    fillRect(rows, 1, 10, 9, 13, 'P');
    fillRect(rows, 28, 10, 36, 13, 'P');
  } else if (layoutType === 5) {
    // 5: Split-Lane Minecart / Conveyor Trench (ZERO water 'W')
    fillRect(rows, 8, 10, 28, 13, '#');
    // Upper lane + bridged lava/ice/mud trenches
    fillRect(rows, 6, 4, 30, 8, 'P');
    fillRect(rows, 11, 4, 13, 8, 'L');
    fillRect(rows, 11, 5, 13, 7, 'B');
    fillRect(rows, 18, 4, 20, 8, hazTile);
    if (hazTile === 'L') fillRect(rows, 18, 5, 20, 7, 'B');
    fillRect(rows, 24, 4, 26, 8, 'L');
    fillRect(rows, 24, 5, 26, 7, 'B');
    // Lower lane + bridged trenches
    fillRect(rows, 6, 15, 30, 19, 'P');
    fillRect(rows, 12, 15, 14, 19, hazTile);
    if (hazTile === 'L') fillRect(rows, 12, 16, 14, 18, 'B');
    fillRect(rows, 19, 15, 21, 19, 'L');
    fillRect(rows, 19, 16, 21, 18, 'B');
    fillRect(rows, 25, 15, 27, 19, hazTile);
    if (hazTile === 'L') fillRect(rows, 25, 16, 27, 18, 'B');
    // Central crossover bridge
    fillRect(rows, 17, 9, 19, 14, 'B');
    // West & East connectors
    fillRect(rows, 1, 10, 8, 13, 'P');
    fillRect(rows, 6, 4, 8, 19, 'P');
    fillRect(rows, 28, 4, 30, 19, 'P');
    fillRect(rows, 28, 10, 36, 13, 'P');
  } else {
    // 0: Octagon Stone Arena with 4 Pillars (ZERO interior water 'W')
    for (let y = 1; y < GRID_ROWS - 1; y++) {
      for (let x = 1; x < GRID_COLS - 1; x++) {
        const dx = Math.abs(x - 18.5);
        const dy = Math.abs(y - 11.5);
        if (dx + dy * 1.45 > 25) {
          rows[y][x] = '#';
        } else if (dx <= 7 && dy <= 4) {
          rows[y][x] = 'C';
        } else if (dx <= 12 && dy <= 7) {
          rows[y][x] = 'P';
        } else {
          rows[y][x] = '.';
        }
      }
    }
    // 4 Tactical Arena Pillars
    fillRect(rows, 12, 6, 13, 7, '#');
    fillRect(rows, 24, 6, 25, 7, '#');
    fillRect(rows, 12, 16, 13, 17, '#');
    fillRect(rows, 24, 16, 25, 17, '#');
    fillRect(rows, 1, 10, 8, 13, 'P');
    fillRect(rows, 29, 10, 36, 13, 'P');
  }

  // Compile bespoke Act 1-300 room topology & Cubic Bezier river curve + bridges/fords
  compileActBespokeTopology(rows, getActBlueprint(cfg.act));

  // Always guarantee West spawn & East exit clear landing pads
  fillRect(rows, 1, 10, 5, 13, 'P');
  fillRect(rows, 33, 10, 36, 13, 'P');
}

export function getSanctuaryPortalConfig(actNum: number): { targetAct: number; label: string } {
  if (actNum === 40) {
    return {
      targetAct: 41,
      label: 'Golden Warp: Act 41 Throne Room (Usurper Fenrir)',
    };
  }
  if (actNum === 81) {
    return {
      targetAct: 82,
      label: 'Crimson War-Gate: Act 82 Obsidian Colosseum (Ragnarok)',
    };
  }
  if (actNum === 121) {
    return {
      targetAct: 122,
      label: 'Astral Sky-Gate: Act 122 Shattered Sky-Throne (Ignis-Bahamut)',
    };
  }
  if (actNum === 179) {
    return {
      targetAct: 180,
      label: 'Abyssal Gate: Act 180 Hadal Trench (Charybdis World-Kraken)',
    };
  }
  if (actNum === 239) {
    return {
      targetAct: 240,
      label: 'Temporal Gate: Act 240 Grand Horologium (Chronos-Omega)',
    };
  }
  if (actNum === 299) {
    return {
      targetAct: 300,
      label: 'Singularity Gate: Act 300 Eclipse Singularity (Aether-Null)',
    };
  }
  return {
    targetAct: actNum + 1,
    label: `Portal to Act ${actNum + 1}`,
  };
}

export function isLiquidOrHazardTile(tileType: string): boolean {
  return (
    tileType === 'W' ||
    tileType === 'L' ||
    tileType === '#' ||
    tileType === 'water' ||
    tileType === 'lava' ||
    tileType === 'void' ||
    tileType === 'wall'
  );
}

export function findNearestDryTile(
  gridOrRows: string[] | string[][],
  targetPx: number,
  targetPy: number,
  avoidBridges = false
): { x: number; y: number } {
  const rowCount = gridOrRows.length;
  const colCount = rowCount > 0 ? gridOrRows[0].length : GRID_COLS;
  const startTx = Math.max(2, Math.min(colCount - 3, Math.floor(targetPx / TILE_SIZE)));
  const startTy = Math.max(2, Math.min(rowCount - 3, Math.floor(targetPy / TILE_SIZE)));

  const isDry = (ch: string, strict: boolean) => {
    if (isLiquidOrHazardTile(ch)) return false;
    if (strict && (ch === 'B' || ch === 'M')) return false;
    return true;
  };

  for (const strict of avoidBridges ? [true, false] : [false]) {
    for (let rad = 0; rad <= 14; rad++) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const tx = startTx + dx;
          const ty = startTy + dy;
          if (tx < 2 || tx >= colCount - 2 || ty < 2 || ty >= rowCount - 2) continue;
          const ch = gridOrRows[ty][tx];
          if (isDry(ch, strict)) {
            return { x: tx * TILE_SIZE + 8, y: ty * TILE_SIZE + 8 };
          }
        }
      }
    }
  }
  return { x: targetPx, y: targetPy };
}

export function snapEntityToDryLand<T extends { x: number; y: number }>(
  entity: T,
  gridOrRows: string[] | string[][],
  tileSize = TILE_SIZE,
  avoidBridges = true
): T {
  const rowCount = gridOrRows.length;
  const colCount = rowCount > 0 ? gridOrRows[0].length : GRID_COLS;
  const tx = Math.max(0, Math.min(colCount - 1, Math.floor(entity.x / tileSize)));
  const ty = Math.max(0, Math.min(rowCount - 1, Math.floor(entity.y / tileSize)));
  const currentTile = gridOrRows[ty]?.[tx] ?? '#';
  if (isLiquidOrHazardTile(currentTile) || (avoidBridges && currentTile === 'B')) {
    const safe = findNearestDryTile(gridOrRows, entity.x, entity.y, avoidBridges);
    entity.x = safe.x;
    entity.y = safe.y;
  }
  return entity;
}


function carveBlacksmithForgePad(rows: string[][], px: number, py: number) {
  const tx = Math.max(2, Math.min(GRID_COLS - 3, Math.floor(px / TILE_SIZE)));
  const ty = Math.max(2, Math.min(GRID_ROWS - 3, Math.floor(py / TILE_SIZE)));
  fillRect(rows, tx - 1, ty - 1, tx + 1, ty + 1, 'P');
}

function generateTrapsForAct(cfg: ActConfig, rows: string[][], nightmareMode: boolean): Trap[] {
  if (cfg.trapPool.length === 0) return [];
  const count = (cfg.role === 'boss' ? 4 : cfg.role === 'miniboss' ? 5 : 6) + (nightmareMode ? 2 : 0);
  const candidatePoints = [
    { x: 168, y: 120, dirX: 0, dirY: 1 },
    { x: 216, y: 248, dirX: 0, dirY: -1 },
    { x: 264, y: 184, dirX: -1, dirY: 0 },
    { x: 312, y: 104, dirX: 0, dirY: 1 },
    { x: 360, y: 264, dirX: 0, dirY: -1 },
    { x: 408, y: 184, dirX: -1, dirY: 0 },
    { x: 456, y: 136, dirX: 0, dirY: 1 },
    { x: 456, y: 248, dirX: 0, dirY: -1 },
  ];

  const traps: Trap[] = [];
  const baseDmg = Math.round((8 + cfg.act * 0.7) * (nightmareMode ? 1.35 : 1));

  for (let i = 0; i < count; i++) {
    const kind = cfg.trapPool[i % cfg.trapPool.length];
    const pt = candidatePoints[i % candidatePoints.length];
    const safe = findNearestDryTile(rows, pt.x, pt.y, true);

    // Keep traps away from immediate West spawn & NPC spots
    if (safe.x < 136 || safe.x > 545) continue;

    const cycleTime =
      kind === 'arrow_turret'
        ? 2.4
        : kind === 'flame_geyser'
        ? 2.8
        : kind === 'frost_crystal'
        ? 3.0
        : kind === 'void_pillar'
        ? 2.7
        : 2.5;

    traps.push({
      id: `trap_${cfg.act}_${i}`,
      kind,
      x: safe.x,
      y: safe.y,
      radius: kind === 'frost_crystal' || kind === 'spore_vent' ? 24 : 15,
      cycleTime,
      timer: (i * 0.55) % cycleTime,
      warnDuration: 0.65,
      activeDuration: kind === 'arrow_turret' ? 0.25 : 0.8,
      damage: baseDmg,
      dirX: pt.dirX,
      dirY: pt.dirY,
      firedThisCycle: false,
    });
  }

  return traps;
}

export function generateActWorld(
  actNum: number,
  spawnSide: 'west' | 'east' | 'center',
  nightmareMode: boolean,
  alreadyCleared: boolean
): GeneratedActWorld {
  const cfg = getActConfig(actNum);
  const pal = BIOME_PALETTES[cfg.biomeId];

  const rows: string[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => '.')
  );

  // Solid perimeter walls
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      if (y === 0 || y === GRID_ROWS - 1 || x === 0 || x === GRID_COLS - 1) {
        rows[y][x] = '#';
      }
    }
  }

  const omniverseSpecial = generateOmniverseSpecialWorld(cfg, rows, spawnSide, nightmareMode, alreadyCleared);
  if (omniverseSpecial) {
    return omniverseSpecial;
  }

  // ==========================================================================
  // ACT 81 EXCLUSIVE MAP: THE GREAT DUCK'S SUPREME WAR COUNCIL PAVILION & STAR-FORGE
  // Completely distinct from Act 40's Lotus Pond!
  // ==========================================================================
  if (cfg.act === 81) {
    // Crimson-Gold Supreme War Command Pavilion (ZERO water or liquid hazards!)
    fillRect(rows, 2, 2, 35, 21, 'P');
    // Ceremonial Stone Border Pillars along North/South Pavilion Flanks
    fillRect(rows, 4, 2, 33, 3, '.');
    fillRect(rows, 4, 20, 33, 21, '.');
    // Crimson-and-Gold Royal War Command Pavilion in the center
    fillRect(rows, 9, 5, 28, 18, 'C');
    // Obsidian & Gold Command Tent Pillars
    [
      [8, 4],
      [29, 4],
      [8, 18],
      [29, 18],
      [14, 4],
      [23, 4],
      [14, 19],
      [23, 19],
    ].forEach(([px, py]) => {
      rows[py][px] = '#';
    });
    // Dry Golden-Stone East/West Pavilion Promenade
    for (let x = 1; x <= 36; x++) {
      rows[11][x] = x >= 9 && x <= 28 ? 'C' : 'P';
      rows[12][x] = x >= 9 && x <= 28 ? 'C' : 'P';
    }

    // Validate all Act 81 spawns on dry ground and carve 3x3 Forge Pad around Blacksmith
    const bs81 = findNearestDryTile(rows, 184, 256, true);
    carveBlacksmithForgePad(rows, bs81.x, bs81.y);
    const leo81 = findNearestDryTile(rows, 268, 108, true);
    const duck81 = findNearestDryTile(rows, 320, 108, true);
    const adv81 = findNearestDryTile(rows, 410, 256, true);

    const npcs: NPC[] = [
      {
        id: 'king_leo_war_council',
        name: 'King Leo (Supreme War Council)',
        spriteId: 'king_leo',
        x: leo81.x,
        y: leo81.y,
        width: 24,
        height: 24,
        promptText: 'Convene Supreme War Council with King Leo & The Great Duck',
      },
      {
        id: 'great_duck_war_council',
        name: 'The Great Duck (Supreme Archmage)',
        spriteId: 'great_duck',
        x: duck81.x,
        y: duck81.y,
        width: 30,
        height: 30,
        promptText: 'Receive Tier 20 Primordial Gear & Supreme Elixir Blessing',
      },
      {
        id: 'blacksmith_forgepaw',
        name: 'Master Star-Smith Forgepaw',
        spriteId: 'blacksmith',
        x: bs81.x,
        y: bs81.y,
        width: 16,
        height: 16,
        promptText: 'Sacred Star-Forge Anvil (Blacksmith)',
      },
      {
        id: 'advisor_whiskers',
        name: 'War Tactician Whiskers',
        spriteId: 'advisor',
        x: adv81.x,
        y: adv81.y,
        width: 16,
        height: 16,
        promptText: 'Speak with War Tactician Whiskers',
      },
    ];

    const c81w = findNearestDryTile(rows, 268, 264, true);
    const c81a = findNearestDryTile(rows, 332, 264, true);
    const chests: Chest[] = [
      {
        id: 'act81_tier20_weapon_chest',
        x: c81w.x,
        y: c81w.y,
        opened: false,
        gold: 600,
        potions: 5,
        gearId: 'primordial_starlight_excalibur',
        label: 'Tier 20 Primordial Starlight-Quack Excalibur Vault',
      },
      {
        id: 'act81_tier20_armor_chest',
        x: c81a.x,
        y: c81a.y,
        opened: false,
        gold: 600,
        potions: 5,
        gearId: 'primordial_crown_mantle',
        label: 'Tier 20 Primordial Crown-General Mantle Vault',
      },
    ];

    const portal81Cfg = getSanctuaryPortalConfig(81);
    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 4,
        y: 168,
        width: 22,
        height: 44,
        direction: 'prev',
        targetAct: 80,
        label: 'West: Act 80 Imperial War-Court',
      },
      {
        id: 'sanctuary_to_throne',
        x: 572,
        y: 168,
        width: 30,
        height: 44,
        direction: 'sanctuary_warp',
        targetAct: portal81Cfg.targetAct,
        label: portal81Cfg.label,
        isGolden: true,
      },
      {
        id: 'boss_rush_sanctuary',
        x: 468,
        y: 264,
        width: 36,
        height: 36,
        direction: 'boss_rush',
        targetAct: 82,
        label: 'Boss Rush Shrine (All Bosses)',
        isGolden: true,
      },
    ];

    const b81L = findNearestDryTile(rows, 160, 132, true);
    const b81R = findNearestDryTile(rows, 436, 132, true);
    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: spawnSide === 'east' ? { x: 540, y: 192 } : { x: 56, y: 192 },
      npcs,
      chests,
      portals,
      enemies: [],
      alliedSoldiers: [
        spawnAlliedSoldier('wc_ally_1', 'lion_halberdier', ...Object.values(findNearestDryTile(rows, 192, 132, true)) as [number, number], 81),
        spawnAlliedSoldier('wc_ally_2', 'lion_halberdier', ...Object.values(findNearestDryTile(rows, 404, 132, true)) as [number, number], 81),
        spawnAlliedSoldier('wc_ally_3', 'cat_knight', ...Object.values(findNearestDryTile(rows, 192, 224, true)) as [number, number], 81),
        spawnAlliedSoldier('wc_ally_4', 'cat_knight', ...Object.values(findNearestDryTile(rows, 404, 224, true)) as [number, number], 81),
        spawnAlliedSoldier('wc_ally_5', 'arcane_cat_mage', ...Object.values(findNearestDryTile(rows, 228, 132, true)) as [number, number], 81),
        spawnAlliedSoldier('wc_ally_6', 'calico_archer', ...Object.values(findNearestDryTile(rows, 368, 132, true)) as [number, number], 81),
      ],
      warBanners: [
        {
          id: 'wc_banner_left',
          x: b81L.x,
          y: b81L.y,
          radius: 30,
          captureProgress: 100,
          captured: true,
          label: 'Golden Lion Royal Standard',
        },
        {
          id: 'wc_banner_right',
          x: b81R.x,
          y: b81R.y,
          radius: 30,
          captureProgress: 100,
          captured: true,
          label: 'Supreme Quack Archmage Standard',
        },
      ],
      prisonCages: [],
      siegeEngines: [],
      traps: [],
      biomeFeatures: [],
      torches: [
        { x: 160, y: 92, color: '#facc15' },
        { x: 436, y: 92, color: '#facc15' },
        { x: 160, y: 268, color: '#ef4444' },
        { x: 436, y: 268, color: '#ef4444' },
      ],
    };
  }

  // ==========================================================================
  // ACT 40 EXCLUSIVE MAP: SACRED LOTUS POND SANCTUARY OF THE GREAT DUCK
  // ==========================================================================
  if (cfg.act === 40 || (cfg.role === 'sanctuary' && cfg.act !== 81 && cfg.act !== 121)) {
    for (let y = 2; y <= 17; y++) {
      for (let x = 6; x <= 31; x++) {
        if (y <= 3 || y >= 15 || x <= 8 || x >= 29) {
          rows[y][x] = 'W';
        }
      }
    }
    for (let y = 4; y <= 14; y++) {
      for (let x = 9; x <= 28; x++) rows[y][x] = '.';
    }
    for (let y = 5; y <= 9; y++) {
      for (let x = 14; x <= 23; x++) rows[y][x] = 'C';
    }
    for (let x = 1; x <= 36; x++) {
      rows[11][x] = x <= 8 || x >= 29 ? 'B' : 'P';
      rows[12][x] = x <= 8 || x >= 29 ? 'B' : 'P';
    }
    for (let y = 9; y <= 14; y++) {
      rows[y][18] = 'P';
      rows[y][19] = 'P';
    }

    // Place Blacksmith Forgepaw cleanly on dry ground on the Sanctuary island with a 3x3 Stone Forge Pad!
    const bs40 = findNearestDryTile(rows, 168, 212, true);
    carveBlacksmithForgePad(rows, bs40.x, bs40.y);
    const duck40 = findNearestDryTile(rows, 296, 108, true);

    const npcs: NPC[] = [
      {
        id: 'the_great_duck',
        name: 'The Great Duck',
        spriteId: 'great_duck',
        x: duck40.x,
        y: duck40.y,
        width: 30,
        height: 30,
        promptText: 'Speak with The Great Duck',
      },
      {
        id: 'blacksmith_forgepaw',
        name: 'Blacksmith Forgepaw',
        spriteId: 'blacksmith',
        x: bs40.x,
        y: bs40.y,
        width: 16,
        height: 16,
        promptText: 'Forge & Shop (Blacksmith)',
      },
    ];

    const c40m = findNearestDryTile(rows, 296, 304, true);
    const c40a = findNearestDryTile(rows, 344, 304, true);
    const chests: Chest[] = [
      {
        id: 'act40_mythic_chest',
        x: c40m.x,
        y: c40m.y,
        opened: false,
        gold: 220,
        potions: 5,
        gearId: nightmareMode ? 'quack_god_excalibur' : 'lionheart_blade',
        label: nightmareMode ? 'Mythic Excaliquack Reliquary' : 'Astral Lotus Weapon Vault',
      },
      {
        id: 'act40_armor_chest',
        x: c40a.x,
        y: c40a.y,
        opened: false,
        gold: 160,
        potions: 4,
        gearId: nightmareMode ? 'sovereign_duck_aegis' : 'royal_felis_armor',
        label: nightmareMode ? 'Mythic Sovereign Aegis Vault' : 'Royal Archmage Reliquary',
      },
    ];

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 4,
        y: 168,
        width: 22,
        height: 44,
        direction: 'prev',
        targetAct: 39,
        label: 'West: Act 39',
      },
      {
        id: 'sanctuary_to_throne',
        x: 572,
        y: 168,
        width: 30,
        height: 44,
        direction: 'sanctuary_warp',
        targetAct: getSanctuaryPortalConfig(40).targetAct,
        label: getSanctuaryPortalConfig(40).label,
        isGolden: true,
      },
      {
        id: 'boss_rush_sanctuary',
        x: 432,
        y: 280,
        width: 36,
        height: 36,
        direction: 'boss_rush',
        targetAct: 41,
        label: 'Boss Rush Shrine (All Bosses)',
        isGolden: true,
      },
    ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: spawnSide === 'east' ? { x: 540, y: 192 } : { x: 56, y: 192 },
      npcs,
      chests,
      portals,
      enemies: [],
      alliedSoldiers: [],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      traps: [],
      biomeFeatures: [],
      torches: [
        { x: 244, y: 86, color: '#fef08a' },
        { x: 356, y: 86, color: '#fef08a' },
        { x: 244, y: 140, color: '#fef08a' },
        { x: 356, y: 140, color: '#fef08a' },
      ],
    };
  }

  // ==========================================================================
  // ACT 82 EXCLUSIVE ARENA: THE OBSIDIAN COLOSSEUM OF KINGS (3-PHASE RAGNAROK FINALE)
  // Completely distinct from Act 41's Throne Room!
  // ==========================================================================
  if (cfg.act === 82) {
    // Circular Obsidian & Magma Colosseum Ring
    for (let y = 1; y < GRID_ROWS - 1; y++) {
      for (let x = 1; x < GRID_COLS - 1; x++) {
        const dx = (x - 18.5) / 15.5;
        const dy = (y - 11.5) / 9.5;
        const r = Math.hypot(dx, dy);
        if (r > 1.08) {
          rows[y][x] = 'L'; // Outer molten magma colosseum moat
        } else if (r > 0.92) {
          rows[y][x] = 'P'; // Stone colosseum rim
        } else if (r < 0.45) {
          rows[y][x] = 'C'; // Inner Imperial Crimson Colosseum Carpet
        } else {
          rows[y][x] = '.';
        }
      }
    }
    // Southern Colosseum Entry Causeway
    fillRect(rows, 16, 18, 21, 22, 'B');
    // 4 Destructible / Tactical Arcane Rune Pillars inside the Colosseum
    [
      [10, 6],
      [27, 6],
      [10, 16],
      [27, 16],
    ].forEach(([px, py]) => {
      rows[py][px] = '#';
    });

    const npcs: NPC[] = [
      {
        id: 'king_leo_colosseum',
        name: 'King Leo (Allied Hero)',
        spriteId: 'king_leo',
        x: 248,
        y: 292,
        width: 24,
        height: 24,
        promptText: 'Speak with King Leo (Eternal Peace Treaty)',
      },
      {
        id: 'great_duck_colosseum',
        name: 'The Great Duck (Allied Archmage)',
        spriteId: 'great_duck',
        x: 360,
        y: 292,
        width: 30,
        height: 30,
        promptText: 'Speak with The Great Duck',
      },
    ];

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 81,
        label: 'South: Return to Act 81 War Council',
      },
      {
        id: 'next_act',
        x: 572,
        y: 168,
        width: 28,
        height: 44,
        direction: 'next',
        targetAct: 83,
        label: 'East: Act 83 Dragon Cataclysm',
        isGolden: true,
      },
    ];

    const colosseumTraps: Trap[] = [
      { id: 'col_vp_1', kind: 'void_pillar', x: 176, y: 120, radius: 22, cycleTime: 3.4, timer: 0.4, warnDuration: 0.75, activeDuration: 0.7, damage: 28 },
      { id: 'col_vp_2', kind: 'void_pillar', x: 432, y: 120, radius: 22, cycleTime: 3.4, timer: 2.1, warnDuration: 0.75, activeDuration: 0.7, damage: 28 },
      { id: 'col_fg_1', kind: 'flame_geyser', x: 176, y: 240, radius: 20, cycleTime: 3.6, timer: 1.2, warnDuration: 0.75, activeDuration: 0.7, damage: 26 },
      { id: 'col_fg_2', kind: 'flame_geyser', x: 432, y: 240, radius: 20, cycleTime: 3.6, timer: 2.8, warnDuration: 0.75, activeDuration: 0.7, damage: 26 },
    ];

    const phase1Boss = makeScaledEnemy(
      'boss_ragnarok_p1',
      'fenrir_p1',
      304,
      116,
      82,
      nightmareMode,
      'War-Emperor Fenrir & Dread-Chariot Cerberus (Phase 1/3)'
    );
    phase1Boss.bossVisualId = 'boss_emperor_chariot_p1';
    phase1Boss.width = 36;
    phase1Boss.height = 36;

    const colA1 = findNearestDryTile(rows, 216, 268, true);
    const colA2 = findNearestDryTile(rows, 392, 268, true);
    const colA3 = findNearestDryTile(rows, 242, 286, true);
    const colA4 = findNearestDryTile(rows, 366, 286, true);
    const colA5 = findNearestDryTile(rows, 200, 304, true);
    const colA6 = findNearestDryTile(rows, 408, 304, true);
    const colBW = findNearestDryTile(rows, 208, 184, true);
    const colBE = findNearestDryTile(rows, 400, 184, true);

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 316 },
      npcs,
      chests: [],
      portals,
      enemies: alreadyCleared ? [] : [phase1Boss],
      alliedSoldiers: [
        spawnAlliedSoldier('col_ally_1', 'lion_halberdier', colA1.x, colA1.y, 82),
        spawnAlliedSoldier('col_ally_2', 'lion_halberdier', colA2.x, colA2.y, 82),
        spawnAlliedSoldier('col_ally_3', 'cat_knight', colA3.x, colA3.y, 82),
        spawnAlliedSoldier('col_ally_4', 'cat_knight', colA4.x, colA4.y, 82),
        spawnAlliedSoldier('col_ally_5', 'arcane_cat_mage', colA5.x, colA5.y, 82),
        spawnAlliedSoldier('col_ally_6', 'calico_archer', colA6.x, colA6.y, 82),
      ],
      warBanners: [
        {
          id: 'col_banner_west',
          x: colBW.x,
          y: colBW.y,
          radius: 34,
          captureProgress: alreadyCleared ? 100 : 0,
          captured: alreadyCleared,
          label: 'West Colosseum Standard',
        },
        {
          id: 'col_banner_east',
          x: colBE.x,
          y: colBE.y,
          radius: 34,
          captureProgress: alreadyCleared ? 100 : 0,
          captured: alreadyCleared,
          label: 'East Colosseum Standard',
        },
      ],
      prisonCages: [],
      siegeEngines: [],
      traps: colosseumTraps,
      biomeFeatures: [],
      torches: [
        { x: 160, y: 68, color: '#facc15' },
        { x: 448, y: 68, color: '#facc15' },
        { x: 120, y: 184, color: '#ef4444' },
        { x: 488, y: 184, color: '#ef4444' },
        { x: 160, y: 296, color: '#38bdf8' },
        { x: 448, y: 296, color: '#38bdf8' },
      ],
    };
  }

  // ==========================================================================
  // ACT 121 EXCLUSIVE MAP: FLOATING ASTRAL STAR-FORGE SANCTUM (ZERO WATER INSIDE)
  // ==========================================================================
  if (cfg.act === 121) {
    // Outer starry astral chasm perimeter (W), completely solid stone courtyard platform inside!
    fillRect(rows, 1, 1, 36, 22, 'W');
    fillRect(rows, 3, 2, 34, 21, 'P');
    fillRect(rows, 5, 4, 32, 19, '.');
    fillRect(rows, 10, 6, 27, 17, 'C');
    for (let x = 1; x <= 36; x++) {
      rows[11][x] = x >= 10 && x <= 27 ? 'C' : x <= 3 || x >= 34 ? 'B' : 'P';
      rows[12][x] = x >= 10 && x <= 27 ? 'C' : x <= 3 || x >= 34 ? 'B' : 'P';
    }
    const bs121 = findNearestDryTile(rows, 164, 256, true);
    carveBlacksmithForgePad(rows, bs121.x, bs121.y);
    const leo121 = findNearestDryTile(rows, 224, 112, true);
    const fen121 = findNearestDryTile(rows, 296, 112, true);
    const duck121 = findNearestDryTile(rows, 368, 112, true);

    const npcs: NPC[] = [
      {
        id: 'king_leo_united',
        name: 'King Leo (United Alliance)',
        spriteId: 'king_leo',
        x: leo121.x,
        y: leo121.y,
        width: 24,
        height: 24,
        promptText: 'Speak with King Leo, Wolf-King Fenrir & The Great Duck',
      },
      {
        id: 'fenrir_united',
        name: 'Wolf-King Fenrir (Reformed Ally)',
        spriteId: 'fenrir',
        x: fen121.x,
        y: fen121.y,
        width: 24,
        height: 24,
        promptText: 'Speak with Reformed Wolf-King Fenrir',
      },
      {
        id: 'great_duck_united',
        name: 'The Great Duck (Dragon-God Brewer)',
        spriteId: 'great_duck',
        x: duck121.x,
        y: duck121.y,
        width: 30,
        height: 30,
        promptText: 'Receive Tier 30 Eternal Omni Gear & Dragon-God Elixir!',
      },
      {
        id: 'blacksmith_forgepaw',
        name: 'Blacksmith Forgepaw',
        spriteId: 'blacksmith',
        x: bs121.x,
        y: bs121.y,
        width: 16,
        height: 16,
        promptText: 'Forge & Shop (Blacksmith)',
      },
    ];
    const c121w = findNearestDryTile(rows, 272, 272, true);
    const c121a = findNearestDryTile(rows, 328, 272, true);
    const chests: Chest[] = [
      {
        id: 'act121_omni_blade_chest',
        x: c121w.x,
        y: c121w.y,
        opened: false,
        gold: 1000,
        potions: 6,
        gearId: 'eternal_omni_blade',
        label: 'Tier 30 Eternal Dragon-Slayer Omni-Blade Vault',
      },
      {
        id: 'act121_omni_armor_chest',
        x: c121a.x,
        y: c121a.y,
        opened: false,
        gold: 1000,
        potions: 6,
        gearId: 'eternal_omni_mantle',
        label: 'Tier 30 Eternal Omni-Crown Mantle Vault',
      },
    ];
    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 4,
        y: 168,
        width: 22,
        height: 44,
        direction: 'prev',
        targetAct: 120,
        label: 'West: Act 120',
      },
      {
        id: 'united_to_sky_throne',
        x: 572,
        y: 168,
        width: 30,
        height: 44,
        direction: 'sanctuary_warp',
        targetAct: getSanctuaryPortalConfig(121).targetAct,
        label: getSanctuaryPortalConfig(121).label,
        isGolden: true,
      },
    ];
    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: spawnSide === 'east' ? { x: 540, y: 192 } : { x: 56, y: 192 },
      npcs,
      chests,
      portals,
      enemies: [],
      alliedSoldiers: [
        spawnAlliedSoldier('us_ally_1', 'lion_halberdier', ...Object.values(findNearestDryTile(rows, 180, 148, true)) as [number, number], 121),
        spawnAlliedSoldier('us_ally_2', 'bulldog_paladin', ...Object.values(findNearestDryTile(rows, 416, 148, true)) as [number, number], 121),
        spawnAlliedSoldier('us_ally_3', 'doberman_blade', ...Object.values(findNearestDryTile(rows, 180, 224, true)) as [number, number], 121),
        spawnAlliedSoldier('us_ally_4', 'cat_knight', ...Object.values(findNearestDryTile(rows, 416, 224, true)) as [number, number], 121),
      ],
      warBanners: [
        { id: 'us_banner_1', ...findNearestDryTile(rows, 148, 132, true), radius: 30, captureProgress: 100, captured: true, label: 'Cat Kingdom Banner' },
        { id: 'us_banner_2', ...findNearestDryTile(rows, 448, 132, true), radius: 30, captureProgress: 100, captured: true, label: 'Dog Kingdom Banner' },
      ],
      prisonCages: [],
      siegeEngines: [],
      traps: [],
      biomeFeatures: [],
      torches: [
        { x: 160, y: 96, color: '#fde047' },
        { x: 436, y: 96, color: '#fde047' },
        { x: 160, y: 268, color: '#38bdf8' },
        { x: 436, y: 268, color: '#38bdf8' },
      ],
    };
  }

  // ==========================================================================
  // ACT 122 TRUE FINALE ARENA: THE SHATTERED SKY-THRONE (IGNIS-BAHAMUT 500,000 HP)
  // ==========================================================================
  if (cfg.act === 122) {
    for (let y = 1; y < GRID_ROWS - 1; y++) {
      for (let x = 1; x < GRID_COLS - 1; x++) {
        const dx = (x - 18.5) / 16.0;
        const dy = (y - 11.5) / 9.8;
        const r = Math.hypot(dx, dy);
        if (r > 1.06) {
          rows[y][x] = 'W'; // Crimson sky-chasm around floating citadel
        } else if (r > 0.9) {
          rows[y][x] = 'P';
        } else if (r < 0.48) {
          rows[y][x] = 'C';
        } else {
          rows[y][x] = '.';
        }
      }
    }
    fillRect(rows, 16, 18, 21, 22, 'B');
    // 2 Dragon-Harpoon Ballista Ledge Platforms (East & West)
    fillRect(rows, 4, 10, 7, 13, 'P');
    fillRect(rows, 30, 10, 33, 13, 'P');

    const npcs: NPC[] = [
      {
        id: 'king_leo_sky',
        name: 'King Leo (Sky-Throne)',
        spriteId: 'king_leo',
        x: 232,
        y: 304,
        width: 24,
        height: 24,
        promptText: 'Rally with King Leo',
      },
      {
        id: 'fenrir_sky',
        name: 'Wolf-King Fenrir (Allied Champion)',
        spriteId: 'fenrir',
        x: 304,
        y: 304,
        width: 24,
        height: 24,
        promptText: 'Speak with Wolf-King Fenrir',
      },
      {
        id: 'great_duck_sky',
        name: 'The Great Duck (Sky-Throne)',
        spriteId: 'great_duck',
        x: 376,
        y: 304,
        width: 30,
        height: 30,
        promptText: 'Speak with The Great Duck',
      },
    ];

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 121,
        label: 'South: Return to Act 121 United Sanctum',
      },
    ];

    const bahamutTraps: Trap[] = [
      { id: 'bah_fg_1', kind: 'flame_geyser', x: 184, y: 120, radius: 22, cycleTime: 3.3, timer: 0.4, warnDuration: 0.75, activeDuration: 0.7, damage: 34 },
      { id: 'bah_fg_2', kind: 'flame_geyser', x: 424, y: 120, radius: 22, cycleTime: 3.3, timer: 1.9, warnDuration: 0.75, activeDuration: 0.7, damage: 34 },
      { id: 'bah_vp_1', kind: 'void_pillar', x: 184, y: 242, radius: 22, cycleTime: 3.5, timer: 1.1, warnDuration: 0.75, activeDuration: 0.7, damage: 36 },
      { id: 'bah_vp_2', kind: 'void_pillar', x: 424, y: 242, radius: 22, cycleTime: 3.5, timer: 2.7, warnDuration: 0.75, activeDuration: 0.7, damage: 36 },
    ];

    const bahamutP1 = makeScaledEnemy(
      'boss_bahamut_p1',
      'bahamut_p1',
      304,
      112,
      122,
      nightmareMode,
      'Ignis-Bahamut, The World-Breaker Dragon (Phase 1/3)'
    );

    const skyA1 = findNearestDryTile(rows, 214, 270, true);
    const skyA2 = findNearestDryTile(rows, 394, 270, true);
    const skyA3 = findNearestDryTile(rows, 246, 286, true);
    const skyA4 = findNearestDryTile(rows, 362, 286, true);
    const skyA5 = findNearestDryTile(rows, 196, 300, true);
    const skyA6 = findNearestDryTile(rows, 412, 300, true);
    const skyBW = findNearestDryTile(rows, 204, 184, true);
    const skyBE = findNearestDryTile(rows, 404, 184, true);

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 318 },
      npcs,
      chests: [],
      portals,
      enemies: alreadyCleared ? [] : [bahamutP1],
      alliedSoldiers: [
        spawnAlliedSoldier('sky_ally_1', 'lion_halberdier', skyA1.x, skyA1.y, 122),
        spawnAlliedSoldier('sky_ally_2', 'bulldog_paladin', skyA2.x, skyA2.y, 122),
        spawnAlliedSoldier('sky_ally_3', 'doberman_blade', skyA3.x, skyA3.y, 122),
        spawnAlliedSoldier('sky_ally_4', 'cat_knight', skyA4.x, skyA4.y, 122),
        spawnAlliedSoldier('sky_ally_5', 'husky_berserker', skyA5.x, skyA5.y, 122),
        spawnAlliedSoldier('sky_ally_6', 'wolf_captain', skyA6.x, skyA6.y, 122),
      ],
      warBanners: [
        { id: 'sky_banner_w', x: skyBW.x, y: skyBW.y, radius: 34, captureProgress: alreadyCleared ? 100 : 0, captured: alreadyCleared, label: 'West Dragon-Harpoon Ballista' },
        { id: 'sky_banner_e', x: skyBE.x, y: skyBE.y, radius: 34, captureProgress: alreadyCleared ? 100 : 0, captured: alreadyCleared, label: 'East Dragon-Harpoon Ballista' },
      ],
      prisonCages: [],
      siegeEngines: [],
      dragonBallistas: alreadyCleared
        ? []
        : [
            { id: 'bal_nw', ...findNearestDryTile(rows, 148, 102, true), cornerLabel: 'NW Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: 0.6, lockedOn: false, autoCrewTimer: 4.5 },
            { id: 'bal_ne', ...findNearestDryTile(rows, 460, 102, true), cornerLabel: 'NE Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: 2.5, lockedOn: false, autoCrewTimer: 5.5 },
            { id: 'bal_sw', ...findNearestDryTile(rows, 148, 280, true), cornerLabel: 'SW Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: -0.6, lockedOn: false, autoCrewTimer: 6.5 },
            { id: 'bal_se', ...findNearestDryTile(rows, 460, 280, true), cornerLabel: 'SE Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: -2.5, lockedOn: false, autoCrewTimer: 7.5 },
          ],
      traps: bahamutTraps,
      biomeFeatures: [],
      torches: [
        { x: 160, y: 68, color: '#ef4444' },
        { x: 448, y: 68, color: '#ef4444' },
        { x: 108, y: 184, color: '#fde047' },
        { x: 500, y: 184, color: '#fde047' },
        { x: 160, y: 296, color: '#38bdf8' },
        { x: 448, y: 296, color: '#38bdf8' },
      ],
    };
  }

  // ==========================================================================
  // ACT 41 EXCLUSIVE ARENA: FELIS CITADEL THRONE ROOM (USURPER KING FENRIR)
  // ==========================================================================
  if (cfg.act === 41 || (cfg.role === 'final_boss' && cfg.act !== 82 && cfg.act !== 122)) {
    for (let y = 1; y <= 5; y++) {
      for (let x = 10; x <= 27; x++) rows[y][x] = 'C';
    }
    for (let y = 6; y <= 20; y++) {
      for (let x = 16; x <= 21; x++) rows[y][x] = 'C';
    }
    for (let y = 20; y <= 22; y++) {
      for (let x = 16; x <= 21; x++) rows[y][x] = 'P';
    }
    // East war-gate carpet in Act 41 leading to Act 42 (War of Two Kingdoms)
    fillRect(rows, 22, 11, 36, 12, 'P');
    // Void chasms on far left/right of Throne Room
    fillRect(rows, 1, 3, 3, 20, 'W');
    fillRect(rows, 34, 3, 36, 9, 'W');
    fillRect(rows, 34, 14, 36, 20, 'W');
    [3, 7, 11, 15].forEach((py) => {
      rows[py][6] = '#';
      rows[py][7] = '#';
      rows[py + 1][6] = '#';
      rows[py + 1][7] = '#';
      rows[py][30] = '#';
      rows[py][31] = '#';
      rows[py + 1][30] = '#';
      rows[py + 1][31] = '#';
    });

    const npcs: NPC[] = [
      {
        id: 'king_leo_throne',
        name: 'King Leo',
        spriteId: 'king_leo',
        x: 304,
        y: 44,
        width: 24,
        height: 24,
        promptText: 'Speak with King Leo',
      },
    ];

    const portals: Portal[] = [
      {
        id: 'prev_act',
        x: 264,
        y: 356,
        width: 80,
        height: 24,
        direction: 'prev',
        targetAct: 40,
        label: 'South: Return to Sanctuary (Act 40)',
      },
      {
        id: 'next_act',
        x: 578,
        y: 168,
        width: 26,
        height: 44,
        direction: 'next',
        targetAct: 42,
        label: 'East: Act 42 War of Two Kingdoms',
        isGolden: true,
      },
    ];

    const throneTraps: Trap[] = [
      { id: 'throne_vp_1', kind: 'void_pillar', x: 168, y: 168, radius: 22, cycleTime: 3.2, timer: 0.4, warnDuration: 0.7, activeDuration: 0.7, damage: 24 },
      { id: 'throne_vp_2', kind: 'void_pillar', x: 440, y: 168, radius: 22, cycleTime: 3.2, timer: 2.0, warnDuration: 0.7, activeDuration: 0.7, damage: 24 },
    ];

    return {
      act: cfg,
      grid: rows.map((r) => r.join('')),
      playerSpawn: { x: 304, y: 316 },
      npcs,
      chests: [],
      portals,
      enemies: alreadyCleared
        ? []
        : [
            makeScaledEnemy(
              'boss_fenrir',
              'fenrir_p1',
              304,
              120,
              41,
              nightmareMode,
              cfg.bossName
            ),
          ],
      alliedSoldiers: [],
      warBanners: [],
      prisonCages: [],
      siegeEngines: [],
      traps: throneTraps,
      biomeFeatures: [],
      torches: [
        { x: 164, y: 52, color: '#c084fc' },
        { x: 444, y: 52, color: '#c084fc' },
        { x: 124, y: 128, color: '#a855f7' },
        { x: 484, y: 128, color: '#a855f7' },
        { x: 124, y: 248, color: '#a855f7' },
        { x: 484, y: 248, color: '#a855f7' },
      ],
    };
  }

  // Standard & Boss Acts (1–39, 42–80, 83–120): Apply distinct architectural layout & biome hazards
  applyLayoutGeometry(rows, cfg);

  const npcs: NPC[] = [];
  if (cfg.act === 42) {
    const leoSpot = findNearestDryTile(rows, 108, 120, true);
    npcs.push({
      id: 'king_leo_war_camp',
      name: 'King Leo',
      spriteId: 'king_leo',
      x: leoSpot.x,
      y: leoSpot.y,
      width: 24,
      height: 24,
      promptText: 'Speak with King Leo (War Commander)',
    });
  }
  if (cfg.hasAdvisor) {
    const advSpot = findNearestDryTile(rows, 104, 164, true);
    npcs.push({
      id: 'advisor_whiskers',
      name: 'Advisor Whiskers',
      spriteId: 'advisor',
      x: advSpot.x,
      y: advSpot.y,
      width: 16,
      height: 16,
      promptText: 'Speak with Advisor Whiskers',
    });
  }
  if (cfg.hasBlacksmith) {
    const bsSpot = findNearestDryTile(rows, 88, 224, true);
    carveBlacksmithForgePad(rows, bsSpot.x, bsSpot.y);
    npcs.push({
      id: 'blacksmith_forgepaw',
      name: 'Blacksmith Forgepaw',
      spriteId: 'blacksmith',
      x: bsSpot.x,
      y: bsSpot.y,
      width: 16,
      height: 16,
      promptText: 'Forge & Shop (Blacksmith)',
    });
  }

  const tierToWeaponId: Record<number, string> = {
    1: 'iron_sword',
    2: 'bronze_claw',
    3: 'steel_claws',
    4: 'silver_moon_blade',
    5: 'mithril_fang',
    6: 'frost_platinum_blade',
    7: 'obsidian_dragon_blade',
    8: 'void_arcane_blade',
    9: 'celestial_blade',
    10: 'lionheart_blade',
    11: 'quack_god_excalibur',
    20: 'primordial_starlight_excalibur',
    21: 'drake_scale_blade',
    22: 'ember_wyvern_blade',
    23: 'wyrm_fang_blade',
    24: 'tempest_claw_blade',
    25: 'frost_wyrm_blade',
    26: 'emerald_viper_blade',
    27: 'star_draconic_blade',
    28: 'abyssal_slayer_blade',
    29: 'dragon_god_slayer_blade',
    30: 'eternal_omni_blade',
  };
  const tierToArmorId: Record<number, string> = {
    1: 'iron_armor',
    2: 'bronze_armor',
    3: 'steel_plate',
    4: 'silver_moon_armor',
    5: 'mithril_armor',
    6: 'frost_platinum_armor',
    7: 'obsidian_dragon_armor',
    8: 'void_arcane_armor',
    9: 'celestial_armor',
    10: 'royal_felis_armor',
    11: 'sovereign_duck_aegis',
    20: 'primordial_crown_mantle',
    21: 'drake_scale_armor',
    22: 'ember_wyvern_armor',
    23: 'wyrm_fang_armor',
    24: 'tempest_claw_armor',
    25: 'frost_wyrm_armor',
    26: 'emerald_viper_armor',
    27: 'star_draconic_armor',
    28: 'abyssal_slayer_armor',
    29: 'dragon_god_slayer_armor',
    30: 'eternal_omni_mantle',
  };
  const tierIdx = Math.max(0, Math.min(WEAPON_TIERS.length - 1, cfg.rewardTier - 1));
  const dropGearId =
    actNum === 1
      ? undefined
      : cfg.role === 'boss'
      ? tierToWeaponId[cfg.rewardTier] ?? WEAPON_TIERS[tierIdx]
      : actNum % 2 === 0
      ? tierToWeaponId[cfg.rewardTier] ?? WEAPON_TIERS[tierIdx]
      : tierToArmorId[cfg.rewardTier] ?? ARMOR_TIERS[tierIdx];

  const chestPos = findNearestDryTile(rows, cfg.role === 'normal' ? 496 : 512, 88, true);
  const chests: Chest[] = [
    {
      id: `act_${actNum}_chest`,
      x: chestPos.x,
      y: chestPos.y,
      opened: false,
      gold: 25 + actNum * 8,
      potions: actNum % 3 === 0 ? 2 : 1,
      gearId: dropGearId,
      requiresActClear: cfg.role !== 'normal',
      label: cfg.role !== 'normal' ? `${cfg.title} Vault` : `Act ${actNum} Supply Chest`,
    },
  ];

  const portals: Portal[] = [];
  if (actNum > 1) {
    portals.push({
      id: 'prev_act',
      x: 4,
      y: 168,
      width: 22,
      height: 44,
      direction: 'prev',
      targetAct: actNum - 1,
      label: `West: Act ${actNum - 1}`,
    });
  }
  portals.push({
    id: 'next_act',
    x: 582,
    y: 168,
    width: 24,
    height: 44,
    direction: 'next',
    targetAct: actNum + 1,
    label: `East: Act ${actNum + 1}`,
    isGolden: actNum === 39 || actNum === 80 || actNum === 120,
  });

  const arcMeta = getArcConfig(actNum);
  const isPostArc1 = actNum >= 42;
  const isWarAct = actNum >= 42 && actNum <= 82;
  const enemies: Enemy[] = [];
  if (!alreadyCleared) {
    const waveCount =
      isPostArc1
        ? cfg.role === 'normal'
          ? 6 + (actNum % 2)
          : 4
        : cfg.role === 'normal'
        ? 4 + (actNum % 2)
        : 2;
    const rawSpots = [
      { x: 220, y: 108 },
      { x: 268, y: 264 },
      { x: 340, y: 136 },
      { x: 392, y: 256 },
      { x: 452, y: 188 },
      { x: 310, y: 192 },
      { x: 480, y: 124 },
    ];
    const effectivePool = cfg.enemyPool.length > 0 ? cfg.enemyPool : arcMeta.enemyPool;
    for (let i = 0; i < waveCount; i++) {
      const kind = effectivePool[i % effectivePool.length] ?? arcMeta.enemyPool[0];
      const pt = findNearestDryTile(rows, rawSpots[i % rawSpots.length].x, rawSpots[i % rawSpots.length].y, true);
      const enemyUnit = makeScaledEnemy(`act${actNum}_e${i}`, kind, pt.x, pt.y, actNum, nightmareMode);
      if (isPostArc1 && i === waveCount - 1) {
        enemyUnit.isWolfCaptain = true;
        enemyUnit.name = `${arcMeta.captainPrefix} (${enemyUnit.name})`;
        enemyUnit.maxHp = Math.round(enemyUnit.maxHp * 1.35);
        enemyUnit.hp = enemyUnit.maxHp;
      }
      enemies.push(enemyUnit);
    }

    if ((cfg.role === 'miniboss' || cfg.role === 'boss') && cfg.bossKind) {
      const bossCenter =
        cfg.role === 'boss' || cfg.act % 6 === 4 || cfg.act % 6 === 0
          ? findNearestDryTile(rows, 304, 188, true)
          : findNearestDryTile(rows, 448, 188, true);
      enemies.push(
        makeScaledEnemy(
          `act${actNum}_boss`,
          cfg.bossKind,
          bossCenter.x,
          bossCenter.y,
          actNum,
          nightmareMode,
          cfg.bossName,
          cfg.role
        )
      );
    }
  }

  // Spawn Allied Soldiers: Mixed Cat Knights + Reformed Dog Kingdom Warriors in Arcs III–VI (83–300)!
  const alliedSoldiers: AlliedCatSoldier[] = [];
  const allyTypes: AlliedCatUnitKind[] = actNum >= 83
    ? ['cat_knight', 'bulldog_paladin', 'lion_halberdier', 'doberman_blade', 'calico_archer', 'husky_berserker', 'arcane_cat_mage', 'wolf_captain']
    : ['cat_knight', 'lion_halberdier', 'calico_archer', 'arcane_cat_mage'];
  const allyCount = actNum >= 83
    ? cfg.role === 'boss'
      ? 5
      : 4
    : isWarAct
    ? cfg.role === 'boss'
      ? 4
      : 3
    : actNum === 1 || cfg.role === 'boss'
    ? 2
    : 1;
  const allyOffsets = [
    { x: 96, y: 156 },
    { x: 96, y: 226 },
    { x: 132, y: 192 },
    { x: 124, y: 142 },
    { x: 124, y: 242 },
  ];
  for (let i = 0; i < allyCount; i++) {
    const spot = findNearestDryTile(rows, allyOffsets[i % allyOffsets.length].x, allyOffsets[i % allyOffsets.length].y, true);
    const unitKind = allyTypes[(actNum + i) % allyTypes.length];
    alliedSoldiers.push(spawnAlliedSoldier(`act${actNum}_ally_${i}`, unitKind, spot.x, spot.y, actNum));
  }

  // Interactive War Fort Banners / Arc Control Points
  const warBanners: WarBanner[] = [];
  if (isPostArc1 || cfg.role === 'miniboss' || cfg.role === 'boss') {
    const bSpot1 = findNearestDryTile(rows, 288, 188, true);
    warBanners.push({
      id: `act${actNum}_banner_1`,
      x: bSpot1.x,
      y: bSpot1.y,
      radius: 34,
      captureProgress: alreadyCleared ? 100 : 0,
      captured: alreadyCleared,
      label: arcMeta.bannerLabel1,
    });
    if (isPostArc1 && cfg.role === 'normal') {
      const bSpot2 = findNearestDryTile(rows, 424, 152, true);
      warBanners.push({
        id: `act${actNum}_banner_2`,
        x: bSpot2.x,
        y: bSpot2.y,
        radius: 34,
        captureProgress: alreadyCleared ? 100 : 0,
        captured: alreadyCleared,
        label: arcMeta.bannerLabel2,
      });
    }
  }

  // Caged Cat Prisoners (Smash iron cages to rescue captured Cat Soldiers who cheer "FOR KING LEO! 🐾")
  const prisonCages: PrisonCage[] = [];
  if (!alreadyCleared && (isWarAct || actNum % 3 === 0)) {
    const cSpot = findNearestDryTile(rows, 336, 268, true);
    prisonCages.push({
      id: `act${actNum}_cage_1`,
      x: cSpot.x,
      y: cSpot.y,
      hp: 35 + actNum * 2,
      maxHp: 35 + actNum * 2,
      broken: false,
      unitKind: actNum % 2 === 0 ? 'lion_halberdier' : 'cat_knight',
    });
  }

  // Dog Kingdom Siege Catapults / Ballistas (Launch red-telegraphed artillery boulders until destroyed!)
  const siegeEngines: SiegeEngine[] = [];
  if (!alreadyCleared && isWarAct) {
    const sSpot = findNearestDryTile(rows, 468, 252, true);
    siegeEngines.push({
      id: `act${actNum}_siege_1`,
      x: sSpot.x,
      y: sSpot.y,
      hp: 80 + actNum * 4,
      maxHp: 80 + actNum * 4,
      fireTimer: 2.4,
      destroyed: false,
    });
  }

  const traps = generateTrapsForAct(cfg, rows, nightmareMode);
  const biomeFeatures = generateBiomeFeaturesForAct(
    cfg.act,
    cfg.biomeId,
    cfg.role,
    (px, py) => findNearestDryTile(rows, px, py, true),
    nightmareMode
  );

  const torches = [
    { x: 540, y: 150, color: pal.accent },
    { x: 540, y: 226, color: pal.accent },
  ];

  const isDragonBossAct =
    !alreadyCleared && (cfg.role === 'boss' && cfg.bossKind === 'dragon_boss');
  const dragonBallistas: DragonBallista[] = isDragonBossAct
    ? [
        { id: 'bal_nw', ...findNearestDryTile(rows, 96, 84, true), cornerLabel: 'NW Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: 0.6, lockedOn: false, autoCrewTimer: 3.5 },
        { id: 'bal_ne', ...findNearestDryTile(rows, 512, 84, true), cornerLabel: 'NE Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: 2.5, lockedOn: false, autoCrewTimer: 4.2 },
        { id: 'bal_sw', ...findNearestDryTile(rows, 96, 296, true), cornerLabel: 'SW Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: -0.6, lockedOn: false, autoCrewTimer: 4.9 },
        { id: 'bal_se', ...findNearestDryTile(rows, 512, 296, true), cornerLabel: 'SE Harpoon Ballista', cooldown: 0, maxCooldown: 4.5, aimAngle: -2.5, lockedOn: false, autoCrewTimer: 5.6 },
      ]
    : [];

  // Final dry-land safety sweep across all non-ferry entities so zero actors stand on 'W', 'L', or '#'
  for (const n of npcs) snapEntityToDryLand(n, rows, TILE_SIZE, true);
  for (const c of chests) snapEntityToDryLand(c, rows, TILE_SIZE, true);
  for (const e of enemies) snapEntityToDryLand(e, rows, TILE_SIZE, true);
  for (const a of alliedSoldiers) snapEntityToDryLand(a, rows, TILE_SIZE, true);
  for (const b of warBanners) snapEntityToDryLand(b, rows, TILE_SIZE, true);
  for (const cage of prisonCages) snapEntityToDryLand(cage, rows, TILE_SIZE, true);
  for (const se of siegeEngines) snapEntityToDryLand(se, rows, TILE_SIZE, true);
  for (const bal of dragonBallistas) snapEntityToDryLand(bal, rows, TILE_SIZE, true);
  for (const tr of traps) snapEntityToDryLand(tr, rows, TILE_SIZE, true);
  for (const bf of biomeFeatures) {
    if (bf.kind !== 'ferry_barge') {
      snapEntityToDryLand(bf, rows, TILE_SIZE, true);
      bf.homeX = bf.x;
      bf.homeY = bf.y;
    }
  }

  return {
    act: cfg,
    grid: rows.map((r) => r.join('')),
    playerSpawn: spawnSide === 'east' ? { x: 540, y: 192 } : { x: 58, y: 192 },
    npcs,
    chests,
    portals,
    enemies,
    alliedSoldiers,
    warBanners,
    prisonCages,
    siegeEngines,
    dragonBallistas,
    traps,
    biomeFeatures,
    torches,
  };
}

export function isWalkableTile(grid: string[], tx: number, ty: number): boolean {
  if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) {
    return false;
  }
  const ch = grid[ty][tx];
  // Strictly allow dry ground, roads, carpets, ice, mud, and bridges ONLY.
  // Walls (#), Rivers/Chasms (W), and Lava/Acid trenches (L) are NON-WALKABLE!
  return ch !== '#' && ch !== 'W' && ch !== 'L';
}

export function isTileSolid(grid: string[], tx: number, ty: number): boolean {
  return !isWalkableTile(grid, tx, ty);
}

export function isTileMud(grid: string[], tx: number, ty: number): boolean {
  if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return false;
  return grid[ty][tx] === 'M';
}

export function isTileIce(grid: string[], tx: number, ty: number): boolean {
  if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return false;
  return grid[ty][tx] === 'I';
}

export function isTileLavaHazard(grid: string[], tx: number, ty: number): boolean {
  if (ty < 0 || ty >= grid.length || tx < 0 || tx >= grid[0].length) return false;
  return grid[ty][tx] === 'L';
}

export function renderActBackground(cfg: ActConfig, grid: string[]): HTMLCanvasElement {
  const rows = grid.length;
  const cols = grid[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = cols * TILE_SIZE;
  canvas.height = rows * TILE_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const p = BIOME_PALETTES[cfg.biomeId] ?? BIOME_PALETTES[1];
  const blueprint = getActBlueprint(cfg.act);

  // Unified 16-bit Organic Simplex-Noise Auto-Tiled Biome Terrain + Clean High-Ground Cliffs & Ramps
  renderOrganicAutoTiledSurface(ctx, grid, blueprint, p, TILE_SIZE);

  // Subtle biome-signature ground glints on open dry '.' tiles only
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x] !== '.') continue;
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      const hash = (x * 73856093) ^ (y * 19349663) ^ (cfg.act * 83492791);
      if (cfg.biomeId === 3 && Math.abs(hash) % 8 === 0) {
        ctx.fillStyle = '#2dd4bf';
        ctx.fillRect(px + 6, py + 6, 3, 2);
        ctx.fillStyle = '#ccfbf1';
        ctx.fillRect(px + 7, py + 8, 1, 2);
      } else if (cfg.biomeId === 4 && Math.abs(hash) % 6 === 0) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(px + 5, py + 7, 2, 2);
      } else if (cfg.biomeId === 'sanctuary' && Math.abs(hash) % 7 === 0) {
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(px + 6, py + 7, 2, 2);
      }
    }
  }

  return canvas;
}

export interface ArcConfigMeta {
  arcNumber: 1 | 2 | 3 | 4 | 5 | 6;
  arcBadge: string;
  enemyFaction: string;
  counterBanner: string;
  counterSummary: string;
  captainPrefix: string;
  bannerLabel1: string;
  bannerLabel2: string;
  enemyPool: EnemyKind[];
}

export function getArcConfig(act: number): ArcConfigMeta {
  if (act <= 41) {
    return {
      arcNumber: 1,
      arcBadge: '⚔️ QUEST ARC I',
      enemyFaction: '🐾 WILD & WOLF HORDE',
      counterBanner: '🚨 10-BEAST FOREST AMBUSH!',
      counterSummary: '3 Goblin Spearmen, 3 Wild Boars, 2 Dire Wolves & 2 Shamans',
      captainPrefix: 'Wild Pack Leader',
      bannerLabel1: 'Regional Stronghold Flag',
      bannerLabel2: 'Forest Watch Outpost',
      enemyPool: ['goblin_grunt', 'rabid_boar', 'shadow_wolf', 'goblin_archer'],
    };
  }
  if (act <= 82) {
    return {
      arcNumber: 2,
      arcBadge: '🛡️ WAR ARC II',
      enemyFaction: '🐶 DOG LEGION',
      counterBanner: '🚨 10-DOG COUNTER-ATTACK!',
      counterSummary: '3 Bulldog Phalanxes, 3 Doberman Assassins, 2 Huskies & 2 Bloodhound Gunners',
      captainPrefix: 'Wolf Banner Captain',
      bannerLabel1: 'Frontline War Outpost',
      bannerLabel2: 'Eastern Trench Redoubt',
      enemyPool: ['hound_scout', 'shadow_wolf'],
    };
  }
  if (act <= 122) {
    return {
      arcNumber: 3,
      arcBadge: '🐉 DRAGON ARC III',
      enemyFaction: '🐉 DRAGON LEGION',
      counterBanner: '🚨 10-DRAKE SKY-DROP AMBUSH!',
      counterSummary: '3 Wyvern-Kin, 3 Drakonid Lancers, 2 Kobold Thieves, Magma-Drake & Void Sorcerer',
      captainPrefix: 'Dragon-Scale Captain',
      bannerLabel1: 'Dragon-Shard Beacon',
      bannerLabel2: 'United Alliance Outpost',
      enemyPool: ['wyvern_kin', 'drakonid_lancer', 'kobold_thief', 'magma_drake', 'void_sorcerer'],
    };
  }
  if (act <= 180) {
    return {
      arcNumber: 4,
      arcBadge: '🐙 KRAKEN ARC IV',
      enemyFaction: '🦑 ABYSSAL ARMADA',
      counterBanner: '🚨 10-ABYSSAL TIDE AMBUSH!',
      counterSummary: '3 Shark-Knights, 3 Crab-Corsairs, 2 Siren-Mages & 2 Kraken Tentacle-Spawns',
      captainPrefix: 'Abyssal Tide Captain',
      bannerLabel1: 'Abyssal Coral Beacon',
      bannerLabel2: 'Sunken Pearl Outpost',
      enemyPool: ['shark_knight', 'crab_corsair', 'siren_mage', 'kraken_tentacle'],
    };
  }
  if (act <= 240) {
    return {
      arcNumber: 5,
      arcBadge: '⚙️ MECHA ARC V',
      enemyFaction: '🤖 CLOCKWORK EMPIRE',
      counterBanner: '🚨 10-AUTOMATON DROP-PODS!',
      counterSummary: '3 Steam-Golems, 3 Clockwork Owls, 2 Cyber-Rat Snipers & 2 Tesla Drones',
      captainPrefix: 'Clockwork Gear Captain',
      bannerLabel1: 'Automaton Relay Spire',
      bannerLabel2: 'Sky-Citadel Telemetry Node',
      enemyPool: ['steam_golem', 'clockwork_owl', 'cyber_rat', 'tesla_drone'],
    };
  }
  return {
    arcNumber: 6,
    arcBadge: '🌌 VOID ARC VI',
    enemyFaction: '👁️ ECLIPSE LEGION',
    counterBanner: '🚨 10-VOID RIFT INCURSION!',
    counterSummary: '3 Void-Stalkers, 3 Astral Wraiths, 2 Singularity Knights & 2 Eclipse Mages',
    captainPrefix: 'Void-Eclipse Captain',
    bannerLabel1: 'Singularity Nexus Pylon',
    bannerLabel2: 'Astral Rift Beacon',
    enemyPool: ['void_stalker', 'nebula_seraph', 'entropy_knight', 'void_sorcerer'],
  };
}

