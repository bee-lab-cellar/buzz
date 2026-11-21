/**
 * File 44 / 100 — Playable Hero #3: Wolf-King Fenrir (32x32 Dire Wolf Sovereign).
 *
 * Towering silver-charcoal dire wolf with glowing astral cyan eyes, wolf shoulder pelts,
 * golden royal belt, and Twin Eclipse Battleaxes. Zero `any`.
 */

import type { PixelSpriteAsset } from './heroNyxMatrix';

export const FENRIR_PALETTE: Readonly<Record<string, string>> = {
  O: '#09090b',
  a: '#64748b', // silver-grey wolf fur
  d: '#334155', // charcoal dorsal fur
  w: '#cbd5e1', // lupine snout & fangs
  W: '#ffffff', // fangs & glint
  C: '#38bdf8', // astral cyan wolf eyes & eclipse axe glow
  R: '#ef4444', // crimson alpha accent
  n: '#0f172a', // wolf nose
  p: '#475569', // wolf shoulder pelts
  A: '#1e293b', // dark battle plate
  Y: '#fde047', // golden trim
};

export const FENRIR_IDLE_MATRIX_32X32: ReadonlyArray<string> = [
  '....OOO..................OOO....',
  '...OaaaO....OO....OO....OaaaO...',
  '...OaddaO..OYYOOOOYYO..OaddaO...',
  '..OadddaaOOYYYYYYYYYYOOadddaaO..',
  '..OadddaaaaaaaaaaaaaaaaaadddaO..',
  '...OaaaaaddddddddddddddddaaaaO..',
  '..OadddaWCCaaaaaaaaaaaaCCWaddO..',
  '..OadddaRCCaaaaaaaaaaaaCCRaddO..',
  '..OaaaaaawwwwwwnnnnwwwwwwaaaaO..',
  '...OaaaawwwwwwwwnnwwwwwwwwaaaO..',
  '...OaaaaWW...WWWWWW...WWaaaaO...',
  '....OOaaaWWWWWWWWWWWWWWaaaOO....',
  '..OOOppppddddddddddddddppppOOO..',
  '.OppAAAAAYYYYYYYYYYYYYYAAAAAppO.',
  'OCCOAAAAAYYYYYYYYYYYYYYAAAAAOCOO',
  'OCCOAAAAAAAAAAAAAAAAAAAAAAAAOCOO',
  '.OO.OAAAAAAAOOOOOOOOAAAAAAAOO.OO',
  '....OddddddO........OddddddO....',
  '....OaaaaaaO........OaaaaaaO....',
  '....OYYYYYYO........OYYYYYYO....',
  '....OOOOOOOO........OOOOOOOO....',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];

export const HERO_FENRIR_ASSET: PixelSpriteAsset = {
  id: 'hero_fenrir',
  width: 32,
  height: 32,
  matrix: FENRIR_IDLE_MATRIX_32X32,
  palette: FENRIR_PALETTE,
};

export function drawHeroFenrirPixelSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  facing: 1 | -1 = 1,
): void {
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(facing * scale, scale);
  for (let y = 0; y < FENRIR_IDLE_MATRIX_32X32.length; y++) {
    const row = FENRIR_IDLE_MATRIX_32X32[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const hex = FENRIR_PALETTE[ch];
      if (!hex) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(x - 16, y - 16, 1, 1);
    }
  }
  ctx.restore();
}
