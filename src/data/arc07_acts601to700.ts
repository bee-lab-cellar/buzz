/**
 * Layer 2 — Arc VII: The Frozen Astral Glaciers & Frost-Giants (Acts 601–700)
 * Sanctuary: Act 699 (Aurora Hearth Sanctuary -> Act 700)
 * Arc Final Boss: Act 700 — Borealis, The Absolute-Zero Leviathan
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC07_CONFIG: OmniverseArcConfig = {
  arcId: 7,
  actMin: 601,
  actMax: 700,
  arcBadge: 'ARC VII • ASTRAL GLACIERS',
  arcTitle: 'The Frozen Astral Glaciers & Frost-Giants',
  factionId: 'astral_glacier_giants',
  factionLabel: 'Astral Frost-Giant Clan',
  captainPrefix: 'Rime-Jarl',
  enemyPool: ['frost_giant', 'rime_valkyrie', 'ice_stalker', 'glacier_yeti', 'cryo_sentinel'],
  sanctuaryAct: 699,
  finalBossAct: 700,
  finalBossName: 'Borealis, The Absolute-Zero Leviathan',
  finalBossMaxHp: 5600000,
  palette: {
    groundPrimary: '#1e3a5f',
    groundSecondary: '#2c5282',
    roadHex: '#bae6fd',
    liquidHex: '#0284c7',
    cliffHex: '#0f172a',
    accentHex: '#7dd3fc',
  },
};

export const ARC07_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 699,
  destinationAct: 700,
  speaker: 'Hearth-Keeper Snowtail',
  greetingLine: 'Aurora Hearth Sanctuary blazes warm at Act 699! Thaw your paws beside the eternal fire.',
  blessingLine: 'Cross the Thin-Ice Spans into Act 700 to shatter Borealis, The Absolute-Zero Leviathan!',
  portalLabel: 'Aurora Rift Gate -> Act 700: Borealis',
  themeColor: '#7dd3fc',
};

const ARC07_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Snowdrift Foothills', biomeTheme: 'frozen_tundra', landmarkPrefix: 'Hearth Lantern', trapPool: ['blizzard_brazier', 'cracking_ice'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Thin-Ice Mirror Lake', biomeTheme: 'glacier_lake', landmarkPrefix: 'Frozen Pier', trapPool: ['cracking_ice', 'blizzard_brazier'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Frost-Giant Causeway', biomeTheme: 'giant_hall', landmarkPrefix: 'Rime Monolith', trapPool: ['rolling_boulder', 'cracking_ice'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Crystal Crevasse Bridges', biomeTheme: 'ice_canyon', landmarkPrefix: 'Icicle Arch', trapPool: ['cracking_ice', 'cliff_wind_gust'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Blizzard Campfire Trail', biomeTheme: 'whiteout_pass', landmarkPrefix: 'Warmth Brazier', trapPool: ['blizzard_brazier', 'twister_vortex'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Aurora Prism Caverns', biomeTheme: 'crystal_cave', landmarkPrefix: 'Aurora Lens', trapPool: ['laser_prism', 'cracking_ice'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Permafrost Watchtower', biomeTheme: 'frozen_keep', landmarkPrefix: 'Glacial Bell', trapPool: ['blizzard_brazier', 'dart_totem'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Cryo-Knight Glacier', biomeTheme: 'glacier_peak', landmarkPrefix: 'Zero-Kelvin Obelisk', trapPool: ['cracking_ice', 'chrono_slow_dome'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Star-Ice Summit', biomeTheme: 'astral_ice', landmarkPrefix: 'Star-Frost Altar', trapPool: ['laser_prism', 'blizzard_brazier'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Aurora Hearth & Borealis Shelf', biomeTheme: 'borealis_throne', landmarkPrefix: 'Eternal Aurora Hearth', trapPool: ['cracking_ice', 'blizzard_brazier'], liquid: 'water', bridgeStyle: 'astral_span' },
];

export const ARC07_ACTS_601_TO_700: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC07_CONFIG,
  ARC07_SUBREGIONS,
  ARC07_SANCTUARY_SCRIPT,
);
