/**
 * Pillar 3 — Arc V Campaign Blueprints (Acts 181–240: The Clockwork Mecha-Empire)
 * Sanctuary Act 239 routes dynamically to Act 240 (`239 -> 240`).
 */

import { ALL_300_ATLAS_ACTS } from '../atlas';
import type { ActBlueprint, SanctuaryPortalConfig } from '../types/world';
import { compileAtlasEntryToActBlueprint } from './arc1Campaign';

export const ARC5_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 239,
  destinationAct: 240,
  portalLabel: 'Horologium Gate -> Act 240: Chronos-Omega',
  themeColor: '#eab308',
  unlocksNextArc: true,
};

export const ARC5_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 181 && a.actId <= 240,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC5_SANCTUARY_PORTAL));
