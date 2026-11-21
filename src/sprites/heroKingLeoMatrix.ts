/**
 * File 43 / 100 — Playable Hero #2: King Leo (32x32 Majestic Golden Lion Sovereign).
 *
 * Towering 32x32 golden lion with 5-point jeweled golden crown, 360° amber-mahogany mane,
 * crimson royal cape, golden plate armor, and Sun Greatsword. Zero `any`.
 */

import type { PixelSpriteAsset } from './heroNyxMatrix';

export const KING_LEO_PALETTE: Readonly<Record<string, string>> = {
  O: '#1c1917',
  Y: '#ffd700', // 5-point golden crown & sun greatsword
  R: '#ef4444', // crown ruby
  S: '#38bdf8', // crown sapphire
  M: '#9e3b0e', // deep amber-mahogany outer mane
  b: '#d97706', // golden-orange inner mane
  f: '#f59e0b', // golden lion fur
  w: '#fef3c7', // broad cream snout
  n: '#451a03', // dark lion nose
  E: '#fbbf24', // fierce amber eyes
  L: '#ffffff', // eye catchlight & cape ermine
  K: '#0f172a', // pupil
  r: '#dc2626', // royal crimson cape
  A: '#f59e0b', // golden lion plate
};

export const KING_LEO_IDLE_MATRIX_32X32: ReadonlyArray<string> = [
  '.......OO..OO..OO..OO..OO.......',
  '......OYYOOYYOOYYOOYYOOYYO......',
  '.....OOYRYYYYYSYYYYYYRYYYOO.....',
  '...OOffOYYYYYYYYYYYYYYYYOffOO...',
  '..OfffOMMMMMMMMMMMMMMMMMMOfffO..',
  '.OMMMMbbbbbbbbbbbbbbbbbbbbMMMMO.',
  'OMMMMbbffffffffffffffffffbbMMMMO',
  'OMMMbbffOOffffffffffffffOOffbbMO',
  'OMMbbffLKKffffffffffffffKKLffbbO',
  'OMMbbffEKKffffffffffffffKKEffbbO',
  'OMMbbffEEEffffnnnnnnffffEEEffbbO',
  'OMMMbbffwwwwwwwwnnwwwwwwwwffbbMO',
  '.OMMMbbbwwwwwwwwwwwwwwwwwwbbbMO.',
  '.OMMMMbbbbwwwwwwwwwwwwwwbbbbMMO.',
  '..OMMMMMbbbbbbbbbbbbbbbbMMMMMO..',
  '...OOMMMMMMMMMMMMMMMMMMMMMMOO...',
  '..OrrOAAAAAYYYYYYYYYYAAAAAOrrO..',
  '.OrrLrOAAAAYYYYRRYYYYAAAAOrrLrO.',
  '.OrrrrOAAAAAAAAAAAAAAAAAAOrrrrO.',
  '.OrrLrOAAAAAAOOOOOOAAAAAAOrrLrO.',
  '.OrrrrOAAAAAAO....OAAAAAAOrrrrO.',
  '..OOOOOAAAAAAO....OAAAAAAOOOOO..',
  '......OYYYYYYO....OYYYYYYO......',
  '......OwwwwwwO....OwwwwwwO......',
  '......OOOOOOOO....OOOOOOOO......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

export const HERO_KING_LEO_ASSET: PixelSpriteAsset = {
  id: 'hero_king_leo',
  width: 32,
  height: 32,
  matrix: KING_LEO_IDLE_MATRIX_32X32,
  palette: KING_LEO_PALETTE,
};

export function drawHeroKingLeoPixelSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  facing: 1 | -1 = 1,
): void {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(facing * scale, scale);
  for (let y = 0; y < KING_LEO_IDLE_MATRIX_32X32.length; y++) {
    const row = KING_LEO_IDLE_MATRIX_32X32[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const hex = KING_LEO_PALETTE[ch];
      if (!hex) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(x - 16, y - 16, 1, 1);
    }
  }
  ctx.restore();
}
