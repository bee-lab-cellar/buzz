/**
 * Layer 2 — Arc X: The Void-Eclipse Singularity & Dawn of the Omniverse (Acts 901–1,000)
 * Sanctuary: Act 999 (Omniverse Sanctum with ALL 4 Leaders -> Act 1000)
 * Arc Final Boss: Act 1000 — AETHER-NULL, THE OMNIVERSE SINGULARITY (5 Phases!)
 *
 * Also exports the unified 1,000-Act Omniverse Atlas lookup (`ALL_1000_OMNIVERSE_ACTS`),
 * `OMNIVERSE_ARC_CONFIGS`, `getOmniverseArcConfig(actId)`, `getOmniverseActBlueprint(actId)`,
 * and `resolveOmniverseSanctuaryDestination(actId)`.
 */

import type {
  ArcId,
  OmniverseActBlueprint,
  OmniverseArcConfig,
  OmniverseSanctuaryScript,
} from '../types/world';
import { ARC01_ACTS_001_TO_100, ARC01_CONFIG, buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';
import { ARC02_ACTS_101_TO_200, ARC02_CONFIG } from './arc02_acts101to200';
import { ARC03_ACTS_201_TO_300, ARC03_CONFIG } from './arc03_acts201to300';
import { ARC04_ACTS_301_TO_400, ARC04_CONFIG } from './arc04_acts301to400';
import { ARC05_ACTS_401_TO_500, ARC05_CONFIG } from './arc05_acts401to500';
import { ARC06_ACTS_501_TO_600, ARC06_CONFIG } from './arc06_acts501to600';
import { ARC07_ACTS_601_TO_700, ARC07_CONFIG } from './arc07_acts601to700';
import { ARC08_ACTS_701_TO_800, ARC08_CONFIG } from './arc08_acts701to800';
import { ARC09_ACTS_801_TO_900, ARC09_CONFIG } from './arc09_acts801to900';

export const ARC10_CONFIG: OmniverseArcConfig = {
  arcId: 10,
  actMin: 901,
  actMax: 1000,
  arcBadge: 'ARC X • OMNIVERSE SINGULARITY',
  arcTitle: 'The Void-Eclipse Singularity & Dawn of the Omniverse',
  factionId: 'void_eclipse_singularity',
  factionLabel: 'Void-Eclipse Singularity',
  captainPrefix: 'Singularity Archon',
  enemyPool: ['quasar_seraph', 'event_horizon_knight', 'gravity_titan', 'entropy_wraith', 'null_herald'],
  sanctuaryAct: 999,
  finalBossAct: 1000,
  finalBossName: 'AETHER-NULL, THE OMNIVERSE SINGULARITY',
  finalBossMaxHp: 12500000,
  palette: {
    groundPrimary: '#130b2e',
    groundSecondary: '#1f1247',
    roadHex: '#a855f7',
    liquidHex: '#581c87',
    cliffHex: '#020617',
    accentHex: '#c084fc',
  },
};

export const ARC10_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 999,
  destinationAct: 1000,
  speaker: 'Nyx, King Leo, Fenrir & The Great Duck',
  greetingLine: 'Omniverse Sanctum unites ALL 4 Leaders at Act 999! Every blade, elixir, and constellation shines as one.',
  blessingLine: 'Enter Act 1000 to face AETHER-NULL across 5 Phases and usher in the Golden Age of the Omniverse!',
  portalLabel: 'Singularity Threshold -> Act 1000: AETHER-NULL (5 Phases)',
  themeColor: '#c084fc',
};

