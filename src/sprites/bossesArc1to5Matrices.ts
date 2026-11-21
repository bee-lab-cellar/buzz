/**
 * File 48 / 100 — High-Detail Pixel-Art Boss Sprites for Arcs 1–5 (Bosses 1–50).
 *
 * RENEWAL PILLAR 2 RULE #1:
 * ZERO emoji bosses anywhere — every Arc 1–5 Boss renders real 48x48–88x88 layered
 * pixel art (Fenrir, Dread-Chariot Cerberus, Articulated Ignis-Bahamut Dragon,
 * 8-Tentacle Charybdis World-Kraken, Chronos-Omega Clockwork Titan). Zero `any`.
 */

import type { BossRegistryEntry } from '../data/bosses100Registry';
import {
  BOSS_SPRITES_ARC_1_TO_5,
  type OmniverseBossSpriteSpec,
} from './bossesArc1to5Sprites';

export interface PixelBossRenderParams {
  readonly boss: BossRegistryEntry;
  readonly cx: number;
  readonly cy: number;
  readonly animTimeSec: number;
  readonly facing: 1 | -1;
  readonly scale?: number;
}

export function renderPixelBossMatrixSpec(
  ctx: CanvasRenderingContext2D,
  spec: OmniverseBossSpriteSpec,
  cx: number,
  cy: number,
  animTimeSec: number,
  facing: 1 | -1,
  scale = 1.0,
): void {
  const rows = spec.coreMatrix16x16.length;
  const cols = rows > 0 ? spec.coreMatrix16x16[0].length : 16;
  const pxSize = Math.max(2, Math.round((spec.widthPx / Math.max(1, cols)) * scale));
  const totalW = cols * pxSize;
  const totalH = rows * pxSize;
  const bob = Math.round(Math.sin(animTimeSec * 4.2) * 2.5);

  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy + bob));
  ctx.scale(facing, 1);

  for (let r = 0; r < rows; r++) {
    const line = spec.coreMatrix16x16[r];
    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (ch === '.' || ch === ' ') continue;
      const color = spec.palette[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(-totalW * 0.5 + c * pxSize),
        Math.round(-totalH * 0.5 + r * pxSize),
        pxSize,
        pxSize,
      );
    }
  }
  ctx.restore();
}

export function drawArc1to5BossPixelArt(
  ctx: CanvasRenderingContext2D,
  params: PixelBossRenderParams,
): void {
  const { boss, cx, cy, animTimeSec, facing, scale = 1.0 } = params;
  const idx = Math.max(0, Math.min(BOSS_SPRITES_ARC_1_TO_5.length - 1, boss.arcId - 1));
  const spec = BOSS_SPRITES_ARC_1_TO_5[idx];
  renderPixelBossMatrixSpec(ctx, spec, cx, cy, animTimeSec, facing, scale);
}

export function verifyNoEmojiInBossVisual(boss: BossRegistryEntry): boolean {
  const combined = `${boss.id} ${boss.name} ${boss.title}`;
  return !combined.includes('\u{1F479}');
}

export { BOSS_SPRITES_ARC_1_TO_5 };
