/**
 * Pillar 2 — Four Playable Hero Pixel Matrices (Nyx 24x24, Majestic Lion King Leo 32x32,
 * Wolf-King Fenrir 32x32, and The Great Duck Archmage 32x32).
 */

import type { PlayableHeroId } from '../types/combat';
import { HERO_NYX_MATRIX, NYX_COAT_PALETTES, getNyxPalette } from './heroNyxMatrices';
import { HERO_KING_LEO_MATRIX } from './heroKingLeoMatrices';
import { HERO_FENRIR_MATRIX, HERO_GREAT_DUCK_MATRIX } from './heroFenrirAndDuckMatrices';
import { compile8FrameSpriteSheet, type CompiledSpriteSheet } from './pixelMatrixCompiler';
import type { SpriteSheet8Frame } from './spriteMatrixTypes';

export interface HeroMatrixDescriptor {
  readonly heroId: PlayableHeroId;
  readonly displayName: string;
  readonly width: 24 | 32;
  readonly height: 24 | 32;
  readonly pinkNoseHex: string | null;
  readonly has360LionMane: boolean;
  readonly sheet: SpriteSheet8Frame;
}

export const HERO_FOUR_MATRICES: Readonly<Record<PlayableHeroId, HeroMatrixDescriptor>> = {
  nyx: {
    heroId: 'nyx',
    displayName: 'Nyx, Void-Black Wizard Cat',
    width: 24,
    height: 24,
    pinkNoseHex: '#ff8fab',
    has360LionMane: false,
    sheet: {
      ...HERO_NYX_MATRIX,
      palette: {
        ...HERO_NYX_MATRIX.palette,
        n: '#ff8fab',
      },
    },
  },
  king_leo: {
    heroId: 'king_leo',
    displayName: 'King Leo, Majestic Golden Lion',
    width: 32,
    height: 32,
    pinkNoseHex: '#b45309',
    has360LionMane: true,
    sheet: HERO_KING_LEO_MATRIX,
  },
  fenrir: {
    heroId: 'fenrir',
    displayName: 'Wolf-King Fenrir',
    width: 32,
    height: 32,
    pinkNoseHex: null,
    has360LionMane: false,
    sheet: HERO_FENRIR_MATRIX,
  },
  great_duck: {
    heroId: 'great_duck',
    displayName: 'The Great Duck Archmage',
    width: 32,
    height: 32,
    pinkNoseHex: null,
    has360LionMane: false,
    sheet: HERO_GREAT_DUCK_MATRIX,
  },
};

export function compileHeroFourSheet(
  heroId: PlayableHeroId,
  nyxCoatIndex = 0,
  nyxWeaponTier: 1 | 2 | 3 | 4 | 5 = 1,
): CompiledSpriteSheet | null {
  const desc = HERO_FOUR_MATRICES[heroId];
  if (heroId === 'nyx') {
    const coat = NYX_COAT_PALETTES[Math.abs(nyxCoatIndex) % NYX_COAT_PALETTES.length];
    const pal: Record<string, string> = {
      ...getNyxPalette(coat.id, nyxWeaponTier),
      n: '#ff8fab',
    };
    return compile8FrameSpriteSheet(desc.sheet, pal, `${coat.id}_t${nyxWeaponTier}`);
  }
  return compile8FrameSpriteSheet(desc.sheet, undefined, 'default');
}
