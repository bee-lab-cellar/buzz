/**
 * Pillar 3 — Arc III Campaign Blueprints (Acts 83–122: The Dragon Cataclysm)
 * Sanctuary Act 121 routes dynamically to Act 122 (`121 -> 122`).
 */

import { ALL_300_ATLAS_ACTS } from '../atlas';
import type { ActBlueprint, SanctuaryPortalConfig } from '../types/world';
import { compileAtlasEntryToActBlueprint } from './arc1Campaign';

export const ARC3_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 121,
  destinationAct: 122,
  portalLabel: 'Star-Forge Gate -> Act 122: Ignis-Bahamut',
  themeColor: '#f97316',
  unlocksNextArc: true,
};

export const ARC3_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 83 && a.actId <= 122,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC3_SANCTUARY_PORTAL));
