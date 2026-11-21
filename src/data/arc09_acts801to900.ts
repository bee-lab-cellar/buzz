/**
 * Layer 2 — Arc IX: The Mirror-Realm & Shadow Doppelgängers (Acts 801–900)
 * Sanctuary: Act 899 (Prism Reflection Sanctuary -> Act 900)
 * Arc Final Boss: Act 900 — Umbra-Nyx, The Mirror Monarch
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC09_CONFIG: OmniverseArcConfig = {
  arcId: 9,
  actMin: 801,
  actMax: 900,
  arcBadge: 'ARC IX • MIRROR-REALM',
  arcTitle: 'The Mirror-Realm & Shadow Doppelgängers',
  factionId: 'mirror_shadow_doppelgangers',
  factionLabel: 'Shadow Mirror Doppelgängers',
  captainPrefix: 'Umbral Echo',
  enemyPool: ['void_clone_nyx', 'shadow_leo_phantom', 'dark_duck_mirage', 'prism_stalker', 'mirror_knight'],
  sanctuaryAct: 899,
  finalBossAct: 900,
  finalBossName: 'Umbra-Nyx, The Mirror Monarch',
  finalBossMaxHp: 9000000,
  palette: {
    groundPrimary: '#2e1065',
    groundSecondary: '#4c1d95',
    roadHex: '#c4b5fd',
    liquidHex: '#7c3aed',
    cliffHex: '#0f172a',
    accentHex: '#e879f9',
  },
};

export const ARC09_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 899,
  destinationAct: 900,
  speaker: 'Nyx (True Starlight Self)',
  greetingLine: 'Prism Reflection Sanctuary holds firm at Act 899! Even our own shadows cannot break the alliance.',
  blessingLine: 'Dodge behind Umbra-Nyx’s Counter Stance in Act 900 for 2.5x Backstab Crits to shatter the Mirror Throne!',
  portalLabel: 'Mirror Crown Gate -> Act 900: Umbra-Nyx',
  themeColor: '#e879f9',
};

const ARC09_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Glass-Threshold Courtyard', biomeTheme: 'mirror_hall', landmarkPrefix: 'Silver Looking-Glass', trapPool: ['bamboo_warp_mirror', 'laser_prism'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Inverted Whisker Meadows', biomeTheme: 'shadow_meadow', landmarkPrefix: 'Inverted Crown Stone', trapPool: ['darkness_lantern', 'bamboo_warp_mirror'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Shadow-Leo Gallery', biomeTheme: 'mirror_hall', landmarkPrefix: 'Obsidian Lion Bust', trapPool: ['laser_prism', 'void_rift_tear'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Eclipse-Fenrir Reflections', biomeTheme: 'eclipse_labyrinth', landmarkPrefix: 'Twin-Moon Pedestal', trapPool: ['bamboo_warp_mirror', 'chrono_slow_dome'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Dark-Duck Reflection Pond', biomeTheme: 'umbral_pond', landmarkPrefix: 'Black Lotus Mirror', trapPool: ['void_rift_tear', 'darkness_lantern'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Prism Refraction Maze', biomeTheme: 'prism_maze', landmarkPrefix: 'Crystal Lens Pillar', trapPool: ['laser_prism', 'bamboo_warp_mirror'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Shattered-Glass Bridge', biomeTheme: 'glass_chasm', landmarkPrefix: 'Shard Archway', trapPool: ['cracking_ice', 'void_rift_tear'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Doppelganger Arena', biomeTheme: 'mirror_arena', landmarkPrefix: 'Dual-Star Totem', trapPool: ['laser_prism', 'gravity_flip_pad'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Umbral Coronation Hall', biomeTheme: 'mirror_citadel', landmarkPrefix: 'Inverted Throne', trapPool: ['void_rift_tear', 'laser_prism'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
  { name: 'Prism Sanctuary & Mirror Throne', biomeTheme: 'umbra_throne', landmarkPrefix: 'True-Self Prism', trapPool: ['bamboo_warp_mirror', 'laser_prism'], liquid: 'void_stream', bridgeStyle: 'astral_span' },
];

export const ARC09_ACTS_801_TO_900: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC09_CONFIG,
  ARC09_SUBREGIONS,
  ARC09_SANCTUARY_SCRIPT,
);
