/**
 * File 33 / 100 — Boss Registry for Arcs 1–5 (50 Regional & Arc Final Bosses, Acts 10–500).
 * Zero emoji bosses — every entry binds to a dedicated pixel-art matrix ID. Zero `any`.
 */

import { BOSSES_100_REGISTRY, type BossRegistryEntry } from './bosses100Registry';

export interface BossManifestRecord extends BossRegistryEntry {
  readonly spriteMatrixId: string;
  readonly spriteSizePx: 48 | 64 | 88;
  readonly weaknessHint: string;
}

function weaknessHintForArc1to5(arcId: number): string {
  switch (arcId) {
    case 1:
      return 'Drink Great Duck Elixir [Q] to shatter Eclipse Ward & backstab during Counter-Stance.';
    case 2:
      return 'Dodge behind Iron Legion tower shields for 2.5x Backstab Crits and blow War-Horn [R].';
    case 3:
      return 'Break Dragon Wings with Ballistas, sever Tail, then strike Exposed Chest Core for 2.5x Crit.';
    case 4:
      return 'Sever all 8 Kraken Tentacles (2.5x weak-spot glow) & collect Golden Fish heals.';
    default:
      return 'Destroy Corner Chrono-Gears to halt Time Rewind & pilot Steam-Mecha [G].';
  }
}

export const BOSSES_ARC_1_TO_5: ReadonlyArray<BossManifestRecord> = BOSSES_100_REGISTRY
  .filter((b) => b.arcId >= 1 && b.arcId <= 5)
  .map((b) => ({
    ...b,
    spriteMatrixId: `pixel_boss_arc${b.arcId}_${b.isArcFinalBoss ? 'finale' : `slot${((b.ordinal - 1) % 10) + 1}`}`,
    spriteSizePx: b.isArcFinalBoss ? 88 : b.ordinal % 5 === 0 ? 64 : 48,
    weaknessHint: weaknessHintForArc1to5(b.arcId),
  }));

export function getBossArc1to5ByAct(actId: number): BossManifestRecord | null {
  return BOSSES_ARC_1_TO_5.find((b) => b.actId === actId) ?? null;
}
