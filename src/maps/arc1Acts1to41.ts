export type TerrainThemeId =
  | 'lush_highlands'
  | 'bramble_canyon'
  | 'fungal_cavern'
  | 'autumn_ridge'
  | 'glacier_peaks'
  | 'volcanic_caldera'
  | 'sunken_marsh'
  | 'astral_bamboo'
  | 'trench_battlefield'
  | 'river_fortress'
  | 'coral_atoll'
  | 'clockwork_citadel'
  | 'void_singularity';

export type WeatherEffectId =
  | 'sunbeams'
  | 'spores'
  | 'falling_leaves'
  | 'blizzard'
  | 'ash_embers'
  | 'acid_mist'
  | 'starlight_motes'
  | 'rain_squall'
  | 'abyssal_bubbles'
  | 'steam_sparks'
  | 'void_eclipse';

export type TopologyArchetypeId =
  | 'twin_forked_delta'
  | 's_curve_high_ridge'
  | 'four_chamber_catacomb'
  | 'spiral_watchtower'
  | 'sunken_amphitheater'
  | 'venice_canal_fortress'
  | 'broken_sky_bridge'
  | 'moving_galleon_deck'
  | 'terraced_switchbacks'
  | 'minecart_switchyard'
  | 'colosseum_citadel';

export type RampKind = 'stone_stairs' | 'wood_ramp' | 'vine_ladder' | 'updraft_pad';

export interface ElevationZoneBlueprint {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tier: 0 | 1 | 2;
  rampAt: { x: number; y: number; kind: RampKind };
}

export interface RiverCurveBlueprint {
  style: 'bezier_meander' | 'twin_fork' | 's_gorge' | 'moat_ring' | 'cascade_falls';
  liquid: 'water' | 'acid' | 'lava' | 'void_stream';
  startX: number;
  startY: number;
  ctrl1X: number;
  ctrl1Y: number;
  ctrl2X: number;
  ctrl2Y: number;
  endX: number;
  endY: number;
  widthTiles: number;
  currentVx: number;
  currentVy: number;
  bridgeCoords: Array<{ x: number; y: number }>;
  fordCoords: Array<{ x: number; y: number }>;
}

export type DestructiblePropKind =
  | 'wood_crate'
  | 'oil_barrel'
  | 'zelda_bush'
  | 'crumbling_pillar'
  | 'push_block';

export interface ActBlueprint {
  actId: number;
  title: string;
  subRegionName: string;
  terrainTheme: TerrainThemeId;
  weatherEffect: WeatherEffectId;
  topologyArchetype: TopologyArchetypeId;
  elevationZones: ElevationZoneBlueprint[];
  riverConfig: RiverCurveBlueprint | null;
  trapTypes: string[];
  landmark: {
    id: string;
    name: string;
    x: number;
    y: number;
    loreHint: string;
  };
  tallGrassPatches: Array<{ x: number; y: number; radius: number }>;
  destructibleProps: Array<{ kind: DestructiblePropKind; x: number; y: number }>;
}

