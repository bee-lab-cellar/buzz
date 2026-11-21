/**
 * Layer 3 — Allied Cat Army (6 Coats x 4 Classes + Open-Face Blacksmith Cat)
 * & 4 Distinct Dog Legion Breeds with Anti-Clone ShuffleBagSpawner.
 *
 * STRICT CLEAN ART RULE:
 * - Allied Cats wear ONLY open-face headbands/crowns at y=1..4; NEVER grey visor/toaster helmets!
 * - Zero `any` types.
 */

import type { AlliedCatRole, AnimationClipName, CatCoatBreed, DogLegionBreed } from '../types/entities';
import {
  ALLY_CAT_ARCHER_MATRIX,
  ALLY_CAT_KNIGHT_MATRIX,
  ALLY_CAT_MAGE_MATRIX,
  ALLY_DOG_WARRIOR_MATRIX,
} from './alliedCatAndDogArmyMatrices';
import { mapClipToFrame8 } from './heroNyxAndKingLeo';
import {
  renderPixelMatrixToCanvas,
  type SpriteFrame8Name,
  type SpriteSheet8Frame,
} from './spriteMatrixTypes';

export interface CatCoatPalette {
  readonly breed: CatCoatBreed;
  readonly label: string;
  readonly primaryFur: string;
  readonly secondaryFur: string;
  readonly earInner: string;
  readonly eyeColor: string;
  readonly noseColor: string;
  /** Strictly placed at y=1..4 forehead band only (open-face rule) */
  readonly browBandColor: string;
}

export const ALLIED_CAT_COAT_PALETTES: Readonly<Record<CatCoatBreed, CatCoatPalette>> = {
  void_black: {
    breed: 'void_black',
    label: 'Void Black',
    primaryFur: '#1c1d2b',
    secondaryFur: '#2e3047',
    earInner: '#f472b6',
    eyeColor: '#fde047',
    noseColor: '#ff8fab',
    browBandColor: '#f59e0b',
  },
  ginger_tabby: {
    breed: 'ginger_tabby',
    label: 'Ginger Tabby',
    primaryFur: '#ea8c2d',
    secondaryFur: '#f9b963',
    earInner: '#fda4af',
    eyeColor: '#22c55e',
    noseColor: '#fb7185',
    browBandColor: '#dc2626',
  },
  tuxedo: {
    breed: 'tuxedo',
    label: 'Royal Tuxedo',
    primaryFur: '#181825',
    secondaryFur: '#f8fafc',
    earInner: '#f9a8d4',
    eyeColor: '#38bdf8',
    noseColor: '#fda4af',
    browBandColor: '#3b82f6',
  },
  calico_tri: {
    breed: 'calico_tri',
    label: 'Calico Tri-Coat',
    primaryFur: '#f8fafc',
    secondaryFur: '#d97706',
    earInner: '#fda4af',
    eyeColor: '#84cc16',
    noseColor: '#ff8fab',
    browBandColor: '#10b981',
  },
  royal_siamese: {
    breed: 'royal_siamese',
    label: 'Royal Siamese',
    primaryFur: '#f5e6cf',
    secondaryFur: '#5c4033',
    earInner: '#e5a4a4',
    eyeColor: '#60a5fa',
    noseColor: '#7c5547',
    browBandColor: '#a855f7',
  },
  russian_blue: {
    breed: 'russian_blue',
    label: 'Russian Blue',
    primaryFur: '#64748b',
    secondaryFur: '#94a3b8',
    earInner: '#f5b7c6',
    eyeColor: '#34d399',
    noseColor: '#f472b6',
    browBandColor: '#eab308',
  },
};

export interface DogBreedPalette {
  readonly breed: DogLegionBreed;
  readonly label: string;
  readonly furMain: string;
  readonly furAccent: string;
  readonly armorColor: string;
  readonly capeColor: string;
}

export const DOG_BREED_PALETTES: Readonly<Record<DogLegionBreed, DogBreedPalette>> = {
  bulldog_phalanx: {
    breed: 'bulldog_phalanx',
    label: 'Bulldog Shield Phalanx',
    furMain: '#b47b4b',
    furAccent: '#f3e5d0',
    armorColor: '#94a3b8',
    capeColor: '#991b1b',
  },
  doberman_assassin: {
    breed: 'doberman_assassin',
    label: 'Doberman Shadow Assassin',
    furMain: '#1e1b24',
    furAccent: '#c26b2d',
    armorColor: '#334155',
    capeColor: '#6b21a8',
  },
  husky_berserker: {
    breed: 'husky_berserker',
    label: 'Husky Frost Berserker',
    furMain: '#475569',
    furAccent: '#f8fafc',
    armorColor: '#38bdf8',
    capeColor: '#0284c7',
  },
  bloodhound_gunner: {
    breed: 'bloodhound_gunner',
    label: 'Bloodhound Flintlock Gunner',
    furMain: '#7c2d12',
    furAccent: '#d97706',
    armorColor: '#78716c',
    capeColor: '#b45309',
  },
};