const ARC10_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Event-Horizon Bridgehead', biomeTheme: 'astral_void', landmarkPrefix: 'Gravity Lensing Arch', trapPool: ['black_hole_well', 'gravity_flip_pad'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Relativistic Quasar Causeway', biomeTheme: 'quasar_deck', landmarkPrefix: 'Quasar Beacon', trapPool: ['laser_prism', 'void_rift_tear'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Star-Collapse Nebulae', biomeTheme: 'nebula_span', landmarkPrefix: 'Supernova Cairn', trapPool: ['black_hole_well', 'chrono_slow_dome'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Pulsar Forge Spires', biomeTheme: 'pulsar_forge', landmarkPrefix: 'Neutron Anvil', trapPool: ['tesla_arc_coil', 'gravity_flip_pad'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Dark-Matter Reefs', biomeTheme: 'dark_matter', landmarkPrefix: 'Abyssal Star-Stone', trapPool: ['void_rift_tear', 'black_hole_well'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Entropy Clockwork Orbit', biomeTheme: 'cosmic_clock', landmarkPrefix: 'Cosmic Escapement', trapPool: ['chrono_slow_dome', 'laser_prism'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Supernova Rim', biomeTheme: 'supernova_rim', landmarkPrefix: 'Solar Flare Obelisk', trapPool: ['fire_spinner_bar', 'black_hole_well'], liquid: 'lava', bridgeStyle: 'astral_span' },
  { name: 'Singularity Accretion Disk', biomeTheme: 'accretion_disk', landmarkPrefix: 'Relativistic Gate', trapPool: ['gravity_flip_pad', 'void_rift_tear'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Dawn-of-Time Threshold', biomeTheme: 'dawn_threshold', landmarkPrefix: 'Crown of Stars', trapPool: ['black_hole_well', 'laser_prism'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Omniverse Sanctum & Aether-Null Throne', biomeTheme: 'singularity_throne', landmarkPrefix: 'Four-Leader Star Altar', trapPool: ['black_hole_well', 'gravity_flip_pad'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
];

export const ARC10_ACTS_901_TO_1000: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC10_CONFIG,
  ARC10_SUBREGIONS,
  ARC10_SANCTUARY_SCRIPT,
);

export const OMNIVERSE_ARC_CONFIGS: Readonly<Record<ArcId, OmniverseArcConfig>> = {
  1: ARC01_CONFIG,
  2: ARC02_CONFIG,
  3: ARC03_CONFIG,
  4: ARC04_CONFIG,
  5: ARC05_CONFIG,
  6: ARC06_CONFIG,
  7: ARC07_CONFIG,
  8: ARC08_CONFIG,
  9: ARC09_CONFIG,
  10: ARC10_CONFIG,
};

export const ALL_1000_OMNIVERSE_ACTS: ReadonlyArray<OmniverseActBlueprint> = [
  ...ARC01_ACTS_001_TO_100,
  ...ARC02_ACTS_101_TO_200,
  ...ARC03_ACTS_201_TO_300,
  ...ARC04_ACTS_301_TO_400,
  ...ARC05_ACTS_401_TO_500,
  ...ARC06_ACTS_501_TO_600,
  ...ARC07_ACTS_601_TO_700,
  ...ARC08_ACTS_701_TO_800,
  ...ARC09_ACTS_801_TO_900,
  ...ARC10_ACTS_901_TO_1000,
];

const OMNIVERSE_ACT_MAP = new Map<number, OmniverseActBlueprint>(
  ALL_1000_OMNIVERSE_ACTS.map((bp) => [bp.actId, bp]),
);

export function getOmniverseArcIdForAct(actId: number): ArcId {
  const clamped = Math.max(1, Math.min(1000, Math.floor(actId)));
  return (Math.floor((clamped - 1) / 100) + 1) as ArcId;
}

export function getOmniverseArcConfig(actId: number): OmniverseArcConfig {
  return OMNIVERSE_ARC_CONFIGS[getOmniverseArcIdForAct(actId)];
}

export function getOmniverseActBlueprint(actId: number): OmniverseActBlueprint {
  const clamped = Math.max(1, Math.min(1000, Math.floor(actId)));
  return OMNIVERSE_ACT_MAP.get(clamped) ?? ARC01_ACTS_001_TO_100[0];
}

export function resolveOmniverseSanctuaryDestination(sanctuaryActId: number): number | null {
  const bp = getOmniverseActBlueprint(sanctuaryActId);
  return bp.sanctuaryPortalDestination;
}
