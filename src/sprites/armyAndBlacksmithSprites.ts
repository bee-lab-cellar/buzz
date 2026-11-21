/**
 * Pillar 2 — Allied Cat Army (6 Coats x 4 Classes + Open-Face Blacksmith Cat)
 * & 4 Distinct Dog Legion Breeds with Anti-Clone ShuffleBag Spawning.
 *
 * STRICT OPEN-FACE RULE:
 * - Headbands / crowns on Allied Cats & Blacksmith Cat sit ONLY at `y = 1..4` between ears.
 * - ZERO grey visor/toaster cages ever cover any cat's face or eyes.
 */

import type { AlliedCatRole, CatCoatBreed, DogLegionBreed } from '../types/entities';
import {
  ALLIED_CAT_COAT_PALETTES,
  ALL_CAT_COATS,
  ALL_DOG_BREEDS,
  DOG_BREED_PALETTES,
  ShuffleBagSpawner,
  createCatCoatShuffleBag,
  createDogBreedShuffleBag,
  getAlliedCatFrameCanvas,
  getDogBreedFrameCanvas,
} from './alliedCatAndDogArmies';

export const OPEN_FACE_HEADBAND_Y_RANGE = { minRow: 1, maxRow: 4 } as const;

export interface BlacksmithVisualSpec {
  readonly role: 'blacksmith_cat';
  readonly coat: CatCoatBreed;
  readonly openFaceGuaranteed: true;
  readonly browBandRowMin: 1;
  readonly browBandRowMax: 4;
  readonly patioSizeTiles: 3;
}

export const OPEN_FACE_BLACKSMITH_SPEC: BlacksmithVisualSpec = {
  role: 'blacksmith_cat',
  coat: 'ginger_tabby',
  openFaceGuaranteed: true,
  browBandRowMin: 1,
  browBandRowMax: 4,
  patioSizeTiles: 3,
};

/**
 * Validates that a cat sprite pixel matrix follows the strict open-face rule
 * (no visor color char `'v'` or metallic grill blocking facial eye rows `y = 5..10`).
 */
export function verifyOpenFaceCatMatrix(rows: ReadonlyArray<string>): boolean {
  for (let y = 5; y <= 10 && y < rows.length; y++) {
    if (rows[y].includes('v') || rows[y].includes('V')) {
      return false;
    }
  }
  return true;
}

export {
  ALLIED_CAT_COAT_PALETTES,
  ALL_CAT_COATS,
  ALL_DOG_BREEDS,
  DOG_BREED_PALETTES,
  ShuffleBagSpawner,
  createCatCoatShuffleBag,
  createDogBreedShuffleBag,
  getAlliedCatFrameCanvas,
  getDogBreedFrameCanvas,
};
export type { AlliedCatRole, CatCoatBreed, DogLegionBreed };
