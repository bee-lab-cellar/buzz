/**
 * Layer 2 — Arc II: The Great War of Cats and Dogs (Acts 101–200)
 * Sanctuary: Act 199 (War Council Sanctuary -> Act 200)
 * Arc Final Boss: Act 200 — Emperor Fenrir & Ragnarok (600,000 HP, 3 Phases -> Peace Treaty)
 */

import type { OmniverseActBlueprint, OmniverseArcConfig, OmniverseSanctuaryScript } from '../types/world';
import { buildArc100Acts, type ArcSubRegionSeed } from './arc01_acts001to100';

export const ARC02_CONFIG: OmniverseArcConfig = {
  arcId: 2,
  actMin: 101,
  actMax: 200,
  arcBadge: 'ARC II • GREAT KINGDOM WAR',
  arcTitle: 'The Great War of Cats and Dogs',
  factionId: 'iron_hound_legion',
  factionLabel: 'Iron Hound Legion',
  captainPrefix: 'Iron Legion',
  enemyPool: ['hound_spearman', 'mastiff_shieldbearer', 'husky_crossbow', 'war_doberman', 'siege_sapper'],
  sanctuaryAct: 199,
  finalBossAct: 200,
  finalBossName: 'Emperor Fenrir & Ragnarok',
  finalBossMaxHp: 600000,
  palette: {
    groundPrimary: '#6d5840',
    groundSecondary: '#7e674d',
    roadHex: '#94a3b8',
    liquidHex: '#1d4ed8',
    cliffHex: '#334155',
    accentHex: '#f97316',
  },
};

export const ARC02_SANCTUARY_SCRIPT: OmniverseSanctuaryScript = {
  sanctuaryAct: 199,
  destinationAct: 200,
  speaker: 'King Leo',
  greetingLine: 'War Council convened at Act 199! Cat Knights hold the banners across every trench.',
  blessingLine: 'Step into Act 200 to defeat Emperor Fenrir & Ragnarok and forge the Cat-Dog Peace Treaty!',
  portalLabel: 'War Council Gate -> Act 200: Emperor Fenrir & Ragnarok',
  themeColor: '#f97316',
};

const ARC02_SUBREGIONS: ReadonlyArray<ArcSubRegionSeed> = [
  { name: 'Borderland Bridgehead', biomeTheme: 'war_front', landmarkPrefix: 'Twin-Kingdom Milestone', trapPool: ['trench_landmine', 'barbed_wire_trench'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Red-Clay Siege Trenches', biomeTheme: 'war_front', landmarkPrefix: 'Siege Mortar Post', trapPool: ['artillery_barrage', 'trench_landmine'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Hound-Iron Logistics Rail', biomeTheme: 'iron_depot', landmarkPrefix: 'Armored Supply Switch', trapPool: ['explosive_minecart', 'conveyor_belt_hazard'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Howling River Barges', biomeTheme: 'river_siege', landmarkPrefix: 'Ferryman Bastion', trapPool: ['moving_river_barge', 'artillery_barrage'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Windmill Ridge Battery', biomeTheme: 'highland_war', landmarkPrefix: 'Signal Windmill', trapPool: ['windmill_propeller', 'rockslide_lever'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Battering-Ram Causeway', biomeTheme: 'fortress_approach', landmarkPrefix: 'Ram Staging Arch', trapPool: ['battering_ram_payload', 'wildfire_barrel'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'Boiling-Oil Ramparts', biomeTheme: 'iron_ramparts', landmarkPrefix: 'Bastion Gatehouse', trapPool: ['boiling_oil_cauldron', 'spreading_wildfire_barrel'], liquid: 'lava', bridgeStyle: 'stone_arched' },
  { name: 'Frost-Trench Outskirts', biomeTheme: 'winter_siege', landmarkPrefix: 'Campfire Watch', trapPool: ['blizzard_brazier', 'trench_landmine'], liquid: 'water', bridgeStyle: 'wood_railed' },
  { name: 'Fang-Citadel Courtyard', biomeTheme: 'imperial_keep', landmarkPrefix: 'Iron Wolf Statue', trapPool: ['chandelier_drop', 'barbed_wire_trench'], liquid: 'water', bridgeStyle: 'stone_arched' },
  { name: 'War Council & Ragnarok Keep', biomeTheme: 'imperial_throne', landmarkPrefix: 'Treaty War Table', trapPool: ['battering_ram_payload', 'artillery_barrage'], liquid: 'water', bridgeStyle: 'stone_arched' },
];

export const ARC02_ACTS_101_TO_200: ReadonlyArray<OmniverseActBlueprint> = buildArc100Acts(
  ARC02_CONFIG,
  ARC02_SUBREGIONS,
  ARC02_SANCTUARY_SCRIPT,
);
