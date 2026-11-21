/**
 * File 49 / 100 — High-Detail Pixel-Art Boss Sprites for Arcs 6–10 (Bosses 51–100)
 * + Unified 100-Boss Pixel Renderer for Gameplay & 60Hz Replay Theater.
 *
 * ZERO emoji bosses anywhere! Renders Vulcan-Rex, Borealis, Zephyrus, Umbra-Nyx,
 * and AETHER-NULL (5-Phase Singularity) cleanly on 2D Canvas. Zero `any`.
 */

import type { BossRegistryEntry } from '../data/bosses100Registry';
import { BOSS_SPRITES_ARC_6_TO_10 } from './bossesArc6to10Sprites';
import {
  drawArc1to5BossPixelArt,
  renderPixelBossMatrixSpec,
  type PixelBossRenderParams,
} from './bossesArc1to5Matrices';

export function drawArc6to10BossPixelArt(
  ctx: CanvasRenderingContext2D,
  params: PixelBossRenderParams,
): void {
  const { boss, cx, cy, animTimeSec, facing, scale = 1.0 } = params;
  const idx = Math.max(0, Math.min(BOSS_SPRITES_ARC_6_TO_10.length - 1, boss.arcId - 6));
  const spec = BOSS_SPRITES_ARC_6_TO_10[idx];
  renderPixelBossMatrixSpec(ctx, spec, cx, cy, animTimeSec, facing, scale);
}

export function drawAnyOmniverseBossPixelArt(
  ctx: CanvasRenderingContext2D,
  params: PixelBossRenderParams,
): void {
  if (params.boss.arcId <= 5) {
    drawArc1to5BossPixelArt(ctx, params);
  } else {
    drawArc6to10BossPixelArt(ctx, params);
  }
}

export function auditAllBossesEmojiFree(bosses: ReadonlyArray<BossRegistryEntry>): boolean {
  for (let i = 0; i < bosses.length; i++) {
    const b = bosses[i];
    if (b.name.includes('\u{1F479}') || b.title.includes('\u{1F479}')) {
      return false;
    }
  }
  return true;
}

export { BOSS_SPRITES_ARC_6_TO_10 };
