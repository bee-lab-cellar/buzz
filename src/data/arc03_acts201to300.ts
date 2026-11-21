/**
 * Layer 2 — Arc III: The Dragon Cataclysm After the Peace (Acts 201–300)
 * Sanctuary: Act 299 (Floating Star-Forge -> Act 300)
 * Arc Final Boss: Act 300 — Ignis-Bahamut (1,500,000 HP, 4-Part Breakable Dragon + Harpoon Ballistas)
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC03_CONFIG: OmniverseArcConfig = {
  arcId: 3,
  actMin: 201,
  actMax: 300,
  arcBadge: 'ARC III • DRAGON CATACLYSM',
  arcTitle: 'The Dragon Cataclysm After the Peace',
  factionId: 'draconic_cataclysm',
  factionLabel: 'Draconic Ember Brood',
  captainPrefix: 'Wyrmlord',
  enemyPool: ['ember_wyvern', 'drake_lancer', 'cinder_cultist', 'obsidian_scale_guard', 'pyro_drake'],
  sanctuaryAct: 299,
  finalBossAct: 300,
  finalBossName: 'Ignis-Bahamut',
  finalBossMaxHp: 1500000,
  palette: {
    groundPrimary: '#522520',
    groundSecondary: '#6b3228',
    roadHex: '#78716c',
    liquidHex: '#ea580c',
    cliffHex: '#292524',
    accentHex: '#fb923c',
  },
};

export const ARC03_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 299,
  destinationAct: 300,
  speaker: 'Wolf-King Fenrir',
  greetingLine: 'Welcome to the Floating Star-Forge at Act 299! Cats and Reformed Dogs stand united.',
  blessingLine: 'Load the 4 Corner Harpoon Ballistas [E] and shatter Ignis-Bahamut’s wings in Act 300!',
  portalLabel: 'Star-Forge Spire -> Act 300: Ignis-Bahamut Sky-Siege',
  themeColor: '#fb923c',
};

const ARC03_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Scorched Treaty Plains', biomeTheme: 'ash_fields', landmarkPrefix: 'Burned Scroll Obelisk', trapPool: ['dragonfire_brazier', 'wildfire_barrel'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Ember-Fang Foothills', biomeTheme: 'volcanic_ridge', landmarkPrefix: 'Wyvern Roost Spire', trapPool: ['updraft_geyser', 'magma_geyser'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Cinder-Hoard Cavern', biomeTheme: 'treasure_vault', landmarkPrefix: 'Melted Gold Mound', trapPool: ['gold_mimic', 'rotating_firebar'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Harpoon Bastion Cliffs', biomeTheme: 'sky_cliff', landmarkPrefix: 'Ballista Watchtower', trapPool: ['cliff_wind_gust', 'updraft_geyser'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Lightning Wyrm Peaks', biomeTheme: 'storm_crag', landmarkPrefix: 'Storm-Drake Pylon', trapPool: ['lightning_spire', 'twister_vortex'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Ash-Bridge Ravine', biomeTheme: 'obsidian_gorge', landmarkPrefix: 'Charred Archway', trapPool: ['fire_spinner_bar', 'magma_geyser'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Dragonfire Foundry', biomeTheme: 'drake_forge', landmarkPrefix: 'Scale Tempering Anvil', trapPool: ['rotating_firebar', 'dragonfire_brazier'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Cloud-Piercer Ramparts', biomeTheme: 'sky_bastion', landmarkPrefix: 'Sky-Sail Mooring', trapPool: ['updraft_geyser', 'twister_vortex'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Bahamut Aerie Ascent', biomeTheme: 'aerie_peak', landmarkPrefix: 'Ancient Wyrm Totem', trapPool: ['lightning_spire', 'dragonfire_brazier'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Floating Star-Forge & Aerie Summit', biomeTheme: 'star_forge', landmarkPrefix: 'Three-Leader Star Anvil', trapPool: ['updraft_geyser', 'fire_spinner_bar'], liquid: 'lava', bridgeStyle: 'astral_span' },
];

export const ARC03_ACTS_201_TO_300: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC03_CONFIG,
  ARC03_SUBREGIONS,
  ARC03_SANCTUARY_SCRIPT,
);
