/**
 * Layer 2 — Arc V: The Clockwork Mecha-Empire (Acts 401–500)
 * Sanctuary: Act 499 (Horologium Sanctuary -> Act 500)
 * Arc Final Boss: Act 500 — Chronos-Omega, The Time-Rewinding Titan
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC05_CONFIG: OmniverseArcConfig = {
  arcId: 5,
  actMin: 401,
  actMax: 500,
  arcBadge: 'ARC V • CLOCKWORK MECHA',
  arcTitle: 'The Clockwork Mecha-Empire',
  factionId: 'clockwork_mecha_empire',
  factionLabel: 'Clockwork Mecha-Empire',
  captainPrefix: 'Gear-Captain',
  enemyPool: ['steam_golem', 'clockwork_owl', 'cyber_rat', 'brass_automaton', 'tesla_sentinel'],
  sanctuaryAct: 499,
  finalBossAct: 500,
  finalBossName: 'Chronos-Omega, Time-Rewinding Titan',
  finalBossMaxHp: 3100000,
  palette: {
    groundPrimary: '#4b3b24',
    groundSecondary: '#5c492d',
    roadHex: '#d97706',
    liquidHex: '#eab308',
    cliffHex: '#27272a',
    accentHex: '#facc15',
  },
};

export const ARC05_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 499,
  destinationAct: 500,
  speaker: 'Chief Engineer Brasspaw',
  greetingLine: 'Horologium Sanctuary gears locked at Act 499! Your Steam-Mecha [V] bay is fueled.',
  blessingLine: 'Break Chronos-Omega’s 4 Pendulum Gears in Act 500 before it rewinds the battlefield!',
  portalLabel: 'Chronos Pendulum Gate -> Act 500: Chronos-Omega',
  themeColor: '#facc15',
};

const ARC05_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Brass-Gear Viaduct', biomeTheme: 'steampunk_city', landmarkPrefix: 'Cogwheel Fountain', trapPool: ['gear_blade_track', 'steam_valve_jet'], liquid: 'acid', bridgeStyle: 'stone_arched' },
  { name: 'Steam-Mecha Assembly Line', biomeTheme: 'mecha_factory', landmarkPrefix: 'Mecha Hangar Bay', trapPool: ['steam_mecha_bay', 'factory_crusher'], liquid: 'acid', bridgeStyle: 'stone_arched' },
  { name: 'Phantom Rail Yard', biomeTheme: 'clockwork_rail', landmarkPrefix: 'Brass Locomotive', trapPool: ['phantom_rail_train', 'explosive_minecart'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Tesla Coil Rooftops', biomeTheme: 'voltaic_spire', landmarkPrefix: 'Arc Dynamo Tower', trapPool: ['tesla_arc_coil', 'electric_floor_tile'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Cyber-Rat Foundry', biomeTheme: 'foundry_core', landmarkPrefix: 'Copper Smelter', trapPool: ['conveyor_belt_hazard', 'steam_valve_jet'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Clockwork Owl Belfry', biomeTheme: 'clocktower', landmarkPrefix: 'Great Chime Bell', trapPool: ['gear_blade_track', 'chrono_slow_dome'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Pressure-Valve Catacombs', biomeTheme: 'boiler_depths', landmarkPrefix: 'Boiler Gauge Pillar', trapPool: ['steam_valve_jet', 'factory_crusher'], liquid: 'acid', bridgeStyle: 'stone_arched' },
  { name: 'Chrono-Pendulum Hall', biomeTheme: 'time_vault', landmarkPrefix: 'Hourglass Conduit', trapPool: ['chrono_slow_dome', 'tesla_arc_coil'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Sky-Citadel Gear Decks', biomeTheme: 'sky_foundry', landmarkPrefix: 'Turbine Propeller', trapPool: ['steam_mecha_bay', 'gear_blade_track'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Horologium Sanctuary & Omega Core', biomeTheme: 'chronos_core', landmarkPrefix: 'Master Escapement', trapPool: ['chrono_slow_dome', 'tesla_arc_coil'], liquid: 'lava', bridgeStyle: 'astral_span' },
];

export const ARC05_ACTS_401_TO_500: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC05_CONFIG,
  ARC05_SUBREGIONS,
  ARC05_SANCTUARY_SCRIPT,
);
