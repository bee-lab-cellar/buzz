/**
 * File 40 / 100 — 55-Trap Biome Hazard Catalog.
 * Enforces Renewal Pillar 3 clean arena cap (MAX_TRAPS_PER_ACT = 4, zero clutter). Zero `any`.
 */

import type { ArcId, TrapCategory } from '../types/world';

export const MAX_TRAPS_PER_ACT = 4;

export interface BiomeTrapCatalogEntry {
  readonly category: TrapCategory;
  readonly displayName: string;
  readonly primaryArc: ArcId;
  readonly telegraphSec: number;
  readonly baseDamage: number;
  readonly radiusPx: number;
  readonly element: 'physical' | 'fire' | 'ice' | 'poison' | 'electric' | 'void' | 'water';
}

const TRAP_DEFINITIONS: ReadonlyArray<readonly [TrapCategory, string, ArcId, BiomeTrapCatalogEntry['element'], number]> = [
  ['swinging_log', 'Swinging Timber Log', 1, 'physical', 16],
  ['rolling_boulder', 'Quarry Rolling Boulder', 1, 'physical', 22],
  ['bounce_mushroom', 'Spring Bounce Mushroom', 1, 'physical', 0],
  ['cracking_ice', 'Cracking Glacier Ice', 7, 'ice', 18],
  ['explosive_minecart', 'Explosive Siege Minecart', 2, 'fire', 28],
  ['laser_prism', 'Astral Laser Prism', 9, 'void', 26],
  ['quicksand_whirlpool', 'Quicksand Vortex', 1, 'physical', 12],
  ['dart_totem', 'Bamboo Dart Totem', 1, 'poison', 15],
  ['rune_drawbridge', 'Rune Drawbridge Gate', 1, 'physical', 0],
  ['trench_landmine', 'Iron Trench Landmine', 2, 'fire', 25],
  ['blizzard_brazier', 'Blizzard Warmth Brazier', 7, 'fire', 0],
  ['factory_crusher', 'Steam Factory Crusher', 5, 'physical', 32],
  ['battering_ram_payload', 'Siege Battering Ram', 2, 'physical', 28],
  ['wildfire_barrel', 'Wildfire Powder Barrel', 2, 'fire', 30],
  ['rising_acid_tide', 'Rising Acid Surge', 6, 'poison', 24],
  ['rotating_firebar', 'Volcanic Rotating Firebar', 6, 'fire', 26],
  ['updraft_geyser', 'Sky Updraft Geyser', 8, 'water', 0],
  ['oxygen_vent', 'Abyssal Oxygen Bubble Vent', 4, 'water', 0],
  ['steam_mecha_bay', 'Steam-Mecha Launch Bay', 5, 'electric', 0],
  ['black_hole_well', 'Event-Horizon Gravity Well', 10, 'void', 35],
  ['sawmill_buzzsaw', 'Sawmill Buzzsaw Track', 1, 'physical', 20],
  ['bear_trap', 'Iron Jaw Bear-Trap', 1, 'physical', 18],
  ['chain_lightning_pylon', 'Chain-Lightning Pylon', 5, 'electric', 24],
  ['leaf_pitfall', 'Canopy Leaf Pitfall', 1, 'physical', 14],
  ['retracting_thorn_wall', 'Retracting Briar Wall', 1, 'poison', 16],
  ['poison_puffball', 'Marsh Poison Puffball', 1, 'poison', 18],
  ['darkness_lantern', 'Twilight Guiding Lantern', 1, 'fire', 0],
  ['cliff_wind_gust', 'Highland Cliff Wind Gust', 8, 'physical', 12],
  ['magma_geyser', 'Caldera Magma Geyser', 6, 'fire', 30],
  ['boiling_oil_cauldron', 'Boiling Oil Rampart Vat', 2, 'fire', 24],
  ['bamboo_warp_mirror', 'Jade Warp Mirror', 9, 'void', 0],
  ['barbed_wire_trench', 'Barbed Trench Wire', 2, 'physical', 16],
  ['artillery_barrage', 'Dog Legion Artillery Marker', 2, 'fire', 34],
  ['moving_river_barge', 'Moving River Ferry Barge', 2, 'water', 0],
  ['rockslide_lever', 'Canyon Rockslide Lever', 3, 'physical', 26],
  ['windmill_propeller', 'Sky Windmill Blade', 8, 'physical', 22],
  ['conveyor_belt_hazard', 'Clockwork Conveyor Belt', 5, 'physical', 10],
  ['chandelier_drop', 'Throne Chandelier Drop', 9, 'physical', 28],
  ['electric_floor_tile', 'Voltaic Floor Plate', 5, 'electric', 24],
  ['spreading_wildfire_barrel', 'Spreading Ember Cask', 3, 'fire', 28],
  ['gold_mimic', 'Gilded Vault Mimic', 3, 'physical', 26],
  ['lightning_spire', 'Storm-Peak Lightning Spire', 8, 'electric', 30],
  ['twister_vortex', 'Emerald Hurricane Twister', 8, 'physical', 24],
  ['dragonfire_brazier', 'Dragonfire War-Brazier', 3, 'fire', 26],
  ['chrono_slow_dome', 'Chrono Time-Slow Dome', 5, 'void', 14],
  ['fire_spinner_bar', 'Supernova Flame Spinner', 6, 'fire', 30],
  ['depth_charge_mine', 'Abyssal Depth-Charge Mine', 4, 'water', 28],
  ['siren_whirlpool', 'Siren Maelstrom Whirlpool', 4, 'water', 22],
  ['ink_cloud_vent', 'Kraken Ink-Cloud Vent', 4, 'poison', 16],
  ['steam_valve_jet', 'High-Pressure Steam Jet', 5, 'fire', 24],
  ['gear_blade_track', 'Brass Gear-Blade Track', 5, 'physical', 28],
  ['phantom_rail_train', 'Phantom Express Railcar', 5, 'physical', 36],
  ['tesla_arc_coil', 'Tesla Arc Discharge Coil', 5, 'electric', 28],
  ['void_rift_tear', 'Void-Eclipse Rift Tear', 10, 'void', 36],
  ['gravity_flip_pad', 'Singularity Gravity Flip Pad', 10, 'void', 18],
];

export const BIOME_TRAP_CATALOG_55: ReadonlyArray<BiomeTrapCatalogEntry> = TRAP_DEFINITIONS.map(
  ([category, displayName, primaryArc, element, baseDamage]) => ({
    category,
    displayName,
    primaryArc,
    telegraphSec: baseDamage === 0 ? 0.25 : 0.85,
    baseDamage,
    radiusPx: 16,
    element,
  }),
);

export function getTrapSpec(category: TrapCategory): BiomeTrapCatalogEntry {
  return BIOME_TRAP_CATALOG_55.find((t) => t.category === category) ?? BIOME_TRAP_CATALOG_55[0];
}
