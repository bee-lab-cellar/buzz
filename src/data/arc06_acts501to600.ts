/**
 * Layer 2 — Arc VI: The Volcanic Underworld & Obsidian Forges (Acts 501–600)
 * Sanctuary: Act 599 (Obsidian Forge Sanctuary -> Act 600)
 * Arc Final Boss: Act 600 — Vulcan-Rex, Lord of the Core
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC06_CONFIG: OmniverseArcConfig = {
  arcId: 6,
  actMin: 501,
  actMax: 600,
  arcBadge: 'ARC VI • VOLCANIC UNDERWORLD',
  arcTitle: 'The Volcanic Underworld & Obsidian Forges',
  factionId: 'volcanic_obsidian_horde',
  factionLabel: 'Volcanic Obsidian Horde',
  captainPrefix: 'Magma-Lord',
  enemyPool: ['magma_wyrm', 'hellfire_knight', 'obsidian_golem', 'slag_bomber', 'cinder_reaver'],
  sanctuaryAct: 599,
  finalBossAct: 600,
  finalBossName: 'Vulcan-Rex, Lord of the Core',
  finalBossMaxHp: 4200000,
  palette: {
    groundPrimary: '#3f1d1d',
    groundSecondary: '#542424',
    roadHex: '#57534e',
    liquidHex: '#dc2626',
    cliffHex: '#1c1917',
    accentHex: '#f97316',
  },
};

export const ARC06_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 599,
  destinationAct: 600,
  speaker: 'Forgemaster Emberclaw',
  greetingLine: 'Obsidian Forge Sanctuary cooled at Act 599! Your blades glow with Starlight quench.',
  blessingLine: 'Ride the Lava-Minecart deflections into Act 600 and dethrone Vulcan-Rex, Lord of the Core!',
  portalLabel: 'Caldera Core Gate -> Act 600: Vulcan-Rex',
  themeColor: '#f97316',
};

const ARC06_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Basalt Descent Gate', biomeTheme: 'volcanic_cavern', landmarkPrefix: 'Basalt Brazier', trapPool: ['magma_geyser', 'explosive_minecart'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Lava-Minecart Tunnels', biomeTheme: 'magma_rails', landmarkPrefix: 'Obsidian Track Switch', trapPool: ['explosive_minecart', 'rotating_firebar'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Hellfire Knight Barracks', biomeTheme: 'hellfire_fort', landmarkPrefix: 'Brimstone Banner', trapPool: ['fire_spinner_bar', 'boiling_oil_cauldron'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Sulfur Vent Caldera', biomeTheme: 'sulfur_vents', landmarkPrefix: 'Venting Cairn', trapPool: ['magma_geyser', 'poison_puffball'], liquid: 'acid', bridgeStyle: 'stone_arched' },
  { name: 'Obsidian Crucible Bridge', biomeTheme: 'obsidian_forge', landmarkPrefix: 'Molten Crucible', trapPool: ['rotating_firebar', 'factory_crusher'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Slag-Cart Foundry', biomeTheme: 'magma_rails', landmarkPrefix: 'Smelting Hopper', trapPool: ['explosive_minecart', 'conveyor_belt_hazard'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Wyrm-Trench Fissures', biomeTheme: 'deep_caldera', landmarkPrefix: 'Magma Totem', trapPool: ['magma_geyser', 'fire_spinner_bar'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Brimstone Vaults', biomeTheme: 'volcanic_vault', landmarkPrefix: 'Fire-Opal Shrine', trapPool: ['gold_mimic', 'dragonfire_brazier'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Core-Mantle Causeway', biomeTheme: 'inner_mantle', landmarkPrefix: 'Core Beacon', trapPool: ['magma_geyser', 'rotating_firebar'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Obsidian Forge Sanctuary & Core Throne', biomeTheme: 'vulcan_throne', landmarkPrefix: 'Anvil of the Core', trapPool: ['fire_spinner_bar', 'magma_geyser'], liquid: 'lava', bridgeStyle: 'stone_arched' },
];

export const ARC06_ACTS_501_TO_600: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC06_CONFIG,
  ARC06_SUBREGIONS,
  ARC06_SANCTUARY_SCRIPT,
);
