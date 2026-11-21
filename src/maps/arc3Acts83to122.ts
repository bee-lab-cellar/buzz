import {
  ActBlueprint,
  ElevationZoneBlueprint,
  RampKind,
  RiverCurveBlueprint,
  TerrainThemeId,
  TopologyArchetypeId,
  WeatherEffectId,
} from './arc1Acts1to41';

const ARC3_TITLES: Array<{
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
  { title: 'Scorched Treaty-Banquet Ruins', sub: 'Cinder-Fall Borderlands', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'sunken_amphitheater', landmarkId: 'drowned_bell_tower', landmarkName: 'Shattered Concord Monument', traps: ['magma_geyser', 'spreading_wildfire_barrel'], hasRiver: true, liquid: 'lava' },
  { title: 'Dragon-Claw Crater Causeway', sub: 'Cinder-Fall Borderlands', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 's_curve_high_ridge', landmarkId: 'goblin_bonfire', landmarkName: 'Molten Dragon-Footprint Pit', traps: ['magma_geyser', 'rolling_boulder'], hasRiver: true, liquid: 'lava' },
  { title: 'Wyvern-Roost Palisade', sub: 'Cinder-Fall Borderlands', theme: 'autumn_ridge', weather: 'ash_embers', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Harpoon Ballista Outpost', traps: ['cliff_wind_gust', 'boiling_oil_cauldron'], hasRiver: false },
  { title: 'Ash-Cloud River Gorge', sub: 'Cinder-Fall Borderlands', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'twin_forked_delta', landmarkId: 'spinning_watermill', landmarkName: 'Charred Iron Waterwheel', traps: ['rotating_fire_bar', 'magma_geyser'], hasRiver: true, liquid: 'lava' },
  { title: 'Pyre-Drake Pyroclast’s Lair', sub: 'Cinder-Fall Borderlands', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Elder Pyroclast’s Nest', traps: ['magma_geyser', 'updraft_geyser'], hasRiver: false },
  { title: 'Sulfur-Spire Sky-Bridges', sub: 'Shattered Sky-Archipelago', theme: 'astral_bamboo', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Floating Wind-Shrine', traps: ['updraft_geyser', 'cliff_wind_gust'], hasRiver: false },
  { title: 'Gale-Thermal Updraft Chasm', sub: 'Shattered Sky-Archipelago', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 'spiral_watchtower', landmarkId: 'ruined_watchtower', landmarkName: 'Sky-Harpoon Signal Tower', traps: ['updraft_geyser', 'laser_prism'], hasRiver: false },
  { title: 'Kobold Hoard-Cart Tunnels', sub: 'Shattered Sky-Archipelago', theme: 'fungal_cavern', weather: 'spores', topo: 'minecart_switchyard', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Glittering Dragon-Scale Vault', traps: ['explosive_minecart', 'gold_mimic'], hasRiver: true, liquid: 'acid' },
  { title: 'Floating Basalt Stepping-Isles', sub: 'Shattered Sky-Archipelago', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Suspended Magma Fountain', traps: ['updraft_geyser', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Tempest-Wyrm Stormwing’s Aerie', sub: 'Shattered Sky-Archipelago', theme: 'astral_bamboo', weather: 'rain_squall', topo: 'colosseum_citadel', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Thunder-Crest Dragon Roost', traps: ['chain_lightning_pylon', 'updraft_geyser'], hasRiver: false },
  { title: 'Venom-Scale Acid Fen', sub: 'Blight-Drake Swamp', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'twin_forked_delta', landmarkId: 'drowned_bell_tower', landmarkName: 'Corroded Dragon-Skull Totem', traps: ['rising_acid_tide', 'poison_puffball'], hasRiver: true, liquid: 'acid' },
  { title: 'Boiling Bile-Geyser Boardwalk', sub: 'Blight-Drake Swamp', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'venice_canal_fortress', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Caustic Spore Cauldron', traps: ['rising_acid_tide', 'quicksand_whirlpool'], hasRiver: true, liquid: 'acid' },
  { title: 'Thorn-Scale Labyrinth', sub: 'Blight-Drake Swamp', theme: 'bramble_canyon', weather: 'acid_mist', topo: 'four_chamber_catacomb', landmarkId: 'giant_hollow_oak', landmarkName: 'Petrified Wyvern Tree', traps: ['retracting_thorn_wall', 'dart_totem'], hasRiver: false },
  { title: 'Sunken Dragon-Bone Amphitheater', sub: 'Blight-Drake Swamp', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'sunken_amphitheater', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Ribcage of the Blight-Leviathan', traps: ['rising_acid_tide', 'bounce_mushroom'], hasRiver: true, liquid: 'acid' },
  { title: 'Venom-Dragon Scourge’s Acid Pit', sub: 'Blight-Drake Swamp', theme: 'sunken_marsh', weather: 'acid_mist', topo: 'colosseum_citadel', landmarkId: 'drowned_bell_tower', landmarkName: 'Altar of the Toxic Fang', traps: ['rising_acid_tide', 'poison_puffball'], hasRiver: false },
  { title: 'Rime-Scale Permafrost Ridge', sub: 'Cryo-Dragon Glaciers', theme: 'glacier_peaks', weather: 'blizzard', topo: 's_curve_high_ridge', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Ice-Encased Wyvern Wing', traps: ['sliding_cracking_ice', 'blizzard_brazier'], hasRiver: true },
  { title: 'Shattered Mirror-Ice Cavern', sub: 'Cryo-Dragon Glaciers', theme: 'glacier_peaks', weather: 'blizzard', topo: 'four_chamber_catacomb', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Refractive Frost-Crystal', traps: ['laser_prism', 'sliding_cracking_ice'], hasRiver: false },
  { title: 'Hailstorm Ballista Ramparts', sub: 'Cryo-Dragon Glaciers', theme: 'glacier_peaks', weather: 'blizzard', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Frozen Harpoon Battery', traps: ['blizzard_brazier', 'rolling_boulder'], hasRiver: false },
  { title: 'Glacial Meltwater Cascade', sub: 'Cryo-Dragon Glaciers', theme: 'glacier_peaks', weather: 'blizzard', topo: 'twin_forked_delta', landmarkId: 'spinning_watermill', landmarkName: 'Icicle Sluice-Wheel', traps: ['sliding_cracking_ice', 'cliff_wind_gust'], hasRiver: true },
  { title: 'Cryo-Dragon Frostbite’s Summit', sub: 'Cryo-Dragon Glaciers', theme: 'glacier_peaks', weather: 'blizzard', topo: 'colosseum_citadel', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Crown of the Absolute Zero', traps: ['sliding_cracking_ice', 'blizzard_brazier'], hasRiver: false },
  { title: 'Obsidian Hoard-Vault Causeway', sub: 'Dragon-Emperor’s Treasury', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'venice_canal_fortress', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Golden Coin-River Sluice', traps: ['gold_mimic', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Ruby-Prism Laser Hall', sub: 'Dragon-Emperor’s Treasury', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'four_chamber_catacomb', landmarkId: 'gargoyle_fountain', landmarkName: 'Dragon-Eye Ruby Focusing Lens', traps: ['laser_prism', 'gold_mimic'], hasRiver: false },
  { title: 'Molten Gold Smeltery Tracks', sub: 'Dragon-Emperor’s Treasury', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Bullion Ingot Crucible', traps: ['explosive_minecart', 'boiling_oil_cauldron'], hasRiver: true, liquid: 'lava' },
  { title: 'Chained Sky-Citadel Drawbridge', sub: 'Dragon-Emperor’s Treasury', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'ruined_watchtower', landmarkName: 'Titan-Chain Anchor Keep', traps: ['rune_drawbridge', 'updraft_geyser'], hasRiver: true, liquid: 'lava' },
  { title: 'Chrono-Drake Aurum’s Golden Vault', sub: 'Dragon-Emperor’s Treasury', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Mountain of Stolen Crowns', traps: ['gold_mimic', 'laser_prism'], hasRiver: false },
  { title: 'Void-Scorched Starlight Bridge', sub: 'Astral Eclipse Ascent', theme: 'void_singularity', weather: 'void_eclipse', topo: 'broken_sky_bridge', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Shattered Zodiac Arch', traps: ['black_hole_gravity_well', 'laser_prism'], hasRiver: true, liquid: 'void_stream' },
  { title: 'Nebula-Flame Spiral Sanctuary', sub: 'Astral Eclipse Ascent', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'spiral_watchtower', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Astral Dragon-Lantern', traps: ['bamboo_warp_mirror', 'updraft_geyser'], hasRiver: false },
  { title: 'Meteor-Shower Ridge Switchbacks', sub: 'Astral Eclipse Ascent', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'terraced_switchbacks', landmarkId: 'goblin_bonfire', landmarkName: 'Fallen Star Crater', traps: ['artillery_barrage', 'magma_geyser'], hasRiver: false },
  { title: 'Twin-Sovereign Alliance Outpost', sub: 'Astral Eclipse Ascent', theme: 'river_fortress', weather: 'starlight_motes', topo: 'twin_forked_delta', landmarkId: 'gargoyle_fountain', landmarkName: 'Lion & Wolf Unity Fountain', traps: ['chain_lightning_pylon', 'rune_drawbridge'], hasRiver: true },
  { title: 'Dread-Drake Oblivion’s Rift-Gate', sub: 'Astral Eclipse Ascent', theme: 'void_singularity', weather: 'void_eclipse', topo: 'colosseum_citadel', landmarkId: 'event_horizon_altar_299', landmarkName: 'Portal of the Void-Dragon', traps: ['black_hole_gravity_well', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Cataclysm Caldera Rim-Walk', sub: 'World-Breaker’s Spire', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 's_curve_high_ridge', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Hellfire Vent Overlook', traps: ['magma_geyser', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Six-Winged Temple Catacombs', sub: 'World-Breaker’s Spire', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'four_chamber_catacomb', landmarkId: 'gargoyle_fountain', landmarkName: 'Idol of the Six Wings', traps: ['rotating_fire_bar', 'boiling_oil_cauldron'], hasRiver: true, liquid: 'lava' },
  { title: 'Sky-Harpoon Battery Promenade', sub: 'World-Breaker’s Spire', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'ruined_watchtower', landmarkName: 'Grand Dragon-Slayer Ballista', traps: ['updraft_geyser', 'artillery_barrage'], hasRiver: true, liquid: 'lava' },
  { title: 'Lava-Waterfall Ascent Stairs', sub: 'World-Breaker’s Spire', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'terraced_switchbacks', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Cascade of Molten Star-Iron', traps: ['magma_geyser', 'explosive_minecart'], hasRiver: true, liquid: 'lava' },
  { title: 'Arch-Wyrm Solaris’s Sun-Crucible', sub: 'World-Breaker’s Spire', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Solaris Supernova Brazier', traps: ['rotating_fire_bar', 'magma_geyser'], hasRiver: false },
  { title: 'Shattered Sky-Throne Approach', sub: 'Apex of the Cataclysm', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'spiral_watchtower', landmarkId: 'ruined_watchtower', landmarkName: 'Pillar of the Fallen Sky', traps: ['updraft_geyser', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Molten Star-Chain Causeway', sub: 'Apex of the Cataclysm', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'broken_sky_bridge', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Heaven-Binding Forge Link', traps: ['magma_geyser', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Dragon-God’s Antechamber', sub: 'Apex of the Cataclysm', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'sunken_amphitheater', landmarkId: 'gargoyle_fountain', landmarkName: 'Basin of Dragonfire Tears', traps: ['laser_prism', 'magma_geyser'], hasRiver: true, liquid: 'lava' },
  { title: 'Floating Astral Star-Forge of Unity', sub: 'United Cat-Dog-Duck Sanctum', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'sunken_amphitheater', landmarkId: 'floating_star_forge_121', landmarkName: 'Celestial Anvil of the Four Heroes', traps: ['bounce_mushroom', 'updraft_geyser'], hasRiver: true },
  { title: 'Throne of Ignis-Bahamut, The World-Breaker', sub: 'Supernova Sky-Caldera', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Apex Altar of the World-Breaker Dragon', traps: ['updraft_geyser', 'magma_geyser'], hasRiver: false },
];

export const ARC3_ACTS_83_TO_122: ActBlueprint[] = ARC3_TITLES.map((item, idx) => {
  const actId = 83 + idx;
  const rampKinds: RampKind[] = ['stone_stairs', 'wood_ramp', 'vine_ladder', 'updraft_pad'];

  const elevationZones: ElevationZoneBlueprint[] = [
    {
      x1: 5,
      y1: 3 + (actId % 2),
      x2: 14,
      y2: 9,
      tier: 1,
      rampAt: { x: 10, y: 9, kind: rampKinds[actId % 4] },
    },
    {
      x1: 22,
      y1: 14,
      x2: 33,
      y2: 20,
      tier: 1,
      rampAt: { x: 24, y: 14, kind: rampKinds[(actId + 1) % 4] },
    },
    {
      x1: 14,
      y1: 4,
      x2: 23,
      y2: 8,
      tier: 2,
      rampAt: { x: 18, y: 8, kind: 'updraft_pad' },
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
        liquid: item.liquid ?? 'lava',
        startX: 12 + (actId % 5) * 2,
        startY: 1,
        ctrl1X: 8 + ((actId * 3) % 10),
        ctrl1Y: 8,
        ctrl2X: 20 + ((actId * 5) % 8),
        ctrl2Y: 15,
        endX: 14 + ((actId * 2) % 9),
        endY: 22,
        widthTiles: 2 + (actId % 2),
        currentVx: (actId % 2 === 0 ? 1 : -1) * 18,
        currentVy: 24,
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
      x: 292 + ((actId % 5) - 2) * 16,
      y: 94 + ((actId % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 134, y: 116, radius: 26 },
      { x: 352, y: 216, radius: 28 },
    ],
    destructibleProps: [
      { kind: 'oil_barrel', x: 132, y: 152 },
      { kind: 'oil_barrel', x: 242, y: 114 },
      { kind: 'crumbling_pillar', x: 358, y: 168 },
      { kind: 'wood_crate', x: 412, y: 192 },
    ],
  };
});
