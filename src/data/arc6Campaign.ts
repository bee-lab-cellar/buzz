/**
 * Pillar 3 — Arc VI Campaign Blueprints (Acts 241–300: The Void-Eclipse Multiverse)
 * Sanctuary Act 299 routes dynamically to Act 300 (`299 -> 300`).
 * Also exports unified lookup across all 300 Acts (`ALL_300_CAMPAIGN_BLUEPRINTS`).
 */

import { ALL_300_ATLAS_ACTS } from '../atlas';
import type { ActBlueprint, SanctuaryPortalConfig } from '../types/world';
import { ARC1_CAMPAIGN_ACTS, compileAtlasEntryToActBlueprint } from './arc1Campaign';
import { ARC2_CAMPAIGN_ACTS } from './arc2Campaign';
import { ARC3_CAMPAIGN_ACTS } from './arc3Campaign';
import { ARC4_CAMPAIGN_ACTS } from './arc4Campaign';
import { ARC5_CAMPAIGN_ACTS } from './arc5Campaign';

export const ARC6_SANCTUARY_PORTAL: SanctuaryPortalConfig = {
  sanctuaryAct: 299,
  destinationAct: 300,
  portalLabel: 'Singularity Gate -> Act 300: Aether-Null Finale',
  themeColor: '#c084fc',
  unlocksNextArc: false,
};

export const ARC6_CAMPAIGN_ACTS: ReadonlyArray<ActBlueprint> = ALL_300_ATLAS_ACTS.filter(
  (a) => a.actId >= 241 && a.actId <= 300,
).map((entry) => compileAtlasEntryToActBlueprint(entry, ARC6_SANCTUARY_PORTAL));

export const ALL_300_CAMPAIGN_BLUEPRINTS: ReadonlyArray<ActBlueprint> = [
  ...ARC1_CAMPAIGN_ACTS,
  ...ARC2_CAMPAIGN_ACTS,
  ...ARC3_CAMPAIGN_ACTS,
  ...ARC4_CAMPAIGN_ACTS,
  ...ARC5_CAMPAIGN_ACTS,
  ...ARC6_CAMPAIGN_ACTS,
];

const BLUEPRINT_BY_ACT = new Map<number, ActBlueprint>(
  ALL_300_CAMPAIGN_BLUEPRINTS.map((bp) => [bp.actId, bp]),
);

export function getCampaignActBlueprint(actId: number): ActBlueprint {
  const clamped = Math.max(1, Math.min(300, Math.floor(actId)));
  return BLUEPRINT_BY_ACT.get(clamped) ?? ARC1_CAMPAIGN_ACTS[0];
}

export function resolveSanctuaryDestinationAct(sanctuaryActId: number): number | null {
  const bp = getCampaignActBlueprint(sanctuaryActId);
  return bp.sanctuaryRouting ? bp.sanctuaryRouting.destinationAct : null;
}
