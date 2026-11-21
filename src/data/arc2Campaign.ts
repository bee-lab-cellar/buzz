/**
 * Pillar 3 — Arc II Campaign Blueprints (Acts 42–82: War of the Two Kingdoms)
 * Sanctuary Act 81 routes dynamically to Act 82 (`81 -> 82`).
 */

import { ALL_300_ATLAS_ACTS } from '../atlas';
import type { ActBlueprint, SanctuaryPortalConfig } from '../types/world';
import { compileAtlasEntryToActBlueprint } from './arc1Campaign';

export const ARC2_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 81,
  destinationAct: 82,
  portalLabel: 'War Council Gate -> Act 82: Emperor Ragnarok',
  themeColor: '#ef4444',
  unlocksNextArc: true,
};

export const ARC2_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 42 && a.actId <= 82,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC2_SANCTUARY_PORTAL));