const ARC1_TITLES: Array<{
  title: string;
  sub: string;
  theme: TerrainThemeId;
  weather: WeatherEffectId;
  topo: TopologyArchetypeId;
  landmarkId: string;
  landmarkName: string;
  traps: [string, string];
  hasRiver: boolean;
  liquid?: 'water' | 'acid' | 'lava' | 'void_stream';
}> = [
  { title: 'Whispering Sun-Meadow Outskirts', sub: 'Emerald Crownwoods', theme: 'lush_highlands', weather: 'sunbeams', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Ruined Sun-Watchtower', traps: ['swinging_log', 'leaf_pitfall'], hasRiver: true },
  { title: 'Old Millstream Ford', sub: 'Emerald Crownwoods', theme: 'lush_highlands', weather: 'sunbeams', topo: 'twin_forked_delta', landmarkId: 'spinning_watermill', landmarkName: 'Spinning Timber Watermill', traps: ['rolling_boulder', 'bear_trap'], hasRiver: true },
  { title: 'Hollow Oak Crossroads', sub: 'Emerald Crownwoods', theme: 'lush_highlands', weather: 'sunbeams', topo: 's_curve_high_ridge', landmarkId: 'giant_hollow_oak', landmarkName: 'Ancient Elder Hollow Oak', traps: ['swinging_log', 'bounce_mushroom'], hasRiver: false },
  { title: 'Goblin Bonfire Ridge', sub: 'Emerald Crownwoods', theme: 'lush_highlands', weather: 'sunbeams', topo: 'spiral_watchtower', landmarkId: 'goblin_bonfire', landmarkName: 'Roaring Goblin War-Bonfire', traps: ['rolling_boulder', 'boiling_oil_cauldron'], hasRiver: false },
  { title: 'King Grommash’s Timber Bastion', sub: 'Emerald Crownwoods', theme: 'lush_highlands', weather: 'sunbeams', topo: 'colosseum_citadel', landmarkId: 'goblin_bonfire', landmarkName: 'Warlord Grommash’s Totem Pyre', traps: ['swinging_log', 'bear_trap'], hasRiver: false },
  { title: 'Bramble-Thorn Ravine', sub: 'Razor-Briar Gorge', theme: 'bramble_canyon', weather: 'falling_leaves', topo: 's_curve_high_ridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Weeping Briar Gargoyle', traps: ['retracting_thorn_wall', 'bear_trap'], hasRiver: true },
  { title: 'Nettle-Weaver Suspension Pass', sub: 'Razor-Briar Gorge', theme: 'bramble_canyon', weather: 'falling_leaves', topo: 'broken_sky_bridge', landmarkId: 'ruined_watchtower', landmarkName: 'Briar-Choked Signal Tower', traps: ['cliff_wind_gust', 'retracting_thorn_wall'], hasRiver: true },
  { title: 'Sawmill Timber-Chute', sub: 'Razor-Briar Gorge', theme: 'bramble_canyon', weather: 'falling_leaves', topo: 'minecart_switchyard', landmarkId: 'spinning_watermill', landmarkName: 'Rust-Blade Lumber Mill', traps: ['sawmill_buzzsaw', 'rolling_boulder'], hasRiver: true },
  { title: 'Hollow-Root Ambush Gulch', sub: 'Razor-Briar Gorge', theme: 'bramble_canyon', weather: 'falling_leaves', topo: 'terraced_switchbacks', landmarkId: 'giant_hollow_oak', landmarkName: 'Strangler-Root Archway', traps: ['leaf_pitfall', 'dart_totem'], hasRiver: false },
  { title: 'Brambleback’s Iron-Thorn Arena', sub: 'Razor-Briar Gorge', theme: 'bramble_canyon', weather: 'falling_leaves', topo: 'colosseum_citadel', landmarkId: 'giant_hollow_oak', landmarkName: 'Iron-Briar Behemoth Den', traps: ['retracting_thorn_wall', 'sawmill_buzzsaw'], hasRiver: false },
  { title: 'Glow-Cap Mycelium Grotto', sub: 'Bioluminescent Underdark', theme: 'fungal_cavern', weather: 'spores', topo: 'four_chamber_catacomb', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Azure Spore-Lantern Shrine', traps: ['bounce_mushroom', 'poison_puffball'], hasRiver: true, liquid: 'acid' },
  { title: 'Spore-Mist Underground Cascade', sub: 'Bioluminescent Underdark', theme: 'fungal_cavern', weather: 'spores', topo: 'twin_forked_delta', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Crystal Mycelium Font', traps: ['poison_puffball', 'darkness_lantern'], hasRiver: true, liquid: 'acid' },
  { title: 'Echoing Stalactite Vaults', sub: 'Bioluminescent Underdark', theme: 'fungal_cavern', weather: 'spores', topo: 'sunken_amphitheater', landmarkId: 'gargoyle_fountain', landmarkName: 'Subterranean Echo Basin', traps: ['bounce_mushroom', 'rolling_boulder'], hasRiver: false },
  { title: 'Shriek-Bat Lantern Labyrinth', sub: 'Bioluminescent Underdark', theme: 'fungal_cavern', weather: 'spores', topo: 'four_chamber_catacomb', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Bioluminescent Spore Obelisk', traps: ['darkness_lantern', 'poison_puffball'], hasRiver: false },
  { title: 'Spore-Lord Mycon’s Cavern Sanctum', sub: 'Bioluminescent Underdark', theme: 'fungal_cavern', weather: 'spores', topo: 'colosseum_citadel', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Grand Mycelium Throne', traps: ['bounce_mushroom', 'poison_puffball'], hasRiver: false },
  { title: 'Crimson Maple Wind-Steppe', sub: 'Autumnal Gale-Ridges', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Vermilion Gale Watchtower', traps: ['cliff_wind_gust', 'swinging_log'], hasRiver: true },
  { title: 'Gilded Acorn Aqueduct', sub: 'Autumnal Gale-Ridges', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 'venice_canal_fortress', landmarkId: 'spinning_watermill', landmarkName: 'Autumnal Leaf-Wheel Mill', traps: ['sawmill_buzzsaw', 'cliff_wind_gust'], hasRiver: true },
  { title: 'Whispering Crow-Perch Crags', sub: 'Autumnal Gale-Ridges', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 's_curve_high_ridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Feather-Crest Shrine', traps: ['cliff_wind_gust', 'dart_totem'], hasRiver: false },
  { title: 'Amber-Leaf Rope-Bridge Chasm', sub: 'Autumnal Gale-Ridges', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 'broken_sky_bridge', landmarkId: 'giant_hollow_oak', landmarkName: 'Golden Heartwood Torii', traps: ['cliff_wind_gust', 'updraft_geyser'], hasRiver: true },
  { title: 'Gale-Harpy Matriarch’s Aerie', sub: 'Autumnal Gale-Ridges', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 'colosseum_citadel', landmarkId: 'ruined_watchtower', landmarkName: 'Tempest Roost Spire', traps: ['cliff_wind_gust', 'updraft_geyser'], hasRiver: false },
  { title: 'Frost-Fang Glacial Causeway', sub: 'Howling Permafrost Peaks', theme: 'glacier_peaks', weather: 'blizzard', topo: 'twin_forked_delta', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Frozen Titan Mammoth Ribs', traps: ['sliding_cracking_ice', 'blizzard_brazier'], hasRiver: true },
  { title: 'Icicle-Mirror Crystalline Gorge', sub: 'Howling Permafrost Peaks', theme: 'glacier_peaks', weather: 'blizzard', topo: 's_curve_high_ridge', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Glacial Prism Monolith', traps: ['laser_prism', 'sliding_cracking_ice'], hasRiver: false },
  { title: 'Avalanche Switchback Ascent', sub: 'Howling Permafrost Peaks', theme: 'glacier_peaks', weather: 'blizzard', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Frost-Watch Signal Brazier', traps: ['rolling_boulder', 'blizzard_brazier'], hasRiver: false },
  { title: 'Sub-Zero Fjord Ice-Bridges', sub: 'Howling Permafrost Peaks', theme: 'glacier_peaks', weather: 'blizzard', topo: 'venice_canal_fortress', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Ice-Locked Viking Prow', traps: ['sliding_cracking_ice', 'bear_trap'], hasRiver: true },
  { title: 'Frost-Jarl Ymir’s Glacier Bastion', sub: 'Howling Permafrost Peaks', theme: 'glacier_peaks', weather: 'blizzard', topo: 'colosseum_citadel', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Throne of Eternal Permafrost', traps: ['sliding_cracking_ice', 'laser_prism'], hasRiver: false },
  { title: 'Cinder-Crag Obsidian Trail', sub: 'Smoldering Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 's_curve_high_ridge', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Dwarven Blast-Anvil', traps: ['magma_geyser', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Sulfur-Rail Minecart Tunnels', sub: 'Smoldering Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Molten Ore Tipple', traps: ['explosive_minecart', 'magma_geyser'], hasRiver: true, liquid: 'lava' },
  { title: 'Basalt-Pillar Lava Falls', sub: 'Smoldering Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Crucible Sluice-Gate', traps: ['rotating_fire_bar', 'boiling_oil_cauldron'], hasRiver: true, liquid: 'lava' },
  { title: 'Pyroclast Iron-Foundry', sub: 'Smoldering Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'four_chamber_catacomb', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Great Magma Bellows', traps: ['explosive_minecart', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Viperfang’s Molten Forge-Pit', sub: 'Smoldering Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Obsidian Wyrm-Altar', traps: ['magma_geyser', 'rotating_fire_bar'], hasRiver: false },
  { title: 'Weeping Cypress Bayou', sub: 'Sunken Witch-Marsh', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'twin_forked_delta', landmarkId: 'drowned_bell_tower', landmarkName: 'Sunken Cathedral Bell-Tower', traps: ['quicksand_whirlpool', 'dart_totem'], hasRiver: true, liquid: 'acid' },
  { title: 'Croaking Totem Boardwalk', sub: 'Sunken Witch-Marsh', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'venice_canal_fortress', landmarkId: 'drowned_bell_tower', landmarkName: 'Moss-Grown Idol Pier', traps: ['dart_totem', 'rising_acid_tide'], hasRiver: true, liquid: 'acid' },
  { title: 'Mire-Serpent Sunken Ruins', sub: 'Sunken Witch-Marsh', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'sunken_amphitheater', landmarkId: 'gargoyle_fountain', landmarkName: 'Venom-Spout Serpent Basin', traps: ['rising_acid_tide', 'quicksand_whirlpool'], hasRiver: true, liquid: 'acid' },
  { title: 'Three-Rune Drawbridge Fen', sub: 'Sunken Witch-Marsh', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'broken_sky_bridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Runic Sluice-Keep', traps: ['rune_drawbridge', 'dart_totem'], hasRiver: true, liquid: 'acid' },
  { title: 'Bog-Hydra’s Tidal Ziggurat', sub: 'Sunken Witch-Marsh', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'colosseum_citadel', landmarkId: 'drowned_bell_tower', landmarkName: 'Altar of the Drowned Bell', traps: ['rising_acid_tide', 'dart_totem'], hasRiver: false },
  { title: 'Jade-Stalk Whispering Grove', sub: 'Astral Bamboo Highlands', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'terraced_switchbacks', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Celestial Tea Pavilion', traps: ['bamboo_warp_mirror', 'cliff_wind_gust'], hasRiver: true },
  { title: 'Star-Mirror Stepping Stones', sub: 'Astral Bamboo Highlands', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'twin_forked_delta', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Moon-Reflection Bridge', traps: ['bamboo_warp_mirror', 'updraft_geyser'], hasRiver: true },
  { title: 'Cloud-Crane Pagoda Steps', sub: 'Astral Bamboo Highlands', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'spiral_watchtower', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Seven-Tier Wind Pagoda', traps: ['updraft_geyser', 'laser_prism'], hasRiver: false },
  { title: 'Aether-Wing Griffin’s Sky-Roost', sub: 'Astral Bamboo Highlands', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'colosseum_citadel', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Apex Griffin Sun-Aerie', traps: ['updraft_geyser', 'cliff_wind_gust'], hasRiver: false },
  { title: 'Sacred Lotus Sanctuary of The Great Duck', sub: 'Celestial Lotus Pond', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'sunken_amphitheater', landmarkId: 'lotus_sanctuary_40', landmarkName: 'Golden Shrine of The Great Duck', traps: ['bounce_mushroom', 'updraft_geyser'], hasRiver: true },
  { title: 'Shadow-Sealed Throne of Felis Citadel', sub: 'Royal Cat Acropolis', theme: 'river_fortress', weather: 'starlight_motes', topo: 'colosseum_citadel', landmarkId: 'gargoyle_fountain', landmarkName: 'Shattered Star-Wand Dais', traps: ['chain_lightning_pylon', 'laser_prism'], hasRiver: false },
];

export const ARC1_ACTS_1_TO_41: ActBlueprint[] = ARC1_TITLES.map((item, idx) => {
  const actId = idx + 1;
  const seed = actId * 37;
  const rampKinds: RampKind[] = ['stone_stairs', 'wood_ramp', 'vine_ladder', 'updraft_pad'];

  const elevationZones: ElevationZoneBlueprint[] = [
    {
      x1: 5 + (actId % 3),
      y1: 3,
      x2: 14 + (actId % 4),
      y2: 8,
      tier: 1,
      rampAt: { x: 10 + (actId % 3), y: 8, kind: rampKinds[actId % 4] },
    },
    {
      x1: 22 - (actId % 3),
      y1: 15,
      x2: 32,
      y2: 20,
      tier: 1,
      rampAt: { x: 24, y: 15, kind: rampKinds[(actId + 1) % 4] },
    },
    {
      x1: 15,
      y1: 4 + (actId % 2),
      x2: 22,
      y2: 7 + (actId % 2),
      tier: 2,
      rampAt: { x: 18, y: 7 + (actId % 2), kind: rampKinds[(actId + 2) % 4] },
    },
  ];

  const riverstyles: RiverCurveBlueprint['style'][] = [
    'bezier_meander',
    'twin_fork',
    's_gorge',
    'moat_ring',
    'cascade_falls',
  ];

  const riverConfig: RiverCurveBlueprint | null = item.hasRiver
    ? {
        style: riverstyles[actId % riverstyles.length],
        liquid: item.liquid ?? 'water',
        startX: 12 + (actId % 5) * 2,
        startY: 1,
        ctrl1X: 8 + ((actId * 3) % 10),
        ctrl1Y: 8,
        ctrl2X: 20 + ((actId * 5) % 8),
        ctrl2Y: 15,
        endX: 14 + ((actId * 2) % 10),
        endY: 22,
        widthTiles: 2 + (actId % 2),
        currentVx: (actId % 2 === 0 ? 1 : -1) * 14,
        currentVy: 22,
        bridgeCoords: [
          { x: 14 + (actId % 4), y: 6 },
          { x: 16 + (actId % 4), y: 11 },
          { x: 15 + (actId % 4), y: 17 },
        ],
        fordCoords: [
          { x: 15 + (actId % 3), y: 9 },
          { x: 16 + (actId % 3), y: 14 },
        ],
      }
    : null;

  return {
    actId,
    title: item.title,
    subRegionName: item.sub,
    terrainTheme: item.theme,
    weatherEffect: item.weather,
    topologyArchetype: item.topo,
    elevationZones,
    riverConfig,
    trapTypes: item.traps,
    landmark: {
      id: item.landmarkId,
      name: item.landmarkName,
      x: 288 + ((seed % 5) - 2) * 16,
      y: 96 + ((seed % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 132 + (actId % 4) * 18, y: 112 + (actId % 3) * 16, radius: 28 },
      { x: 348 - (actId % 4) * 16, y: 224 - (actId % 3) * 14, radius: 30 },
      { x: 244 + (actId % 3) * 14, y: 168, radius: 24 },
    ],
    destructibleProps: [
      { kind: 'zelda_bush', x: 116, y: 142 },
      { kind: 'zelda_bush', x: 148, y: 214 },
      { kind: 'wood_crate', x: 224, y: 118 },
      { kind: 'oil_barrel', x: 364, y: 156 },
      { kind: 'crumbling_pillar', x: 422, y: 198 },
    ],
  };
});
