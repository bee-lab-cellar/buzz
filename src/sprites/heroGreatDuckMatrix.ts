/**
 * File 45 / 100 — Playable Hero #4: The Great Duck (32x32 Archmage of the Golden Pond).
 *
 * Chubby mallard archmage wearing a starry indigo wizard hat, emerald-green feathers,
 * bright golden bill, white wing plumage, and Golden Lotus Scepter. Zero `any`.
 */

import type { PixelSpriteAsset } from './heroNyxMatrix';

export const GREAT_DUCK_PALETTE: Readonly<Record<string, string>> = {
  O: '#0f172a',
  B: '#1d4ed8', // starry wizard hat
  s: '#fef08a', // stars on hat
  Y: '#facc15', // golden bill, hat brim & lotus scepter
  G: '#047857', // emerald mallard head feathers
  W: '#f8fafc', // chubby white plumage
  K: '#020617', // eye pupil
  L: '#ffffff', // eye shine
  o: '#f97316', // webbed duck feet
};

export const GREAT_DUCK_IDLE_MATRIX_32X32: ReadonlyArray<string> = [
  '.............OOOOOO.............',
  '............OBBBBBBO............',
  '...........OBBsBBBBBO...........',
  '..........OBBBBBBsBBBO..........',
  '.........OBBsBBBBBBBBBO.........',
  '........OBBBBBBBBsBBBBBO........',
  '......OOYYYYYYYYYYYYYYYYOO......',
  '.....OYYYYBBBBBBBBBBBBYYYYO.....',
  '......OOOOOOGGGGGGGGOOOOOO......',
  '..........OGGGGGGGGGGO..........',
  '.........OGGGLKGGGGGGGO.........',
  '.........OGGGKKGGGGGGGO.........',
  '.........OGGGGGGGYYYYYYO........',
  '..........OGGGGGYYYYYYYYO.......',
  '..........OOGGGGYYYYYYOO........',
  '...........OWWWWWWWWWOO.........',
  '..........OWWWWWWWWWWWWO........',
  '........OOWWGGGGGGGGGWWOO.......',
  '.......OWWWGGGGGGGGGGGWWWO......',
  '......OWWWGGYYYYYYYYYGGWWWO.....',
  '......OWWWGGGGGGGGGGGGGWWWO.....',
  '.......OWWWWWWWWWWWWWWWWWO......',
  '........OOWWWWWWWWWWWWWOO.......',
  '..........OoooO...OoooO.........',
  '.........OooooO...OooooO........',
  '.........OOOOOO...OOOOOO........',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

export const HERO_GREAT_DUCK_ASSET: PixelSpriteAsset = {
  id: 'hero_great_duck',
  width: 32,
  height: 32,
  matrix: GREAT_DUCK_IDLE_MATRIX_32X32,
  palette: GREAT_DUCK_PALETTE,
};

export function drawHeroGreatDuckPixelSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  facing: 1 | -1 = 1,
): void {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(facing * scale, scale);
  for (let y = 0; y < GREAT_DUCK_IDLE_MATRIX_32X32.length; y++) {
    const row = GREAT_DUCK_IDLE_MATRIX_32X32[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const hex = GREAT_DUCK_PALETTE[ch];
      if (!hex) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(x - 16, y - 16, 1, 1);
    }
  }
  ctx.restore();
}
