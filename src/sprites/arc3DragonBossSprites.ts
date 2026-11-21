/**
 * Layer 3 — Arc III Articulated 4-Part Dragon Boss Sprite Atlas (Acts 83–122)
 * Separate pre-baked offscreen layers for Wings, SeverableTail, ChestCore, and Head
 * including Act 122 Ignis-Bahamut, Ancient Sovereign of Dragons.
 */

import type { AnimationClipName, BossPartHitbox } from '../types/entities';
import {
  ARC3_ARTICULATED_DRAGON_MATRICES,
  ARC3_DRAGON_PALETTES,
} from './arc3DragonBossMatrices';
import { mapClipToFrame8 } from './heroNyxAndKingLeo';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
} from './spriteMatrixTypes';

export type DragonElementKey = keyof typeof ARC3_DRAGON_PALETTES;

export interface DragonPartRenderState {
  readonly wingsBroken: boolean;
  readonly tailSevered: boolean;
  readonly chestCoreExposed: boolean;
  readonly wingFlapRadians: number;
  readonly tailSwayRadians: number;
}

const DRAGON_PART_CACHE = new Map<string, HTMLCanvasElement>();

function getPartCanvas(
  element: DragonElementKey,
  part: 'head' | 'leftWing' | 'rightWing' | 'severableTail' | 'chestCore',
  frame: SpriteFrame8Name,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const key = `dragon:${element}:${part}:${frame}`;
  const cached = DRAGON_PART_CACHE.get(key);
  if (cached) return cached;

  const palette: Record<string, string> = {
    ...ARC3_ARTICULATED_DRAGON_MATRICES.palette,
    ...ARC3_DRAGON_PALETTES[element],
  };

  const rows = ARC3_ARTICULATED_DRAGON_MATRICES[part][frame];
  const canvas = renderPixelMatrixToCanvas(
    rows,
    palette,
    ARC3_ARTICULATED_DRAGON_MATRICES.width,
    ARC3_ARTICULATED_DRAGON_MATRICES.height,
  );
  DRAGON_PART_CACHE.set(key, canvas);
  return canvas;
}

export function createArticulatedDragonHitboxes(bossMaxHp: number): BossPartHitbox[] {
  return [
    {
      partId: 'dragon_wings',
      kind: 'dragon_wings',
      label: 'Membrane Wings (Break to Ground)',
      offset: { x: 0, y: -26 },
      radius: 24,
      hp: Math.round(bossMaxHp * 0.22),
      maxHp: Math.round(bossMaxHp * 0.22),
      broken: false,
      weakSpotMultiplier: 1.5,
      bypassesBossDamageCap: true,
      hitFlashTimer: 0,
    },
    {
      partId: 'dragon_tail',
      kind: 'dragon_tail',
      label: 'Severable Tail (Slice for Loot)',
      offset: { x: -26, y: 14 },
      radius: 18,
      hp: Math.round(bossMaxHp * 0.16),
      maxHp: Math.round(bossMaxHp * 0.16),
      broken: false,
      weakSpotMultiplier: 2.0,
      bypassesBossDamageCap: true,
      hitFlashTimer: 0,
    },
    {
      partId: 'dragon_chest_core',
      kind: 'dragon_chest_core',
      label: 'Ember Chest Core (2.5x CRIT)',
      offset: { x: 2, y: -4 },
      radius: 15,
      hp: Math.round(bossMaxHp * 0.35),
      maxHp: Math.round(bossMaxHp * 0.35),
      broken: false,
      weakSpotMultiplier: 2.5,
      bypassesBossDamageCap: false,
      hitFlashTimer: 0,
    },
    {
      partId: 'dragon_head',
      kind: 'dragon_head',
      label: 'Crowned Dragon Skull',
      offset: { x: 18, y: -22 },
      radius: 16,
      hp: Math.round(bossMaxHp * 0.27),
      maxHp: Math.round(bossMaxHp * 0.27),
      broken: false,
      weakSpotMultiplier: 1.75,
      bypassesBossDamageCap: false,
      hitFlashTimer: 0,
    },
  ];
}

export function drawArticulatedDragonBoss(
  ctx: CanvasRenderingContext2D,
  element: DragonElementKey,
  x: number,
  y: number,
  clip: AnimationClipName,
  frameIndex: number,
  facingX: 1 | -1,
  state: DragonPartRenderState,
  scale = 1.25,
): void {
  const frame = mapClipToFrame8(clip, frameIndex);
  const w = ARC3_ARTICULATED_DRAGON_MATRICES.width;
  const h = ARC3_ARTICULATED_DRAGON_MATRICES.height;

  const leftWing = getPartCanvas(element, 'leftWing', frame);
  const rightWing = getPartCanvas(element, 'rightWing', frame);
  const tail = getPartCanvas(element, 'severableTail', frame);
  const core = getPartCanvas(element, 'chestCore', frame);
  const head = getPartCanvas(element, 'head', frame);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facingX * scale, scale);

  if (!state.tailSevered && tail) {
    ctx.save();
    ctx.rotate(state.tailSwayRadians * 0.2);
    ctx.drawImage(tail, -w / 2, -h);
    ctx.restore();
  }

  if (!state.wingsBroken) {
    if (leftWing) {
      ctx.save();
      ctx.rotate(-state.wingFlapRadians * 0.25);
      ctx.drawImage(leftWing, -w / 2, -h);
      ctx.restore();
    }
    if (rightWing) {
      ctx.save();
      ctx.rotate(state.wingFlapRadians * 0.25);
      ctx.drawImage(rightWing, -w / 2, -h);
      ctx.restore();
    }
  }

  if (core) {
    ctx.drawImage(core, -w / 2, -h);
    if (state.chestCoreExposed) {
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, -h * 0.45, 9, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (head) {
    ctx.drawImage(head, -w / 2, -h);
  }

  ctx.restore();
}

export { ARC3_ARTICULATED_DRAGON_MATRICES, ARC3_DRAGON_PALETTES };
