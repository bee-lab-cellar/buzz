/**
 * Layer 2 — Arc VIII: The Emerald Sky-Islands & Tempest Griffins (Acts 701–800)
 * Sanctuary: Act 799 (Emerald Wind Sanctuary -> Act 800)
 * Arc Final Boss: Act 800 — Zephyrus, Sovereign of the Hurricane
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC08_CONFIG: OmniverseArcConfig = {
  arcId: 8,
  actMin: 701,
  actMax: 800,
  arcBadge: 'ARC VIII • EMERALD SKY-ISLANDS',
  arcTitle: 'The Emerald Sky-Islands & Tempest Griffins',
  factionId: 'tempest_sky_griffins',
  factionLabel: 'Tempest Griffin Armada',
  captainPrefix: 'Gale-Marshal',
  enemyPool: ['tempest_griffin', 'cloud_lancer', 'emerald_harpy', 'storm_roc', 'wind_elemental'],
  sanctuaryAct: 799,
  finalBossAct: 800,
  finalBossName: 'Zephyrus, Sovereign of the Hurricane',
  finalBossMaxHp: 7200000,
  palette: {
    groundPrimary: '#047857',
    groundSecondary: '#10b981',
    roadHex: '#e2e8f0',
    liquidHex: '#38bdf8',
    cliffHex: '#064e3b',
    accentHex: '#34d399',
  },
};

export const ARC08_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 799,
  destinationAct: 800,
  speaker: 'Sky-Captain Featherpaw',
  greetingLine: 'Emerald Wind Sanctuary anchored at Act 799! Updraft geysers lift our banners high above the clouds.',
  blessingLine: 'Launch off the High-Ground Wind Geysers in Act 800 for 2.0x Plunge-Slashes against Zephyrus!',
  portalLabel: 'Hurricane Eye Gate -> Act 800: Zephyrus',
  themeColor: '#34d399',
};

const ARC08_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Cloud-Step Atolls', biomeTheme: 'sky_meadow', landmarkPrefix: 'Wind-Vane Shrine', trapPool: ['updraft_geyser', 'bounce_mushroom'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Emerald Windmill Isles', biomeTheme: 'sky_meadow', landmarkPrefix: 'Sky Mill Rotor', trapPool: ['windmill_propeller', 'cliff_wind_gust'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Griffin Nesting Crags', biomeTheme: 'sky_cliff', landmarkPrefix: 'Golden Feather Roost', trapPool: ['updraft_geyser', 'twister_vortex'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Rainbow Waterfall Spans', biomeTheme: 'cloud_falls', landmarkPrefix: 'Prism Cascade', trapPool: ['updraft_geyser', 'laser_prism'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Thunder-Beak Citadel', biomeTheme: 'storm_island', landmarkPrefix: 'Storm Conductor', trapPool: ['lightning_spire', 'chain_lightning_pylon'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Floating Jade Gardens', biomeTheme: 'jade_canopy', landmarkPrefix: 'Jade Wind Chime', trapPool: ['bounce_mushroom', 'bamboo_warp_mirror'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Cyclone Archipelago', biomeTheme: 'hurricane_rim', landmarkPrefix: 'Vortex Anchor', trapPool: ['twister_vortex', 'cliff_wind_gust'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Stratosphere Bastion', biomeTheme: 'upper_sky', landmarkPrefix: 'Cloud-Sail Mast', trapPool: ['updraft_geyser', 'lightning_spire'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Hurricane Rim Bridges', biomeTheme: 'storm_eye', landmarkPrefix: 'Tempest Spire', trapPool: ['twister_vortex', 'updraft_geyser'], liquid: 'water', bridgeStyle: 'astral_span' },
  { name: 'Emerald Wind Sanctuary & Eye of Storm', biomeTheme: 'zephyrus_throne', landmarkPrefix: 'Eye-of-Storm Obelisk', trapPool: ['updraft_geyser', 'twister_vortex'], liquid: 'water', bridgeStyle: 'astral_span' },
];

export const ARC08_ACTS_701_TO_800: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC08_CONFIG,
  ARC08_SUBREGIONS,
  ARC08_SANCTUARY_SCRIPT,
);
