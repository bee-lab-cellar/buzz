/**
 * Pillar 3 — Arc IV Campaign Blueprints (Acts 123–180: The Kraken Archipelago)
 * Sanctuary Act 179 routes dynamically to Act 180 (`179 -> 180`).
 */

import { ALL_300_ATLAS_ACTS } from '../atlas';
import type { ActBlueprint, SanctuaryPortalConfig } from '../types/world';
import { compileAtlasEntryToActBlueprint } from './arc1Campaign';

export const ARC4_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 179,
  destinationAct: 180,
  portalLabel: 'Hadal Trench Gate -> Act 180: Charybdis Kraken',
  themeColor: '#06b6d4',
  unlocksNextArc: true,
};

export const ARC4_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 123 && a.actId <= 180,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC4_SANCTUARY_PORTAL));
