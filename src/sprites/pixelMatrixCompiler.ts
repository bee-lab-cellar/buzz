/**
 * Pillar 2 — Offscreen Pixel-Matrix Compiler
 *
 * Bakes explicit 8-frame pixel matrices (`idle1, idle2, walk1..4, attack1..2`),
 * pure-white hit-flash silhouette masks, and directional crescent slash arcs
 * into GPU-cached offscreen canvases at startup with zero per-frame allocations.
 */

import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export interface CompiledSpriteSheet {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly frames: Readonly<Record<SpriteFrame8Name, HTMLCanvasElement>>;
  readonly hitFlashMasks: Readonly<Record<SpriteFrame8Name, HTMLCanvasElement>>;
}

export type SlashArcDirection = 'east' | 'west' | 'north' | 'south';

const FRAME8_ORDER: ReadonlyArray<SpriteFrame8Name> = [
  'idle1',
  'idle2',
  'walk1',
  'walk2',
  'walk3',
  'walk4',
  'attack1',
  'attack2',
];

const COMPILED_SHEET_CACHE = new Map<string, CompiledSpriteSheet>();
const SLASH_ARC_CACHE = new Map<string, HTMLCanvasElement>();

function bakeWhiteHitFlashMask(
  frameRows: ReadonlyArray<string>,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < frameRows.length && y < height; y++) {
    const row = frameRows[y];
    for (let x = 0; x < row.length && x < width; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

/**
 * Compiles a SpriteSheet8Frame into cached 8-frame canvases + 8 white hit-flash masks.
 */
export function compile8FrameSpriteSheet(
  sheet: SpriteSheet8Frame,
  paletteOverride?: Record<string, string>,
  cacheKeySuffix = '',
): CompiledSpriteSheet | null {
  if (typeof document === 'undefined') return null;
  const key = `${sheet.id}:${cacheKeySuffix}`;
  const cached = COMPILED_SHEET_CACHE.get(key);
  if (cached) return cached;

  const palette = paletteOverride ? { ...sheet.palette, ...paletteOverride } : sheet.palette;
  const frames = {} as Record<SpriteFrame8Name, HTMLCanvasElement>;
  const hitFlashMasks = {} as Record<SpriteFrame8Name, HTMLCanvasElement>;

  for (let i = 0; i < FRAME8_ORDER.length; i++) {
    const name = FRAME8_ORDER[i];
    const rows = sheet.frames[name];
    frames[name] = renderPixelMatrixToCanvas(rows, palette, sheet.width, sheet.height);
    hitFlashMasks[name] = bakeWhiteHitFlashMask(rows, sheet.width, sheet.height);
  }

  const compiled: CompiledSpriteSheet = {
    id: sheet.id,
    width: sheet.width,
    height: sheet.height,
    frames,
    hitFlashMasks,
  };
  COMPILED_SHEET_CACHE.set(key, compiled);
  return compiled;
}

/**
 * Pre-bakes a directional crescent slash arc canvas (zero `ctx.shadowBlur`).
 */
export function getBakedCrescentSlashArc(
  colorHex: string,
  direction: SlashArcDirection,
  radiusPx = 22,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const key = `slash:${colorHex}:${direction}:${radiusPx}`;
  const cached = SLASH_ARC_CACHE.get(key);
  if (cached) return cached;

  const size = radiusPx * 2 + 8;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const baseAngle =
    direction === 'east'
      ? 0
      : direction === 'south'
        ? Math.PI / 2
        : direction === 'west'
          ? Math.PI
          : -Math.PI / 2;

  ctx.save();
  ctx.translate(half, half);
  ctx.rotate(baseAngle);

  // Outer glowing energy crescent
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, radiusPx, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.stroke();

  // Inner razor-white core edge
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, radiusPx - 1.5, -Math.PI * 0.34, Math.PI * 0.34);
  ctx.stroke();
  ctx.restore();

  SLASH_ARC_CACHE.set(key, canvas);
  return canvas;
}

export function clearCompiledSpriteCaches(): void {
  COMPILED_SHEET_CACHE.clear();
  SLASH_ARC_CACHE.clear();
}
