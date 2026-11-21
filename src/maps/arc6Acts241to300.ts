import {
  ActBlueprint,
  ElevationZoneBlueprint,
  RampKind,
  RiverCurveBlueprint,
  TerrainThemeId,
  TopologyArchetypeId,
  WeatherEffectId,
} from './arc1Acts1to41';

const ARC6_TITLES: Array<{
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
  { title: 'Shattered Reality Floating Shard', sub: 'Fractured Starlight Rift', theme: 'void_singularity', weather: 'void_eclipse', topo: 'broken_sky_bridge', landmarkId: 'event_horizon_altar_299', landmarkName: 'Fractured Star-Monolith', traps: ['black_hole_gravity_well', 'bamboo_warp_mirror'], hasRiver: true },
  { title: 'Nebula-Glass Mirror Walkways', sub: 'Fractured Starlight Rift', theme: 'void_singularity', weather: 'void_eclipse', topo: 's_curve_high_ridge', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Prism of Inverted Starlight', traps: ['laser_prism', 'bamboo_warp_mirror'], hasRiver: true },
  { title: 'Zero-G Asteroid Stepping Stones', sub: 'Fractured Starlight Rift', theme: 'void_singularity', weather: 'void_eclipse', topo: 'terraced_switchbacks', landmarkId: 'floating_star_forge_121', landmarkName: 'Drifting Meteorite Anvil', traps: ['updraft_geyser', 'black_hole_gravity_well'], hasRiver: false },
  { title: 'Quantum-Tether Catacombs', sub: 'Fractured Starlight Rift', theme: 'void_singularity', weather: 'void_eclipse', topo: 'four_chamber_catacomb', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Entangled Tachyon Crystal', traps: ['chain_lightning_pylon', 'black_hole_gravity_well'], hasRiver: true },
  { title: 'Dark-Matter Stream Crossing', sub: 'Entropy Singularity Sea', theme: 'void_singularity', weather: 'void_eclipse', topo: 'twin_forked_delta', landmarkId: 'drowned_bell_tower', landmarkName: 'Chime of the Collapsing Star', traps: ['black_hole_gravity_well', 'rune_drawbridge'], hasRiver: true },
  { title: 'Relativistic Pulsar Causeway', sub: 'Entropy Singularity Sea', theme: 'void_singularity', weather: 'void_eclipse', topo: 'venice_canal_fortress', landmarkId: 'gargoyle_fountain', landmarkName: 'Quasar Jet Conduit', traps: ['laser_prism', 'chain_lightning_pylon'], hasRiver: true },
  { title: 'Event-Horizon Spiral Ascent', sub: 'Entropy Singularity Sea', theme: 'void_singularity', weather: 'void_eclipse', topo: 'spiral_watchtower', landmarkId: 'event_horizon_altar_299', landmarkName: 'Accretion Disk Spire', traps: ['black_hole_gravity_well', 'updraft_geyser'], hasRiver: false },
  { title: 'Shadow-Mirror Clone Labyrinth', sub: 'Eclipse Mirror Citadel', theme: 'void_singularity', weather: 'void_eclipse', topo: 'four_chamber_catacomb', landmarkId: 'event_horizon_altar_299', landmarkName: 'Obsidian Mirror of Darth-Nyx', traps: ['bamboo_warp_mirror', 'laser_prism'], hasRiver: false },
  { title: 'Collapsed Constellation Amphitheater', sub: 'Eclipse Mirror Citadel', theme: 'void_singularity', weather: 'void_eclipse', topo: 'sunken_amphitheater', landmarkId: 'floating_star_forge_121', landmarkName: 'Dying Sun Brazier', traps: ['black_hole_gravity_well', 'rotating_fire_bar'], hasRiver: true },
  { title: 'Singularity Core Bridge', sub: 'Apex of the Event Horizon', theme: 'void_singularity', weather: 'void_eclipse', topo: 'broken_sky_bridge', landmarkId: 'event_horizon_altar_299', landmarkName: 'Blandford-Znajek Pulsar Gate', traps: ['black_hole_gravity_well', 'laser_prism'], hasRiver: true },
];

export const ARC6_ACTS_241_TO_300: ActBlueprint[] = Array.from({ length: 60 }, (_, idx) => {
  const actId = 241 + idx;
  const item = ARC6_TITLES[idx % ARC6_TITLES.length];
  const rampKinds: RampKind[] = ['stone_stairs', 'wood_ramp', 'vine_ladder', 'updraft_pad'];

  const elevationZones: ElevationZoneBlueprint[] = [
    {
      x1: 5,
      y1: 3,
      x2: 14,
      y2: 8,
      tier: 1,
      rampAt: { x: 10, y: 8, kind: rampKinds[actId % 4] },
    },
    {
      x1: 22,
      y1: 15,
      x2: 33,
      y2: 20,
      tier: 1,
      rampAt: { x: 24, y: 15, kind: rampKinds[(actId + 1) % 4] },
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

  const isAct280 = actId === 280;
  const isAct299 = actId === 299;
  const isAct300 = actId === 300;

  const riverConfig: RiverCurveBlueprint | null =
    item.hasRiver && !isAct280 && !isAct300
      ? {
          style: 's_gorge',
          liquid: 'void_stream',
          startX: 13 + (actId % 5) * 2,
          startY: 1,
          ctrl1X: 9 + (actId % 7),
          ctrl1Y: 8,
          ctrl2X: 21 + (actId % 6),
          ctrl2Y: 15,
          endX: 14 + (actId % 6),
          endY: 22,
          widthTiles: 2,
          currentVx: -18,
          currentVy: 22,
          bridgeCoords: [
            { x: 15, y: 6 },
            { x: 16, y: 11 },
            { x: 15, y: 17 },
          ],
          fordCoords: [{ x: 15, y: 9 }],
        }
      : null;

  return {
    actId,
    title: isAct280
      ? 'Mirror Throne of Darth-Nyx, The Void-Clone'
      : isAct299
      ? 'Event-Horizon Sanctuary of the Four Heroes'
      : isAct300
      ? 'The Singularity Throne of Aether-Null'
      : `${item.title} (Rift ${actId - 240})`,
    subRegionName: item.sub,
    terrainTheme: item.theme,
    weatherEffect: item.weather,
    topologyArchetype:
      isAct280 || isAct300 ? 'colosseum_citadel' : isAct299 ? 'sunken_amphitheater' : item.topo,
    elevationZones,
    riverConfig,
    trapTypes: item.traps,
    landmark: {
      id: 'event_horizon_altar_299',
      name: isAct299
        ? 'Event-Horizon Altar of the Eternal Crown'
        : isAct300
        ? 'Core of Aether-Null, The Eclipse Singularity'
        : item.landmarkName,
      x: 292 + ((actId % 5) - 2) * 16,
      y: 94 + ((actId % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 134, y: 116, radius: 24 },
      { x: 354, y: 214, radius: 26 },
    ],
    destructibleProps: [
      { kind: 'crumbling_pillar', x: 128, y: 148 },
      { kind: 'oil_barrel', x: 238, y: 114 },
      { kind: 'crumbling_pillar', x: 354, y: 166 },
      { kind: 'push_block', x: 274, y: 192 },
    ],
  };
});
