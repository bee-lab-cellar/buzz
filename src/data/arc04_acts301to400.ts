/**
 * Layer 2 — Arc IV: The Kraken & Sunken Abyssal Archipelago (Acts 301–400)
 * Sanctuary: Act 399 (Tidal Sanctum -> Act 400)
 * Arc Final Boss: Act 400 — Charybdis, The 8-Tentacle World-Kraken
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC04_CONFIG: OmniverseArcConfig = {
  arcId: 4,
  actMin: 301,
  actMax: 400,
  arcBadge: 'ARC IV • ABYSSAL KRAKEN',
  arcTitle: 'The Kraken & Sunken Abyssal Archipelago',
  factionId: 'abyssal_kraken_armada',
  factionLabel: 'Abyssal Kraken Armada',
  captainPrefix: 'Abyssal Dread',
  enemyPool: ['shark_knight', 'crab_corsair', 'siren_mage', 'kraken_spawn', 'abyssal_harpooneer'],
  sanctuaryAct: 399,
  finalBossAct: 400,
  finalBossName: 'Charybdis, The 8-Tentacle World-Kraken',
  finalBossMaxHp: 2200000,
  palette: {
    groundPrimary: '#0f4c5c',
    groundSecondary: '#155e75',
    roadHex: '#67e8f9',
    liquidHex: '#0284c7',
    cliffHex: '#164e63',
    accentHex: '#22d3ee',
  },
};

export const ARC04_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 399,
  destinationAct: 400,
  speaker: 'Admiral Whiskers',
  greetingLine: 'Tidal Sanctum drydock secured at Act 399! Every blade is honed for weak-spot severing.',
  blessingLine: 'Aim for the glowing cyan/gold Weak-Spot rings on Charybdis’s 8 Tentacles in Act 400 for 2.5x Sever Crits & Healing Fish!',
  portalLabel: 'Abyssal Trench Gate -> Act 400: Charybdis the World-Kraken',
  themeColor: '#22d3ee',
};

const ARC04_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Coral Reef Shoals', biomeTheme: 'coral_archipelago', landmarkPrefix: 'Pearl Beacon', trapPool: ['siren_whirlpool', 'oxygen_vent'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Barnacle Shipwreck Cove', biomeTheme: 'sunken_fleet', landmarkPrefix: 'Sunken Galleon Wheel', trapPool: ['depth_charge_mine', 'ink_cloud_vent'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Shark-Knight Atoll', biomeTheme: 'coral_fort', landmarkPrefix: 'Trident Trophy', trapPool: ['depth_charge_mine', 'siren_whirlpool'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Bioluminescent Kelp Trench', biomeTheme: 'deep_kelp', landmarkPrefix: 'Glow-Anemone Shrine', trapPool: ['ink_cloud_vent', 'oxygen_vent'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Crab-Corsair Drydock', biomeTheme: 'pirate_reef', landmarkPrefix: 'Claw-Anchor Crane', trapPool: ['depth_charge_mine', 'quicksand_whirlpool'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Siren-Song Grotto', biomeTheme: 'crystal_grotto', landmarkPrefix: 'Conch Resonator', trapPool: ['siren_whirlpool', 'laser_prism'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Maelstrom Causeway', biomeTheme: 'storm_sea', landmarkPrefix: 'Tidal Lighthouse', trapPool: ['siren_whirlpool', 'depth_charge_mine'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Midnight Ink Abyss', biomeTheme: 'abyss_floor', landmarkPrefix: 'Abyssal Oxygen Dome', trapPool: ['ink_cloud_vent', 'oxygen_vent'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Leviathan Spine Reef', biomeTheme: 'bone_trench', landmarkPrefix: 'Giant Rib Arch', trapPool: ['depth_charge_mine', 'ink_cloud_vent'], liquid: 'water', bridgeStyle: 'coral_bridge' },
  { name: 'Tidal Sanctum & Charybdis Maw', biomeTheme: 'kraken_throne', landmarkPrefix: 'Sanctum Harpoon Bell', trapPool: ['siren_whirlpool', 'oxygen_vent'], liquid: 'water', bridgeStyle: 'coral_bridge' },
];

export const ARC04_ACTS_301_TO_400: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC04_CONFIG,
  ARC04_SUBREGIONS,
  ARC04_SANCTUARY_SCRIPT,
);
