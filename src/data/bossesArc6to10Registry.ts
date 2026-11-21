/**
 * File 34 / 100 — Boss Registry for Arcs 6–10 (50 Bosses, Acts 510–1,000)
 * + Unified 100-Boss Manifest Lookup (`ALL_100_BOSS_MANIFEST`). Zero `any`.
 */

import { BOSSES_100_REGISTRY } from './bosses100Registry';
import { BOSSES_ARC_1_TO_5, type BossManifestRecord } from './bossesArc1to5Registry';

function weaknessHintForArc6to10(arcId: number): string {
  switch (arcId) {
    case 6:
      return 'Cool lava fissures with Water/Frost Flasks to form Obsidian bridges before striking Vulcan-Rex.';
    case 7:
      return 'Shatter Glacial Pillars with Fire Flasks to expose Borealis’s Absolute-Zero Core.';
    case 8:
      return 'Ride Updraft Geysers for 2.0x Plunge Slashes against Zephyrus in the Sky Archipelago.';
    case 9:
      return 'Identify the true Umbra-Nyx by her crooked starry wizard hat glint during Mirror Splits.';
    default:
      return 'Resist Event-Horizon pull with King Leo’s Solar Anchor & unleash the Four-Hero Finale!';
  }
}

export const BOSSES_ARC_6_TO_10: ReadonlyArray<BossManifestRecord> = BOSSES_100_REGISTRY
  .filter((b) => b.arcId >= 6 && b.arcId <= 10)
  .map((b) => ({
    ...b,
    spriteMatrixId: `pixel_boss_arc${b.arcId}_${b.isArcFinalBoss ? 'finale' : `slot${((b.ordinal - 1) % 10) + 1}`}`,
    spriteSizePx: b.isArcFinalBoss ? 88 : b.ordinal % 5 === 0 ? 64 : 48,
    weaknessHint: weaknessHintForArc6to10(b.arcId),
  }));

export const ALL_100_BOSS_MANIFEST: ReadonlyArray<BossManifestRecord> = [
  ...BOSSES_ARC_1_TO_5,
  ...BOSSES_ARC_6_TO_10,
];

const BOSS_MANIFEST_BY_ACT = new Map<number, BossManifestRecord>(
  ALL_100_BOSS_MANIFEST.map((b) => [b.actId, b]),
);

export function getBossManifestForAct(actId: number): BossManifestRecord | null {
  return BOSS_MANIFEST_BY_ACT.get(actId) ?? null;
}
