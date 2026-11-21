/**
 * Layer 3 — Hero Sprite Modules: Nyx (24x24 Void-Black Wizard Cat) & King Leo (32x32 Golden Lion)
 * Strictly typed, pre-baked 8-frame offscreen canvases, zero `any`.
 */

import type { AnimationClipName, CatCoatBreed, HeroId } from '../types/entities';
import {
  HERO_NYX_MATRIX,
  NYX_COAT_PALETTES,
  NYX_WEAPON_TIERS,
  getNyxPalette,
} from './heroNyxMatrices';
import { HERO_KING_LEO_MATRIX } from './heroKingLeoMatrices';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export interface HeroVisualSpec {
  readonly heroId: Extract<HeroId, 'nyx' | 'king_leo'>;
  readonly displayName: string;
  readonly width: 24 | 32;
  readonly height: 24 | 32;
  readonly anatomyChecklist: ReadonlyArray<string>;
  readonly sheet: SpriteSheet8Frame;
}

export const NYX_VISUAL_SPEC: HeroVisualSpec = {
  heroId: 'nyx',
  displayName: 'Nyx, Void-Black Wizard Cat',
  width: 24,
  height: 24,
  anatomyChecklist: [
    'Pointed feline ear cutouts poking through midnight wizard hat',
    'Crisp pink nose (#ff8fab) centered on unobstructed cat face',
    'Glowing emerald-gold eyes with dark pixel outline',
    'Curved star-tipped black tail & tiered enchanted blade',
  ],
  sheet: HERO_NYX_MATRIX,
};

export const KING_LEO_VISUAL_SPEC: HeroVisualSpec = {
  heroId: 'king_leo',
  displayName: 'King Leo, Sovereign Golden Lion',
  width: 32,
  height: 32,
  anatomyChecklist: [
    'Full 360-degree mahogany-gold lion mane framing open feline face',
    'Rounded lion ears above forehead',
    '5-point jeweled royal crown on brow (y=1..4)',
    'Flowing crimson ermine cape & tufted golden lion tail',
  ],
  sheet: HERO_KING_LEO_MATRIX,
};

export interface PrebakedHeroAtlas {
  readonly heroId: Extract<HeroId, 'nyx' | 'king_leo'>;
  readonly width: number;
  readonly height: number;
  readonly frames: Readonly<Record<SpriteFrame8Name, HTMLCanvasElement>>;
}

const HERO_ATLAS_CACHE = new Map<string, PrebakedHeroAtlas>();

export function mapClipToFrame8(clip: AnimationClipName, frameIndex: number): SpriteFrame8Name {
  switch (clip) {
    case 'walk':
    case 'dodge': {
      const idx = Math.abs(frameIndex) % 4;
      if (idx === 0) return 'walk1';
      if (idx === 1) return 'walk2';
      if (idx === 2) return 'walk3';
      return 'walk4';
    }
    case 'attack':
    case 'cast':
      return frameIndex % 2 === 0 ? 'attack1' : 'attack2';
    case 'idle':
    case 'hurt':
    case 'victory':
    default:
      return frameIndex % 2 === 0 ? 'idle1' : 'idle2';
  }
}

export function getNyxCoatIndex(coat: CatCoatBreed): number {
  switch (coat) {
    case 'void_black':
      return 0;
    case 'ginger_tabby':
      return 1;
    case 'tuxedo':
      return 2;
    case 'calico_tri':
      return 3;
    case 'royal_siamese':
      return 4;
    case 'russian_blue':
      return 5;
  }
}

export function prebakeNyxAndKingLeoAtlas(
  heroId: Extract<HeroId, 'nyx' | 'king_leo'>,
  coatIndex = 0,
  weaponTier = 0,
): PrebakedHeroAtlas | null {
  if (typeof document === 'undefined') return null;
  const key = `${heroId}:${coatIndex}:${weaponTier}`;
  const cached = HERO_ATLAS_CACHE.get(key);
  if (cached) return cached;

  const spec = heroId === 'nyx' ? NYX_VISUAL_SPEC : KING_LEO_VISUAL_SPEC;
  const coatVariant = NYX_COAT_PALETTES[Math.abs(coatIndex) % NYX_COAT_PALETTES.length];
  const clampedTier = Math.max(1, Math.min(5, weaponTier + 1)) as 1 | 2 | 3 | 4 | 5;
  const palette: Record<string, string> =
    heroId === 'nyx'
      ? {
          ...getNyxPalette(coatVariant.id, clampedTier),
          n: '#ff8fab',
        }
      : spec.sheet.palette;

  const frameNames: ReadonlyArray<SpriteFrame8Name> = [
    'idle1',
    'idle2',
    'walk1',
    'walk2',
    'walk3',
    'walk4',
    'attack1',
    'attack2',
  ];

  const built = {} as Record<SpriteFrame8Name, HTMLCanvasElement>;
  for (const name of frameNames) {
    built[name] = renderPixelMatrixToCanvas(
      spec.sheet.frames[name],
      palette,
      spec.width,
      spec.height,
    );
  }

  const atlas: PrebakedHeroAtlas = {
    heroId,
    width: spec.width,
    height: spec.height,
    frames: built,
  };
  HERO_ATLAS_CACHE.set(key, atlas);
  return atlas;
}

export function drawHeroNyxOrLeo(
  ctx: CanvasRenderingContext2D,
  heroId: Extract<HeroId, 'nyx' | 'king_leo'>,
  x: number,
  y: number,
  clip: AnimationClipName,
  frameIndex: number,
  facingX: 1 | -1,
  coatIndex = 0,
  weaponTier = 0,
): void {
  const atlas = prebakeNyxAndKingLeoAtlas(heroId, coatIndex, weaponTier);
  if (!atlas) return;
  const frame = atlas.frames[mapClipToFrame8(clip, frameIndex)];
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  if (facingX < 0) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(frame, -Math.floor(atlas.width / 2), -atlas.height);
  ctx.restore();
}

export { HERO_NYX_MATRIX, HERO_KING_LEO_MATRIX, NYX_COAT_PALETTES, NYX_WEAPON_TIERS, getNyxPalette };