/**
 * Deterministic Fisher-Yates Shuffle Bag that guarantees zero back-to-back clone spawning
 * across allied cats and dog squads.
 */
export class ShuffleBagSpawner<T> {
  private readonly items: ReadonlyArray<T>;
  private bag: T[] = [];
  private lastPicked: T | null = null;
  private rngState: number;

  constructor(items: ReadonlyArray<T>, seed = 1337) {
    this.items = [...items];
    this.rngState = seed >>> 0 || 1;
    this.refill();
  }

  private nextRand(): number {
    let x = this.rngState;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x >>> 0;
    return this.rngState / 0xffffffff;
  }

  private refill(): void {
    this.bag = [...this.items];
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.nextRand() * (i + 1));
      const tmp = this.bag[i];
      this.bag[i] = this.bag[j];
      this.bag[j] = tmp;
    }
    if (this.bag.length > 1 && this.lastPicked !== null && this.bag[this.bag.length - 1] === this.lastPicked) {
      const tmp = this.bag[0];
      this.bag[0] = this.bag[this.bag.length - 1];
      this.bag[this.bag.length - 1] = tmp;
    }
  }

  public next(): T {
    if (this.bag.length === 0) {
      this.refill();
    }
    const picked = this.bag.pop() as T;
    this.lastPicked = picked;
    return picked;
  }
}

export const ALL_CAT_COATS: ReadonlyArray<CatCoatBreed> = [
  'void_black',
  'ginger_tabby',
  'tuxedo',
  'calico_tri',
  'royal_siamese',
  'russian_blue',
];

export const ALL_DOG_BREEDS: ReadonlyArray<DogLegionBreed> = [
  'bulldog_phalanx',
  'doberman_assassin',
  'husky_berserker',
  'bloodhound_gunner',
];

const ARMY_CANVAS_CACHE = new Map<string, HTMLCanvasElement>();

function getCatBaseSheet(role: AlliedCatRole): SpriteSheet8Frame {
  switch (role) {
    case 'calico_archer':
      return ALLY_CAT_ARCHER_MATRIX;
    case 'arcane_cat_mage':
      return ALLY_CAT_MAGE_MATRIX;
    case 'cat_knight':
    case 'lion_halberdier':
    case 'blacksmith_cat':
    default:
      return ALLY_CAT_KNIGHT_MATRIX;
  }
}

/**
 * Enforces the open-face rule (y=1..4 forehead crown/headband only, never visor bars over eyes).
 */
export function getAlliedCatFrameCanvas(
  coat: CatCoatBreed,
  role: AlliedCatRole,
  clip: AnimationClipName,
  frameIndex: number,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const frameName: SpriteFrame8Name = mapClipToFrame8(clip, frameIndex);
  const key = `cat:${coat}:${role}:${frameName}`;
  const cached = ARMY_CANVAS_CACHE.get(key);
  if (cached) return cached;

  const baseSheet = getCatBaseSheet(role);
  const coatSpec = ALLIED_CAT_COAT_PALETTES[coat];
  const mergedPalette: Record<string, string> = {
    ...baseSheet.palette,
    f: coatSpec.primaryFur,
    c: coatSpec.primaryFur,
    s: coatSpec.secondaryFur,
    e: coatSpec.eyeColor,
    n: coatSpec.noseColor,
    p: coatSpec.earInner,
    h: role === 'blacksmith_cat' ? '#f59e0b' : coatSpec.browBandColor,
  };

  const canvas = renderPixelMatrixToCanvas(
    baseSheet.frames[frameName],
    mergedPalette,
    baseSheet.width,
    baseSheet.height,
  );
  ARMY_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export function getDogBreedFrameCanvas(
  breed: DogLegionBreed,
  clip: AnimationClipName,
  frameIndex: number,
): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const frameName: SpriteFrame8Name = mapClipToFrame8(clip, frameIndex);
  const key = `dog:${breed}:${frameName}`;
  const cached = ARMY_CANVAS_CACHE.get(key);
  if (cached) return cached;

  const breedSpec = DOG_BREED_PALETTES[breed];
  const mergedPalette: Record<string, string> = {
    ...ALLY_DOG_WARRIOR_MATRIX.palette,
    f: breedSpec.furMain,
    b: breedSpec.furMain,
    s: breedSpec.furAccent,
    a: breedSpec.armorColor,
    r: breedSpec.capeColor,
  };

  const canvas = renderPixelMatrixToCanvas(
    ALLY_DOG_WARRIOR_MATRIX.frames[frameName],
    mergedPalette,
    ALLY_DOG_WARRIOR_MATRIX.width,
    ALLY_DOG_WARRIOR_MATRIX.height,
  );
  ARMY_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export function createCatCoatShuffleBag(seed = 101): ShuffleBagSpawner<CatCoatBreed> {
  return new ShuffleBagSpawner<CatCoatBreed>(ALL_CAT_COATS, seed);
}

export function createDogBreedShuffleBag(seed = 202): ShuffleBagSpawner<DogLegionBreed> {
  return new ShuffleBagSpawner<DogLegionBreed>(ALL_DOG_BREEDS, seed);
}
