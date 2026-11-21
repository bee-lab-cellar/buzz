import {
  ActBlueprint,
  ElevationZoneBlueprint,
  RampKind,
  RiverCurveBlueprint,
  TerrainThemeId,
  TopologyArchetypeId,
  WeatherEffectId,
} from './arc1Acts1to41';

const ARC5_TITLES: Array<{
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
  { title: 'Brass-Gear Sky-Bridge Dock', sub: 'Brass-Gear Foundry', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'broken_sky_bridge', landmarkId: 'clockwork_observatory_239', landmarkName: 'Great Brass Escapement Wheel', traps: ['factory_conveyor_crusher', 'sawmill_buzzsaw'], hasRiver: false },
  { title: 'Steam-Piston Conveyor Yard', sub: 'Brass-Gear Foundry', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'minecart_switchyard', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'High-Pressure Boiler Manifold', traps: ['factory_conveyor_crusher', 'pilotable_steam_mecha'], hasRiver: true },
  { title: 'Cogwheel Pendulum Catwalks', sub: 'Brass-Gear Foundry', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 's_curve_high_ridge', landmarkId: 'spinning_watermill', landmarkName: 'Synchronized Flywheel Turbine', traps: ['sawmill_buzzsaw', 'rotating_fire_bar'], hasRiver: false },
  { title: 'Automaton Assembly Foundry', sub: 'Brass-Gear Foundry', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'four_chamber_catacomb', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Mecha-Chassis Welding Gantry', traps: ['factory_conveyor_crusher', 'pilotable_steam_mecha'], hasRiver: true },
  { title: 'Tesla-Rail Switchyard', sub: 'Tesla-Coil Sky-Railways', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'minecart_switchyard', landmarkId: 'clockwork_observatory_239', landmarkName: 'Arc-Lightning Signal Box', traps: ['explosive_minecart', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'High-Voltage Viaduct Span', sub: 'Tesla-Coil Sky-Railways', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'broken_sky_bridge', landmarkId: 'ruined_watchtower', landmarkName: 'Faraday Cage Pylon', traps: ['chain_lightning_pylon', 'laser_prism'], hasRiver: false },
  { title: 'Magnetic Levitation Platform', sub: 'Tesla-Coil Sky-Railways', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'terraced_switchbacks', landmarkId: 'clockwork_observatory_239', landmarkName: 'Mag-Lev Gyroscope Core', traps: ['chain_lightning_pylon', 'updraft_geyser'], hasRiver: false },
  { title: 'Neon-Conduit Capacitor Vault', sub: 'Tesla-Coil Sky-Railways', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'four_chamber_catacomb', landmarkId: 'luminous_mushroom_shrine', landmarkName: 'Plasma-Tube Transformer', traps: ['laser_prism', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Aether-Zeppelin Hangar Deck', sub: 'Aether-Turbine Hangars', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'moving_galleon_deck', landmarkId: 'spinning_watermill', landmarkName: 'Twin-Rotor Sky-Dock', traps: ['pilotable_steam_mecha', 'cliff_wind_gust'], hasRiver: false },
  { title: 'Wind-Tunnel Propeller Shafts', sub: 'Aether-Turbine Hangars', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'spiral_watchtower', landmarkId: 'spinning_watermill', landmarkName: 'Supersonic Intake Turbine', traps: ['cliff_wind_gust', 'sawmill_buzzsaw'], hasRiver: false },
  { title: 'Clockwork Owl Aviary Spire', sub: 'Aether-Turbine Hangars', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'sunken_amphitheater', landmarkId: 'clockwork_observatory_239', landmarkName: 'Gilded Astrolabe Perch', traps: ['laser_prism', 'updraft_geyser'], hasRiver: false },
  { title: 'Mecha-Goliath Repair Bay', sub: 'Aether-Turbine Hangars', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'colosseum_citadel', landmarkId: 'dwarven_magma_smeltery', landmarkName: 'Titan-Mecha Hoist Crane', traps: ['pilotable_steam_mecha', 'factory_conveyor_crusher'], hasRiver: false },
  { title: 'Pendulum-Blade Horology Hall', sub: 'Chrono-Pendulum Sanctum', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 's_curve_high_ridge', landmarkId: 'clockwork_observatory_239', landmarkName: 'Grand Grandfather-Clock Face', traps: ['sawmill_buzzsaw', 'laser_prism'], hasRiver: false },
  { title: 'Rewinding Hourglass Terrace', sub: 'Chrono-Pendulum Sanctum', theme: 'clockwork_citadel', weather: 'starlight_motes', topo: 'terraced_switchbacks', landmarkId: 'golden_bamboo_pavilion', landmarkName: 'Temporal Sand-Glass Pavilion', traps: ['bamboo_warp_mirror', 'chain_lightning_pylon'], hasRiver: false },
  { title: 'Celestial Orrery Rotunda', sub: 'Chrono-Pendulum Sanctum', theme: 'clockwork_citadel', weather: 'starlight_motes', topo: 'sunken_amphitheater', landmarkId: 'clockwork_observatory_239', landmarkName: 'Planetary Brass Orrery', traps: ['laser_prism', 'rotating_fire_bar'], hasRiver: false },
  { title: 'Time-Gear Synchronization Bridge', sub: 'Chrono-Pendulum Sanctum', theme: 'clockwork_citadel', weather: 'steam_sparks', topo: 'broken_sky_bridge', landmarkId: 'spinning_watermill', landmarkName: 'Interlocking Chrono-Cog Span', traps: ['factory_conveyor_crusher', 'chain_lightning_pylon'], hasRiver: false },
];

export const ARC5_ACTS_181_TO_240: ActBlueprint[] = Array.from({ length: 60 }, (_, idx) => {
  const actId = 181 + idx;
  const item = ARC5_TITLES[idx % ARC5_TITLES.length];
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

  const riverConfig: RiverCurveBlueprint | null =
    item.hasRiver && actId !== 240
      ? {
          style: 'bezier_meander',
          liquid: 'lava',
          startX: 14 + (actId % 4) * 2,
          startY: 1,
          ctrl1X: 10 + (actId % 6),
          ctrl1Y: 8,
          ctrl2X: 20 + (actId % 6),
          ctrl2Y: 15,
          endX: 15 + (actId % 5),
          endY: 22,
          widthTiles: 2,
          currentVx: 14,
          currentVy: 20,
          bridgeCoords: [
            { x: 15, y: 6 },
            { x: 16, y: 11 },
            { x: 15, y: 17 },
          ],
          fordCoords: [{ x: 15, y: 9 }],
        }
      : null;

  const isAct239 = actId === 239;
  const isAct240 = actId === 240;

  return {
    actId,
    title: isAct239
      ? 'Clockwork Observatory of the Great Duck'
      : isAct240
      ? 'Apex Chrono-Core of Chronos-Omega'
      : `${item.title} (Sector ${actId - 180})`,
    subRegionName: item.sub,
    terrainTheme: item.theme,
    weatherEffect: item.weather,
    topologyArchetype: isAct240 ? 'colosseum_citadel' : isAct239 ? 'sunken_amphitheater' : item.topo,
    elevationZones,
    riverConfig,
    trapTypes: item.traps,
    landmark: {
      id: 'clockwork_observatory_239',
      name: isAct239
        ? 'Grand Clockwork Observatory & Telescope'
        : isAct240
        ? 'Four-Gear Temporal Throne of Chronos-Omega'
        : item.landmarkName,
      x: 292 + ((actId % 5) - 2) * 16,
      y: 94 + ((actId % 3) - 1) * 16,
      loreHint: `Act ${actId} Landmark: ${item.landmarkName} (${item.sub})`,
    },
    tallGrassPatches: [
      { x: 136, y: 118, radius: 24 },
      { x: 352, y: 214, radius: 24 },
    ],
    destructibleProps: [
      { kind: 'wood_crate', x: 128, y: 148 },
      { kind: 'oil_barrel', x: 238, y: 112 },
      { kind: 'oil_barrel', x: 352, y: 164 },
      { kind: 'push_block', x: 274, y: 192 },
    ],
  };
});
