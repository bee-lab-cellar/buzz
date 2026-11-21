/**
 * File 42 / 100 — Playable Hero #1: Nyx (24x24 Void-Black Wizard Cat).
 *
 * Strictly enforces:
 * - Crooked starry indigo wizard hat ALWAYS ON (rows y=0..6)
 * - Open-face void-black feline silhouette with pointy ears, golden eyes (#fbbf24),
 *   white catchlights, and cute pink nose (#ff8fab)
 * - Starlight Wand-Blade + flowing starry cloak
 * Zero `any` types.
 */

export interface PixelSpriteAsset {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly matrix: ReadonlyArray<string>;
  readonly palette: Readonly<Record<string, string>>;
}

export const NYX_PALETTE: Readonly<Record<string, string>> = {
  O: '#090812', // crisp outline
  H: '#312e81', // crooked starry wizard hat
  h: '#4338ca', // hat highlight
  '*': '#fde047', // golden star emblems on hat
  B: '#f59e0b', // hat gold band
  f: '#14121f', // void-black cat fur
  t: '#292442', // fur sheen
  p: '#ff8fab', // pink inner ears & nose
  E: '#fbbf24', // bright golden cat eyes
  L: '#ffffff', // white eye catchlights
  C: '#4c1d95', // starry wizard cloak
  c: '#6d28d9', // cloak trim
  W: '#38bdf8', // Starlight Wand crystal
  G: '#facc15', // wand gold shaft
};

export const NYX_IDLE_MATRIX_24X24: ReadonlyArray<string> = [
  '........OOOOO...........',
  '.......OHHH*HO..........',
  '......OHHhhHHHO.........',
  '.....OH*HHHHhHHO........',
  '....OOBBBBBBBBBOO.......',
  '..OOHHHHHH*HHHHHHOO.....',
  '..OOOfOOHHHHHHOOfOO.....',
  '...OfpfOffffffOfpfO.....',
  '...OffffffffffffftO.....',
  '...OffOOffffffOOffO.....',
  '...OffLEffffffELffO.....',
  '...OffEEffppffEEffO.....',
  '....OffffffffffftO......',
  '.....OOCCCCCCCCOO....OWO',
  '....OCCCcCCCCcCCCO..OWWO',
  '...OCCCcCCCCCCcCCCO..OGO',
  '...OCCCcCCCCCCcCCCO..OGO',
  '....OCCcCCCCCCcCCO...OGO',
  '....OCCCCCCCCCCCCO...OGO',
  '.....OOffO..OffOO....OOO',
  '.....OOffO..OffO........',
  '.....OOOOO..OOOO........',
  '........................',
  '........................',
];

export const NYX_ATTACK_MATRIX_24X24: ReadonlyArray<string> = [
  '........OOOOO...........',
  '.......OHHH*HO..........',
  '......OHHhhHHHO.........',
  '.....OH*HHHHhHHO........',
  '....OOBBBBBBBBBOO.......',
  '..OOHHHHHH*HHHHHHOO.....',
  '..OOOfOOHHHHHHOOfOO.....',
  '...OfpfOffffffOfpfO.....',
  '...OffffffffffffftO.....',
  '...OffOOffffffOOffO.....',
  '...OffLEffffffELffO..OWO',
  '...OffEEffppffEEffO.OWWO',
  '....OffffffffffftO..OWWO',
  '.....OOCCCCCCCCOO...OGO.',
  '....OCCCcCCCCcCCCO..OGO.',
  '...OCCCcCCCCCCcCCCOOGO..',
  '...OCCCcCCCCCCcCCCOGO...',
  '....OCCcCCCCCCcCCOOO....',
  '....OCCCCCCCCCCCCO......',
  '....OOffO....OffOO......',
  '....OOffO....OffO.......',
  '....OOOOO....OOOO.......',
  '........................',
  '........................',
];

export const HERO_NYX_ASSET: PixelSpriteAsset = {
  id: 'hero_nyx',
  width: 24,
  height: 24,
  matrix: NYX_IDLE_MATRIX_24X24,
  palette: NYX_PALETTE,
};

export function drawHeroNyxPixelSprite(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  facing: 1 | -1 = 1,
  attacking = false,
): void {
  const mat = attacking ? NYX_ATTACK_MATRIX_24X24 : NYX_IDLE_MATRIX_24X24;
  ctx.save();
  ctx.translate(Math.round(cx), Math.round(cy));
  ctx.scale(facing * scale, scale);
  const ox = -12;
  const oy = -12;
  for (let y = 0; y < mat.length; y++) {
    const row = mat[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.') continue;
      const hex = NYX_PALETTE[ch];
      if (!hex) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
  ctx.restore();
}
