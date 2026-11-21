import {
  ActBlueprint,
  ElevationZoneBlueprint,
  RampKind,
  RiverCurveBlueprint,
  TerrainThemeId,
  TopologyArchetypeId,
  WeatherEffectId,
} from './arc1Acts1to41';

const ARC4_TITLES: Array<{
  title: string;
  sub: string;
  theme: TerrainThemeId;
  weather: WeatherEffectId;
  topo: TopologyArchetypeId;
  landmarkId: string;
  landmarkName: string;
  traps: [string, string];
  hasRiver: boolean;
}> = [
  { title: 'Starlight Lagoon Pier', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'twin_forked_delta', landmarkId: 'drowned_bell_tower', landmarkName: 'Barnacle Lighthouse Bell', traps: ['underwater_oxygen_vent', 'quicksand_whirlpool'], hasRiver: true },
  { title: 'Sunken Coral Causeway', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'venice_canal_fortress', landmarkId: 'gargoyle_fountain', landmarkName: 'Spouting Seahorse Basin', traps: ['underwater_oxygen_vent', 'moving_river_barge'], hasRiver: true },
  { title: 'Anemone Tide-Pool Terraces', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'terraced_switchbacks', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Giant Pearl Clam Altar', traps: ['underwater_oxygen_vent', 'bounce_mushroom'], hasRiver: true },
  { title: 'Reef-Shark Patrol Trench', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 's_curve_high_ridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Sunken Anchor Monument', traps: ['underwater_oxygen_vent', 'quicksand_whirlpool'], hasRiver: true },
  { title: 'Starfish Archway Atoll', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'broken_sky_bridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Coral Archway Font', traps: ['underwater_oxygen_vent', 'dart_totem'], hasRiver: true },
  { title: 'Kelp-Forest Ambush Channel', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'giant_hollow_oak', landmarkName: 'Petrified Driftwood Leviathan', traps: ['underwater_oxygen_vent', 'quicksand_whirlpool'], hasRiver: true },
  { title: 'Tidal-Geyser Stepping Reefs', sub: 'Luminous Coral Shallows', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'sunken_amphitheater', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Bioluminescent Brain-Coral', traps: ['underwater_oxygen_vent', 'updraft_geyser'], hasRiver: true },
  { title: 'Ghost-Galleon Boarding Plank', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'rain_squall', topo: 'moving_galleon_deck', landmarkId: 'spinning_watermill', landmarkName: 'Shattered Galleon Capstan', traps: ['artillery_barrage', 'swinging_log'], hasRiver: true },
  { title: 'Barnacle Broadside Gun-Deck', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'rain_squall', topo: 'moving_galleon_deck', landmarkId: 'drowned_bell_tower', landmarkName: 'Cursed Ship’s Bell', traps: ['artillery_barrage', 'boiling_oil_cauldron'], hasRiver: true },
  { title: 'Rigging Rope-Bridge Masts', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'rain_squall', topo: 'broken_sky_bridge', landmarkId: 'ruined_watchtower', landmarkName: 'Crow’s-Nest Spyglass Mast', traps: ['cliff_wind_gust', 'swinging_log'], hasRiver: true },
  { title: 'Flooded Bilge Powder-Hold', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'goblin_bonfire', landmarkName: 'Smoldering Powder-Keg Stove', traps: ['spreading_wildfire_barrel', 'gold_mimic'], hasRiver: true },
  { title: 'Captain’s Treasure Cabin', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'rain_squall', topo: 'sunken_amphitheater', landmarkId: 'gargoyle_fountain', landmarkName: 'Gilded Kraken Figurehead', traps: ['gold_mimic', 'dart_totem'], hasRiver: false },
  { title: 'Shattered Hull Flotsam Maze', sub: 'Cursed Armada Wreckage', theme: 'coral_atoll', weather: 'rain_squall', topo: 'venice_canal_fortress', landmarkId: 'spinning_watermill', landmarkName: 'Wrecked Paddle-Steamer Wheel', traps: ['moving_river_barge', 'sawmill_buzzsaw'], hasRiver: true },
  { title: 'Dread-Corsair’s Quarterdeck', sub: 'Cursed Armada Wreckage', theme: 'river_fortress', weather: 'rain_squall', topo: 'colosseum_citadel', landmarkId: 'drowned_bell_tower', landmarkName: 'Helm of the Phantom Fleet', traps: ['artillery_barrage', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Siren’s Echo Marble Promenade', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'venice_canal_fortress', landmarkId: 'gargoyle_fountain', landmarkName: 'Harp-Statue of the Sea-Nymph', traps: ['underwater_oxygen_vent', 'laser_prism'], hasRiver: true },
  { title: 'Drowned Pantheon Colonnade', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'drowned_bell_tower', landmarkName: 'Submerged Ionic Rotunda', traps: ['underwater_oxygen_vent', 'rune_drawbridge'], hasRiver: true },
  { title: 'Whirlpool Amphitheater Steps', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'sunken_amphitheater', landmarkId: 'gargoyle_fountain', landmarkName: 'Maelstrom Trident Basin', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Pearl-Mosaic Aqueduct', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'twin_forked_delta', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Mother-of-Pearl Sundial', traps: ['underwater_oxygen_vent', 'laser_prism'], hasRiver: true },
  { title: 'Tidal-Organ Resonance Vault', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'spiral_watchtower', landmarkId: 'drowned_bell_tower', landmarkName: 'Pipe-Organ of the Tides', traps: ['underwater_oxygen_vent', 'dart_totem'], hasRiver: true },
  { title: 'Siren-Queen’s Coral Conservatory', sub: 'Sunken Marble Acropolis', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'colosseum_citadel', landmarkId: 'gargoyle_fountain', landmarkName: 'Throne of the Abyssal Song', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: false },
  { title: 'Jellyfish Lantern Drop-Off', sub: 'Bioluminescent Jellyfish Trench', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 'terraced_switchbacks', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Giant Medusa Bell-Shrine', traps: ['bounce_mushroom', 'chain_lightning_pylon'], hasRiver: true },
  { title: 'Electric Moray Conduit Caves', sub: 'Bioluminescent Jellyfish Trench', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 's_curve_high_ridge', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Bio-Volt Eel Pillar', traps: ['chain_lightning_pylon', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Abyssal Angler Lure-Grotto', sub: 'Bioluminescent Jellyfish Trench', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Fossilized Leviathan Jaw', traps: ['darkness_lantern', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Glowing Plankton Current-Streams', sub: 'Bioluminescent Jellyfish Trench', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'twin_forked_delta', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Sapphire Tide-Beacon', traps: ['underwater_oxygen_vent', 'bounce_mushroom'], hasRiver: true },
  { title: 'Tentacle-Crushed Submarine Hull', sub: 'Bioluminescent Jellyfish Trench', theme: 'clockwork_citadel', weather: 'abyssal_bubbles', topo: 'minecart_switchyard', landmarkId: 'clockwork_observatory_239', landmarkName: 'Ruptured Bathysphere Dome', traps: ['chain_lightning_pylon', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Midnight Pelagic Suspension Ledge', sub: 'Bioluminescent Jellyfish Trench', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 'broken_sky_bridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Abyssal Diving-Bell Station', traps: ['underwater_oxygen_vent', 'darkness_lantern'], hasRiver: true },
  { title: 'Bio-Luminescent Sovereign’s Maw', sub: 'Bioluminescent Jellyfish Trench', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 'colosseum_citadel', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Heart of the Trench-Glow', traps: ['chain_lightning_pylon', 'underwater_oxygen_vent'], hasRiver: false },
  { title: 'Black-Smoker Hydrothermal Vents', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 's_curve_high_ridge', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Superheated Magma Chimney', traps: ['magma_geyser', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Boiling Brine-Pool Terraces', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 'terraced_switchbacks', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Pillow-Lava Forge Altar', traps: ['magma_geyser', 'rising_acid_tide'], hasRiver: true },
  { title: 'Obsidian Trench Rail-Dredger', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Deep-Sea Ore Excavator', traps: ['explosive_minecart', 'magma_geyser'], hasRiver: true },
  { title: 'Tectonic Rift Magma-Bridges', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 'broken_sky_bridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Basalt Kraken Monolith', traps: ['magma_geyser', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Sulfur-Crab Boiling Cauldron', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 'sunken_amphitheater', landmarkId: 'goblin_bonfire', landmarkName: 'Hydrothermal Steam Cauldron', traps: ['boiling_oil_cauldron', 'magma_geyser'], hasRiver: true },
  { title: 'Magma-Vent Leviathan’s Caldera', sub: 'Volcanic Seafloor Vents', theme: 'volcanic_caldera', weather: 'abyssal_bubbles', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Throne of the Seafloor Rift', traps: ['magma_geyser', 'underwater_oxygen_vent'], hasRiver: false },
  { title: 'Hadal Pressure-Gate Causeway', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'venice_canal_fortress', landmarkId: 'drowned_bell_tower', landmarkName: 'Cyclopean Abyssal Sluice', traps: ['rune_drawbridge', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Sunken Kraken-Worship Ziggurat', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'spiral_watchtower', landmarkId: 'gargoyle_fountain', landmarkName: 'Eight-Armed Obsidian Idol', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Ink-Cloud Labyrinth Chambers', sub: 'Hadal Kraken Abyss', theme: 'fungal_cavern', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'drowned_bell_tower', landmarkName: 'Altar of the Black Tide', traps: ['darkness_lantern', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Crushing Maelstrom Rim-Walk', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 's_curve_high_ridge', landmarkId: 'spinning_watermill', landmarkName: 'Abyssal Vortex Turbine', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Shipwreck Graveyard of Titans', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'twin_forked_delta', landmarkId: 'frozen_mammoth_skeleton', landmarkName: 'Ribs of the Ancient Whale-Ship', traps: ['underwater_oxygen_vent', 'gold_mimic'], hasRiver: true },
  { title: 'Tentacle-Bound Pillar Walkways', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'broken_sky_bridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Chained Trident Obelisk', traps: ['underwater_oxygen_vent', 'quicksand_whirlpool'], hasRiver: true },
  { title: 'Abyssal Trench Watch-Bastion', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'terraced_switchbacks', landmarkId: 'ruined_watchtower', landmarkName: 'Hadal Beacon Spire', traps: ['underwater_oxygen_vent', 'laser_prism'], hasRiver: true },
  { title: 'Drowned Treasury of Atlantis', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'four_chamber_catacomb', landmarkId: 'gargoyle_fountain', landmarkName: 'Vault of the Sunken Crown', traps: ['gold_mimic', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Maelstrom Conduit Bridge', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'venice_canal_fortress', landmarkId: 'spinning_watermill', landmarkName: 'Tidal Pressure Sluice', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Sunken Colosseum of the Deep', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'sunken_amphitheater', landmarkId: 'drowned_bell_tower', landmarkName: 'Arena of the Sea-Kings', traps: ['underwater_oxygen_vent', 'chain_lightning_pylon'], hasRiver: true },
  { title: 'Hadal Spire Spiral Steps', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'spiral_watchtower', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Lantern of the Trench', traps: ['underwater_oxygen_vent', 'bounce_mushroom'], hasRiver: true },
  { title: 'Abyssal Ward-Pylon Approach', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 's_curve_high_ridge', landmarkId: 'gargoyle_fountain', landmarkName: 'Seal of Charybdis', traps: ['chain_lightning_pylon', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Eight-Tentacle Trench Threshold', sub: 'Hadal Kraken Abyss', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'broken_sky_bridge', landmarkId: 'drowned_bell_tower', landmarkName: 'Gate of the World-Kraken', traps: ['quicksand_whirlpool', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Sunken Atlantis Air-Dome Sanctuary', sub: 'Abyssal Sanctuary', theme: 'astral_bamboo', weather: 'starlight_motes', topo: 'sunken_amphitheater', landmarkId: 'sunken_atlantis_altar_179', landmarkName: 'Atlantis Air-Dome & Great Duck Shrine', traps: ['bounce_mushroom', 'underwater_oxygen_vent'], hasRiver: true },
  { title: 'Maelstrom Throne of Charybdis, The World-Kraken', sub: 'Heart of the Hadal Trench', theme: 'coral_atoll', weather: 'abyssal_bubbles', topo: 'colosseum_citadel', landmarkId: 'sunken_atlantis_altar_179', landmarkName: 'Abyssal Core of Charybdis', traps: ['underwater_oxygen_vent', 'quicksand_whirlpool'], hasRiver: false },
];

export const ARC4_ACTS_123_TO_180: ActBlueprint[] = Array.from({ length: 58 }, (_, idx) => {
  const actId = 123 + idx;
  const item = ARC4_TITLES[idx % ARC4_TITLES.length];
  const rampKinds: RampKind[] = ['stone_stairs', 'wood_ramp', 'vine_ladder', 'updraft_pad'];

  const elevationZones: ElevationZoneBlueprint[] = [
    {
      x1: 5 + (actId % 3),
      y1: 3,
      x2: 14,
      y2: 8,
      tier: 1,
      rampAt: { x: 10, y: 8, kind: rampKinds[actId % 4] },
    },
    {
      x1: 22,
      y1: 15,
      x2: 33 - (actId % 3),
      y2: 20,
      tier: 1,
      rampAt: { x: 24, y: 15, kind: rampKinds[(actId + 1) % 4] },
    },
    {
      x1: 14,
      y1: 4,
      x2: 23,
      y2: 7,
      tier: 2,
      rampAt: { x: 18, y: 7, kind: 'stone_stairs' },
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
        liquid: 'water',
        startX: 11 + (actId % 6) * 2,
        startY: 1,
        ctrl1X: 8 + ((actId * 3) % 10),
        ctrl1Y: 7,
        ctrl2X: 19 + ((actId * 5) % 9),
        ctrl2Y: 16,
        endX: 13 + ((actId * 2) % 9),
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
    title: idx < ARC4_TITLES.length ? item.title : `${item.title} (${actId})`,
    subRegionName: item.sub,
    terrainTheme: item.theme,
    weatherEffect: item.weather,
    topologyArchetype: actId === 180 ? 'colosseum_citadel' : item.topo,
    elevationZones,
    riverConfig: actId === 180 ? null : riverConfig,
    trapTypes: item.traps,
    landmark: {
      id: actId === 179 || actId === 180 ? 'sunken_atlantis_altar_179' : item.landmarkId,
      name: item.landmarkName,
      x: 292 + ((actId % 5) - 2) * 16,
      y: 94 + ((actId % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 132, y: 116, radius: 26 },
      { x: 356, y: 214, radius: 28 },
    ],
    destructibleProps: [
      { kind: 'wood_crate', x: 126, y: 148 },
      { kind: 'zelda_bush', x: 158, y: 210 },
      { kind: 'oil_barrel', x: 348, y: 162 },
      { kind: 'crumbling_pillar', x: 414, y: 194 },
    ],
  };
});
