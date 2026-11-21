import {
  ActBlueprint,
  ElevationZoneBlueprint,
  RampKind,
  RiverCurveBlueprint,
  TerrainThemeId,
  TopologyArchetypeId,
  WeatherEffectId,
} from './arc1Acts1to41';

const ARC2_TITLES: Array<{
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
  { title: 'No-Cat’s-Land Barbed-Wire Trenches', sub: 'Borderland Mud-Trenches', theme: 'trench_battlefield', weather: 'rain_squall', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Shell-Cratered Command Bunker', traps: ['trench_landmine', 'artillery_barrage'], hasRiver: true },
  { title: 'Howitzer Mud-Salient Redoubt', sub: 'Borderland Mud-Trenches', theme: 'trench_battlefield', weather: 'rain_squall', topo: 's_curve_high_ridge', landmarkId: 'goblin_bonfire', landmarkName: 'Sandbag Mortar Emplacement', traps: ['artillery_barrage', 'bear_trap'], hasRiver: false },
  { title: 'Pontoon-Bridge River Crossing', sub: 'Iron-Paw River Front', theme: 'river_fortress', weather: 'rain_squall', topo: 'twin_forked_delta', landmarkId: 'spinning_watermill', landmarkName: 'Armored River-Lock Gatehouse', traps: ['moving_river_barge', 'trench_landmine'], hasRiver: true },
  { title: 'Direfang Supply-Train Railhead', sub: 'Iron-Paw River Front', theme: 'trench_battlefield', weather: 'ash_embers', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Armored Steam-Locomotive Depot', traps: ['explosive_minecart', 'sawmill_buzzsaw'], hasRiver: false },
  { title: 'General Vane’s Ironclad Bulwark', sub: 'Iron-Paw River Front', theme: 'river_fortress', weather: 'rain_squall', topo: 'colosseum_citadel', landmarkId: 'ruined_watchtower', landmarkName: 'Ironclad Siege Bastion', traps: ['artillery_barrage', 'boiling_oil_cauldron'], hasRiver: false },
  { title: 'Venice-Canal Gondola Citadel', sub: 'Sunken Canal Fortress', theme: 'river_fortress', weather: 'rain_squall', topo: 'venice_canal_fortress', landmarkId: 'gargoyle_fountain', landmarkName: 'Lion-Crest Canal Archway', traps: ['moving_river_barge', 'prisoner_cage'], hasRiver: true },
  { title: 'Drowned Aqueduct Stockade', sub: 'Sunken Canal Fortress', theme: 'river_fortress', weather: 'rain_squall', topo: 'sunken_amphitheater', landmarkId: 'drowned_bell_tower', landmarkName: 'Submerged Cistern Keep', traps: ['rune_drawbridge', 'boiling_oil_cauldron'], hasRiver: true },
  { title: 'Timber-Lock Barge Drydock', sub: 'Sunken Canal Fortress', theme: 'river_fortress', weather: 'sunbeams', topo: 'broken_sky_bridge', landmarkId: 'spinning_watermill', landmarkName: 'Harbor Crane Gantry', traps: ['moving_river_barge', 'sawmill_buzzsaw'], hasRiver: true },
  { title: 'Prison-Hulk Mooring Pier', sub: 'Sunken Canal Fortress', theme: 'river_fortress', weather: 'rain_squall', topo: 'moving_galleon_deck', landmarkId: 'drowned_bell_tower', landmarkName: 'Iron-Chain Brigantine', traps: ['prisoner_cage', 'boiling_oil_cauldron'], hasRiver: true },
  { title: 'Admiral Houndstooth’s Dreadnought Dock', sub: 'Sunken Canal Fortress', theme: 'river_fortress', weather: 'rain_squall', topo: 'colosseum_citadel', landmarkId: 'spinning_watermill', landmarkName: 'Naval Sea-Fortress Battery', traps: ['artillery_barrage', 'moving_river_barge'], hasRiver: false },
  { title: 'Howling Tundra Siege-Camp', sub: 'Frost-Wolf Winter Front', theme: 'glacier_peaks', weather: 'blizzard', topo: 'terraced_switchbacks', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Frost-Wolf Supply Palisade', traps: ['blizzard_brazier', 'sliding_cracking_ice'], hasRiver: false },
  { title: 'Frozen River Ice-Breaker Pass', sub: 'Frost-Wolf Winter Front', theme: 'glacier_peaks', weather: 'blizzard', topo: 'twin_forked_delta', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Shattered Icebreaker Hull', traps: ['sliding_cracking_ice', 'trench_landmine'], hasRiver: true },
  { title: 'Whiteout Watchtower Ridge', sub: 'Frost-Wolf Winter Front', theme: 'glacier_peaks', weather: 'blizzard', topo: 'spiral_watchtower', landmarkId: 'ruined_watchtower', landmarkName: 'Beacon of the Northern Watch', traps: ['blizzard_brazier', 'cliff_wind_gust'], hasRiver: false },
  { title: 'Glacial Crevasse Rope-Walks', sub: 'Frost-Wolf Winter Front', theme: 'glacier_peaks', weather: 'blizzard', topo: 'broken_sky_bridge', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Rime-Crusted Suspension Span', traps: ['sliding_cracking_ice', 'rolling_boulder'], hasRiver: true },
  { title: 'Wolf-Marshal Skoll’s Blizzard Keep', sub: 'Frost-Wolf Winter Front', theme: 'glacier_peaks', weather: 'blizzard', topo: 'colosseum_citadel', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Citadel of the Winter Fang', traps: ['blizzard_brazier', 'sliding_cracking_ice'], hasRiver: false },
  { title: 'Smokestack Conveyor Foundry', sub: 'Direfang War-Factory', theme: 'volcanic_caldera', weather: 'steam_sparks', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Automated Stamp-Mill', traps: ['factory_conveyor_crusher', 'sawmill_buzzsaw'], hasRiver: true, liquid: 'lava' },
  { title: 'Molten Slag-Vats Assembly Hall', sub: 'Direfang War-Factory', theme: 'volcanic_caldera', weather: 'steam_sparks', topo: 'four_chamber_catacomb', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Crucible Pouring Gantry', traps: ['factory_conveyor_crusher', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'High-Voltage Capacitor Catwalks', sub: 'Direfang War-Factory', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'broken_sky_bridge', landmarkId: 'clockwork_observatory_239', landmarkName: 'Arc-Coil Dynamo Spire', traps: ['chain_lightning_pylon', 'factory_conveyor_crusher'], hasRiver: false },
  { title: 'Armored Train Loading Yard', sub: 'Direfang War-Factory', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Siege-Cannon Turntable', traps: ['explosive_minecart', 'factory_conveyor_crusher'], hasRiver: false },
  { title: 'Iron-Warden Forge-Colossus Arena', sub: 'Direfang War-Factory', theme: 'volcanic_caldera', weather: 'steam_sparks', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Heart of the War-Foundry', traps: ['factory_conveyor_crusher', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Scorched Timber Palisade', sub: 'Crimson Siege Outskirts', theme: 'autumn_ridge', weather: 'ash_embers', topo: 's_curve_high_ridge', landmarkId: 'goblin_bonfire', landmarkName: 'Burning Catapult Lines', traps: ['spreading_wildfire_barrel', 'boiling_oil_cauldron'], hasRiver: true },
  { title: 'Golden Lion Battering-Ram Causeway', sub: 'Crimson Siege Outskirts', theme: 'trench_battlefield', weather: 'ash_embers', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Gatehouse of the Iron Hound', traps: ['battering_ram_escort', 'boiling_oil_cauldron'], hasRiver: false },
  { title: 'Boiling-Oil Rampart Walkways', sub: 'Crimson Siege Outskirts', theme: 'river_fortress', weather: 'ash_embers', topo: 'spiral_watchtower', landmarkId: 'gargoyle_fountain', landmarkName: 'Murder-Hole Barbican', traps: ['boiling_oil_cauldron', 'spreading_wildfire_barrel'], hasRiver: true },
  { title: 'Breech-Wall Rubble Labyrinth', sub: 'Crimson Siege Outskirts', theme: 'trench_battlefield', weather: 'ash_embers', topo: 'four_chamber_catacomb', landmarkId: 'ruined_watchtower', landmarkName: 'Shattered Curtain-Wall', traps: ['artillery_barrage', 'trench_landmine'], hasRiver: false },
  { title: 'Siege-General Cerberus’s Gate-Fortress', sub: 'Crimson Siege Outskirts', theme: 'trench_battlefield', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Triple-Jawed Iron Gate', traps: ['boiling_oil_cauldron', 'artillery_barrage'], hasRiver: false },
  { title: 'Zeppelin Mooring Sky-Piers', sub: 'Cloud-Fleet Armada', theme: 'astral_bamboo', weather: 'sunbeams', topo: 'broken_sky_bridge', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Sky-Harbor Anchor Mast', traps: ['cliff_wind_gust', 'updraft_geyser'], hasRiver: false },
  { title: 'Broadside Gun-Deck Promenade', sub: 'Cloud-Fleet Armada', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'moving_galleon_deck', landmarkId: 'spinning_watermill', landmarkName: 'Twin-Propeller Airship Rudder', traps: ['artillery_barrage', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Parachute Drop-Zone Ridges', sub: 'Cloud-Fleet Armada', theme: 'autumn_ridge', weather: 'falling_leaves', topo: 's_curve_high_ridge', landmarkId: 'ruined_watchtower', landmarkName: 'Anti-Air Flak Beacon', traps: ['updraft_geyser', 'trench_landmine'], hasRiver: true },
  { title: 'Flagship Engine-Room Catwalks', sub: 'Cloud-Fleet Armada', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'four_chamber_catacomb', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Aether-Turbine Core', traps: ['rotating_fire_bar', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Sky-Admiral Lupus’s Command Deck', sub: 'Cloud-Fleet Armada', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'colosseum_citadel', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Dread-Zeppelin Bridge', traps: ['chain_lightning_pylon', 'cliff_wind_gust'], hasRiver: false },
  { title: 'Obsidian Spire Outer Moat', sub: 'Direfang Imperial Capital', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'venice_canal_fortress', landmarkId: 'gargoyle_fountain', landmarkName: 'Crimson Hound Gargoyle Bridge', traps: ['rune_drawbridge', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Hall of Captured Royal Standards', sub: 'Direfang Imperial Capital', theme: 'river_fortress', weather: 'ash_embers', topo: 'four_chamber_catacomb', landmarkId: 'drowned_bell_tower', landmarkName: 'Vault of Fallen Crowns', traps: ['gold_mimic', 'laser_prism'], hasRiver: false },
  { title: 'Blood-Moon Gladiator Pit', sub: 'Direfang Imperial Capital', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'sunken_amphitheater', landmarkId: 'goblin_bonfire', landmarkName: 'Braziers of the Blood-Hound', traps: ['sawmill_buzzsaw', 'boiling_oil_cauldron'], hasRiver: true, liquid: 'lava' },
  { title: 'Imperial Chariot Causeway', sub: 'Direfang Imperial Capital', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'terraced_switchbacks', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Triumphal Arch of Vargos', traps: ['explosive_minecart', 'rotating_fire_bar'], hasRiver: false },
  { title: 'Shadow-Shogun’s Inner Courtyard', sub: 'Direfang Imperial Capital', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'twin_forked_delta', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Moon-Blade Dojo Shrine', traps: ['bamboo_warp_mirror', 'laser_prism'], hasRiver: true },
  { title: 'Treasury of the Iron Crown', sub: 'Direfang Imperial Capital', theme: 'river_fortress', weather: 'ash_embers', topo: 'four_chamber_catacomb', landmarkId: 'gargoyle_fountain', landmarkName: 'Golden Hound Coffer', traps: ['gold_mimic', 'dart_totem'], hasRiver: false },
  { title: 'Praetorian Wolf-Guard Steps', sub: 'Direfang Imperial Capital', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'spiral_watchtower', landmarkId: 'ruined_watchtower', landmarkName: 'Obsidian Sentinel Spire', traps: ['chain_lightning_pylon', 'rotating_fire_bar'], hasRiver: true, liquid: 'lava' },
  { title: 'Shattered Peace-Treaty Plaza', sub: 'Direfang Imperial Capital', theme: 'trench_battlefield', weather: 'ash_embers', topo: 's_curve_high_ridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Cracked Obelisk of Concord', traps: ['artillery_barrage', 'magma_geyser'], hasRiver: false },
  { title: 'Obsidian War-Sanctuary of the Two Crowns', sub: 'Allied Staging Bastion', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'sunken_amphitheater', landmarkId: 'obsidian_war_pavilion_81', landmarkName: 'Royal Lion & Great Duck War-Tent', traps: ['bounce_mushroom', 'updraft_geyser'], hasRiver: true },
  { title: 'The Obsidian Colosseum of Ragnarok', sub: 'Throne of the World-Hound', theme: 'volcanic_caldera', weather: 'ash_embers', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Altar of the Primordial World-Hound', traps: ['magma_geyser', 'chain_lightning_pylon'], hasRiver: false },
];

export const ARC2_ACTS_42_TO_82: ActBlueprint[] = ARC2_TITLES.map((item, idx) => {
  const actId = 42 + idx;
  const rampKinds: RampKind[] = ['stone_stairs', 'wood_ramp', 'vine_ladder', 'updraft_pad'];

  const elevationZones: ElevationZoneBlueprint[] = [
    {
      x1: 6 + (actId % 3),
      y1: 3,
      x2: 15,
      y2: 9,
      tier: 1,
      rampAt: { x: 11, y: 9, kind: rampKinds[actId % 4] },
    },
    {
      x1: 21,
      y1: 14,
      x2: 33 - (actId % 3),
      y2: 20,
      tier: 1,
      rampAt: { x: 23, y: 14, kind: rampKinds[(actId + 1) % 4] },
    },
    {
      x1: 14,
      y1: 4,
      x2: 23,
      y2: 8,
      tier: 2,
      rampAt: { x: 18, y: 8, kind: rampKinds[(actId + 2) % 4] },
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
        startX: 11 + (actId % 6) * 2,
        startY: 1,
        ctrl1X: 9 + ((actId * 3) % 9),
        ctrl1Y: 7,
        ctrl2X: 19 + ((actId * 5) % 9),
        ctrl2Y: 16,
        endX: 13 + ((actId * 2) % 9),
        endY: 22,
        widthTiles: 2 + (actId % 2),
        currentVx: (actId % 2 === 0 ? 1 : -1) * 16,
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
      x: 296 + ((actId % 5) - 2) * 16,
      y: 96 + ((actId % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 128 + (actId % 4) * 16, y: 118, radius: 26 },
      { x: 356 - (actId % 4) * 16, y: 218, radius: 28 },
    ],
    destructibleProps: [
      { kind: 'wood_crate', x: 124, y: 148 },
      { kind: 'oil_barrel', x: 236, y: 112 },
      { kind: 'oil_barrel', x: 354, y: 164 },
      { kind: 'crumbling_pillar', x: 416, y: 196 },
      { kind: 'push_block', x: 268, y: 192 },
    ],
  };
});
